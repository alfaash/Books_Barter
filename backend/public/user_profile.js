const token = localStorage.getItem("token"); 

let books = ["book1.png", "book2.png", "book3.png","book4.png"];
const length=books.length;
let i=0;
const book=document.querySelector("#book_image");
book.src=books[i];
function move_left(){
    i=(i-1);
    if(i<0){
        i=length-1;
    }
    book.src=books[i];
}
function move_right(){
    i=(i+1)%length;
    book.src=books[i];
}

document.addEventListener('DOMContentLoaded', async() => {
    try {
        const response = await fetch('http://localhost:5000/api/v1/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        });

        const data = await response.json();
        console.log("DATA: ",data);
        if(data.msg=="Authentication invalid"){
            alert("An error occured, please login again!");
            window.location.href="login.html";
        }
        if(data){
            const name=document.getElementById("user_name");
            const email=document.getElementById("user_email");
            const pfp=document.getElementById("profile_pic");
            pfp.src=data.profilePhoto;
            name.innerText=data.name;
            email.innerText=data.email;
        }
        else{
            alert("An error occured, please login again!");
            window.location.href="login.html";
        }
    } catch (error) {
        console.error('Registration error:', error);
    }
})
