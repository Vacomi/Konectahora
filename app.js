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
    const rotation = progress * 360;
    timer.elements.dot.style.transform = `rotate(${rotation}deg)`;
  }

  function countdownLoop(timestamp) {
    if (!timer.state.startTime) timer.state.startTime = timestamp;
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
    if (timer.elements.display)
      timer.elements.display.textContent = formatTimes(timer.state.tiempoActual);
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
    if (!timer.state.isRunning) return;
    timer.state.isRunning = false;
    cancelAnimationFrame(timer.state.animationFrameId);
    clearTimeout(timer.state.alarmTimeoutId);
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

//--- Módulo del Reloj ---
const ClockModule = (function () {
  const elements = {
    hour: document.getElementById('hour'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    ampm: document.getElementById('ampm'),
  };

  const updateClock = () => {
    if (!elements.hour) return;
    const now = new Date();
    elements.hour.textContent = (now.getHours() % 12 || 12).toString().padStart(2, '0');
    elements.minutes.textContent = now.getMinutes().toString().padStart(2, '0');
    elements.seconds.textContent = now.getSeconds().toString().padStart(2, '0');
    elements.ampm.textContent = now.getHours() >= 12 ? 'PM' : 'AM';
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

// Auxiliares globales para modales y alertas nativas
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

//--- Módulo de Métricas (Mantiene tu lógica HUR de negocio original) ---
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

      // Semáforo CSAT
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

      // Semáforo HUR (Fórmula original reincorporada por contexto de negocio)
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

      // Semáforo AHT
      elements.liveAht.style.color =
        parseFloat(res.aht) <= state.metas.aht ? 'var(--color-success)' : 'var(--color-danger)';
    } else {
      elements.liveAht.style.color = 'var(--text-main)';
      elements.liveHur.style.color = 'var(--text-main)';
      elements.liveCsat.style.color = 'var(--text-main)';
      elements.badgeCsat.textContent = '0';
      elements.badgeHur.textContent = '0';
    }

    // Visor de última llamada
    if (state.llamadas.length > 0) {
      const last = state.llamadas[state.llamadas.length - 1];
      elements.lastCallTime.textContent = `(${last.fecha.substring(0, 5)})`;
      elements.lastCallData.innerHTML = `ID:<b>${last.idSprinklr || 'N/A'}</b> | Duración:${last.duracion}m | Encuesta:${last.csat === 'csat' ? 'CSAT' : last.csat === 'dsat' ? 'DSAT' : 'No'} | Corte:${last.hur ? 'Sí' : 'No'}`;
      elements.lastCallViewer.style.display = 'flex';
    } else {
      if (elements.lastCallViewer) elements.lastCallViewer.style.display = 'none';
    }
  }

  function registrarLlamada() {
    const idSprinklr = elements.inputCallId.value.trim();
    const duracion = parseFloat(elements.inputCallAht.value);
    if (!/^\d{8}$/.test(idSprinklr) || isNaN(duracion) || duracion <= 0) return;

    state.llamadas.push({
      id: Date.now(),
      idSprinklr,
      duracion,
      csat: elements.inputCallCsat.value,
      hur: elements.inputCallHur.checked,
      fecha: new Date().toLocaleTimeString(),
    });

    localStorage.setItem('metricas_llamadas', JSON.stringify(state.llamadas));
    elements.inputCallId.value = '';
    elements.inputCallAht.value = '';
    elements.inputCallCsat.value = 'none';
    elements.inputCallHur.checked = false;
    renderDashboard();
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
    elements.btnUndoCall?.addEventListener('click', () => {
      if (state.llamadas.length === 0) return;
      state.llamadas.pop();
      localStorage.setItem('metricas_llamadas', JSON.stringify(state.llamadas));
      renderDashboard();
    });

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
  theme === 'dark'
    ? elements.body.classList.add('dark-theme')
    : elements.body.classList.remove('dark-theme');
};

elements.themeSwitcher?.addEventListener('click', () => {
  applyTheme(elements.body.dataset.theme === 'dark' ? 'default' : 'dark');
});

// INICIALIZACIÓN UNIFICADA DE LA WEB
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem('selectedTheme') || 'default');
  ClockModule.init();
  MenuModule.init();
  TimerModule.init();
  AlarmModule.init();
  MetricsModule.init();
});
