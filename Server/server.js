var http = require('http');
var fs = require('fs');
var path = require('path');
var app = require('./routes.js');
// initialize router
var router = app.Router();

//add routes
// http://localhost:4200/test
router.handle('/test', 'get', (req, res) => {
    return res.end('test something');
});
// format for url parameters
// http://localhost:4200/test/23
router.handle('/test/:testId', 'get', (req, res) => {
    return res.end(`test something ${req.params.testId}`);
});
// format for querystring
// http://localhost:4200/test?q=100&a=1000
router.handle('/test/query', 'get', (req, res) => {

    return res.end(`test something ${JSON.stringify(req.query)}`);
});
router.handle('/', 'get', (req, res) => {
    res.statusCode = 302;
    res.setHeader('Location', '/home/index.html');
    res.end();
});
//setup router and routing to local files
app.Use(router);
// folder name inside server to publish to web
app.Use(app.Local('public'));
//connect router as middleware
const server = http.createServer(app.Serve).listen(4200);
