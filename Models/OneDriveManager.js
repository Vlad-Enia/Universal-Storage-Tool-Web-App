const queryString = require('querystring');
var https = require('https');
var database=require('../Models/DBHandler');

const clientId='f796a5b8-6338-4394-86bd-1745e7a3942f';
const clientSecret='zhRU7nkD8_mA~8tH.Ub9JU.2GlPekx~PgK';

async function createSessionToken(object){
    let body=queryString.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: object.token,   // <- Without the decoding the URL is marked as malformed
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:4200/config/config_cloud.html'
    });
    let options={
        method: 'POST', 
        hostname:"login.live.com",
        path:"/oauth20_token.srf",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
            'Content-Length': Buffer.byteLength(body) /// <-- Bill Geits e prea smecher si nu accepta chunked fara content-length
        }
    };
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
    console.log("I am refreshing the token");
    let body=queryString.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: await database.getRefreshToken(object)
    });
    let options={
        method: 'POST',
        hostname:"login.live.com",
        path:"/oauth20_token.srf",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
            'Content-Length': Buffer.byteLength(body) 
        }
    };
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
                                let addTokenResult=await database.addSessionToken({cloud:object.cloud,idUser:object.idUser,sessionToken:access_token});
                                resolve(await access_token);
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

module.exports = {
    createSessionToken: createSessionToken,
    refreshSesssionToken:refreshSesssionToken
}