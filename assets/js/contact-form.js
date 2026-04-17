const form = document.getElementById('contactForm');
const result = document.getElementById('result');
const btn = document.getElementById('submitBtn');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Submission limit logic
    const today = new Date().toISOString().split('T')[0];
    const submissions = JSON.parse(localStorage.getItem('formSubmissions')) || {};
    
    if (submissions[today] && submissions[today] >= 3) {
        result.innerText = "You have reached the maximum number of submissions for today.";
        result.style.color = "orange";
        setTimeout(() => { result.innerText = ""; }, 5000);
        return;
    }

    // UI feedback: Disable button and show loading
    btn.disabled = true;
    btn.innerText = "Sending...";
    result.innerText = "Please wait...";
    result.style.color = "blue";

    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: json
    })
    .then(async (response) => {
        let res = await response.json();
        if (response.status == 200) {
            // Increment submission count first
            submissions[today] = (submissions[today] || 0) + 1;
            localStorage.setItem('formSubmissions', JSON.stringify(submissions));

            const remaining = 3 - submissions[today];
            result.innerText = `Message sent successfully! You have ${remaining} submission(s) left for today.`;
            result.style.color = "green";
            form.reset(); // Clear the form
            
        } else {
            console.log(response);
            result.innerText = res.message;
            result.style.color = "red";
        }
    })
    .catch(error => {
        console.log(error);
        result.innerText = "Something went wrong!";
        result.style.color = "red";
    })
    .then(function() {
        // Reset button state
        btn.disabled = false;
        btn.innerText = "Send Message";
        // Clear result message after 5 seconds
        setTimeout(() => { result.innerText = ""; }, 5000);
    });
});
