
/* =========================================================
   CURRÍCULUM DIGITAL — JESÚS ORELLANA GIL
   Funciones: navegación, galería, accesibilidad e impresión
========================================================= */

"use strict";


/* =========================================================
   1. INICIALIZACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initCategoryNavigation();
    initPhotoGallery();
    initPrintSupport();
});


/* =========================================================
   2. NAVEGACIÓN ENTRE CATEGORÍAS
========================================================= */

function initCategoryNavigation() {
    const categoryButtons = [
        ...document.querySelectorAll(".category-button")
    ];

    const categoryContent = document.querySelector("#category-content");

    if (categoryButtons.length === 0) {
        console.warn(
            "Currículum: no se han encontrado botones de categorías."
        );
        return;
    }

    if (!categoryContent) {
        console.warn(
            "Currículum: no se ha encontrado #category-content."
        );
        return;
    }

    const categoryViews = [
        ...categoryContent.querySelectorAll(".category-view")
    ];

    if (categoryViews.length === 0) {
        console.warn(
            "Currículum: no se han encontrado paneles de contenido."
        );
        return;
    }

    /*
     * Busca el panel correspondiente a una categoría.
     *
     * Ejemplo:
     * data-category="formacion"
     * id="view-formacion"
     */

    function getCategoryView(category) {
        return categoryViews.find(
            view => view.id === `view-${category}`
        );
    }

    /*
     * Actualiza el número o indicador de categoría,
     * si el HTML contiene el elemento correspondiente.
     */

    function updateCategoryIndex(index) {
        const indexElement = document.querySelector(".content-index");

        if (!indexElement) {
            return;
        }

        indexElement.textContent =
            `${String(index + 1).padStart(2, "0")} / ` +
            `${String(categoryButtons.length).padStart(2, "0")}`;
    }

    /*
     * Activa una categoría y oculta las demás.
     */

    function activateCategory(button, options = {}) {
        const { moveFocus = false } = options;
        const category = button.dataset.category;
        const targetView = getCategoryView(category);

        if (!category || !targetView) {
            console.warn(
                `Currículum: no existe un panel para "${category}".`
            );
            return;
        }

        categoryButtons.forEach(item => {
            const isActive = item === button;

            item.classList.toggle("is-active", isActive);
            item.setAttribute(
                "aria-selected",
                String(isActive)
            );

            item.setAttribute(
                "aria-pressed",
                String(isActive)
            );

            item.tabIndex = isActive ? 0 : -1;
        });

        categoryViews.forEach(view => {
            const isActive = view === targetView;

            view.hidden = !isActive;
            view.classList.toggle("is-active", isActive);

            view.setAttribute(
                "aria-hidden",
                String(!isActive)
            );
        });

        updateCategoryIndex(
            categoryButtons.indexOf(button)
        );

        if (moveFocus) {
            button.focus();
        }
    }

    /*
     * Clic o activación de cada categoría.
     */

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            activateCategory(button);
        });

        /*
         * Permite navegar por las categorías con
         * las flechas del teclado.
         */

        button.addEventListener("keydown", event => {
            const currentIndex = categoryButtons.indexOf(button);
            let nextIndex = currentIndex;

            switch (event.key) {
                case "ArrowDown":
                case "ArrowRight":
                    nextIndex =
                        (currentIndex + 1) % categoryButtons.length;
                    break;

                case "ArrowUp":
                case "ArrowLeft":
                    nextIndex =
                        (currentIndex - 1 + categoryButtons.length) %
                        categoryButtons.length;
                    break;

                case "Home":
                    nextIndex = 0;
                    break;

                case "End":
                    nextIndex = categoryButtons.length - 1;
                    break;

                default:
                    return;
            }

            event.preventDefault();

            activateCategory(categoryButtons[nextIndex], {
                moveFocus: true
            });
        });
    });

    /*
     * Los enlaces o botones con data-open-category
     * permiten abrir una sección concreta desde una tarjeta.
     */

    document.querySelectorAll("[data-open-category]").forEach(link => {
        link.addEventListener("click", event => {
            const category = link.dataset.openCategory;

            const button = categoryButtons.find(
                item => item.dataset.category === category
            );

            if (!button) {
                return;
            }

            event.preventDefault();
            activateCategory(button);

            /*
             * En pantallas pequeñas, el menú está encima
             * del contenido: acercamos la sección a la vista.
             */

            if (window.matchMedia("(max-width: 600px)").matches) {
                categoryContent.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    /*
     * Si el HTML ya tiene una categoría activa,
     * la respetamos. Si no, activamos la primera.
     */

    const initialButton =
        categoryButtons.find(button =>
            button.classList.contains("is-active")
        ) || categoryButtons[0];

    activateCategory(initialButton);
}


/* =========================================================
   3. GALERÍA FOTOGRÁFICA
========================================================= */

function initPhotoGallery() {
    const gallery = document.querySelector("#photo-gallery");

    const openGalleryButtons = [
        document.querySelector("#open-gallery"),
        document.querySelector("#open-gallery-secondary")
    ].filter(Boolean);

    const closeGalleryButton =
        document.querySelector("#close-gallery");

    const previousButton =
        document.querySelector("#gallery-previous");

    const nextButton =
        document.querySelector("#gallery-next");

    const currentImage =
        document.querySelector("#gallery-current-image");

    const caption =
        document.querySelector("#gallery-caption");

    const thumbnailContainer =
        document.querySelector(".gallery-thumbnails");

    const thumbnails = thumbnailContainer
        ? [...thumbnailContainer.querySelectorAll(".gallery-thumbnail")]
        : [];

    if (!gallery || !currentImage) {
        console.warn(
            "Currículum: falta el diálogo #photo-gallery " +
            "o la imagen #gallery-current-image."
        );
        return;
    }

    /*
     * Cada fotografía se identifica mediante data-image.
     *
     * Ejemplo:
     * <button class="gallery-thumbnail"
     *         data-image="images/foto1.jpg"
     *         data-alt="Fotografía profesional"
     *         data-caption="Experiencia profesional">
     *
     * Las rutas son relativas a index.html.
     */

    const photos = thumbnails
        .map(thumbnail => {
            const image = thumbnail.querySelector("img");

            return {
                button: thumbnail,
                src:
                    thumbnail.dataset.image ||
                    image?.getAttribute("src") ||
                    "",
                alt:
                    thumbnail.dataset.alt ||
                    image?.getAttribute("alt") ||
                    "Fotografía de Jesús Orellana Gil",
                caption:
                    thumbnail.dataset.caption ||
                    image?.getAttribute("alt") ||
                    "Galería personal"
            };
        })
        .filter(photo => photo.src.trim() !== "");

    /*
     * Si no hay miniaturas definidas en el HTML,
     * utiliza las rutas predeterminadas del proyecto.
     */

    if (photos.length === 0) {
        photos.push(
            {
                button: null,
                src: "images/fotoprincipal.jpg",
                alt: "Fotografía principal de Jesús Orellana Gil",
                caption: "Fotografía principal"
            },
            {
                button: null,
                src: "images/foto1.jpg",
                alt: "Fotografía de Jesús Orellana Gil",
                caption: "Fotografía 2"
            },
            {
                button: null,
                src: "images/foto2.jpg",
                alt: "Fotografía de Jesús Orellana Gil",
                caption: "Fotografía 3"
            }
        );
    }

    let currentIndex = 0;
    let previousFocus = null;

    /*
     * Muestra una fotografía y actualiza la selección.
     */

    function showPhoto(index) {
        if (photos.length === 0) {
            return;
        }

        currentIndex =
            (index + photos.length) % photos.length;

        const photo = photos[currentIndex];

        currentImage.src = photo.src;
        currentImage.alt = photo.alt;

        if (caption) {
            caption.textContent = photo.caption;
        }

        thumbnails.forEach((thumbnail, thumbnailIndex) => {
            const selected = thumbnailIndex === currentIndex;

            thumbnail.classList.toggle("is-selected", selected);

            if (selected) {
                thumbnail.setAttribute("aria-current", "true");
            } else {
                thumbnail.removeAttribute("aria-current");
            }
        });

        /*
         * Oculta las flechas si solo existe una foto.
         */

        if (previousButton) {
            previousButton.disabled = photos.length < 2;
        }

        if (nextButton) {
            nextButton.disabled = photos.length < 2;
        }

        /*
         * Actualiza el contador si existe en el HTML.
         */

        const counter = document.querySelector("#gallery-counter");

        if (counter) {
            counter.textContent =
                `${currentIndex + 1} de ${photos.length}`;
        }
    }

    /*
     * Abre la galería.
     */

    function openGallery(startIndex = 0) {
        previousFocus = document.activeElement;

        showPhoto(startIndex);

        if (typeof gallery.showModal === "function") {
            if (!gallery.open) {
                gallery.showModal();
            }

            if (closeGalleryButton) {
                closeGalleryButton.focus();
            }
        } else {
            /*
             * Alternativa para navegadores antiguos sin dialog.
             */

            gallery.setAttribute("open", "");
            gallery.setAttribute("role", "dialog");
            gallery.setAttribute("aria-modal", "true");

            document.body.style.overflow = "hidden";
        }
    }

    /*
     * Cierra la galería y devuelve el foco al botón anterior.
     */

    function closeGallery() {
        if (typeof gallery.close === "function" && gallery.open) {
            gallery.close();
        } else {
            gallery.removeAttribute("open");
            document.body.style.overflow = "";
        }

        if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }
    }

    /*
     * Botones que abren la galería.
     */

    openGalleryButtons.forEach(button => {
        button.addEventListener("click", () => {
            openGallery(0);
        });
    });

    /*
     * También permite abrirla pulsando directamente
     * sobre la fotografía principal.
     */

    const mainPhotoButton = document.querySelector(".photo-button");

    if (
        mainPhotoButton &&
        !openGalleryButtons.includes(mainPhotoButton)
    ) {
        mainPhotoButton.addEventListener("click", () => {
            openGallery(0);
        });
    }

    /*
     * Cierre mediante el botón de la ventana.
     */

    if (closeGalleryButton) {
        closeGalleryButton.addEventListener("click", closeGallery);
    }

    /*
     * Navegación entre fotografías.
     */

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            showPhoto(currentIndex - 1);
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            showPhoto(currentIndex + 1);
        });
    }

    /*
     * Selección de miniaturas.
     */

    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener("click", () => {
            showPhoto(index);
        });
    });

    /*
     * Clic fuera del contenido para cerrar la galería.
     */

    gallery.addEventListener("click", event => {
        if (event.target === gallery) {
            closeGallery();
        }
    });

    /*
     * Si el navegador soporta el evento close del diálogo,
     * restablece el desplazamiento en caso de usar fallback.
     */

    gallery.addEventListener("close", () => {
        document.body.style.overflow = "";
    });

    /*
     * Teclas de navegación de la galería.
     * Escape lo gestiona también el elemento <dialog> nativo.
     */

    document.addEventListener("keydown", event => {
        const isOpen =
            gallery.open ||
            gallery.hasAttribute("open");

        if (!isOpen) {
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            showPhoto(currentIndex + 1);
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            showPhoto(currentIndex - 1);
        }

        if (
            event.key === "Escape" &&
            typeof gallery.showModal !== "function"
        ) {
            closeGallery();
        }
    });

    /*
     * Si una imagen no existe, se informa en consola
     * y se oculta la imagen rota.
     */

    currentImage.addEventListener("error", () => {
        console.warn(
            `Currículum: no se ha podido cargar la imagen "${currentImage.src}".`
        );

        currentImage.alt = "No se ha podido cargar esta fotografía";
        currentImage.style.visibility = "hidden";
    });

    currentImage.addEventListener("load", () => {
        currentImage.style.visibility = "visible";
    });

    /*
     * Estado inicial de la galería.
     */

    if (photos.length > 0) {
        showPhoto(0);
    }
}


/* =========================================================
   4. IMPRESIÓN DEL CURRÍCULUM
========================================================= */

function initPrintSupport() {
    /*
     * Cualquier botón con data-print-cv imprimirá el CV.
     * No es obligatorio tenerlo en el HTML.
     */

    document.querySelectorAll("[data-print-cv]").forEach(button => {
        button.addEventListener("click", () => {
            window.print();
        });
    });

    /*
     * Antes de imprimir, dejamos seleccionada la categoría
     * inicial. El CSS de impresión está preparado para
     * mostrar todas las vistas del currículum.
     */

    window.addEventListener("beforeprint", () => {
        const gallery = document.querySelector("#photo-gallery");

        if (gallery?.open && typeof gallery.close === "function") {
            gallery.close();
        }
    });
}
