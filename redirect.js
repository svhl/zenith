// redirect.js

// Function to perform redirection based on viewport width
function redirectBasedOnWidth() {
    const width = window.innerWidth;

    // URLs for different device sizes
    const mobileURL = "stud_login_mob.html";
    const desktopURL = "stud_login_desk.html";

    // Redirect based on width
    if (width <= 480) {
        // Redirect to mobile URL
        window.location.href = mobileURL;
    } else {
        // Redirect to desktop URL
        window.location.href = desktopURL;
    }
}

// Run the function on page load
window.onload = redirectBasedOnWidth;

// Optionally, run the function on window resize
window.onresize = redirectBasedOnWidth;
