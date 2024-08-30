document.addEventListener('DOMContentLoaded', () => {
    const circle = document.getElementById('circle');
    const taskList = document.getElementById('task-list');

    let isListening = false;
    let recognition;
    let currentTaskElement = null;

    // Check if the browser supports Web Speech API
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        alert("Sorry, your browser doesn't support speech recognition.");
    }

    if (recognition) {
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = function () {
            circle.classList.add('listening');
            isListening = true;
            createNewTaskCell();  // Create a new task cell when recording starts
        };

        recognition.onresult = function (event) {
            let interimText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    appendToTask(transcript);
                } else {
                    interimText += transcript;
                }
            }
            updateInterimTask(interimText);
        };

        recognition.onerror = function () {
            alert("Error occurred in recognition. Please try again.");
            stopListening();
        };

        recognition.onend = function () {
            stopListening();
        };

        circle.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();  // Stop listening if already in progress
            } else {
                recognition.start(); // Start listening if not in progress
            }
        });
    }

    function createNewTaskCell() {
        currentTaskElement = document.createElement('li');
        currentTaskElement.textContent = '';
        taskList.appendChild(currentTaskElement);
    }

    function appendToTask(text) {
        if (currentTaskElement) {
            currentTaskElement.textContent += text + ' ';
        }
    }

    function updateInterimTask(interimText) {
        if (currentTaskElement) {
            currentTaskElement.textContent = interimText;
        }
    }

    function stopListening() {
        circle.classList.remove('listening');
        isListening = false;
        currentTaskElement = null;
    }
});



