/* =========================================================
   MATÍAS CORTÉS — PORTFOLIO
   Main Application Controller
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01. CONFIGURATION
     ======================================================= */

  const APP = {
    name: "Matías Cortés Portfolio",
    version: "1.0.0"
  };

  /* =======================================================
     02. CURRENT YEAR
     ======================================================= */

  const setCurrentYear = () => {
    const yearElements = document.querySelectorAll(
      "#current-year"
    );

    const currentYear = new Date().getFullYear();

    yearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  };

  /* =======================================================
     03. DETECT CURRENT PAGE
     ======================================================= */

  const detectCurrentPage = () => {
    const path = window.location.pathname.toLowerCase();

    let page = "home";

    if (path.includes("proyectos.html")) {
      page = "projects";
    }

    if (path.includes("sobre-mi.html")) {
      page = "about";
    }

    if (path.includes("/projects/")) {
      page = "project-detail";
    }

    document.body.dataset.page = page;

    return page;
  };

  /* =======================================================
     04. EXTERNAL LINKS
     ======================================================= */

  const configureExternalLinks = () => {
    const links = document.querySelectorAll("a[href]");

    links.forEach((link) => {
      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      let url;

      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      /*
       * Solo modificamos URLs externas.
       */
      if (url.origin !== window.location.origin) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
  };

  /* =======================================================
     05. PAGE READY STATE
     ======================================================= */

  const activatePage = () => {
    /*
     * Permite posteriormente utilizar CSS como:
     *
     * body:not(.is-ready)
     * body.is-ready
     *
     * para transiciones iniciales.
     */

    window.requestAnimationFrame(() => {
      document.body.classList.add("is-ready");
    });
  };

  /* =======================================================
     06. SMOOTH INTERNAL ANCHORS
     ======================================================= */

  const configureInternalAnchors = () => {
    const internalLinks =
      document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetID =
          link.getAttribute("href");

        if (!targetID || targetID === "#") {
          return;
        }

        const target =
          document.querySelector(targetID);

        if (!target) {
          return;
        }

        event.preventDefault();

        const reducedMotion =
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;

        target.scrollIntoView({
          behavior: reducedMotion
            ? "auto"
            : "smooth",
          block: "start"
        });

        /*
         * Actualiza URL sin recargar.
         */
        history.pushState(
          null,
          "",
          targetID
        );
      });
    });
  };

  /* =======================================================
     07. HANDLE INITIAL HASH
     ======================================================= */

  const handleInitialHash = () => {
    const hash = window.location.hash;

    if (!hash) {
      return;
    }

    const target =
      document.querySelector(hash);

    if (!target) {
      return;
    }

    /*
     * Esperamos a que el layout esté construido.
     */

    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "auto",
        block: "start"
      });
    });
  };

  /* =======================================================
     08. IMAGE LOADING STATES
     ======================================================= */

  const configureImages = () => {
    const images =
      document.querySelectorAll("img");

    images.forEach((image) => {
      /*
       * Evita cargar imágenes inferiores inmediatamente
       * salvo que explícitamente tengan otra configuración.
       */

      if (!image.hasAttribute("loading")) {
        image.loading = "lazy";
      }

      image.addEventListener(
        "load",
        () => {
          image.classList.add("is-loaded");
        },
        {
          once: true
        }
      );

      /*
       * Si ya estaba cargada desde caché.
       */
      if (image.complete) {
        image.classList.add("is-loaded");
      }
    });
  };

  /* =======================================================
     09. VISIBILITY STATE
     ======================================================= */

  const configureVisibility = () => {
    document.addEventListener(
      "visibilitychange",
      () => {
        document.body.classList.toggle(
          "is-page-hidden",
          document.hidden
        );
      }
    );
  };

  /* =======================================================
     10. INITIALIZATION
     ======================================================= */

  const init = () => {
    const currentPage =
      detectCurrentPage();

    setCurrentYear();

    configureExternalLinks();

    configureInternalAnchors();

    configureImages();

    configureVisibility();

    activatePage();

    handleInitialHash();

    /*
     * Mensaje solamente para desarrollo.
     */

    console.info(
      `%c${APP.name} %cv${APP.version}`,
      "color:#9B6DFF;font-weight:600;",
      "color:#96969F;",
      `Page: ${currentPage}`
    );
  };

  /* =======================================================
     11. START APPLICATION
     ======================================================= */

  /*
   * Como main.js utiliza defer, normalmente el DOM
   * ya estará disponible. Esta comprobación lo hace
   * robusto si posteriormente cambia la forma de carga.
   */

  if (document.readyState === "loading") {
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
})();