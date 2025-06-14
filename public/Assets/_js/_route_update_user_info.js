const userid = sessionStorage.getItem("userid");


if (document.getElementById("emailForm")) {
    document.getElementById('emailForm').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        document.getElementById("submit--btn").innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Loading..
        `;
        const email = document.getElementById("email").value;
        const response = await fetch(`${API_BASE_URL}/update_user?userid=${userid}&email=${email}`);
        const result = await response.json();
    
        if(!response.ok){
            console.log(result.message);
            const alertBox = document.getElementById("_alert");
            alertBox.innerHTML = `
                <div class="alert alertDanger alert-dismissible fade show">
                    <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                    <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
                </div>
            `;
        }else{
            console.log(result.message);
            const alertBox = document.getElementById("_alert");
            alertBox.innerHTML = `
                <div class="alert alertSuccess alert-dismissible fade show">
                    <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                    <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
                </div>
            `;
            document.getElementById("submit--btn").innerHTML = `
                Edit
            `;
        }
        
    });
}

if (document.getElementById('phoneForm')) {
    document.getElementById('phoneForm').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        document.getElementById("submit--btn").innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Loading..
        `;
        const phoneNumber = document.getElementById("phoneNumber").value;
        const response = await fetch(`${API_BASE_URL}/update_user?userid=${userid}&phoneNumber=${phoneNumber}`);
        const result = await response.json();
    
        if(!response.ok){
            console.log(result.message);
            const alertBox = document.getElementById("_alert");
            alertBox.innerHTML = `
                <div class="alert alertDanger alert-dismissible fade show">
                    <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                    <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
                </div>
            `;
        }else{
            console.log(result.message);
            const alertBox = document.getElementById("_alert");
            alertBox.innerHTML = `
                <div class="alert alertSuccess alert-dismissible fade show">
                    <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                    <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
                </div>
            `;
            document.getElementById("submit--btn").innerHTML = `
                Edit
            `;
        }
        
    });
}

if (document.getElementById("usernameForm")) {
    document.getElementById('usernameForm').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        document.getElementById("submit--btn").innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Loading..
        `;
        const username = document.getElementById("username").value;
        const response = await fetch(`${API_BASE_URL}/update_user?userid=${userid}&username=${username}`);
        const result = await response.json();
    
        if(!response.ok){
            console.log(result.message);
            const alertBox = document.getElementById("_alert");
            alertBox.innerHTML = `
                <div class="alert alertDanger alert-dismissible fade show">
                    <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                    <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
                </div>
            `;
        }else{
            console.log(result.message);
            const alertBox = document.getElementById("_alert");
            alertBox.innerHTML = `
                <div class="alert alertSuccess alert-dismissible fade show">
                    <strong><i class="fi fi-rr-info mr-1"></i></strong> ${result.message}
                    <!-- <button type="button" class="close" data-dismiss="alert">&times;</button> -->
                </div>
            `;
            document.getElementById("submit--btn").innerHTML = `
                Edit
            `;
        }
        
    });   
}