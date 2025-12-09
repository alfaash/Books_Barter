document.addEventListener("DOMContentLoaded", async function () {
    const token=localStorage.getItem('token');
    AOS.init();

    const bookTitleElement = document.getElementById("book_name");
    const authorElement = document.getElementById("author_name");
    const descElement = document.getElementById("book_desc");

    const genreElement = document.querySelector(".genre_div h5.text-secondary");
    const conditionElement = document.querySelector(".condition_div h5.text-secondary");
    const ownerElement = document.querySelector(".owner_div h5.text-secondary");
    const bookImageElement = document.querySelector("#books_display_section img");

    // 1. Get book ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("id");

    if (!bookId) {
        alert("No book selected!");
        window.location.href = "browse.html";
        return;
    }

    // 2. Fetch book details from backend
    try {
        const response = await fetch(`http://localhost:5000/api/v1/books/${bookId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch book details");
        }

        const book = await response.json();
        try {
            const ownerResponse = await fetch(`http://localhost:5000/api/v1/users/${book.ownerID}`, {
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

        // Update UI with fetched data
        bookTitleElement.innerText = book.title;
        authorElement.innerText = book.author;
        genreElement.innerText = book.genre;
        conditionElement.innerText = book.condition;
        ownerElement.innerText = owner_data.name || "Unknown"; // assuming backend sends owner name
        bookImageElement.src = `http://localhost:5000${book.photo}`;

    } catch (error) {
        console.error("Error fetching book:", error);
        descElement.innerText = "Error loading book details.";
    }

    //Fetching book description
    try {
        const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(bookTitleElement.innerText)}&author=${encodeURIComponent(authorElement.innerText)}`;
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
                ? desc.split(" ").slice(0, 80).join(" ") + (desc.split(" ").length > 100 ? "......" : "")
                : "Description Not available.";
            document.getElementById("book_desc").innerText = truncatedDesc;

        } else {
            document.getElementById("book_desc").innerText = "Not available.";
        }
    } catch (error) {
        console.error("Error fetching description:", error);
        document.getElementById("book_desc").innerText = "Not available.";
    }

    // loading profile
    try {
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
        console.error('An error occured: ', error);
    }
});