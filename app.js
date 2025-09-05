// 1. Cachear elementos del DOM para mayor eficiencia
    const elements = {
      hour: document.getElementById('hour'),
      minutes: document.getElementById('minutes'),
      seconds: document.getElementById('seconds'),
      ampm: document.getElementById('ampm'),
      registroDiv: document.getElementById('registro'),
      btnBreak: document.getElementById('btnBreak'),
      btnLunch: document.getElementById('btnLunch'),
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
        guardarEstadoAlarmas();
        localStorage.setItem('ultimoReinicio', ahora.getTime());
      }
    }

    setInterval(verificarHorario, 1000); 

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
    });