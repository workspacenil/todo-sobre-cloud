document.addEventListener('DOMContentLoaded', () => {
  console.log("Bienvenido a Todo Sobre Cloud - Operador Local 3.1 Pro");

  // Intersección Observer para animaciones al hacer scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, {
    threshold: 0.15
  });

  const hiddenElements = document.querySelectorAll('.hidden');
  hiddenElements.forEach((el) => observer.observe(el));

  // Botón Explorar
  const exploreBtn = document.getElementById('exploreBtn');
  exploreBtn.addEventListener('click', () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
    
    // Efecto de partículas al hacer click
    createParticles(exploreBtn);
  });

  function createParticles(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.background = i % 2 === 0 ? '#00f0ff' : '#a200ff';
      particle.style.borderRadius = '50%';
      particle.style.left = (rect.left + rect.width / 2) + 'px';
      particle.style.top = (rect.top + rect.height / 2 + window.scrollY) + 'px';
      particle.style.pointerEvents = 'none';
      document.body.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 50 + Math.random() * 50;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
      ], {
        duration: 600 + Math.random() * 400,
        easing: 'cubic-bezier(0, .9, .57, 1)'
      }).onfinish = () => particle.remove();
    }
  }

  // Smooth scroll para links del navbar
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
});
