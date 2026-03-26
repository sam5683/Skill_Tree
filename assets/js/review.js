const API_BASE = "http://127.0.0.1:8000/api/v1";

let cards = [];
let currentIndex = 0;

const cardQuestion = document.getElementById("cardQuestion");
const cardAnswer = document.getElementById("cardAnswer");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const reviewButtons = document.getElementById("reviewButtons");
const cardCounter = document.getElementById("cardCounter");
const progressBar = document.getElementById("progressBar");
const cardContainer = document.getElementById("cardContainer");
const sessionComplete = document.getElementById("sessionComplete");

function getToken() {
    return localStorage.getItem("access_token");
}

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
        cardQuestion.innerText = "No cards due 🎉";
        showAnswerBtn.classList.add("hidden");
        reviewButtons.classList.add("hidden");
        return;
    }

    currentIndex = 0;
    renderCard();
}

function updateProgressBar() {
    if (!progressBar) return;
    const progress = (currentIndex / cards.length) * 100;
    progressBar.style.width = progress + "%";
}

function renderCard() {
    const card = cards[currentIndex];

    updateProgressBar();

    if (!card) {
        cardContainer.classList.add("hidden");
        sessionComplete.classList.remove("hidden");
        cardCounter.innerText = `${cards.length} / ${cards.length}`;
        return;
    }

    cardCounter.innerText = `${currentIndex + 1} / ${cards.length}`;

    cardQuestion.innerText = card.question;
    cardAnswer.innerText = card.answer;

    cardAnswer.classList.add("hidden");
    reviewButtons.classList.add("hidden");
    showAnswerBtn.classList.remove("hidden");
}

showAnswerBtn.onclick = () => {
    cardAnswer.classList.remove("hidden");
    reviewButtons.classList.remove("hidden");
    showAnswerBtn.classList.add("hidden");
};

async function rateCard(rating) {
    const token = getToken();
    const card = cards[currentIndex];

    await fetch(`${API_BASE}/flashcards/review/${card.id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
    });

    currentIndex++;
    renderCard();
}

// Button click ratings
document.querySelectorAll("#reviewButtons button").forEach(btn => {
    btn.onclick = () => {
        const rating = btn.getAttribute("data-rating");
        rateCard(rating);
    };
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
    // Space = Show answer
    if (e.code === "Space") {
        e.preventDefault();
        if (!showAnswerBtn.classList.contains("hidden")) {
            showAnswerBtn.click();
        }
    }

    // 1 2 3 4 = Again Hard Good Easy
    if (!reviewButtons.classList.contains("hidden")) {
        if (e.key === "1") rateCard("again");
        if (e.key === "2") rateCard("hard");
        if (e.key === "3") rateCard("good");
        if (e.key === "4") rateCard("easy");
    }
});

loadDueCards();