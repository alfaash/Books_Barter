// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  AOS.init();
  
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value.trim();

    try {
      const response = await fetch('https://books-barter.onrender.com/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in localStorage
        localStorage.setItem('token', data.token);
        window.location.href = 'browse.html'; // redirect to homepage or dashboard
      } else {
        alert(data.msg || 'Login failed! Please check your credentials.');
      }

    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again later.');
    }
  });
});
