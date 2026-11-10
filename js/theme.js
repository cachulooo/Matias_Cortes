/* =========================================================
   MATÍAS CORTÉS — PORTFOLIO
   Theme Controller

   Controls:
   - Dark / Light theme
   - System preference
   - localStorage persistence
   - Theme toggle button
   - Browser theme-color
   - Cross-tab synchronization
   - Global themechange event
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01. CONFIGURATION
     ======================================================= */

  const CONFIG = {
    storageKey: "matias-cortes-theme",

    themes: {
      dark: {
        name: "dark",
        browserColor: "#050507"
      },

      light: {
        name: "light",
        browserColor: "#f7f7fb"
      }
    }
  };

  /* =======================================================
     02. DOM
     ======================================================= */

  const root = document.documentElement;

  const systemThemeQuery = window.matchMedia(
    "(prefers-color-scheme: light)"
  );

  /* =======================================================
     03. HELPERS
     ======================================================= */

  const isValidTheme = (theme) => {
    return (
      theme === "dark" ||
      theme === "light"
    );
  };

  const getStoredTheme = () => {
    try {
      const storedTheme = localStorage.getItem(
        CONFIG.storageKey
      );

      return isValidTheme(storedTheme)
        ? storedTheme
        : null;
    } catch {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(
        CONFIG.storageKey,
        theme
      );
    } catch {
      /*
       * El navegador podría bloquear localStorage.
       * El tema sigue funcionando durante la sesión.
       */
    }
  };

  const getSystemTheme = () => {
    return systemThemeQuery.matches
      ? "light"
      : "dark";
  };

  const getInitialTheme = () => {
    return (
      getStoredTheme() ||
      getSystemTheme()
    );
  };

  /* =======================================================
     04. META THEME COLOR
     ======================================================= */

  const updateBrowserThemeColor = (
    theme
  ) => {
    const metaThemeColor =
      document.querySelector(
        'meta[name="theme-color"]'
      );

    if (!metaThemeColor) {
      return;
    }

    metaThemeColor.setAttribute(
      "content",
      CONFIG.themes[theme]
        .browserColor
    );
  };

  /* =======================================================
     05. THEME TOGGLE UI
     ======================================================= */

  const updateToggleButton = (
    theme
  ) => {
    const button =
      document.querySelector(
        "#theme-toggle"
      );

    if (!button) {
      return;
    }

    const isLight =
      theme === "light";

    /*
     * aria-pressed indica si actualmente
     * está activo el modo claro.
     */
    button.setAttribute(
      "aria-pressed",
      String(isLight)
    );

    button.setAttribute(
      "aria-label",
      isLight
        ? "Cambiar a tema oscuro"
        : "Cambiar a tema claro"
    );

    button.setAttribute(
      "title",
      isLight
        ? "Cambiar a tema oscuro"
        : "Cambiar a tema claro"
    );

    /*
     * Permite estilizar el botón según
     * el tema actualmente activo.
     */
    button.dataset.theme = theme;
  };

  /* =======================================================
     06. GLOBAL THEME EVENT
     ======================================================= */

  const dispatchThemeChange = (
    theme
  ) => {
    window.dispatchEvent(
      new CustomEvent(
        "themechange",
        {
          detail: {
            theme,
            isLight:
              theme === "light",
            isDark:
              theme === "dark"
          }
        }
      )
    );
  };

  /* =======================================================
     07. APPLY THEME
     ======================================================= */

  const applyTheme = (
    theme,
    options = {}
  ) => {
    const {
      persist = false,
      notify = true
    } = options;

    if (!isValidTheme(theme)) {
      return;
    }

    /*
     * Esta es la pieza central.

     * CSS, brain.js y otros componentes
     * reaccionan a este atributo.
     */
    root.dataset.theme = theme;

    /*
     * Ayuda a los componentes nativos del navegador:
     * formularios, scrollbars compatibles, etc.
     */
    root.style.colorScheme = theme;

    updateBrowserThemeColor(theme);

    updateToggleButton(theme);

    if (persist) {
      saveTheme(theme);
    }

    if (notify) {
      dispatchThemeChange(theme);
    }
  };

  /* =======================================================
     08. TOGGLE THEME
     ======================================================= */

  const toggleTheme = () => {
    const currentTheme =
      root.dataset.theme;

    const nextTheme =
      currentTheme === "light"
        ? "dark"
        : "light";

    applyTheme(
      nextTheme,
      {
        persist: true
      }
    );
  };

  /* =======================================================
     09. BUTTON BINDING
     ======================================================= */

  const bindThemeToggle = () => {
    const button =
      document.querySelector(
        "#theme-toggle"
      );

    if (!button) {
      return;
    }

    /*
     * Sincronizamos su estado inicial.
     */
    updateToggleButton(
      root.dataset.theme
    );

    button.addEventListener(
      "click",
      toggleTheme
    );
  };

  /* =======================================================
     10. SYSTEM THEME CHANGES
     ======================================================= */

  const handleSystemThemeChange = (
    event
  ) => {
    /*
     * Si el usuario escogió manualmente
     * un tema, respetamos su decisión.
     */
    if (getStoredTheme()) {
      return;
    }

    const theme =
      event.matches
        ? "light"
        : "dark";

    applyTheme(theme);
  };

  /*
   * Compatibilidad con navegadores modernos
   * y fallback para versiones antiguas.
   */
  if (
    typeof systemThemeQuery.addEventListener ===
    "function"
  ) {
    systemThemeQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );
  } else if (
    typeof systemThemeQuery.addListener ===
    "function"
  ) {
    systemThemeQuery.addListener(
      handleSystemThemeChange
    );
  }

  /* =======================================================
     11. CROSS-TAB SYNCHRONIZATION
     ======================================================= */

  window.addEventListener(
    "storage",
    (event) => {
      if (
        event.key !==
        CONFIG.storageKey
      ) {
        return;
      }

      /*
       * Si el usuario cambió el tema en otra pestaña,
       * actualizamos esta automáticamente.
       */

      if (isValidTheme(event.newValue)) {
        applyTheme(
          event.newValue,
          {
            persist: false
          }
        );

        return;
      }

      /*
       * Si la preferencia fue eliminada,
       * volvemos al tema del sistema.
       */
      if (event.newValue === null) {
        applyTheme(
          getSystemTheme()
        );
      }
    }
  );

  /* =======================================================
     12. INITIAL THEME
     ======================================================= */

  /*
   * Se ejecuta inmediatamente.

   * Por eso theme.js debe cargarse en <head>
   * ANTES de los archivos CSS.
   *
   * Así evitamos:
   *
   * dark → flash → light
   */

  applyTheme(
    getInitialTheme(),
    {
      persist: false,
      notify: false
    }
  );

  /* =======================================================
     13. DOM INITIALIZATION
     ======================================================= */

  const init = () => {
    bindThemeToggle();

    /*
     * Actualizamos nuevamente porque ahora el <meta>,
     * el botón y todo el DOM ya existen con seguridad.
     */
    applyTheme(
      root.dataset.theme,
      {
        persist: false
      }
    );
  };

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
})();