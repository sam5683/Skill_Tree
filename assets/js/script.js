/**
 * SkillTree — Visual Engine (Particles + Cursor + Card Physics)
 * Clean, optimized, ready for production.
 */

/* ============================================
   CONFIG
============================================ */
const CONFIG = {
    particleCount: 120,
    baseSpeed: 0.22,
    mouseRepelRadius: 90,
    repelStrength: 1.1,
    cursorLerp: 0.14,
    colors: [
        "rgba(255,255,255,0.70)",
        "rgba(200,225,255,0.55)",
        "rgba(180,255,220,0.50)"
    ]
};

/* ============================================
   WHITE HOLE CURSOR
============================================ */
const cursor = document.getElementById("cursorWhiteHole");

const cursorState = {
    targetX: -100,
    targetY: -100,
    x: -100,
    y: -100,
    visible: true
};

document.addEventListener("mousemove", (e) => {
    cursorState.targetX = e.clientX;
    cursorState.targetY = e.clientY;

    // Show cursor when moving (and not in auth mode)
    if (!document.body.classList.contains("auth-open")) {
        cursor.style.opacity = 1;
        cursorState.visible = true;
    }
});

function animateCursor() {
    cursorState.x = lerp(cursorState.x, cursorState.targetX, CONFIG.cursorLerp);
    cursorState.y = lerp(cursorState.y, cursorState.targetY, CONFIG.cursorLerp);

    cursor.style.left = `${cursorState.x}px`;
    cursor.style.top = `${cursorState.y}px`;

    requestAnimationFrame(animateCursor);
}
animateCursor();

function lerp(a, b, t) { return a + (b - a) * t; }

/* ============================================
   PARTICLE SYSTEM
============================================ */
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        this.size = Math.random() * 1.3 + 0.7;
        this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];

        this.vx = (Math.random() - 0.5) * CONFIG.baseSpeed;
        this.vy = (Math.random() - 0.5) * CONFIG.baseSpeed;

        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.015;
    }

    update() {
        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * 0.08;
        this.y += this.vy + Math.cos(this.wobble) * 0.08;

        // Wrap screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Mouse repulsion
        const dx = cursorState.x - this.x;
        const dy = cursorState.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.mouseRepelRadius) {
            const force = (CONFIG.mouseRepelRadius - dist) / CONFIG.mouseRepelRadius;
            this.x -= (dx / dist) * force * CONFIG.repelStrength;
            this.y -= (dy / dist) * force * CONFIG.repelStrength;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

const particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => { p.update(); p.draw(); });

    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ============================================
   CARD PHYSICS (Subtle Text Motion Only)
============================================ */
const cards = document.querySelectorAll(".repulsion-card");

cards.forEach((card) => {
    const text = card.querySelector(".card-text");

    if (!text) return;

    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) * 0.02;
        const dy = (e.clientY - rect.top - rect.height / 2) * 0.02;

        text.style.transform = `translate(${-dx}px, ${-dy}px)`;
    });

    card.addEventListener("mouseleave", () => {
        text.style.transform = "translate(0, 0)";
    });
});

/* ============================================
   START BUTTON SCROLL
============================================ */
document.getElementById("start-btn").addEventListener("click", () => {
    document.getElementById("about").scrollIntoView({ behavior: "smooth" });
});

/* ============================================
    End page script
============================================ */

