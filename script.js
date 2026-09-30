const premiumKey = "derivpredictai-premium";
const userKey = "derivpredictai-user";

const planUrls = {
  starter: "https://buy.stripe.com/test_00g4jF6mJcOQ4M83cc",
  pro: "https://buy.stripe.com/test_14k4jF8K1aU4E2s9aa",
  elite: "https://buy.stripe.com/test_5kA4jF3PL7B0C4Q8ac",
};

const setPremiumState = (isPremium) => {
  localStorage.setItem(premiumKey, String(isPremium));
  const premiumPanel = document.getElementById("premiumPanel");
  const premiumLock = document.getElementById("premiumLock");

  if (premiumPanel && premiumLock) {
    premiumPanel.classList.toggle("hidden", !isPremium);
    premiumLock.classList.toggle("hidden", isPremium);
  }
};

const initPremiumState = () => {
  const saved = localStorage.getItem(premiumKey);
  if (saved === "true") {
    setPremiumState(true);
    return;
  }
  setPremiumState(false);
};

const openCheckout = (plan) => {
  const url = planUrls[plan];

  if (!url) {
    alert("This is a demo checkout. Replace the Stripe link in script.js with a real checkout URL.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

const openLoginModal = () => {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.classList.remove("hidden");
  }
};

const closeLoginModal = () => {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.classList.add("hidden");
  }
};

document.getElementById("year").textContent = new Date().getFullYear();

const demoUnlockBtn = document.getElementById("demoUnlock");
if (demoUnlockBtn) {
  demoUnlockBtn.addEventListener("click", () => {
    setPremiumState(true);
  });
}

const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    openLoginModal();
  });
}

const closeLoginModalBtn = document.getElementById("closeLoginModal");
if (closeLoginModalBtn) {
  closeLoginModalBtn.addEventListener("click", () => {
    closeLoginModal();
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email && password) {
      localStorage.setItem(userKey, JSON.stringify({ email, loggedIn: true }));
      setPremiumState(true);
      closeLoginModal();
      loginForm.reset();
    }
  });
}

const modal = document.getElementById("loginModal");
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeLoginModal();
    }
  });
}

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => {
    const plan = button.dataset.plan;
    openCheckout(plan);
  });
});

initPremiumState();
