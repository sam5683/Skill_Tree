// Debounce Utility
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Modal Handling
function toggleModal(id) {
  const modal = document.getElementById(id);
  modal.classList.toggle("hidden");
  if (!modal.classList.contains("hidden")) {
    const firstInput = modal.querySelector("input");
    firstInput?.focus();
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
  const existingToasts = document.querySelectorAll(".toast");
  existingToasts.forEach(toast => toast.remove());
  const toast = document.createElement("div");
  toast.className = `toast fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg z-50 text-sm font-medium ${
    isSuccess ? "bg-green-600 text-white" : "bg-red-600 text-white"
  } transition-opacity duration-300`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("opacity-0"), 2000);
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
let doPasswordsMatch = false;

// Username Validation with Debounce
const usernameInput = document.getElementById("username");
const usernameFeedback = document.getElementById("usernameFeedback");
const signupButton = document.querySelector("#signupForm button[type='submit']");
const usernamePattern = /^[A-Za-z]{3,}$/;

if (usernameInput) {
  usernameInput.addEventListener("input", debounce(async () => {
    const value = usernameInput.value.trim();

    if (!value) {
      usernameFeedback.textContent = "";
      usernameFeedback.className = "text-sm text-gray-600";
      isUsernameAvailable = false;
      updateSignupButton();
      return;
    }

    if (!usernamePattern.test(value)) {
      usernameFeedback.textContent = "⚠️ Only letters (a-z), minimum 3 characters.";
      usernameFeedback.className = "text-sm text-red-600 font-semibold";
      isUsernameAvailable = false;
      updateSignupButton();
      return;
    }

    usernameFeedback.textContent = "⏳ Checking availability...";
    usernameFeedback.className = "text-sm text-blue-500";

    try {
      const response = await window.api.fetch(`http://localhost:8080/api/users/username/${value}`);
      if (response.status === 404) {
        usernameFeedback.textContent = "✅ Available!";
        usernameFeedback.className = "text-sm text-green-500";
        isUsernameAvailable = true;
      } else {
        const available = !response.data;
        usernameFeedback.textContent = available ? "✅ Available!" : "❌ Already taken!";
        usernameFeedback.className = `text-sm ${available ? "text-green-500" : "text-red-500"}`;
        isUsernameAvailable = available;
      }
    } catch (err) {
      console.error("Error checking username:", err);
      usernameFeedback.textContent = "⚠ Unable to check availability. Try again.";
      usernameFeedback.className = "text-sm text-yellow-500";
      isUsernameAvailable = false;
    }

    updateSignupButton();
  }, 300));
}

// Password Validation
const passwordInput = document.getElementById("password");
const repeatPasswordInput = document.getElementById("repeatPassword");
const passwordStrength = document.getElementById("passwordStrength");
const matchFeedback = document.getElementById("passwordMatchFeedback");

if (passwordInput && repeatPasswordInput) {
  passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    let strength = "Weak";
    if (val.length >= 6 && /[A-Za-z]/.test(val) && /\d/.test(val)) strength = "Medium";
    if (val.length >= 8 && /[A-Za-z]/.test(val) && /\d/.test(val) && /[\W]/.test(val)) strength = "Strong";
    passwordStrength.textContent = `Strength: ${strength}`;
    validatePasswords();
  });

  repeatPasswordInput.addEventListener("input", validatePasswords);

  function validatePasswords() {
    const password = passwordInput.value || "";
    const repeat = repeatPasswordInput.value || "";
    if (!password || !repeat) {
      matchFeedback.textContent = "";
      doPasswordsMatch = false;
    } else if (password === repeat) {
      matchFeedback.textContent = "✅ Passwords match";
      matchFeedback.className = "text-sm text-green-500";
      passwordInput.classList.remove("border-red-500");
      repeatPasswordInput.classList.remove("border-red-500");
      passwordInput.classList.add("border-green-500");
      repeatPasswordInput.classList.add("border-green-500");
      doPasswordsMatch = true;
    } else {
      matchFeedback.textContent = "❌ Passwords do not match";
      matchFeedback.className = "text-sm text-red-500";
      passwordInput.classList.add("border-red-500");
      repeatPasswordInput.classList.add("border-red-500");
      doPasswordsMatch = false;
    }
    updateSignupButton();
  }
}

// Update Signup Button State
function updateSignupButton() {
  const emailInput = document.getElementById("emailInput");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const repeatPasswordInput = document.getElementById("repeatPassword");
  const fullNameInput = document.querySelector("#signupForm input[placeholder='Full Name']");
  const dobInput = document.getElementById("dobPicker");

  const isFormValid =
    emailInput.value.trim() &&
    usernameInput.value.trim() &&
    passwordInput.value &&
    repeatPasswordInput.value &&
    fullNameInput.value.trim() &&
    dobInput.value &&
    doPasswordsMatch &&
    usernamePattern.test(usernameInput.value.trim());

  signupButton.disabled = !isFormValid;
}

// Email Validation
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

async function checkEmail(email) {
  if (!isValidEmail(email)) {
    return { error: "Invalid email format" };
  }

  try {
    const response = await fetch(`http://localhost:8080/api/users/check-email?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    console.log("Email check response status:", response.status); // Debugging
    if (response.status === 409) return { exists: true }; // Handle 409 for existing email
    if (response.status === 401) return { exists: true }; // Handle 401 as a temporary workaround for existing email
    if (!response.ok) {
      const errorText = await response.text(); // Debugging
      console.log("Response error text:", errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response data:", data); // Debugging
    return { exists: data.exists || false };
  } catch (error) {
    console.error("Error checking email:", error);
    return { error: "Network error. Please try again later." };
  }
}

// Sign-Up Handler
async function handleSignUp(event) {
  event.preventDefault();
  const form = document.getElementById("signupForm");
  const fullName = form.querySelector("input[placeholder='Full Name']").value.trim();
  const dob = document.getElementById("dobPicker").value;
  const email = document.getElementById("emailInput").value.trim().toLowerCase();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const repeatPassword = document.getElementById("repeatPassword").value;
  const signupFeedback = document.getElementById("signupFeedback") || document.createElement("div");

  if (!document.getElementById("signupFeedback")) {
    signupFeedback.id = "signupFeedback";
    signupFeedback.className = "text-sm font-semibold mb-2";
    form.insertBefore(signupFeedback, form.firstChild);
  }

  if (!fullName || !dob || !email || !username || !password || !repeatPassword) {
    signupFeedback.textContent = "⚠ Please fill in all fields.";
    signupFeedback.className = "text-sm text-red-600 font-semibold";
    return;
  }

  if (!doPasswordsMatch) {
    signupFeedback.textContent = "❌ Passwords do not match.";
    signupFeedback.className = "text-sm text-red-600 font-semibold";
    return;
  }

  if (!usernamePattern.test(username)) {
    signupFeedback.textContent = "⚠ Username must contain only letters, minimum 3 characters.";
    signupFeedback.className = "text-sm text-red-600 font-semibold";
    return;
  }

  signupButton.disabled = true;
  signupButton.textContent = "Processing...";
  signupFeedback.textContent = "⏳ Verifying email...";
  signupFeedback.className = "text-sm text-blue-500 font-semibold";

  try {
    const emailCheck = await checkEmail(email);
    if (emailCheck.exists) {
      signupFeedback.textContent = "⚠ This email already exists.";
      signupFeedback.className = "text-sm text-red-600 font-semibold";
      signupButton.disabled = false;
      signupButton.textContent = "Create Account";
      return;
    }

    if (emailCheck.error) {
      signupFeedback.textContent = `⚠ ${emailCheck.error}. Please try again.`;
      signupFeedback.className = "text-sm text-red-600 font-semibold";
      signupButton.disabled = false;
      signupButton.textContent = "Create Account";
      return;
    }

    const response = await window.api.post("http://localhost:8080/api/users", {
      fullName,
      username,
      email,
      password,
      dob
    });

    if (response.success) {
      signupFeedback.textContent = "🎉 You have successfully created an account!";
      signupFeedback.className = "text-sm text-green-600 font-semibold";
      toggleModal("signupModal");
      showToast("🎉 Account created successfully! Welcome!", true);
      window.api.send("redirect-to-tree", { username });
    } else {
      signupFeedback.textContent = `⚠ ${response.message || "Registration failed. Please try again."}`;
      signupFeedback.className = "text-sm text-red-600 font-semibold";
    }
  } catch (error) {
    console.error("Sign-up error:", error);
    signupFeedback.textContent = "⚠ An error occurred. Please try again later.";
    signupFeedback.className = "text-sm text-red-600 font-semibold";
  } finally {
    signupButton.disabled = false;
    signupButton.textContent = "Create Account";
  }
}

// Email-only Login Handler
async function handleSignIn(event) {
  event.preventDefault();
  const email = document.getElementById("signinUsername")?.value.trim().toLowerCase();
  const password = document.getElementById("signinPassword")?.value;
  const feedback = document.getElementById("signinFeedback");

  if (!email || !password) {
    feedback.textContent = "Please enter your email and password.";
    feedback.classList.remove("hidden");
    return;
  }

  feedback.textContent = "Authenticating...";
  feedback.classList.remove("hidden");

  try {
    const response = await window.api.post("http://localhost:8080/api/users/login", {
      email,
      password
    });

    if (response.success) {
      feedback.classList.add("hidden");
      showToast(`🎉 Welcome back, ${response.data.username}!`, true);
      window.api.send("redirect-to-tree", { username: response.data.username });
    } else {
      feedback.textContent = "⚠ Incorrect email or password.";
      feedback.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Login error:", err);
    feedback.textContent = "⚠ Server error. Please try again later.";
    feedback.classList.remove("hidden");
  }
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  setupPasswordToggles();
  if (signupButton) updateSignupButton();
});