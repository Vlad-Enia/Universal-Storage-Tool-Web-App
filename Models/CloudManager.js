let dropbox=require('./DropboxManager');
let google=require('./GoogleDriveManager');
let onedrive=require('./OneDriveManager');
var database=require('../Models/DBHandler');

async function setCloud(request){
    if(request.cloud=='db'){
        /// Dropbox
        // console.log("Token in CM:",await dropbox.createSessionToken(request));
        // console.log("token in CM refreshed:",await dropbox.refreshSesssionToken(request));   //<--- Uncomment these to check the create/refresh oAuth flow. 
         await dropbox.createSessionToken(request);
         return await database.getSessionToken(request);
    }else if(request.cloud=='gd'){
        // Google Drive
        // console.log("Token in CM:",await google.createSessionToken(request));
        // console.log("token in CM refreshed:",await google.refreshSesssionToken(request)); //<--- Uncomment these to check the create/refresh oAuth flow. 
         await google.createSessionToken(request);
         return await database.getSessionToken(request);

    }else{
        // OneDrive
        // console.log("Token in CM:",await onedrive.createSessionToken(request));
        // console.log("token in CM refreshed:",await onedrive.refreshSesssionToken(request)); //<--- Uncomment these to check the create/refresh oAuth flow. 
         await onedrive.createSessionToken(request);
         return await database.getSessionToken(request);
    }
}

async function deleteCloud(request){
    return await database.deleteBothTokens(request);
}

async function getClouds(idUser){
    let dropbox=await database.isConnected({idUser:idUser,cloud:'db'});
    let google=await database.isConnected({idUser:idUser,cloud:'gd'});
    let onedrive=await database.isConnected({idUser:idUser,cloud:'od'});
    let response={};
    if(dropbox==="OK"){
        response.dropbox="Connected";
    }else{
        response.dropbox="Disconnected";
    }

    if(google==="OK"){
        response.google="Connected";
    }else{
        response.google="Disconnected";
    }

    if(onedrive==="OK"){
        response.onedrive="Connected";
    }else{
        response.onedrive="Disconnected";
    }
    return response;
}

module.exports = {
    setCloud: setCloud,
    getClouds:getClouds,
    deleteCloud:deleteCloud
}