// 1. Elementos del DOM globales
const elements = {
  themeSwitcher: document.getElementById('themeSwitcher'),
  body: document.body,
};

const MenuModule = (function () {
  const elements = {
    btnMenu: document.querySelector('.header__btn'),
    navMenu: document.getElementById('mainMenu'),
  };

  function init() {
    if (elements.btnMenu && elements.navMenu) {
      elements.btnMenu.addEventListener('click', () => {
        elements.navMenu.classList.toggle('active');
      });
    }

    if (elements.navMenu) {
      elements.navMenu.addEventListener('click', async (e) => {
        if (e.target.classList.contains('copy-link-btn')) {
          const urlToCopy = e.target.getAttribute('data-url');
          try {
            await navigator.clipboard.writeText(urlToCopy);
            const originalIcon = e.target.textContent;
            e.target.textContent = 'check';
            e.target.style.color = '#4caf50';

            setTimeout(() => {
              e.target.textContent = originalIcon;
              e.target.style.color = '';
            }, 2000);
          } catch (err) {
            console.error('Error al copiar el enlace: ', err);
          }
        }
      });
    }
  }

  return { init: init };
})();

//--- Módulo del Temporizador ---
const TimerModule = (function () {
  const timer = {
    elements: {
      display: document.querySelector('#tiempoDisplay'),
      btnPlay: document.querySelector('#play'),
      btnStop: document.querySelector('#stop'),
      progressCircle: document.querySelector('#progressCircle'),
      dot: document.querySelector('#dot'),
      opciones: document.querySelectorAll('.temporizador__opcion'),
    },
    state: {
      tiempoActual: 0,
      animationFrameId: null,
      selectedDuration: 0,
      isRunning: false,
      startTime: 0,
      alarmTimeoutId: null,
    },
    config: {
      CIRCLE_CIRCUMFERENCE: 2 * Math.PI * 60,
    },
    resources: {
      alarmSound: document.getElementById('alarmSound'),
    },
  };

  function formatTimes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  function updateDisplay(progress) {
    if (!timer.elements.progressCircle || !timer.elements.dot) return;
    const strokeOffset =
      timer.config.CIRCLE_CIRCUMFERENCE - progress * timer.config.CIRCLE_CIRCUMFERENCE;
    timer.elements.progressCircle.style.strokeDashoffset = strokeOffset;
    timer.elements.dot.style.transform = `rotate(${progress * 360}deg)`;
  }

  function countdownLoop() {
    if (!timer.state.isRunning) return; // Salvaguarda anti-fugas

    const realElapsedTime = (Date.now() - timer.state.startTime) / 1000;
    timer.state.tiempoActual = timer.state.selectedDuration - realElapsedTime;

    if (timer.state.tiempoActual <= 0) {
      timer.state.tiempoActual = 0;
      stopCountdown();
      updateDisplay(0);
      if (timer.elements.display) timer.elements.display.textContent = '00:00';
      return;
    }

    const progress = timer.state.tiempoActual / timer.state.selectedDuration;
    updateDisplay(progress);
    if (timer.elements.display) {
      timer.elements.display.textContent = formatTimes(timer.state.tiempoActual);
    }
    timer.state.animationFrameId = requestAnimationFrame(countdownLoop);
  }

  function startCountdown() {
    if (timer.state.isRunning || timer.state.tiempoActual <= 0) return;
    timer.state.isRunning = true;
    if (timer.elements.btnPlay) timer.elements.btnPlay.style.display = 'none';
    if (timer.elements.btnStop) timer.elements.btnStop.style.display = 'block';

    timer.state.startTime = Date.now();
    timer.state.animationFrameId = requestAnimationFrame(countdownLoop);
    const durationInMilliseconds = timer.state.selectedDuration * 1000;

    timer.state.alarmTimeoutId = setTimeout(() => {
      if (timer.resources.alarmSound) timer.resources.alarmSound.play();
      stopCountdown();
      initializeTimer(timer.state.selectedDuration);
    }, durationInMilliseconds - 1000);
  }

  function stopCountdown() {
    timer.state.isRunning = false;
    if (timer.state.animationFrameId) cancelAnimationFrame(timer.state.animationFrameId);
    if (timer.state.alarmTimeoutId) clearTimeout(timer.state.alarmTimeoutId);
  }

  function resetTimerUI(duration) {
    if (timer.elements.display) timer.elements.display.textContent = formatTimes(duration);
    updateDisplay(1);
    if (timer.elements.btnPlay) timer.elements.btnPlay.style.display = 'block';
    if (timer.elements.btnStop) timer.elements.btnStop.style.display = 'none';
  }

  function initializeTimer(duration) {
    stopCountdown();
    timer.state.selectedDuration = duration;
    timer.state.tiempoActual = timer.state.selectedDuration;
    resetTimerUI(duration);
  }

  function init() {
    if (timer.elements.opciones.length === 0) return;
    timer.elements.opciones.forEach((opcion) => {
      opcion.addEventListener('click', (e) => {
        timer.elements.opciones.forEach((opt) =>
          opt.classList.remove('temporizador__opcion--seleccionado')
        );
        e.currentTarget.classList.add('temporizador__opcion--seleccionado');
        const duration = parseInt(e.currentTarget.dataset.duration, 10);
        initializeTimer(duration);
      });
    });

    if (timer.elements.btnPlay) timer.elements.btnPlay.addEventListener('click', startCountdown);
    if (timer.elements.btnStop) {
      timer.elements.btnStop.addEventListener('click', () => {
        stopCountdown();
        resetTimerUI(timer.state.selectedDuration);
      });
    }

    const selectedOpt = document.querySelector('.temporizador__opcion--seleccionado');
    const initialDuration = selectedOpt ? selectedOpt.dataset.duration : 60;
    initializeTimer(parseInt(initialDuration, 10));
  }

  return { init: init };
})();

//--- Módulo del Reloj (Optimizado contra Reflows innecesarios) ---
const ClockModule = (function () {
  const elements = {
    hour: document.getElementById('hour'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    ampm: document.getElementById('ampm'),
  };

  let lastTime = { h: '', m: '', s: '', a: '' };

  const updateClock = () => {
    if (!elements.hour) return;
    const now = new Date();

    const currentH = (now.getHours() % 12 || 12).toString().padStart(2, '0');
    const currentM = now.getMinutes().toString().padStart(2, '0');
    const currentS = now.getSeconds().toString().padStart(2, '0');
    const currentA = now.getHours() >= 12 ? 'PM' : 'AM';

    // Validación inteligente: Solo muta el DOM si el valor realmente cambió
    if (currentS !== lastTime.s) {
      elements.seconds.textContent = currentS;
      lastTime.s = currentS;
    }
    if (currentM !== lastTime.m) {
      elements.minutes.textContent = currentM;
      lastTime.m = currentM;
    }
    if (currentH !== lastTime.h) {
      elements.hour.textContent = currentH;
      lastTime.h = currentH;
    }
    if (currentA !== lastTime.a) {
      elements.ampm.textContent = currentA;
      lastTime.a = currentA;
    }
  };

  function init() {
    if (!elements.hour) return;
    updateClock();
    setInterval(updateClock, 1000);
  }

  return { init: init };
})();

//--- Módulo de Alarma y Modal ---
const AlarmModule = (function () {
  let state = {
    horarios: JSON.parse(localStorage.getItem('horarios')) || {
      hbreak1: null,
      hbreak2: null,
      hlunch: null,
      haux: null,
    },
    alarmasDisparadas: JSON.parse(localStorage.getItem('alarmasDisparadas')) || {
      hbreak1: false,
      hbreak2: false,
      hlunch: false,
      haux: false,
    },
    tipoAuxiliar: localStorage.getItem('tipoAuxiliar') || 'Auxiliar',
  };

  const elements = {
    inputs: {
      hbreak1: document.getElementById('breakTime'),
      hbreak2: document.getElementById('breakTime2'),
      hlunch: document.getElementById('lunchTime'),
      haux: document.getElementById('auxTime'),
    },
    visuals: {
      hbreak1: document.getElementById('tiempoBreak1'),
      hbreak2: document.getElementById('tiempoBreak2'),
      hlunch: document.getElementById('tiempoLunch'),
      haux: document.getElementById('tipoAuxiliar'),
    },
    selectAux: document.getElementById('auxType'),
    tituloAux: document.getElementById('tituloAuxiliar'),
  };

  const traduccionesAux = {
    Coaching: 'Capacitación con tu TL 🎯',
    Meeting: 'Reunión 📅',
    Training: 'Formación 📚',
  };

  function saveHorarios() {
    const keys = ['hbreak1', 'hbreak2', 'hlunch', 'haux'];
    state.tipoAuxiliar = elements.selectAux.value;
    localStorage.setItem('tipoAuxiliar', state.tipoAuxiliar);
    if (elements.tituloAux) elements.tituloAux.textContent = state.tipoAuxiliar + ':';

    keys.forEach((key) => {
      const newValue = elements.inputs[key].value;
      const oldValue = state.horarios[key];
      state.horarios[key] = newValue;

      if (!newValue || newValue === '00:00') {
        state.alarmasDisparadas[key] = false;
        if (elements.visuals[key]) {
          elements.visuals[key].textContent = 'Sin definir';
          elements.visuals[key].classList.remove('alarm__time--used');
        }
      } else {
        if (elements.visuals[key]) elements.visuals[key].textContent = formatHoraConIcono(newValue);
        if (oldValue !== newValue) {
          state.alarmasDisparadas[key] = false;
          if (elements.visuals[key]) elements.visuals[key].classList.remove('alarm__time--used');
        }
      }
    });

    localStorage.setItem('horarios', JSON.stringify(state.horarios));
    localStorage.setItem('alarmasDisparadas', JSON.stringify(state.alarmasDisparadas));
    closeModal();
  }

  function verificarHorario() {
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const nombreTraducido = traduccionesAux[state.tipoAuxiliar] || state.tipoAuxiliar;

    const mensajes = {
      hbreak1: '¡Es hora de tu primer Descanso! ☕️',
      hbreak2: '¡Es hora de tu segundo Descanso! 🍎',
      hlunch: '¡Es hora de tu Almuerzo! 🍲',
      haux: `¡Es hora de tu ${nombreTraducido}!`,
    };

    Object.keys(state.horarios).forEach((key) => {
      if (
        state.horarios[key] &&
        horaActual === state.horarios[key] &&
        !state.alarmasDisparadas[key]
      ) {
        mostrarAlerta(mensajes[key]);
        state.alarmasDisparadas[key] = true;
        if (elements.visuals[key]) elements.visuals[key].classList.add('alarm__time--used');
        localStorage.setItem('alarmasDisparadas', JSON.stringify(state.alarmasDisparadas));
      }
    });
  }

  function init() {
    Object.keys(state.horarios).forEach((key) => {
      const horaGuardada = state.horarios[key];
      if (horaGuardada && elements.inputs[key]) elements.inputs[key].value = horaGuardada;
      if (elements.visuals[key]) {
        elements.visuals[key].textContent = horaGuardada
          ? formatHoraConIcono(horaGuardada)
          : 'Sin definir';
        if (state.alarmasDisparadas[key]) elements.visuals[key].classList.add('alarm__time--used');
      }
    });

    if (elements.selectAux) elements.selectAux.value = state.tipoAuxiliar;
    if (elements.tituloAux) elements.tituloAux.textContent = state.tipoAuxiliar + ':';

    setInterval(verificarHorario, 1000);
  }

  return { init: init, saveHorarios: saveHorarios };
})();

// Auxiliares globales de modales
const alertaModal = document.getElementById('alertaModal');
const alertaMensaje = document.getElementById('alertaMensaje');
const alertaAceptarBtn = document.getElementById('alertaAceptarBtn');
let alarmaSonido = new Audio('./sounds/FreshStart.mp3');

function openModal() {
  document.getElementById('myModal').style.display = 'block';
}
function closeModal() {
  document.getElementById('myModal').style.display = 'none';
}
function formatHoraConIcono(hora24) {
  const [h, m] = hora24.split(':').map(Number);
  return `${(h % 12 || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'} ${h >= 6 && h < 18 ? '☀️' : '🌙'}`;
}
function mostrarAlerta(mensaje) {
  if (!alertaModal) return;
  alertaMensaje.textContent = mensaje;
  alertaModal.showModal();
  alarmaSonido.loop = true;
  alarmaSonido.play();
}

document.getElementById('abrirModal')?.addEventListener('click', openModal);
document.getElementById('cerrarModal')?.addEventListener('click', closeModal);
document.getElementById('guardarHorarios')?.addEventListener('click', AlarmModule.saveHorarios);
alertaAceptarBtn?.addEventListener('click', () => {
  alertaModal.close();
  alarmaSonido.pause();
  alarmaSonido.currentTime = 0;
});

alertaModal?.addEventListener('close', () => {
  alarmaSonido.pause();
  alarmaSonido.currentTime = 0;
});

//--- Módulo de Métricas (Optimizado el uso de Selectores internos) ---
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
    totalCallsBadge: document.getElementById('totalCallsBadge'),
    btnUndoCall: document.getElementById('btnUndoCall'),
    btnExportCSV: document.getElementById('btnExportCSV'),
    btnClearDay: document.getElementById('btnClearDay'),
    btnConfig: document.getElementById('btnConfigMetrics'),
    panelConfig: document.getElementById('panelConfigMetrics'),
    inputMetaCsat: document.getElementById('metaCsat'),
    inputMetaAht: document.getElementById('metaAht'),
    inputMetaHur: document.getElementById('metaHur'),
    btnSaveMetas: document.getElementById('btnSaveMetas'),
    displayMetaCsat: document.getElementById('displayMetaCsat'),
    displayMetaAht: document.getElementById('displayMetaAht'),
    displayMetaHur: document.getElementById('displayMetaHur'),
    liveCsat: document.getElementById('liveCsat'),
    liveAht: document.getElementById('liveAht'),
    liveHur: document.getElementById('liveHur'),
    inputCallAht: document.getElementById('inputCallAht'),
    inputCallCsat: document.getElementById('inputCallCsat'),
    inputCallHur: document.getElementById('inputCallHur'),
    btnAddCall: document.getElementById('btnAddCall'),
    badgeCsat: document.getElementById('badgeCsat'),
    badgeHur: document.getElementById('badgeHur'),
    inputCallId: document.getElementById('inputCallId'),
    errorCallId: document.getElementById('errorCallId'),
    errorCallAht: document.getElementById('errorCallAht'),
    lastCallViewer: document.getElementById('lastCallViewer'),
    lastCallTime: document.getElementById('lastCallTime'),
    lastCallData: document.getElementById('lastCallData'),
  };

  function calcularResultados() {
    let sumaAht = 0,
      encuestasPositivas = 0,
      totalEncuestas = 0,
      totalHur = 0;
    state.llamadas.forEach((ll) => {
      sumaAht += ll.duracion;
      if (ll.csat === 'csat') {
        encuestasPositivas++;
        totalEncuestas++;
      } else if (ll.csat === 'dsat') {
        totalEncuestas++;
      }
      if (ll.hur) totalHur++;
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
    if (!elements.totalCallsBadge) return;
    elements.totalCallsBadge.textContent = `📞 ${state.llamadas.length}`;

    elements.inputMetaCsat.value = state.metas.csat;
    elements.inputMetaAht.value = state.metas.aht;
    elements.inputMetaHur.value = state.metas.hur;

    elements.displayMetaCsat.textContent = `${state.metas.csat}%`;
    elements.displayMetaAht.textContent = state.metas.aht;
    elements.displayMetaHur.textContent = `${state.metas.hur}%`;

    const res = calcularResultados();
    elements.liveCsat.textContent = `${res.csat}%`;
    elements.liveAht.textContent = res.aht;
    elements.liveHur.textContent = `${res.hur}%`;

    if (state.llamadas.length > 0) {
      let P = 0,
        S = 0,
        H = 0,
        C = state.llamadas.length;
      state.llamadas.forEach((ll) => {
        if (ll.csat === 'csat') {
          P++;
          S++;
        } else if (ll.csat === 'dsat') S++;
        if (ll.hur) H++;
      });

      const tCsat = state.metas.csat / 100;
      if (parseFloat(res.csat) >= state.metas.csat) {
        elements.liveCsat.style.color = 'var(--color-success)';
        elements.badgeCsat.textContent = '0';
        elements.badgeCsat.className = 'metric-card__badge';
      } else {
        elements.liveCsat.style.color = 'var(--color-danger)';
        elements.badgeCsat.textContent =
          tCsat === 1 ? '∞' : Math.ceil((tCsat * S - P) / (1 - tCsat));
        elements.badgeCsat.className = 'metric-card__badge needed';
      }

      const tHur = state.metas.hur / 100;
      if (parseFloat(res.hur) >= state.metas.hur) {
        elements.liveHur.style.color = 'var(--color-success)';
        elements.badgeHur.textContent = '0';
        elements.badgeHur.className = 'metric-card__badge';
      } else {
        elements.liveHur.style.color = 'var(--color-danger)';
        elements.badgeHur.textContent = tHur === 1 ? '∞' : Math.ceil((tHur * C - H) / (1 - tHur));
        elements.badgeHur.className = 'metric-card__badge needed';
      }

      elements.liveAht.style.color =
        parseFloat(res.aht) <= state.metas.aht ? 'var(--color-success)' : 'var(--color-danger)';
    } else {
      elements.liveAht.style.color = 'var(--text-main)';
      elements.liveHur.style.color = 'var(--text-main)';
      elements.liveCsat.style.color = 'var(--text-main)';
      elements.badgeCsat.textContent = '0';
      elements.badgeHur.textContent = '0';
      // elements.badgeCsat.className = 'metric-card__badge';
      //  elements.badgeHur.className = 'metric-card__badge';
    }

    if (state.llamadas.length > 0) {
      const ultimaLlamada = state.llamadas[state.llamadas.length - 1];

      // REPARADO: Esta línea mágica limpia los segundos pero CONSERVA el AM/PM (ej: "10:15:30 PM" -> "10:15 PM")
      const horaVisual = ultimaLlamada.fecha
        ? ultimaLlamada.fecha.replace(/(:\d{2}):\d{2}/, '$1')
        : '--:--';

      const idVisual = ultimaLlamada.idSprinklr ? ultimaLlamada.idSprinklr : 'Sin ID';
      const tipoEncuesta =
        ultimaLlamada.csat === 'csat' ? 'CSAT' : ultimaLlamada.csat === 'dsat' ? 'DSAT' : 'Ninguna';
      const esHur = ultimaLlamada.hur ? 'Sí' : 'No';

      // Inyectamos la hora formateada con su AM/PM en tu visor
      elements.lastCallTime.textContent = `(${horaVisual})`;
      elements.lastCallData.innerHTML = `ID:<b>${idVisual}</b> | Duración:${ultimaLlamada.duracion}m | Encuesta:${tipoEncuesta} | Corte:${esHur}`;

      // Mostrar el visor
      elements.lastCallViewer.style.display = 'flex';
    } else {
      if (elements.lastCallViewer) elements.lastCallViewer.style.display = 'none';
    }
  }

  function registrarLlamada() {
    const idSprinklr = elements.inputCallId.value.trim();
    const duracion = parseFloat(elements.inputCallAht.value);
    let hayError = false;

    elements.inputCallId.classList.remove('input-error');
    elements.errorCallId.classList.remove('active');
    elements.inputCallAht.classList.remove('input-error');
    elements.errorCallAht.classList.remove('active');

    if (!idSprinklr) {
      elements.inputCallId.classList.add('input-error');
      elements.errorCallId.textContent = 'Ingresa el ID del caso';
      elements.errorCallId.classList.add('active');
      hayError = true;
    } else if (!/^\d{8}$/.test(idSprinklr)) {
      elements.inputCallId.classList.add('input-error');
      elements.errorCallId.textContent = 'El ID debe tener exactamente 8 números';
      elements.errorCallId.classList.add('active');
      hayError = true;
    }

    if (isNaN(duracion) || duracion <= 0) {
      elements.inputCallAht.classList.add('input-error');
      elements.errorCallAht.textContent = 'Ingresa una duración válida';
      elements.errorCallAht.classList.add('active');
      hayError = true;
    }

    if (hayError) return;

    state.llamadas.push({
      id: Date.now(),
      idSprinklr,
      duracion,
      csat: elements.inputCallCsat.value,
      hur: elements.inputCallHur.checked,
      // fecha: new Date().toLocaleTimeString(),
      fecha: new Date().toLocaleTimeString('en-US', { hour12: true }),
    });

    localStorage.setItem('metricas_llamadas', JSON.stringify(state.llamadas));
    elements.inputCallId.value = '';
    elements.inputCallAht.value = '';
    elements.inputCallCsat.value = 'none';
    elements.inputCallHur.checked = false;
    renderDashboard();
  }
  function deshacerUltimaLlamada() {
    // REPARADO: Validación y alerta nativa al deshacer llamadas
    if (state.llamadas.length === 0) return alert('No hay llamadas para deshacer.');
    state.llamadas.pop();
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

  // REPARADO: Función para exportar los registros al archivo CSV de Excel
  function exportarExcel() {
    if (state.llamadas.length === 0) return alert('No hay datos para exportar.');
    let csvContent = 'Hora,ID Sprinklr,Duracion (Min),Encuesta,HUR (Cortado por asesor)\n';

    state.llamadas.forEach((ll) => {
      let tipoEncuesta =
        ll.csat === 'csat' ? 'Positiva' : ll.csat === 'dsat' ? 'Negativa' : 'Sin encuesta';
      let esHur = ll.hur ? 'Si' : 'No';
      csvContent += `${ll.fecha},${ll.idSprinklr || 'N/A'},${ll.duracion},${tipoEncuesta},${esHur}\n`;
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
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

    elements.btnUndoCall?.addEventListener('click', deshacerUltimaLlamada);
    elements.btnClearDay?.addEventListener('click', borrarTodoElDia);
    elements.btnExportCSV?.addEventListener('click', exportarExcel);

    elements.inputCallCsat.addEventListener('change', (e) => {
      if (e.target.value === 'csat' || e.target.value === 'dsat') {
        elements.inputCallHur.checked = true;
      }
    });
  }

  return { init: init };
})();

// Control de Tema Global Alternativo
const applyTheme = (theme) => {
  elements.body.dataset.theme = theme;
  localStorage.setItem('selectedTheme', theme);
  if (theme === 'dark') elements.body.classList.add('dark-theme');
  else elements.body.classList.remove('dark-theme');
};

elements.themeSwitcher?.addEventListener('click', () => {
  applyTheme(elements.body.dataset.theme === 'dark' ? 'default' : 'dark');
});

//--- Módulo de Simulación Interactiva de Interfaces (Netflix) ---
const SimulatorModule = (function () {
  const elements = {
    osGroup: document.getElementById('simOsGroup'),
    mockup: document.getElementById('deviceMockup'),
    content: document.getElementById('simulatorContent'),
    txtModel: document.getElementById('txtTargetModel'),
    lblIos: document.getElementById('lblIos'),
    lblAndroid: document.getElementById('lblAndroid'),
  };

  let state = {
    currentStep: 'welcome',
    isEditingMode: false,
  };

  const hardwareSpecs = {
    phone_ios: 'Modelo Específico: iPhone 17 | Versión de app 18.33.0',
    phone_android: 'Modelo Específico: Samsung Galaxy S26 | Versión de app 18.31.2',
    tv_android: 'Modelo Específico: Smart TV TCL (Android TV) | Versión de app 7.2.1',
  };

  const screens = {
    // 1. PANTALLA DE BIENVENIDA
    welcome: (device, os) => {
      if (device === 'phone' && os === 'ios') {
        return `
          <div class="nf-nav">
            <span class="nf-logo json-trigger" data-step="welcome">NETFLIX</span>
            <span class="nf-btn-options material-symbols-outlined">more_vert</span>
            <span class="nf-btn-login json-trigger" data-step="login">Iniciar sesión</span>
          </div>
          <div class="nf-body-welcome">
            <h2 class="nf-title-welcome">Películas, series y juegos al alcance de tu mano</h2>
            <div class="nf-create-account">
              <p>Crea una cuenta de Netflix y mucho más.</p>
              <p>Visita <a href="#">netflix.com/more</a></p>
            </div>
          </div>`;
      }
      return `
        <div class="nf-nav">
          <span class="nf-logo-android json-trigger" data-step="welcome">N</span>
          <div class="nf-nav-options">
            <span>Privacidad</span>
            <span class="json-trigger" data-step="login">Iniciar Sesion</span>
            <span class="nf-btn-options material-symbols-outlined">more_vert</span>
          </div>
        </div>
        <div class="nf-body-welcome">
          <h2 class="nf-title-welcome">Series y películas ilimitadas y mucho más</h2>
          <div class="nf-btn-primary json-trigger" data-step="login">Comienza ya</div>
        </div>`;
    },

    // 2. LOGIN (CORREO)
    login: (device, os) => {
      const isIos = device === 'phone' && os === 'ios';
      return `
        <div class="nf-nav spacioinicio">
          <span class="material-symbols-outlined nf-back json-trigger" data-step="welcome">${isIos ? 'arrow_back_ios_new' : 'arrow_back'}</span>
          <span class="nf-logo no-seleccionable" style="${!isIos ? 'color:#e50914' : ''}">NETFLIX</span>
        </div>
        <div class="nf-body-login">
          <h2 class="nf-login-title">${isIos ? 'Ingresa tu info para iniciar sesión' : '¿Quieres ver Netflix ya?'}</h2>
          ${!isIos ? '<p style="font-size:0.75rem; color:#aaa; text-align:left;">Ingresa tu información para iniciar sesión o comienza con una cuenta nueva.</p>' : ''}
          <div class="nf-input">Email o número de celular</div>
          <div class="nf-btn-primary json-trigger" data-step="verifyCode">Continuar</div>
          <p class="nf-text-roll">Obtener ayuda<span class="material-symbols-outlined">keyboard_arrow_down</span></p>
          <span class="nf-recaptcha">Esta página está protegida por Google reCAPTCHA para comprobar que no eres un robot.</span>
        </div>`;
    },

    // 2.5 CÓDIGO DE VERIFICACIÓN
    verifyCode: () => `
      <div class="nf-nav spacioinicio">
        <span class="material-symbols-outlined nf-back json-trigger" data-step="login">arrow_back_ios_new</span>
        <span class="nf-logo no-seleccionable">NETFLIX</span>
      </div>
      <div class="nf-body-login">
        <h2 class="nf-login-title">Ingresa el código que te enviamos a tu email</h2>
        <div class="nf-code-textAlert">
          <p>correoingresado@mail.com</p>
          <span class="enlaceGenerico json-trigger" data-step="login">Cambiar</span>
        </div>
        <div class="nf-code-container">
          <div class="nf-code-box json-trigger" data-step="profiles">4</div>
          <div class="nf-code-box json-trigger" data-step="profiles">8</div>
          <div class="nf-code-box json-trigger" data-step="profiles">2</div>
          <div class="nf-code-box json-trigger" data-step="profiles">9</div>
        </div>
        <p style="font-size:0.75rem; color:#aaa;">Este código vence en 15 minutos.</p>
        <p style="font-size:0.75rem; color:#aaa;">¿No recibiste el código? <span class="enlaceGenerico json-trigger" data-step="profiles">Solicita el reenvío.</span></p>
        <p class="nf-text-roll">Obtener ayuda<span class="material-symbols-outlined">keyboard_arrow_down</span></p>
      </div>`,

    // 3. SELECTOR DE PERFILES
    profiles: () => {
      const modeClass = state.isEditingMode ? 'nf-profiles-grid--editing' : '';
      const targetStep = state.isEditingMode ? 'editProfileForm' : 'home';

      return `
        <div class="nf-profiles-container">
          <p style="font-size: 0.95rem; font-weight: bold; text-align: center; margin-bottom: 5px;">Elige tu perfil</p>
          <div class="nf-profiles-grid ${modeClass}">
            <div class="nf-profile-item json-trigger" data-step="${targetStep}">
              <div class="nf-avatar" style="background-color:#e50914;">👤<span class="edit-badge material-symbols-outlined">edit</span></div>
              <span class="nf-profile-name">Perfil 1</span>
            </div>
            <div class="nf-profile-item json-trigger" data-step="${targetStep}">
              <div class="nf-avatar" style="background-color:#1c75ff;">👤<span class="edit-badge material-symbols-outlined">edit</span></div><span class="nf-profile-name">Perfil 2</span></div>
            <div class="nf-profile-item json-trigger" data-step="${targetStep}"><div class="nf-avatar" style="background-color:#ff9f1c;">👤<span class="edit-badge material-symbols-outlined">edit</span></div><span class="nf-profile-name">Perfil 3</span></div>
            <div class="nf-profile-item json-trigger" data-step="${targetStep}"><div class="nf-avatar" style="background-color:#00bf43;">🐱<span class="edit-badge material-symbols-outlined">edit</span></div><span class="nf-profile-name">Niños</span></div>
            <div class="nf-profile-item ${state.isEditingMode ? 'disabled-item' : 'json-trigger'}" data-step="addProfile"><div class="nf-avatar" style="background-color:#333;"><span class="material-symbols-outlined">add</span></div><span class="nf-profile-name">Agregar</span></div>
            <div class="nf-profile-item dynamic-edit-toggle"><div class="nf-avatar" style="background-color:#333;"><span class="material-symbols-outlined">${state.isEditingMode ? 'close' : 'edit'}</span></div><span class="nf-profile-name">${state.isEditingMode ? 'Listo' : 'Editar'}</span></div>
          </div>
        </div>`;
    },

    // 3.1 PANTALLA: AGREGAR PERFIL
    addProfile: () => `
      <div class="nf-nav text-navigation">
        <span class="enlaceGenerico json-trigger" data-step="profiles">Cancelar</span>
        <span class="enlaceGenericoTitulo">Agregar perfil</span>
        <span class="enlaceGenerico json-trigger" data-step="profiles" >Guardar</span>
      </div>
      <div class="nf-body-management">
        <div class="nf-avatar-editable">
          <div class="nf-avatar" style="background-color:#b72bff; width:80px; height:80px; position:relative;">👤<span class="avatar-edit-icon material-symbols-outlined">edit</span></div>
        </div>
        <input type="text" class="nf-input" placeholder="Nombre" style="width:100%; border-radius:4px;" autocomplete="off" />
        <div class="nf-switch-row">
          <div>
            <p style="font-size:0.85rem; font-weight:bold;">Perfil de niños</p>
            <p style="font-size:0.65rem; color:#aaa;">Para menores de 12 años, pero los padres tiene todo el control.</p>
          </div>
          <label class="nf-toggle-switch"><input type="checkbox" /><span class="nf-toggle-slider"></span></label>
        </div>
      </div>`,

    // 3.2 PANTALLA: FORMULARIO DE EDITAR PERFIL INDIVIDUAL
    editProfileForm: () => `
      <div class="nf-nav text-navigation">
        <span></span>
        <span class="enlaceGenericoTitulo">Editar perfil</span>
        <span class="enlaceGenerico json-trigger" data-step="profiles" style="font-weight:bold; color:#fff;">Listo</span>
      </div>
      <div class="nf-body-management scrollable-panel">
        <div class="nf-avatar-editable" style="margin-bottom:10px;">
          <div class="nf-avatar" style="background-color:#1c75ff; width:80px; height:80px; position:relative;">👤<span class="avatar-edit-icon material-symbols-outlined">edit</span></div>
        </div>
        <input type="text" class="nf-input" value="Perfil Seleccionado" style="border-radius:4px; margin-bottom:15px;" />
        <div class="nf-menu-list">
          <div class="nf-menu-row"><span>Alias de juegos</span><span class="material-symbols-outlined">chevron_right</span></div>
          <div class="nf-menu-row"><span>Restricciones de visualización</span><span class="material-symbols-outlined">chevron_right</span></div>
          <div class="nf-menu-row"><span>Bloqueo de perfil</span><span class="material-symbols-outlined">chevron_right</span></div>
          <div class="nf-menu-row"><span>Idioma de visualización</span><span class="material-symbols-outlined">chevron_right</span></div>
          <div class="nf-menu-row"><span>Audio y subtítulos</span><span class="material-symbols-outlined">chevron_right</span></div>
          <div class="nf-menu-row"><span>Reproducir automáticamente el siguiente episodio</span><label class="nf-toggle-switch"><input type="checkbox" checked /><span class="nf-toggle-slider"></span></label></div>
          <div class="nf-menu-row"><span>Reproducir automáticamente los avances</span><label class="nf-toggle-switch"><input type="checkbox" checked /><span class="nf-toggle-slider"></span></label></div>
        </div>
        <p class="nf-delete-profile-btn json-trigger" data-step="profiles">Eliminar perfil</p>
      </div>`,

    // 4. CATÁLOGO / HOME
    home: (device, os) => {
      if (device === 'phone' && os === 'ios') {
        return `
          <div class="nf-home-layout">
            <div class="nf-nav">
              <div style="display: flex; align-items: center; gap: 5px;">
                <span class="nf-logo-android no-seleccionable">N</span>
                <span class="nf-logo no-seleccionable" style="font-size: 1rem; color: #fff;">Inicio</span>
              </div>
              <div class="nf-nav-options">
                <span class="material-symbols-outlined">cast</span>
                <span class="material-symbols-outlined">download</span>
                <span class="material-symbols-outlined">notifications</span>
              </div>
            </div>
            <div class="categorias-sidebar">
              <button class="categorias-btn">Series</button>
              <button class="categorias-btn">Películas</button>
              <button class="categorias-btn">Nuevo y popular</button>
              <button class="categorias-btn">Categorías<span class="material-symbols-outlined">keyboard_arrow_down</span></button>
            </div>
            <div class="nf-hero-card">
              <button>Reproducir</button>
              <button>Mi Lista</button>
            </div>
            <p style="font-size: 0.7rem; font-weight: bold; margin-top: 15px;">Lo nuevo en netflix</p>
            <div class="nf-row-movies">
              <div class="nf-poster"></div><div class="nf-poster"></div><div class="nf-poster"></div>
            </div>
            <ul class="nf-mobile-nav">
              <li class="active"><span class="material-symbols-outlined">home</span><span>Inicio</span></li>
              <li><span class="material-symbols-outlined">search</span><span>Buscar</span></li>
              <li class="json-trigger" data-step="myNetflix"><span class="material-symbols-outlined">person</span><span>Mi Netflix</span></li>
            </ul>
          </div>`;
      }

      if (device === 'phone' && os === 'android') {
        return `
          <div class="nf-home-layout">
            <div class="nf-nav">
              <div style="display: flex; align-items: center; gap: 5px;">
                <span class="nf-logo-android no-seleccionable">N</span>
                <span class="nf-logo no-seleccionable" style="font-size: 1rem; color: #fff;">Inicio</span>
              </div>
              <div class="nf-nav-options">
                <span class="material-symbols-outlined">download</span>
                <span class="material-symbols-outlined">notifications</span>
              </div>
            </div>
            <div class="categorias-sidebar">
              <button class="categorias-btn">Series</button>
              <button class="categorias-btn">Películas</button>
              <button class="categorias-btn">Juegos</button>
              <button class="categorias-btn">Nuevo y popular</button>
              <button class="categorias-btn">Categorías<span class="material-symbols-outlined">keyboard_arrow_down</span></button>
            </div>
            <div class="nf-hero-card">
              <button>Reproducir</button>
              <button>Mi Lista</button>
            </div>
            <p style="font-size: 0.7rem; font-weight: bold; margin-top: 15px;">Lo nuevo en netflix</p>
            <div class="nf-row-movies">
              <div class="nf-poster"></div><div class="nf-poster"></div><div class="nf-poster"></div>
            </div>
            <ul class="nf-mobile-nav">
              <li class="active"><span class="material-symbols-outlined">home</span><span>Inicio</span></li>
              <li><span class="material-symbols-outlined">search</span><span>Buscar</span></li>
              <li class="json-trigger" data-step="myNetflix"><span class="material-symbols-outlined">person</span><span>Mi Netflix</span></li>
            </ul>
          </div>`;
      }
    },

    // 5. MI NETFLIX
    myNetflix: (device, os) => {
      if (device === 'phone' && os === 'ios') {
        return `
        <div class="nf-home-layout">
          <div class="nf-nav">
            <div style="display: flex; align-items: center; color: #fff; cursor: pointer;" class="json-trigger" data-step="manageAccount">
              <span class="material-symbols-outlined">person</span>
              <span class="enlaceGenericoTitulo">Perfil 1</span>
              <span class="material-symbols-outlined">keyboard_arrow_down</span>
            </div>
            <div class="nf-nav-options">
              <span class="material-symbols-outlined">cast</span>
              <span class="material-symbols-outlined">download</span>
              <span class="material-symbols-outlined">notifications</span>
            </div>
          </div>
          <div class="nf-panel-downloads">
            <span class="material-symbols-outlined">download</span>
            <div>
              <p style="font-size: 0.75rem; font-weight: bold;">Mis Descargas</p>
              <p style="font-size: 0.65rem; color:#aaa;">Ver y administrar tu contenido descargado.</p>
            </div>
            <span class="material-symbols-outlined">chevron_right</span>
          </div>
          <div class="nf-panel-mi-lista">
            <div class="mi-lista__header">
              <span style="font-size: 0.85rem; font-weight: bold;">Mi lista</span>
              <span style="font-size: 0.75rem; color:#aaa; display: flex; align-items: center; cursor:pointer;">Ver todo <span style="font-size: 0.75rem;" class="material-symbols-outlined">chevron_right</span></span>
            </div>
            <div class="mi-lista__body">
              <p>Una vez que agregues algo a Mi lista, aparecerá aquí.</p>
              <button>Buscar algo para agregar</button>
            </div>
          </div>
          <p style="font-size: 0.85rem; font-weight: bold; margin-top: 15px;">Tráileres que has visto</p>
          <div class="mi-lista__body">
            <p>Descubre lo que se viene y el contenido del que todos hablan.</p>
            <button>Descubrir lo nuevo y popular</button>
          </div>
          <p style="font-size: 0.75rem; color:#aaa; margin: 15px 0; text-align: center;">Cuanto más veas Netflix, más información aparecerá aquí, como tu historial de títulos vistos, las series y películas que puedes calificar, y mucho más.</p>
          <ul class="nf-mobile-nav">
            <li class="json-trigger" data-step="home"><span class="material-symbols-outlined">home</span><span>Inicio</span></li>
            <li><span class="material-symbols-outlined">search</span><span>Buscar</span></li>
            <li class="active"><span class="material-symbols-outlined">person</span><span>Mi Netflix</span></li>
          </ul>
        </div>`;
      }
      if (device === 'phone' && os === 'android') {
        return `
        <div class="nf-home-layout">
          <div class="nf-nav">
            <div style="display: flex; align-items: center; color: #fff; cursor: pointer;" class="json-trigger" data-step="manageAccount">
              <span class="material-symbols-outlined">person</span>
              <span class="enlaceGenericoTitulo">Perfil 2</span>
              <span class="material-symbols-outlined">keyboard_arrow_down</span>
            </div>
            <div class="nf-nav-options">
              <span class="material-symbols-outlined">cast</span>
              <span class="material-symbols-outlined">download</span>
              <span class="material-symbols-outlined">notifications</span>
            </div>
          </div>
          <div class="nf-panel-downloads" style="margin-bottom: 10px;">
            <span class="material-symbols-outlined">download</span>
            <div>
              <p style="font-size: 0.75rem; font-weight: bold;">Mis Descargas</p>
              <p style="font-size: 0.65rem; color:#aaa;">Las películas y series que descargues aparecen aquí.</p>
            </div>
            <span class="material-symbols-outlined">chevron_right</span>
          </div>
          <div class="nf-panel-mi-lista" style="margin-bottom: 10px;">
            <span style="font-size: 0.85rem; font-weight: bold;">Agregar a Mi lista</span>
            <span style="font-size: 0.75rem; color: #aaa;">Lleva un registro de las series ly pelícuolas que quieres ver más adelante.</span>
            <button>Explorar para agregar a Mi lista</button>
          </div>
          <div class="nf-panel-mi-lista" style="margin-bottom: 10px;">
            <span style="font-size: 0.85rem; font-weight: bold;">Tráileres que viste</span>
            <span style="font-size: 0.75rem; color: #aaa;">Guardaremos aquí los tráileres que viste.</span>
            <button>Ver tráileres</button>
          </div>
          <p style="font-size: 0.75rem; color: #aaa; margin-bottom: 13px;">La información que aparece aquí se actualiza según tu actividad en Netflix.</p>
          <ul class="nf-mobile-nav">
            <li class="json-trigger" data-step="home"><span class="material-symbols-outlined">home</span><span>Inicio</span></li>
            <li><span class="material-symbols-outlined">search</span><span>Buscar</span></li>
            <li class="active"><span class="material-symbols-outlined">person</span><span>Mi Netflix</span></li>
          </ul>
        </div>`;
      }
    },

    // 6. MANAGE ACCOUNT
    manageAccount: (device, os) => {
      if (device === 'phone' && os === 'ios') {
        return `
        <div class="nf-home-layout">
          <div class="nf-nav" style="margin-bottom: 20px;">
            <span></span>
            <span class="enlaceGenericoTitulo">Perfiles</span>
            <span class="material-symbols-outlined nf-back json-trigger" data-step="myNetflix">close</span>
          </div>
          <div class="nf-manage-perfil" style="margin-bottom: 10px;">
            <span></span>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
              <div class="nf-avatar" style="background-color:#1c75ff; width:70px; height:70px; position:relative;">👤</div>
              <span style="text-align: center; font-size: 0.75rem; font-weight: bold;">Perfil 1</span>
            </div>
            <span class="material-symbols-outlined json-trigger" data-step="editProfileForm" style="cursor: pointer;">edit</span>
          </div>
          <div class="nf-manage-grid" style="margin-bottom: 20px;">
            <div class="nf-manage-item"><div class="nf-avatar" style="background-color:#e50914;">👤</div><span class="nf-profile-name">Perfil 2</span></div>
            <div class="nf-manage-item"><div class="nf-avatar" style="background-color:#1c75ff;">👤</div><span class="nf-profile-name">Perfil 3</span></div>
            <div class="nf-manage-item"><div class="nf-avatar" style="background-color:#ff9f1c;">👤</div><span class="nf-profile-name">Perfil 4</span></div>
            <div class="nf-manage-item"><div class="nf-avatar" style="background-color:#00bf43;">🐱</div><span class="nf-profile-name">Niños</span></div>
          </div>
          <button class="nf-manage-btn json-trigger" data-step="profiles">Administrar perfiles</button>
          <div class="nf-body-management">
            <div class="nf-management-list">
              <div class="nf-management-row"><span class="material-symbols-outlined">settings</span><span>Configuración de la app</span></div>
              <div class="nf-management-row"><span class="material-symbols-outlined">person</span><span>Cuenta</span></div>
              <div class="nf-management-row"><span class="material-symbols-outlined">help_outline</span><span>Ayuda</span></div>
              <div class="nf-management-row json-trigger" data-step="welcome"><span class="material-symbols-outlined">open_in_new</span><span>Cerrar sesión</span></div>
            </div>   
          </div>
        </div>`;
      }
      if (device === 'phone' && os === 'android') {
        return `
          <div class="nf-home-layout">
            <div class="nf-nav" style="margin-bottom: 20px;">
              <span></span>
              <span class="enlaceGenericoTitulo">Perfil</span>
              <span class="material-symbols-outlined nf-back json-trigger" data-step="myNetflix">close</span>
            </div>
            <div class="nf-manage-perfil" style="margin-bottom: 10px;">
              <span></span>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <div class="nf-avatar" style="background-color:#1c75ff; width:70px; height:70px; position:relative;">👤</div>
                <span style="text-align: center; font-size: 0.75rem; font-weight: bold;">Perfil 2</span>
              </div>
              <span class="material-symbols-outlined json-trigger" data-step="editProfileForm" style="cursor: pointer;">edit</span>
            </div>
            <div class="nf-manage-grid nf-manage-grid--android" style="margin-bottom:20px;">
              <div class="nf-manage-item active-profile"><div class="nf-avatar" style="background-color:#e50914;">👤</div><span class="nf-profile-name">Perfil 1</span></div>
              <div class="nf-manage-item"><div class="nf-avatar" style="background-color:#ff9f1c;">👤</div><span class="nf-profile-name">Perfil 3</span></div>
              <div class="nf-manage-item"><div class="nf-avatar" style="background-color:#00bf43;">🐱</div><span class="nf-profile-name">Niños</span></div>
            </div>
            <button class="nf-manage-btn json-trigger" data-step="profiles">Administrar perfiles</button>
            <div class="nf-body-management">
              <div class="nf-management-list">
                <div class="nf-management-row"><span class="material-symbols-outlined">settings</span><span>Configuración de la app</span></div>
                <div class="nf-management-row"><span class="material-symbols-outlined">person</span><span>Cuenta</span></div>
                <div class="nf-management-row"><span class="material-symbols-outlined">help_outline</span><span>Ayuda</span></div>
                <div class="nf-management-row json-trigger" data-step="welcome"><span class="material-symbols-outlined">open_in_new</span><span>Cerrar sesión</span></div>
              </div>
            </div>
          </div>`;
      }
    },
  };

  function getSelectedRadio(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value;
  }

  function setSelectedRadio(name, value) {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) radio.checked = true;
  }

  function renderScreen() {
    let activeDevice = getSelectedRadio('simDevice');
    let activeOs = getSelectedRadio('simOs');

    if (activeDevice === 'tv') {
      if (elements.lblIos) elements.lblIos.classList.add('disabled');
      setSelectedRadio('simOs', 'android');
      activeOs = 'android';
    } else {
      if (elements.lblIos) elements.lblIos.classList.remove('disabled');
    }

    if (elements.mockup) {
      elements.mockup.className = 'device-mock';
      if (activeDevice === 'tv') elements.mockup.classList.add('device-mock--tv');
    }

    if (elements.content) {
      elements.content.className = 'device-mock__screen';

      if (activeDevice === 'tv') {
        elements.content.classList.add('ctx-tv');
        elements.content.innerHTML = `
          <div class="tv-placeholder">
            <span class="material-symbols-outlined tv-placeholder__icon">tv_off</span>
            <h3 class="tv-placeholder__title">Disponible pronto</h3>
            <p class="tv-placeholder__text">Esta interfaz se implementará gradualmente en futuras actualizaciones si es que Keiko deja la presidencia 😈</p>
          </div>
        `;

        if (elements.txtModel) elements.txtModel.textContent = hardwareSpecs['tv_android'];
        return;
      }

      if (activeDevice === 'phone') {
        elements.content.classList.add(activeOs === 'ios' ? 'ctx-ios' : 'ctx-android');
      }
    }

    const specsKey = `${activeDevice}_${activeOs}`;
    if (elements.txtModel) {
      elements.txtModel.textContent = hardwareSpecs[specsKey] || 'Modelo Desconocido';
    }

    const currentRender = screens[state.currentStep];
    if (currentRender && elements.content) {
      elements.content.innerHTML = currentRender(activeDevice, activeOs);
    }
  }

  function init() {
    if (!elements.content) return;

    document.querySelectorAll('input[name="simDevice"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        state.currentStep = 'welcome';
        state.isEditingMode = false;
        renderScreen();
      });
    });

    document.querySelectorAll('input[name="simOs"]').forEach((radio) => {
      radio.addEventListener('change', renderScreen);
    });

    elements.content.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.dynamic-edit-toggle');
      if (editBtn) {
        state.isEditingMode = !state.isEditingMode;
        renderScreen();
        return;
      }

      const trigger = e.target.closest('.json-trigger');
      if (trigger) {
        const nextStep = trigger.dataset.step;
        if (nextStep) {
          if (nextStep === 'profiles') state.isEditingMode = false;
          state.currentStep = nextStep;
          renderScreen();
        }
      }
    });

    renderScreen();
  }

  return { init: init };
})();

// INICIALIZACIÓN UNIFICADA DE LA WEB
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem('selectedTheme') || 'default');
  ClockModule.init();
  MenuModule.init();
  TimerModule.init();
  AlarmModule.init();
  MetricsModule.init();
  SimulatorModule.init();
});
