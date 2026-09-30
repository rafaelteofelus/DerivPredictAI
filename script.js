const STORAGE_KEYS = {
  premium: "derivpredictai-premium",
  user: "derivpredictai-user",
  authMode: "derivpredictai-auth-mode",
  plan: "derivpredictai-plan",
};

const appConfig = {
  mode: "demo",
  realAuthConfigured: false,
  realAuthProvider: "Supabase / Firebase",
};

const planNames = {
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
};

// These are demo Stripe test links. Replace them with your own Stripe Payment Links
// from Stripe Dashboard when you are ready to accept real payments.
const planUrls = {
  starter: "https://buy.stripe.com/test_00g4jF6mJcOQ4M83cc",
  pro: "https://buy.stripe.com/test_14k4jF8K1aU4E2s9aa",
  elite: "https://buy.stripe.com/test_5kA4jF3PL7B0C4Q8ac",
};

function safeRead(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    console.warn(`Could not read ${key}:`, error);
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Could not write ${key}:`, error);
    return false;
  }
}

function getStoredMode() {
  return safeRead(STORAGE_KEYS.authMode, "demo");
}

function setAuthMode(mode) {
  const normalized = mode === "real" ? "real" : "demo";
  appConfig.mode = normalized;
  safeWrite(STORAGE_KEYS.authMode, normalized);

  document.querySelectorAll(".mode-btn").forEach((button) => {
    const active = button.dataset.mode === normalized;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const providerText = document.getElementById("providerStatus");
  if (providerText) {
    providerText.textContent =
      normalized === "real"
        ? appConfig.realAuthConfigured
          ? `${appConfig.realAuthProvider} connected`
          : `${appConfig.realAuthProvider} not connected yet`
        : "Demo authentication enabled";
  }

  const authModeText = document.getElementById("authModeText");
  if (authModeText) {
    authModeText.textContent =
      normalized === "real"
        ? "Real auth mode is ready for Supabase/Firebase configuration."
        : "Demo login: any valid email/password works";
  }
}

function setPremiumState(isPremium) {
  safeWrite(STORAGE_KEYS.premium, String(isPremium));

  const premiumPanel = document.getElementById("premiumPanel");
  const premiumLock = document.getElementById("premiumLock");
  if (premiumPanel && premiumLock) {
    premiumPanel.classList.toggle("hidden", !isPremium);
    premiumLock.classList.toggle("hidden", isPremium);
  }
}

function updateUserBadge() {
  const badge = document.getElementById("userBadge");
  const logoutBtn = document.getElementById("logoutBtn");

  let user = null;
  try {
    user = JSON.parse(safeRead(STORAGE_KEYS.user, "null"));
  } catch (error) {
    console.warn("Could not parse stored user:", error);
  }

  const loggedIn = !!user && !!user.loggedIn;

  if (badge) {
    badge.textContent = loggedIn ? `Signed in as ${user.email}` : "Not signed in";
    badge.classList.toggle("hidden", !loggedIn);
  }

  if (logoutBtn) {
    logoutBtn.classList.toggle("hidden", !loggedIn);
  }
}

function showMessage(message) {
  let notice = document.getElementById("siteNotice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "siteNotice";
    notice.setAttribute("role", "status");
    notice.style.cssText =
      "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1000;max-width:calc(100% - 32px);padding:14px 18px;border-radius:12px;background:#102a43;color:#eff6ff;border:1px solid #60a5fa;box-shadow:0 12px 30px rgba(0,0,0,.3);text-align:center;";
    document.body.appendChild(notice);
  }

  notice.textContent = message;
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => {
    if (notice && notice.parentNode) notice.remove();
  }, 5000);
}

function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("hidden");
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.add("hidden");
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.user);
  setPremiumState(false);
  updateUserBadge();
  showMessage("You have been logged out.");
}

function handleDemoLogin(email, password) {
  if (!email || !password) {
    showMessage("Enter both your email and password.");
    return false;
  }

  const user = { email, loggedIn: true };
  safeWrite(STORAGE_KEYS.user, JSON.stringify(user));
  setPremiumState(true);
  updateUserBadge();
  return true;
}

async function handleRealLogin(email, password) {
  if (!appConfig.realAuthConfigured) {
    showMessage("Real auth is not configured yet. Connect Firebase or Supabase first.");
    return false;
  }

  if (window.realAuthLogin && typeof window.realAuthLogin === "function") {
    const result = await window.realAuthLogin(email, password);
    if (result && result.success) {
      safeWrite(STORAGE_KEYS.user, JSON.stringify({ email, loggedIn: true }));
      setPremiumState(true);
      updateUserBadge();
      return true;
    }

    showMessage(result && result.message ? result.message : "Real login failed.");
    return false;
  }

  showMessage("Real auth provider hook is missing. Add your Firebase/Supabase integration.");
  return false;
}

function openCheckout(plan) {
  const name = planNames[plan];
  if (!name) {
    showMessage("Please choose a valid plan.");
    return;
  }

  const url = planUrls[plan];
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  safeWrite(STORAGE_KEYS.plan, plan);
  setPremiumState(true);
  showMessage(`${name} selected in demo mode. Connect a real Stripe Payment Link before charging customers.`);
}

function init() {
  const currentMode = getStoredMode();
  setAuthMode(currentMode);

  const savedPremium = safeRead(STORAGE_KEYS.premium, "false");
  setPremiumState(savedPremium === "true");
  updateUserBadge();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const demoUnlockBtn = document.getElementById("demoUnlock");
  if (demoUnlockBtn) {
    demoUnlockBtn.addEventListener("click", () => {
      setPremiumState(true);
      updateUserBadge();
      showMessage("Premium demo access enabled.");
    });
  }

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", openLoginModal);
  }

  const closeLoginBtn = document.getElementById("closeLoginModal");
  if (closeLoginBtn) {
    closeLoginBtn.addEventListener("click", closeLoginModal);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  document.querySelectorAll(".mode-btn").forEach((button) => {
    button.addEventListener("click", () => {
      setAuthMode(button.dataset.mode || "demo");
    });
  });

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email")?.value.trim() || "";
      const password = document.getElementById("password")?.value || "";

      let success = false;
      if (appConfig.mode === "real") {
        success = await handleRealLogin(email, password);
      } else {
        success = handleDemoLogin(email, password);
      }

      if (!success) return;

      closeLoginModal();
      loginForm.reset();
      showMessage(
        appConfig.mode === "real"
          ? `Welcome, ${email}. Real auth flow is ready.`
          : `Welcome, ${email}. Demo login successful.`
      );
    });
  }

  const loginModal = document.getElementById("loginModal");
  if (loginModal) {
    loginModal.addEventListener("click", (event) => {
      if (event.target === loginModal) closeLoginModal();
    });
  }

  document.querySelectorAll("[data-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      openCheckout(button.dataset.plan);
    });
  });
}

init();
