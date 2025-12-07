/* =============================================================
   ELEMENTOS PRINCIPALES
============================================================= */
const contenido = document.getElementById("contenido-mvp");
const lupaImg = document.getElementById("lupa-img");
const manoImg = document.getElementById("mano-img");

/* =============================================================
   ELEMENTOS DEL TOOLTIP
============================================================= */
const tooltip = document.getElementById("tooltip-pista");
const tooltipPregunta = tooltip.querySelector(".tooltip-pregunta");
const tooltipFeedback = tooltip.querySelector(".tooltip-feedback");
const btnSi = tooltip.querySelector(".btn-si");
const btnNo = tooltip.querySelector(".btn-no");
const btnCerrar = tooltip.querySelector(".tooltip-cerrar");

let ultimoSospechoso = null;
let timerDelay = null;
let freeze = false;

/* =============================================================
   MOSTRAR TOOLTIP (NUEVA LÓGICA)
============================================================= */
function mostrarTooltip(elemento, pregunta) {
    freeze = true;

    tooltipPregunta.textContent = pregunta;

    // REINICIAR feedback CADA VEZ
    tooltipFeedback.textContent = "";  
    tooltipFeedback.classList.add("oculto");

    const rect = elemento.getBoundingClientRect();
    const margin = 10;

    tooltip.classList.remove("oculto");
    const tipWidth = tooltip.offsetWidth;
    const tipHeight = tooltip.offsetHeight;
    tooltip.classList.add("oculto");

    const left = rect.left + rect.width / 2 - tipWidth / 2;

    let top = rect.bottom + margin;

    if (elemento.dataset.pos === "footer") {
        const extraOffset = 40;
        top = rect.top - tipHeight - margin - extraOffset;
    }

    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";

    tooltip.classList.remove("oculto");
    elemento.classList.add("hover-detectado");
}

/* =============================================================
   OCULTAR TOOLTIP
============================================================= */
function cerrarTooltip() {
    tooltip.classList.add("oculto");
    tooltipFeedback.classList.add("oculto");

    if (ultimoSospechoso) {
        ultimoSospechoso.classList.remove("hover-detectado");
        ultimoSospechoso = null;
    }

    freeze = false;
}

btnSi.onclick = () => {
    tooltipFeedback.textContent = window.pistaActual.si;
    tooltipFeedback.classList.remove("oculto");
};

btnNo.onclick = () => {
    tooltipFeedback.textContent = window.pistaActual.no;
    tooltipFeedback.classList.remove("oculto");
};

btnCerrar.onclick = cerrarTooltip;

/* =============================================================
   FUNCIÓN: MOSTRAR PREGUNTA
============================================================= */
function mostrarPregunta(elemento) {
    const pregunta = "¿Esto te parece sospechoso o fraudulento?";

    window.pistaActual = {
        elemento: elemento,
        si: elemento.dataset.feedbackSi,
        no: elemento.dataset.feedbackNo
    };

    mostrarTooltip(elemento, pregunta);
}

/* =============================================================
   DETECCIÓN LUPA
============================================================= */
document.addEventListener("mousemove", (e) => {

    if (freeze) {
        lupaImg.style.left = e.clientX + "px";
        lupaImg.style.top = e.clientY + "px";
        return;
    }

    const rect = lupaImg.getBoundingClientRect();
    const centroX = e.clientX;
    const centroY = e.clientY - rect.height * 0.25;

    lupaImg.style.display = "none";
    const elementoBajoLupa = document.elementFromPoint(centroX, centroY);
    const dentro = contenido.contains(elementoBajoLupa);

    if (dentro) {
        lupaImg.style.display = "block";
        lupaImg.style.left = e.clientX + "px";
        lupaImg.style.top = e.clientY + "px";

        manoImg.style.display = "none";

        const radio = 40;
        let detectado = null;

        for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 6) {
            const px = centroX + Math.cos(ang) * radio;
            const py = centroY + Math.sin(ang) * radio;
            const elem = document.elementFromPoint(px, py);

            if (elem && elem.closest(".sospechoso")) {
                detectado = elem.closest(".sospechoso");
                break;
            }
        }

        if (detectado !== ultimoSospechoso) {
            clearTimeout(timerDelay);

            if (ultimoSospechoso)
                ultimoSospechoso.classList.remove("hover-detectado");

            ultimoSospechoso = detectado;

            if (detectado) {
                timerDelay = setTimeout(() => {
                    if (ultimoSospechoso === detectado) {
                        mostrarPregunta(detectado);
                    }
                }, 850);
            }
        }

    } else {
        lupaImg.style.display = "none";
        clearTimeout(timerDelay);

        if (ultimoSospechoso) {
            ultimoSospechoso.classList.remove("hover-detectado");
            ultimoSospechoso = null;
        }

        manoImg.style.display = "block";
        manoImg.style.left = e.clientX + "px";
        manoImg.style.top = e.clientY + "px";
    }
});


