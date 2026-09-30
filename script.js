const premiumKey = "derivpredictai-premium";
const userKey = "derivpredictai-user";
const authModeKey = "derivpredictai-auth-mode";
const planKey = "derivpredictai-plan";

const appConfig = {
  mode: "demo",
  realAuthConfigured: false,
  realAuthProvider: "Supabase / Firebase",
};

const planUrls = {
  starter: "",
  pro: "",
  elite: "",
};

const planNames = {
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
};

const getStoredMode = () => {
  try {
    return localStorage.getItem(authModeKey) || "demo";
  } catch (error) {
    console.warn("Auth mode could not be read.", error);
    return "demo";
  }
};

const setAuthMode = (mode) => {
  const normalisedMode = mode === "real" ? "real" : "demo";
  appConfig.mode = normalisedMode;
  try {
    localStorage.setItem(authModeKey, normalisedMode);
  } catch (error) {
    console.warn("Auth mode could not be saved.", error);
  }

  document.querySelectorAll(".mode-btn").forEach((button) => {
    const isActive = button.dataset.mode === normalisedMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const providerText = document.getElementById("providerStatus");
  if (providerText) {
    providerText.textContent =
      normalisedMode === "real"
        ? appConfig.realAuthConfigured
          ? `${appConfig.realAuthProvider} connected`
          : `${appConfig.realAuthProvider} not connected yet`
        : "Demo authentication enabled";
  }
};

const setPremiumState = (isPremium) => {
  try {
    localStorage.setItem(premiumKey, String(isPremium));
  } catch (error) {
    console.warn("Premium state could not be saved.", error);
  }

  const premiumPanel = document.getElementById("premiumPanel");
  const premiumLock = document.getElementById("premiumLock");

  if (premiumPanel && premiumLock) {
    premiumPanel.classList.toggle("hidden", !isPremium);
    premiumLock.classList.toggle("hidden", isPremium);
  }
};

const updateUserBadge = () => {
  const badge = document.getElementById("userBadge");
  const logoutBtn = document.getElementById("logoutBtn");

  try {
    const user = JSON.parse(localStorage.getItem(userKey) || "null");
    const loggedIn = !!user?.loggedIn;

    if (badge) {
      badge.textContent = loggedIn ? `Signed in as ${user.email}` : "Not signed in";
      badge.classList.toggle("hidden", !loggedIn);
    }

    if (logoutBtn) {
      logoutBtn.classList.toggle("hidden", !loggedIn);
    }
  } catch (error) {
    console.warn("User badge could not be updated.", error);
  }
};

const initPremiumState = () => {
  let saved = "false";
  try {
    saved = localStorage.getItem(premiumKey) || "false";
  } catch (error) {
    console.warn("Premium state could not be read.", error);
  }
  setPremiumState(saved === "true");
  updateUserBadge();
};

const showMessage = (message) => {
  let notice = document.getElementById("siteNotice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "siteNotice";
    notice.setAttribute("role", "status");
    notice.style.cssText =
      "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1000;max-width:calc(100% - 32px);padding:14px 18px;border-radius:12px;background:#102a43;color:#eff6ff;border:1px solid #60a5fa;box-shadow:0 12px 30px rgba(0,0,0,.3);text-align:center";
    document.body.appendChild(notice);
  }
  notice.textContent = message;
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => notice.remove(), 5000);
};

const openCheckout = (plan) => {
  const name = planNames[plan];
  if (!name) {
    showMessage("Please choose a valid plan.");
    return;
  }

  const url = planUrls[plan];
  if (url) {
    window.location.assign(url);
    return;
  }

  try {
    localStorage.setItem(planKey, plan);
  } catch (error) {
    console.warn("Selected plan could not be saved.", error);
  }

  setPremiumState(true);
  showMessage(`${name} selected in demo mode. Connect a real Stripe Payment Link before charging customers.`);
};

const openLoginModal = () => {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("hidden");
};

const closeLoginModal = () => {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.add("hidden");
};

const logout = () => {
  try {
    localStorage.removeItem(userKey);
  } catch (error) {
    console.warn("User could not be logged out.", error);
  }
  setPremiumState(false);
  updateUserBadge();
  showMessage("You have been logged out.");
};

const handleDemoLogin = (email, password) => {
  if (!email || !password) {
    showMessage("Enter both your email and password.");
    return false;
  }

  try {
    localStorage.setItem(userKey, JSON.stringify({ email, loggedIn: true }));
  } catch (error) {
    console.warn("Demo user could not be saved.", error);
  }
  setPremiumState(true);
  updateUserBadge();
  return true;
};

const handleRealLogin = async (email, password) => {
  if (!appConfig.realAuthConfigured) {
    showMessage("Real auth is not configured yet. Connect Firebase or Supabase first.");
    return false;
  }

  if (window.realAuthLogin && typeof window.realAuthLogin === "function") {
    const result = await window.realAuthLogin(email, password);
    if (result?.success) {
      try {
        localStorage.setItem(userKey, JSON.stringify({ email, loggedIn: true }));
      } catch (error) {
        console.warn("Real user could not be saved.", error);
      }
      setPremiumState(true);
      updateUserBadge();
      return true;
    }
    showMessage(result?.message || "Real login failed.");
    return false;
  }

  showMessage("Real auth provider hook is missing. Add your Firebase/Supabase integration.");
  return false;
};

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

document.getElementById("demoUnlock")?.addEventListener("click", () => {
  setPremiumState(true);
  updateUserBadge();
  showMessage("Premium demo access enabled.");
});

document.getElementById("loginBtn")?.addEventListener("click", openLoginModal);
document.getElementById("closeLoginModal")?.addEventListener("click", closeLoginModal);
document.getElementById("logoutBtn")?.addEventListener("click", logout);

document.querySelectorAll(".mode-btn").forEach((button) => {
  button.addEventListener("click", () => {
    setAuthMode(button.dataset.mode || "demo");
  });
});

document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;

  const selectedMode = getStoredMode();
  let ok = false;

  if (selectedMode === "real") {
    ok = await handleRealLogin(email, password);
  } else {
    ok = handleDemoLogin(email, password);
  }

  if (!ok) return;

  closeLoginModal();
  document.getElementById("loginForm").reset();
  showMessage(
    selectedMode === "real"
      ? `Welcome, ${email}. Real auth flow is ready.`
      : `Welcome, ${email}. Demo login successful.`
  );
});

document.getElementById("loginModal")?.addEventListener("click", (event) => {
  if (event.target.id === "loginModal") closeLoginModal();
});

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => openCheckout(button.dataset.plan));
});

appConfig.mode = getStoredMode();
setAuthMode(appConfig.mode);
initPremiumState();
