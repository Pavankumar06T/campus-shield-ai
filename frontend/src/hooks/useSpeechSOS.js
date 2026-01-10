import { useState, useEffect, useRef } from 'react';

export const useSpeechSOS = (triggerSOSCallback) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Browser Support Check
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            // Only process if we are actually supposed to be listening
            // This prevents "ghost" listeners from previous renders
            if (isListening) {
                checkKeywords(currentTranscript);
            }
        };

        recognition.onend = () => {
            // ONLY restart if the USER explicitly wanted it to be listening
            // and didn't press stop.
            if (isListening) {
                try {
                    recognition.start();
                } catch (e) { /* ignore */ }
            }
        };

        recognitionRef.current = recognition;

        // If 'isListening' became true, start it.
        if (isListening) {
            try {
                recognition.start();
            } catch (e) {
                console.log("Recognition already started");
            }
        } else {
            recognition.stop();
        }

        return () => {
            recognition.stop();
        };
    }, [isListening]);

    const checkKeywords = (text) => {
        const safeWords = ['HELP', 'EMERGENCY', 'SAVE ME', 'SHIELD', 'DANGER'];
        const upperText = text.toUpperCase();

        const detected = safeWords.find(word => upperText.includes(word));
        if (detected) {
            console.log(`Voice SOS Triggered by: ${detected}`);
            triggerSOSCallback(detected); // Pass the trigger word
            stopListening(); // Stop after trigger to prevent spam
        }
    };

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error("Voice SOS Start Error:", error);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { isListening, transcript, startListening, stopListening };
};
