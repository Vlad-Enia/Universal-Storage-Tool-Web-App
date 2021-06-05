
async function registerRequest(){
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("psswd").value;
    const passwordConfirm = document.getElementById("psswd-confirm").value;
    var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;     //email address regex filter
    var usernameFilter = /^[a-zA-Z0-9]+([a-zA-Z0-9_]*[a-zA-Z0-9]+)*$/;                       //username regex filter

    if (email == "" || email == null)
        alert("Email address is empty!");
    else if(username == "" || username == null)
        alert("Username is empty!");
    else if (password == "" || password == null)
        alert("Password address is empty!");
    else if (passwordConfirm == "" || passwordConfirm == null)
        alert("Please confirm your password!");
    else if (!emailFilter.test(email))
        alert("Invalid email address!");
    else if (!usernameFilter.test(username))
        alert("Invalid username. A valid username may contain: \n - lower-case or upper-case letters, \n - digits, \n - \'\_\' but not at the beginning or at the end of the username.")
    else if(password.length < 5)
        alert("Password is too short!");
    else if(password != passwordConfirm)
        alert("The confirmed password is different than the given password!");
    else{
        const response = await fetch('http://localhost:4200/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                username,
                password
            })
        }).then(response=>response.text()).then(data=>{
            // if(data.includes("already taken")){
            //     alert(data);
            //     // if(data.includes("Username")){
            //     //     document.getElementById("username").style.borderColor = "#880E4F";
            //     //     document.getElementById("username").onclick.style.borderColor = "white";
            //     // }
            //     // else if(data.includes("Email")){
            //     //     document.getElementById("email").style.borderColor = "#880E4F";
            //     //     document.getElementById("email").onclick.style.borderColor = "white";
            //     // }

            // }
            alert(data);

        });
            


    }
    
}