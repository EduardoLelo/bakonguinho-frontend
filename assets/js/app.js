/* =========================================================
   BAKONGUINHO - FRONTEND
   Arquivo: assets/js/app.js

   Funções:
   - Carregar dados do backend
   - Fallback local
   - Produtos
   - Filtros
   - Galeria
   - Avaliações
   - Formulário público de avaliações
   - Menu mobile

   ========================================================= */


/* =========================================================
   1. FUNÇÕES AUXILIARES
   ========================================================= */

// Atalho para selecionar elemento
const $ = (selector) =>
    document.querySelector(selector);


// Formatar valores em Kwanza
const money = (value) =>
    new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0
    })
        .format(Number(value) || 0)
        .replace("AOA", "Kz");


// Escapar caracteres especiais
const esc = (value) =>
    String(value ?? "").replace(
        /[&<>"']/g,
        (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character])
    );


// Imagem padrão
const img = (path) =>
    path || "assets/images/logo.jpeg";


/* =========================================================
   2. DADOS DE RESERVA
   ---------------------------------------------------------
   Utilizados quando a API do Render não responder.
   ========================================================= */

const fallback = {

    /* -------------------------------------------------------
       Configurações
       ------------------------------------------------------- */

    settings: {

        hero_title:
            "O sabor que dá vontade de voltar",

        hero_text:
            "Hambúrgueres preparados com sabor, qualidade e aquele toque especial da BAKONGUINHO.",

        about_text:
            "A BAKONGUINHO é uma hamburgueria pensada para quem aprecia boa comida, hambúrgueres saborosos e momentos especiais.",

        address:
            "Seleque - Maye Maye, quadra E, Sequele, Icolo Bengo, Angola",

        phone:
            "923 850 875",

        hours:
            "Aberto até às 22:00",

        maps_url:
            "https://www.google.com/maps/place/Hamburguer+BAKONGUINHO/@-8.8938364,13.5157143,285m/data=!3m1!1e3!4m5!3m4!1s0x1a51ff943b54e54b:0x81f5bb624b697ee3!8m2!3d-8.8939491!4d13.5157987?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D",

        review_count:
            0
    },


    /* -------------------------------------------------------
       Categorias
       ------------------------------------------------------- */

    categories: [

        {
            id: 1,
            name: "Hambúrgueres"
        },

        {
            id: 2,
            name: "Churrasco"
        },

        {
            id: 3,
            name: "Acompanhamentos"
        },

        {
            id: 4,
            name: "Bebidas"
        },

        {
            id: 5,
            name: "Especiais"
        }

    ],


    /* -------------------------------------------------------
       Produtos
       ------------------------------------------------------- */

    products: [

        {
            category_id: 1,
            name: "Double Cheeseburger",
            description:
                "Hambúrguer duplo artesanal.",
            price: 2500,
            image:
                "assets/images/produto_20260911_153446_04612a9283.jpg",
            featured: 1,
            active: 1
        },

        {
            category_id: 1,
            name: "Crispy Chicken",
            description:
                "Frango crocante num pão brioche.",
            price: 2200,
            image:
                "assets/images/produto_20260911_153558_482ad29e45.jpg",
            featured: 1,
            active: 1
        },

        {
            category_id: 1,
            name: "Bacon Gourmet",
            description:
                "Hambúrguer gourmet com queijo e bacon.",
            price: 2800,
            image:
                "assets/images/produto_20260911_155619_7b9b217736.jpg",
            featured: 1,
            active: 1
        },

        {
            category_id: 2,
            name: "No nosso churrasco",
            description:
                "Especialidade preparada na brasa.",
            price: 3500,
            image:
                "assets/images/produto_20260911_161351_5d26f0bdb1.jpg",
            featured: 1,
            active: 1
        },

        {
            category_id: 5,
            name: "Smash Sliders",
            description:
                "Mini hambúrgueres smash.",
            price: 2000,
            image:
                "assets/images/products/bakonguinho.jfif",
            active: 1
        },

        {
            category_id: 5,
            name: "Cheeseburger Clássica",
            description:
                "Receita clássica americana.",
            price: 2000,
            image:
                "assets/images/products/bakonguinho2.jfif",
            active: 1
        }

    ],


    /* -------------------------------------------------------
       Galeria
       ------------------------------------------------------- */

    gallery: [],


    /* -------------------------------------------------------
       Avaliações

       IMPORTANTE:
       Não colocamos avaliação fictícia.
       ------------------------------------------------------- */

    reviews: []

};


/* =========================================================
   3. BUSCAR DADOS DO BACKEND
   ========================================================= */

async function getSite() {

    try {

        // Controlador da requisição
        const controller =
            new AbortController();


        // Tempo máximo de espera
        const timeout =
            setTimeout(() => {
                controller.abort();
            }, 5000);


        // Pedido à API
        const response =
            await fetch("/api/site", {
                cache: "no-store",
                signal: controller.signal
            });


        // Limpar temporizador
        clearTimeout(timeout);


        // Verificar resposta
        if (!response.ok) {
            throw new Error(
                "Erro ao carregar a API."
            );
        }


        // Devolver dados
        return await response.json();

    } catch (error) {

        // Em caso de erro, usar fallback
        return fallback;
    }
}


/* =========================================================
   4. MOSTRAR CATEGORIAS
   ========================================================= */

function renderFilters(categories) {

    const filters =
        $("#filters");


    // Verificar existência
    if (!filters) {
        return;
    }


    // Garantir array
    const list =
        Array.isArray(categories)
            ? categories
            : [];


    // Botão Todos
    let html = `
        <button
            class="filter active"
            data-cat="all"
        >
            Todos
        </button>
    `;


    // Categorias
    html +=
        list
            .map(
                (category) => `
                    <button
                        class="filter"
                        data-cat="${esc(category.id)}"
                    >
                        ${esc(category.name)}
                    </button>
                `
            )
            .join("");


    // Inserir
    filters.innerHTML =
        html;
}


/* =========================================================
   5. CONFIGURAR FILTROS
   ========================================================= */

function setupFilters() {

    document
        .querySelectorAll(".filter")
        .forEach((button) => {

            button.onclick = () => {

                // Remover active
                document
                    .querySelectorAll(".filter")
                    .forEach((item) => {
                        item.classList.remove("active");
                    });


                // Ativar botão escolhido
                button.classList.add("active");


                // Categoria escolhida
                const selectedCategory =
                    String(
                        button.dataset.cat
                    );


                // Percorrer produtos
                document
                    .querySelectorAll(".product")
                    .forEach((product) => {

                        // Categoria do produto
                        const productCategory =
                            String(
                                product.dataset.category || ""
                            );


                        // Mostrar ou esconder
                        const shouldShow =
                            selectedCategory === "all" ||
                            productCategory === selectedCategory;


                        product.style.display =
                            shouldShow
                                ? ""
                                : "none";
                    });
            };

        });
}


/* =========================================================
   6. MOSTRAR MENU IMEDIATAMENTE
   ========================================================= */

function showFallbackMenuImmediately() {

    // Mostrar categorias
    renderFilters(
        fallback.categories
    );


    // Mostrar produtos
    renderProducts(
        fallback.products
    );


    // Configurar filtros
    setupFilters();
}


/* =========================================================
   7. CARREGAR SITE
   ========================================================= */

async function loadSite() {

    // Buscar dados
    const data =
        await getSite();


    // Configurações
    const settings =
        data.settings ||
        fallback.settings;


    /* -------------------------------------------------------
       Hero
       ------------------------------------------------------- */

    const heroTitle =
        $("#heroTitle");

    if (heroTitle) {
        heroTitle.textContent =
            settings.hero_title ||
            fallback.settings.hero_title;
    }


    const heroText =
        $("#heroText");

    if (heroText) {
        heroText.textContent =
            settings.hero_text ||
            "";
    }


    /* -------------------------------------------------------
       Sobre nós
       ------------------------------------------------------- */

    const aboutText =
        $("#aboutText");

    if (aboutText) {
        aboutText.textContent =
            settings.about_text ||
            "";
    }


    /* -------------------------------------------------------
       Contacto
       ------------------------------------------------------- */

    const address =
        $("#address");

    if (address) {
        address.textContent =
            settings.address ||
            "";
    }


    const phone =
        $("#phone");

    if (phone) {
        phone.textContent =
            settings.phone ||
            "";
    }


    const hours =
        $("#hours");

    if (hours) {
        hours.textContent =
            settings.hours ||
            "";
    }


    /* -------------------------------------------------------
       Google Maps
       ------------------------------------------------------- */

    const maps =
        $("#maps");

    if (maps) {
        maps.href =
            settings.maps_url ||
            "#";
    }


    /* -------------------------------------------------------
       Contagem de avaliações
       ------------------------------------------------------- */

    const reviewCount =
        $("#reviewCount");

    if (reviewCount) {

        const count =
            Array.isArray(data.reviews)
                ? data.reviews.length
                : Number(
                    settings.review_count || 0
                );

        reviewCount.textContent =
            count +
            (
                count === 1
                    ? " avaliação"
                    : " avaliações"
            );
    }


    /* =======================================================
       CATEGORIAS
       ======================================================= */

    const categories =
        Array.isArray(data.categories) &&
        data.categories.length

            ? data.categories

            : fallback.categories;


    renderFilters(
        categories
    );


    /* =======================================================
       PRODUTOS
       ======================================================= */

    const products =
        Array.isArray(data.products) &&
        data.products.length

            ? data.products

            : fallback.products;


    renderProducts(
        products
    );


    // Reativar filtros
    setupFilters();


    /* =======================================================
       GALERIA
       ======================================================= */

    renderGallery(
        Array.isArray(data.gallery)
            ? data.gallery
            : fallback.gallery
    );


    /* =======================================================
       AVALIAÇÕES
       ======================================================= */

    renderReviews(
        Array.isArray(data.reviews)
            ? data.reviews
            : fallback.reviews
    );
}


/* =========================================================
   8. PRODUTOS
   ========================================================= */

function renderProducts(products) {

    const container =
        $("#products");


    if (!container) {
        return;
    }


    const list =
        Array.isArray(products)
            ? products
            : [];


    if (!list.length) {

        container.innerHTML = `
            <div class="empty">
                Nenhum produto disponível.
            </div>
        `;

        return;
    }


    container.innerHTML =
        list
            .map((product) => {

                // Categoria
                const categoryId =
                    product.category_id ?? "";


                // Imagem
                const image =
                    product.image
                        ? `
                            <img
                                src="${esc(
                                    img(product.image)
                                )}"
                                alt="${esc(
                                    product.name
                                )}"
                                loading="lazy"
                                onerror="
                                    this.style.display='none'
                                "
                            >
                          `
                        : `
                            <div class="empty">
                                Sem imagem
                            </div>
                          `;


                return `
                    <article
                        class="product"
                        data-category="${esc(
                            categoryId
                        )}"
                    >

                        <!-- Imagem do produto -->
                        <div class="product-img">
                            ${image}
                        </div>


                        <!-- Informações -->
                        <div class="product-body">

                            <h3>
                                ${esc(
                                    product.name
                                )}
                            </h3>

                            <p>
                                ${esc(
                                    product.description || ""
                                )}
                            </p>

                            <span class="price">
                                A partir de
                                ${money(product.price)}
                            </span>

                        </div>

                    </article>
                `;
            })
            .join("");
}


/* =========================================================
   9. GALERIA
   ========================================================= */

function renderGallery(items) {

    const container =
        $("#gallery");


    if (!container) {
        return;
    }


    const list =
        Array.isArray(items)
            ? items
            : [];


    if (!list.length) {

        container.innerHTML = `
            <div class="empty">
                Galeria disponível em breve.
            </div>
        `;

        return;
    }


    container.innerHTML =
        list
            .map(
                (item) => `
                    <figure>

                        <img
                            src="${esc(item.image)}"
                            alt="${esc(
                                item.caption || ""
                            )}"
                            loading="lazy"
                        >

                    </figure>
                `
            )
            .join("");
}


/* =========================================================
   10. AVALIAÇÕES
   ========================================================= */

function renderReviews(items) {

    const container =
        $("#reviews");


    if (!container) {
        return;
    }


    const list =
        Array.isArray(items)
            ? items
            : [];


    // Quando não existirem avaliações aprovadas
    if (!list.length) {

        container.innerHTML = `
            <div class="empty">
                Ainda não há avaliações.
            </div>
        `;

        return;
    }


    // Criar avaliações
    container.innerHTML =
        list
            .map((review) => {

                // Garantir nota entre 1 e 5
                const rating =
                    Math.max(
                        1,
                        Math.min(
                            5,
                            Number(
                                review.rating
                            ) || 5
                        )
                    );


                // Estrelas
                const stars =
                    "★".repeat(rating) +
                    "☆".repeat(
                        5 - rating
                    );


                return `
                    <article class="review">

                        <!-- Estrelas -->
                        <div class="stars">
                            ${stars}
                        </div>


                        <!-- Nome -->
                        <h3>
                            ${esc(
                                review.name
                            )}
                        </h3>


                        <!-- Comentário -->
                        <p>
                            “${esc(
                                review.comment
                            )}”
                        </p>

                    </article>
                `;
            })
            .join("");
}


/* =========================================================
   11. FORMULÁRIO PÚBLICO DE AVALIAÇÕES
   ========================================================= */

function setupReviewForm() {

    const form =
        $("#reviewForm");

    const message =
        $("#reviewMessage");


    // Se não existir formulário
    if (!form) {
        return;
    }


    /* -------------------------------------------------------
       Enviar formulário
       ------------------------------------------------------- */

    form.addEventListener(
        "submit",
        async (event) => {

            // Impedir reload
            event.preventDefault();


            // Limpar mensagem
            if (message) {
                message.innerHTML = "";
            }


            // Botão
            const button =
                form.querySelector(
                    "button[type='submit']"
                );


            // Desativar enquanto envia
            if (button) {

                button.disabled = true;

                button.textContent =
                    "A enviar...";
            }


            try {

                // Dados
                const formData =
                    new FormData(form);


                const name =
                    String(
                        formData.get("name") || ""
                    ).trim();


                const comment =
                    String(
                        formData.get("comment") || ""
                    ).trim();


                const rating =
                    Number(
                        formData.get("rating") || 5
                    );


                // Validação local
                if (!name) {
                    throw new Error(
                        "Digite o seu nome."
                    );
                }


                if (!comment) {
                    throw new Error(
                        "Digite o seu comentário."
                    );
                }


                if (
                    !Number.isInteger(rating) ||
                    rating < 1 ||
                    rating > 5
                ) {
                    throw new Error(
                        "Selecione uma avaliação válida."
                    );
                }


                /* -------------------------------------------
                   Enviar para o backend
                   ------------------------------------------- */

                const response =
                    await fetch(
                        "/api/reviews",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name,
                                    comment,
                                    rating
                                })
                        }
                    );


                // Tentar ler resposta
                const result =
                    await response.json();


                // Verificar erro
                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Não foi possível enviar a avaliação."
                    );
                }


                /* -------------------------------------------
                   Sucesso
                   ------------------------------------------- */

                if (message) {

                    message.innerHTML = `
                        <div
                            style="
                                padding:12px 15px;
                                border-radius:10px;
                                background:#fff4e8;
                                color:#8a4700;
                            "
                        >
                            Avaliação enviada com sucesso.
                            Aguarde a aprovação do administrador.
                        </div>
                    `;
                }


                // Limpar formulário
                form.reset();


                // Voltar para 5 estrelas
                const ratingField =
                    form.querySelector(
                        'select[name="rating"]'
                    );


                if (ratingField) {
                    ratingField.value = "5";
                }


            } catch (error) {

                /* -------------------------------------------
                   Erro
                   ------------------------------------------- */

                if (message) {

                    message.innerHTML = `
                        <div
                            style="
                                padding:12px 15px;
                                border-radius:10px;
                                background:#ffeaea;
                                color:#a40000;
                            "
                        >
                            ${esc(
                                error.message ||
                                "Erro ao enviar avaliação."
                            )}
                        </div>
                    `;
                }

            } finally {

                // Reativar botão
                if (button) {

                    button.disabled = false;

                    button.textContent =
                        "Enviar avaliação";
                }
            }

        }
    );
}


/* =========================================================
   12. MENU MOBILE
   ========================================================= */

function setupMobileMenu() {

    const toggle =
        $(".menu-toggle");

    const nav =
        $(".main-nav");


    if (!toggle || !nav) {
        return;
    }


    // Abrir / fechar
    toggle.onclick = () => {

        nav.classList.toggle("open");


        const isOpen =
            nav.classList.contains("open");


        toggle.setAttribute(
            "aria-expanded",
            isOpen
        );


        toggle.textContent =
            isOpen
                ? "✕"
                : "☰";
    };


    // Fechar ao clicar no link
    document
        .querySelectorAll(".main-nav a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    nav.classList.remove(
                        "open"
                    );


                    toggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );


                    toggle.textContent =
                        "☰";
                }
            );
        });
}


/* =========================================================
   13. INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* ---------------------------------------------------
           Mostrar produtos imediatamente
           --------------------------------------------------- */

        showFallbackMenuImmediately();


        /* ---------------------------------------------------
           Ano do copyright
           --------------------------------------------------- */

        const year =
            $("#year");

        if (year) {

            year.textContent =
                new Date().getFullYear();
        }


        /* ---------------------------------------------------
           Menu mobile
           --------------------------------------------------- */

        setupMobileMenu();


        /* ---------------------------------------------------
           Formulário de avaliações
           --------------------------------------------------- */

        setupReviewForm();


        /* ---------------------------------------------------
           Dados atualizados do backend
           --------------------------------------------------- */

        loadSite();
    }
);
