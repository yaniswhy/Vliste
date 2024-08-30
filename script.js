// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'fr-FR';  // Set initial language to French
recognition.interimResults = true;  // Capture interim results for real-time updates
recognition.maxAlternatives = 1;

const recordButton = document.getElementById('recordButton');
const taskList = document.getElementById('taskList');

let isRecording = false;
let currentTask = null;
let lastProcessedFinalTranscript = '';  // Store the last processed final transcript
let interimTranscript = '';  // Store interim transcript

// Toggle recording state
recordButton.addEventListener('click', () => {
    if (isRecording) {
        recognition.stop();
        finalizeTask();  // Finalize the task when stopping recording
    } else {
        recognition.start();
        startNewTask();  // Start a new task when starting recording
    }
    isRecording = !isRecording;
    recordButton.classList.toggle('recording');
});

// Handle interim and final results
recognition.addEventListener('result', (event) => {
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript;
        } else {
            interimTranscript = transcript;
        }
    }

    if (finalTranscript && finalTranscript !== lastProcessedFinalTranscript) {
        updateTask(finalTranscript.trim(), true);  // Update with final text only if it's new
        lastProcessedFinalTranscript = finalTranscript.trim();  // Update the last processed final transcript
    } else if (interimTranscript) {
        updateTask(interimTranscript.trim(), false);  // Update with interim text
    }
});

// Handle recognition end
recognition.addEventListener('end', () => {
    if (isRecording) {
        recognition.start(); // Continue listening if button is still active
    } else {
        recordButton.classList.remove('recording');
    }
});

// Start a new task
function startNewTask() {
    currentTask = addTask('', true);  // Start with an empty task
}

// Update the current task with the transcript
function updateTask(text, isFinal) {
    if (currentTask) {
        const taskContent = currentTask.querySelector('.task-text');
        if (isFinal) {
            // Replace interim content with final content
            taskContent.textContent = text;
            currentTask.style.color = '#000';  // Turn text black when final
        } else {
            // Update interim content
            taskContent.textContent = text;
        }
    }
}

// Finalize the current task
function finalizeTask() {
    if (currentTask) {
        currentTask.style.color = '#000';  // Finalize the task text
        currentTask = null;  // Reset for the next task
        lastProcessedFinalTranscript = '';  // Reset the last transcript
        interimTranscript = '';  // Reset interim transcript
    }
}

// Add task to the list, optionally mark as interim
function addTask(taskText, isInterim = false) {
    const listItem = document.createElement('li');
    listItem.className = 'task-item';  // Add class for animation

    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.addEventListener('change', (e) => {
        if (e.target.checked) {
            listItem.classList.add('checked');
            // Remove task after animation ends
            setTimeout(() => {
                listItem.remove();
            }, 1500);  // Delay must match animation duration
        } else {
            listItem.classList.remove('checked');
        }
    });

    const taskContent = document.createElement('span');
    taskContent.className = 'task-text';
    taskContent.textContent = taskText;
    
    listItem.appendChild(checkBox);
    listItem.appendChild(taskContent);

    // If it's an interim task, style it differently
    if (isInterim) {
        listItem.style.color = '#888';  // Light grey for interim text
    }

    taskList.appendChild(listItem);

    // Scroll to the bottom to show the newly added task
    taskList.scrollTop = taskList.scrollHeight;

    return listItem;
}
    