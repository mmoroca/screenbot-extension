const BACKEND_URL = "https://screenbot-backend.onrender.com/analyze"; // <-- Actualiza si cambia

let captureInterval = 300000;

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get("interval", ({ interval }) => {
        if (interval) {
            captureInterval = parseInt(interval);
        }
        console.log("⏱️ Captura cada", captureInterval / 1000, "segundos");

        setInterval(captureAndSend, captureInterval);
    });
});

function captureAndSend() {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (image) => {
        if (chrome.runtime.lastError || !image) {
            console.error("❌ Error capturando pantalla:", chrome.runtime.lastError);
            return;
        }

        console.log("📸 Imagen capturada, enviando al backend...");

        fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image })
        })
        .then((res) => res.json())
        .then((data) => {
            console.log("💡 Idea recibida:", data.idea);
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "ScreenBot",
                message: data.idea || "No se generó idea."
            });
        })
        .catch((err) => console.error("🔥 Error en fetch:", err));
    });
}