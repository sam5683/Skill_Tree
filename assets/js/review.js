document.addEventListener("DOMContentLoaded", () => {

const API_BASE = "http://127.0.0.1:8000/api/v1";

let cards = [];
let currentIndex = 0;
let reviewedCount = 0;

// -----------------------------
// DOM ELEMENTS (safe after load)
// -----------------------------
const cardQuestion = document.getElementById("cardQuestion");
const cardAnswer = document.getElementById("cardAnswer");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const reviewButtons = document.getElementById("reviewButtons");
const cardCounter = document.getElementById("cardCounter");
const progressBar = document.getElementById("progressBar");
const cardContainer = document.getElementById("cardContainer");
const sessionComplete = document.getElementById("sessionComplete");

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
        alert("Not logged in");
        window.location.href = "index.html";
        return;
    }

    const res = await fetch(`${API_BASE}/flashcards/due`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {
        console.error("Failed to load due cards");
        return;
    }

    cards = await res.json();

    if (cards.length === 0) {
        if (cardQuestion) cardQuestion.innerText = "No cards due 🎉";
        if (showAnswerBtn) showAnswerBtn.classList.add("hidden");
        if (reviewButtons) reviewButtons.classList.add("hidden");
        return;
    }

    currentIndex = 0;
    reviewedCount = 0;

    renderCard();
}

// -----------------------------
// PROGRESS BAR
// -----------------------------
function updateProgressBar() {
    if (!progressBar) return;

    const progress = Math.min((currentIndex / cards.length) * 100, 100);
    progressBar.style.width = progress + "%";
}

// -----------------------------
// RENDER CARD
// -----------------------------
function renderCard() {
    const card = cards[currentIndex];

    updateProgressBar();

    // ✅ SESSION COMPLETE
    if (!card) {
        if (cardContainer) cardContainer.classList.add("hidden");
        if (sessionComplete) sessionComplete.classList.remove("hidden");

        if (cardCounter) {
            cardCounter.innerText = `${cards.length} / ${cards.length}`;
        }

        const stats = document.getElementById("reviewStats");
        if (stats) {
            stats.textContent = `You reviewed ${reviewedCount} cards`;
        }

        return;
    }

    if (cardCounter) {
        cardCounter.innerText = `${currentIndex + 1} / ${cards.length}`;
    }

    if (cardQuestion) cardQuestion.innerText = card.question;
    if (cardAnswer) cardAnswer.innerText = card.answer;

    if (cardAnswer) cardAnswer.classList.add("hidden");
    if (reviewButtons) reviewButtons.classList.add("hidden");
    if (showAnswerBtn) showAnswerBtn.classList.remove("hidden");
}

// -----------------------------
// SHOW ANSWER
// -----------------------------
if (showAnswerBtn) {
    showAnswerBtn.onclick = () => {
        if (cardAnswer) cardAnswer.classList.remove("hidden");
        if (reviewButtons) reviewButtons.classList.remove("hidden");
        showAnswerBtn.classList.add("hidden");
    };
}

// -----------------------------
// RATE CARD
// -----------------------------
async function rateCard(rating) {
    const token = getToken();

    if (!token) {
        alert("Session expired");
        return;
    }

    const card = cards[currentIndex];

    const res = await fetch(`${API_BASE}/flashcards/review/${card.id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
    });

    if (!res.ok) {
        alert("Review failed");
        return;
    }

    reviewedCount++;
    currentIndex++;

    renderCard();
}

// -----------------------------
// BUTTON EVENTS
// -----------------------------
if (reviewButtons) {
    reviewButtons.querySelectorAll("button").forEach(btn => {
        btn.onclick = () => {
            const rating = btn.getAttribute("data-rating");
            rateCard(rating);
        };
    });
}

// -----------------------------
// KEYBOARD SHORTCUTS
// -----------------------------
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        if (showAnswerBtn && !showAnswerBtn.classList.contains("hidden")) {
            showAnswerBtn.click();
        }
    }

    if (reviewButtons && !reviewButtons.classList.contains("hidden")) {
        if (e.key === "1") rateCard("again");
        if (e.key === "2") rateCard("hard");
        if (e.key === "3") rateCard("good");
        if (e.key === "4") rateCard("easy");
    }
});

// -----------------------------
loadDueCards();

});