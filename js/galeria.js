/* =========================================================
   MATÍAS CORTÉS | PORTAFOLIO PROFESIONAL
   GALERÍA INTERACTIVA Y VISOR DE FOTOGRAFÍAS

   Archivo: js/galeria.js

   - Carrusel circular y automático cada 5,5 segundos
   - Flechas, indicadores, teclado y deslizamiento táctil
   - Zoom en las fotografías reales (no en el avatar)
   - Pausa durante la interacción y mientras el visor está abierto
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = {
    autoplay: true,
    autoplayDelay: 5500,
    swipeThreshold: 45,
    loop: true
  };

  function iniciarGaleria() {
    const galeria = document.getElementById("about-gallery");
    if (!galeria) return;

    const pista = document.getElementById("about-gallery-track");
    const ventana = document.getElementById("about-gallery-viewport");
    const botonAnterior = galeria.querySelector("[data-gallery-prev]");
    const botonSiguiente = galeria.querySelector("[data-gallery-next]");
    const indicadores = Array.from(galeria.querySelectorAll("[data-gallery-dot]"));
    const estado = document.getElementById("about-gallery-status");
    const escena = galeria.closest(".about-showcase__scene");

    if (!pista || !ventana || !botonAnterior || !botonSiguiente) {
      console.warn("[Galería] Faltan elementos necesarios en sobre-mi.html.");
      return;
    }

    const diapositivas = Array.from(
      pista.querySelectorAll(".about-gallery__slide")
    );
    const total = diapositivas.length;
    if (!total) return;

    // Visor modal definido al final de sobre-mi.html.
    const visor = document.getElementById("photo-lightbox");
    const imagenAmpliada = visor?.querySelector("[data-zoom-full]");
    const botonCerrar = visor?.querySelector("[data-zoom-close]");
    const botonesZoom = Array.from(galeria.querySelectorAll("[data-zoom-image]"));

    const movimientoReducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let indiceActual = 0;
    let temporizador = null;
    let mouseDentro = false;
    let focoTeclado = false;
    let puntoInicial = null;
    let ignorarClicksHasta = 0;

    function normalizarIndice(indice) {
      if (CONFIG.loop) return ((indice % total) + total) % total;
      return Math.max(0, Math.min(indice, total - 1));
    }

    /* =====================================================
       01. CAMBIO DE DIAPOSITIVAS
       ===================================================== */

    function mostrarDiapositiva(indice, anunciar = false) {
      indiceActual = normalizarIndice(indice);

      pista.style.transform = `translate3d(${-indiceActual * 100}%, 0, 0)`;

      diapositivas.forEach((diapositiva, i) => {
        const activa = i === indiceActual;
        diapositiva.setAttribute("aria-hidden", String(!activa));

        // Una fotografía oculta nunca debe quedar en el orden de tabulación.
        diapositiva.querySelectorAll("[data-zoom-image]").forEach((boton) => {
          boton.tabIndex = activa ? 0 : -1;
        });
      });

      indicadores.forEach((indicador, i) => {
        const activo = i === indiceActual;
        indicador.classList.toggle("is-active", activo);
        if (activo) {
          indicador.setAttribute("aria-current", "true");
        } else {
          indicador.removeAttribute("aria-current");
        }
      });

      if (escena) escena.dataset.galleryIndex = String(indiceActual);

      if (estado) {
        estado.textContent = anunciar
          ? (diapositivas[indiceActual].getAttribute("aria-label") ||
             `Imagen ${indiceActual + 1} de ${total}`)
          : "";
      }
    }

    /* =====================================================
       02. REPRODUCCIÓN AUTOMÁTICA Y PAUSAS
       ===================================================== */

    function detenerAutoplay() {
      if (temporizador !== null) {
        window.clearInterval(temporizador);
        temporizador = null;
      }
    }

    function iniciarAutoplay() {
      detenerAutoplay();

      if (
        !CONFIG.autoplay ||
        total < 2 ||
        movimientoReducido.matches ||
        document.hidden ||
        mouseDentro ||
        focoTeclado ||
        visor?.open
      ) {
        return;
      }

      temporizador = window.setInterval(() => {
        mostrarDiapositiva(indiceActual + 1);
      }, CONFIG.autoplayDelay);
    }

    function navegarA(indice) {
      if (visor?.open) return;
      mostrarDiapositiva(indice, true);
      iniciarAutoplay();
    }

    botonAnterior.addEventListener("click", () => navegarA(indiceActual - 1));
    botonSiguiente.addEventListener("click", () => navegarA(indiceActual + 1));

    indicadores.forEach((indicador) => {
      indicador.addEventListener("click", () => {
        const destino = Number(indicador.dataset.galleryDot);
        if (Number.isInteger(destino) && destino >= 0 && destino < total) {
          navegarA(destino);
        }
      });
    });

    /* =====================================================
       03. NAVEGACIÓN CON TECLADO Y MOUSE
       ===================================================== */

    galeria.addEventListener("keydown", (evento) => {
      if (visor?.open) return;
      if (evento.key === "ArrowRight") {
        evento.preventDefault();
        navegarA(indiceActual + 1);
      } else if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        navegarA(indiceActual - 1);
      }
    });

    galeria.addEventListener("pointerenter", (evento) => {
      if (evento.pointerType !== "mouse") return;
      mouseDentro = true;
      detenerAutoplay();
    });

    galeria.addEventListener("pointerleave", (evento) => {
      if (evento.pointerType !== "mouse") return;
      mouseDentro = false;
      iniciarAutoplay();
    });

    galeria.addEventListener("focusin", (evento) => {
      if (evento.target.matches(":focus-visible")) {
        focoTeclado = true;
        detenerAutoplay();
      }
    });

    galeria.addEventListener("focusout", () => {
      // Esperar a que el navegador asigne el siguiente elemento enfocado.
      window.setTimeout(() => {
        const activo = document.activeElement;
        focoTeclado = Boolean(
          activo && galeria.contains(activo) && activo.matches(":focus-visible")
        );
        iniciarAutoplay();
      }, 0);
    });

    /* =====================================================
       04. DESLIZAMIENTO EN MÓVILES
       ===================================================== */

    ventana.addEventListener("pointerdown", (evento) => {
      if (evento.pointerType === "mouse" || visor?.open) return;
      puntoInicial = {
        id: evento.pointerId,
        x: evento.clientX,
        y: evento.clientY
      };
    });

    ventana.addEventListener("pointerup", (evento) => {
      if (!puntoInicial || puntoInicial.id !== evento.pointerId) return;

      const diferenciaX = evento.clientX - puntoInicial.x;
      const diferenciaY = evento.clientY - puntoInicial.y;
      puntoInicial = null;

      if (
        Math.abs(diferenciaX) < CONFIG.swipeThreshold ||
        Math.abs(diferenciaX) <= Math.abs(diferenciaY) * 1.2
      ) return;

      // Evitar que el clic generado tras deslizar abra el visor por accidente.
      ignorarClicksHasta = Date.now() + 400;
      navegarA(indiceActual + (diferenciaX < 0 ? 1 : -1));
    });

    ventana.addEventListener("pointercancel", () => {
      puntoInicial = null;
    });

    /* =====================================================
       05. VISOR AMPLIADO DE FOTOGRAFÍAS
       ===================================================== */

    if (visor && imagenAmpliada && botonCerrar) {
      botonesZoom.forEach((boton) => {
        boton.addEventListener("click", (evento) => {
          if (Date.now() < ignorarClicksHasta) {
            evento.preventDefault();
            return;
          }

          const diapositiva = boton.closest(".about-gallery__slide");
          if (diapositiva !== diapositivas[indiceActual]) return;

          const imagen = boton.querySelector("img");
          if (!imagen || visor.open) return;

          imagenAmpliada.src = imagen.currentSrc || imagen.src;
          imagenAmpliada.alt = imagen.alt || "Fotografía ampliada";

          detenerAutoplay();
          visor.showModal();
        });
      });

      botonCerrar.addEventListener("click", () => {
        if (visor.open) visor.close();
      });

      // Cerrar solo al pulsar fuera del rectángulo del diálogo.
      visor.addEventListener("click", (evento) => {
        if (evento.target !== visor) return;
        const rect = visor.getBoundingClientRect();
        const fuera = (
          evento.clientX < rect.left || evento.clientX > rect.right ||
          evento.clientY < rect.top || evento.clientY > rect.bottom
        );
        if (fuera && visor.open) visor.close();
      });

      // Escape cierra automáticamente un <dialog> modal nativo.
      visor.addEventListener("close", () => {
        iniciarAutoplay();
      });
    } else if (botonesZoom.length) {
      console.warn("[Galería] No se encontró el visor #photo-lightbox completo.");
    }

    /* =====================================================
       06. VISIBILIDAD Y ACCESIBILIDAD
       ===================================================== */

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) detenerAutoplay();
      else iniciarAutoplay();
    });

    if (typeof movimientoReducido.addEventListener === "function") {
      movimientoReducido.addEventListener("change", iniciarAutoplay);
    } else if (typeof movimientoReducido.addListener === "function") {
      movimientoReducido.addListener(iniciarAutoplay);
    }

    window.addEventListener("pagehide", detenerAutoplay);
    window.addEventListener("pageshow", iniciarAutoplay);

    // Iniciar en el avatar; luego SURA, SOCHE y repetir.
    mostrarDiapositiva(0);
    iniciarAutoplay();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarGaleria, { once: true });
  } else {
    iniciarGaleria();
  }
})();