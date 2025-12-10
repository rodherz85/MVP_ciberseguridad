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
const tooltipPregunta = tooltip ? tooltip.querySelector(".tooltip-pregunta") : null;
const tooltipFeedback = tooltip ? tooltip.querySelector(".tooltip-feedback") : null;
const btnSi = tooltip ? tooltip.querySelector(".btn-si") : null;
const btnNo = tooltip ? tooltip.querySelector(".btn-no") : null;
const btnCerrar = tooltip ? tooltip.querySelector(".tooltip-cerrar") : null;

let ultimoSospechoso = null;
let timerDelay = null;
let freeze = false;

let resultadosPistas = {
    asunto: "no_visto",
    remitente: "no_visto",
    soporte: "no_visto",
    saludo: "no_visto",
    ortografia: "no_visto",
    urgencia: "no_visto",
    boton: "no_visto",
    footer: "no_visto"
};

//Contador de pistas encontradas

let pistasEncontradas = 0;

/* =============================================================
   MOSTRAR TOOLTIP (NUEVA LÓGICA)
============================================================= */
function mostrarTooltip(elemento, pregunta) {
    if (!tooltip || !tooltipPregunta || !tooltipFeedback) return;

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
    if (!tooltip || !tooltipFeedback) return;

    tooltip.classList.add("oculto");
    tooltipFeedback.classList.add("oculto");

    if (ultimoSospechoso) {
        ultimoSospechoso.classList.remove("hover-detectado");
        ultimoSospechoso = null;
    }

    freeze = false;
}

function registrarRespuesta(pistaId, esAcierto) {
    if (!pistaId) return;
    if (esAcierto) {
        resultadosPistas[pistaId] = "acierto";
        console.log(`Acierto en: ${pistaId}`);
    } else {
        resultadosPistas[pistaId] = "fallo";
        console.log(`Fallo en: ${pistaId}`);
    }

    pistasEncontradas ++;

    const contadorSpan = document.getElementById("contador-texto");
    if (contadorSpan) {
        contadorSpan.textContent = pistasEncontradas;
        if(pistasEncontradas === 8){
            const contadorDiv = document.querySelector(".contador-pistas");
            if (contadorDiv) {
                contadorDiv.style.borderColor = "#28a745";
                contadorDiv.style.backgroundColor = "rgba(40, 167, 69, 0.9)";
            }
        }
    }

    const elementoPista = document.querySelector(`[data-id="${pistaId}"]`);
    if (elementoPista) {
        elementoPista.classList.add("pista-encontrada");
        elementoPista.classList.remove("sospechoso");
    }

    cerrarTooltip();

}

window.finalizarSimulacion = function() {
    console.log("Enviando resultados...", resultadosPistas);
    const inputDatos = document.getElementById("input-datos-simulacion");
    const formulario = document.getElementById("form-simulacion");

    if (inputDatos && formulario) {
        inputDatos.value = JSON.stringify(resultadosPistas);
        formulario.submit();
    } else {
        console.error("Error: No se encontró el formulario.");
    }
};

if (btnSi) {
    btnSi.onclick = () => {
        tooltipFeedback.textContent = window.pistaActual.si;
        tooltipFeedback.classList.remove("oculto");
        registrarRespuesta(window.pistaActual.id, true);
    };
}

if (btnNo) {
    btnNo.onclick = () => {
        tooltipFeedback.textContent = window.pistaActual.no;
        tooltipFeedback.classList.remove("oculto");
        registrarRespuesta(window.pistaActual.id, false);
    };
}

if (btnCerrar) {
    btnCerrar.onclick = cerrarTooltip;
}

/* =============================================================
   FUNCIÓN: MOSTRAR PREGUNTA
============================================================= */
function mostrarPregunta(elemento) {
    const pregunta = "¿Esto te parece sospechoso o fraudulento?";

    window.pistaActual = {
        elemento: elemento,
        id: elemento.dataset.id,
        si: elemento.dataset.feedbackSi,
        no: elemento.dataset.feedbackNo
    };

    mostrarTooltip(elemento, pregunta);
}

/* =============================================================
   DETECCIÓN LUPA
   Solo se activa si estamos en el simulador (contenido + lupa + mano)
============================================================= */
if (contenido && lupaImg && manoImg) {
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
}

/* =============================================================
   VALIDACIÓN DE CHECKBOXES (PRE-TEST Y POST-TEST)
   Funciona para cualquier vista que tenga checkboxes con name="p2"
============================================================= */
document.addEventListener("DOMContentLoaded", () => {

    // 1. Buscamos si existen checkboxes 'p2' en esta página
    const checkboxesP2 = document.querySelectorAll('input[name="p2"]');

    // Si existen (es decir, estamos en Pretest o Posttest), activamos la lógica
    if (checkboxesP2.length > 0) {

        const formulario = checkboxesP2[0].closest('form'); // Detectamos el formulario automáticamente

        // Función de validación
        const validarP2 = () => {
            const algunoMarcado = Array.from(checkboxesP2).some(check => check.checked);

            if (!algunoMarcado) {
                checkboxesP2[0].setCustomValidity("Debes seleccionar al menos una opción en la pregunta 2.");
            } else {
                checkboxesP2[0].setCustomValidity("");
            }
        };

        // Revisamos cada vez que cambia algo en p2
        checkboxesP2.forEach(c => {
            c.addEventListener('change', validarP2);
        });

        // Y justo antes de enviar
        if (formulario) {
            formulario.addEventListener('submit', (e) => {
                validarP2();
                if (!formulario.checkValidity()) {
                    e.preventDefault();
                    formulario.reportValidity();
                }
            });
        }
    }
});
