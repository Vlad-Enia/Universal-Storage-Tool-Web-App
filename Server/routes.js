const qs = require('querystring');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

const trueHandlers = {};    
const config = {};
function Use(Router) {
    if(Router.type === 'router') {
        for(let method in Router.handlers) {
            trueHandlers[method] = Router.handlers[method];
        }
    }else if(Router.type === 'static') {
        config.static = Router.config();
    }
}

function pathHasParameters(path) {
    let pathWithParamsRegexp = /(\/:.*?)+/gi;
    return pathWithParamsRegexp.test(path);
}

function removeBlanks(arr) {
    return arr.filter((x) => {
        if(Boolean(x) == true)
            return true;
        return false;
    });
}
function checkStaticFile(url) {
    return path.extname(url);
}
function isFileOnDisk(url) {
    var valid = true;
    try {
        fs.accessSync(`${config.static}${url.split('/').join(path.sep)}`, fs.constants.R_OK);
    }catch(ex) {
        console.log(`can't access file from url ${url}`);
        return valid = false;
    }
    return valid;
}

function sendLocalFile(url, res) {
    const filePath = `${config.static}${url.split('/').join(path.sep)}`
    const rs = fs.createReadStream(filePath);
    res.setHeader('Content-Type', mime.getType(url));
    rs.on('data', (chunk) => {
        res.write(chunk);
    });
    rs.on('error', (err) => {
        console.log(err);
        res.statusCode = 404;
        res.end(`Error reading ${url}`);
    });
    rs.on('end', (chunk) => {
        res.statusCode = 200;
        res.end();
    });
}

// reouter types
function Local(folder) {
    let localFolder = folder;
    return {
        config: () => {
            return `${process.cwd()}${path.sep}${localFolder}`;
        },
        type: 'static'
    }
}
// instantiates a router object
function Router() {
    return {
        handle: function(path, method, handler) {
            if(!this.handlers[path])
                this.handlers[path] = {};
            this.handlers[path][method.toLowerCase()] = {
                path: path,
                handler: handler,
                method: method.toLowerCase(),
                type: typeof(path) == 'string' ? 'string' : (util.types.isRegExp(path) == true ? 'regexp': null)
            }
        },
        handlers: {},
        type: 'router'
    }
}

function Serve(req, res) {
    if(checkStaticFile(req.url.split('?')[0])) {
        if(isFileOnDisk(req.url.split('?')[0])) {
            return sendLocalFile(req.url.split('?')[0], res);
        } else {
            res.statusCode = 404;
            return res.end(`${req.url} Could Not Be Found`);
        }
    }
    req.params = {};
    if(req.url.split('?').length > 1 && req.url.split('?')[1])
        req.query = qs.parse(req.url.slice(req.url.indexOf('?') + 1,));
    else req.query = null;

    var pathname = url.parse(req.url).pathname;
    // normal path handlers
    if(trueHandlers[pathname] && trueHandlers[pathname][req.method.toLowerCase()]) {
        if(req.method.toLowerCase() == trueHandlers[pathname][req.method.toLowerCase()].method) {
            return trueHandlers[pathname][req.method.toLowerCase()].handler(req, res);
        }
    }
    // path with parameters
    for(let path in trueHandlers) {
        if(trueHandlers[path][req.method.toLowerCase()])
        {
            if(pathHasParameters(path)) {
                var pathParts = removeBlanks(path.split('/'));
                var urlParts = removeBlanks(pathname.split('/'));
                var partsDifferent = false;

                if(pathParts.length != urlParts.length) {
                    continue;
                }

                for(let part in pathParts) {
                    if(pathParts[part].indexOf(':') == 0) {
                        req.params[pathParts[part].slice(1,)] = urlParts[part];
                        continue;
                    }

                    if(pathParts[part] != urlParts[part]) {
                        partsDifferent = true;
                        break;
                    }
                }
                if(!partsDifferent) {
                    return trueHandlers[path][req.method.toLowerCase()].handler(req, res);
                }

            }
            if(trueHandlers[path].type == 'regexp') {
                if(trueHandlers[path].path.test(pathname.slice(1,)) == true) {
                    return trueHandlers[path].handler(req, res);
                }
            }
        }
    }
    res.statusCode = 404;
    return res.end(`${req.url} Not Found`);
}


module.exports = {
    Router: Router,
    Serve: Serve,
    Use: Use,
    Local: Local
}

