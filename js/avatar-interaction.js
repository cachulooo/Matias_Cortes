/* =========================================================
   MATÍAS CORTÉS — PORTFOLIO
   Avatar Interaction System

   Controla únicamente el avatar ilustrado de Sobre mí.

   Efectos:
   - idle floating
   - pointer tilt
   - parallax
   - hover scale
   - reactive glow
   - floating cards
   - smooth interpolation

   No requiere librerías externas.
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     01. DOM
     ======================================================= */

  const scene =
    document.querySelector(
      ".about-showcase__scene"
    );


  const avatar =
    document.querySelector(
      ".about-avatar"
    );


  const image =
    document.querySelector(
      ".about-avatar__image"
    );


  const glow =
    document.querySelector(
      ".about-avatar__glow"
    );


  const cards =
    Array.from(
      document.querySelectorAll(
        ".about-showcase__scene .tech-card"
      )
    );


  /*
   * Si esta página no tiene el avatar,
   * simplemente terminamos.
   */

  if (
    !scene ||
    !avatar ||
    !image
  ) {
    return;
  }


  /* =======================================================
     02. ACCESIBILIDAD
     ======================================================= */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  const finePointer =
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );


  /* =======================================================
     03. CONFIGURACIÓN
     ======================================================= */

  const CONFIG = {

    /*
     * Inclinación máxima del avatar.
     *
     * 4.5 grados es suficiente para generar profundidad
     * sin convertirlo en una tarjeta exageradamente 3D.
     */

    maxTiltX:
      4.5,

    maxTiltY:
      5.5,


    /*
     * Movimiento horizontal y vertical del personaje.
     */

    parallaxX:
      9,

    parallaxY:
      5,


    /*
     * Zoom al entrar con el mouse.
     */

    hoverScale:
      1.045,


    /*
     * Movimiento vertical automático.
     */

    floatAmplitude:
      7,

    floatSpeed:
      0.00135,


    /*
     * Suavizado.
     *
     * Cuanto menor el número,
     * más suave y pesado se siente.
     */

    easing:
      0.065,


    /*
     * Parallax de las tarjetas.
     */

    cardDepths:
      [
        14,
        19,
        16
      ],


    /*
     * Movimiento vertical independiente
     * de cada tarjeta.
     */

    cardFloat:
      [
        3.2,
        4.1,
        3.6
      ]
  };


  /* =======================================================
     04. ESTADO
     ======================================================= */

  const state = {

    pointerInside:
      false,

    targetX:
      0,

    targetY:
      0,

    currentX:
      0,

    currentY:
      0,

    targetScale:
      1,

    currentScale:
      1,

    animationFrame:
      null,

    visible:
      true
  };


  /* =======================================================
     05. HELPERS
     ======================================================= */

  const lerp = (
    current,
    target,
    amount
  ) =>
    current +
    (
      target -
      current
    ) *
    amount;


  const clamp = (
    value,
    min,
    max
  ) =>
    Math.min(
      max,
      Math.max(
        min,
        value
      )
    );


  /* =======================================================
     06. POINTER MOVE
     ======================================================= */

  const handlePointerMove =
    (event) => {

      if (
        reducedMotion.matches ||
        !finePointer.matches
      ) {
        return;
      }


      const rect =
        scene.getBoundingClientRect();


      /*
       * Convertimos el mouse a rango:
       *
       * -1 ........ 0 ........ +1
       */

      const normalizedX =
        (
          (
            event.clientX -
            rect.left
          ) /
          rect.width
        ) *
          2 -
        1;


      const normalizedY =
        (
          (
            event.clientY -
            rect.top
          ) /
          rect.height
        ) *
          2 -
        1;


      state.targetX =
        clamp(
          normalizedX,
          -1,
          1
        );


      state.targetY =
        clamp(
          normalizedY,
          -1,
          1
        );
    };


  /* =======================================================
     07. POINTER ENTER
     ======================================================= */

  const handlePointerEnter =
    () => {

      if (
        reducedMotion.matches ||
        !finePointer.matches
      ) {
        return;
      }


      state.pointerInside =
        true;


      state.targetScale =
        CONFIG.hoverScale;


      scene.classList.add(
        "is-avatar-hovered"
      );
    };


  /* =======================================================
     08. POINTER LEAVE
     ======================================================= */

  const handlePointerLeave =
    () => {

      state.pointerInside =
        false;


      /*
       * No hacemos un reset instantáneo.
       *
       * El loop vuelve suavemente al centro.
       */

      state.targetX =
        0;

      state.targetY =
        0;

      state.targetScale =
        1;


      scene.classList.remove(
        "is-avatar-hovered"
      );
    };


  /* =======================================================
     09. ANIMACIÓN
     ======================================================= */

  const animate =
    (time) => {

      /*
       * Suavizamos el movimiento del puntero.
       */

      state.currentX =
        lerp(
          state.currentX,
          state.targetX,
          CONFIG.easing
        );


      state.currentY =
        lerp(
          state.currentY,
          state.targetY,
          CONFIG.easing
        );


      state.currentScale =
        lerp(
          state.currentScale,
          state.targetScale,
          CONFIG.easing
        );


      /* ===================================================
         FLOATING CONTINUO
         =================================================== */

      /*
       * Utilizamos una onda senoidal.
       *
       * Por lo tanto:
       *
       * sube
       * baja
       * sube
       * baja
       *
       * sin ningún salto o reinicio visible.
       */

      const floatY =
        reducedMotion.matches
          ? 0
          : Math.sin(
              time *
              CONFIG.floatSpeed
            ) *
            CONFIG.floatAmplitude;


      /* ===================================================
         TILT
         =================================================== */

      const rotateY =
        state.currentX *
        CONFIG.maxTiltY;


      const rotateX =
        state.currentY *
        -CONFIG.maxTiltX;


      /* ===================================================
         PARALLAX DEL AVATAR
         =================================================== */

      const parallaxX =
        state.currentX *
        CONFIG.parallaxX;


      const parallaxY =
        state.currentY *
        CONFIG.parallaxY;


      /*
       * La flotación y el tilt viven en la misma
       * transformación para evitar conflictos entre
       * animations CSS y JavaScript.
       */

      image.style.transform =
        `
          perspective(1100px)
          translate3d(
            ${parallaxX.toFixed(2)}px,
            ${(floatY + parallaxY).toFixed(2)}px,
            0
          )
          rotateX(
            ${rotateX.toFixed(2)}deg
          )
          rotateY(
            ${rotateY.toFixed(2)}deg
          )
          scale(
            ${state.currentScale.toFixed(4)}
          )
        `;


      /* ===================================================
         GLOW
         =================================================== */

      /*
       * El glow se mueve menos que el personaje.
       * Eso genera sensación de profundidad.
       */

      const glowX =
        state.currentX *
        -5;


      const glowY =
        state.currentY *
        -3;


      const glowScale =
        1 +
        (
          state.currentScale -
          1
        ) *
        2.7;


      avatar.style.setProperty(
        "--avatar-glow-x",
        `${glowX.toFixed(2)}px`
      );


      avatar.style.setProperty(
        "--avatar-glow-y",
        `${glowY.toFixed(2)}px`
      );


      avatar.style.setProperty(
        "--avatar-glow-scale",
        glowScale.toFixed(4)
      );


      /* ===================================================
         PARALLAX DE TARJETAS
         =================================================== */

      cards.forEach(
        (
          card,
          index
        ) => {

          const depth =
            CONFIG.cardDepths[
              index %
              CONFIG.cardDepths.length
            ];


          const floatAmount =
            CONFIG.cardFloat[
              index %
              CONFIG.cardFloat.length
            ];


          /*
           * Cada tarjeta tiene una fase distinta.
           */

          const phase =
            index *
            1.85;


          const cardIdleY =
            reducedMotion.matches
              ? 0
              : Math.sin(
                  time *
                    0.00105 +
                  phase
                ) *
                floatAmount;


          const x =
            state.currentX *
            depth;


          const y =
            state.currentY *
              depth *
              0.55 +
            cardIdleY;


          /*
           * Cuando el mouse entra a la escena,
           * aumentamos apenas el tamaño.
           */

          const scale =
            state.pointerInside
              ? 1.025
              : 1;


          card.style.transform =
            `
              translate3d(
                ${x.toFixed(2)}px,
                ${y.toFixed(2)}px,
                0
              )
              scale(${scale})
            `;
        }
      );


      state.animationFrame =
        window.requestAnimationFrame(
          animate
        );
    };


  /* =======================================================
     10. REDUCED MOTION
     ======================================================= */

  const handleMotionChange =
    () => {

      if (
        reducedMotion.matches
      ) {

        state.targetX =
          0;

        state.targetY =
          0;

        state.targetScale =
          1;


        state.currentX =
          0;

        state.currentY =
          0;

        state.currentScale =
          1;


        image.style.transform =
          "none";


        cards.forEach(
          (card) => {

            card.style.transform =
              "none";
          }
        );


        scene.classList.remove(
          "is-avatar-hovered"
        );
      }
    };


  /* =======================================================
     11. VISIBILITY
     ======================================================= */

  const handleVisibility =
    () => {

      state.visible =
        !document.hidden;
    };


  /* =======================================================
     12. EVENTOS
     ======================================================= */

  scene.addEventListener(
    "pointerenter",
    handlePointerEnter
  );


  scene.addEventListener(
    "pointermove",
    handlePointerMove
  );


  scene.addEventListener(
    "pointerleave",
    handlePointerLeave
  );


  document.addEventListener(
    "visibilitychange",
    handleVisibility
  );


  if (
    typeof reducedMotion
      .addEventListener ===
    "function"
  ) {

    reducedMotion.addEventListener(
      "change",
      handleMotionChange
    );

  } else {

    reducedMotion.addListener(
      handleMotionChange
    );
  }


  /* =======================================================
     13. INICIALIZAR
     ======================================================= */

  scene.classList.add(
    "is-avatar-interactive"
  );


  /*
   * Iniciamos el movimiento continuo.
   */

  state.animationFrame =
    window.requestAnimationFrame(
      animate
    );


  /* =======================================================
     14. CLEANUP
     ======================================================= */

  window.addEventListener(
    "pagehide",
    () => {

      if (
        state.animationFrame
      ) {

        window.cancelAnimationFrame(
          state.animationFrame
        );
      }

    },
    {
      once: true
    }
  );

})();