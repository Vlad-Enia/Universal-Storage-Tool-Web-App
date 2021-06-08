const APP_KEY = "mi6pgkf1iy9maga";

if (window.location.href.indexOf("code") !== -1) {
    console.log("Am tokenu de la Dropbox sunt creier supersonic");
    const token=window.location.href.substring(window.location.href.lastIndexOf("code=")+"code=".length);
    console.log(token);
    fetch('http://localhost:4200').then(response => console.log(response));
} else {
    console.log("Unde-i tokenu nu e tokenu");
}


window.onload = function () {
    document.getElementById("dropbox_connect").onclick = () => {
        console.log("salut");
        window.location.replace(`https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&response_type=code&redirect_uri=http://127.0.0.1:5500/Front/ConfigPages/config_cloud.html`,
            "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=0,width=1920,height=1080");
        // let xhttp = new XMLHttpRequest();
        // xhttp.open("GET", "http://localhost:8082", true);
        // xhttp.send("cuc");
        // let i=0;
        // xhttp.onreadystatechange = function () {
        //     if (this.readyState == 4 && this.status == 200) {
        //         console.log(i++);
        //         console.log(this);
        //     }

        // }
    }
};