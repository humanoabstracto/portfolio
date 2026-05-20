const dock = document.querySelector(".dock");
const icons = document.querySelectorAll(".icon");

dock.addEventListener("mousemove", (e) => {
  icons.forEach((icon) => {
    const rect = icon.getBoundingClientRect();
    const iconCenter = rect.left + rect.width / 2;

    const distance = Math.abs(e.clientX - iconCenter);

    const maxDistance = 150; // rango de efecto
    let scale = 1;

    if (distance < maxDistance) {
      scale = 1 + (1 - distance / maxDistance) * 0.12;
    }

    icon.style.transform = `scale(${scale})`;
  });
});

dock.addEventListener("mouseleave", () => {
  icons.forEach((icon) => {
    icon.style.transform = "scale(1)";
  });
});

// 🖱️ DRAG & DROP ICONOS
let isDragging = false;

const desktopIcons = document.querySelectorAll(".icon");

desktopIcons.forEach(icon => {
  let offsetX, offsetY;

  icon.addEventListener("mousedown", (e) => {
    isDragging = false;

    offsetX = e.clientX - icon.getBoundingClientRect().left;
    offsetY = e.clientY - icon.getBoundingClientRect().top;

    function onMouseMove(e) {
      isDragging = true;

      const desktop = document.querySelector(".desktop");

      const rect = desktop.getBoundingClientRect();

      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

      // limitar valores entre 5% y 95%
const clampedX = Math.max(10, Math.min(90, xPercent));
const clampedY = Math.max(10, Math.min(90, yPercent));

icon.style.left = clampedX + "%";
icon.style.top = clampedY + "%";
icon.style.transform = "translate(-50%, -50%)";
    }

    document.addEventListener("mousemove", onMouseMove);

    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", onMouseMove);
    }, { once: true });
  });

// 🖱️ SELECCIÓN + DRAG COMPATIBLE
const icons = document.querySelectorAll(".icon");

icons.forEach(icon => {
  let isDragging = false;
  let clickTimer = null;

  icon.addEventListener("mousedown", () => {
    isDragging = false;

    // seleccionar inmediatamente (como Mac)
    icons.forEach(i => i.classList.remove("selected"));
    icon.classList.add("selected");
  });

  icon.addEventListener("mousemove", () => {
    isDragging = true;
  });

  icon.addEventListener("click", (e) => {
    e.stopPropagation();

    // si arrastraste → no hacer nada más
    if (isDragging) return;

    // 👇 manejo de doble click manual
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;

      // 🔥 DOBLE CLICK → abrir ventana
      const link = icon.querySelector("a");
      if (link) {
        e.preventDefault();

        const container = document.getElementById("windows-container");

        const windowEl = document.createElement("div");
        windowEl.classList.add("window");

        windowEl.innerHTML = `
          <div class="window-header">
            <span class="close-btn"></span>
          </div>
          <iframe src="${link.href}"></iframe>
        `;

        container.appendChild(windowEl);

        // cerrar
        windowEl.querySelector(".close-btn").addEventListener("click", () => {
          windowEl.remove();
        });

        // si ya tienes drag de ventanas, se mantiene
        if (typeof makeDraggable === "function") {
          makeDraggable(windowEl);
        }
      }

    } else {
      // primer click
      clickTimer = setTimeout(() => {
        clickTimer = null;
      }, 250); // tiempo entre clicks
    }
  });
});

// click fuera → deseleccionar
document.addEventListener("click", () => {
  icons.forEach(i => i.classList.remove("selected"));
});

// click fuera → deseleccionar
document.addEventListener("click", () => {
  icons.forEach(i => i.classList.remove("selected"));
});

  // 🚫 prevenir click si hubo drag
  const link = icon.querySelector("a");

  if (link) {
    link.addEventListener("click", (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    });
  }

  icon.ondragstart = () => false;
});

// 🪟 ABRIR EN VENTANA
const windowEl = document.getElementById("window");
const frame = document.getElementById("window-frame");

desktopIcons.forEach(icon => {
  const link = icon.querySelector("a");

  if (link) {
    icon.addEventListener("dblclick", () => {
      frame.src = link.href;
      windowEl.classList.remove("hidden");
    });
  }
});

// ❌ cerrar ventana
document.querySelector(".close-btn").addEventListener("click", () => {
  windowEl.classList.add("hidden");
  frame.src = "";
});

// 💾 GUARDAR POSICIONES
desktopIcons.forEach((icon, index) => {

  // cargar posición guardada
  const savedPosition = localStorage.getItem("icon-" + index);

  if (savedPosition) {
    const { left, top } = JSON.parse(savedPosition);
    icon.style.left = left;
    icon.style.top = top;
  }

  icon.addEventListener("mouseup", () => {
    const position = {
      left: icon.style.left,
      top: icon.style.top
    };

    localStorage.setItem("icon-" + index, JSON.stringify(position));
  });

});

// ⚠️ FUNCIÓN ALERTA
function showAlert(message) {
  const alertEl = document.getElementById("alert");
  const text = document.getElementById("alert-message");

  text.textContent = message;
  alertEl.classList.remove("hidden");
}

// cerrar alerta
document.getElementById("alert-ok").addEventListener("click", () => {
  document.getElementById("alert").classList.add("hidden");
});

document.getElementById("warning-icon").addEventListener("click", () => {
  showAlert("⚠️ Este es un mensaje de advertencia");
});

// 🚫 bloquear navegación normal de links en iconos
document.querySelectorAll(".icon a").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
  });
});

localStorage.clear();