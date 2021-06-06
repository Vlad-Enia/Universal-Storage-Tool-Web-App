var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var app = require('./routes.js');
var cm=require('../Models/CloudManager')
var database=require('../Models/DBHandler')
var fileHandler=require('../Models/FileManager')
// initialize router
var router = app.Router();

//add routes
// http://localhost:4200/test
router.handle('/test', 'get', (req, res) => {
    return res.end('test something');
});
router.handle('/test', 'POST', (req, res) => {
    var postData = '';
    req.on('data', (chunk) => {
        postData += chunk;
    });
    req.on('data', () => {
        var JSONdata = JSON.parse(postData);
        console.log(JSONdata);
        return res.end('test something' + JSON.stringify(JSONdata));
    });
});
router.handle('/test', 'get', (req, res) => {
    return res.end('test something');
});
router.handle('/test', 'POST', (req, res) => {
    var postData = '';
    req.on('data', (chunk) => {
        postData += chunk;
    });
    req.on('data', () => {
        var JSONdata = JSON.parse(postData);
        console.log(JSONdata);
        return res.end('test something' + JSON.stringify(JSONdata));
    });
});
// format for url parameters
// http://localhost:4200/test/23
router.handle('/test/:testId', 'get', (req, res) => {
    return res.end(`test something ${req.params.testId}`);
});
router.handle('/test/:testId', 'post', (req, res) => {
    var postData = '';
    req.on('data', (chunk) => {
        postData += chunk;
    });
    req.on('data', () => {
        var JSONdata = JSON.parse(postData);
        console.log(JSONdata);
        return res.end(req.params.testId + 'test something' + JSON.stringify(JSONdata));
    });
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

router.handle('/config/config_cloud', 'GET', async (req, res) => {
    console.log("salut ai cerut setarile user-ului");
    try{
        let connectedDrives=await cm.getClouds(1);/// TODO: Replace 1 with actual user ID or change it to send the jwt
        console.log("Am trimis la client:",connectedDrives);
        return res.end(JSON.stringify(connectedDrives)); 
    }catch (error){
     return res.end(JSON.stringify(error));     
     }
 });

 /// TODO: ROUTERUL NU ACCEPTA GET/POST/DELETE PENTRU ACELASI LINK!!!!!!!!!!!!!!!!
router.handle('/config/config_cloud', 'POST', async (req, res) => {
    let token=req.headers['storage-code'];
    let token_type=req.headers['token-type'];
    console.log("Access token:",token,"for the drive:",token_type);
    let object={cloud: token_type,token:token,idUser:1};/// TODO: Replace 1 with actual user ID or change it to send the jwt
    try{
        let sessionToken=await cm.setCloud(object);
        console.log( "Session token for",token_type,":",sessionToken);
        res.end(sessionToken);
        console.log("Am returnat la client:",sessionToken);
        return;
        // return res.end( await cm.setCloud(object));
    }catch (error){
        return res.end(JSON.stringify(error));     
    }
});

 /// TODO: ROUTERUL NU ACCEPTA GET/POST/DELETE PENTRU ACELASI LINK!!!!!!!!!!!!!!!!
router.handle('/config/config_cloud', 'DELETE', async (req, res) => {
    console.log("SALUT DIN DELETE");
    let token_type=req.headers['token-type'];
    console.log("Token should be deleted for the drive:",token_type);
    let object={cloud: token_type,idUser:1};/// TODO: Replace 1 with actual user ID or change it to send the jwt
    try{
        let dboperation=await cm.deleteCloud(object);
        return res.end(dboperation);
    }catch (error){
        return res.end(JSON.stringify(error));     
    }
});


router.handle('/home/index', 'get', async (req, res) => { 
    try{
        let aux=await database.createPoll();
        console.log("Connection pool created!");
    }
    catch (error){
        console.log("Hmmmm... ",error)
    }
   // console.log("in router:",aux);
    return res.end('salut');
});

router.handle('/home/index/upload', 'POST', async (req, res) => { 
    try{
        console.log("Am primit request de POST al unui fisier...");
        await fileHandler.uploadFile(req);
        let result=await fileHandler.getUserFiles(req);
        res.statusCode=200;
        res.end(JSON.stringify(result));
    }
    catch (error){
        console.log("Hmmmm... ",error);
        res.statusCode=400;
        return res.end('fail');
    }
});


router.handle('/home/index/all', 'GET', async (req, res) => { 
    try{
        console.log("Am primit request de GET al tuturor fisierelor..");
        let result=await fileHandler.getUserFiles(req);
        res.statusCode=200;
        res.end(JSON.stringify(result));
    }
    catch (error){
        console.log("Hmmmm... ",error);
        res.statusCode=400;
        return res.end('fail');
    }
});

//setup router and routing to local files
app.Use(router);
// folder name inside server to publish to web
app.Use(app.Local('public'));
//connect router as middleware
const server = http.createServer(app.Serve).listen(4200);
