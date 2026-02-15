

// ═══════════════════════════════════════════════════
// VOICE INPUT FOR SYMPTOMS
// ═══════════════════════════════════════════════════
async function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("❌ Voice input is not supported in this browser.\n\nPlease use:\n✓ Chrome\n✓ Edge\n✓ Safari");
        return;
    }

    const button = document.getElementById("voiceInputBtn");
    const textarea = document.getElementById("symptoms");

    if (!button || !textarea) return;

    // Check if microphone devices exist
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');

        if (!hasMicrophone) {
            alert("🎤 No Microphone Detected\n\n" +
                "Your computer doesn't have a microphone or it's not connected.\n\n" +
                "Please:\n" +
                "1. Connect a microphone or headset\n" +
                "2. Check Windows Sound Settings (Win + I → System → Sound)\n" +
                "3. Refresh the page and try again");
            return;
        }
    } catch (err) {
        console.warn("Could not enumerate devices:", err);
        // Continue anyway - might still work
    }

    // Request microphone permission explicitly
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());
    } catch (err) {
        console.error("Microphone permission error:", err);
        alert("🎤 Microphone Access Required\n\n" +
            "Please enable microphone access:\n\n" +
            "1. Click the 🔒 lock icon in the address bar\n" +
            "2. Find 'Microphone' permission\n" +
            "3. Change to 'Allow'\n" +
            "4. Refresh the page and try again\n\n" +
            "Current status: " + err.message);
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    button.classList.add("listening");
    button.title = "Listening... Speak now!";

    try {
        recognition.start();
    } catch (err) {
        button.classList.remove("listening");
        button.title = "Start voice input";
        alert("Failed to start voice recognition: " + err.message);
        return;
    }

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;

        // Append to existing text with a space separator
        textarea.value += (textarea.value ? " " : "") + transcript;

        console.log(`Voice input: "${transcript}" (${Math.round(confidence * 100)}% confidence)`);
    };

    recognition.onend = function () {
        button.classList.remove("listening");
        button.title = "Start voice input";
    };

    recognition.onerror = function (event) {
        button.classList.remove("listening");
        button.title = "Start voice input";

        console.error("Speech recognition error:", event.error);

        if (event.error === 'no-speech') {
            alert("⚠️ No speech detected.\n\nPlease try again and speak clearly.");
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            alert("🎤 Microphone Access Denied\n\n" +
                "To enable microphone:\n\n" +
                "1. Click the 🔒 lock icon in address bar\n" +
                "2. Set Microphone to 'Allow'\n" +
                "3. Refresh page (Ctrl+R)\n" +
                "4. Try again");
        } else if (event.error === 'aborted') {
            // User stopped it, don't show error
            console.log("Voice input cancelled");
        } else {
            alert("❌ Voice recognition error: " + event.error);
        }
    };

    recognition.onspeechstart = function () {
        console.log("Speech detected, listening...");
    };

    recognition.onspeechend = function () {
        console.log("Speech ended");
    };
}

// Initialize voice button
document.addEventListener('DOMContentLoaded', () => {
    const voiceBtn = document.getElementById("voiceInputBtn");
    if (voiceBtn) {
        voiceBtn.addEventListener("click", startVoiceRecognition);
        console.log("✓ Voice input button initialized");
    } else {
        console.warn("Voice input button not found");
    }
});
