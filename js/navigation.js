/* =========================================================
   MATÍAS CORTÉS — PORTFOLIO
   Navigation Controller
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01. CONFIGURATION
     ======================================================= */

  const MOBILE_BREAKPOINT = 900;
  const SCROLL_THRESHOLD = 24;

  /* =======================================================
     02. DOM ELEMENTS
     ======================================================= */

  const header = document.querySelector("#site-header");
  const navbar = document.querySelector(".navbar");
  const menuButton = document.querySelector("#menu-button");
  const navLinksContainer = document.querySelector(".navbar__links");
  const navLinks = document.querySelectorAll(".navbar__links a");

  /*
   * Si una página futura no utiliza navbar,
   * detenemos el script sin provocar errores.
   */
  if (!header || !navbar || !menuButton || !navLinksContainer) {
    return;
  }

  /* =======================================================
     03. STATE
     ======================================================= */

  let isMenuOpen = false;
  let isTicking = false;

  /* =======================================================
     04. HELPERS
     ======================================================= */

  /**
   * Comprueba si actualmente estamos usando
   * la versión móvil/tablet de navegación.
   */
  const isMobileNavigation = () =>
    window.innerWidth <= MOBILE_BREAKPOINT;

  /**
   * Normaliza una ruta para poder comparar:
   *
   * /Matias_Cortes/
   * /Matias_Cortes/index.html
   *
   * como la misma página.
   */
  const normalizePath = (path) => {
    let normalized = path.replace(/index\.html$/i, "");

    if (normalized.length > 1) {
      normalized = normalized.replace(/\/$/, "");
    }

    return normalized;
  };

  /* =======================================================
     05. OPEN MENU
     ======================================================= */

  const openMenu = () => {
    if (!isMobileNavigation()) {
      return;
    }

    isMenuOpen = true;

    navbar.classList.add("is-open");

    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Cerrar menú");

    /*
     * Evita que la página detrás del menú se desplace.
     */
    document.body.style.overflow = "hidden";
  };

  /* =======================================================
     06. CLOSE MENU
     ======================================================= */

  const closeMenu = () => {
    isMenuOpen = false;

    navbar.classList.remove("is-open");

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");

    document.body.style.overflow = "";
  };

  /* =======================================================
     07. TOGGLE MENU
     ======================================================= */

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  /* =======================================================
     08. HEADER SCROLL STATE
     ======================================================= */

  const updateHeaderState = () => {
    const hasScrolled = window.scrollY > SCROLL_THRESHOLD;

    header.classList.toggle("is-scrolled", hasScrolled);

    isTicking = false;
  };

  /**
   * requestAnimationFrame evita ejecutar cambios
   * visuales innecesariamente en cada evento scroll.
   */
  const handleScroll = () => {
    if (isTicking) {
      return;
    }

    isTicking = true;

    window.requestAnimationFrame(updateHeaderState);
  };

  /* =======================================================
     09. ACTIVE PAGE
     ======================================================= */

  const updateActivePage = () => {
    const currentPath = normalizePath(window.location.pathname);

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");

      /*
       * Ignoramos anchors vacíos o enlaces externos.
       */
      if (!href || href.startsWith("#")) {
        return;
      }

      let linkURL;

      try {
        linkURL = new URL(href, window.location.href);
      } catch {
        return;
      }

      /*
       * Solo procesamos enlaces del mismo dominio.
       */
      if (linkURL.origin !== window.location.origin) {
        return;
      }

      const linkPath = normalizePath(linkURL.pathname);

      if (linkPath === currentPath) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  /* =======================================================
     10. CLICK OUTSIDE MENU
     ======================================================= */

  const handleDocumentClick = (event) => {
    if (!isMenuOpen) {
      return;
    }

    const clickedInsideNavbar = navbar.contains(event.target);

    if (!clickedInsideNavbar) {
      closeMenu();
    }
  };

  /* =======================================================
     11. KEYBOARD ACCESSIBILITY
     ======================================================= */

  const handleKeydown = (event) => {
    if (event.key === "Escape" && isMenuOpen) {
      closeMenu();

      /*
       * Devuelve el foco al botón que abrió el menú.
       */
      menuButton.focus();
    }
  };

  /* =======================================================
     12. RESIZE
     ======================================================= */

  const handleResize = () => {
    /*
     * Si el usuario abre el menú móvil y después
     * agranda la ventana, limpiamos ese estado.
     */
    if (!isMobileNavigation() && isMenuOpen) {
      closeMenu();
    }
  };

  /* =======================================================
     13. NAVIGATION LINK EVENTS
     ======================================================= */

  const registerNavLinks = () => {
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        /*
         * En móvil cerramos el menú cuando el usuario
         * selecciona una página.
         */
        if (isMobileNavigation()) {
          closeMenu();
        }
      });
    });
  };

  /* =======================================================
     14. EVENT LISTENERS
     ======================================================= */

  menuButton.addEventListener("click", toggleMenu);

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  window.addEventListener("resize", handleResize);

  document.addEventListener("click", handleDocumentClick);

  document.addEventListener("keydown", handleKeydown);

  registerNavLinks();

  /* =======================================================
     15. INITIALIZATION
     ======================================================= */

  updateHeaderState();
  updateActivePage();
})();