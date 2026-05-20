/* eslint-disable @typescript-eslint/no-explicit-any */
import anime from "animejs";

function inView(
  element: Element,
  callback: () => void,
  options: { once?: boolean; amount?: number; rootMargin?: string } = {}
) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          if (options.once !== false) observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: options.amount ?? 0.1,
      rootMargin: options.rootMargin ?? "0px"
    }
  );

  observer.observe(element);
  return () => observer.unobserve(element);
}

export function generateParticles() {
  const particlesContainer = document.getElementById("particles");
  if (!particlesContainer) return;

  const codeSymbols = ["{", "}", "[", "]", "(", ")", "<", ">", "/", "*", "=", "+", "-", ";", ":", "&", "|", "%", "$", "#", "@"];
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.textContent = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 15 + "s";
    particle.style.animationDuration = 10 + Math.random() * 10 + "s";
    particlesContainer.appendChild(particle);
  }
}

function initPageAnimations() {
  initHeroAnimations();
  initSkillAnimations();
  initTimelineAnimations();
  initProjectAnimations();
  initScrollAnimations();
  initContactAnimations();
  animateStats();
  initParallax();
}

function initHeroAnimations() {
  if (!anime) return;

  const heroName = document.getElementById("heroName");
  if (heroName) {
    const nameValue = heroName.querySelector(".name-value");
    if (nameValue) {
      const originalText = nameValue.textContent ?? "";
      nameValue.textContent = "";

      anime({
        targets: { value: 0 },
        value: originalText.length,
        duration: 1500,
        delay: 500,
        easing: "easeInOutQuad",
        update: function (anim: any) {
          const length = Math.floor(anim.animatables[0].target.value);
          nameValue.textContent = originalText.substring(0, length);
        },
        complete: () => {
          const cursor = document.createElement("span");
          cursor.className = "name-cursor";
          cursor.textContent = "|";
          cursor.style.animation = "blink 1s infinite";
          nameValue.appendChild(cursor);
          setTimeout(() => cursor.remove(), 2000);
        }
      });
    }
  }

  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle && anime) {
    anime({
      targets: heroTitle,
      opacity: [0, 1],
      translateX: [-30, 0],
      delay: 800,
      duration: 1000,
      easing: "easeOutExpo"
    });
  }

  const heroDescription = document.querySelector(".hero-description");
  if (heroDescription && anime) {
    anime({
      targets: heroDescription,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: 1200,
      duration: 1000,
      easing: "easeOutExpo"
    });
  }

  const heroButtons = document.querySelectorAll(".hero-buttons .btn");
  if (heroButtons.length > 0 && anime) {
    anime({
      targets: heroButtons,
      opacity: [0, 1],
      scale: [0.8, 1],
      delay: anime.stagger(100, { start: 1500 }),
      duration: 800,
      easing: "easeOutBack"
    });
  }

  const socialIcons = document.querySelectorAll(".hero-social .social-icon");
  if (socialIcons.length > 0 && anime) {
    anime({
      targets: socialIcons,
      opacity: [0, 1],
      scale: [0, 1],
      rotate: [180, 0],
      delay: anime.stagger(100, { start: 2000 }),
      duration: 800,
      easing: "easeOutBack"
    });
  }

  const profileImage = document.getElementById("profileImage");
  if (profileImage && anime) {
    anime({
      targets: profileImage,
      opacity: [0, 1],
      scale: [0.8, 1],
      rotate: [180, 0],
      delay: 1000,
      duration: 1500,
      easing: "easeOutElastic(1, .8)"
    });

    profileImage.addEventListener("mouseenter", () => {
      anime({
        targets: profileImage,
        scale: [1, 1.1],
        rotate: [0, 5],
        duration: 500,
        easing: "easeOutElastic(1, .8)"
      });
    });

    profileImage.addEventListener("mouseleave", () => {
      anime({
        targets: profileImage,
        scale: [1.1, 1],
        rotate: [5, 0],
        duration: 500,
        easing: "easeOutElastic(1, .8)"
      });
    });
  }

  const badges = document.querySelectorAll(".floating-badge");
  if (badges.length > 0 && anime) {
    badges.forEach((badge: Element, index: number) => {
      anime({
        targets: badge,
        opacity: [0, 1],
        scale: [0, 1],
        delay: 1500 + index * 200,
        duration: 800,
        easing: "easeOutBack"
      });
    });
  }
}

function initSkillAnimations() {
  const skillsSection = document.getElementById("skills");
  if (!skillsSection || !anime) return;

  const skillItems = skillsSection.querySelectorAll(".skill-item");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const skillItem = entry.target as HTMLElement;
          const progressBar = skillItem.querySelector(".skill-progress") as HTMLElement | null;
          const percentElement = skillItem.querySelector(".skill-percent") as HTMLElement | null;
          const percent = parseInt(skillItem.getAttribute("data-percent") || "0", 10);

          if (progressBar) {
            anime({
              targets: progressBar,
              width: ["0%", percent + "%"],
              duration: 2000,
              easing: "easeOutExpo",
              delay: 300
            });

            anime({
              targets: { value: 0 },
              value: percent,
              duration: 2000,
              easing: "easeOutExpo",
              delay: 300,
              update: function (anim: any) {
                if (percentElement) percentElement.textContent = Math.floor(anim.animatables[0].target.value) + "%";
              }
            });
          }

          observer.unobserve(skillItem);
        }
      });
    },
    { threshold: 0.5 }
  );

  skillItems.forEach((item) => observer.observe(item));
}

function initTimelineAnimations() {
  const timelineItems = document.querySelectorAll(".timeline-item");
  timelineItems.forEach((item: Element, index) => {
    inView(item, () => {
      if (!anime) return;
      anime({
        targets: item,
        opacity: [0, 1],
        translateX: [-50, 0],
        delay: index * 150,
        duration: 1000,
        easing: "easeOutExpo"
      });
    }, { amount: 0.3 });
  });
}

function initProjectAnimations() {
  const projectCards = document.querySelectorAll(".project-card");

  projectCards.forEach((card: Element, index) => {
    inView(card, () => {
      if (!anime) return;
      anime({
        targets: card,
        opacity: [0, 1],
        translateY: [50, 0],
        scale: [0.9, 1],
        delay: index * 100,
        duration: 1000,
        easing: "easeOutExpo"
      });
    }, { amount: 0.2 });

    card.addEventListener("mouseenter", () => {
      if (!anime) return;
      anime({ targets: card, scale: [1, 1.02], duration: 300, easing: "easeOutQuad" });
    });

    card.addEventListener("mouseleave", () => {
      if (!anime) return;
      anime({ targets: card, scale: [1.02, 1], duration: 300, easing: "easeOutQuad" });
    });
  });
}

function initScrollAnimations() {
  const sections = document.querySelectorAll(".section");
  if (anime) {
    sections.forEach((section: Element) => {
      inView(section, () => {
        const sectionHeader = (section as HTMLElement).querySelector(".section-header");
        if (sectionHeader) {
          anime({
            targets: sectionHeader,
            opacity: [0, 1],
            translateY: [-20, 0],
            duration: 600,
            easing: "easeOutExpo"
          });
        }
      }, { amount: 0.2 });
    });
  }
}

function animateStats() {
  if (!anime) return;

  const statNumbers = document.querySelectorAll(".stat-number");
  statNumbers.forEach((stat: Element) => {
    const target = parseInt((stat as HTMLElement).getAttribute("data-count") || "0", 10);
    inView(stat, () => {
      anime({
        targets: { value: 0 },
        value: target,
        duration: 2000,
        easing: "easeOutExpo",
        update: function (anim: any) {
          (stat as HTMLElement).textContent = String(Math.floor(anim.animatables[0].target.value));
        }
      });
    }, { amount: 0.5 });
  });
}

function initContactAnimations() {
  if (!anime) return;

  const contactItems = document.querySelectorAll(".contact-item");
  contactItems.forEach((item: Element) => {
    item.addEventListener("mouseenter", () => anime({ targets: item, scale: [1, 1.02], duration: 200, easing: "easeOutQuad" }));
    item.addEventListener("mouseleave", () => anime({ targets: item, scale: [1.02, 1], duration: 200, easing: "easeOutQuad" }));
  });
}

function initParallax() {
  const profileImage = document.getElementById("profileImage");
  if (!profileImage) return;

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    window.requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.3;
      const maxOffset = 100;
      const offset = Math.min(scrolled * parallaxSpeed, maxOffset);

      profileImage.style.transform = `translateY(${offset}px)`;

      const gridBg = document.querySelector(".code-grid-bg") as HTMLElement | null;
      if (gridBg) gridBg.style.transform = `translateY(${scrolled * 0.2}px)`;

      ticking = false;
    });
    ticking = true;
  });
}

export function initPortfolioAnimations() {
  generateParticles();

  const loader = document.getElementById("loader");
  const loaderPercent = document.getElementById("loaderPercent");
  if (!loader || !loaderPercent) {
    initPageAnimations();
    return;
  }

  let progress = 0;
  const progressInterval = window.setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      window.clearInterval(progressInterval);

      window.setTimeout(() => {
        if (anime) {
          anime({
            targets: loader,
            opacity: [1, 0],
            duration: 500,
            easing: "easeInOutQuad",
            complete: () => {
              loader.classList.add("hidden");
              initPageAnimations();
            }
          });
        } else {
          loader.classList.add("hidden");
          initPageAnimations();
        }
      }, 300);
    }

    loaderPercent.textContent = Math.floor(progress) + "%";
  }, 100);
}
