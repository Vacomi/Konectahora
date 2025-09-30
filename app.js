// 1. Cachear elementos del DOM para mayor eficiencia
const elements = {
  hour: document.getElementById('hour'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
  ampm: document.getElementById('ampm'),
  themeSwitcher: document.getElementById('themeSwitcher'), // Nuevo botón de tema
  body: document.body, // Referencia al body para cambiar el tema
  btnMenu: document.querySelector('.header__btn'),
  navMenu: document.getElementById('mainMenu'),
};

// ZONA PARA LA SECCION KBS
const kbsElements = {
  idInput: document.getElementById('kbInput-id'),
  descriptionInput: document.getElementById('kbInput-des'),
  addBtn: document.getElementById('KbBtn-add'),
  kbList: document.getElementById('kb-list'),
  kbs: JSON.parse(localStorage.getItem('kbs')) || [],
};

const renderKBs = () => {
  kbsElements.kbList.innerHTML = '';
  kbsElements.kbs.forEach(kb => {
    const kbItem = document.createElement('li');
    kbItem.className = 'kbs__item';
    kbItem.innerHTML = `
        <div class="kbs__info">
          <span class="kbs__number">${kb.id}</span>
          <span class="kbs__description">${kb.description}</span>
        </div>
        <div class="kbs__actions">
          <span class="material-symbols-outlined kb-action-btn copy-btn" data-id="${kb.id}" data-description="${kb.description}" title="Copiar">content_copy</span>

          <span class="material-symbols-outlined kb-action-btn edit-btn" data-id="${kb.id}" title="Editar">edit</span>

          <span class="material-symbols-outlined kb-action-btn delete-btn" data-id="${kb.id}" title="Eliminar">delete</span>

      `;
    kbsElements.kbList.appendChild(kbItem);
  });
}

const saveKB = () => {
  localStorage.setItem('kbs', JSON.stringify(kbsElements.kbs));
  renderKBs();
}

const clearKbInputs = () => {
  kbsElements.idInput.value = '';
  kbsElements.descriptionInput.value = '';
  kbsElements.addBtn.textContent = 'Agregar';
  kbsElements.addBtn.style.backgroundColor = 'var(--secondary-color)';
  kbsElements.addBtn.style.color = 'var(--text-color)';
}

kbsElements.addBtn.addEventListener('click', () => {
  const id = kbsElements.idInput.value.trim();
  const description = kbsElements.descriptionInput.value.trim();

  if (!id || !description) {
    // alert('Por favor, completa ambos campos.');
    return;
  }

  const existingIndex = kbsElements.kbs.findIndex(kb => kb.id === id);

  if (existingIndex !== -1) {
    kbsElements.kbs[existingIndex].description = description;
  } else {
    kbsElements.kbs.push({ id, description });
  }
  saveKB();
  clearKbInputs();
});

kbsElements.kbList.addEventListener('click', async (e) => {
  const target = e.target;
  const id = target.dataset.id;

  if (target.classList.contains('copy-btn')) {
    try {
      await navigator.clipboard.writeText(id);
      console.log('Texto copiado al portapapeles:', id);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
    //return;
  } else if (target.classList.contains('edit-btn')) {
    const kbToEdit = kbsElements.kbs.find(kb => kb.id === id);
    if (kbToEdit) {
      kbsElements.idInput.value = kbToEdit.id;
      kbsElements.descriptionInput.value = kbToEdit.description;
      kbsElements.addBtn.textContent = 'Guardar Cambios';
      kbsElements.addBtn.style.backgroundColor = '#fee800';
      kbsElements.addBtn.style.color = '#152b4a';
    }
  } else if (target.classList.contains('delete-btn')) {
    // const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este Kb?');
    // if (confirmDelete) {
      kbsElements.kbs = kbsElements.kbs.filter(kb => kb.id !== id);
      saveKB();
    // }
  }
});


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

-// Iniciar el reloj
-setInterval(updateClock, 1000);


/********* ZONA TEMPORIZADOR ******/
let btn1m = document.getElementById('opcion1m');
let btn3m = document.getElementById('opcion3m');
let tiempoDisplay = document.getElementById('tiempoDisplay');
let btnplay = document.getElementById('play');
let btnstop = document.getElementById('stop');
let alarmSound = document.getElementById('alarmSound'); // Referencia al elemento de audio

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
  if (intervalId) {
    clearInterval(intervalId);
  }
  btnplay.style.display = 'none';
  btnstop.style.display = 'block';
  intervalId = setInterval(() => {
    tiempoActual--;
    updateDisplay();
    if (tiempoActual <= 0) {
      clearInterval(intervalId);
      alarmSound.play();
      btnplay.style.display = 'block';
      btnstop.style.display = 'none';
      tiempoActual = selectedDuration;
      updateDisplay();
    }
  }, 1000);
}

// Función para detener la cuenta regresiva
function stopCountdown() {
  clearInterval(intervalId);
  tiempoActual = selectedDuration;
  btnplay.style.display = 'block';
  btnstop.style.display = 'none';
  updateDisplay();
}

function initializeTimer(duration) {
  stopCountdown();
  selectedDuration = duration;
  tiempoActual = selectedDuration;
  updateDisplay();
}

btn1m.addEventListener('click', () => {
  initializeTimer(60);
  btn1m.classList.add('temporizador__opcion--seleccionado');
  btn3m.classList.remove('temporizador__opcion--seleccionado');
});

btn3m.addEventListener('click', () => {
  initializeTimer(180);
  btn1m.classList.remove('temporizador__opcion--seleccionado');
  btn3m.classList.add('temporizador__opcion--seleccionado');
});

btnplay.addEventListener('click', startCountdown);
btnstop.addEventListener('click', stopCountdown);

// Lógica para el cambio de tema
const applyTheme = (theme) => {
  elements.body.dataset.theme = theme;
  localStorage.setItem('selectedTheme', theme); // Guardar la preferencia
  if (theme === 'dark') {
    elements.body.classList.add('dark-theme');
  } else {
    elements.body.classList.remove('dark-theme');
  }
};

elements.themeSwitcher.addEventListener('click', () => {
  const currentTheme = elements.body.dataset.theme;
  const newTheme = currentTheme === 'default' ? 'dark' : 'default';
  applyTheme(newTheme);
});


/******************ZONA ALARMA Y MODAL ****************/
const horarios = {
  hbreak1: null,
  hbreak2: null,
  hlunch: null,
}

let alarmasDisparadas = {
  hbreak1: false,
  hbreak2: false,
  hlunch: false,
};

const alertaModal = document.getElementById('alertaModal');
const alertaMensaje = document.getElementById('alertaMensaje');
const alertaAceptarBtn = document.getElementById('alertaAceptarBtn');
let alarmaSonido = new Audio('./sounds/FreshStart.mp3');

const btnOpenModal = document.getElementById('abrirModal');
const btnCloseModal = document.getElementById('cerrarModal');
const btnSaveHorarios = document.getElementById('guardarHorarios');
const visualBreak = document.getElementById('tiempoBreak1');
const visualBreak2 = document.getElementById('tiempoBreak2');
const visualLunch = document.getElementById('tiempoLunch');

function openModal() {
  const modal = document.getElementById('myModal');
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';
}

// ...existing code...
function formatHoraConIcono(hora24) {
  if (!hora24 || hora24 === "00:00") return "";
  const [h, m] = hora24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hora12 = ((h % 12) || 12).toString().padStart(2, '0');
  const minutos = m.toString().padStart(2, '0');
  // Sol: 6:00am - 5:59pm (06:00 - 17:59)
  const esDia = (h >= 6 && h < 18);
  const icono = esDia ? '☀️' : '🌙';
  return `${hora12}:${minutos} ${ampm} ${icono}`;
}


function saveHorarios() {
  horarios.hbreak1 = document.getElementById('breakTime').value;
  horarios.hbreak2 = document.getElementById('breakTime2').value;
  horarios.hlunch = document.getElementById('lunchTime').value;

  let listHoraAntes = JSON.parse(localStorage.getItem('horarios'));
  localStorage.setItem('horarios', JSON.stringify(horarios));
  let listHora = JSON.parse(localStorage.getItem('horarios'));



  // Para cada horario, si está vacío o "00:00", reinicia el estado de la alarma
  if (!listHora.hbreak1 || listHora.hbreak1 === "00:00") {
    alarmasDisparadas.hbreak1 = false;
    visualBreak.textContent = "Sin definir";
    visualBreak.classList.remove('alarm__time--used');
  } else {
    visualBreak.textContent = formatHoraConIcono(listHora.hbreak1);
    if (listHoraAntes.hbreak1 !== listHora.hbreak1) {
      alarmasDisparadas.hbreak1 = false;
      visualBreak.classList.remove('alarm__time--used');
    }
  }

  if (!listHora.hbreak2 || listHora.hbreak2 === "00:00") {
    alarmasDisparadas.hbreak2 = false;
    visualBreak2.textContent = "Sin definir";
    visualBreak2.classList.remove('alarm__time--used');
  } else {
    visualBreak2.textContent = formatHoraConIcono(listHora.hbreak2);
    if (listHoraAntes.hbreak2 !== listHora.hbreak2) {
      alarmasDisparadas.hbreak2 = false;
      visualBreak2.classList.remove('alarm__time--used');
    }
  }

  if (!listHora.hlunch || listHora.hlunch === "00:00") {
    alarmasDisparadas.hlunch = false;
    visualLunch.textContent = "Sin definir";
    visualLunch.classList.remove('alarm__time--used');
  } else {
    visualLunch.textContent = formatHoraConIcono(listHora.hlunch);
    if (listHoraAntes.hlunch !== listHora.hlunch) {
      alarmasDisparadas.hlunch = false;
      visualLunch.classList.remove('alarm__time--used');
    }
  }

  guardarEstadoAlarmas();
  closeModal();
}

function mostrarAlerta(mensaje) {
  alertaMensaje.textContent = mensaje;
  alertaModal.showModal();
  playSonidoAlarma();
}

function playSonidoAlarma() {
  alarmaSonido.loop = true;
  alarmaSonido.play();
}

function stopSonidoAlarma() {
  alarmaSonido.pause();
  alarmaSonido.currentTime = 0;
}

function verificarHorario() {
  const ahora = new Date();
  const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  const listHora = JSON.parse(localStorage.getItem('horarios'));

  if (!listHora) return;

  if (horaActual === listHora.hbreak1 && !alarmasDisparadas.hbreak1) {
    mostrarAlerta('¡Es hora de tu primer Break! ☕️');
    alarmasDisparadas.hbreak1 = true;
    // Añadiendo por si acaso
    visualBreak.classList.add('alarm__time--used');
  } else if (horaActual === listHora.hbreak2 && !alarmasDisparadas.hbreak2) {
    mostrarAlerta('¡Es hora de tu segundo Break! 🍎');
    alarmasDisparadas.hbreak2 = true;
    visualBreak2.classList.add('alarm__time--used');
  } else if (horaActual === listHora.hlunch && !alarmasDisparadas.hlunch) {
    mostrarAlerta('¡Es hora de tu Lunch! 🍲');
    alarmasDisparadas.hlunch = true;
    visualLunch.classList.add('alarm__time--used');
  }
}

function guardarEstadoAlarmas() {
  localStorage.setItem('alarmasDisparadas', JSON.stringify(alarmasDisparadas));
}

function reiniciarAlarmasDiarias() {
  const ahora = new Date();
  const ultimoReinicio = localStorage.getItem('ultimoReinicio');
  if (!ultimoReinicio || ahora.getDate() !== new Date(parseInt(ultimoReinicio)).getDate()) {
    alarmasDisparadas.hbreak1 = false;
    alarmasDisparadas.hbreak2 = false;
    alarmasDisparadas.hlunch = false;
    // Quitar la hora guardada o marcada
    horarios.hbreak1 = null;
    horarios.hbreak2 = null;
    horarios.hlunch = null;
    localStorage.setItem('horarios', JSON.stringify(horarios));
    visualBreak.classList.remove('alarm__time--used');
    visualBreak2.classList.remove('alarm__time--used');
    visualLunch.classList.remove('alarm__time--used');
    // También actualiza el texto a "Sin definir"
    visualBreak.textContent = "Sin definir";
    visualBreak2.textContent = "Sin definir";
    visualLunch.textContent = "Sin definir";
    guardarEstadoAlarmas();
    localStorage.setItem('ultimoReinicio', ahora.getTime());
  }
}

setInterval(verificarHorario, 1000);

// Manejo del menú en móvil
elements.btnMenu.addEventListener('click', () => {
  elements.navMenu.classList.toggle('active');
});

btnOpenModal.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
btnSaveHorarios.addEventListener('click', saveHorarios);

alertaAceptarBtn.addEventListener('click', () => {
  alertaModal.close();
  stopSonidoAlarma();
  guardarEstadoAlarmas();
});

// CÓDIGO DE INICIALIZACIÓN UNIFICADO
document.addEventListener('DOMContentLoaded', () => {
  // 1. Cargar tema
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme('default');
  }
  // 2. Inicializar el temporizador
 initializeTimer(60);

  // 3. Cargar horarios y estado de alarmas
  const listHora = JSON.parse(localStorage.getItem('horarios'));
  const estadoGuardado = JSON.parse(localStorage.getItem('alarmasDisparadas'));

  if (listHora) {
    if (listHora.hbreak1) {
      visualBreak.textContent = formatHoraConIcono(listHora.hbreak1);
    }
    if (listHora.hbreak2) {
      visualBreak2.textContent = formatHoraConIcono(listHora.hbreak2);
    }
    if (listHora.hlunch) {
      visualLunch.textContent = formatHoraConIcono(listHora.hlunch);
    }
  }

  if (estadoGuardado) {
    console.log("Estado de alarmas cargado:", estadoGuardado);

    alarmasDisparadas = estadoGuardado;
    for (let element in alarmasDisparadas) {
      if (alarmasDisparadas.hbreak1) {
        visualBreak.classList.add('alarm__time--used');
      }
      if (alarmasDisparadas.hbreak2) {
        visualBreak2.classList.add('alarm__time--used');
      }
      if (alarmasDisparadas.hlunch) {
        visualLunch.classList.add('alarm__time--used');
      }
    }
  }

  // 4. Lógica para reiniciar las alarmas al inicio de un nuevo día
  reiniciarAlarmasDiarias();
  clearKbInputs();
  renderKBs(); // Renderizar los Kbs al cargar la página
});