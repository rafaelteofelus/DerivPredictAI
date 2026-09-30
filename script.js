const premiumKey = "derivpredictai-premium";
const userKey = "derivpredictai-user";
const planKey = "derivpredictai-plan";

// These are intentionally empty until real Stripe Payment Links are added.
// Never put Stripe secret keys in this browser-only file.
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

const initPremiumState = () => {
  let saved = "false";
  try {
    saved = localStorage.getItem(premiumKey) || "false";
  } catch (error) {
    console.warn("Premium state could not be read.", error);
  }
  setPremiumState(saved === "true");
};

const showMessage = (message) => {
  // A small, non-blocking message avoids broken external checkout errors.
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

  // The previous test Stripe links were invalid/placeholder links. Until real
  // Payment Links are configured, keep the demo usable instead of opening an error page.
  try {
    localStorage.setItem(planKey, plan);
  } catch (error) {
    console.warn("Selected plan could not be saved.", error);
  }
  setPremiumState(true);
  showMessage(`${name} selected in demo mode. Add a real Stripe Payment Link before charging customers.`);
};

const openLoginModal = () => {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("hidden");
};

const closeLoginModal = () => {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.add("hidden");
};

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

document.getElementById("demoUnlock")?.addEventListener("click", () => {
  setPremiumState(true);
  showMessage("Premium demo access enabled.");
});

document.getElementById("loginBtn")?.addEventListener("click", openLoginModal);
document.getElementById("closeLoginModal")?.addEventListener("click", closeLoginModal);

document.getElementById("loginForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    showMessage("Enter both your email and password.");
    return;
  }

  try {
    localStorage.setItem(userKey, JSON.stringify({ email, loggedIn: true }));
  } catch (error) {
    console.warn("Demo user could not be saved.", error);
  }
  setPremiumState(true);
  closeLoginModal();
  document.getElementById("loginForm").reset();
  showMessage(`Welcome, ${email}. Demo login successful.`);
});

document.getElementById("loginModal")?.addEventListener("click", (event) => {
  if (event.target.id === "loginModal") closeLoginModal();
});

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => openCheckout(button.dataset.plan));
});

initPremiumState();
