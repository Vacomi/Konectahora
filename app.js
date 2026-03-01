// 1. Cachear elementos del DOM para mayor eficiencia
const elements = {
  themeSwitcher: document.getElementById('themeSwitcher'), // Nuevo botón de tema
  body: document.body, // Referencia al body para cambiar el tema
};

const MenuModule = (function () {
  const elements = {
    btnMenu: document.querySelector('.header__btn'),
    navMenu: document.getElementById('mainMenu'),
  };

  function init() {
    // 1. Lógica para abrir/cerrar menú en móvil (movido de tu código global)
    if (elements.btnMenu) {
      elements.btnMenu.addEventListener('click', () => {
        elements.navMenu.classList.toggle('active');
      });
    }

    // 2. Lógica para copiar URLs
    elements.navMenu.addEventListener('click', async (e) => {
      // Verificamos si el elemento clickeado tiene la clase 'copy-link-btn'
      if (e.target.classList.contains('copy-link-btn')) {
        const urlToCopy = e.target.getAttribute('data-url');

        try {
          // Copiamos al portapapeles
          await navigator.clipboard.writeText(urlToCopy);

          // Feedback Visual: Cambiamos el icono temporalmente
          const originalIcon = e.target.textContent;
          e.target.textContent = 'check'; // Cambia al icono de "check"
          e.target.style.color = '#4caf50'; // Verde de éxito

          // Después de 2 segundos, lo devolvemos a la normalidad
          setTimeout(() => {
            e.target.textContent = originalIcon;
            e.target.style.color = ''; // Quita el verde para usar el color CSS por defecto
          }, 2000);
        } catch (err) {
          console.error('Error al copiar el enlace: ', err);
          // Opcional: mostrar un alert si falla
        }
      }
    });
  }

  return { init: init };
})();

//--- Módulo del Temporizador ---
const TimerModule = (function () {
  const timer = {
    // 1. Elementos del DOM
    elements: {
      display: document.querySelector('#tiempoDisplay'),
      btnPlay: document.querySelector('#play'),
      btnStop: document.querySelector('#stop'),
      progressCircle: document.querySelector('#progressCircle'),
      dot: document.querySelector('#dot'),
      opciones: document.querySelectorAll('.temporizador__opcion'),
    },
    // 2. Estado de la aplicación del temporizador
    state: {
      tiempoActual: 0,
      animationFrameId: null,
      selectedDuration: 0,
      isRunning: false,
      startTime: 0,
      // ALMACENAREMOS EL ID DEL TIMEOUT PARA PODER CANCELARLO
      alarmTimeoutId: null,
    },
    // 3. Constantes o configuración
    config: {
      // CIRCLE_CIRCUMFERENCE: 2 * Math.PI * 70,
      CIRCLE_CIRCUMFERENCE: 2 * Math.PI * 60,
    },
    // 4. Recurso de sonido
    resources: {
      alarmSound: document.getElementById('alarmSound'),
    },
  };

  function formatTimes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  }
  function updateDisplay(progress) {
    const strokeOffset =
      timer.config.CIRCLE_CIRCUMFERENCE - progress * timer.config.CIRCLE_CIRCUMFERENCE;
    timer.elements.progressCircle.style.strokeDashoffset = strokeOffset;
    const rotation = progress * 360;
    timer.elements.dot.style.transform = `rotate(${rotation}deg)`;
  }

  // Función para tiempoDisplayiniciar la cuenta regresiva
  function countdownLoop(timestamp) {
    if (!timer.state.startTime) timer.state.startTime = timestamp;

    const realElapsedTime = (Date.now() - timer.state.startTime) / 1000;

    // 2. Calcular el tiempo restante (timeAtStartOfRun - realElapsedTime)
    timer.state.tiempoActual = timer.state.selectedDuration - realElapsedTime;

    if (timer.state.tiempoActual <= 0) {
      timer.state.tiempoActual = 0;
      stopCountdown();
      // Actualizamos una última vez para que muestre 00:00
      const progress = timer.state.tiempoActual / timer.state.selectedDuration;
      updateDisplay(progress);
      timer.elements.display.textContent = formatTimes(timer.state.tiempoActual);
      return;

      // if (timer.resources.alarmSound) timer.resources.alarmSound.play();
      // setTimeout(() => initializeTimer(timer.state.selectedDuration), 1000);
      // return;
    }

    const progress = timer.state.tiempoActual / timer.state.selectedDuration;
    updateDisplay(progress);
    timer.elements.display.textContent = formatTimes(timer.state.tiempoActual);
    timer.state.animationFrameId = requestAnimationFrame(countdownLoop);
  }
  function startCountdown() {
    if (timer.state.isRunning || timer.state.tiempoActual <= 0) return;
    timer.state.isRunning = true;
    timer.elements.btnPlay.style.display = 'none';
    timer.elements.btnStop.style.display = 'block';
    // timer.state.startTime = 0;
    // ESTO ES CLAVE: Guarda el tiempo actual restante y la hora de inicio ABSOLUTA del sistema.
    timer.state.startTime = Date.now();

    // 1. Inicia la animación visual
    timer.state.animationFrameId = requestAnimationFrame(countdownLoop);
    // 2. Programa la alarma de fondo
    const durationInMilliseconds = timer.state.selectedDuration * 1000;
    console.log('Duración en ms para la alarma:', durationInMilliseconds);
    console.log(timer.state.alarmTimeoutId);
    timer.state.alarmTimeoutId = setTimeout(() => {
      if (timer.resources.alarmSound) timer.resources.alarmSound.play();
      console.log('¡Tiempo terminado!');
      // Aquí podrías mostrar una notificación del navegador si quisieras

      // Reseteamos la UI
      stopCountdown();
      initializeTimer(timer.state.selectedDuration);
    }, durationInMilliseconds - 1000); // -1000ms para que suene justo al llegar a 00:00
  }
  function stopCountdown() {
    if (!timer.state.isRunning) return;
    timer.state.isRunning = false;
    cancelAnimationFrame(timer.state.animationFrameId);
    clearTimeout(timer.state.alarmTimeoutId);
  }
  function resetTimerUI(duration) {
    timer.elements.display.textContent = formatTimes(duration);
    updateDisplay(1); // 1 = 100% del círculo de progreso
    timer.elements.btnPlay.style.display = 'block';
    timer.elements.btnStop.style.display = 'none';
  }

  function initializeTimer(duration) {
    stopCountdown();
    timer.state.selectedDuration = duration;
    timer.state.tiempoActual = timer.state.selectedDuration;
    // Usamos la nueva función para establecer el estado visual inicial.
    resetTimerUI(duration);
  }
  timer.elements.opciones.forEach((opcion) => {
    opcion.addEventListener('click', (e) => {
      // Quita la clase seleccionada de todos
      timer.elements.opciones.forEach((opt) =>
        opt.classList.remove('temporizador__opcion--seleccionado')
      );
      // Añade la clase seleccionada al clickeado
      e.currentTarget.classList.add('temporizador__opcion--seleccionado');
      // leer el tiempo del data-attribute
      const duration = parseInt(e.currentTarget.dataset.duration, 10);
      initializeTimer(duration);
    });
  });

  timer.elements.btnPlay.addEventListener('click', startCountdown);
  timer.elements.btnStop.addEventListener('click', () => {
    stopCountdown();
    resetTimerUI(timer.state.selectedDuration);
  });

  function init() {
    // Inicialización del temporizador
    const initialDuration = document.querySelector('.temporizador__opcion--seleccionado').dataset
      .duration;
    initializeTimer(parseInt(initialDuration, 10));
  }
  return {
    init: init,
  };
})();

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

// --- Módulo del Reloj ---
const ClockModule = (function () {
  const elements = {
    hour: document.getElementById('hour'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    ampm: document.getElementById('ampm'),
  };

  const updateClock = () => {
    const now = new Date();
    elements.hour.textContent = (now.getHours() % 12 || 12).toString().padStart(2, '0');
    elements.minutes.textContent = now.getMinutes().toString().padStart(2, '0');
    elements.seconds.textContent = now.getSeconds().toString().padStart(2, '0');
    elements.ampm.textContent = now.getHours() >= 12 ? 'PM' : 'AM';
  };

  function init() {
    updateClock(); // Pintamos la hora inmediatamente al cargar
    setInterval(updateClock, 1000); // Arrancamos el motor
  }

  return { init: init };
})();

// --- Módulo de Mis KBs ---
const KbModule = (function () {
  const elements = {
    idInput: document.getElementById('kbInput-id'),
    descriptionInput: document.getElementById('kbInput-des'),
    spanInput: document.getElementById('kbs-span'),
    addBtn: document.getElementById('KbBtn-add'),
    kbList: document.getElementById('kb-list'),
  };

  // El estado ahora es privado
  let state = {
    kbs: JSON.parse(localStorage.getItem('kbs')) || [],
  };

  const renderKBs = () => {
    elements.kbList.innerHTML = '';
    state.kbs.forEach((kb) => {
      const kbItem = document.createElement('li');
      kbItem.className = 'kbs__item';
      kbItem.innerHTML = `
        <div class="kbs__info">
          <span class="kbs__number">${kb.id}</span>
          <span class="kbs__description">${kb.description}</span>
        </div>
        <div class="kbs__actions">
          <span class="material-symbols-outlined kb-action-btn copy-btn" data-id="${kb.id}" title="Copiar">content_copy</span>
          <span class="material-symbols-outlined kb-action-btn edit-btn" data-id="${kb.id}" title="Editar">edit</span>
          <span class="material-symbols-outlined kb-action-btn delete-btn" data-id="${kb.id}" title="Eliminar">delete</span>
        </div>
      `;
      elements.kbList.appendChild(kbItem);
    });
  };

  const saveKB = () => {
    localStorage.setItem('kbs', JSON.stringify(state.kbs));
    renderKBs();
  };

  const clearKbInputs = () => {
    elements.idInput.value = '';
    elements.descriptionInput.value = '';
    elements.spanInput.textContent = ''; // Limpiamos también el contador
    elements.addBtn.textContent = 'Agregar';
    elements.addBtn.style.backgroundColor = 'var(--secondary-color)';
    elements.addBtn.style.color = 'var(--text-color)';
  };

  function init() {
    renderKBs(); // Renderizar los Kbs al cargar la página

    // Evento para agregar o editar
    elements.addBtn.addEventListener('click', () => {
      const id = elements.idInput.value.trim();
      const description = elements.descriptionInput.value.trim();

      if (!id || !description) return;

      const existingIndex = state.kbs.findIndex((kb) => kb.id === id);

      if (existingIndex !== -1) {
        state.kbs[existingIndex].description = description;
      } else {
        state.kbs.push({ id, description });
      }
      saveKB();
      clearKbInputs();
    });

    // Evento contador de caracteres
    elements.descriptionInput.addEventListener('input', (e) => {
      elements.spanInput.textContent = e.target.value.length;
    });

    // Evento de acciones en la lista (Delegación de eventos)
    elements.kbList.addEventListener('click', async (e) => {
      const target = e.target;
      const id = target.dataset.id;
      if (!id) return;

      if (target.classList.contains('copy-btn')) {
        try {
          await navigator.clipboard.writeText(id);
          // Feedback visual rápido
          const originalText = target.textContent;
          target.textContent = 'check';
          target.style.color = '#04fc43';
          setTimeout(() => {
            target.textContent = originalText;
            target.style.color = '';
          }, 1500);
        } catch (err) {
          console.error('Error al copiar:', err);
        }
      } else if (target.classList.contains('edit-btn')) {
        const kbToEdit = state.kbs.find((kb) => kb.id === id);
        if (kbToEdit) {
          elements.idInput.value = kbToEdit.id;
          elements.descriptionInput.value = kbToEdit.description;
          elements.spanInput.textContent = kbToEdit.description.length;
          elements.addBtn.textContent = 'Guardar Cambios';
          elements.addBtn.style.backgroundColor = '#fee800';
          elements.addBtn.style.color = '#152b4a';
        }
      } else if (target.classList.contains('delete-btn')) {
        state.kbs = state.kbs.filter((kb) => kb.id !== id);
        saveKB();
      }
    });
  }

  return { init: init };
})();

/******************ZONA ALARMA Y MODAL ****************/
const AlarmModule = (function () {
  // 1. Estado central. Leemos el localStorage UNA SOLA VEZ al cargar la página.
  let state = {
    horarios: JSON.parse(localStorage.getItem('horarios')) || {
      hbreak1: null,
      hbreak2: null,
      hlunch: null,
      haux: null, // Nuevo para el tipo de auxiliar
    },

    alarmasDisparadas: JSON.parse(localStorage.getItem('alarmasDisparadas')) || {
      hbreak1: false,
      hbreak2: false,
      hlunch: false,
      haux: false, // Nuevo para el tipo de auxiliar
    },

    // Nuevo
    tipoAuxiliar: localStorage.getItem('tipoAuxiliar') || 'Auxiliar',
  };

  // 2. CACHÉ DEL DOM: Centralizamos los IDs. Si cambian en el HTML, solo editas aquí.
  const elements = {
    inputs: {
      hbreak1: document.getElementById('breakTime'),
      hbreak2: document.getElementById('breakTime2'),
      hlunch: document.getElementById('lunchTime'),
      haux: document.getElementById('auxTime'), // NUEVO
    },
    visuals: {
      hbreak1: document.getElementById('tiempoBreak1'),
      hbreak2: document.getElementById('tiempoBreak2'),
      hlunch: document.getElementById('tiempoLunch'),
      haux: document.getElementById('tipoAuxiliar'), // NUEVO
    },
    // NUEVO: Referencias al select del modal y al título de la pantalla principal
    selectAux: document.getElementById('auxType'),
    tituloAux: document.getElementById('tituloAuxiliar'),
  };
  // EL DICCIONARIO AFUERA (Se crea solo 1 vez en la vida útil de la página)
  const traduccionesAux = {
    Coaching: 'Capacitación con tu Team Leader 🎯',
    Meeting: 'Reunión 📅',
    Training: 'Formación 📚',
  };
  // 3. LA MAGIA DRY (Don't Repeat Yourself)
  function saveHorarios() {
    // Creamos un array con las "llaves" de nuestras alarmas
    const keys = ['hbreak1', 'hbreak2', 'hlunch', 'haux']; // Agregamos 'haux'

    // NUEVO: Capturamos y guardamos el texto del Select (Coaching, Meeting...)
    state.tipoAuxiliar = elements.selectAux.value;
    localStorage.setItem('tipoAuxiliar', state.tipoAuxiliar);

    // Actualizamos el texto en la pantalla principal
    elements.tituloAux.textContent = state.tipoAuxiliar + ':';

    // En lugar de escribir el código 3 veces, iteramos sobre las llaves
    keys.forEach((key) => {
      const newValue = elements.inputs[key].value;
      const oldValue = state.horarios[key];

      // Actualizamos la variable en RAM
      state.horarios[key] = newValue;

      if (!newValue || newValue === '00:00') {
        state.alarmasDisparadas[key] = false;
        elements.visuals[key].textContent = 'Sin definir';
        elements.visuals[key].classList.remove('alarm__time--used');
      } else {
        elements.visuals[key].textContent = formatHoraConIcono(newValue);
        // Si la hora cambió respecto a la que había antes, reactivamos la alarma
        if (oldValue !== newValue) {
          state.alarmasDisparadas[key] = false;
          elements.visuals[key].classList.remove('alarm__time--used');
        }
      }
    });

    // Guardamos en el disco duro (localStorage) UNA SOLA VEZ solo cuando el usuario hace click en "Guardar"
    localStorage.setItem('horarios', JSON.stringify(state.horarios));
    localStorage.setItem('alarmasDisparadas', JSON.stringify(state.alarmasDisparadas));

    closeModal(); // Asumiendo que esta función sigue global por ahora
  }

  // 4. VERIFICACIÓN ULTRA RÁPIDA
  function verificarHorario() {
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

    // Buscamos la traducción en el diccionario de arriba. Si no existe, usamos el nombre en inglés.
    const nombreTraducido = traduccionesAux[state.tipoAuxiliar] || state.tipoAuxiliar;

    // Mapeamos los mensajes para cada llave para mantener el código limpio
    const mensajes = {
      hbreak1: '¡Es hora de tu primer Descanso! ☕️',
      hbreak2: '¡Es hora de tu segundo Descanso! 🍎',
      hlunch: '¡Es hora de tu Almuerzo! 🍲',
      // NUEVO: Mensaje dinámico inyectando la variable
      haux: `¡Es hora de tu ${nombreTraducido}!`,
    };

    // Iteramos nuevamente. ¡Cero localStorage aquí adentro!
    Object.keys(state.horarios).forEach((key) => {
      if (
        state.horarios[key] &&
        horaActual === state.horarios[key] &&
        !state.alarmasDisparadas[key]
      ) {
        mostrarAlerta(mensajes[key]); // Asumiendo que mostrarAlerta sigue global
        state.alarmasDisparadas[key] = true;
        elements.visuals[key].classList.add('alarm__time--used');
        localStorage.setItem('alarmasDisparadas', JSON.stringify(state.alarmasDisparadas)); // Guardamos estado de disparo
      }
    });
  }

  function reiniciarAlarmasDiarias() {
    const ahora = new Date();
    const ultimoReinicio = localStorage.getItem('ultimoReinicio');
    if (!ultimoReinicio || ahora.getDate() !== new Date(parseInt(ultimoReinicio)).getDate()) {
      Object.keys(state.horarios).forEach((key) => {
        state.alarmasDisparadas[key] = false;
        state.horarios[key] = null;
        elements.visuals[key].classList.remove('alarm__time--used');
        elements.visuals[key].textContent = 'Sin definir';
      });
      localStorage.setItem('horarios', JSON.stringify(state.horarios));
      localStorage.setItem('alarmasDisparadas', JSON.stringify(state.alarmasDisparadas));
      localStorage.setItem('ultimoReinicio', ahora.getTime());
    }
  }

  // NUEVA FUNCIÓN: Sincroniza el HTML con lo que hay en memoria al cargar la página
  function renderizarPantallaInicial() {
    const keys = ['hbreak1', 'hbreak2', 'hlunch', 'haux'];

    keys.forEach((key) => {
      const horaGuardada = state.horarios[key];
      const yaSono = state.alarmasDisparadas[key];

      // NUEVO: Si hay una hora guardada, se la asignamos al input del modal.
      // Si no, lo dejamos en blanco.
      if (horaGuardada && horaGuardada !== '00:00') {
        elements.inputs[key].value = horaGuardada;
      } else {
        elements.inputs[key].value = '';
      }

      // Lo que ya teníamos para la pantalla principal:
      if (horaGuardada && horaGuardada !== '00:00') {
        elements.visuals[key].textContent = formatHoraConIcono(horaGuardada);
        if (yaSono) {
          elements.visuals[key].classList.add('alarm__time--used');
        }
      } else {
        elements.visuals[key].textContent = 'Sin definir';
        elements.visuals[key].classList.remove('alarm__time--used');
      }
    });

    // 1. Sincronizamos el select dentro del modal
    if (elements.selectAux) {
      elements.selectAux.value = state.tipoAuxiliar;
    }

    // 2. ¡LA LÍNEA QUE FALTABA! Sincronizamos el título en el HTML principal
    if (elements.tituloAux) {
      elements.tituloAux.textContent = state.tipoAuxiliar + ':';
    }
  }
  function init() {
    // 1. Pintamos los títulos del auxiliar
    // elements.tituloAux.textContent = state.tipoAuxiliar + ':';
    // if (elements.selectAux) {
    //   elements.selectAux.value = state.tipoAuxiliar;
    // }

    // 2. Revisamos si es un nuevo día para borrar todo
    reiniciarAlarmasDiarias();

    // 3. ¡AQUÍ ESTÁ LA MAGIA! Pintamos las horas guardadas en el HTML
    renderizarPantallaInicial();

    // 4. Arrancamos el motor que revisa la hora cada segundo
    setInterval(verificarHorario, 1000);
  }

  return {
    init: init,
    saveHorarios: saveHorarios,
  };
})();

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

function formatHoraConIcono(hora24) {
  if (!hora24 || hora24 === '00:00') return '';
  const [h, m] = hora24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hora12 = (h % 12 || 12).toString().padStart(2, '0');
  const minutos = m.toString().padStart(2, '0');
  // Sol: 6:00am - 5:59pm (06:00 - 17:59)
  const esDia = h >= 6 && h < 18;
  const icono = esDia ? '☀️' : '🌙';
  return `${hora12}:${minutos} ${ampm} ${icono}`;
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

btnOpenModal.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
btnSaveHorarios.addEventListener('click', AlarmModule.saveHorarios);

alertaAceptarBtn.addEventListener('click', () => {
  alertaModal.close();
  stopSonidoAlarma();
});

// --- Módulo de Métricas (Calculadora CSAT, AHT, HUR) ---
const MetricsModule = (function () {
  let state = {
    metas: JSON.parse(localStorage.getItem('metricas_metas')) || {
      csat: 93.7,
      aht: 9.0,
      hur: 82.0,
    },
    llamadas: JSON.parse(localStorage.getItem('metricas_llamadas')) || [],
  };

  const elements = {
    // Nuevos botones y contadores
    totalCallsBadge: document.getElementById('totalCallsBadge'),
    btnUndoCall: document.getElementById('btnUndoCall'),
    btnExportCSV: document.getElementById('btnExportCSV'),
    btnClearDay: document.getElementById('btnClearDay'),

    // Controles de configuración
    btnConfig: document.getElementById('btnConfigMetrics'),
    panelConfig: document.getElementById('panelConfigMetrics'),
    inputMetaCsat: document.getElementById('metaCsat'),
    inputMetaAht: document.getElementById('metaAht'),
    inputMetaHur: document.getElementById('metaHur'),
    btnSaveMetas: document.getElementById('btnSaveMetas'),

    // Textos en pantalla
    displayMetaCsat: document.getElementById('displayMetaCsat'),
    displayMetaAht: document.getElementById('displayMetaAht'),
    displayMetaHur: document.getElementById('displayMetaHur'),
    liveCsat: document.getElementById('liveCsat'),
    liveAht: document.getElementById('liveAht'),
    liveHur: document.getElementById('liveHur'),

    // Inputs de nueva llamada
    inputCallAht: document.getElementById('inputCallAht'),
    inputCallCsat: document.getElementById('inputCallCsat'),
    inputCallHur: document.getElementById('inputCallHur'),
    btnAddCall: document.getElementById('btnAddCall'),

    badgeCsat: document.getElementById('badgeCsat'),
    badgeHur: document.getElementById('badgeHur'),
  };

  function calcularResultados() {
    let sumaAht = 0,
      encuestasPositivas = 0,
      totalEncuestas = 0,
      totalHur = 0;

    state.llamadas.forEach((llamada) => {
      sumaAht += llamada.duracion;
      if (llamada.csat === 'csat') {
        encuestasPositivas++;
        totalEncuestas++;
      } else if (llamada.csat === 'dsat') {
        totalEncuestas++;
      }
      if (llamada.hur) {
        totalHur++;
      }
    });

    const totalLlamadas = state.llamadas.length;
    if (totalLlamadas === 0) return { aht: '0.00', hur: '0.0', csat: '0.0' };

    return {
      aht: (sumaAht / totalLlamadas).toFixed(2),
      hur: ((totalHur / totalLlamadas) * 100).toFixed(1),
      csat: totalEncuestas > 0 ? ((encuestasPositivas / totalEncuestas) * 100).toFixed(1) : '0.0',
    };
  }

  function renderDashboard() {
    // 1. Actualizar contador visual
    elements.totalCallsBadge.textContent = `📞 ${state.llamadas.length}`;

    // 2. Pintar metas
    elements.inputMetaCsat.value = state.metas.csat;
    elements.inputMetaAht.value = state.metas.aht;
    elements.inputMetaHur.value = state.metas.hur;
    elements.displayMetaCsat.textContent = `${state.metas.csat}%`;
    elements.displayMetaAht.textContent = state.metas.aht;
    elements.displayMetaHur.textContent = `${state.metas.hur}%`;

    // 3. Pintar resultados
    const resultados = calcularResultados();
    elements.liveCsat.textContent = `${resultados.csat}%`;
    elements.liveAht.textContent = resultados.aht;
    elements.liveHur.textContent = `${resultados.hur}%`;

    // 4. Lógica del SEMÁFORO y CÁLCULO DE LLAMADAS NECESARIAS
    if (state.llamadas.length > 0) {
      // --- Variables base para la matemática ---
      let P = 0,
        S = 0,
        H = 0,
        C = state.llamadas.length;
      state.llamadas.forEach((ll) => {
        if (ll.csat === 'csat') {
          P++;
          S++;
        } else if (ll.csat === 'dsat') {
          S++;
        }
        if (ll.hur) {
          H++;
        }
      });

      // --- Evaluación CSAT ---
      const tCsat = state.metas.csat / 100; // Convertir meta a decimal
      if (parseFloat(resultados.csat) >= state.metas.csat) {
        elements.liveCsat.style.color = 'var(--color-success)';
        elements.badgeCsat.textContent = '0';
        elements.badgeCsat.className = 'metric-card__badge'; // Verde
      } else {
        elements.liveCsat.style.color = 'var(--color-danger)';
        // Matemáticas: (Meta * TotalEncuestas - Positivas) / (1 - Meta)
        let faltanCsat = tCsat === 1 ? '∞' : Math.ceil((tCsat * S - P) / (1 - tCsat));
        elements.badgeCsat.textContent = faltanCsat;
        elements.badgeCsat.className = 'metric-card__badge needed'; // Rojo
      }

      // --- Evaluación HUR ---
      const tHur = state.metas.hur / 100;
      if (parseFloat(resultados.hur) >= state.metas.hur) {
        elements.liveHur.style.color = 'var(--color-success)';
        elements.badgeHur.textContent = '0';
        elements.badgeHur.className = 'metric-card__badge'; // Verde
      } else {
        elements.liveHur.style.color = 'var(--color-danger)';
        // Fórmula: (Meta * TotalLlamadas - Cortes Actuales) / (1 - Meta)
        let faltanHur = tHur === 1 ? '∞' : Math.ceil((tHur * C - H) / (1 - tHur));

        // Inyectamos el número corregido
        elements.badgeHur.textContent = faltanHur;
        elements.badgeHur.className = 'metric-card__badge needed'; // Rojo
      }

      // --- Evaluación AHT (Sin circulito) ---
      elements.liveAht.style.color =
        parseFloat(resultados.aht) <= state.metas.aht
          ? 'var(--color-success)'
          : 'var(--color-danger)';
    } else {
      // Estado inicial (0 llamadas)
      elements.liveAht.style.color = 'var(--text-main)';
      elements.liveHur.style.color = 'var(--text-main)';
      elements.liveCsat.style.color = 'var(--text-main)';

      elements.badgeCsat.textContent = '0';
      elements.badgeCsat.className = 'metric-card__badge';
      elements.badgeHur.textContent = '0';
      elements.badgeHur.className = 'metric-card__badge';
    }
  }

  // --- FUNCIONES DE ACCIÓN ---

  function registrarLlamada() {
    const duracion = parseFloat(elements.inputCallAht.value);
    if (isNaN(duracion) || duracion <= 0) return alert('Ingresa una duración válida (Ej: 5.5)');

    state.llamadas.push({
      id: Date.now(),
      duracion,
      csat: elements.inputCallCsat.value,
      hur: elements.inputCallHur.checked,
      fecha: new Date().toLocaleTimeString(), // Guardamos la hora para el Excel
    });

    localStorage.setItem('metricas_llamadas', JSON.stringify(state.llamadas));
    elements.inputCallAht.value = '';
    elements.inputCallCsat.value = 'none';
    elements.inputCallHur.checked = false;
    renderDashboard();
  }

  function deshacerUltimaLlamada() {
    if (state.llamadas.length === 0) return alert('No hay llamadas para deshacer.');
    state.llamadas.pop(); // Elimina el último elemento del array
    localStorage.setItem('metricas_llamadas', JSON.stringify(state.llamadas));
    renderDashboard();
  }

  function borrarTodoElDia() {
    if (state.llamadas.length === 0) return;
    if (confirm('¿Estás seguro de borrar todas las llamadas de hoy? Esto no se puede deshacer.')) {
      state.llamadas = [];
      localStorage.setItem('metricas_llamadas', JSON.stringify(state.llamadas));
      renderDashboard();
    }
  }

  function exportarExcel() {
    if (state.llamadas.length === 0) return alert('No hay datos para exportar.');

    // Crear cabeceras del CSV
    let csvContent = 'Hora,Duracion (Min),Encuesta,HUR (Cortado por asesor)\n';

    // Traducir los datos técnicos a lenguaje legible
    state.llamadas.forEach((ll) => {
      let tipoEncuesta =
        ll.csat === 'csat' ? 'Positiva' : ll.csat === 'dsat' ? 'Negativa' : 'Sin encuesta';
      let esHur = ll.hur ? 'Si' : 'No';
      csvContent += `${ll.fecha},${ll.duracion},${tipoEncuesta},${esHur}\n`;
    });

    // Truco para que Excel lea correctamente los acentos (BOM UTF-8)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // Nombrar el archivo con la fecha de hoy
    const fechaHoy = new Date().toLocaleDateString().replace(/\//g, '-');
    link.download = `Metricas_Vacomi_${fechaHoy}.csv`;
    link.click();
  }

  function init() {
    if (!elements.btnConfig) return;
    renderDashboard();

    elements.btnConfig.addEventListener('click', () => {
      elements.panelConfig.style.display =
        elements.panelConfig.style.display === 'none' ? 'block' : 'none';
    });

    elements.btnSaveMetas.addEventListener('click', () => {
      state.metas = {
        csat: parseFloat(elements.inputMetaCsat.value) || 0,
        aht: parseFloat(elements.inputMetaAht.value) || 0,
        hur: parseFloat(elements.inputMetaHur.value) || 0,
      };
      localStorage.setItem('metricas_metas', JSON.stringify(state.metas));
      elements.panelConfig.style.display = 'none';
      renderDashboard();
    });

    elements.btnAddCall.addEventListener('click', registrarLlamada);
    elements.inputCallAht.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') registrarLlamada();
    });

    // Nuevos eventos
    elements.btnUndoCall.addEventListener('click', deshacerUltimaLlamada);
    elements.btnClearDay.addEventListener('click', borrarTodoElDia);
    elements.btnExportCSV.addEventListener('click', exportarExcel);

    // NUEVO CAMBIO 1: Automatización de HUR al seleccionar CSAT/DSAT
    elements.inputCallCsat.addEventListener('change', (e) => {
      const valorSeleccionado = e.target.value;

      // Si elige csat o dsat, marcamos el check automáticamente
      if (valorSeleccionado === 'csat' || valorSeleccionado === 'dsat') {
        elements.inputCallHur.checked = true;
      }
      // Si vuelve a "none" (Sin encuesta), no hacemos nada con el check
      // porque el asesor pudo haber cortado (HUR) aunque no haya encuesta.
    });
  }

  return { init: init };
})();

// CÓDIGO DE INICIALIZACIÓN UNIFICADO
document.addEventListener('DOMContentLoaded', () => {
  // 1. Cargar tema global
  const savedTheme = localStorage.getItem('selectedTheme') || 'default';
  applyTheme(savedTheme);

  // 2. Encender Módulos Independientes
  ClockModule.init();
  MenuModule.init();
  TimerModule.init();
  AlarmModule.init();
  // KbModule.init();
  MetricsModule.init(); // ¡NUESTRO NUEVO CEREBRO!
});
