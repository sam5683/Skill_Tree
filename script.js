// Modal Handling
function toggleModal(id) {
  const modal = document.getElementById(id);
  modal.classList.toggle("hidden");
  if (!modal.classList.contains("hidden")) {
    const firstInput = modal.querySelector("input");
    firstInput?.focus(); // Safe focus check
    modal.addEventListener("keydown", trapFocus);
  } else {
    modal.removeEventListener("keydown", trapFocus);
  }
}

// Focus Trapping
function trapFocus(event) {
  const modal = document.querySelector(".fixed:not(.hidden)");
  const focusable = modal?.querySelectorAll("input, button, [tabindex]:not([tabindex='-1'])");
  if (!focusable) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.key === "Tab") {
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

// Toast Messages
function showToast(message, isSuccess = false) {
  const toast = document.createElement("div");
  toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 p-3 rounded-md shadow-lg ${
    isSuccess ? "bg-green-600 text-white" : "bg-red-600 text-white"
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Password Toggle
function setupPasswordToggles() {
  document.querySelectorAll(".password-toggle").forEach(icon => {
    icon.addEventListener("click", () => {
      const targetId = icon.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (input) {
        const type = input.type === "password" ? "text" : "password";
        input.type = type;
        icon.setAttribute("data-lucide", type === "password" ? "eye" : "eye-off");
        lucide.createIcons();
      }
    });
  });
}

// Validation Flags
let isUsernameAvailable = false;
let isEmailAvailable = true;
let doPasswordsMatch = false;

// Username Validation
const usernameInput = document.getElementById("username");
const usernameFeedback = document.getElementById("usernameFeedback");
const signupButton = document.querySelector("#signupForm button[type='submit']");
const usernamePattern = /^[a-zA-Z0-9_]{4,16}$/;

usernameInput?.addEventListener("input", async () => {
  const value = usernameInput.value.trim();
  if (!usernamePattern.test(value)) {
    usernameFeedback.textContent = "❌ Username must be 4-16 characters (letters, numbers, underscore only)";
    usernameFeedback.className = "text-sm text-red-500";
    isUsernameAvailable = false;
  } else {
    try {
      const response = await window.api.fetch(`http://localhost:8080/api/users/username/${value}`);
      const available = response.data === null;
      usernameFeedback.textContent = available ? "✅ Username available!" : "❌ Username taken!";
      usernameFeedback.className = `text-sm ${available ? "text-green-500" : "text-red-500"}`;
      isUsernameAvailable = available;
    } catch (err) {
      usernameFeedback.textContent = "⚠️ Check connection";
      usernameFeedback.className = "text-sm text-yellow-500";
      isUsernameAvailable = false;
    }
  }
  updateSignupButton();
});

// Email Validation
const emailInput = document.getElementById("emailInput");
const emailFeedback = document.createElement("div");
emailFeedback.className = "text-sm text-gray-600";
emailInput?.parentNode.appendChild(emailFeedback);

emailInput?.addEventListener("input", async () => {
  const value = emailInput.value.trim();
  if (!value) {
    emailFeedback.textContent = "";
    isEmailAvailable = true;
  } else {
    try {
      const response = await window.api.fetch(`http://localhost:8080/api/users/check-email?email=${encodeURIComponent(value)}`);
      isEmailAvailable = !response.data;
      emailFeedback.textContent = response.data ? "❌ Email already taken!" : "✅ Email available!";
      emailFeedback.className = `text-sm ${response.data ? "text-red-500" : "text-green-500"}`;
    } catch (err) {
      emailFeedback.textContent = "⚠️ Check connection";
      emailFeedback.className = "text-sm text-yellow-500";
      isEmailAvailable = false;
    }
  }
  updateSignupButton();
});

// Password Validation
const passwordInput = document.getElementById("password");
const repeatPasswordInput = document.getElementById("repeatPassword");
const passwordStrength = document.getElementById("passwordStrength");
const matchFeedback = document.getElementById("passwordMatchFeedback");

passwordInput?.addEventListener("input", () => {
  const val = passwordInput.value;
  let strength = "Weak";
  if (val.length >= 6 && /[A-Za-z]/.test(val) && /\d/.test(val)) strength = "Medium";
  if (val.length >= 8 && /[A-Za-z]/.test(val) && /\d/.test(val) && /[\W]/.test(val)) strength = "Strong";
  passwordStrength.textContent = `Strength: ${strength}`;
  validatePasswords();
});

repeatPasswordInput?.addEventListener("input", validatePasswords);

function validatePasswords() {
  const password = passwordInput?.value || "";
  const repeat = repeatPasswordInput?.value || "";
  if (!password || !repeat) {
    matchFeedback.textContent = "";
    doPasswordsMatch = false;
  } else if (password === repeat) {
    matchFeedback.textContent = "✅ Passwords match";
    matchFeedback.className = "text-sm text-green-500";
    passwordInput?.classList.remove("border-red-500");
    repeatPasswordInput?.classList.remove("border-red-500");
    passwordInput?.classList.add("border-green-500");
    repeatPasswordInput?.classList.add("border-green-500");
    doPasswordsMatch = true;
  } else {
    matchFeedback.textContent = "❌ Passwords do not match";
    matchFeedback.className = "text-sm text-red-500";
    passwordInput?.classList.add("border-red-500");
    repeatPasswordInput?.classList.add("border-red-500");
    doPasswordsMatch = false;
  }
  updateSignupButton();
}

function updateSignupButton() {
  signupButton.disabled = !isUsernameAvailable || !isEmailAvailable || !doPasswordsMatch;
}

// Sign-Up Handler
async function handleSignUp(event) {
  event.preventDefault();
  const username = usernameInput?.value.trim();
  const email = emailInput?.value.trim();
  const password = passwordInput?.value;
  const fullName = document.querySelector("#signupForm input[placeholder='Full Name']")?.value.trim();
  const dob = document.getElementById("dobPicker")?.value;

  if (!usernamePattern.test(username)) {
    showToast("Invalid username format", false);
    return;
  }
  if (!isEmailAvailable) {
    showToast("Email already taken", false);
    return;
  }
  if (!doPasswordsMatch) {
    showToast("Passwords do not match", false);
    return;
  }
  try {
    const response = await window.api.post('http://localhost:8080/api/users', {
      username,
      email,
      password,
      fullName,
      dob
    });
    if (response.success) {
      toggleModal("signupModal");
      showToast(`Welcome, ${username}!`, true);
    } else {
      showToast(response.message || "Registration failed", false);
    }
  } catch (err) {
    showToast("Registration failed. Try again.", false);
  }
}

// Login Handler with IPC redirect
async function handleSignIn(event) {
  event.preventDefault();

  const username = document.getElementById("signinUsername")?.value.trim(); // Simplified to use signinUsername only
  const password = document.getElementById("signinPassword")?.value;
  const feedback = document.getElementById("signinFeedback");

  if (!username || !password) {
    feedback.textContent = "Please enter username/email and password.";
    feedback.classList.remove("hidden");
    return;
  }

  // Check if window.api is available
  if (!window.api) {
    console.error('window.api is undefined - check preload.js');
    feedback.textContent = "Internal error. Please reload.";
    feedback.classList.remove("hidden");
    return;
  }

  try {
    const response = await window.api.post('http://localhost:8080/api/users/login', {
      username,
      password,
      email: username.includes('@') ? username : ''
    });

    console.log('Login response:', JSON.stringify(response, null, 2)); // Detailed debug
    console.log('Username used:', username); // Debug username

    if (response.success) {
      feedback.classList.add("hidden");
      showToast(`Welcome back, ${response.data.username || username.split('@')[0] || username}!`, true);

      // Send IPC message to main process for redirection with a small delay
      setTimeout(() => {
        window.api.send('redirect-to-tree');
        console.log('IPC redirect-to-tree sent'); // Debug
      }, 100);
    } else {
      feedback.textContent = "Incorrect username, email, or password.";
      feedback.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Login error:", err);
    feedback.textContent = "Server error. Try again later.";
    feedback.classList.remove("hidden");
  }
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  setupPasswordToggles();
});