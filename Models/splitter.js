const fs = require('fs');
const util = require('util');
var Promise = require('bluebird');
async function splitFile(file, parts) {
    if(parts < 1) {
        console.log('parts is invalid');
        return null;
    }
    result = await util.promisify(fs.stat)(file).then((stat) => {
        console.log(stat);
        if(!stat.isFile || !stat.size) {
            return null;
        }
        fileSize = stat.size;
        var splitSize = Math.floor(fileSize / parts);

        var lastFileSize = splitSize + fileSize % parts;

        var partObjects = [];
        for(var i = 0; i < parts; i++) {
            partObjects[i] = {
                nr: i + 1,
                start: i * splitSize,
                end: (i * splitSize) + splitSize
            };
            if(i == (parts - 1)) {
                partObjects[i].end = (i * splitSize) + lastFileSize;
            }
        }
        console.log('part objects:');
        console.log(partObjects);
        return partObjects;

    }).then((objects) => {
        return objects;
    });
    var res = await actuallySplitFiles(file, result);
    console.log(res);
    return res;
            

    
}
const promiseSerial = funcs =>
  funcs.reduce(
    (promise, func) =>
      promise.then(result => func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([])
  )

async function actuallySplitFiles(file, partObjects) {
    return new Promise((resolve, reject) => {
        var resultFiles = [];
        const funcs = partObjects.map(partObj => () => createChunk(file, partObj));
        promiseSerial(funcs).then(data => resolve(data));
    });
}
async function createChunk(file, partObj) {
    return new Promise((resolve, reject) => {
        var reader = fs.createReadStream(file, {
            encoding: null,
            start: partObj.start,
            end: partObj.end - 1
        });
        var partName = file + '.sf-part' + partObj.nr;
        var writer = fs.createWriteStream(partName);
        var pipe = reader.pipe(writer);
        pipe.on('error', reject);
        pipe.on('finish', resolve(partName));
    });
}

async function mergeFiles(input, output) {
    // Validate parameters.
    if (input.length <= 0) {
        return Promise.reject(new Error("Make sure you input an array with files as first parameter!"));
    }

    var writer = fs.createWriteStream(output, { encoding: null });
    return Promise.mapSeries(input, function (file) {
        return new Promise(function (resolve, reject) {
            var reader = fs.createReadStream(file, { encoding: null });
            reader.pipe( writer, { end: false });
            reader.on('error', reject);
            reader.on('end', resolve);
        });
    }).then(function() {
        writer.close();
        return Promise.resolve(output);
    });
};

async function writeChunk(writeStream, fileName) {
    var reader = fs.createReadStream(fileName, {encoding: null});
    return new Promise((resolve, reject) => {
        /*
        reader.pipe(writeStream, {end: false});
        reader.on('error', reject);
        reader.on('end', resolve(fileName));
        */
        resolve(fileName);
    });
}

module.exports = {
    splitFile: splitFile,
    mergeFiles: mergeFiles
}
