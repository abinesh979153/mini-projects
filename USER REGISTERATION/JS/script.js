/* ============================================================
   script.js — Phase 1: Function Constructors & Prototypes
   ============================================================
   This file uses the OLDER JavaScript pattern:
   - Constructor functions  (function UserValidator(...) { ... })
   - Prototype methods      (UserValidator.prototype.method = ...)

   This is exactly how Object-Oriented JS worked before ES6.
   Phase 2 (script-es6.js) refactors this into an ES6 Class.
   ============================================================ */


/* ----------------------------------------------------------
   1. CONSTRUCTOR FUNCTION
   Think of this like a "blueprint" for creating validator
   objects. When called with new, this refers to the
   new object being created.
   ---------------------------------------------------------- */

function UserValidator(name, email, password, confirmPassword) {
  // Store each value as a property on the instance
  this.name            = name.trim();
  this.email           = email.trim();
  this.password        = password;
  this.confirmPassword = confirmPassword;
}


/* ----------------------------------------------------------
   2. PROTOTYPE METHODS
   We attach methods to UserValidator.prototype so that ALL
   instances share the same function in memory (efficient).
   ---------------------------------------------------------- */

/**
 * validateName()
 * Rule: at least 3 characters, letters/spaces only.
 * Returns: { valid: Boolean, message: String }
 */
UserValidator.prototype.validateName = function () {
  if (this.name.length === 0) {
    return { valid: false, message: '✗ Full name is required.' };
  }
  if (this.name.length < 3) {
    return { valid: false, message: '✗ Name must be at least 3 characters.' };
  }
  // Allow letters, spaces, hyphens, apostrophes (for names like O'Brien)
  var namePattern = /^[a-zA-Z\s'\-]+$/;
  if (!namePattern.test(this.name)) {
    return { valid: false, message: '✗ Name may only contain letters, spaces, or hyphens.' };
  }
  return { valid: true, message: '✓ Looks good!' };
};


/**
 * validateEmail()
 * Rule: must match standard email format  user@domain.tld
 */
UserValidator.prototype.validateEmail = function () {
  if (this.email.length === 0) {
    return { valid: false, message: '✗ Email address is required.' };
  }
  // Standard email regex
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(this.email)) {
    return { valid: false, message: '✗ Please enter a valid email (e.g. jane@example.com).' };
  }
  return { valid: true, message: '✓ Valid email address.' };
};


/**
 * validatePassword()
 * Rules:
 *  - At least 6 characters
 *  - Must contain at least one letter
 *  - Must contain at least one number
 */
UserValidator.prototype.validatePassword = function () {
  if (this.password.length === 0) {
    return { valid: false, message: '✗ Password is required.' };
  }
  if (this.password.length < 6) {
    return { valid: false, message: '✗ Password must be at least 6 characters.' };
  }
  var hasLetter = /[a-zA-Z]/.test(this.password);
  var hasNumber = /[0-9]/.test(this.password);
  if (!hasLetter) {
    return { valid: false, message: '✗ Password must include at least one letter.' };
  }
  if (!hasNumber) {
    return { valid: false, message: '✗ Password must include at least one number.' };
  }
  return { valid: true, message: '✓ Strong password!' };
};


/**
 * validateConfirmPassword()
 * Rule: must exactly match the original password.
 */
UserValidator.prototype.validateConfirmPassword = function () {
  if (this.confirmPassword.length === 0) {
    return { valid: false, message: '✗ Please confirm your password.' };
  }
  if (this.password !== this.confirmPassword) {
    return { valid: false, message: '✗ Passwords do not match.' };
  }
  return { valid: true, message: '✓ Passwords match!' };
};


/**
 * validateAll()
 * Runs all four validations and returns a summary object.
 */
UserValidator.prototype.validateAll = function () {
  return {
    name:    this.validateName(),
    email:   this.validateEmail(),
    password:this.validatePassword(),
    confirm: this.validateConfirmPassword()
  };
};


/* ----------------------------------------------------------
   3. PASSWORD STRENGTH HELPER (standalone utility function)
   Returns a strength level: 'weak' | 'fair' | 'good' | 'strong'
   ---------------------------------------------------------- */

function getPasswordStrength(password) {
  var score = 0;
  if (password.length === 0) return { level: '', label: '', pct: 0 };

  // Length scoring
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (password.length >= 14) score++;

  // Complexity scoring
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; // mixed case
  if (/[0-9]/.test(password))  score++;                           // number
  if (/[^a-zA-Z0-9]/.test(password)) score++;                     // special char

  if (score <= 2) return { level: 'weak',   label: 'Weak',   pct: 25  };
  if (score <= 3) return { level: 'fair',   label: 'Fair',   pct: 50  };
  if (score <= 4) return { level: 'good',   label: 'Good',   pct: 75  };
  return           { level: 'strong', label: 'Strong', pct: 100 };
}


/* ----------------------------------------------------------
   4. UI HELPER FUNCTIONS
   These manipulate the DOM to show feedback visually.
   ---------------------------------------------------------- */

/**
 * showMessage(msgId, inputId, result)
 * Applies success/error styles to an input and its message span.
 *
 * @param {string}  msgId   - The ID of the <span> for the message
 * @param {string}  inputId - The ID of the <input> field
 * @param {object}  result  - { valid: Boolean, message: String }
 */
function showMessage(msgId, inputId, result) {
  var msgEl   = document.getElementById(msgId);
  var inputEl = document.getElementById(inputId);

  // Set message text
  msgEl.textContent = result.message;

  // Toggle CSS classes on the message span
  msgEl.classList.remove('success', 'error');
  msgEl.classList.add('show');
  msgEl.classList.add(result.valid ? 'success' : 'error');

  // Toggle CSS classes on the input itself
  inputEl.classList.remove('valid', 'invalid');
  inputEl.classList.add(result.valid ? 'valid' : 'invalid');
}

/**
 * clearMessage(msgId, inputId)
 * Removes all feedback when a field is empty/untouched.
 */
function clearMessage(msgId, inputId) {
  var msgEl   = document.getElementById(msgId);
  var inputEl = document.getElementById(inputId);
  msgEl.textContent = '';
  msgEl.classList.remove('show', 'success', 'error');
  inputEl.classList.remove('valid', 'invalid');
}

/**
 * updateStrengthBar(password)
 * Updates the strength bar width, colour, and label text.
 */
function updateStrengthBar(password) {
  var fill   = document.getElementById('strengthFill');
  var label  = document.getElementById('strengthLabel');
  var result = getPasswordStrength(password);

  fill.style.width = result.pct + '%';

  // Remove old level classes
  fill.classList.remove('weak', 'fair', 'good', 'strong');

  if (result.level) {
    fill.classList.add(result.level);
    label.textContent = result.label;

    var colours = { weak: '#d94040', fair: '#f0a500', good: '#4caf78', strong: '#2a9d5c' };
    label.style.color = colours[result.level];
  } else {
    label.textContent = '';
    label.style.color = '';
  }
}


/* ----------------------------------------------------------
   5. REAL-TIME VALIDATION — Event Listeners
   We validate each field as the user types (on 'input' event).
   ---------------------------------------------------------- */

// We keep track of which fields are currently valid
var fieldValidity = { name: false, email: false, password: false, confirm: false };

// --- Full Name ---
document.getElementById('fullName').addEventListener('input', function () {
  var val = this.value;
  if (val.trim() === '') {
    clearMessage('msg-name', 'fullName');
    fieldValidity.name = false;
  } else {
    // Create a temporary validator just to check the name
    var v = new UserValidator(val, 'a@b.com', 'abc123', 'abc123');
    var result = v.validateName();
    showMessage('msg-name', 'fullName', result);
    fieldValidity.name = result.valid;
  }
  updateSubmitButton();
});

// --- Email ---
document.getElementById('email').addEventListener('input', function () {
  var val = this.value;
  if (val.trim() === '') {
    clearMessage('msg-email', 'email');
    fieldValidity.email = false;
  } else {
    var v = new UserValidator('Jane', val, 'abc123', 'abc123');
    var result = v.validateEmail();
    showMessage('msg-email', 'email', result);
    fieldValidity.email = result.valid;
  }
  updateSubmitButton();
});

// --- Password ---
document.getElementById('password').addEventListener('input', function () {
  var val = this.value;

  // Always update strength bar
  updateStrengthBar(val);

  if (val === '') {
    clearMessage('msg-password', 'password');
    fieldValidity.password = false;
  } else {
    var v = new UserValidator('Jane', 'a@b.com', val, 'abc123');
    var result = v.validatePassword();
    showMessage('msg-password', 'password', result);
    fieldValidity.password = result.valid;
  }

  // Re-validate confirm field if it already has a value
  var confirmVal = document.getElementById('confirmPassword').value;
  if (confirmVal !== '') {
    var v2 = new UserValidator('Jane', 'a@b.com', val, confirmVal);
    var result2 = v2.validateConfirmPassword();
    showMessage('msg-confirm', 'confirmPassword', result2);
    fieldValidity.confirm = result2.valid;
  }

  updateSubmitButton();
});

// --- Confirm Password ---
document.getElementById('confirmPassword').addEventListener('input', function () {
  var val     = this.value;
  var pwVal   = document.getElementById('password').value;

  if (val === '') {
    clearMessage('msg-confirm', 'confirmPassword');
    fieldValidity.confirm = false;
  } else {
    var v = new UserValidator('Jane', 'a@b.com', pwVal, val);
    var result = v.validateConfirmPassword();
    showMessage('msg-confirm', 'confirmPassword', result);
    fieldValidity.confirm = result.valid;
  }
  updateSubmitButton();
});


/* ----------------------------------------------------------
   6. SUBMIT BUTTON ENABLE/DISABLE
   Button is only enabled when ALL four fields are valid.
   ---------------------------------------------------------- */

function updateSubmitButton() {
  var btn = document.getElementById('submitBtn');
  var allValid = fieldValidity.name &&
                 fieldValidity.email &&
                 fieldValidity.password &&
                 fieldValidity.confirm;
  btn.disabled = !allValid;
}


/* ----------------------------------------------------------
   7. SHOW / HIDE PASSWORD TOGGLES
   ---------------------------------------------------------- */

document.getElementById('togglePw').addEventListener('click', function () {
  var input = document.getElementById('password');
  var icon  = document.getElementById('eyeIcon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🙈';  // eye-slash
  } else {
    input.type = 'password';
    icon.textContent = '👁';
  }
});

document.getElementById('toggleConfirm').addEventListener('click', function () {
  var input = document.getElementById('confirmPassword');
  var icon  = document.getElementById('eyeIconConfirm');
  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🙈';
  } else {
    input.type = 'password';
    icon.textContent = '👁';
  }
});


/* ----------------------------------------------------------
   8. FORM SUBMISSION HANDLER
   Runs full validation on submit as a safety net, then shows
   a success or error banner.
   ---------------------------------------------------------- */

document.getElementById('registrationForm').addEventListener('submit', function (event) {
  // Always prevent the default browser form submission
  event.preventDefault();

  var name     = document.getElementById('fullName').value;
  var email    = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  var confirm  = document.getElementById('confirmPassword').value;

  // Create a validator instance with all four values
  var validator = new UserValidator(name, email, password, confirm);
  var results   = validator.validateAll();

  // Show messages for every field
  showMessage('msg-name',     'fullName',        results.name);
  showMessage('msg-email',    'email',           results.email);
  showMessage('msg-password', 'password',        results.password);
  showMessage('msg-confirm',  'confirmPassword', results.confirm);

  // Check if everything passed
  var allValid = results.name.valid &&
                 results.email.valid &&
                 results.password.valid &&
                 results.confirm.valid;

  var feedback = document.getElementById('formFeedback');

  if (allValid) {
    feedback.className = 'form-feedback success';
    feedback.textContent = '🎉 Account created successfully! Welcome, ' + name.split(' ')[0] + '!';
  } else {
    feedback.className = 'form-feedback error';
    feedback.textContent = '⚠ Please fix the errors above before submitting.';
  }
});


/* ----------------------------------------------------------
   9. PHASE SWITCHER (shared by both phases)
   Defined here so it's available on page load.
   ---------------------------------------------------------- */

// Which phase is currently active
window.currentPhase = 'phase1';

window.switchPhase = function (phase) {
  window.currentPhase = phase;

  // Update toggle button styles
  document.getElementById('btn-phase1').classList.toggle('active', phase === 'phase1');
  document.getElementById('btn-phase2').classList.toggle('active', phase === 'phase2');

  // Update bottom indicator text
  var indicator = document.getElementById('phaseIndicator');
  if (phase === 'phase1') {
    indicator.textContent = 'Using: Phase 1 — Function Prototypes';
  } else {
    indicator.textContent = 'Using: Phase 2 — ES6 Class Syntax';
  }

  // Reset form and feedback
  document.getElementById('registrationForm').reset();
  document.getElementById('formFeedback').className = 'form-feedback';
  document.getElementById('formFeedback').textContent = '';

  // Clear all field states
  ['fullName','email','password','confirmPassword'].forEach(function(id) {
    var el = document.getElementById(id);
    el.classList.remove('valid','invalid');
    el.type = (id === 'password' || id === 'confirmPassword') ? 'password' : el.type;
  });

  // Clear messages
  ['msg-name','msg-email','msg-password','msg-confirm'].forEach(function(id) {
    var el = document.getElementById(id);
    el.textContent = '';
    el.className = 'validation-msg';
  });

  // Reset strength bar
  document.getElementById('strengthFill').style.width = '0%';
  document.getElementById('strengthFill').className = 'strength-fill';
  document.getElementById('strengthLabel').textContent = '';

  // Reset eye icons
  document.getElementById('eyeIcon').textContent = '👁';
  document.getElementById('eyeIconConfirm').textContent = '👁';

  // Reset validity tracker & button
  fieldValidity = { name: false, email: false, password: false, confirm: false };
  document.getElementById('submitBtn').disabled = true;
};