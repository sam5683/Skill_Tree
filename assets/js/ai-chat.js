const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

const loadingMessages = [
    "Good ideas take longer...",
    "Thinking carefully...",
    "Connecting the dots...",
    "Reviewing your notes...",
    "Building an explanation...",
    "One moment..."
];

sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {

    const text = chatInput.value.trim();

    if (!text) return;

    // USER MESSAGE
    addMessage("user", text);

    chatInput.value = "";

    // RANDOM LOADING MESSAGE
    const randomLoadingMessage =
        loadingMessages[
            Math.floor(
                Math.random() * loadingMessages.length
            )
        ];

    // TEMP AI MESSAGE
    const loadingDiv = addMessage(
        "assistant",
        randomLoadingMessage
    );

    try {

        const response = await fetch(
            `${API_BASE}/chat`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    conversation_id: 1,
                    message: text
                })
            }
        );

        const data = await response.json();

        // REPLACE LOADING MESSAGE
        loadingDiv.innerText = data.answer;

    } catch (err) {

        console.error(err);

        loadingDiv.innerText =
            "Something went wrong.";
    }
}

function addMessage(role, text) {

    const div = document.createElement("div");

    div.className = `
        message
        ${role}
        px-3
        py-2
        rounded
        text-sm
        bg-white/10
    `;

    div.innerText = text;

    messages.appendChild(div);

    // AUTO SCROLL
    messages.scrollTop = messages.scrollHeight;

    return div;
}