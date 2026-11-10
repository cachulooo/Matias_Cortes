(() => {
  "use strict";

  const RUTA = "../data/incendios/";
  const MESES = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic"
  ];

  const formato = new Intl.NumberFormat("es-CL");

  const estado = {
    escala: "mensual",
    region: "todas",
    contexto: "TODOS"
  };

  const $ = (selector, raiz = document) =>
    raiz.querySelector(selector);

  function etiquetaPeriodo(periodo, escala) {
    if (escala === "anual") return String(periodo);

    const [anio, mes] = periodo.split("-");
    return `${MESES[Number(mes) - 1]} ${anio}`;
  }

  function opcion(valor, etiqueta) {
    return new Option(etiqueta, String(valor));
  }

  // ========================================================
  // CONSTRUIR INTERFAZ
  // ========================================================

  function construirPanel() {
    const destino = document.getElementById("visualizaciones");

    if (!destino || document.getElementById("explorador-igniciones")) {
      return null;
    }

    const panel = document.createElement("section");

    panel.className = "section thesis-dashboard";
    panel.id = "explorador-igniciones";

    panel.setAttribute(
      "aria-labelledby",
      "dashboard-heading"
    );

    panel.innerHTML = `
      <div class="container">

        <header class="section-header">
          <p class="eyebrow">
            Explorador espacio-temporal
          </p>

          <h2 id="dashboard-heading">
            Igniciones forestales, mes a mes.
          </h2>

          <p class="thesis-section-description">
            Explora 109.884 registros administrativos
            normalizados mediante filtros territoriales
            y temporales.
          </p>
        </header>

        <div class="thesis-db__panel">

          <div class="thesis-db__controls">

            <label>
              Escala temporal
              <select id="td-escala">
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
              </select>
            </label>

            <label>
              Región
              <select id="td-region">
                <option value="todas">
                  Todas las regiones
                </option>
              </select>
            </label>

            <label>
              Contexto
              <select id="td-contexto">
                <option value="TODOS">
                  Rural y urbano
                </option>
                <option value="RURAL">Rural</option>
                <option value="URBANO">Urbano</option>
              </select>
            </label>

            <label>
              Desde
              <select id="td-desde"></select>
            </label>

            <label>
              Hasta
              <select id="td-hasta"></select>
            </label>

          </div>

          <p
            id="td-mensaje"
            class="thesis-db__message"
            role="status"
            aria-live="polite"
          >
            Cargando datos verificados...
          </p>

          <div class="thesis-db__kpis">

            <article>
              <span>Total de igniciones</span>
              <strong id="td-total">—</strong>
            </article>

            <article>
              <span>Promedio por período</span>
              <strong id="td-promedio">—</strong>
            </article>

            <article>
              <span>Período de mayor actividad</span>
              <strong id="td-maximo">—</strong>
            </article>

          </div>

          <div class="thesis-db__chart-panel">

            <div class="thesis-db__chart-header">

              <div>
                <h3>Evolución de las igniciones</h3>
                <p id="td-subtitulo">
                  Serie temporal observada
                </p>
              </div>

              <span
                class="thesis-db__periodos"
                id="td-periodos"
              ></span>

            </div>

            <div class="thesis-db__chart-scroll">

              <svg
                id="td-grafico"
                viewBox="0 0 960 310"
                role="img"
                aria-label="Evolución temporal de igniciones"
              ></svg>

            </div>

          </div>

          <details class="thesis-db__details">

            <summary>
              Consultar conteos por período
            </summary>

            <div class="thesis-db__table-scroll">

              <table>
                <thead>
                  <tr>
                    <th scope="col">Período</th>
                    <th scope="col">Igniciones</th>
                  </tr>
                </thead>
                <tbody id="td-tabla"></tbody>
              </table>

            </div>

          </details>

          <p class="thesis-db__source">
            Fuente: base administrativa normalizada
            de la tesis. Los valores representan
            igniciones observadas, no predicciones
            LGCP ni tasas de riesgo.
            La comparación anual principal excluye
            2002 porque su cobertura comienza en julio.
          </p>

        </div>

      </div>
    `;

    destino.before(panel);

    return panel;
  }

  // ========================================================
  // GRÁFICO SVG
  // ========================================================

  function dibujarGrafico(svg, serie, escala) {
    const anchoTotal = 960;
    const altoTotal = 310;

    const margenIzquierdo = 62;
    const margenDerecho = 18;
    const margenSuperior = 20;
    const margenInferior = 42;

    const ancho =
      anchoTotal - margenIzquierdo - margenDerecho;

    const alto =
      altoTotal - margenSuperior - margenInferior;

    const maximo = Math.max(
      1,
      ...serie.map(item => item.valor)
    );

    const techo = Math.max(
      4,
      Math.ceil(maximo / 4) * 4
    );

    const posicionY = valor =>
      margenSuperior + alto - (valor / techo) * alto;

    const posicionX = indice =>
      margenIzquierdo +
      (serie.length === 1
        ? ancho / 2
        : indice / (serie.length - 1) * ancho);

    const rejilla = Array.from(
      { length: 5 },
      (_, indice) => {
        const valor = Math.round(
          techo * (4 - indice) / 4
        );

        const y =
          margenSuperior + (alto * indice / 4);

        return `
          <line
            x1="${margenIzquierdo}"
            y1="${y}"
            x2="${anchoTotal - margenDerecho}"
            y2="${y}"
            stroke="currentColor"
            opacity=".13"
          />

          <text
            x="${margenIzquierdo - 12}"
            y="${y + 4}"
            text-anchor="end"
            fill="currentColor"
            opacity=".75"
            font-size="12"
          >
            ${formato.format(valor)}
          </text>
        `;
      }
    ).join("");

    let figura = "";

    if (escala === "anual") {
      const paso = ancho / Math.max(serie.length, 1);
      const barra = Math.max(
        3,
        Math.min(33, paso * .7)
      );

      figura = serie.map((item, indice) => {
        const x =
          margenIzquierdo +
          paso * (indice + .5) -
          barra / 2;

        const y = posicionY(item.valor);

        return `
          <rect
            x="${x}"
            y="${y}"
            width="${barra}"
            height="${Math.max(
              0,
              margenSuperior + alto - y
            )}"
            rx="3"
            fill="#9b6dff"
          >
            <title>
              ${item.periodo}:
              ${formato.format(item.valor)} igniciones
            </title>
          </rect>
        `;
      }).join("");

    } else {
      const puntos = serie.map(
        (item, indice) =>
          `${posicionX(indice)},${posicionY(item.valor)}`
      ).join(" ");

      figura = `
        <polyline
          points="${puntos}"
          fill="none"
          stroke="#9b6dff"
          stroke-width="2.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      `;

      if (serie.length <= 30) {
        figura += serie.map((item, indice) => `
          <circle
            cx="${posicionX(indice)}"
            cy="${posicionY(item.valor)}"
            r="3.5"
            fill="#b499ff"
          >
            <title>
              ${etiquetaPeriodo(item.periodo, escala)}:
              ${formato.format(item.valor)} igniciones
            </title>
          </circle>
        `).join("");
      }
    }

    const posiciones = [
      0,
      Math.floor((serie.length - 1) / 2),
      serie.length - 1
    ];

    const etiquetas = [...new Set(posiciones)]
      .map(indice => {
        const x = escala === "anual"
          ? margenIzquierdo +
            ancho / serie.length * (indice + .5)
          : posicionX(indice);

        return `
          <text
            x="${x}"
            y="${altoTotal - 12}"
            text-anchor="middle"
            fill="currentColor"
            opacity=".75"
            font-size="13"
          >
            ${etiquetaPeriodo(
              serie[indice].periodo,
              escala
            )}
          </text>
        `;
      }).join("");

    svg.innerHTML = `
      <title>Igniciones observadas por período</title>
      <desc>
        Los valores también están disponibles
        en la tabla de datos.
      </desc>
      ${rejilla}
      ${figura}
      ${etiquetas}
    `;
  }

  // ========================================================
  // CARGAR LOS JSON REALES
  // ========================================================

  async function iniciar() {
    const panel = construirPanel();

    if (!panel) return;

    const mensaje = $("#td-mensaje", panel);

    try {
      const nombres = [
        "serie_mensual.json",
        "serie_anual.json",
        "metadatos.json"
      ];

      const respuestas = await Promise.all(
        nombres.map(nombre =>
          fetch(RUTA + nombre, {
            cache: "no-cache"
          })
        )
      );

      respuestas.forEach((respuesta, indice) => {
        if (!respuesta.ok) {
          throw new Error(
            `No se pudo cargar ${nombres[indice]}`
          );
        }
      });

      const [mensual, anual, metadatos] =
        await Promise.all(
          respuestas.map(respuesta => respuesta.json())
        );

      if (
        !Array.isArray(mensual) ||
        !Array.isArray(anual) ||
        !Array.isArray(metadatos.regiones)
      ) {
        throw new Error("Formato JSON no válido");
      }

      const sumar = filas =>
        filas.reduce(
          (total, fila) =>
            total + Number(fila.igniciones),
          0
        );

      if (
        sumar(mensual) !== metadatos.total_igniciones ||
        sumar(anual) !== metadatos.total_igniciones
      ) {
        throw new Error(
          "Inconsistencia en los totales"
        );
      }

      // ====================================================
      // CONTROLES
      // ====================================================

      const escala = $("#td-escala", panel);
      const region = $("#td-region", panel);
      const contexto = $("#td-contexto", panel);
      const desde = $("#td-desde", panel);
      const hasta = $("#td-hasta", panel);

      metadatos.regiones.forEach(nombre => {
        region.add(opcion(nombre, nombre));
      });

      const periodos = {
        mensual: [
          ...new Set(
            mensual.map(fila => fila.periodo)
          )
        ].sort(),

        anual: [
          ...new Set(
            anual.map(fila => Number(fila.anio))
          )
        ]
          .filter(anio => anio >= 2003)
          .sort((a, b) => a - b)
      };

      function configurarPeriodos() {
        const disponibles = periodos[estado.escala];

        desde.replaceChildren(
          ...disponibles.map(periodo =>
            opcion(
              periodo,
              etiquetaPeriodo(
                periodo,
                estado.escala
              )
            )
          )
        );

        hasta.replaceChildren(
          ...disponibles.map(periodo =>
            opcion(
              periodo,
              etiquetaPeriodo(
                periodo,
                estado.escala
              )
            )
          )
        );

        desde.value = String(disponibles[0]);
        hasta.value = String(
          disponibles[disponibles.length - 1]
        );
      }

      // ====================================================
      // FILTRAR Y AGREGAR
      // ====================================================

      function actualizar() {
        if (desde.value > hasta.value) {
          hasta.value = desde.value;
        }

        const filas = estado.escala === "mensual"
          ? mensual
          : anual;

        const rango = periodos[estado.escala]
          .filter(periodo =>
            String(periodo) >= desde.value &&
            String(periodo) <= hasta.value
          );

        const acumulados = new Map(
          rango.map(periodo => [
            String(periodo),
            0
          ])
        );

        for (const fila of filas) {
          if (
            estado.region !== "todas" &&
            fila.region !== estado.region
          ) {
            continue;
          }

          if (
            estado.contexto !== "TODOS" &&
            fila.contexto !== estado.contexto
          ) {
            continue;
          }

          const periodo = String(
            estado.escala === "mensual"
              ? fila.periodo
              : fila.anio
          );

          if (acumulados.has(periodo)) {
            acumulados.set(
              periodo,
              acumulados.get(periodo) +
                fila.igniciones
            );
          }
        }

        const serie = Array.from(
          acumulados,
          ([periodo, valor]) => ({
            periodo,
            valor
          })
        );

        const total = serie.reduce(
          (suma, item) => suma + item.valor,
          0
        );

        const mayor = serie.reduce(
          (actual, item) =>
            !actual || item.valor > actual.valor
              ? item
              : actual,
          null
        );

        // ==================================================
        // INDICADORES
        // ==================================================

        $("#td-total", panel).textContent =
          formato.format(total);

        $("#td-promedio", panel).textContent =
          formato.format(
            Math.round(
              total / Math.max(serie.length, 1)
            )
          );

        $("#td-maximo", panel).textContent =
          mayor
            ? `${etiquetaPeriodo(
                mayor.periodo,
                estado.escala
              )} · ${formato.format(mayor.valor)}`
            : "—";

        $("#td-periodos", panel).textContent =
          `${serie.length} ${
            estado.escala === "mensual"
              ? "meses"
              : "años"
          }`;

        $("#td-subtitulo", panel).textContent =
          `${
            estado.region === "todas"
              ? "Seis regiones"
              : estado.region
          } · ${
            estado.contexto === "TODOS"
              ? "rural y urbano"
              : estado.contexto.toLowerCase()
          }`;

        mensaje.textContent = total === 0
          ? "No hay igniciones para los filtros seleccionados."
          : "Datos reales filtrados correctamente.";

        mensaje.classList.remove("is-error");

        // ==================================================
        // GRÁFICO
        // ==================================================

        dibujarGrafico(
          $("#td-grafico", panel),
          serie,
          estado.escala
        );

        // ==================================================
        // TABLA
        // ==================================================

        const cuerpo = $("#td-tabla", panel);

        cuerpo.replaceChildren(
          ...serie.map(item => {
            const fila = document.createElement("tr");

            const periodo = document.createElement("th");
            periodo.scope = "row";
            periodo.textContent = etiquetaPeriodo(
              item.periodo,
              estado.escala
            );

            const conteo = document.createElement("td");
            conteo.textContent = formato.format(item.valor);

            fila.append(periodo, conteo);

            return fila;
          })
        );
      }

      // ====================================================
      // EVENTOS
      // ====================================================

      escala.addEventListener("change", () => {
        estado.escala = escala.value;
        configurarPeriodos();
        actualizar();
      });

      region.addEventListener("change", () => {
        estado.region = region.value;
        actualizar();
      });

      contexto.addEventListener("change", () => {
        estado.contexto = contexto.value;
        actualizar();
      });

      desde.addEventListener("change", actualizar);

      hasta.addEventListener("change", () => {
        if (hasta.value < desde.value) {
          desde.value = hasta.value;
        }

        actualizar();
      });

      configurarPeriodos();
      actualizar();

    } catch (error) {
      console.error("[Dashboard LGCP]", error);

      mensaje.textContent =
        `No fue posible cargar los datos: ${error.message}`;

      mensaje.classList.add("is-error");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      iniciar,
      { once: true }
    );
  } else {
    iniciar();
  }

})();
