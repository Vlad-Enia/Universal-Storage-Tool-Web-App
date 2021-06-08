const queryString = require('querystring');
var https = require('https');
var database=require('../Models/DBHandler');

async function createSessionToken(object){
    let options={
        method: 'POST',
        hostname:"api.dropboxapi.com",
        path:"/oauth2/token",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
            'Authorization': 'Basic bWk2cGdrZjFpeTltYWdhOmRqd2M1bG15dzZ5aHFmNQ=='
        }
    };
    let body=queryString.stringify({
        code: object.token,
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
                                await database.addBothTokens({cloud:object.cloud,idUser:object.idUser,sessionToken:access_token,refresh_token:refresh_token});
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

async function refreshSesssionToken(object){
    let options={
        method: 'POST',
        hostname:"api.dropboxapi.com",
        path:"/oauth2/token",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
            'Authorization': 'Basic bWk2cGdrZjFpeTltYWdhOmRqd2M1bG15dzZ5aHFmNQ=='
        }
    };
    let body=queryString.stringify({
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
    let options={
        method: 'POST',
        hostname:"api.dropboxapi.com",
        path:"/oauth2/token/revoke",
        headers:{
            'Authorization': `Bearer `+ await database.getRefreshToken(object)
        }
    };
    let data="";
    return new Promise((resolve,reject)=>{
        request=https.request(
            options,
             function(resp) {
                resp.on('data', d => data += d);
                resp.on('end',async () => {
                        resolve("OK");
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