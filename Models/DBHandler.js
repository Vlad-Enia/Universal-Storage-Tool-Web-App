const mysql = require('mysql');
var connection;

/* This can't throw an error because the connection is marked as failed only when we accually make a query */
async function createPoll(){
    return new Promise((resolve,reject)=>{
        connection = mysql.createPool({
          connectionLimit: 5,
          host: 'localhost',
          user: 'root',
          password: 'plokijuh1',
          database: 'unst'
        });
        resolve(connection);
    })
}

function getTableName(object){
    if(object.cloud==='db'){
        return "dropbox_session_tokens";
    }else if(object.cloud==='od'){
        return "onedrive_session_tokens";
    }else {
        return "google_session_tokens";
    }
}

async function getRefreshToken(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('SELECT refresh_token from ?? WHERE user_id=?',[tableName,object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                resolve(resObjs[0].refresh_token);
            }   
        });
    });
}

async function getSessionToken(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('SELECT session_token from ?? WHERE user_id=?',[tableName,object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                resolve(resObjs[0].session_token);
            }   
        });
    });
}

async function addBothTokens(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('SELECT * from ?? WHERE user_id=?',[tableName,object.idUser], function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                if(resObjs.length===0){
                    connection.query('INSERT INTO ?? (user_id,session_token,refresh_token) VALUES (?,?,?)',[tableName,object.idUser,object.sessionToken,object['refresh_token']],function(error,results, fields){
                        if(error){
                            reject(error);
                        }else{
                            resolve("OK");
                        }
                    });
                }else{
                   connection.query('UPDATE ?? SET session_token=?, refresh_token=? WHERE user_id=?',[tableName,object.sessionToken,object['refresh_token'],object.idUser], function(error,results,fields){
                    if(error){
                        reject(error);
                    }else{
                        resolve("OK");
                    }
                   });
                }
            }   
        });
    });
}

async function addSessionToken(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('SELECT * from ?? WHERE user_id=?',[tableName,object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                if(resObjs.length===0){
                    connection.query('INSERT INTO ?? (user_id,session_token,refresh_token) VALUES (?,?)',[tableName,object.idUser,object.sessionToken],function(error,results, fields){
                        if(error){
                            reject(error);
                        }
                    });
                }else{
                   connection.query('UPDATE ?? SET session_token=? WHERE user_id=?',[tableName,object.sessionToken,object.idUser],function(error,results,fields){
                    if(error){
                        reject(error);
                    }
                   });
                }
                resolve("OK");
            }   
        });
    });
}

async function isConnected(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('SELECT * from ?? WHERE user_id=?',[tableName,object.idUser], function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                if(resObjs.length===0){
                    resolve("NO");
                }else{
                    resolve("OK");
                }    
            }   
        });
    });
}

async function deleteBothTokens(object){
    return new Promise((resolve,reject)=>{
        let tableName=getTableName(object);
        connection.query('DELETE FROM ?? WHERE user_id=?',[tableName,object.idUser],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                resolve("OK");
            }
        })
    })
}

async function uploadFile(object){
    return new Promise((resolve,reject)=>{
        console.log("Incercam sa inseram:",object.filename);
        /// TODO: SOLVE SIZE IS 0 
        connection.query('INSERT INTO files (user_id,filename,scope,extension,size) VALUES (?,?,?,?,?)',[object.user_id,object.filename,object.scope,object.extension,object.size],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                resolve("OK");
            }
        })
    });
}

async function getUserFiles(object){
    return new Promise((resolve,reject)=>{
        connection.query('SELECT * FROM files WHERE user_id=? AND scope=?',[object.user_id,object.scope],function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObj=JSON.parse(JSON.stringify(results));;
                resolve(resObj);
            }
        })
    });
}

async function addShard(object){
    return new Promise((resolve,reject)=>{
        connection.query('INSERT INTO file_shards (id,filename,shardname,location) VALUES (?,?,?,?)',[object.idUser,object.filename,object.shardname,object.location],function(error,results,fields){
            if(error) {
                console.log(error);
                reject(error);
            }else{
                console.log("Shard was added to:",object.location);
                resolve("OK");
            }
        })
    });
}

async function getShard(object){
    console.log("Filename:",object.filename);
    console.log("id:",object.id);
    return new Promise((resolve,reject)=>{
        connection.query('SELECT shardname FROM file_shards WHERE id=? AND filename=? AND location=?',[object.id,object.filename,object.location],function(error,results,fields){
            if(error) {
                console.log(error);
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                if(resObjs.length===0){
                    resolve("NO");
                }else{
                    resolve(resObjs[0].shardname);
                }    
            }   
        })
    });
}

async function checkFileExistence(object){
    return new Promise((resolve,reject)=>{
        connection.query('SELECT * from files WHERE user_id=? AND filename=? AND scope=? ',[object.user_id,object.filename,object.scope], function(error,results,fields){
            if(error) {
                reject(error);
            }else{
                let resObjs=JSON.parse(JSON.stringify(results));
                if(resObjs.length===0){
                    resolve("NO");
                }else{
                    resolve("OK");
                }    
            }   
        });
    });
}

module.exports = {
    /* Connection Related */
    createPoll: createPoll,
    /* oAuth tokens related */
    getRefreshToken:getRefreshToken,
    getSessionToken:getSessionToken,
    addBothTokens:addBothTokens,
    addSessionToken:addSessionToken,
    deleteBothTokens:deleteBothTokens,
    isConnected:isConnected,
    /* File Related */
    uploadFile:uploadFile,
    getUserFiles:getUserFiles,
    addShard:addShard,
    getShard:getShard,
    checkFileExistence:checkFileExistence
};
