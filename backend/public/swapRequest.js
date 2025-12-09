const token=localStorage.getItem('token');
document.addEventListener("DOMContentLoaded", async function () {
    // loading profile
    try {
        const token=localStorage.getItem('token');
        const response = await fetch('https://books-barter.onrender.com/api/v1/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        });

        const requests = await fetch('https://books-barter.onrender.com/api/v1/swap/incoming',{
            method: 'GET',
            headers :{
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        const requestData = await requests.json();
        if(requestData){
            let body = document.getElementById("requestCardSection");
            if(requestData.length == 0){
                body.innerHTML+=`<h1 class="col-12 text-center">You have no requests...</h1>`;
            }
            else{
                for(let i of requestData){
                    const bookData = await fetch(`https://books-barter.onrender.com/api/v1/books/${i.bookId._id}`,{
                        method: 'GET',
                        headers :{
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    const bookImageData= await bookData.json();
                    const userPhotoData = await fetch(`https://books-barter.onrender.com/api/v1/users/${i.requester._id}`,{
                        method: 'GET',
                        headers :{
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    const userPfp=await userPhotoData.json();
                    body.innerHTML+=`                <div class="card col-lg-12 my-4">
                    <div class="row d-flex flex-row p-3 justify-content-center justify-content-lg-start justify-content-md-start">
                        <img src="https://books-barter.onrender.com${bookImageData.photo}" alt="" height="230" class="col-lg-2 col-md-3 col-sm-4 col-xs-4 col-6">
                        <div class="detail d-flex flex-column mx-5 align-items-start justify-content-center col-lg-4 col-md-4">
                            <h4 id="bookTitle" class="mb-0">${i.bookId.title}</h4>
                            <p class="text-secondary mb-4">by ${i.bookId.author}</p>
                            <div class="requesterDetail d-flex flex-row align-items-center justify-content-start">
                                <img src="${userPfp.profilePhoto}" alt="" height="50" width="50" class="rounded-circle mr-3">
                                <div class="swapText d-flex flex-column">
                                    <h6 class="m-0">${i.requester.name}</h6>
                                    <p class="text-secondary m-0">wants to swap with you</p>
                                </div>
                            </div>
                        </div>
                        <div class="actionButtons d-flex align-items-center justify-content-center my-4 col-lg-4 col-md-12">
                            <button id="acceptBtn" onclick="acceptSwap('${i._id}')" class="mx-4 px-4"><i class="fa-solid fa-check mr-lg-2"></i> Accept</button>
                            <button id="rejectBtn" onclick="rejectSwap('${i._id}')" class="mx-4 px-4"><i class="fa-solid fa-xmark mr-lg-2"></i> Reject</button>
                        </div>
                    </div>
                </div>`;
                }
            }
        }
        else{
            alert("An error occured, please login again!");
            window.location.href="login.html";        
        }

        const data = await response.json();
        if(data){
            const pfp=document.getElementById("profile_pic");
            if(data.profilePhoto!=null){
                pfp.src=data.profilePhoto;
            }
        }
        else{
            alert("An error occured, please login again!");
            window.location.href="login.html";
        }
    } catch (error) {
        console.error('An error occured yaha pe: ', error);
    }
});

async function acceptSwap(requestID){

    try {
        const requests = await fetch(`https://books-barter.onrender.com/api/v1/swap/${requestID}/respond`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                action: "accept",
            }),
        });
        const data = await requests.json();
        
    } catch (error) {
        console.log("An error occured while accepting this request: ",error);
    }
    location.reload();
}

async function rejectSwap(requestID){
    console.log(requestID);
    try {
        const requests = await fetch(`https://books-barter.onrender.com/api/v1/swap/${requestID}/respond`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                action: "reject",
            }),
        });
        const data = await requests.json();
    } catch (error) {
        console.log("An error occured while rejecting this request: ",error);
    }
    location.reload();
}