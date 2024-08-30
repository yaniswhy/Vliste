// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'fr-FR';  // Set initial language to French
recognition.interimResults = true;  // Capture interim results for real-time updates
recognition.maxAlternatives = 1;

// Add English language option
recognition.lang = "fr-FR, en-US";

const recordButton = document.getElementById('recordButton');
const taskList = document.getElementById('taskList');

let isRecording = false;
let interimTask = null;

// Toggle recording state
recordButton.addEventListener('click', () => {
    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
    isRecording = !isRecording;
    recordButton.classList.toggle('recording');
});

// Handle interim and final results
recognition.addEventListener('result', (event) => {
    const interimTranscript = event.results[0][0].transcript;

    // If it's the first interim result, create a new task item
    if (event.results[0].isFinal) {
        if (interimTask) {
            interimTask.querySelector('.task-text').textContent = interimTranscript;
            interimTask = null;  // Reset interimTask
        } else {
            addTask(interimTranscript);
        }
    } else {
        if (!interimTask) {
            interimTask = addTask(interimTranscript, true);
        } else {
            interimTask.querySelector('.task-text').textContent = interimTranscript;
        }
    }
});

// Handle recognition end
recognition.addEventListener('end', () => {
    if (isRecording) {
        recognition.start(); // Continue listening if button is still active
    } else {
        recordButton.classList.remove('recording');
        interimTask = null;  // Reset interimTask on stop
    }
});

// Add task to the list, optionally mark as interim
function addTask(taskText, isInterim = false) {
    const listItem = document.createElement('li');
    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.addEventListener('change', (e) => {
        if (e.target.checked) {
            listItem.classList.add('checked');
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
    } else {
        listItem.style.color = '#000';  // Black for final text
    }

    taskList.appendChild(listItem);

    // Scroll to the bottom to show the newly added task
    taskList.scrollTop = taskList.scrollHeight;

    return listItem;
}





