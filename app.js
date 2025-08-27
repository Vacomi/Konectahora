// 1. Cachear elementos del DOM para mayor eficiencia
const elements = {
    hour: document.getElementById('hour'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    ampm: document.getElementById('ampm'),
    registroDiv: document.getElementById('registro'),
    btnBreak: document.getElementById('btnBreak'),
    btnLunch: document.getElementById('btnLunch'),

    // Nuevos elementos para el temporizador
    // btn1m: document.getElementById('opcion1m'),
    // btn3m: document.getElementById('opcion3m'),
    // tiempoDisplay: document.getElementById('tiempoDisplay'),
    // btnplay: document.getElementById('play'),
    // btnstop: document.getElementById('stop'),
    // alarmSound: document.getElementById('alarmSound'),
    themeSwitcher: document.getElementById('themeSwitcher'), // Nuevo botón de tema
    body: document.body, // Referencia al body para cambiar el tema
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


/*************************** ZONA TEMPORIZADOR *****************************/
let btn1m = document.getElementById('opcion1m');
let btn3m = document.getElementById('opcion3m');
// let pantalla1m = document.getElementById('tiempo1');
let tiempoDisplay = document.getElementById('tiempoDisplay');
// let pantalla3m = document.getElementById('tiempo3');
let btnplay = document.getElementById('play');
let btnstop = document.getElementById('stop');
let alarmSound = document.getElementById('alarmSound'); // Referencia al elemento de audio

// let tiempoActual = 60;
let tiempoActual;
let intervalId;
let selectedDuration;

  // Función para formatear segundos a MM:SS
function formatTimet(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

function updateDisplay() {
    tiempoDisplay.textContent = formatTimet(tiempoActual);
}

// Función para iniciar la cuenta regresiva
function startCountdown() {
    // Si ya hay un temporizador corriendo, lo limpiamos para evitar duplicados
    if (intervalId) {
        clearInterval(intervalId);
    }

    // Ocultar el botón Play y mostrar el botón Stop
    btnplay.style.display = 'none';
    btnstop.style.display = 'block';

    // Iniciar el intervalo que se ejecuta cada segundo
    intervalId = setInterval(() => {
        tiempoActual--; // Decrementar el tiempo en un segundo
        updateDisplay(); // Actualizar la pantalla con el nuevo tiempo

        // Si el tiempo llega a cero o menos
        if (tiempoActual <= 0) {
            clearInterval(intervalId); // Detener el intervalo
            alarmSound.play(); // Reproducir la alarma
            btnplay.style.display = 'block'; // Mostrar el botón Play
            btnstop.style.display = 'none';  // Ocultar el botón Stop
            tiempoActual = selectedDuration; // Resetear el tiempo a la duración inicial seleccionada
            updateDisplay(); // Actualizar la pantalla para mostrar 00:00 o el tiempo inicial
        }
    }, 1000); // El intervalo es de 1000 milisegundos (1 segundo)
}

// Función para detener la cuenta regresiva
function stopCountdown() {
    clearInterval(intervalId); // Limpiar el intervalo para pausar el temporizador
    tiempoActual = selectedDuration;
    btnplay.style.display = 'block'; // Mostrar el botón Play
    btnstop.style.display = 'none';  // Ocultar el botón Stop
    updateDisplay();
}

// Función para inicializar el temporizador (establecer duración y actualizar pantalla)
function initializeTimer(duration) {
    stopCountdown(); // Asegurarse de que cualquier temporizador anterior esté detenido
    selectedDuration = duration; // Establecer la duración inicial
    tiempoActual = selectedDuration; // Establecer el tiempo actual a la duración inicial
    updateDisplay(); // Actualizar la pantalla con el tiempo inicial formateado
}

// Event Listeners para las opciones de duración (1 Minuto, 3 Minutos)
btn1m.addEventListener('click', () => {
    initializeTimer(60); // 1 minuto = 60 segundos
    btn1m.classList.add('temporizador__opcion--seleccionado'); // Marcar como seleccionado
    btn3m.classList.remove('temporizador__opcion--seleccionado'); // Desmarcar el otro
});

btn3m.addEventListener('click', () => {
    initializeTimer(180); // 3 minutos = 180 segundos
    btn1m.classList.remove('temporizador__opcion--seleccionado'); // Desmarcar el otro
    btn3m.classList.add('temporizador__opcion--seleccionado'); // Marcar como seleccionado
});

// Event Listeners para los botones Play y Stop
btnplay.addEventListener('click', startCountdown);
btnstop.addEventListener('click', stopCountdown);

// Inicializar el temporizador con 1 minuto por defecto al cargar la página
// document.addEventListener('DOMContentLoaded', () => {
//     initializeTimer(60); 
// });

// Lógica para el cambio de tema
const applyTheme = (theme) => {
    elements.body.dataset.theme = theme;
    localStorage.setItem('selectedTheme', theme); // Guardar la preferencia
    if (theme === 'pink') {
        elements.body.classList.add('pink-theme');
    } else {
        elements.body.classList.remove('pink-theme');
    }
};

elements.themeSwitcher.addEventListener('click', () => {
    const currentTheme = elements.body.dataset.theme;
    const newTheme = currentTheme === 'default' ? 'pink' : 'default';
    applyTheme(newTheme);
});

// Inicializar la aplicación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Cargar tema guardado o usar por defecto
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('default'); // Aplicar el tema por defecto si no hay nada guardado
    }

    // Inicializar el temporizador con 1 minuto por defecto
    initializeTimer(60);
});


// VACOMI IDEA
// function verTiempoDefecto() {
//     pantalla1m.style.display = "block";
//     pantalla3m.style.display = "none";
// }

// function actualizarTiempo() {

// }

// verTiempoDefecto();

// btn1m.addEventListener('click', () => {
//     ejecutandoTiempo = false;
//     tiempoActual = 60;
//     pantalla1m.style.display = 'block';
//     pantalla3m.style.display = 'none';
//     btn1m.classList.add('temporizador__opcion--seleccionado');
//     btn3m.classList.remove('temporizador__opcion--seleccionado');
// });

// btn3m.addEventListener('click', () => {
//     ejecutandoTiempo = false;
//     tiempoActual = 180;
//     pantalla3m.style.display = 'block';
//     pantalla1m.style.display = 'none';
//     btn1m.classList.remove('temporizador__opcion--seleccionado');
//     btn3m.classList.add('temporizador__opcion--seleccionado');
// });

// btnplay.addEventListener('click', () => {
//     ejecutandoTiempo = true;
//     btnplay.style.display = 'none';
//     btnstop.style.display = 'block';
// });
// btnstop.addEventListener('click', () => {
//     ejecutandoTiempo = false;
//     btnplay.style.display = 'block';
//     btnstop.style.display = 'none';
// });

// OTRA PARTE DEL CODE
// let pomodoro = document.getElementById('pomodoro-timer');
// let short = document.getElementById('short-timer');
// let long = document.getElementById('long-timer');
// let timers = document.querySelectorAll('.timer-display');
// let shortBreak = document.getElementById('short-break');
// let longBreak = document.getElementById('long-break');
// let startBtn = document.getElementById('start');
// let stopBtn = document.getElementById('stop');
// let timerMsg = document.getElementById('timer-message');
// let button = document.querySelector('.boton');

// let currentTimer = null;
// let myInterval = null;


// function showDefaultTimer() {
//     short.style.display = "block";
//     long.style.display = "none";
// }

// showDefaultTimer();

// function hideAll() {
//     timers.forEach( timer => {
//         timer.style.display = "none"; 
//     });
// }
// shortBreak.addEventListener("click", () => {
//     hideAll();
//     short.style.display = "block";

//     shortBreak.classList.add("active");
//     longBreak.classList.remove("active");

//     currentTimer = short;
// });

// longBreak.addEventListener("click", () => {
//     hideAll();
//     long.style.display = "block";

//     shortBreak.classList.remove("active");
//     longBreak.classList.add("active");

//     currentTimer = long;
// });

// function startTimer (timerDisplay) {
//     if(myInterval) {
//         clearInterval(myInterval)
//     }

//     timerDuration = timerDisplay.getAttribute('data-duration').split(':')[0];

//     let durationMiliseconds = timerDuration * 60 * 1000; 
//     let endTimestamp = Date.now() + durationMiliseconds;
//     myInterval = setInterval( ()=> {
//         const timeRemaining = new Date(endTimestamp - Date.now());

//         if(timeRemaining <= 0 ) {
//             clearInterval(myInterval);
//             timerDisplay.textContent = '00:00';

//             const alarm = new Audio("https://www.freespecialeffects.co.uk/soundfx/scifi/electronic.wav");
//              alarm.play();
//         }  else {
//           const minutes = Math.floor(timeRemaining / 60000);
//           const seconds = ((timeRemaining % 60000) / 1000).toFixed(0);
//           const formattedTime = `${minutes}:${seconds
//             .toString()
//             .padStart(2, "0")}`;
//           timerDisplay.textContent = formattedTime;
//         }

//     }, 1000 )
// }

// startBtn.addEventListener('click', () => {
//     if(currentTimer) {
//         startTimer(currentTimer);
//         timerMsg.style.display = 'none';
//     } else {
//         timerMsg.style.display = 'block';
//     }
// })

// stopBtn.addEventListener("click", () => {
//     if(currentTimer) {
//         clearInterval(myInterval)
//     }
// })

