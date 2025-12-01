// === ELEMENTOS DEL SIMULADOR ===
const pantalla = document.getElementById("pantalla");
const lupa = document.getElementById("lupa");
const lupaImg = document.getElementById("lupa-img");
const manoImg = document.getElementById("mano-img");

// === EVENTO PRINCIPAL: MOVER EL MOUSE ===
document.addEventListener("mousemove", (e) => {
  const rect = pantalla.getBoundingClientRect();

  const inside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  // === DENTRO DEL MONITOR → MOSTRAR LUPA ===
  if (inside) {
    lupa.style.display = "block";
    lupaImg.style.display = "block";
    manoImg.style.display = "none";

    // Posición de la lupa redonda
    lupa.style.left = e.clientX - 90 + "px";
    lupa.style.top = e.clientY - 90 + "px";

    // Posición de la imagen PNG de la lupa
    lupaImg.style.left = e.clientX + "px";
    lupaImg.style.top = e.clientY + "px";

    // Fondo ampliado con FRAUDE.PNG
    lupa.style.backgroundImage = `url("/images/fraude.png")`;
    lupa.style.backgroundSize = `${window.innerWidth}px ${window.innerHeight}px`;
    lupa.style.backgroundPosition =
      `-${(e.clientX / window.innerWidth) * 100}% ` +
      `-${(e.clientY / window.innerHeight) * 100}%`;

    return; // Termina aquí si está dentro
  }

  // === FUERA DEL MONITOR → MOSTRAR MANO ===
  lupa.style.display = "none";
  lupaImg.style.display = "none";

  manoImg.style.display = "block";
  manoImg.style.left = e.clientX + "px";
  manoImg.style.top = e.clientY + "px";
});
