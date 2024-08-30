// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'fr-FR';  // Set initial language to French
recognition.interimResults = true;  // Capture interim results for real-time updates
recognition.maxAlternatives = 1;

const recordButton = document.getElementById('recordButton');
const taskList = document.getElementById('taskList');

let isRecording = false;
let interimTask = null;
let finalTranscript = "";

// Toggle recording state
recordButton.addEventListener('click', () => {
    if (isRecording) {
        recognition.stop();
        if (interimTask) {
            const taskText = finalTranscript.trim();
            interimTask.querySelector('.task-text').textContent = taskText;
            interimTask.style.color = '#000';
            saveTaskToFirebase(taskText);  // Save the finalized task to Firebase
            interimTask = null;
            finalTranscript = "";  // Clear final transcript
        }
    } else {
        finalTranscript = "";  // Reset transcript when starting a new recording
        recognition.start();
    }
    isRecording = !isRecording;
    recordButton.classList.toggle('recording');
});

// Handle interim and final results
recognition.addEventListener('result', (event) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
        }
    }

    if (!interimTask) {
        interimTask = addTask(interimTranscript, true);
    } else {
        interimTask.querySelector('.task-text').textContent = finalTranscript + interimTranscript;
    }
});

// Handle recognition end
recognition.addEventListener('end', () => {
    if (isRecording) {
        recognition.start();  // Continue listening if still recording
    } else {
        recordButton.classList.remove('recording');
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

    listItem.style.color = isInterim ? '#888' : '#000';  // Light grey for interim text

    taskList.appendChild(listItem);
    taskList.scrollTop = taskList.scrollHeight;  // Scroll to the bottom to show the new task

    return listItem;
}

// Function to save task to Firebase
function saveTaskToFirebase(taskText) {
    const newTaskRef = push(ref(database, 'tasks'));
    set(newTaskRef, {
        text: taskText,
        completed: false
    });
}

// Load tasks from Firebase
window.addEventListener('load', () => {
    const tasksRef = ref(database, 'tasks');
    onValue(tasksRef, (snapshot) => {
        taskList.innerHTML = '';  // Clear current list
        snapshot.forEach((childSnapshot) => {
            const taskData = childSnapshot.val();
            const listItem = addTask(taskData.text);
            if (taskData.completed) {
                listItem.querySelector('input[type="checkbox"]').checked = true;
                listItem.classList.add('checked');
            }
        });
    });
});
