document.addEventListener('DOMContentLoaded', () => {
  const TARGET_HASH = "cff32185ec328c60d2c60d412420d1404e6b25db28177caf245414edb7048134";
  const NGROK_API_URL = "https://tu-dominio.ngrok-free.app/api/chat"; // CONFIGURA ESTO

  const loginOverlay = document.getElementById('loginOverlay');
  const mainContent = document.getElementById('mainContent');
  const authInput = document.getElementById('authInput');
  const authBtn = document.getElementById('authBtn');
  const authError = document.getElementById('authError');

  // Sidebar elements
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const closeSidebar = document.getElementById('closeSidebar');
  const wakeBtn = document.getElementById('wakeBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Chat elements
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatMessages = document.getElementById('chatMessages');

  // Funciones de Hashing (SHA-256)
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function handleLogin() {
    const pass = authInput.value;
    if (!pass) return;
    const hash = await sha256(pass);
    if (hash === TARGET_HASH) {
      localStorage.setItem('session_role', 'admin');
      unlockInterface('admin');
    } else {
      authError.classList.remove('hidden');
      authInput.value = '';
    }
  }

  function unlockInterface(role) {
    loginOverlay.classList.add('hidden');
    mainContent.classList.remove('hidden');
  }

  const savedRole = localStorage.getItem('session_role');
  if (savedRole) unlockInterface(savedRole);

  authBtn.addEventListener('click', handleLogin);
  authInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // Sidebar Logic
  function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('hidden');
  }

  menuBtn.addEventListener('click', toggleSidebar);
  closeSidebar.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', toggleSidebar);

  // Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
  });

  // Chat Logic
  function addMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', isUser ? 'user' : 'bot', 'fade-in');
    
    if (isUser) {
      msgDiv.innerHTML = `<div class="msg-content"><p>${text}</p></div>`;
    } else {
      msgDiv.innerHTML = `
        <div class="msg-avatar">✨</div>
        <div class="msg-content"><p>${text}</p></div>
      `;
    }
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessageToApi(message) {
    try {
      const response = await fetch(NGROK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // Importante para ngrok
        },
        body: JSON.stringify({ message, sender: 'PWA-User' })
      });
      
      if (!response.ok) throw new Error("Error HTTP " + response.status);
      
      const data = await response.json();
      addMessage(data.reply || "Hecho.", false);
    } catch (error) {
      addMessage("⚠️ Error conectando con el Operador Local. ¿Está encendido Ngrok?", false);
      console.error(error);
    }
  }

  sendBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addMessage(text, true);
    chatInput.value = '';
    
    // Llamada a API real
    sendMessageToApi(text);
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });

  wakeBtn.addEventListener('click', () => {
    toggleSidebar();
    addMessage("/wakeonlan", true);
    sendMessageToApi("/wakeonlan");
  });

  // Cargar comandos
  async function loadCommands() {
    try {
      const res = await fetch('commands.json');
      if (!res.ok) return;
      const commands = await res.json();
      const cmdList = document.getElementById('cmdList');
      cmdList.innerHTML = '';
      commands.forEach(cmd => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="cmd-badge">${cmd.command}</span><div class="cmd-desc">${cmd.description}</div>`;
        cmdList.appendChild(li);
      });
    } catch (e) {
      console.error("Error cargando comandos:", e);
    }
  }
  loadCommands();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(console.error);
    });
  }
});
