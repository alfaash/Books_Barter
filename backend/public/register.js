// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
AOS.init();
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.querySelector('#name').value.trim();
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value.trim();

    //user location
  const getUserLocationString = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const apiKey = "64a2132881a34052973c8b5e3a7749ed";
          const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`);
          const data = await res.json();

          if (data.results.length > 0) {
            resolve(data.results[0].formatted); // full location string
          } else {
            reject("No location found");
          }
        } catch (err) {
          reject(err);
        }
      }, reject);
    });
  };  

    try {
      const locationString = await getUserLocationString();
      const response = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password,location: locationString })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);

        alert('Registration successful!');
        window.location.href = 'browse.html'; // or redirect to dashboard/home
      } else {
        alert(data.msg || 'Registration failed!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Something went wrong. Please try again later.');
    }
  });
});
