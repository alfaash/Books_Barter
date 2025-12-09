document.addEventListener("DOMContentLoaded", async function () {
    // loading profile
    try {
        const token=localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/v1/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
        });

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
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Invalid token", e);
        return null;
    }
}
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const browseLink = document.getElementById("browseLink");
const preview = document.getElementById("preview");
const uploadBtn = document.getElementById("upload_button");

// store the selected file globally
let selectedFile = null;

// drag & drop logic
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  const files = e.dataTransfer.files;
  handleFiles(files);
});

browseLink.addEventListener("click", (e) => {
  e.preventDefault();
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  handleFiles(fileInput.files);
});

function handleFiles(files) {
  preview.innerHTML = ""; // clear previous previews
  const file = files[0]; // only first image
  if (file && file.type.startsWith("image/")) {
    selectedFile = file; // save file globally
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  } else {
    alert("Please upload an image file.");
  }
}

// Submit logic
uploadBtn.addEventListener("click", async () => {
  const title = document.getElementById("name_input").value.trim();
  const author = document.getElementById("author_input").value.trim();
  const genreSelect = document.querySelectorAll("select")[0];
  const conditionSelect = document.querySelectorAll("select")[1];
  const genre = genreSelect.options[genreSelect.selectedIndex].text;
  const condition = conditionSelect.options[conditionSelect.selectedIndex].text;

  if (!selectedFile) {
    alert("Please select a book cover image.");
    return;
  }

  if (!title || !author || genre === "Genre" || condition === "Condition") {
    alert("Please fill out all required fields.");
    return;
  }
    const token = localStorage.getItem("token"); // your JWT from login
    console.log("token:",token);
    const payload = parseJwt(token);
    console.log("Payload:",payload);
    if (!payload) {
        alert("User not authenticated");
        return;
    }
    const ownerID = payload.userId;

  const formData = new FormData();
  console.log("PHOTO: ",selectedFile);
  formData.append("photo", selectedFile);
  formData.append("title", title);
  formData.append("author", author);
  formData.append("genre", genre);
  formData.append("condition", condition);

  console.log("Form data: ",[...formData]);
  try {
    const res = await fetch("http://localhost:5000/api/v1/books", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔥 assumes you store JWT in localStorage
      },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert("Book uploaded successfully!");
      console.log("Created book:", data);
    } else {
      alert(`Error: ${data.msg || "Upload failed"}`);
    }
  } catch (err) {
    console.error("Error uploading book:", err);
    alert("Something went wrong!");
  }
});
