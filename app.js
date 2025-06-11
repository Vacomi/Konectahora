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