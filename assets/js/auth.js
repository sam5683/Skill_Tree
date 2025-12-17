/* ==========================================================
   auth.js — SkillTree (Final Production-ready)
   - Option 1 strength meter (progressive)
   - Centered single eye toggles
   - Username format: letter-first, letters+digits, ends #2000-9999
   - Email suggestions include yahoo.co.in
   - Preserves existing flows (register/login endpoints)
   ========================================================= */

(() => {
  "use strict";

  // Lightweight selectors
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const API_BASE = "http://127.0.0.1:8000/api/v1";
  const signinModal = $("#signinModal");
  const signupModal = $("#signupModal");
  const cursorEl = $("#cursorWhiteHole");

  const EMAIL_DOMAINS = [
    "@gmail.com",
    "@yahoo.com",
    "@yahoo.co.in",
    "@outlook.com",
    "@hotmail.com",
    "@icloud.com",
    "@proton.me"
  ];

  // Open modal handlers
  document.getElementById("signinButton").addEventListener("click", () => openModal("signin"));
  document.getElementById("signupButton").addEventListener("click", () => openModal("signup"));

  function openModal(type) {
    document.body.classList.add("auth-open");
    if (cursorEl) cursorEl.style.opacity = 0;

    if (type === "signin") {
      signinModal.innerHTML = renderSignin();
      signinModal.classList.remove("hidden");
      setupSignin();
    } else {
      signupModal.innerHTML = renderSignup();
      signupModal.classList.remove("hidden");
      setupSignup();
    }
  }

  function closeAll() {
    document.body.classList.remove("auth-open");
    if (cursorEl) cursorEl.style.opacity = 1;
    signinModal.classList.add("hidden");
    signupModal.classList.add("hidden");
    signinModal.innerHTML = "";
    signupModal.innerHTML = "";
  }

  window.addEventListener("click", e => {
    if (e.target === signinModal || e.target === signupModal) closeAll();
  });

  window.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAll();
  });

  /* ------------------------------
     UI templates
     (kept minimal & stable)
  ------------------------------ */
  function renderSignin() {
    return `
      <div class="auth-card">
        <button class="auth-close" id="xSignIn">✕</button>
        <h2 class="auth-title">Sign in</h2>

        <div class="auth-group">
          <label>Email</label>
          <input id="loginEmail" type="email" placeholder="your@email.com" autocomplete="email">
          <div class="email-suggest" id="loginEmailSuggest"></div>
          <div class="field-error" id="loginEmailError"></div>
        </div>

        <div class="auth-group">
          <label>Password</label>
          <div style="position:relative;">
            <input id="loginPassword" type="password" placeholder="Your password" autocomplete="current-password" style="width:100%; padding-right:44px;">
            <button class="eye-btn" id="loginEye" aria-label="toggle password" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; z-index:10;">👁</button>
          </div>
          <div class="field-error" id="loginPwError"></div>
        </div>

        <button class="auth-submit" id="loginBtn">Sign in</button>

        <div class="auth-divider"><span>or</span></div>

        <button class="google-btn">
          <img src="assets/images/google.svg"> Continue with Google
        </button>

        <div class="auth-switch mt-2">
          <a href="#" id="goToSignup">Create an account</a>
        </div>
      </div>
    `;
  }

  function renderSignup() {
    return `
      <div class="auth-card">
        <button class="auth-close" id="xSignUp">✕</button>
        <h2 class="auth-title">Create account</h2>

        <div class="auth-group">
          <label>Full name</label>
          <input id="fullName" type="text" placeholder="Your full name" autocomplete="name">
          <div class="field-error" id="fullNameErr"></div>
        </div>

        <div class="auth-group">
          <label>Username</label>
          <div class="username-suggestion">
            Your username will be: <b id="usernamePreview">—</b>
          </div>
        </div>

        <div class="auth-group">
          <label>Email</label>
          <input id="regEmail" type="email" placeholder="your@email.com" autocomplete="email">
          <div class="email-suggest" id="regEmailSuggest"></div>
          <div class="field-error" id="regEmailErr"></div>
        </div>

        <div class="auth-group">
          <label>Date of birth</label>
          <input id="dob" type="text" placeholder="Select your birth date" readonly>
          <div class="field-error" id="dobErr"></div>
        </div>

        <div class="auth-group password-group">
          <label>Password</label>
          <div style="position:relative;">
            <input id="regPassword" type="password" placeholder="Choose a strong password" autocomplete="new-password" style="width:100%; padding-right:44px;">
            <button class="eye-btn" id="regPwEye" aria-label="toggle password" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; z-index:10;">👁</button>
          </div>

          <div class="pw-dots" id="pwDots" style="display:flex; gap:8px; margin-top:8px;">
            <div class="pw-dot" id="pwDot1" title="Start typing" style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.18)"></div>
            <div class="pw-dot" id="pwDot2" title="Lowercase" style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.18)"></div>
            <div class="pw-dot" id="pwDot3" title="Uppercase" style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.18)"></div>
            <div class="pw-dot" id="pwDot4" title="Number" style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.18)"></div>
            <div class="pw-dot" id="pwDot5" title="Symbol & length" style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.18)"></div>
          </div>

          <div class="field-note" id="pwRule" style="margin-top:8px;font-size:0.92rem;color:rgba(255,255,255,0.75);">
            Must contain: a–z, A–Z, 0–9, symbol (e.g. !@#), and at least 8 characters
          </div>
        </div>

        <div class="auth-group password-group">
          <label>Confirm password</label>
          <div style="position:relative;">
            <input id="regPassword2" type="password" placeholder="Re-enter password" autocomplete="new-password" style="width:100%; padding-right:44px;">
            <button class="eye-btn" id="regPwEye2" aria-label="toggle confirm password" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; z-index:10;">👁</button>
          </div>
          <div class="field-error" id="pwMatchErr"></div>
        </div>

        <button class="auth-submit" id="signupBtn">Create account</button>

        <div class="auth-divider"><span>or</span></div>

        <button class="google-btn">
          <img src="assets/images/google.svg"> Sign up with Google
        </button>
      </div>
    `;
  }

  /* ------------------------------
     Email suggestion helper
  ------------------------------ */
  function setupEmailSuggestions(input, suggestionBox) {
    input.addEventListener("input", () => {
      const val = input.value.trim();
      const at = val.indexOf("@");

      if (!val) {
        suggestionBox.innerHTML = "";
        return;
      }

      if (at === -1) {
        suggestionBox.innerHTML = EMAIL_DOMAINS
          .map(d => `<div class="email-opt" role="button" tabindex="0">${val}${d}</div>`)
          .join("");
      } else {
        const prefix = val.slice(0, at);
        const needle = val.slice(at);
        suggestionBox.innerHTML = EMAIL_DOMAINS
          .filter(d => d.includes(needle))
          .map(d => `<div class="email-opt" role="button" tabindex="0">${prefix}${d}</div>`)
          .join("");
      }

      $$(".email-opt", suggestionBox).forEach(opt => {
        opt.addEventListener("click", () => {
          input.value = opt.textContent;
          suggestionBox.innerHTML = "";
        });
        opt.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            input.value = opt.textContent;
            suggestionBox.innerHTML = "";
          }
        });
      });
    });
  }

  /* ------------------------------
     Signin setup
  ------------------------------ */
  function setupSignin() {
    $("#xSignIn").addEventListener("click", closeAll);
    $("#goToSignup").addEventListener("click", e => {
      e.preventDefault();
      closeAll();
      openModal("signup");
    });

    const email = $("#loginEmail");
    const emailErr = $("#loginEmailError");
    const pw = $("#loginPassword");
    const pwErr = $("#loginPwError");

    setupEmailSuggestions(email, $("#loginEmailSuggest"));

    // toggle eye for signin
    const loginEye = $("#loginEye");
    if (loginEye) {
      loginEye.addEventListener("click", () => {
        const isPw = pw.type === "password";
        pw.type = isPw ? "text" : "password";
        loginEye.textContent = isPw ? "🙈" : "👁";
      });
    }

    $("#loginBtn").addEventListener("click", async () => {
      emailErr.textContent = "";
      pwErr.textContent = "";

      if (!/^\S+@\S+\.\S+$/.test(email.value)) {
        emailErr.textContent = "Enter a valid email";
        return;
      }

      if (pw.value.length < 8) {
        pwErr.textContent = "Password too short";
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.value, password: pw.value })
        });

        if (!res.ok) {
          pwErr.textContent = "Invalid credentials";
          return;
        }
        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        window.location.href = "dashboard.html";

      } catch (err) {
        pwErr.textContent = "Network error";
      }
    });
  }

  /* ------------------------------
     Signup setup - core improvements
  ------------------------------ */
  function setupSignup() {
    $("#xSignUp").addEventListener("click", closeAll);

    const fullName = $("#fullName");
    const fullNameErr = $("#fullNameErr");

    const email = $("#regEmail");
    const emailErr = $("#regEmailErr");
    setupEmailSuggestions(email, $("#regEmailSuggest"));

    const pw = $("#regPassword");
    const pw2 = $("#regPassword2");
    const pwMatch = $("#pwMatchErr");

    const dot1 = $("#pwDot1");
    const dot2 = $("#pwDot2");
    const dot3 = $("#pwDot3");
    const dot4 = $("#pwDot4");
    const dot5 = $("#pwDot5");

    const usernamePreview = $("#usernamePreview");
    const pwRuleText = $("#pwRule"); // we used id pwRule in template

    // Username auto-generation (letter-first, rest letters+digits)
    fullName.addEventListener("input", () => {
      const raw = fullName.value.trim();
      if (!raw) {
        usernamePreview.textContent = "—";
        return;
      }

      // take first token
      const firstToken = raw.split(/\s+/)[0];

      // remove invalid chars, keep letters+digits; ensure lowercase
      let base = firstToken.toLowerCase().replace(/[^a-z0-9]/g, "");

      // ensure first character is a letter
      if (!/^[a-z]/.test(base)) {
        base = base.replace(/^[^a-z]+/, ""); // strip leading non-letters
      }

      if (!base) {
        usernamePreview.textContent = "—";
        return;
      }

      // final suffix 2000-9999 (2000+ reserved as non-premium)
      const num = Math.floor(Math.random() * (9999 - 2000 + 1)) + 2000;
      usernamePreview.textContent = `${base}#${num}`;
    });

    // ------------------------------
    // Progressive strength meter (Option 1)
    // - Visual: 5 dots (progressive)
    // - Logical rules: lower, upper, number, symbol, length >= 8
    // - Visual logic: visualCount = number of rules satisfied (capped to 5)
    //   BUT first dot lights if user typed anything (for feedback)
    // ------------------------------
    function updatePwDots(value) {
      const hasLower = /[a-z]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasNum = /[0-9]/.test(value);
      const hasSym = /[^A-Za-z0-9]/.test(value);
      const hasLen = value.length >= 8;

      // Count satisfied "rule" buckets
      // (we count the 5 rule buckets; length is included as a rule)
      let rulesSatisfied =
        (hasLower ? 1 : 0) +
        (hasUpper ? 1 : 0) +
        (hasNum ? 1 : 0) +
        (hasSym ? 1 : 0) +
        (hasLen ? 1 : 0);

      // If user typed something but satisfied 0 rules, still show first dot
      let visualCount = rulesSatisfied;
      if (value.length > 0 && visualCount === 0) visualCount = 1;

      // Cap to 5
      if (visualCount > 5) visualCount = 5;

      // Apply classes (ordered fill)
      dot1.classList.toggle("on", visualCount >= 1);
      dot2.classList.toggle("on", visualCount >= 2);
      dot3.classList.toggle("on", visualCount >= 3);
      dot4.classList.toggle("on", visualCount >= 4);
      dot5.classList.toggle("on", visualCount >= 5);

      // Dot style when active (applies to class .on in your CSS)
      // We don't set style here because CSS handles .pw-dot.on

      // Update rule text
      if (hasLower && hasUpper && hasNum && hasSym && hasLen) {
        pwRuleText.textContent = "Strong password ✔";
        pwRuleText.style.color = "rgba(86, 239, 169, 1)";
      } else {
        pwRuleText.textContent =
          "Must contain: a–z, A–Z, 0–9, symbol (!@#), and minimum 8 characters";
        pwRuleText.style.color = "rgba(255,255,255,0.75)";
      }
    }

    // live listeners
    pw.addEventListener("input", (e) => {
      updatePwDots(e.target.value);
      // keep confirm mismatch updated
      pwMatch.textContent = pw2.value && pw2.value !== pw.value ? "Passwords do not match" : "";
    });

    pw2.addEventListener("input", () => {
      pwMatch.textContent = pw2.value === pw.value ? "" : "Passwords do not match";
    });

    // Eye toggles — unique, centered, with icon toggle
    const regEye = $("#regPwEye");
    const regEye2 = $("#regPwEye2");

    if (regEye) {
      regEye.addEventListener("click", () => {
        const isPw = pw.type === "password";
        pw.type = isPw ? "text" : "password";
        regEye.textContent = isPw ? "🙈" : "👁";
      });
    }
    if (regEye2) {
      regEye2.addEventListener("click", () => {
        const isPw2 = pw2.type === "password";
        pw2.type = isPw2 ? "text" : "password";
        regEye2.textContent = isPw2 ? "🙈" : "👁";
      });
    }

    // Initialize flatpickr if available
    if (window.flatpickr) {
      flatpickr("#dob", {
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        maxDate: new Date(),
        onReady: (selectedDates, dateStr, instance) => {
          // no-op; kept to preserve hook if you want calendar tweaks
        }
      });
    }

    // Signup submit
    $("#signupBtn").addEventListener("click", async () => {
      fullNameErr.textContent = "";
      emailErr.textContent = "";
      pwMatch.textContent = "";

      if (!fullName.value.trim()) {
        fullNameErr.textContent = "Full name required";
        return;
      }

      const uname = usernamePreview.textContent;
      if (!/^[a-z][a-z0-9]*#(2[0-9]{3}|[3-9][0-9]{3})$/.test(uname)) {
        alert("Invalid username format. Must start with a letter and end with #2000-9999");
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(email.value)) {
        emailErr.textContent = "Valid email required";
        return;
      }

      // Final password rule enforcement
      const val = pw.value;
      const lenOK = val.length >= 8;
      const lowerOK = /[a-z]/.test(val);
      const upperOK = /[A-Z]/.test(val);
      const numOK = /[0-9]/.test(val);
      const symOK = /[^A-Za-z0-9]/.test(val);

      if (!(lenOK && lowerOK && upperOK && numOK && symOK)) {
        pwMatch.textContent = "Password must satisfy all rules";
        return;
      }

      if (pw.value !== pw2.value) {
        pwMatch.textContent = "Passwords do not match";
        return;
      }

      const payload = {
        username: uname,
        email: email.value.trim(),
        dob: $("#dob").value,
        password: pw.value
      };

      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          return alert(d.message || "Signup failed");
        }
        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        window.location.href = "dashboard.html";

      } catch (err) {
        alert("Network error");
      }
    });
  }

  // Initialize nothing until modal opens (we only bind when modals are mounted)
  // Exports: none
})();
