const queryString = require('querystring');
var https = require('https');
var database=require('../Models/DBHandler');

const clientId='564941956565-tfkfdegc2folbb34pp1g76votgd0ppek.apps.googleusercontent.com';
const clientSecret='_xFivHE_lDah-8H6eOlup__w';

async function createSessionToken(object){
    let options={
        method: 'POST', 
        hostname:"oauth2.googleapis.com",
        path:"/token",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };
    let body=queryString.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: decodeURIComponent(object.token),   // <- Without the decoding the URL is marked as malformed
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:4200/config/config_cloud.html'
    });
    let data="";
    let access_token="";
    let refresh_token="";
    return new Promise((resolve,reject)=>{
        request=https.request(
            options,
             function(resp) {
                resp.on('data', d => data += d);
                resp.on('end',async () => {
                        let result=JSON.parse(data);
                        refresh_token+=result.refresh_token;
                        access_token+=result.access_token;
                        if(this.res.statusCode!==200){                           
                            reject(result);
                        }else{
                            try{
                                let status=await database.addBothTokens({cloud:object.cloud,idUser:object.idUser,sessionToken:access_token,refresh_token:refresh_token});
                                resolve(status);
                            }catch(error){
                                reject(error);
                            }     
                        }
                    });
                resp.on('error',()=>{
                    reject("Something is not right");
                })
          });
           request.write(body);
           request.end();
    }); 
}

async function refreshSesssionToken(object){
    console.log("I am refreshing the token");
    let options={
        method: 'POST',
        hostname:"oauth2.googleapis.com",
        path:"/token",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };
    let body=queryString.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: await database.getRefreshToken(object)
    });
    let data="";
    let access_token="";
    return new Promise((resolve,reject)=>{
        request=https.request(
            options,
             function(resp) {
                resp.on('data', d => data += d);
                resp.on('end',async () => {
                        let result=JSON.parse(data);
                        access_token+=result.access_token;
                        console.log("New access token:",access_token);
                        if(this.res.statusCode!==200){                           
                            reject(result);
                        }else{
                            try{
                                await database.addSessionToken({cloud:object.cloud,idUser:object.idUser,sessionToken:access_token});
                                resolve(access_token);
                            }catch(error){
                                reject(error);
                            }     
                        }
                    });
                resp.on('error',()=>{
                    reject("Something is not right");
                })
          });
           request.write(body);
           request.end();
    }); 
}

async function revokeSessionToken(object){
    let body=queryString.stringify({
        token:await database.getSessionToken(object)
    });
    let options={
        method: 'POST', 
        hostname:"oauth2.googleapis.com",
        path:"/revoke?"+body,
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };
    let data="";
    return new Promise((resolve,reject)=>{
        request=https.request(
            options,
             function(resp) {
                resp.on('data', d => data += d);
                resp.on('end',async () => {
                        console.log("Am revocat tokenul cu mesajul:",data);
                        if(this.res.statusCode!==200){                           
                            reject(data);
                        }else{
                           resolve("OK");
                        }
                    });
                resp.on('error',()=>{
                    reject("Something is not right");
                })
          });
           request.end();
    }); 
}

module.exports = {
    createSessionToken: createSessionToken,
    refreshSesssionToken:refreshSesssionToken,
    revokeSessionToken:revokeSessionToken
}