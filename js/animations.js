/* =========================================================
   MATÍAS CORTÉS — PORTFOLIO
   ANIMATION CONTROLLER

   Este archivo coordina las animaciones generales del sitio.

   Se encarga de:

   - asignar animaciones automáticamente
   - revelar contenido al hacer scroll
   - aplicar pequeños stagger/delays
   - manejar parallax ambiental
   - suavizar cambios entre páginas
   - añadir una interacción sutil al Hero
   - respetar "prefers-reduced-motion"
   - detener trabajo innecesario cuando la pestaña no está
     visible

   IMPORTANTE:

   Este archivo NO controla:

   - cerebro / neuronas       → brain.js
   - fórmulas matemáticas     → formulas.js
   - avatar Three.js          → avatar.js
   - dark / light             → theme.js

   Cada sistema mantiene una responsabilidad distinta.
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     01. CONFIGURACIÓN GENERAL
     ======================================================= */

  /*
   * Centralizamos aquí los valores que probablemente
   * queramos modificar más adelante.
   *
   * De esta forma no tenemos números repartidos por
   * todo el archivo.
   */

  const CONFIG = {
    /* IntersectionObserver */

    revealThreshold: 0.13,

    revealRootMargin:
      "0px 0px -8% 0px",


    /* Stagger automático */

    maxAutoDelay: 4,


    /* Transición entre páginas */

    pageTransitionDuration: 170,


    /* Hero pointer */

    heroPointerX: 5,
    heroPointerY: 3,

    heroPointerEase: 0.055,

    heroPointerStopThreshold: 0.01
  };


  /* =======================================================
     02. MEDIA QUERIES
     ======================================================= */

  /*
   * Guardamos las MediaQueryList una sola vez.
   *
   * Esto evita ejecutar matchMedia repetidamente.
   */

  const reducedMotionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  const hoverQuery =
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );


  /* =======================================================
     03. ESTADO INTERNO
     ======================================================= */

  /*
   * Aquí guardamos referencias necesarias para limpiar
   * observers, listeners y requestAnimationFrame.
   */

  let revealObserver = null;

  let parallaxFrame = null;

  let heroFrame = null;

  let heroIsVisible = true;

  let initialized = false;


  /*
   * Guardamos funciones de limpieza.
   *
   * Cada sistema que agregue listeners puede registrar
   * aquí cómo desmontarse correctamente.
   */

  const cleanupCallbacks = [];


  /* =======================================================
     04. HELPERS
     ======================================================= */

  /*
   * Agrega un atributo solamente cuando el elemento
   * todavía no lo tiene.
   *
   * Esto es importante porque queremos respetar cualquier
   * animación que configuremos manualmente desde HTML.
   */

  const setAttributeIfMissing = (
    element,
    attribute,
    value
  ) => {
    if (
      !element.hasAttribute(
        attribute
      )
    ) {
      element.setAttribute(
        attribute,
        value
      );
    }
  };


  /*
   * Nos permite registrar funciones que se ejecutarán
   * durante el cleanup.
   */

  const registerCleanup = (
    callback
  ) => {
    cleanupCallbacks.push(
      callback
    );
  };


  /* =======================================================
     05. ASIGNACIÓN AUTOMÁTICA DE ANIMACIONES
     ======================================================= */

  /*
   * La idea es no llenar todo el HTML con:
   *
   * data-animate="fade-up"
   * data-delay="1"
   *
   * para elementos que siempre siguen el mismo patrón.
   *
   * Sin embargo, si alguno ya tiene un atributo manual,
   * NO lo sobrescribimos.
   */

  const assignAnimations = () => {

    /* -----------------------------------------------------
       Encabezados de sección
       ----------------------------------------------------- */

    document
      .querySelectorAll(
        ".section-header"
      )
      .forEach(
        (element) => {
          setAttributeIfMissing(
            element,
            "data-animate",
            "fade-up"
          );
        }
      );


    /* -----------------------------------------------------
       Tarjetas informativas
       ----------------------------------------------------- */

    document
      .querySelectorAll(
        ".info-card"
      )
      .forEach(
        (
          element,
          index
        ) => {
          setAttributeIfMissing(
            element,
            "data-animate",
            "fade-up"
          );

          setAttributeIfMissing(
            element,
            "data-delay",
            String(
              (
                index %
                CONFIG.maxAutoDelay
              ) + 1
            )
          );
        }
      );


    /* -----------------------------------------------------
       Tarjetas de proyectos
       ----------------------------------------------------- */

    document
      .querySelectorAll(
        ".project-card"
      )
      .forEach(
        (
          element,
          index
        ) => {
          setAttributeIfMissing(
            element,
            "data-animate",
            "fade-up"
          );

          setAttributeIfMissing(
            element,
            "data-delay",
            String(
              (
                index %
                CONFIG.maxAutoDelay
              ) + 1
            )
          );
        }
      );


    /* -----------------------------------------------------
       Timeline
       ----------------------------------------------------- */

    document
      .querySelectorAll(
        ".timeline-item"
      )
      .forEach(
        (
          element,
          index
        ) => {
          setAttributeIfMissing(
            element,
            "data-animate",
            "fade-up"
          );

          setAttributeIfMissing(
            element,
            "data-delay",
            String(
              (
                index %
                CONFIG.maxAutoDelay
              ) + 1
            )
          );
        }
      );


    /* -----------------------------------------------------
       Home → Explorar
       ----------------------------------------------------- */

    document
      .querySelectorAll(
        ".home-explore__item"
      )
      .forEach(
        (
          element,
          index
        ) => {
          setAttributeIfMissing(
            element,
            "data-animate",
            "fade-up"
          );

          setAttributeIfMissing(
            element,
            "data-delay",
            String(
              Math.min(
                index + 1,
                CONFIG.maxAutoDelay
              )
            )
          );
        }
      );


    /* -----------------------------------------------------
       Visualizaciones de datos
       ----------------------------------------------------- */

    document
      .querySelectorAll(
        ".data-visual"
      )
      .forEach(
        (element) => {
          setAttributeIfMissing(
            element,
            "data-animate",
            "scale"
          );
        }
      );


    /* -----------------------------------------------------
       Sección CV
       ----------------------------------------------------- */

    const cvContent =
      document.querySelector(
        ".cv-section .container"
      );

    if (cvContent) {
      setAttributeIfMissing(
        cvContent,
        "data-animate",
        "fade-up"
      );
    }


    /* -----------------------------------------------------
       Contacto
       ----------------------------------------------------- */

    const contactContent =
      document.querySelector(
        ".contact .container"
      );

    if (contactContent) {
      setAttributeIfMissing(
        contactContent,
        "data-animate",
        "fade-up"
      );
    }
  };


  /* =======================================================
     06. MOSTRAR TODO
     ======================================================= */

  /*
   * Se utiliza cuando:
   *
   * - IntersectionObserver no existe
   * - reduced motion está activo
   * - queremos asegurar que ningún contenido quede oculto
   */

  const showAll = () => {
    document
      .querySelectorAll(
        "[data-animate]"
      )
      .forEach(
        (element) => {
          element.classList.add(
            "is-visible"
          );
        }
      );
  };


  /* =======================================================
     07. INTERSECTION OBSERVER
     ======================================================= */

  /*
   * IntersectionObserver detecta cuándo un elemento
   * entra al viewport.
   *
   * En ese momento agregamos:
   *
   * .is-visible
   *
   * animations.css realiza la transición visual.
   */

  const createRevealObserver = () => {

    /*
     * Fallback.
     *
     * En un navegador antiguo mostramos todo directamente.
     */

    if (
      !(
        "IntersectionObserver"
        in window
      )
    ) {
      showAll();

      return;
    }


    revealObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {

              if (
                !entry.isIntersecting
              ) {
                return;
              }


              entry.target
                .classList
                .add(
                  "is-visible"
                );


              /*
               * Cada reveal ocurre una sola vez.
               *
               * Después dejamos de observar el elemento para
               * ahorrar trabajo.
               */

              revealObserver
                ?.unobserve(
                  entry.target
                );
            }
          );
        },
        {
          threshold:
            CONFIG
              .revealThreshold,

          rootMargin:
            CONFIG
              .revealRootMargin
        }
      );


    document
      .querySelectorAll(
        "[data-animate]"
      )
      .forEach(
        (element) => {
          revealObserver.observe(
            element
          );
        }
      );


    registerCleanup(
      () => {
        revealObserver
          ?.disconnect();

        revealObserver = null;
      }
    );
  };


  /* =======================================================
     08. PARALLAX AMBIENTAL
     ======================================================= */

  /*
   * Algunos elementos pueden utilizar:
   *
   * data-parallax="0.04"
   *
   * para desplazarse muy suavemente al hacer scroll.
   *
   * IMPORTANTE:
   *
   * No modificamos "transform".
   *
   * Utilizamos la propiedad individual "translate".
   *
   * Esto permite que el parallax conviva con:
   *
   * transform de animations.css
   *
   * sin que uno sobrescriba al otro.
   */

  const configureParallax = () => {

    if (
      reducedMotionQuery.matches
    ) {
      return;
    }


    const elements =
      Array.from(
        document.querySelectorAll(
          "[data-parallax]"
        )
      );


    if (!elements.length) {
      return;
    }


    let ticking = false;


    const update = () => {
      const viewportHeight =
        window.innerHeight;


      elements.forEach(
        (element) => {

          const rect =
            element
              .getBoundingClientRect();


          /*
           * Si está fuera de pantalla no calculamos nada.
           */

          if (
            rect.bottom < 0 ||
            rect.top >
              viewportHeight
          ) {
            return;
          }


          const parsedSpeed =
            Number.parseFloat(
              element.dataset
                .parallax
            );


          const speed =
            Number.isFinite(
              parsedSpeed
            )
              ? parsedSpeed
              : 0.04;


          const center =
            rect.top +
            rect.height / 2;


          const distance =
            center -
            viewportHeight / 2;


          /*
           * Limitamos el desplazamiento para evitar valores
           * exagerados si alguien configura una velocidad
           * demasiado grande.
           */

          const offset =
            Math.max(
              -40,
              Math.min(
                40,
                distance * speed
              )
            );


          element.style.translate =
            `0 ${offset.toFixed(2)}px`;
        }
      );


      ticking = false;
      parallaxFrame = null;
    };


    const requestUpdate = () => {

      if (
        ticking ||
        document.hidden
      ) {
        return;
      }


      ticking = true;


      parallaxFrame =
        requestAnimationFrame(
          update
        );
    };


    window.addEventListener(
      "scroll",
      requestUpdate,
      {
        passive: true
      }
    );


    window.addEventListener(
      "resize",
      requestUpdate,
      {
        passive: true
      }
    );


    requestUpdate();


    registerCleanup(
      () => {
        window.removeEventListener(
          "scroll",
          requestUpdate
        );

        window.removeEventListener(
          "resize",
          requestUpdate
        );


        if (parallaxFrame) {
          cancelAnimationFrame(
            parallaxFrame
          );

          parallaxFrame = null;
        }


        /*
         * Dejamos los elementos en su posición natural.
         */

        elements.forEach(
          (element) => {
            element.style.translate =
              "";
          }
        );
      }
    );
  };


  /* =======================================================
     09. TRANSICIÓN ENTRE PÁGINAS
     ======================================================= */

  /*
   * Hacemos un fade MUY corto antes de navegar internamente.
   *
   * No interceptamos:
   *
   * - enlaces externos
   * - downloads
   * - mailto:
   * - tel:
   * - anchors internos
   * - Ctrl/Cmd + click
   * - Shift + click
   * - Alt + click
   * - pestañas nuevas
   */

  const configurePageTransitions =
    () => {


      const handleClick = (
        event
      ) => {

        /*
         * Solo clic principal.
         */

        if (
          event.defaultPrevented ||
          event.button !== 0
        ) {
          return;
        }


        /*
         * Respetamos comportamiento nativo de navegador.
         */

        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }


        const link =
          event.target.closest(
            "a[href]"
          );


        if (!link) {
          return;
        }


        /*
         * Elementos que nunca debemos interceptar.
         */

        if (
          link.hasAttribute(
            "download"
          ) ||
          link.hasAttribute(
            "data-no-transition"
          ) ||
          link.target ===
            "_blank"
        ) {
          return;
        }


        const href =
          link.getAttribute(
            "href"
          );


        if (!href) {
          return;
        }


        /*
         * Anchor interno.
         */

        if (
          href.startsWith(
            "#"
          )
        ) {
          return;
        }


        let url;


        try {
          url =
            new URL(
              href,
              window.location.href
            );
        } catch {
          return;
        }


        /*
         * Solo HTTP / HTTPS.
         *
         * Esto deja tranquilos mailto:, tel:, etc.
         */

        if (
          url.protocol !==
            "http:" &&
          url.protocol !==
            "https:"
        ) {
          return;
        }


        /*
         * Links externos mantienen su comportamiento normal.
         */

        if (
          url.origin !==
          window.location.origin
        ) {
          return;
        }


        /*
         * Si solamente cambia el hash dentro del documento,
         * dejamos que scroll-behavior haga su trabajo.
         */

        const sameDocument =
          url.pathname ===
            window.location.pathname &&
          url.search ===
            window.location.search;


        if (
          sameDocument &&
          url.hash
        ) {
          return;
        }


        /*
         * Si hacemos clic exactamente en la página actual,
         * tampoco necesitamos hacer un fade + reload.
         */

        if (
          url.href ===
          window.location.href
        ) {
          event.preventDefault();

          return;
        }


        if (
          reducedMotionQuery.matches
        ) {
          return;
        }


        event.preventDefault();


        document.body
          .classList
          .add(
            "is-leaving"
          );


        window.setTimeout(
          () => {
            window.location.assign(
              url.href
            );
          },
          CONFIG
            .pageTransitionDuration
        );
      };


      /*
       * Usamos delegación de eventos.
       *
       * De esta manera también funciona con links creados
       * dinámicamente por projects.js.
       */

      document.addEventListener(
        "click",
        handleClick
      );


      /*
       * Cuando utilizamos atrás/adelante, algunos navegadores
       * restauran la página desde Back/Forward Cache.
       *
       * Nos aseguramos de quitar is-leaving.
       */

      const handlePageShow = () => {
        document.body
          .classList
          .remove(
            "is-leaving"
          );
      };


      window.addEventListener(
        "pageshow",
        handlePageShow
      );


      registerCleanup(
        () => {
          document.removeEventListener(
            "click",
            handleClick
          );

          window.removeEventListener(
            "pageshow",
            handlePageShow
          );
        }
      );
    };


  /* =======================================================
     10. INTERACCIÓN DEL HERO CON EL PUNTERO
     ======================================================= */

  /*
   * En escritorio, el bloque de texto se desplaza apenas
   * unos píxeles en dirección opuesta al mouse.
   *
   * El efecto debe sentirse, no llamar la atención.
   *
   * CORRECCIÓN:
   *
   * La versión anterior mantenía requestAnimationFrame
   * funcionando para siempre.
   *
   * Ahora el loop solamente existe mientras el contenido
   * necesita moverse.
   */

  const configureHeroPointer =
    () => {


      if (
        reducedMotionQuery.matches ||
        !hoverQuery.matches
      ) {
        return;
      }


      const hero =
        document.querySelector(
          ".hero"
        );


      if (!hero) {
        return;
      }


      const content =
        hero.querySelector(
          ".hero__content"
        );


      if (!content) {
        return;
      }


      let targetX = 0;
      let targetY = 0;

      let currentX = 0;
      let currentY = 0;

      let needsAnimation =
        false;


      /* -----------------------------------------------------
         Detectamos si el Hero está visible.
         ----------------------------------------------------- */

      let heroObserver = null;


      if (
        "IntersectionObserver"
        in window
      ) {

        heroObserver =
          new IntersectionObserver(
            ([entry]) => {
              heroIsVisible =
                entry?.isIntersecting ??
                true;


              if (!heroIsVisible) {
                targetX = 0;
                targetY = 0;
              }
            },
            {
              threshold:
                0.01
            }
          );


        heroObserver.observe(
          hero
        );
      }


      /* -----------------------------------------------------
         Animación
         ----------------------------------------------------- */

      const animate = () => {

        heroFrame = null;


        if (
          document.hidden ||
          !heroIsVisible
        ) {
          return;
        }


        currentX +=
          (
            targetX -
            currentX
          ) *
          CONFIG.heroPointerEase;


        currentY +=
          (
            targetY -
            currentY
          ) *
          CONFIG.heroPointerEase;


        /*
         * Usamos translate en lugar de transform.
         *
         * Esto evita conflictos con otras reglas CSS.
         */

        content.style.translate =
          `${currentX.toFixed(2)}px ${currentY.toFixed(2)}px`;


        const deltaX =
          Math.abs(
            targetX -
            currentX
          );


        const deltaY =
          Math.abs(
            targetY -
            currentY
          );


        /*
         * Cuando llegamos prácticamente al objetivo
         * detenemos el requestAnimationFrame.
         */

        needsAnimation =
          deltaX >
            CONFIG
              .heroPointerStopThreshold ||
          deltaY >
            CONFIG
              .heroPointerStopThreshold;


        if (needsAnimation) {
          heroFrame =
            requestAnimationFrame(
              animate
            );
        }
      };


      const requestHeroFrame = () => {

        if (
          heroFrame ||
          document.hidden ||
          !heroIsVisible
        ) {
          return;
        }


        heroFrame =
          requestAnimationFrame(
            animate
          );
      };


      /* -----------------------------------------------------
         Pointer move
         ----------------------------------------------------- */

      const handleMove = (
        event
      ) => {

        const rect =
          hero
            .getBoundingClientRect();


        if (
          rect.width <= 0 ||
          rect.height <= 0
        ) {
          return;
        }


        const x =
          (
            event.clientX -
            rect.left
          ) /
          rect.width;


        const y =
          (
            event.clientY -
            rect.top
          ) /
          rect.height;


        /*
         * Movimiento máximo:
         *
         * horizontal ±2.5px aproximadamente
         * vertical   ±1.5px aproximadamente
         *
         * Deliberadamente sutil.
         */

        targetX =
          (
            x - 0.5
          ) *
          -CONFIG.heroPointerX;


        targetY =
          (
            y - 0.5
          ) *
          -CONFIG.heroPointerY;


        requestHeroFrame();
      };


      /* -----------------------------------------------------
         Pointer leave
         ----------------------------------------------------- */

      const handleLeave = () => {

        targetX = 0;
        targetY = 0;

        requestHeroFrame();
      };


      hero.addEventListener(
        "pointermove",
        handleMove,
        {
          passive: true
        }
      );


      hero.addEventListener(
        "pointerleave",
        handleLeave,
        {
          passive: true
        }
      );


      registerCleanup(
        () => {

          hero.removeEventListener(
            "pointermove",
            handleMove
          );


          hero.removeEventListener(
            "pointerleave",
            handleLeave
          );


          heroObserver
            ?.disconnect();


          if (heroFrame) {
            cancelAnimationFrame(
              heroFrame
            );

            heroFrame = null;
          }


          content.style.translate =
            "";
        }
      );
    };


  /* =======================================================
     11. VISIBILIDAD DE LA PESTAÑA
     ======================================================= */

  /*
   * Cuando cambiamos de pestaña no tiene sentido continuar
   * solicitando frames de animación.

   brain.js y formulas.js también manejan esto por separado.
   */

  const configureVisibilityHandling =
    () => {


      const handleVisibilityChange =
        () => {


          /*
           * Si volvemos al sitio eliminamos cualquier posible
           * estado visual de salida incompleto.
           */

          if (!document.hidden) {
            document.body
              .classList
              .remove(
                "is-leaving"
              );
          }
        };


      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
      );


      registerCleanup(
        () => {
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
          );
        }
      );
    };


  /* =======================================================
     12. CAMBIO DE PREFERENCIA REDUCED MOTION
     ======================================================= */

  /*
   * No asumimos que la preferencia nunca cambiará.
   *
   * Si el usuario activa "Reducir movimiento" mientras
   * el sitio está abierto:
   *
   * - mostramos todo
   * - detenemos observers de reveal
   *
   * Las Media Queries CSS harán el resto.
   */

  const configureReducedMotionChange =
    () => {


      const handleChange = (
        event
      ) => {


        if (!event.matches) {
          /*
           * No reconstruimos todo automáticamente porque
           * podría causar movimientos repentinos.
           *
           * La nueva preferencia completa se aplicará en
           * la próxima carga.
           */

          return;
        }


        showAll();


        revealObserver
          ?.disconnect();

        revealObserver = null;


        /*
         * Quitamos cualquier desplazamiento ambiental
         * aplicado mediante propiedades inline.
         */

        document
          .querySelectorAll(
            "[data-parallax]"
          )
          .forEach(
            (element) => {
              element.style.translate =
                "";
            }
          );


        const heroContent =
          document.querySelector(
            ".hero__content"
          );


        if (heroContent) {
          heroContent.style.translate =
            "";
        }
      };


      if (
        typeof reducedMotionQuery
          .addEventListener ===
        "function"
      ) {

        reducedMotionQuery
          .addEventListener(
            "change",
            handleChange
          );


        registerCleanup(
          () => {
            reducedMotionQuery
              .removeEventListener(
                "change",
                handleChange
              );
          }
        );

      } else {

        /*
         * Fallback para navegadores antiguos.
         */

        reducedMotionQuery
          .addListener(
            handleChange
          );


        registerCleanup(
          () => {
            reducedMotionQuery
              .removeListener(
                handleChange
              );
          }
        );
      }
    };


  /* =======================================================
     13. CLEANUP GENERAL
     ======================================================= */

  /*
   * Normalmente una página HTML se destruye al navegar.
   *
   * Aun así dejamos un cleanup real para:
   *
   * - BFCache
   * - desarrollo con Live Server
   * - futuras integraciones
   */

  const cleanup = () => {


    cleanupCallbacks
      .splice(0)
      .forEach(
        (callback) => {

          try {
            callback();
          } catch {
            /*
             * Una función de limpieza no debe impedir
             * que se ejecuten las demás.
             */
          }
        }
      );


    if (parallaxFrame) {
      cancelAnimationFrame(
        parallaxFrame
      );

      parallaxFrame = null;
    }


    if (heroFrame) {
      cancelAnimationFrame(
        heroFrame
      );

      heroFrame = null;
    }


    revealObserver
      ?.disconnect();

    revealObserver = null;
  };


  /* =======================================================
     14. INICIALIZACIÓN
     ======================================================= */

  const init = () => {


    /*
     * Evitamos inicializar el controlador dos veces.
     */

    if (initialized) {
      return;
    }


    initialized = true;


    /* -----------------------------------------------------
       1. Añadimos data-animate
       ----------------------------------------------------- */

    assignAnimations();


    /* -----------------------------------------------------
       2. Reduced motion
       ----------------------------------------------------- */

    if (
      reducedMotionQuery.matches
    ) {

      /*
       * No agregamos has-animations.
       *
       * El contenido simplemente permanece visible.
       */

      showAll();

      configurePageTransitions();

      configureVisibilityHandling();

      configureReducedMotionChange();

      return;
    }


    /* -----------------------------------------------------
       3. Activamos CSS animation states
       ----------------------------------------------------- */

    document
      .documentElement
      .classList
      .add(
        "has-animations"
      );


    /* -----------------------------------------------------
       4. Reveal de scroll
       ----------------------------------------------------- */

    createRevealObserver();


    /* -----------------------------------------------------
       5. Parallax ambiental
       ----------------------------------------------------- */

    configureParallax();


    /* -----------------------------------------------------
       6. Navegación
       ----------------------------------------------------- */

    configurePageTransitions();


    /* -----------------------------------------------------
       7. Interacción del Hero
       ----------------------------------------------------- */

    configureHeroPointer();


    /* -----------------------------------------------------
       8. Visibilidad
       ----------------------------------------------------- */

    configureVisibilityHandling();


    /* -----------------------------------------------------
       9. Preferencia reduced motion
       ----------------------------------------------------- */

    configureReducedMotionChange();
  };


  /* =======================================================
     15. START
     ======================================================= */

  /*
   * El archivo normalmente se carga con defer.
   *
   * Aun así comprobamos readyState para que también funcione
   * correctamente si posteriormente cambiamos su ubicación.
   */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );

  } else {

    init();
  }


  /* =======================================================
     16. PAGEHIDE
     ======================================================= */

  /*
   * pagehide es más apropiado que beforeunload cuando existe
   * Back/Forward Cache.
   */

  window.addEventListener(
    "pagehide",
    cleanup,
    {
      once: true
    }
  );
})();