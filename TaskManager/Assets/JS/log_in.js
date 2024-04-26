
var userData = [];

function toggleForms(formId) {
    document.getElementById('signupForm').style.display = formId === 'signupForm' ? 'block' : 'none';
    document.getElementById('loginForm').style.display = formId === 'loginForm' ? 'block' : 'none';
}

function validateSignUp() {
    var username = document.getElementById('signupUsername').value;
    var password = document.getElementById('signupPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!/^[a-zA-Z]+$/.test(username)) {
        alert('Username should contain only characters. Please enter a valid username.');
        return;
    }
    if (password.length < 8) {
        alert('Password should be at least 8 characters long. Please enter a valid password.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please enter the correct password.');
        return; // Do not proceed if passwords do not match
    }

    // If validation passes, create a user object
    var user = {
        username: username,
        password: password
    };

    // Add the user object to the userData array
    userData.push(user);

    // Add the user information to the login form
    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = password;

    // Display a success message
    alert('Sign up successful! Now you can log in.');

    localStorage.setItem('userData', JSON.stringify(userData));

}

function enableSignupButton() {
    var signupUsername = document.getElementById('signupUsername').value;
    var signupPassword = document.getElementById('signupPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    var signupBtn = document.getElementById('signupBtn');
    signupBtn.disabled = signupUsername.trim() === '' || signupPassword.trim() === '' || confirmPassword.trim() === '';
}

function enableLoginButton() {
    var loginUsername = document.getElementById('loginUsername').value;
    var loginPassword = document.getElementById('loginPassword').value;

    var loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = loginUsername.trim() === '' || loginPassword.trim() === '';
}

function validateLogin() {
    // Get user input
    var username = document.getElementById("loginUsername").value;
    var password = document.getElementById("loginPassword").value;

    // Retrieve user data from localStorage
    var storedUserData = JSON.parse(localStorage.getItem('userData'));

    // Check if username exists and password is correct
    var user = storedUserData.find(function (user) {
        return user.username === username && user.password === password;
    });

    if (user) {
        localStorage.setItem("user", username);
        window.location.href = "index.html"; // Replace 'index.html' with your actual index page
    } else {
        alert("Invalid username or password. Please try again.");
    }

    // Clear login form
    document.getElementById("loginForm").reset();
}
