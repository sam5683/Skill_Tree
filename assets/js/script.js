// assets/js/script.js
window.api = window.api || { send: () => {}, on: () => {} };

const domains = ["gmail.com", "yahoo.com", "outlook.com", "protonmail.com"];

// Toasts
function showSuccessMessage(text) {
  const msg = document.createElement("div");
  msg.className = "success-message";
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2500);
}

function showWarningMessage(text) {
  const msg = document.createElement("div");
  msg.className = "warning-message";
  msg.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i> ${text}`;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// Modal
function toggleModal(id) {
  const modal = document.getElementById(id);
  modal.classList.toggle("hidden");
  const isOpen = !modal.classList.contains("hidden");
  document.body.classList.toggle("modal-open", isOpen);
  // add a separate class to blur background content when a modal is active
  document.body.classList.toggle("modal-active", isOpen);
  // Toggle normal cursor in modals and hide white-hole cursor
  document.body.classList.toggle("modal-active", isOpen);
  const cursor = document.getElementById('cursorWhiteHole');
  if (cursor && isOpen) {
    cursor.style.opacity = '0';
  } else if (cursor) {
    cursor.style.opacity = '1';
  }
  
  // NEW: Hide password requirements when opening sign-up modal (prevents show on open)
  if (id === 'signupModal' && isOpen) {
    const reqContainer = document.querySelector('.password-requirements');
    if (reqContainer) reqContainer.style.display = 'none';
  }
}

// Password Toggle
function setupPasswordVisibility() {
  const toggles = [
    { id: "togglePassword", inputId: "password" },
    { id: "toggleRepeatPassword", inputId: "repeatPassword" },
    { id: "toggleSigninPassword", inputId: "signinPassword" }
  ];
  toggles.forEach(t => {
    const btn = document.getElementById(t.id);
    const input = document.getElementById(t.inputId);
    if (btn && input) {
      btn.onclick = () => {
        const isPass = input.type === "password";
        input.type = isPass ? "text" : "password";
        btn.classList.toggle("fa-eye", !isPass);
        btn.classList.toggle("fa-eye-slash", isPass);
      };
    }
  });
}

// Password Validation
function validatePassword(password) {
  const requirements = {
    length: password.length >= 8,
    letters: /[A-Za-z].*[A-Za-z].*[A-Za-z]/.test(password), // 3 letters
    numbers: /.*\d.*\d.*/.test(password), // 2 numbers
    special: /[@$!%*#?&]/.test(password) // 1 special character
  };

  // Get requirements container
  const requirementsContainer = document.querySelector('.password-requirements');
  const passwordInput = document.getElementById('password');
  const repeatPasswordInput = document.getElementById('repeatPassword');
  const passwordMatchFeedback = document.getElementById('passwordMatchFeedback');

  // UPDATED: Show/hide based on at least 2 valid chars (letters, numbers, or symbols) – ignores junk like spaces
  const validCharRegex = /[A-Za-z0-9@$!%*#?&]/g;
  const validCharsCount = (password.match(validCharRegex) || []).length;
  const showRequirements = validCharsCount >= 2;
  if (requirementsContainer) {
    requirementsContainer.style.display = showRequirements ? 'block' : 'none';
  }

  // Update requirement indicators (only if showing requirements)
  if (showRequirements) {
    const indicators = {
      'lengthCheck': requirements.length,
      'letterCheck': requirements.letters,
      'numberCheck': requirements.numbers,
      'specialCheck': requirements.special
    };

    Object.entries(indicators).forEach(([id, isValid]) => {
      const container = document.getElementById(`${id}Container`);
      const icon = document.getElementById(id);
      if (container && icon) {
        if (isValid) {
          container.style.display = 'none'; // Hide met requirements
        } else {
          container.style.display = 'flex';
          icon.className = 'fas fa-times text-red-500';
        }
      }
    });
  }

  // Update password input border and show validation message
  if (password.length > 0) {
    const isValid = Object.values(requirements).every(Boolean);
    passwordInput.classList.toggle('valid-password', isValid);
    passwordInput.classList.toggle('invalid-password', !isValid);

    // Check password match if repeat password has value
    if (repeatPasswordInput.value) {
      const doPasswordsMatch = password === repeatPasswordInput.value;
      repeatPasswordInput.classList.toggle('valid-password', doPasswordsMatch && isValid);
      repeatPasswordInput.classList.toggle('invalid-password', !doPasswordsMatch || !isValid);
      
      if (passwordMatchFeedback) {
        passwordMatchFeedback.textContent = doPasswordsMatch ? 
          (isValid ? '✓ Password valid and matching' : 'Password requirements not met') : 
          'Passwords do not match';
        passwordMatchFeedback.className = `text-sm font-medium ${doPasswordsMatch && isValid ? 'text-green-500' : 'text-red-500'}`;
        passwordMatchFeedback.style.display = 'block';
      }
    }
  } else {
    passwordInput.classList.remove('valid-password', 'invalid-password');
  }

  const errors = [];
  if (!requirements.length) errors.push("at least 8 characters");
  if (!requirements.letters) errors.push("3 letters");
  if (!requirements.numbers) errors.push("2 numbers");
  if (!requirements.special) errors.push("1 special character (@$!%*#?&)");

  return {
    isValid: Object.values(requirements).every(Boolean),
    errors: errors
  };
}

// Username Validation
function isValidUsername(username) {
  return /^[a-zA-Z]{3,}$/.test(username);
}

// Email Check
async function checkEmail(email) {
  try {
    const res = await fetch(`http://localhost:8080/api/users/check-email?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    return data.data;
  } catch {
    showWarningMessage("Email check failed");
    return false;
  }
}

// Password real-time validation
function setupPasswordValidation() {
  const passwordInput = document.getElementById('password');
  const repeatPasswordInput = document.getElementById('repeatPassword');
  
  if (passwordInput) {
    // Validate on input
    passwordInput.addEventListener('input', function() {
      validatePassword(this.value);
    });
    
    // Validate on blur (when user leaves the field)
    passwordInput.addEventListener('blur', function() {
      if (this.value.length > 0) {
        validatePassword(this.value);
      }
    });
  }
  
  if (repeatPasswordInput) {
    // Validate when repeat password changes
    repeatPasswordInput.addEventListener('input', function() {
      if (passwordInput.value) {
        validatePassword(passwordInput.value);
      }
    });
  }
}

// Sign Up
async function handleSignUp(e) {
  e.preventDefault();
  const fullName = document.querySelector("#signupForm input[placeholder='Full Name']").value.trim();
  const dob = document.getElementById("dobPicker").value;
  const email = document.getElementById("emailInput").value.trim().toLowerCase();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const repeatPassword = document.getElementById("repeatPassword").value;
  const matchFeedback = document.getElementById("passwordMatchFeedback");
  const usernameFeedback = document.getElementById("usernameFeedback");
  const submitBtn = document.querySelector("#signupForm button[type='submit']");

  if (!fullName || !dob || !email || !username || !password || !repeatPassword) return showWarningMessage("Fill all fields!");

  // Password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    submitBtn.disabled = true;
    showWarningMessage("Password requirements not met – check the indicators below.");
    return;
  }

  if (password !== repeatPassword) {
    matchFeedback.textContent = "Passwords don't match!";
    matchFeedback.classList.remove("hidden");
    submitBtn.disabled = true;
    return;
  }
  matchFeedback.classList.add("hidden");

  if (!isValidUsername(username)) {
    usernameFeedback.textContent = "Username: Letters only, min 3 chars";
    usernameFeedback.style.color = "red";
    submitBtn.disabled = true;
    return;
  }

  if (await checkEmail(email)) return showWarningMessage("Email already registered!");

  const finalUsername = `${username}#${Math.floor(1000 + Math.random() * 9000)}`;
  usernameFeedback.textContent = `Username: ${finalUsername}`;
  usernameFeedback.style.color = "green";

  try {
    const res = await fetch('http://localhost:8080/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        fullName, 
        username: finalUsername, 
        email, 
        password,  // ← Explicit comma/space for clarity
        passwordConfirm: repeatPassword, 
        dob 
      })
    });

    // NEW: Log response details for debugging (check Console in F12)
    console.log('Response Status:', res.status);
    console.log('Response OK:', res.ok);

    if (!res.ok) {
      const errorText = await res.text();  // Get raw text if not JSON
      console.error('Server Error Details:', errorText);
      showWarningMessage(`Server error (${res.status}): ${errorText.substring(0, 100)}...`);  // Truncate long errors
      return;
    }

    const data = await res.json();
    if (data.success) {
      toggleModal("signupModal");
      showSuccessMessage(`Welcome, ${finalUsername}!`);
      localStorage.setItem('user', JSON.stringify(data.data));
      setTimeout(() => showDashboard(data.data), 1500);
    } else {
      showWarningMessage(data.message || "Sign up failed");
    }
  } catch (error) {
    console.error('Fetch Error:', error);  // Log full error
    showWarningMessage("Server error: " + error.message);
  }
}

// Sign In
async function handleSignIn(e) {
  e.preventDefault();
  const identifier = document.getElementById("signinUsername").value.trim().toLowerCase();
  const password = document.getElementById("signinPassword").value;
  const feedback = document.getElementById("signinFeedback");

  if (!identifier || !password) {
    feedback.textContent = "Enter email/username and password";
    feedback.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch('http://localhost:8080/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: identifier.includes('@') ? identifier : '',
        username: !identifier.includes('@') ? identifier : '',
        password
      })
    });
    const data = await res.json();
    if (data.success) {
      toggleModal("signinModal");
      showSuccessMessage(`Welcome back, ${data.data.username}!`);
      localStorage.setItem('user', JSON.stringify(data.data));
      setTimeout(() => showDashboard(data.data), 1500);
    } else {
      feedback.textContent = "Invalid credentials";
      feedback.classList.remove("hidden");
    }
  } catch {
    feedback.textContent = "Login failed";
    feedback.classList.remove("hidden");
  }
}

// Dashboard
function showDashboard(user) {
  document.getElementById("welcomeMessage").textContent = `Welcome back, ${user.username}!`;
  const date = new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  document.getElementById("lastLoginDate").textContent = `Last Login: ${date}`;
  toggleModal("dashboardModal");
}

// Redirect to Tree
function redirectToTree() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return showWarningMessage("No user!");
  const url = `tree/dashboard.html?username=${encodeURIComponent(user.username)}`;
  if (window.api && window.api.send) {
    window.api.send('redirect-to-tree', url);
  } else {
    window.location.href = url;
  }
  toggleModal("dashboardModal");
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  setupPasswordVisibility();
  setupPasswordValidation();

  // Load Optimized Particles (Replaces old DOM version)
  const particlesScript = document.createElement('script');
  particlesScript.src = 'assets/js/particles.js';
  document.head.appendChild(particlesScript);

  // DOB Picker
  flatpickr("#dobPicker", { dateFormat: "Y-m-d", maxDate: "today", altInput: true, altFormat: "F j, Y" });

  // Email Suggestions
  const emailInput = document.getElementById("emailInput");
  const emailSuggestions = document.getElementById("emailSuggestions");
  emailInput.addEventListener("input", () => {
    const val = emailInput.value;
    const at = val.indexOf("@");
    if (at === -1) return emailSuggestions.classList.add("hidden");
    const base = val.slice(0, at);
    const after = val.slice(at + 1).toLowerCase();
    const matches = domains.filter(d => d.startsWith(after));
    if (!matches.length) return emailSuggestions.classList.add("hidden");
    emailSuggestions.innerHTML = matches.map(d => 
      `<li class="px-3 py-1 hover:bg-gray-100 cursor-pointer text-sm">${base}@${d}</li>`
    ).join("");
    emailSuggestions.classList.remove("hidden");
    emailSuggestions.querySelectorAll("li").forEach(li => li.onclick = () => {
      emailInput.value = li.textContent;
      emailSuggestions.classList.add("hidden");
    });
  });

  // Username Validation
  const usernameInput = document.getElementById("username");
  const usernameFeedback = document.getElementById("usernameFeedback");
  usernameInput.addEventListener("input", () => {
    const val = usernameInput.value.trim();
    if (val === '') return;
    if (!isValidUsername(val)) {
      usernameFeedback.textContent = "Username: Letters only, min 3 chars";
      usernameFeedback.style.color = "red";
      document.querySelector("#signupForm button[type='submit']").disabled = true;
    } else {
      usernameFeedback.textContent = "Username valid!";
      usernameFeedback.style.color = "green";
      document.querySelector("#signupForm button[type='submit']").disabled = false;
    }
  });

  // Password Match
  const passwordInput = document.getElementById("password");
  const repeatPasswordInput = document.getElementById("repeatPassword");
  const passwordFeedback = document.getElementById("passwordMatchFeedback");
  function checkPasswordMatch() {
    if (repeatPasswordInput.value === '') return;
    if (passwordInput.value !== repeatPasswordInput.value) {
      passwordFeedback.textContent = "Passwords don't match!";
      passwordFeedback.classList.remove("hidden");
      document.querySelector("#signupForm button[type='submit']").disabled = true;
    } else {
      passwordFeedback.classList.add("hidden");
      document.querySelector("#signupForm button[type='submit']").disabled = false;
    }
  }
  passwordInput.addEventListener("input", checkPasswordMatch);
  repeatPasswordInput.addEventListener("input", checkPasswordMatch);

  // Enhanced Automatic Username Generator
  const reservedUsernames = ["0000", "cool", "fancy", "elite"];
  function generateUsername(base) {
    let randomNum;
    do {
      randomNum = Math.floor(1000 + Math.random() * 9000);
    } while (reservedUsernames.includes(`${base}#${randomNum}`));
    return `${base}#${randomNum}`;
  }
  usernameInput.addEventListener("input", () => {
    const base = usernameInput.value.trim();
    if (/^[a-zA-Z]{3,}$/.test(base)) {
      const suggestion = generateUsername(base);
      usernameFeedback.textContent = `Suggested Username: ${suggestion}`;
      usernameFeedback.style.color = "blue";
    } else if (/\d/.test(base)) {
      usernameFeedback.textContent = "Invalid username: letters only";
      usernameFeedback.style.color = "red";
    } else {
      usernameFeedback.textContent = "Invalid username: at least 3 letters";
      usernameFeedback.style.color = "red";
    }
  });
  usernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const finalUsername = usernameFeedback.textContent.replace("Suggested Username: ", "");
      if (finalUsername.startsWith("Invalid")) return;
      usernameFeedback.textContent = `Username: ${finalUsername}`;
      usernameFeedback.style.color = "green";
      usernameInput.value = finalUsername.split("#")[0];
    }
  });

  // --- Global Letter Repel (only headings and paragraphs) ---
  function wrapAllIntroLetters() {
    // Only wrap text in headings and paragraphs, not entire cards
    document.querySelectorAll("#intro h1, #intro h2, #intro h3, #intro p").forEach(node => {
      // Skip if node has lucide icons or other special elements
      if (node.querySelector('[data-lucide]')) return;
     
      const text = node.textContent.trim();
      if (text.length > 0) {
        node.innerHTML = text.split(/\s+/).map(word =>
          `<span class=\"word\">${[...word].map(char => `<span class=\"letter\">${char}</span>`).join('')}</span>`
        ).join(' ');
      }
    });
  }
  wrapAllIntroLetters();

  // Setup Optimized Letter Physics (Uses throttled helper from particles.js)
  requestAnimationFrame(() => {
    // Update origins on resize/scroll
    function updateLetterOrigins() {
      window._letters?.forEach(letter => {
        const rect = letter.el.getBoundingClientRect();
        letter.ox = rect.left + rect.width / 2 + window.scrollX;
        letter.oy = rect.top + rect.height / 2 + window.scrollY;
      });
    }
    window.addEventListener('resize', updateLetterOrigins);
    window.addEventListener('scroll', updateLetterOrigins);

    // Init Letters
    const letterNodes = Array.from(document.querySelectorAll('#intro .letter'));
    window._letters = letterNodes.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        el,
        ox: rect.left + rect.width / 2 + window.scrollX,
        oy: rect.top + rect.height / 2 + window.scrollY,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0
      };
    });

    // Start Animation (Throttled in particles.js helper)
    if (window.animateLetters) {
      window.animateLetters(window._letters);
    }
  });

  // Events
  document.getElementById("signinButton").onclick = () => toggleModal("signinModal");
  document.getElementById("signupButton").onclick = () => toggleModal("signupModal");
  document.getElementById("closeSignup").onclick = () => toggleModal("signupModal");
  document.getElementById("closeSignin").onclick = () => toggleModal("signinModal");
  document.getElementById("closeDashboard").onclick = () => toggleModal("dashboardModal");
  document.getElementById("signupForm").onsubmit = handleSignUp;
  document.getElementById("signinForm").onsubmit = handleSignIn;
  document.getElementById("startExploring").onclick = () => document.getElementById("intro").scrollIntoView({ behavior: "smooth" });

  // --- Footer External Links (Edit this section for your URLs) ---
  // This code is separated for easy editing. Update the URLs below as needed.
  const externalLinks = {
    github: "https://github.com", // <-- Edit this
    linkedin: "https://linkedin.com", // <-- Edit this
    fiverr: "https://fiverr.com", // <-- Edit this
    website: "https://yourwebsite.com" // <-- Edit this
  };
  document.querySelectorAll('footer a[aria-label]').forEach(a => {
    const label = a.getAttribute('aria-label').toLowerCase();
    if (externalLinks[label]) a.href = externalLinks[label];
  });

  // FIXED Persistence: Subtle banner if stored user (bottom-right, 1-day timeout)
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    const now = Date.now();
    const lastLogin = new Date(user.lastLogin).getTime();
    const oneDay = 24 * 60 * 60 * 1000;  // 1 day in ms
    if (now - lastLogin < oneDay) {  // Show only if recent
      const banner = document.createElement('div');
      banner.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 shadow-lg text-sm opacity-0 transition-opacity duration-300';  // UPDATED: Bottom-right, fade
      banner.innerHTML = `Welcome back, ${user.username}! <button class="ml-2 px-2 py-1 bg-white text-blue-600 rounded text-xs" onclick="showDashboard(${JSON.stringify(user)});this.parentElement.style.opacity=0;setTimeout(()=>this.parentElement.remove(),300);">Continue</button> <button class="ml-1 px-2 py-1 bg-transparent border border-white text-white rounded text-xs" onclick="localStorage.removeItem('user');this.parentElement.style.opacity=0;setTimeout(()=>this.parentElement.remove(),300);">Logout</button>`;
      document.body.appendChild(banner);
      setTimeout(() => banner.style.opacity = '1', 100);  // Fade in after 100ms
      setTimeout(() => banner.remove(), 10000);  // Auto-hide
    } else {
      localStorage.removeItem('user');  // Clear old sessions
    }
  }
  window.redirectToTree = redirectToTree;
});