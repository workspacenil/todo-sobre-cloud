document.addEventListener('DOMContentLoaded', () => {
  
  // Hash correcto para "Nil!WOce2013"
  const TARGET_HASH = "cff32185ec328c60d2c60d412420d1404e6b25db28177caf245414edb7048134";

  const loginOverlay = document.getElementById('loginOverlay');
  const mainContent = document.getElementById('mainContent');
  const authInput = document.getElementById('authInput');
  const authBtn = document.getElementById('authBtn');
  const authError = document.getElementById('authError');

  // Funciones de Hashing (SHA-256)
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Lógica de Autenticación
  async function handleLogin() {
    const pass = authInput.value;
    if (!pass) return;

    const hash = await sha256(pass);
    if (hash === TARGET_HASH) {
      // Contraseña correcta (Administrador)
      localStorage.setItem('session_role', 'admin');
      unlockInterface('admin');
    } else {
      // Contraseña incorrecta
      authError.classList.remove('hidden');
      authInput.value = '';
    }
  }

  function unlockInterface(role) {
    loginOverlay.classList.add('hidden');
    mainContent.classList.remove('hidden');
    
    // Preparado para el futuro sistema de roles
    if (role === 'admin') {
      console.log("Sesión iniciada como Administrador.");
      // Aquí se podrían habilitar controles exclusivos de admin
    } else if (role === 'reader') {
      console.log("Sesión iniciada como Lector.");
      // Aquí se ocultaría el chat o se pondría en solo lectura
    }
  }

  // Comprobar si ya existe una sesión guardada
  const savedRole = localStorage.getItem('session_role');
  if (savedRole) {
    unlockInterface(savedRole);
  }

  authBtn.addEventListener('click', handleLogin);
  authInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // Chat UI Logic
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatMessages = document.getElementById('chatMessages');

  function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender, 'fade-in');
    msgDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  sendBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addMessage(text, 'user');
    chatInput.value = '';

    // TODO: Connect to backend API via Ngrok
    setTimeout(() => {
      addMessage("Comando enviado a la cola del Operador Local.", 'bot');
    }, 600);
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });

  // Botón Encender PC
  const wakeBtn = document.getElementById('wakeBtn');
  wakeBtn.addEventListener('click', () => {
    addMessage("/wakeonlan", 'user');
    setTimeout(() => {
      addMessage("Enviando paquete mágico (Wake-on-LAN) para encender el PC local...", 'bot');
    }, 500);
  });

  // Cargar lista dinámica de comandos
  async function loadCommands() {
    try {
      const res = await fetch('commands.json');
      if (!res.ok) throw new Error("No se pudo cargar");
      const commands = await res.json();
      const cmdList = document.getElementById('cmdList');
      cmdList.innerHTML = ''; // Limpiar
      
      commands.forEach(cmd => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="cmd-badge">${cmd.command}</span><span class="cmd-desc">${cmd.description}</span>`;
        cmdList.appendChild(li);
      });
    } catch (e) {
      console.error("Error cargando comandos:", e);
    }
  }

  // Cargar comandos al iniciar
  loadCommands();

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker Registrado!', reg.scope))
        .catch(err => console.error('Error registrando SW', err));
    });
  }
});
