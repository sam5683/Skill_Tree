// Modal Handling
function toggleModal(id) {
    const modal = document.getElementById(id);
    modal.classList.toggle("hidden");
    if (!modal.classList.contains("hidden")) {
      const firstInput = modal.querySelector("input");
      firstInput.focus();
      modal.addEventListener("keydown", trapFocus);
    } else {
      modal.removeEventListener("keydown", trapFocus);
    }
  }
  
  // Focus Trapping
  function trapFocus(event) {
    const modal = document.querySelector(".fixed:not(.hidden)");
    const focusable = modal.querySelectorAll("input, button, [tabindex]:not([tabindex='-1'])");
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
    toast.className = `toast ${isSuccess ? "toast-success" : "toast-error"}`;
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
        const type = input.type === "password" ? "text" : "password";
        input.type = type;
        icon.setAttribute("data-lucide", type === "password" ? "eye" : "eye-off");
        lucide.createIcons();
      });
    });
  }
  
  // Username Validation
  const usernameInput = document.getElementById("username");
  const usernameFeedback = document.getElementById("usernameFeedback");
  const signupButton = document.querySelector("#signupForm button[type='submit']");
  const usernamePattern = /^[a-zA-Z0-9_]{4,16}$/;
  
  usernameInput.addEventListener("input", async () => {
    const value = usernameInput.value.trim();
    if (!usernamePattern.test(value)) {
      usernameFeedback.textContent = "❌ Username must be 4-16 characters (letters, numbers, underscore only)";
      usernameFeedback.className = "text-sm text-red-500";
      signupButton.disabled = true;
    } else {
      const response = await window.api.fetch(`http://localhost:3000/api/user/check-username/${value}`);
      const { available } = await response.json();
      usernameFeedback.textContent = available ? "✅ Username available!" : "❌ Username taken!";
      usernameFeedback.className = `text-sm ${available ? "text-green-500" : "text-red-500"}`;
      signupButton.disabled = !available;
    }
  });
  
  // Password Validation
  const passwordInput = document.getElementById("password");
  const repeatPasswordInput = document.getElementById("repeatPassword");
  const passwordStrength = document.getElementById("passwordStrength");
  const matchFeedback = document.getElementById("passwordMatchFeedback");
  
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
    const password = passwordInput.value;
    const repeat = repeatPasswordInput.value;
    if (!password || !repeat) {
      matchFeedback.textContent = "";
      signupButton.disabled = true;
      return;
    }
    if (password === repeat) {
      matchFeedback.textContent = "✅ Passwords match";
      matchFeedback.className = "text-sm text-green-500";
      passwordInput.classList.remove("border-red-500");
      repeatPasswordInput.classList.remove("border-red-500");
      passwordInput.classList.add("border-green-500");
      repeatPasswordInput.classList.add("border-green-500");
      signupButton.disabled = !usernameInput.value || !(await window.api.fetch(`http://localhost:3000/api/user/check-username/${usernameInput.value}`).then(res => res.json())).available;
    } else {
      matchFeedback.textContent = "❌ Passwords do not match";
      matchFeedback.className = "text-sm text-red-500";
      passwordInput.classList.add("border-red-500");
      repeatPasswordInput.classList.add("border-red-500");
      signupButton.disabled = true;
    }
  }
  
  // Sign-Up Handler
  async function handleSignUp(event) {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    if (!usernamePattern.test(username)) {
      showToast("Invalid username format", false);
      return;
    }
    if (password !== repeatPasswordInput.value) {
      showToast("Passwords do not match", false);
      return;
    }
    try {
      const response = await window.api.post("http://localhost:3000/api/user/register", { username, password });
      const data = await response.json();
      if (data.message === "User registered") {
        toggleModal("signupModal");
        showToast(`Welcome, ${username}!`, true);
      } else {
        showToast(data.message, false);
      }
    } catch (err) {
      showToast("Registration failed. Try again.", false);
    }
  }
  
  // Login Handler
  async function handleSignIn(event) {
    event.preventDefault();
    const username = document.getElementById("signinUsername").value.trim();
    const password = document.getElementById("signinPassword").value;
    const feedback = document.getElementById("signinFeedback");
    if (!username || !password) {
      feedback.textContent = "Please enter username and password.";
      feedback.classList.remove("hidden");
      return;
    }
    try {
      const response = await window.api.post("http://localhost:3000/api/user/login", { username, password });
      const data = await response.json();
      if (data.message === "Login successful") {
        toggleModal("signinModal");
        showToast(`Welcome back, ${username}!`, true);
        feedback.classList.add("hidden");
      } else {
        feedback.textContent = "Incorrect username or password.";
        feedback.classList.remove("hidden");
      }
    } catch (err) {
      feedback.textContent = "Error logging in.";
      feedback.classList.remove("hidden");
    }
  }
  
  // Animation Logic
  const canvas = document.getElementById("treeCanvas");
  const ctx = canvas.getContext("2d");
  let scrollY = 0;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  
  function drawTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    ctx.beginPath();
    ctx.strokeStyle = "#FF6F00";
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#FFC107";
    ctx.moveTo(centerX, 0);
    ctx.quadraticCurveTo(centerX + 20, scrollY / 2, centerX, scrollY);
    ctx.stroke();
    requestAnimationFrame(drawTree);
  }
  
  window.addEventListener("scroll", () => scrollY = window.scrollY);
  requestAnimationFrame(drawTree);
  
  // Initialization
  document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    setupPasswordToggles();
  });