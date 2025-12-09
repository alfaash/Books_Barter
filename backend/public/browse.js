document.addEventListener('DOMContentLoaded', async() => {
    AOS.init();
    const token = localStorage.getItem("token"); 
    try {
        const response = await fetch('https://books-barter.onrender.com/api/v1/users', {
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
        console.error('An error occured: ', error);
    }

    // Fetching books
    let text = document.getElementById("search_input").value;
    let genre = document.getElementById("genreDD").value;
    let author = document.getElementById("authorDD").value;
    let condition = document.getElementById("conditionDD").value;

    try {
        const queryParams = new URLSearchParams({
            text,
            genre,
            author,
            condition
        });
        console.log(queryParams.toString());

        const response = await fetch(`https://books-barter.onrender.com/api/v1/books?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        const book_data = await response.json();
        if (!book_data) {
            alert("An error occurred, we cannot load any books. Please try again later!");
        }

        const books_sec = document.getElementById("books_row");
        books_sec.innerHTML = ""; // Clear old books
        books_sec.innerHTML+=`            <div id="bookModal" class="modal-overlay container-fluid" onclick="closeModal(event)">
                <div class="modal-card d-flex flex-column flex-lg-row flex-md-row flex-sm-row align-items-center justify-content-center">
                    <div class="col-lg-6 col-md-6 col-sm-6 col-12 d-flex align-items-center justify-content-center" id="modalIMGDIV">
                        <img id="modalImage" src="" alt="Book">
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-6 col-12 d-flex justify-content-center align-items-start flex-column">
                        <p id="modalTitle">Book: <span id="modalTitlep">No Available</span></p>
                        <p id="modalAuthor">Author: <span id="modalAuthorp">No Available</span></p>
                        <p id="modalCondition">Condition: <span id="modalConditionp">No Available</span></p>
                        <p id="modalOwner">Owner: <span id="modalOwnerp">No Available</span></p>
                        <p id="modalDesc">Description: <span id="modalDescp"></span></p>
                        <a href="#" id="modalSwapBtn" class="swap-link"><button class="swap-btn">SWAP <i class="fa-solid fa-arrow-right arrow-icon"></i></button></a>
                    </div>
                    <button class="close-btn" onclick="closeModal(event)">×</button>
                </div>
            </div>`;

        let owner_data;
        for (let i = 0; i < book_data.length; i++) {
            try {
                const ownerResponse = await fetch(`https://books-barter.onrender.com/api/v1/users/${book_data[i].ownerID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                });
                owner_data = await ownerResponse.json();
            } catch (error) {
                console.log("An error occurred while fetching owner details:", error);
            }

            let img_url = `https://books-barter.onrender.com${book_data[i].photo}`;
            let book_condition = book_data[i].condition === "New" ? "new" :
                                book_data[i].condition === "Like New" ? "mid" : "low";
            
            books_sec.innerHTML += `
                <a class="col-6 col-sm-4 col-md-3 col-lg-3 book px-lg-5 py-2 px-1"
                onclick="openModal('${book_data[i].title}','${book_data[i].author}','${book_data[i].condition}','${img_url}','${owner_data.name}','${book_data[i]._id}')">
                    <div class="book-img-wrapper position-relative">
                        <span class="badge-condition-${book_condition}">★ ${book_data[i].condition}</span>
                        <img src="${img_url}" class="card-img-top" alt="...">
                    </div>
                    <h5 class="card-text text-center mb-0 m-1">${book_data[i].title}</h5>
                    <p class="card-text text-center pb-3">${book_data[i].author}</p>
                </a>
            `;
        }
    } catch (error) {
        console.error('An error occurred while loading books: ', error);
    }
})

async function openModal(title, author, condition, img, owner,bookId) {
    console.log({title, author, condition, img, owner,bookId});
    // Show basic info immediately
    document.getElementById("modalTitlep").innerText =title;
    document.getElementById("modalAuthorp").innerText =author;
    document.getElementById("modalConditionp").innerText =condition;
    document.getElementById("modalImage").src = img;
    document.getElementById("modalOwnerp").innerText = owner;
    document.getElementById("modalDescp").innerText = "Loading...";
    document.getElementById("modalSwapBtn").href=`books_display.html?id=${bookId}`;
    // Finally, show the modal
    document.getElementById("bookModal").style.display = "flex";
    document.body.style.overflow = 'hidden';
    // Fetch book description using Open Library
    try {
        const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (data.docs.length > 0) {
            const workKey = data.docs[0].key; // e.g., /works/OL45804W
            const detailRes = await fetch(`https://openlibrary.org${workKey}.json`);
            const detail = await detailRes.json();

            const desc = typeof detail.description === "string"
                ? detail.description
                : detail.description?.value;

            const truncatedDesc = desc
                ? desc.split(" ").slice(0, 40).join(" ") + (desc.split(" ").length > 60 ? "......" : "")
                : "Not available.";
            document.getElementById("modalDescp").innerText = truncatedDesc;

        } else {
            document.getElementById("modalDescp").innerText = "Not available.";
        }
    } catch (error) {
        console.error("Error fetching description:", error);
        document.getElementById("modalDescp").innerText = "Not available.";
    }
}

function closeModal(event) {
    const modal = document.getElementById("bookModal");
    if (
        event.target === modal ||
        event.target.classList.contains("close-btn")
    ) {
        modal.style.display = "none";
    }
    document.body.style.overflow = 'auto';
}

document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault(); // ⛔ Stops page reload
    search();           // Call your search function
});

async function search(){
    const token = localStorage.getItem("token"); 
    event.preventDefault();
    // Fetching books
    let text = document.getElementById("search_input").value;
    let genre = document.getElementById("genreDD").value;
    let author = document.getElementById("authorDD").value;
    let condition = document.getElementById("conditionDD").value;

    try {
        const queryParams = new URLSearchParams({
            text,
            genre,
            author,
            condition
        });
        console.log(queryParams.toString());

        const response = await fetch(`https://books-barter.onrender.com/api/v1/books?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        const book_data = await response.json();
        if (!book_data) {
            alert("An error occurred, we cannot load any books. Please try again later!");
        }

        const books_sec = document.getElementById("books_row");
        books_sec.innerHTML = ""; // Clear old books
        books_sec.innerHTML+=`            <div id="bookModal" class="modal-overlay container-fluid" onclick="closeModal(event)">
                <div class="modal-card d-flex flex-column flex-lg-row flex-md-row flex-sm-row align-items-center justify-content-center">
                    <div class="col-lg-6 col-md-6 col-sm-6 col-12 d-flex align-items-center justify-content-center" id="modalIMGDIV">
                        <img id="modalImage" src="" alt="Book">
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-6 col-12 d-flex justify-content-center align-items-start flex-column">
                        <p id="modalTitle">Book: <span id="modalTitlep">No Available</span></p>
                        <p id="modalAuthor">Author: <span id="modalAuthorp">No Available</span></p>
                        <p id="modalCondition">Condition: <span id="modalConditionp">No Available</span></p>
                        <p id="modalOwner">Owner: <span id="modalOwnerp">No Available</span></p>
                        <p id="modalDesc">Description: <span id="modalDescp"></span></p>
                        <a href="#" id="modalSwapBtn" class="swap-link"><button class="swap-btn">SWAP <i class="fa-solid fa-arrow-right arrow-icon"></i></button></a>
                    </div>
                    <button class="close-btn" onclick="closeModal(event)">×</button>
                </div>
            </div>`;

        let owner_data;
        for (let i = 0; i < book_data.length; i++) {
            try {
                const ownerResponse = await fetch(`https://books-barter.onrender.com/api/v1/users/${book_data[i].ownerID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                });
                owner_data = await ownerResponse.json();
            } catch (error) {
                console.log("An error occurred while fetching owner details:", error);
            }

            let img_url = `https://books-barter.onrender.com${book_data[i].photo}`;
            let book_condition = book_data[i].condition === "New" ? "new" :
                                book_data[i].condition === "Like New" ? "mid" : "low";
            
            books_sec.innerHTML += `
                <a class="col-6 col-sm-4 col-md-3 col-lg-3 book px-lg-5 py-2 px-1"
                onclick="openModal('${book_data[i].title}','${book_data[i].author}','${book_data[i].condition}','${img_url}','${owner_data.name}')">
                    <div class="book-img-wrapper position-relative">
                        <span class="badge-condition-${book_condition}">★ ${book_data[i].condition}</span>
                        <img src="${img_url}" class="card-img-top" alt="...">
                    </div>
                    <h5 class="card-text text-center mb-0 m-1">${book_data[i].title}</h5>
                    <p class="card-text text-center pb-3">${book_data[i].author}</p>
                </a>
            `;
        }
    } catch (error) {
        console.error('An error occurred while loading books: ', error);
    }
}