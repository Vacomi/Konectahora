// 1. Cachear elementos del DOM para mayor eficiencia
const elements = {
    hour: document.getElementById('hour'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    ampm: document.getElementById('ampm'),
    registroDiv: document.getElementById('registro'),
    btnBreak: document.getElementById('btnBreak'),
    btnLunch: document.getElementById('btnLunch'),
};

// 2. Objeto para mantener el estado de la aplicación
const appState = {
    breakStartTime: null,
    lunchStartTime: null,
};

const initialMessage = 'Empieza marcando tu Break o tu Lunch ...';

// 3. Función auxiliar para formatear la hora (DRY)
const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
    return `${displayHours}:${minutes}:${seconds} ${ampm}`;
};

// 4. Función para actualizar el reloj principal
const updateClock = () => {
    const now = new Date();
    elements.hour.textContent = (now.getHours() % 12 || 12).toString().padStart(2, '0');
    elements.minutes.textContent = now.getMinutes().toString().padStart(2, '0');
    elements.seconds.textContent = now.getSeconds().toString().padStart(2, '0');
    elements.ampm.textContent = now.getHours() >= 12 ? 'PM' : 'AM';
};

// 5. Función genérica para manejar los clics en los botones
const handleMarking = (eventType) => {
    const now = new Date();
    const timeString = formatTime(now);
    const stateKey = `${eventType.toLowerCase()}StartTime`; // 'breakStartTime' o 'lunchStartTime'
    const btn = eventType === 'Break' ? elements.btnBreak : elements.btnLunch;
    const otherBtn = eventType === 'Break' ? elements.btnLunch : elements.btnBreak;

    if (!appState[stateKey]) { // Iniciar marca
        appState[stateKey] = timeString;
        btn.textContent = btn.dataset.textEnd;
        otherBtn.disabled = true;

        elements.registroDiv.innerHTML = `
            <div class="registro-item">
                <span class="text-success">${eventType}:</span>
                <span class="text-info">Inicio ${appState[stateKey]}</span>
            </div>`;
    } else { // Finalizar marca
        const endTime = timeString;
        const startTime = appState[stateKey];
        
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'x';
        btnEliminar.className = 'btn-eliminar-registro';
        btnEliminar.addEventListener('click', () => {
            resetUI();
        });

        const logEntry = document.createElement('div');
        logEntry.className = 'registro-item';
        logEntry.innerHTML = `
            <span class="text-success">${eventType}:</span>
            <span class="text-info">Inicio ${startTime} - Fin ${endTime}</span>`;
        logEntry.appendChild(btnEliminar);

        elements.registroDiv.innerHTML = '';
        elements.registroDiv.appendChild(logEntry);
        
        resetState(eventType);
    }
};

const resetState = (eventType) => {
    const stateKey = `${eventType.toLowerCase()}StartTime`;
    const btn = eventType === 'Break' ? elements.btnBreak : elements.btnLunch;
    
    appState[stateKey] = null;
    btn.textContent = btn.dataset.textStart;
    elements.btnBreak.disabled = false;
    elements.btnLunch.disabled = false;
};

const resetUI = () => {
    elements.registroDiv.innerHTML = `<p>${initialMessage}</p>`;
    appState.breakStartTime = null;
    appState.lunchStartTime = null;
    elements.btnBreak.textContent = elements.btnBreak.dataset.textStart;
    elements.btnLunch.textContent = elements.btnLunch.dataset.textStart;
    elements.btnBreak.disabled = false;
    elements.btnLunch.disabled = false;
};


// 6. Asignar los eventos
elements.btnBreak.addEventListener('click', () => handleMarking('Break'));
elements.btnLunch.addEventListener('click', () => handleMarking('Lunch'));

// Iniciar el reloj y la UI
setInterval(updateClock, 1000);
resetUI(); // Llama para establecer el estado inicial

// Temporizador
// let pomodoro = document.getElementById('pomodoro-timer');
let short = document.getElementById('short-timer');
let long = document.getElementById('long-timer');
let timers = document.querySelectorAll('.timer-display');
let shortBreak = document.getElementById('short-break');
let longBreak = document.getElementById('long-break');
let startBtn = document.getElementById('start');
let stopBtn = document.getElementById('stop');
let timerMsg = document.getElementById('timer-message');
let button = document.querySelector('.boton');

let currentTimer = null;
let myInterval = null;

//
function showDefaultTimer() {
    short.style.display = "block";
    long.style.display = "none";
}

showDefaultTimer();

function hideAll() {
    timers.forEach( timer => {
        timer.style.display = "none"; 
    });
}
shortBreak.addEventListener("click", () => {
    hideAll();
    short.style.display = "block";

    shortBreak.classList.add("active");
    longBreak.classList.remove("active");

    currentTimer = short;
});

longBreak.addEventListener("click", () => {
    hideAll();
    long.style.display = "block";

    shortBreak.classList.remove("active");
    longBreak.classList.add("active");

    currentTimer = long;
});

function startTimer (timerDisplay) {
    if(myInterval) {
        clearInterval(myInterval)
    }

    timerDuration = timerDisplay.getAttribute('data-duration').split(':')[0];

    let durationMiliseconds = timerDuration * 60 * 1000; 
    let endTimestamp = Date.now() + durationMiliseconds;
    myInterval = setInterval( ()=> {
        const timeRemaining = new Date(endTimestamp - Date.now());

        if(timeRemaining <= 0 ) {
            clearInterval(myInterval);
            timerDisplay.textContent = '00:00';

            const alarm = new Audio("https://www.freespecialeffects.co.uk/soundfx/scifi/electronic.wav");
             alarm.play();
        }  else {
          const minutes = Math.floor(timeRemaining / 60000);
          const seconds = ((timeRemaining % 60000) / 1000).toFixed(0);
          const formattedTime = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;
          timerDisplay.textContent = formattedTime;
        }

    }, 1000 )
}

startBtn.addEventListener('click', () => {
    if(currentTimer) {
        startTimer(currentTimer);
        timerMsg.style.display = 'none';
    } else {
        timerMsg.style.display = 'block';
    }
})

stopBtn.addEventListener("click", () => {
    if(currentTimer) {
        clearInterval(myInterval)
    }
})

