const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

const counters = document.querySelectorAll("[data-count]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      const end = Number(target.dataset.count);
      const suffix = target.dataset.suffix || "";
      const start = performance.now();
      const duration = 1100;

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(end * eased);
        target.textContent = `${value.toLocaleString("de-DE")}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      counterObserver.unobserve(target);
    });
  },
  { threshold: 0.35 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const canvas = document.querySelector(".signal-canvas");
if (canvas) {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let time = 0;
  const nodes = Array.from({ length: 34 }, (_, index) => ({
    x: (index * 97) % 1000,
    y: (index * 53) % 700,
    speed: 0.35 + (index % 5) * 0.06
  }));

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = () => {
    time += 0.01;
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;

    nodes.forEach((node, index) => {
      const x = ((node.x / 1000) * width + Math.sin(time * node.speed + index) * 18) % width;
      const y = ((node.y / 700) * height + Math.cos(time * node.speed + index) * 14) % height;
      context.beginPath();
      context.arc(x, y, 2.2, 0, Math.PI * 2);
      context.fillStyle = "rgba(255,255,255,0.62)";
      context.fill();

      nodes.slice(index + 1).forEach((other, otherIndex) => {
        if ((index + otherIndex) % 9 !== 0) return;
        const ox = (other.x / 1000) * width;
        const oy = (other.y / 700) * height;
        const distance = Math.hypot(x - ox, y - oy);
        if (distance > 220) return;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(ox, oy);
        context.strokeStyle = `rgba(255,255,255,${0.18 - distance / 1600})`;
        context.stroke();
      });
    });

    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  draw();
}

document.querySelectorAll(".image-stage").forEach((stage) => {
  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.transform = `perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 4}deg)`;
  });

  stage.addEventListener("pointerleave", () => {
    stage.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
});
