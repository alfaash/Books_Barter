const token=localStorage.getItem('token');
let curUserId,curUserName;
let activeChatId = null;
const socket=io();

// Get current TIme function
function getCurrentTime() {
  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();

  const ampm = hours >= 12 ? "pm" : "am";

  // Convert 24h → 12h if needed
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  // Add leading 0 to minutes
  const displayMinutes = minutes.toString().padStart(2, "0");

  return `${displayHours}:${displayMinutes}${ampm}`;
}
document.addEventListener("DOMContentLoaded", async function () {
    // loading profile
    try {
        const response = await fetch('https://books-barter.onrender.com/api/v1/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        });
        let data=await response.json();
        curUserId=data._id;
        curUserName=data.name;
    } catch (error) {
        console.error('An error occured yaha pe: ', error);
    }
    
    // Get all chats
    try {
        const chats = await fetch('https://books-barter.onrender.com/api/v1/chat', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        });
        let dataChats=await chats.json();
        //console.log(dataChats);
        const chatDiv=document.getElementById("chats");
        if(dataChats.length==0){
            chatDiv.innerHtml+=`<h1>No Chats</h1>`;
        }
        else{
            let chattingUsers=[];
            for(let i of dataChats){
                let chattingUserId=1;
                let chattingUserName = i.participants[chattingUserId].name;
                if(chattingUserName==curUserName){
                    chattingUserId=0;
                    chattingUserName = i.participants[chattingUserId].name;
                }
                let chattingUserPfp = i.participants[chattingUserId].profilePhoto;
                let lastMessage=`Start the conversation with ${chattingUserName}`;
                if(i.lastMessage!=null && i.lastMessage.message){
                    lastMessage=i.lastMessage.message;
                }
                //checking chatting users name and pfp
                let userName=i.participants[1].name,userPfp=i.participants[1].profilePhoto;
                if(i.participants[0]._id!=curUserId){
                    userName=i.participants[0].name;
                    userPfp=i.participants[0].profilePhoto;
                }
                if(chattingUsers.includes(userName)==false){
                    chattingUsers.push(userName);
                    chatDiv.innerHTML+=`<div class="card my-3 p-lg-3 p-md-3 p-sm-3 p-0 col-12 d-flex align-items-center justify-content-start flex-lg-row flex-md-row flex-sm-row flex-row">
                            <img src="${chattingUserPfp}" alt="User Image" class="img-fluid mx-lg-3 mx-md-3 mx-sm-3 col-lg-1 col-md-1 col-1" style="max-width: 100px; max-width: 100px; height: auto; width:auto; object-fit: cover; border-radius:50%;">
                            <div id="nameMessageDiv" class="m-0 px-0 d-flex flex-column align-items-start justify-content-start col-lg-9 col-md-8 col-sm-8 col-8">
                                <h5 class="" style="font-weight: 900;">${chattingUserName}</h5>
                                <p class="text-secondary">${lastMessage}</p>
                            </div>
                            <i class="fa-solid fa-chevron-right col-lg-2 col-md-2 col-sm-2 col-xs-2 p-0" id="openChatIcon" onClick="openChat('${i._id}','${userPfp}','${userName}')"></i>
                            <div class="notification-badge" id="notif-${i._id}"></div>
                        </div>`;
                }

                if (i.unreadCount > 0) {
                    document.getElementById(`notif-${i._id}`).classList.add("active");
                }
            }
        }
    } catch (error) {
        console.error('An error occured yaha pe: ', error);
    }
});

// Opening a chat
async function openChat(chatId,userPfp,userName){
    activeChatId=chatId;
    // Marking messages as read when chat is opened
    try{
        const chats = await fetch(`https://books-barter.onrender.com/api/v1/chat/${chatId}/read`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        });
        let data=await chats.json();
    }
    catch(error){
        console.error('An error occured yaha pe: ', error);
    }

    // Fetching all the messages 
    let dataChats;
    try{
        const chats = await fetch(`https://books-barter.onrender.com/api/v1/chat/${chatId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        });
        dataChats=await chats.json();
        // console.log("User Chats: ",dataChats);
    }
    catch(error){
        console.error('An error occured yaha pe: ', error);
    }
    // Putting the chats in the HTML page
    const chatArea=document.getElementById("chatArea");
    const overlay=document.getElementById("overlay");
    const chatMessages=document.querySelector(".chatMessages");
    const chatAreaPfp=document.getElementById("chatAreaPfp");
    const chatAreaName=document.getElementById("chatAreaName");
    chatAreaPfp.src=userPfp;
    chatAreaName.innerText=userName;
    //displaying msg on screen
    for(let i of dataChats){
        //changing time from utc to ist
        let utcTime=i.timestamp;
        let istTime = new Date(utcTime).toLocaleString("en-IN", {timeZone: "Asia/Kolkata"});
        istTime=istTime.slice(12,23);
        let finalTime="";
        for(let i=0;i<istTime.length;i++){
            if(!(i==4||i==5||i==6||i==7)) finalTime+=istTime[i];
        }
        // checking who sent the message,alignment of the msg on screen, sender name
        let msgSentBy="leftChat";
        let alignment="align-items-start"
        let senderName=(curUserId==i.sender._id)?"You":i.sender.name;
        if(i.sender._id==curUserId){
            alignment="align-items-end";
            msgSentBy="rightChat";
        } 

        chatMessages.innerHTML+=`
            <div class='${msgSentBy} d-flex flex-column ${alignment} justify-content-start'>
                <div class="message p-2 mt-2 ml-2 mr-2">${i.message}</div>
                <p class="name ml-3 mt-0">${senderName} &middot; ${finalTime}</p>
            </div>
        `;
    }
    chatArea.style.display="flex";
    overlay.classList+="active";
}
async function closeOverlay(){
    try{
        const chats = await fetch(`https://books-barter.onrender.com/api/v1/chat/${chatId}/read`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        });
        let data=await chats.json();
    }
    catch(error){
        console.error('An error occured yaha pe: ', error);
    }
    const chatMessages=document.querySelector(".chatMessages");
    chatMessages.innerHTML="";
    const chatArea=document.getElementById("chatArea");
    const overlay=document.getElementById("overlay");
    chatArea.style.display="none";
    overlay.classList="";  
}

//if any 'message' event from backend then this event runs
socket.on('message',async message=>{
    // Marking messages as read when chat is opened
    try{
        const chats = await fetch(`https://books-barter.onrender.com/api/v1/chat/${chatId}/read`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        });
        let data=await chats.json();
    }
    catch(error){
        console.error('An error occured yaha pe: ', error);
    }
    if(message.curUserName!=curUserName){
        const chatMessages=document.querySelector(".chatMessages");
        chatMessages.innerHTML+=`
            <div class='leftChat d-flex flex-column align-items-start justify-content-start'>
                <div class="message p-2 mt-2 ml-2 mr-2">${message.userMessage}</div>
                <p class="name ml-3 mt-0">${message.curUserName} &middot; ${getCurrentTime()}</p>
            </div>
        `; 
        chatMessages.scrollTop=chatMessages.scrollHeight;     
    }
})

// sending a message
const messageSendButton=document.getElementById("messageSendButton");
messageSendButton.addEventListener("click",async e=>{
    const chatMessages=document.querySelector(".chatMessages");
    const userMessage=document.getElementById("userMessage").value.trim();
    if(userMessage!=''){
        socket.emit('userMessage',{userMessage,curUserName});
        chatMessages.innerHTML+=`
            <div class='rightChat d-flex flex-column align-items-end justify-content-start'>
                <div class="message p-2 mt-2 ml-2 mr-2">${userMessage}</div>
                <p class="name ml-3 mt-0">You &middot; ${getCurrentTime()}</p>
            </div>
        `;      
        document.getElementById("userMessage").value='';  
        chatMessages.scrollTop=chatMessages.scrollHeight;
    }
    // sending a message
    try {
        const response = await fetch(`https://books-barter.onrender.com/api/v1/chat/${activeChatId}/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                message: userMessage
            })
        });

        const data = await response.json();
        console.log("Saved message:", data);

    } catch (error) {
        console.error("An error occured yaha pe: ", error);
    }
    // marking messages as read while sending them
    try{
        const chats = await fetch(`https://books-barter.onrender.com/api/v1/chat/${chatId}/read`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        });
        let data=await chats.json();
    }
    catch(error){
        console.error('An error occured yaha pe: ', error);
    }
})