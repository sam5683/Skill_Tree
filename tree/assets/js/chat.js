/* chat.js — AI Assistant */

const chatBody = document.getElementById("chatBody");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");

// Render message
function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = role === "user" ? "p-2 mb-2 bg-white/10 rounded" : "p-2 mb-2 bg-accent text-black rounded";
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Backend call
async function askAI(query) {
  try {
    const res = await fetch("http://localhost:8080/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query })
    });

    const data = await res.json();
    return data.reply || "No response.";
  } catch (e) {
    return "Error connecting to server.";
  }
}

// Submit message
sendChat.addEventListener("click", async () => {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  chatInput.value = "";

  const reply = await askAI(text);
  appendMessage("ai", reply);
});
