// Configuration for different repulsion strengths
const repulsionConfig = {
    heading: {
        radius: 120,
        strength: 2.0,
        springStrength: 0.15
    },
    letter: {
        radius: 80,
        strength: 0.8,
        springStrength: 0.2
    }
};

// Particle physics state
const physicsState = new WeakMap();

function initRepulsion(element, type = 'letter') {
    if (!physicsState.has(element)) {
        physicsState.set(element, {
            vx: 0,
            vy: 0,
            x: 0,
            y: 0
        });
    }
}

function updateElementPosition(element, config) {
    const state = physicsState.get(element);
    if (!state) return;

    // Apply spring force back to original position
    state.vx *= 0.9; // Damping
    state.vy *= 0.9;
    state.vx -= state.x * config.springStrength;
    state.vy -= state.y * config.springStrength;

    // Update position
    state.x += state.vx;
    state.y += state.vy;

    element.style.transform = `translate(${state.x}px, ${state.y}px)`;
}

function applyRepulsion(element, cursorX, cursorY, config) {
    const rect = element.getBoundingClientRect();
    const elementX = rect.left + rect.width / 2 + window.scrollX;
    const elementY = rect.top + rect.height / 2 + window.scrollY;

    const dx = elementX - cursorX;
    const dy = elementY - cursorY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const state = physicsState.get(element);
    if (!state) return;

    if (distance < config.radius) {
        const force = (1 - distance / config.radius) * config.strength;
        const angle = Math.atan2(dy, dx);
        state.vx += Math.cos(angle) * force;
        state.vy += Math.sin(angle) * force;
    }
}

function initRepulsionSystem() {
    // Initialize headings
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
        initRepulsion(heading, 'heading');
    });

    // Initialize letters in "Who We Are" section
    document.querySelectorAll('#intro .letter').forEach(letter => {
        initRepulsion(letter, 'letter');
    });

    // Track cursor position
    let cursorX = 0, cursorY = 0;
    document.addEventListener('mousemove', (e) => {
        cursorX = e.pageX;
        cursorY = e.pageY;

        // Update headings
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            applyRepulsion(heading, cursorX, cursorY, repulsionConfig.heading);
            updateElementPosition(heading, repulsionConfig.heading);
        });

        // Update letters
        document.querySelectorAll('#intro .letter').forEach(letter => {
            applyRepulsion(letter, cursorX, cursorY, repulsionConfig.letter);
            updateElementPosition(letter, repulsionConfig.letter);
        });
    });

    // Optional: Update positions on scroll for better accuracy
    document.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const event = new MouseEvent('mousemove', {
                clientX: cursorX,
                clientY: cursorY
            });
            document.dispatchEvent(event);
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initRepulsionSystem);