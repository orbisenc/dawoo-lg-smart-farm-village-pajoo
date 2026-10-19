const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const form = document.querySelector("[data-consult-form]");
const message = document.querySelector("[data-form-message]");

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

menuButton.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
  }
});

const pageSections = [...document.querySelectorAll("main > section, .footer")];
const pageScrollDuration = 800;
let isPageScrolling = false;
let wheelGestureEnded = true;
let scrollAnimationEnded = true;
let wheelEndTimer;

function getSectionTop(section, index) {
  const top = section.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, Math.round(top));
}

function getCurrentSectionIndex() {
  const currentY = window.scrollY;
  let closestIndex = 0;
  let closestDistance = Infinity;

  pageSections.forEach((section, index) => {
    const distance = Math.abs(getSectionTop(section, index) - currentY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function unlockPageScrollWhenReady() {
  if (wheelGestureEnded && scrollAnimationEnded) {
    isPageScrolling = false;
  }
}

window.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey || Math.abs(event.deltaY) < 12) return;

    event.preventDefault();
    wheelGestureEnded = false;
    clearTimeout(wheelEndTimer);
    wheelEndTimer = setTimeout(() => {
      wheelGestureEnded = true;
      unlockPageScrollWhenReady();
    }, 180);

    if (isPageScrolling) return;

    const currentIndex = getCurrentSectionIndex();
    const direction = Math.sign(event.deltaY);
    const targetIndex = Math.min(
      pageSections.length - 1,
      Math.max(0, currentIndex + direction)
    );

    if (targetIndex === currentIndex) return;

    isPageScrolling = true;
    scrollAnimationEnded = false;
    window.scrollTo({
      top: getSectionTop(pageSections[targetIndex], targetIndex),
      behavior: "smooth",
    });

    setTimeout(() => {
      scrollAnimationEnded = true;
      unlockPageScrollWhenReady();
    }, pageScrollDuration);
  },
  { passive: false }
);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const lead = {
    name: data.get("name"),
    phone: data.get("phone"),
    region: data.get("region"),
    consultTime: data.get("consultTime"),
    interests: data.getAll("interest"),
    createdAt: new Date().toISOString(),
  };

  const leads = JSON.parse(localStorage.getItem("dawooFarmConsultLeads") || "[]");
  leads.unshift(lead);
  localStorage.setItem("dawooFarmConsultLeads", JSON.stringify(leads));

  form.reset();
  message.textContent = "상담 신청 정보가 임시 저장되었습니다. 추후 관리자 화면과 연동됩니다.";
});
