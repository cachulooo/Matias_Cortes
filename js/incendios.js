/* =========================================================
   MATÍAS CORTÉS | PORTAFOLIO PROFESIONAL

   PROYECTO:
   MODELAMIENTO DE IGNICIONES DE INCENDIOS FORESTALES
   MEDIANTE PROCESOS DE COX LOG-GAUSSIANOS (LGCP)

   Archivo: js/incendios.js

   FUNCIONALIDADES:

   01. Inicialización de la página
   02. Visor de figuras científicas
   03. Apertura de mapas ampliados
   04. Identificación de cada figura
   05. Cierre mediante botón
   06. Cierre mediante tecla Escape
   07. Cierre al pulsar fuera del visor
   08. Control del desplazamiento de la página
   09. Navegación interna entre secciones
   10. Indicador de sección activa
   11. Accesibilidad
   12. Optimización de rendimiento

   ========================================================= */

(() => {

  "use strict";


  /* =======================================================
     01. CONFIGURACIÓN GENERAL
     ======================================================= */

  const CONFIG = {

    activarVisor: true,

    activarNavegacion: true,

    desplazamientoAdicional: 35

  };


  /* =======================================================
     02. INICIALIZACIÓN
     ======================================================= */

  function iniciarProyectoIncendios() {

    const pagina = document.querySelector(
      ".thesis-page"
    );

    if (!pagina) {
      return;
    }

    /* -----------------------------------------------------
       ELEMENTOS DEL VISOR
       ----------------------------------------------------- */

    const visor = document.getElementById(
      "thesis-lightbox"
    );

    const imagenVisor = document.getElementById(
      "thesis-lightbox-image"
    );

    const descripcionVisor = document.getElementById(
      "thesis-lightbox-caption"
    );

    const botonCerrar = visor?.querySelector(
      "[data-thesis-close]"
    );


    /* -----------------------------------------------------
       FIGURAS QUE PERMITEN AMPLIACIÓN
       ----------------------------------------------------- */

    const figuras = Array.from(
      pagina.querySelectorAll(
        "[data-thesis-zoom]"
      )
    );


    /* -----------------------------------------------------
       ESTADO INTERNO
       ----------------------------------------------------- */

    let enlaceAnterior = null;

    let overflowAnterior = "";


    /* =====================================================
       03. COMPROBAR DISPONIBILIDAD DEL VISOR
       ===================================================== */

    const visorDisponible = Boolean(

      CONFIG.activarVisor &&

      visor &&

      imagenVisor &&

      descripcionVisor &&

      botonCerrar &&

      typeof visor.showModal === "function"

    );


    /* =====================================================
       04. ABRIR FIGURA AMPLIADA
       ===================================================== */

    function abrirFigura(enlace) {

      if (!visorDisponible) {
        return;
      }

      if (visor.open) {
        return;
      }


      /* ---------------------------------------------------
         OBTENER LA IMAGEN ORIGINAL
         --------------------------------------------------- */

      const imagenOriginal = enlace.querySelector(
        "img"
      );

      const rutaImagen = enlace.href;

      if (!rutaImagen) {
        return;
      }


      /* ---------------------------------------------------
         OBTENER INFORMACIÓN DE LA FIGURA
         --------------------------------------------------- */

      const titulo = enlace.dataset.figureTitle ||
        "Figura de investigación";

      const descripcion = imagenOriginal?.alt ||
        titulo;


      /* ---------------------------------------------------
         CONFIGURAR LA IMAGEN AMPLIADA
         --------------------------------------------------- */

      imagenVisor.src = rutaImagen;

      imagenVisor.alt = descripcion;

      imagenVisor.decoding = "async";


      /* ---------------------------------------------------
         ACTUALIZAR DESCRIPCIÓN
         --------------------------------------------------- */

      descripcionVisor.textContent = titulo;


      /* ---------------------------------------------------
         RECORDAR ELEMENTO DE ORIGEN
         --------------------------------------------------- */

      enlaceAnterior = enlace;


      /* ---------------------------------------------------
         ABRIR VISOR
         --------------------------------------------------- */

      visor.showModal();


      /* ---------------------------------------------------
         BLOQUEAR DESPLAZAMIENTO DE FONDO
         --------------------------------------------------- */

      overflowAnterior =
        document.documentElement.style.overflow;

      document.documentElement.style.overflow =
        "hidden";


      /* ---------------------------------------------------
         ENFOCAR BOTÓN PARA CERRAR
         --------------------------------------------------- */

      botonCerrar.focus();

    }


    /* =====================================================
       05. CERRAR VISOR
       ===================================================== */

    function cerrarFigura() {

      if (!visorDisponible) {
        return;
      }

      if (!visor.open) {
        return;
      }

      visor.close();

    }


    /* =====================================================
       06. RESTAURAR LA PÁGINA
       ===================================================== */

    function restaurarPagina() {

      document.documentElement.style.overflow =
        overflowAnterior;


      /* ---------------------------------------------------
         RESTAURAR FOCO AL ENLACE ORIGINAL
         --------------------------------------------------- */

      if (
        enlaceAnterior &&
        enlaceAnterior.isConnected
      ) {

        enlaceAnterior.focus({
          preventScroll: true
        });

      }

      enlaceAnterior = null;

    }


    /* =====================================================
       07. ACTIVAR AMPLIACIÓN EN CADA FIGURA
       ===================================================== */

    if (visorDisponible) {

      figuras.forEach((enlace) => {

        enlace.addEventListener(
          "click",
          (evento) => {

            /* Permitir abrir en una pestaña nueva */

            if (
              evento.defaultPrevented ||
              evento.button !== 0 ||
              evento.ctrlKey ||
              evento.metaKey ||
              evento.shiftKey ||
              evento.altKey
            ) {
              return;
            }


            /* Evitar navegación al PNG */

            evento.preventDefault();


            /* Abrir el visor */

            abrirFigura(enlace);

          }
        );

      });


      /* ===================================================
         08. BOTÓN DE CIERRE
         =================================================== */

      botonCerrar.addEventListener(
        "click",
        cerrarFigura
      );


      /* ===================================================
         09. CERRAR AL PULSAR FUERA DEL VISOR
         =================================================== */

      visor.addEventListener(
        "click",
        (evento) => {

          if (evento.target !== visor) {
            return;
          }

          const rectangulo =
            visor.getBoundingClientRect();

          const fueraHorizontalmente =

            evento.clientX < rectangulo.left ||

            evento.clientX > rectangulo.right;


          const fueraVerticalmente =

            evento.clientY < rectangulo.top ||

            evento.clientY > rectangulo.bottom;


          if (
            fueraHorizontalmente ||
            fueraVerticalmente
          ) {

            cerrarFigura();

          }

        }
      );


      /* ===================================================
         10. CIERRE MEDIANTE ESCAPE
         =================================================== */

      /*
         <dialog> incorpora soporte nativo para Escape.

         El evento close se ejecuta también cuando
         el usuario cierra mediante el teclado.
      */

      visor.addEventListener(
        "close",
        restaurarPagina
      );

    }


    /* =====================================================
       11. NAVEGACIÓN INTERNA DE LA TESIS
       ===================================================== */

    if (CONFIG.activarNavegacion) {

      const navegacion = document.querySelector(
        ".thesis-nav"
      );

      const enlacesNavegacion = Array.from(
        document.querySelectorAll(
          ".thesis-nav__inner a[href^='#']"
        )
      );


      /* ---------------------------------------------------
         RELACIONAR ENLACES CON SECCIONES
         --------------------------------------------------- */

      const secciones = enlacesNavegacion

        .map((enlace) => {

          const identificador =
            enlace.getAttribute("href")?.slice(1);

          if (!identificador) {
            return null;
          }

          const seccion =
            document.getElementById(
              identificador
            );

          if (!seccion) {
            return null;
          }

          return {

            enlace: enlace,

            seccion: seccion

          };

        })

        .filter(Boolean);


      /* ===================================================
         12. MARCAR SECCIÓN ACTIVA
         =================================================== */

      function marcarSeccionActiva(
        enlaceActivo
      ) {

        enlacesNavegacion.forEach(
          (enlace) => {

            const activo =
              enlace === enlaceActivo;

            enlace.classList.toggle(
              "is-active",
              activo
            );

            if (activo) {

              enlace.setAttribute(
                "aria-current",
                "location"
              );

            } else {

              enlace.removeAttribute(
                "aria-current"
              );

            }

          }
        );

      }


      /* ===================================================
         13. DETECTAR POSICIÓN DE DESPLAZAMIENTO
         =================================================== */

      function actualizarNavegacion() {

        const cabecera = document.getElementById(
          "site-header"
        );


        /* Altura de los elementos fijos */

        const alturaCabecera =
          cabecera?.getBoundingClientRect().height || 0;

        const alturaNavegacion =
          navegacion?.getBoundingClientRect().height || 0;


        /* Línea de referencia */

        const referencia =

          alturaCabecera +

          alturaNavegacion +

          CONFIG.desplazamientoAdicional;


        let enlaceActivo = null;


        /* -------------------------------------------------
           IDENTIFICAR LA SECCIÓN ACTUAL
           ------------------------------------------------- */

        secciones.forEach(({ enlace, seccion }) => {

          const posicion =
            seccion.getBoundingClientRect();

          if (posicion.top <= referencia) {

            enlaceActivo = enlace;

          }

        });


        marcarSeccionActiva(
          enlaceActivo
        );

      }


      /* ===================================================
         14. OPTIMIZACIÓN MEDIANTE ANIMATION FRAME
         =================================================== */

      let actualizacionPendiente = false;


      function solicitarActualizacion() {

        if (actualizacionPendiente) {
          return;
        }

        actualizacionPendiente = true;


        window.requestAnimationFrame(() => {

          actualizarNavegacion();

          actualizacionPendiente = false;

        });

      }


      /* ===================================================
         15. EVENTOS DE NAVEGACIÓN
         =================================================== */

      if (secciones.length > 0) {

        window.addEventListener(
          "scroll",
          solicitarActualizacion,
          { passive: true }
        );

        window.addEventListener(
          "resize",
          solicitarActualizacion,
          { passive: true }
        );

        window.addEventListener(
          "hashchange",
          solicitarActualizacion
        );


        /* Actualización inicial */

        solicitarActualizacion();


        /* Actualizar después de cargar imágenes */

        window.addEventListener(
          "load",
          solicitarActualizacion
        );

      }

    }


    /* =====================================================
       16. DIAGNÓSTICO DE IMÁGENES
       ===================================================== */

    figuras.forEach((enlace) => {

      const imagen = enlace.querySelector(
        "img"
      );

      if (!imagen) {
        return;
      }


      /* ---------------------------------------------------
         INFORMAR SOBRE IMÁGENES NO ENCONTRADAS
         --------------------------------------------------- */

      imagen.addEventListener(
        "error",
        () => {

          console.warn(

            "[Tesis LGCP] No se pudo cargar la figura:",

            imagen.getAttribute("src")

          );

        }
      );

    });


    /* =====================================================
       17. ESTADO DE INICIALIZACIÓN
       ===================================================== */

    console.info(
      "[Tesis LGCP] Página de investigación inicializada."
    );

  }


  /* =======================================================
     18. ESPERAR A QUE EL HTML ESTÉ DISPONIBLE
     ======================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      iniciarProyectoIncendios,
      { once: true }
    );

  } else {

    iniciarProyectoIncendios();

  }

})();


/* =========================================================
   FIN — PROYECTO INCENDIOS FORESTALES
   MATÍAS CORTÉS | ESTADÍSTICA Y CIENCIA DE DATOS
   ========================================================= */