const express = require("express");
const http = require("http");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Statische Dateien bereitstellen
app.use(express.static("public"));

// Fragen aus Datei laden
let questions = [];
try {
    const data = fs.readFileSync("questions.json", "utf8");
    questions = JSON.parse(data);
} catch (err) {
    console.error("Fehler beim Laden der Fragen:", err);
}

let currentQuestionIndex = 0;

// WebSocket-Logik
io.on("connection", (socket) => {
    console.log("Ein Benutzer ist verbunden");

    // Sende die aktuelle Frage
    socket.emit("updateQuestion", { question: questions[currentQuestionIndex].question });

    // Admin kann zur nächsten Frage wechseln
    socket.on("nextQuestion", () => {
        currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
        io.emit("updateQuestion", { question: questions[currentQuestionIndex].question });
    });

    socket.on("disconnect", () => {
        console.log("Ein Benutzer hat die Verbindung getrennt");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
