document.addEventListener("DOMContentLoaded", () => {

const API_BASE = window.API_BASE || "http://127.0.0.1:8000/api/v1";
let cards = [];
let sessionCards = [];
let currentIndex = 0;
let reviewedCount = 0;

let stats = {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
};

const MAX_CARDS = 15;

// -----------------------------
const cardQuestion = document.getElementById("cardQuestion");
const cardAnswer = document.getElementById("cardAnswer");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const reviewButtons = document.getElementById("reviewButtons");
const cardCounter = document.getElementById("cardCounter");
const progressBar = document.getElementById("progressBar");
const cardContainer = document.getElementById("cardContainer");
const sessionComplete = document.getElementById("sessionComplete");
const reviewStats = document.getElementById("reviewStats");

// -----------------------------
function getToken() {
    return localStorage.getItem("access_token");
}

// -----------------------------
// LOAD CARDS
// -----------------------------
async function loadDueCards() {
    const token = getToken();

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/flashcards/due`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to load due cards");

        cards = await res.json();
        cards = cards.slice(0, MAX_CARDS);
        sessionCards = [...cards];

        if (cards.length === 0) {
            showEmptyState();
            return;
        }

        currentIndex = 0;
        reviewedCount = 0;

        renderCard(true);
    } catch (err) {
        alert("Something went wrong. Please try again.");
    }
}

// -----------------------------
function showEmptyState() {
    cardContainer.classList.add("hidden");
    sessionComplete.classList.remove("hidden");

    reviewStats.innerHTML = `
        <div class="text-lg">No cards due 🎉</div>
        <div class="text-sm opacity-60 mt-2">
            You're fully caught up.
        </div>
    `;
}

// -----------------------------
function updateProgress() {
    const percent = Math.round((currentIndex / cards.length) * 100);

    progressBar.style.width = percent + "%";
    cardCounter.innerText = `${currentIndex + 1} / ${cards.length}`;
}

// -----------------------------
// ANIMATION
// -----------------------------
function animateCardOut(callback) {
    cardContainer.style.transform = "translateX(-30px)";
    cardContainer.style.opacity = "0";

    setTimeout(() => {
        callback();
        animateCardIn();
    }, 150);
}

function animateCardIn() {
    cardContainer.style.transform = "translateX(30px)";
    cardContainer.style.opacity = "0";

    requestAnimationFrame(() => {
        cardContainer.style.transition = "all 0.2s ease";
        cardContainer.style.transform = "translateX(0)";
        cardContainer.style.opacity = "1";
    });
}

// -----------------------------
function renderCard(initial = false) {
    if (!initial) {
        animateCardOut(() => renderCardContent());
    } else {
        renderCardContent();
        animateCardIn();
    }
}

function renderCardContent() {
    const card = cards[currentIndex];

    if (!card) {
        finishSession();
        return;
    }

    updateProgress();

    // 🔥 Set question + answer
    cardQuestion.innerText = card.question;
    cardAnswer.innerText = card.answer;

    // 🔥 Reset UI state
    cardAnswer.classList.add("hidden");
    reviewButtons.classList.add("hidden");
    showAnswerBtn.classList.remove("hidden");

    // 🔥 CLEAR old SRS feedback
    const feedback = document.getElementById("srsFeedback");
    if (feedback) feedback.innerText = "";

    // 🔥 CARD STATUS (important)
    const meta = document.getElementById("cardMeta");

    if (meta) {
        if (card.repetitions > 5) {
            meta.innerText = "🧠 Mastered";
        } else if (card.repetitions > 2) {
            meta.innerText = "📈 Learning";
        } else {
            meta.innerText = "🌱 New";
        }
    }
}
// -----------------------------
showAnswerBtn.onclick = () => {
    cardAnswer.classList.remove("hidden");
    reviewButtons.classList.remove("hidden");
    showAnswerBtn.classList.add("hidden");
};

// -----------------------------
// 🔥 SRS FEEDBACK
// -----------------------------
function showSRSFeedback(data) {
    const el = document.getElementById("srsFeedback");
    if (!el) return;

    if (!data || !data.interval) {
        el.innerText = "";
        return;
    }

    let msg = "";

    // 🔥 PRIMARY: interval (truth)
    const days = data.interval;

    if (days <= 1) {
        msg = `🔁 Review soon (${days}d)`;
    } else if (days <= 3) {
        msg = `⏳ Improving (${days}d)`;
    } else {
        msg = `🚀 Strong (${days}d)`;
    }

    // 🔥 optional secondary hint (light layer, not dominant)
    if (data.repetitions === 0) {
        msg += " • learning";
    }

    el.innerText = msg;

    // animation
    el.style.opacity = "1";
    el.style.transform = "translateY(0px)";

    setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateY(6px)";
    }, 850);
}
// -----------------------------
// RATE CARD (🔥 FIXED)
// -----------------------------
async function rateCard(rating) {
    const token = getToken();

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    const card = cards[currentIndex];

    // prevent spam clicks
    reviewButtons.classList.add("pointer-events-none");

    let success = false;

    try {
        const res = await fetch(`${API_BASE}/flashcards/review/${card.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ rating })
        });

        if (res.ok) {
            const data = await res.json();
            showSRSFeedback(data);
            stats[rating]++;
            success = true;
        } else {
            alert("Failed to update card. Try again.");
        }

    } catch (err) {
        alert("Network error. Please try again.");
        console.error(err);
    }

    if (!success) {
        reviewButtons.classList.remove("pointer-events-none");
        return;
    }

    reviewedCount++;
    currentIndex++;

    setTimeout(() => {
        renderCard();
        reviewButtons.classList.remove("pointer-events-none");
    }, 850);
}

// -----------------------------
function finishSession() {
    cardContainer.classList.add("hidden");
    sessionComplete.classList.remove("hidden");

    // 🔹 basic stats
    let total = reviewedCount;

    // 🔹 derive insight (THIS is the important part)
    let insight = "";
    if (stats.again > stats.easy) {
        insight = "⚠️ You struggled today — revisit weak areas";
    } else if (stats.easy > stats.again) {
        insight = "🔥 Strong recall — memory is improving";
    } else {
        insight = "⚖️ Balanced session — keep consistency";
    }

    // 🔹 next-step signal (mock for now or plug real later)
    let nextDue = 0;
    if (typeof dueTomorrowCount !== "undefined") {
        nextDue = dueTomorrowCount;
    }

    // 🔥 FINAL UI
    reviewStats.innerHTML = `
        <div class="text-xl mb-3">
            📊 Reviewed <strong>${total}</strong> cards
        </div>

        <div class="text-sm opacity-80 mb-4">
            🧠 Weak: ${stats.again} &nbsp;&nbsp;
            ⚖️ Medium: ${stats.hard} &nbsp;&nbsp;
            ✅ Good: ${stats.good} &nbsp;&nbsp;
            🚀 Strong: ${stats.easy}
        </div>

        <div class="text-sm mb-4">
            ${insight}
        </div>

        <div class="text-xs opacity-60">
            📅 ${nextDue} cards due tomorrow
        </div>
    `;
}
// -----------------------------
window.reviewAgain = function () {
    cards = [...sessionCards];
    currentIndex = 0;
    reviewedCount = 0;

    stats = { again: 0, hard: 0, good: 0, easy: 0 };

    sessionComplete.classList.add("hidden");
    cardContainer.classList.remove("hidden");

    renderCard(true);
};

// -----------------------------
reviewButtons.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
        rateCard(btn.dataset.rating);
    };
});

// -----------------------------
document.addEventListener("keydown", (e) => {

    if (e.code === "Space") {
        e.preventDefault();
        if (!showAnswerBtn.classList.contains("hidden")) {
            showAnswerBtn.click();
        }
    }

    if (!reviewButtons.classList.contains("hidden")) {
        if (e.key === "1") rateCard("again");
        if (e.key === "2") rateCard("hard");
        if (e.key === "3") rateCard("good");
        if (e.key === "4") rateCard("easy");
    }
});

// -----------------------------
loadDueCards();

});