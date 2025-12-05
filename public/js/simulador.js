const contenido = document.getElementById("contenido-mvp");
const lupa = document.getElementById("lupa");
const lupaImg = document.getElementById("lupa-img");
const manoImg = document.getElementById("mano-img");

document.addEventListener("mousemove", e => {

  const rect = contenido.getBoundingClientRect();

  const inside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  const relX = e.clientX - rect.left;
  const relY = e.clientY - rect.top;

  const lupaSize = lupa.offsetWidth;
  const half = lupaSize / 2;

  if (inside) {
    lupa.style.display = "block";
    lupaImg.style.display = "block";
    manoImg.style.display = "none";

    // === LIMITAMOS LA POSICIÓN REAL PARA EL CÍRCULO DE LA LUPA ===
    const maxX = contenido.clientWidth  - lupaSize;
    const maxY = contenido.clientHeight - lupaSize;

    let posX = relX - half;
    let posY = relY - half;

    // limitar dentro del contenedor
    posX = Math.max(0, Math.min(posX, maxX));
    posY = Math.max(0, Math.min(posY, maxY));

    // aplicar posición al círculo
    lupa.style.left = posX + "px";
    lupa.style.top  = posY + "px";

    // ===========================================================
    // POSICIONAR EL PNG EXACTAMENTE CENTRADO SOBRE EL CÍRCULO
    // ===========================================================
    const marcoSize = lupaImg.offsetWidth;

    const marcoOffsetX = marcoSize * 0.43; // mismos valores que tú usabas
    const marcoOffsetY = marcoSize * 0.34;

    // nueva fórmula: el PNG se basa SOLO en posX y posY (posición corregida)
    const marcoX = posX + half - marcoOffsetX;
    const marcoY = posY + half - marcoOffsetY;

    lupaImg.style.left = marcoX + "px";
    lupaImg.style.top  = marcoY + "px";

    // fondo de lupa
    lupa.style.backgroundImage = "inherit";
    return;
  }

  lupa.style.display = "none";
  lupaImg.style.display = "none";

  manoImg.style.display = "block";
  manoImg.style.left = e.clientX + "px";
  manoImg.style.top  = e.clientY + "px";
});
