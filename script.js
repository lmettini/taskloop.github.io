let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentTaskIndex = 0;
let selectedInterval = parseInt(localStorage.getItem('selectedInterval')) || 300; // default to 5 minutes
let endTime;
let isPaused = false;
let pendingTimeWhenPause;

document.addEventListener('DOMContentLoaded', () => {
    requestNotificationPermission();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').then(reg => {
            console.log('Service Worker registered', reg);
        }).catch(err => {
            console.error('Service Worker registration failed', err);
        });
    }
    loadTasks();
    loadInterval();
    enableDragAndDrop();
    updateUI();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    document.getElementById('start-btn').addEventListener('click', () => {
        initAudioContext();
        startRoundRobin();
    });
});

function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            } else {
                console.log('Notification permission denied.');
            }
        });
    }
}

let audioContext;
let audioBuffer;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        fetch('assets/ding.mp3')
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
                audioBuffer = buffer;
            })
            .catch(error => console.error('Error loading audio:', error));
    }
}

function playSound() {
    if (audioContext && audioBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    } else {
        console.error('Audio context or buffer not initialized');
    }
}

function sendNotification(title, body) {
    if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: 'assets/icon-192x192.png',
                vibrate: [200, 100, 200],
                sound: 'assets/ding.mp3'
            });
        });
    }
}

function loadTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => {
            tasks = tasks.filter(t => t !== task);
            taskList.removeChild(li);
            saveTasks();
        };
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });
    saveTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadInterval() {
    const buttons = document.querySelectorAll('.pill-selector button');
    buttons.forEach(button => {
        const intervalValue = parseInt(button.getAttribute('onclick').match(/\d+/)[0]);
        if (intervalValue === selectedInterval) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}

function saveInterval() {
    localStorage.setItem('selectedInterval', selectedInterval);
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    if (taskInput.value.trim() !== "") {
        const task = taskInput.value.trim();
        tasks.push(task);
        saveTasks();
        loadTasks();
        taskInput.value = "";
    }
}

function selectInterval(seconds) {
    selectedInterval = seconds;
    saveInterval();
    loadInterval();
}

function startRoundRobin() {
    if (tasks.length > 0) {
        interval = selectedInterval;
        currentTaskIndex = 0;
        speakText(`First task: ${tasks[(currentTaskIndex) % tasks.length]}`);
        isPaused = false;
        startNewTask();
    }
}

function startNewTask() {
    if (currentTaskIndex >= tasks.length) {
        currentTaskIndex = 0;
    }
    document.getElementById('task-input-section').style.display = 'none';
    document.getElementById('task-runner-section').style.display = 'block';
    document.getElementById('current-task').textContent = tasks[currentTaskIndex];
    endTime = Date.now() + selectedInterval * 1000;
    updateCountdown();
}

function updateCountdown() {
    if (isPaused) {
        return;
    }

    if (endTime != null) {
        const remainingTime = Math.max(0, endTime - Date.now());
        document.getElementById('countdown').textContent = formatTime(Math.floor(remainingTime / 1000));
    
        if (remainingTime > 0) {
            requestAnimationFrame(updateCountdown);
        } else {
            handleNextTask();
        }
        updateLockScreenNotification();
    }
}

function handleNextTask() {
    playSound();
    sendNotification('TaskLoop', `Next task: ${tasks[(currentTaskIndex) % tasks.length]}`);
    if ('vibrate' in navigator) {
        navigator.vibrate(1000);
    }
    setTimeout(() => {
        speakText(`Next task: ${tasks[(currentTaskIndex) % tasks.length]}`);
    }, 1000);
    currentTaskIndex++;
    startNewTask();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
}

function pauseResumeTimer() {
    isPaused = !isPaused;
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    if (isPaused) {
        pendingTimeWhenPause = endTime - Date.now();
        endTime = null;
        pauseResumeBtn.textContent = 'Resume';
    } else {
        if (pendingTimeWhenPause != null) {
            endTime = Date.now() + pendingTimeWhenPause;
        }
        updateCountdown();
        pauseResumeBtn.textContent = 'Pause';
    }
}

function skipTask() {
    if (isPaused) {
        pauseResumeTimer();
    }
    handleNextTask();
}

function resetApp() {
    isPaused = true;
    document.getElementById('pause-resume-btn').textContent = 'Pause';
    document.getElementById('task-input-section').style.display = 'block';
    document.getElementById('task-runner-section').style.display = 'none';
    loadTasks();
    loadInterval();
}

function speakText(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    window.speechSynthesis.speak(msg);
}

function updateLockScreenNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.getRegistration().then(registration => {
            registration.showNotification('TaskLoop', {
                body: `Current Task: ${tasks[currentTaskIndex]}`,
                tag: 'taskloop-notification'
            });
        });
    }
}

function enableDragAndDrop() {
    const taskList = document.getElementById('task-list');
    new Sortable(taskList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: () => {
            tasks = Array.from(taskList.children).map(li => li.childNodes[0].textContent.trim());
            saveTasks();
        },
    });
}

function handleVisibilityChange() {
    if (document.hidden) {
        if (endTime != null) {
            pendingTimeWhenPause = endTime - Date.now();
            localStorage.setItem('pendingTimeWhenPause', pendingTimeWhenPause);
            localStorage.setItem('currentTaskIndex', currentTaskIndex);
            localStorage.setItem('endTime', endTime);
        }
    } else {
        const savedEndTime = localStorage.getItem('endTime');
        if (savedEndTime) {
            endTime = parseInt(savedEndTime, 10);
            const now = Date.now();
            if (now < endTime) {
                pendingTimeWhenPause = endTime - now;
                updateCountdown();
            } else {
                handleNextTask();
            }
        }
    }
}

function updateUI() {
    loadTasks();
    loadInterval();
    if (tasks.length > 0) {
        document.getElementById('task-input-section').style.display = 'block';
        document.getElementById('task-runner-section').style.display = 'none';
    } else {
        document.getElementById('task-input-section').style.display = 'block';
        document.getElementById('task-runner-section').style.display = 'none';
    }
}
