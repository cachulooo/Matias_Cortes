
(() => {
    "use strict";

    const contenedor = document.getElementById("mc-catalog-grid");
    const filtros = document.getElementById("mc-catalog-filters");
    const contador = document.getElementById("mc-catalog-count");

    if (!contenedor || !filtros || !contador) return;

    const texto = (tag, contenido, clase = "") => {
        const elemento = document.createElement(tag);
        elemento.textContent = contenido ?? "";
        if (clase) elemento.className = clase;
        return elemento;
    };

    function tarjeta(proyecto) {
        const card = document.createElement("article");
        card.className = "mc-catalog__card";

        const media = document.createElement("div");
        media.className = "mc-catalog__media";

        if (proyecto.imagen) {
            const imagen = document.createElement("img");

            imagen.src = proyecto.imagen;
            imagen.alt = `Figura del proyecto: ${proyecto.titulo}`;
            imagen.loading = "lazy";

            media.append(imagen);
        } else {
            media.append(
                texto("span", "MC.", "mc-catalog__media-placeholder")
            );
        }

        const contenido = document.createElement("div");
        contenido.className = "mc-catalog__content";

        const meta = document.createElement("div");
        meta.className = "mc-catalog__meta";

        meta.append(
            texto("span", proyecto.categoria),
            texto("span", proyecto.estado || "")
        );

        contenido.append(meta);
        contenido.append(texto("h3", proyecto.titulo));

        if (proyecto.subtitulo) {
            contenido.append(
                texto(
                    "p",
                    proyecto.subtitulo,
                    "mc-catalog__subtitle"
                )
            );
        }

        contenido.append(
            texto(
                "p",
                proyecto.descripcion,
                "mc-catalog__description"
            )
        );

        const etiquetas = document.createElement("ul");
        etiquetas.className = "mc-catalog__tags";

        (proyecto.etiquetas || []).forEach(etiqueta => {
            etiquetas.append(texto("li", etiqueta));
        });

        contenido.append(etiquetas);

        const inferior = document.createElement("div");
        inferior.className = "mc-catalog__bottom";

        inferior.append(
            texto(
                "span",
                proyecto.detalle || "",
                "mc-catalog__details"
            )
        );

        const enlace = document.createElement("a");

        enlace.className = "mc-catalog__link";
        enlace.href = proyecto.enlace;
        enlace.textContent = "Explorar proyecto  ↗";

        inferior.append(enlace);
        contenido.append(inferior);

        card.append(media, contenido);

        return card;
    }

    fetch("../data/catalogo-proyectos.json", {
        cache: "no-cache"
    })
    .then(respuesta => {
        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }

        return respuesta.json();
    })
    .then(proyectos => {
        if (!Array.isArray(proyectos)) {
            throw new Error("El catálogo debe ser una lista JSON.");
        }

        let categoriaActiva = "Todos";

        const categorias = [
            "Todos",
            ...new Set(
                proyectos
                    .map(proyecto => proyecto.categoria)
                    .filter(Boolean)
            )
        ];

        function actualizar() {
            const visibles = categoriaActiva === "Todos"
                ? proyectos
                : proyectos.filter(
                    proyecto => proyecto.categoria === categoriaActiva
                );

            contador.textContent =
                `${visibles.length} ${
                    visibles.length === 1 ? "proyecto" : "proyectos"
                }`;

            contenedor.replaceChildren();

            if (!visibles.length) {
                contenedor.append(
                    texto(
                        "p",
                        "No hay proyectos en esta categoría.",
                        "mc-catalog__status"
                    )
                );
                return;
            }

            visibles.forEach(proyecto => {
                contenedor.append(tarjeta(proyecto));
            });
        }

        categorias.forEach(categoria => {
            const boton = texto(
                "button",
                categoria,
                "mc-catalog__filter"
            );

            boton.type = "button";

            boton.setAttribute(
                "aria-pressed",
                categoria === categoriaActiva ? "true" : "false"
            );

            boton.addEventListener("click", () => {
                categoriaActiva = categoria;

                filtros.querySelectorAll("button").forEach(b => {
                    b.setAttribute(
                        "aria-pressed",
                        b === boton ? "true" : "false"
                    );
                });

                actualizar();
            });

            filtros.append(boton);
        });

        actualizar();
    })
    .catch(error => {
        console.error("[Catálogo]", error);

        contador.textContent = "No disponible";

        contenedor.replaceChildren(
            texto(
                "p",
                "No se pudo cargar el catálogo. Comprueba el servidor local y el archivo JSON.",
                "mc-catalog__status"
            )
        );
    });
})();
