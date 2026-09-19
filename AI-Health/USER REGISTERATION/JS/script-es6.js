/* ============================================================
   script-es6.js — Phase 2: ES6 Class Syntax
   ============================================================
   This file refactors Phase 1's constructor + prototype
   pattern into a modern ES6 CLASS.

   Key differences from Phase 1:
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 1               │ Phase 2                         │
   │──────────────────────-│─────────────────────────────────│
   │ function UserValidator│ class Validator { }             │
   │ UserValidator.prototype│ Methods inside class body      │
   │ var, function(){}     │ let, const, arrow functions     │
   │ No default params     │ Default parameter values        │
   └───────────────────────┴─────────────────────────────────┘

   The validation LOGIC is identical — only the syntax changes.
   ============================================================ */


/* ----------------------------------------------------------
   1. ES6 CLASS DEFINITION
   class is syntactic sugar over the constructor + prototype
   pattern. Under the hood JavaScript still uses prototypes.
   ---------------------------------------------------------- */

class Validator {

  /**
   * constructor()
   * Called automatically when you do:  new Validator(...)
   * Equivalent to Phase 1's function UserValidator(...) { this.x = x }
   */
  constructor(name, email, password, confirmPassword) {
    // Trim whitespace from string inputs
    this.name            = name.trim();
    this.email           = email.trim();
    this.password        = password;
    this.confirmPassword = confirmPassword;
  }


  /* --------------------------------------------------------
     2. CLASS METHODS
     No need for Validator.prototype.method = function().
     Methods are declared directly inside the class body.
     -------------------------------------------------------- */

  /**
   * validateName()
   * Minimum 3 characters; letters, spaces, hyphens only.
   */
  validateName() {
    if (this.name.length === 0) {
      return { valid: false, message: '✗ Full name is required.' };
    }
    if (this.name.length < 3) {
      return { valid: false, message: '✗ Name must be at least 3 characters.' };
    }
    const namePattern = /^[a-zA-Z\s'\-]+$/;
    if (!namePattern.test(this.name)) {
      return { valid: false, message: '✗ Name may only contain letters, spaces, or hyphens.' };
    }
    return { valid: true, message: '✓ Looks good!' };
  }


  /**
   * validateEmail()
   * Must match standard  user@domain.tld  format.
   */
  validateEmail() {
    if (this.email.length === 0) {
      return { valid: false, message: '✗ Email address is required.' };
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      return { valid: false, message: '✗ Please enter a valid email (e.g. jane@example.com).' };
    }
    return { valid: true, message: '✓ Valid email address.' };
  }


  /**
   * validatePassword()
   * Minimum 6 characters, at least one letter, one number.
   */
  validatePassword() {
    if (this.password.length === 0) {
      return { valid: false, message: '✗ Password is required.' };
    }
    if (this.password.length < 6) {
      return { valid: false, message: '✗ Password must be at least 6 characters.' };
    }
    const hasLetter = /[a-zA-Z]/.test(this.password);
    const hasNumber = /[0-9]/.test(this.password);
    if (!hasLetter) {
      return { valid: false, message: '✗ Password must include at least one letter.' };
    }
    if (!hasNumber) {
      return { valid: false, message: '✗ Password must include at least one number.' };
    }
    return { valid: true, message: '✓ Strong password!' };
  }


  /**
   * validateConfirmPassword()
   * Must exactly match this.password.
   */
  validateConfirmPassword() {
    if (this.confirmPassword.length === 0) {
      return { valid: false, message: '✗ Please confirm your password.' };
    }
    if (this.password !== this.confirmPassword) {
      return { valid: false, message: '✗ Passwords do not match.' };
    }
    return { valid: true, message: '✓ Passwords match!' };
  }


  /**
   * validateAll()
   * Convenience method: run all validations at once.
   * Returns an object with results for each field.
   */
  validateAll() {
    return {
      name:     this.validateName(),
      email:    this.validateEmail(),
      password: this.validatePassword(),
      confirm:  this.validateConfirmPassword()
    };
  }


  /* --------------------------------------------------------
     3. STATIC METHOD
     Static methods belong to the CLASS itself, not instances.
     Call it as  Validator.getStrength(pw)  — not  obj.getStrength()
     This is a new concept not easily replicated in Phase 1.
     -------------------------------------------------------- */

  static getStrength(password) {
    let score = 0;
    if (password.length === 0) return { level: '', label: '', pct: 0 };

    if (password.length >= 6)  score++;
    if (password.length >= 10) score++;
    if (password.length >= 14) score++;

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password))  score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak',   label: 'Weak',   pct: 25  };
    if (score <= 3) return { level: 'fair',   label: 'Fair',   pct: 50  };
    if (score <= 4) return { level: 'good',   label: 'Good',   pct: 75  };
    return           { level: 'strong', label: 'Strong', pct: 100 };
  }

} // end class Validator


/* ----------------------------------------------------------
   4. ES6 REAL-TIME VALIDATION (arrow functions + const/let)
   This section is the ES6 equivalent of Phase 1's event
   listeners. Logic is the same — syntax is modern.

   We only wire up the listeners when Phase 2 is active.
   ---------------------------------------------------------- */

// Validity tracker — uses let because it gets reassigned on phase switch
let es6FieldValidity = { name: false, email: false, password: false, confirm: false };

/* ---- Helper: show a validation message ---- */
const es6ShowMessage = (msgId, inputId, result) => {
  const msgEl   = document.getElementById(msgId);
  const inputEl = document.getElementById(inputId);

  msgEl.textContent = result.message;
  msgEl.classList.remove('success', 'error');
  msgEl.classList.add('show', result.valid ? 'success' : 'error');

  inputEl.classList.remove('valid', 'invalid');
  inputEl.classList.add(result.valid ? 'valid' : 'invalid');
};

/* ---- Helper: clear a field's feedback ---- */
const es6ClearMessage = (msgId, inputId) => {
  const msgEl   = document.getElementById(msgId);
  const inputEl = document.getElementById(inputId);
  msgEl.textContent = '';
  msgEl.classList.remove('show', 'success', 'error');
  inputEl.classList.remove('valid', 'invalid');
};

/* ---- Helper: update the password strength bar ---- */
const es6UpdateStrength = (password) => {
  const fill   = document.getElementById('strengthFill');
  const label  = document.getElementById('strengthLabel');
  // Use the static method on the class
  const result = Validator.getStrength(password);

  fill.style.width = ${result.pct}%;
  fill.classList.remove('weak', 'fair', 'good', 'strong');

  if (result.level) {
    fill.classList.add(result.level);
    label.textContent = result.label;
    const colours = { weak: '#d94040', fair: '#f0a500', good: '#4caf78', strong: '#2a9d5c' };
    label.style.color = colours[result.level];
  } else {
    label.textContent  = '';
    label.style.color  = '';
  }
};

/* ---- Helper: enable / disable the submit button ---- */
const es6UpdateSubmit = () => {
  const btn = document.getElementById('submitBtn');
  const allValid = Object.values(es6FieldValidity).every(Boolean);
  btn.disabled = !allValid;
};


/* ----------------------------------------------------------
   5. ATTACH ES6 LISTENERS
   We use a named function so we can re-call it when the user
   switches from Phase 1 → Phase 2 (phase switcher in script.js
   resets the form and we re-attach).
   ---------------------------------------------------------- */

function attachES6Listeners() {

  // --- Full Name ---
  const nameInput = document.getElementById('fullName');
  nameInput.addEventListener('input', function () {
    if (this.value.trim() === '') {
      es6ClearMessage('msg-name', 'fullName');
      es6FieldValidity.name = false;
    } else {
      // Create a temporary Validator just to check one field
      const v      = new Validator(this.value, 'a@b.com', 'abc123', 'abc123');
      const result = v.validateName();
      es6ShowMessage('msg-name', 'fullName', result);
      es6FieldValidity.name = result.valid;
    }
    es6UpdateSubmit();
  });

  // --- Email ---
  document.getElementById('email').addEventListener('input', function () {
    if (this.value.trim() === '') {
      es6ClearMessage('msg-email', 'email');
      es6FieldValidity.email = false;
    } else {
      const v      = new Validator('Jane', this.value, 'abc123', 'abc123');
      const result = v.validateEmail();
      es6ShowMessage('msg-email', 'email', result);
      es6FieldValidity.email = result.valid;
    }
    es6UpdateSubmit();
  });

  // --- Password ---
  document.getElementById('password').addEventListener('input', function () {
    const val = this.value;
    es6UpdateStrength(val);

    if (val === '') {
      es6ClearMessage('msg-password', 'password');
      es6FieldValidity.password = false;
    } else {
      const v      = new Validator('Jane', 'a@b.com', val, 'abc123');
      const result = v.validatePassword();
      es6ShowMessage('msg-password', 'password', result);
      es6FieldValidity.password = result.valid;
    }

    // Also re-check confirm field if it already has a value
    const confirmVal = document.getElementById('confirmPassword').value;
    if (confirmVal !== '') {
      const v2      = new Validator('Jane', 'a@b.com', val, confirmVal);
      const result2 = v2.validateConfirmPassword();
      es6ShowMessage('msg-confirm', 'confirmPassword', result2);
      es6FieldValidity.confirm = result2.valid;
    }

    es6UpdateSubmit();
  });

  // --- Confirm Password ---
  document.getElementById('confirmPassword').addEventListener('input', function () {
    const pwVal = document.getElementById('password').value;
    if (this.value === '') {
      es6ClearMessage('msg-confirm', 'confirmPassword');
      es6FieldValidity.confirm = false;
    } else {
      const v      = new Validator('Jane', 'a@b.com', pwVal, this.value);
      const result = v.validateConfirmPassword();
      es6ShowMessage('msg-confirm', 'confirmPassword', result);
      es6FieldValidity.confirm = result.valid;
    }
    es6UpdateSubmit();
  });

  // --- Form Submit ---
  document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name     = document.getElementById('fullName').value;
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirmPassword').value;

    // Instantiate the ES6 class
    const validator = new Validator(name, email, password, confirm);
    const results   = validator.validateAll();

    es6ShowMessage('msg-name',     'fullName',        results.name);
    es6ShowMessage('msg-email',    'email',           results.email);
    es6ShowMessage('msg-password', 'password',        results.password);
    es6ShowMessage('msg-confirm',  'confirmPassword', results.confirm);

    const allValid = Object.values(results).every(r => r.valid);
    const feedback = document.getElementById('formFeedback');

    if (allValid) {
      feedback.className   = 'form-feedback success';
      feedback.textContent = 🎉 Account created successfully! Welcome, ${name.split(' ')[0]}!;
    } else {
      feedback.className   = 'form-feedback error';
      feedback.textContent = '⚠ Please fix the errors above before submitting.';
    }
  });

} // end attachES6Listeners


/* ----------------------------------------------------------
   6. PHASE SWITCHER — Override the one defined in script.js
   When Phase 2 is selected, we re-wire the listeners using
   ES6 versions so the class-based logic kicks in.
   ---------------------------------------------------------- */

// Store reference to Phase 1's switchPhase before overriding
const _phase1SwitchPhase = window.switchPhase;

window.switchPhase = function (phase) {
  // Call Phase 1's switcher first (it handles UI reset)
  _phase1SwitchPhase(phase);

  // Reset ES6 validity tracker
  es6FieldValidity = { name: false, email: false, password: false, confirm: false };

  if (phase === 'phase2') {
    // Re-attach ES6 event listeners (form was just reset, old listeners removed on new elements? 
    // Actually the same DOM nodes persist, so we need to replace them cleanly.
    // Strategy: clone each input to strip all old listeners, then re-attach ES6 ones.
    replaceInputsAndAttach();
  } else {
    // Phase 1: clone inputs to strip ES6 listeners, then re-attach Phase 1 ones
    replaceInputsAndAttachPhase1();
  }
};


/**
 * replaceInputsAndAttach()
 * Clones each input element to remove all previous event listeners,
 * then calls attachES6Listeners() for a clean slate.
 */
function replaceInputsAndAttach() {
  cloneInputs();
  attachES6Listeners();
}

function replaceInputsAndAttachPhase1() {
  cloneInputs();
  attachPhase1Listeners();
}

/**
 * cloneInputs()
 * Replaces each input with a fresh clone (same attributes, no listeners).
 */
function cloneInputs() {
  ['fullName', 'email', 'password', 'confirmPassword'].forEach(id => {
    const old   = document.getElementById(id);
    const fresh = old.cloneNode(true);   // deep=true copies attributes
    old.parentNode.replaceChild(fresh, old);
  });

  // Re-wire the show/hide toggles after clone (they look up input by ID so they still work)
  rewirePasswordToggles();
}

function rewirePasswordToggles() {
  document.getElementById('togglePw').onclick = function () {
    const input = document.getElementById('password');
    const icon  = document.getElementById('eyeIcon');
    if (input.type === 'password') { input.type = 'text';     icon.textContent = '🙈'; }
    else                           { input.type = 'password'; icon.textContent = '👁'; }
  };
  document.getElementById('toggleConfirm').onclick = function () {
    const input = document.getElementById('confirmPassword');
    const icon  = document.getElementById('eyeIconConfirm');
    if (input.type === 'password') { input.type = 'text';     icon.textContent = '🙈'; }
    else                           { input.type = 'password'; icon.textContent = '👁'; }
  };
}

/**
 * attachPhase1Listeners()
 * Re-attaches the Phase 1 (constructor/prototype) listeners
 * after inputs have been cloned.
 */
function attachPhase1Listeners() {
  // Reset Phase 1's validity tracker
  fieldValidity = { name: false, email: false, password: false, confirm: false };

  document.getElementById('fullName').addEventListener('input', function () {
    if (this.value.trim() === '') {
      clearMessage('msg-name', 'fullName'); fieldValidity.name = false;
    } else {
      var v = new UserValidator(this.value, 'a@b.com', 'abc123', 'abc123');
      var r = v.validateName();
      showMessage('msg-name', 'fullName', r); fieldValidity.name = r.valid;
    }
    updateSubmitButton();
  });

  document.getElementById('email').addEventListener('input', function () {
    if (this.value.trim() === '') {
      clearMessage('msg-email', 'email'); fieldValidity.email = false;
    } else {
      var v = new UserValidator('Jane', this.value, 'abc123', 'abc123');
      var r = v.validateEmail();
      showMessage('msg-email', 'email', r); fieldValidity.email = r.valid;
    }
    updateSubmitButton();
  });

  document.getElementById('password').addEventListener('input', function () {
    updateStrengthBar(this.value);
    if (this.value === '') {
      clearMessage('msg-password', 'password'); fieldValidity.password = false;
    } else {
      var v = new UserValidator('Jane', 'a@b.com', this.value, 'abc123');
      var r = v.validatePassword();
      showMessage('msg-password', 'password', r); fieldValidity.password = r.valid;
    }
    var cv = document.getElementById('confirmPassword').value;
    if (cv !== '') {
      var v2 = new UserValidator('Jane','a@b.com',this.value,cv);
      var r2 = v2.validateConfirmPassword();
      showMessage('msg-confirm','confirmPassword',r2); fieldValidity.confirm = r2.valid;
    }
    updateSubmitButton();
  });

  document.getElementById('confirmPassword').addEventListener('input', function () {
    var pw = document.getElementById('password').value;
    if (this.value === '') {
      clearMessage('msg-confirm','confirmPassword'); fieldValidity.confirm = false;
    } else {
      var v = new UserValidator('Jane','a@b.com',pw,this.value);
      var r = v.validateConfirmPassword();
      showMessage('msg-confirm','confirmPassword',r); fieldValidity.confirm = r.valid;
    }
    updateSubmitButton();
  });

  document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var name=document.getElementById('fullName').value,
        email=document.getElementById('email').value,
        pw=document.getElementById('password').value,
        conf=document.getElementById('confirmPassword').value;
    var validator=new UserValidator(name,email,pw,conf), results=validator.validateAll();
    showMessage('msg-name','fullName',results.name);
    showMessage('msg-email','email',results.email);
    showMessage('msg-password','password',results.password);
    showMessage('msg-confirm','confirmPassword',results.confirm);
    var ok=results.name.valid&&results.email.valid&&results.password.valid&&results.confirm.valid;
    var fb=document.getElementById('formFeedback');
    if(ok){fb.className='form-feedback success';fb.textContent='🎉 Account created successfully! Welcome, '+name.split(' ')[0]+'!';}
    else{fb.className='form-feedback error';fb.textContent='⚠ Please fix the errors above before submitting.';}
  });
}