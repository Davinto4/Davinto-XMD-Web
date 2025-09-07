const socket = io();

const messagesDiv = document.getElementById("messages");
const toInput = document.getElementById("to");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");

socket.on("newMessage", (data) => {
    const p = document.createElement("p");
    p.textContent = `📩 ${data.from}: ${data.text}`;
    messagesDiv.appendChild(p);
});

sendBtn.addEventListener("click", () => {
    const to = toInput.value;
    const message = msgInput.value;
    socket.emit("sendMessage", { to, message });
    const p = document.createElement("p");
    p.textContent = `➡️ You to ${to}: ${message}`;
    messagesDiv.appendChild(p);
    msgInput.value = "";
});
