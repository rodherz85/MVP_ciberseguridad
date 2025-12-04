// === ELEMENTOS DEL SIMULADOR ===
const pantalla = document.getElementById("pantalla");
const lupa = document.getElementById("lupa");
const lupaImg = document.getElementById("lupa-img");
const manoImg = document.getElementById("mano-img");
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);


// ===============================================
// ===============   MODO MOUSE   ===============
// ===============================================
document.addEventListener("mousemove", (e) => {

  const rect = pantalla.getBoundingClientRect();

  const inside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  const lupaSize = lupa.offsetWidth;
  const halfLupa = lupaSize / 2;

  if (inside) {
    lupa.style.display = "block";
    lupaImg.style.display = "block";
    manoImg.style.display = "none";

    // === CÍRCULO ===
    lupa.style.left = (e.clientX - halfLupa) + "px";
    lupa.style.top  = (e.clientY - halfLupa) + "px";

    // === PNG DE LA LUPA ===
    const lupaImgSize = lupaImg.offsetWidth;
    const offsetX = lupaImgSize * 0.43;
    const offsetY = lupaImgSize * 0.34;

    lupaImg.style.left = (e.clientX - offsetX) + "px";
    lupaImg.style.top  = (e.clientY - offsetY) + "px";

    // === ZOOM DEL FONDO ===
    lupa.style.backgroundImage = `url("/images/fraude.png")`;
    lupa.style.backgroundSize = `${window.innerWidth}px ${window.innerHeight}px`;
    lupa.style.backgroundPosition =
      `-${(e.clientX / window.innerWidth) * 100}% ` +
      `-${(e.clientY / window.innerHeight) * 100}%`;

    return;
  }

  // === FUERA DEL MONITOR →
  if (!isMobile) {
    manoImg.style.display = "block";
    manoImg.style.left = e.clientX + "px";
    manoImg.style.top  = e.clientY + "px";
  }

  lupa.style.display = "none";
  lupaImg.style.display = "none";
});



// ===============================================
// ===============   MODO TOUCH   =================
// ===============================================
if (isMobile) {

  // Evitar scroll mientras se usa la lupa
  pantalla.addEventListener("touchmove", (e) => {
    e.preventDefault();

    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    const rect = pantalla.getBoundingClientRect();

    const inside =
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom;

    const lupaSize = lupa.offsetWidth;
    const halfLupa = lupaSize / 2;

    if (inside) {
      lupa.style.display = "block";
      lupaImg.style.display = "block";

      // === CÍRCULO ===
      lupa.style.left = (x - halfLupa) + "px";
      lupa.style.top  = (y - halfLupa) + "px";

      // === PNG DE LA LUPA ===
      const lupaImgSize = lupaImg.offsetWidth;
      const offsetX = lupaImgSize * 0.43;
      const offsetY = lupaImgSize * 0.34;

      lupaImg.style.left = (x - offsetX) + "px";
      lupaImg.style.top  = (y - offsetY) + "px";

      // === ZOOM DEL FONDO ===
      lupa.style.backgroundImage = `url("/images/fraude.png")`;
      lupa.style.backgroundSize = `${window.innerWidth}px ${window.innerHeight}px`;
      lupa.style.backgroundPosition =
        `-${(x / window.innerWidth) * 100}% ` +
        `-${(y / window.innerHeight) * 100}%`;

    } else {
      lupa.style.display = "none";
      lupaImg.style.display = "none";
    }

  }, { passive: false });

  // === Al levantar el dedo ===
  pantalla.addEventListener("touchend", () => {
    lupa.style.display = "none";
    lupaImg.style.display = "none";
  });
}

pantalla.addEventListener("mouseenter", () => {
  pantalla.classList.add("zoom-activo");
});

pantalla.addEventListener("mouseleave", () => {
  pantalla.classList.remove("zoom-activo");
});