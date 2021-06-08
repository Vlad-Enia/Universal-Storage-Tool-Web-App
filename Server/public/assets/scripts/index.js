const DROPBOX_APP_KEY = "mi6pgkf1iy9maga";
const GOOGLE_APP_KEY = "564941956565-tfkfdegc2folbb34pp1g76votgd0ppek.apps.googleusercontent.com";
const ONEDRIVE_APP_KEY = "f796a5b8-6338-4394-86bd-1745e7a3942f";

const currentURL = window.location.href;

window.onload = async function () {
    if (currentURL.indexOf("code") !== -1) { /// Here we handle the oAuth login steps
        let token = currentURL.substring(currentURL.lastIndexOf("code=") + "code=".length);
        let token_type = "";
        if (currentURL.indexOf("google") !== -1) {
            token = token.substring(0, token.lastIndexOf("&scope"));
            token_type = "gd";
        } else if (currentURL.indexOf("M.R3") !== -1) {   ///TODO Check token start because we can't distinguish OD from DB. Look for a better method
            token_type = "od";
        } else {
            token_type = "db";
        }
        /* Create the sessionToken based on the accessToken provided by the oAuth services*/
        let response=await fetch('http://localhost:4200/config/config_cloud', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'storage-code': token,
                'token-type': token_type
            }
        })
        await response.text();
        window.location.replace('http://localhost:4200/config/config_cloud.html');
    } else {
        /* Generate the connection buttons based on the JSON from the server */
        fetch('http://localhost:4200/config/config_cloud', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(response => response.json()).then(data => {
            generateButtons(data);
        });
    }
    if(currentURL.indexOf("?lc")!==-1){   //// Onedrive revoking is made from the frontEnd and returns this lc param that we don't need
        window.location.replace('http://localhost:4200/config/config_cloud.html');
    }
};

function generateButton(object){
     let div=undefined;
     let button = document.createElement("button");
     let idtype="";
     let token_type="";

     let connectURLs={
         google_drive:`https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_APP_KEY}&redirect_uri=${currentURL}&scope=https://www.googleapis.com/auth/drive&response_type=code&access_type=offline`,
         dropbox:`https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&response_type=code&redirect_uri=${currentURL}&token_access_type=offline`,
         one_drive:`https://login.live.com/oauth20_authorize.srf?client_id=${ONEDRIVE_APP_KEY}&scope=files.readwrite.all offline_access&response_type=code&redirect_uri=${currentURL}`
     };

     button.type='button';
     if(object.type==='google'){
        div = document.getElementById("GoogleDrive_div");
        idtype="google_drive";
        token_type="gd";
     }else if(object.type==='dropbox'){
        div=document.getElementById("Dropbox_div");
        idtype="dropbox";
        token_type="db";
     }else{
        div=document.getElementById("OneDrive_div");
        idtype="one_drive";
        token_type="od";
     }
     
     if(object.status==='Connected'){
         button.innerHTML='Disconnect';
         button.classList.add('disconnectbtn');
         button.id=idtype+'_disconnect';
         button.onclick=async()=>{
             /* Delete the oAuth tokens from the database AND notify the services to invalidate them */
             let response=await fetch('http://localhost:4200/config/config_cloud', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'token-type': token_type
                }
            });
            let sessionToken=await response.text();
            console.log("Session token:",sessionToken);
            if(token_type==='od'){ /* OneDrive can't be invalidated from the backend it needs user permission. However an error can't be thrown so it is ok to delete it from the database first and then send the request to OneDrive */
                window.location.replace(`https://login.live.com/oauth20_logout.srf?client_id=${ONEDRIVE_APP_KEY}&redirect_uri=${currentURL}`);
            }else{
                window.location.replace('http://localhost:4200/config/config_cloud.html');
            }
            
         }
     }else{
        button.innerHTML='Connect';
        button.classList.add('connectbtn');
        button.id=idtype+'_connect';
        button.onclick=()=>{
            window.location.replace(connectURLs[`${idtype}`]);
        }
     }
     div.appendChild(button);
}

function generateButtons(data) {
    generateButton({type:'google',status:data.google});
    generateButton({type:'dropbox',status:data.dropbox});
    generateButton({type:'onedrive',status:data.onedrive});
}