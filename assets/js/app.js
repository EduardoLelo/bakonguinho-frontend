/* =========================================================
   BAKONGUINHO - FRONTEND
   Arquivo: assets/js/app.js
   ========================================================= */


/* =========================================================
   1. FUNÇÕES AUXILIARES
   ========================================================= */

// Atalho para selecionar elementos do HTML
const $ = (selector) => document.querySelector(selector);


// Formatar valores em Kwanza
const money = (value) =>
    new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0
    })
        .format(Number(value) || 0)
        .replace("AOA", "Kz");


// Escapar caracteres especiais antes de inserir HTML
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


// Imagem padrão caso o produto não tenha imagem
const img = (path) =>
    path || "assets/images/logo.jpeg";


/* =========================================================
   2. DADOS DE RESERVA (FALLBACK)
   ---------------------------------------------------------
   Usados quando o backend demora ou não responde.
   ========================================================= */

const fallback = {

    // Configurações gerais do site
    settings: {
        hero_title: "O sabor que dá vontade de voltar",
        hero_text:
            "Hambúrgueres preparados com sabor, qualidade e aquele toque especial da BAKONGUINHO.",
        about_text:
            "A BAKONGUINHO é uma hamburgueria pensada para quem aprecia boa comida, hambúrgueres saborosos e momentos especiais.",
        address:
            "Seleque - Maye Maye, quadra E, Sequele, Icolo Bengo, Angola",
        phone: "923 850 875",
        hours: "Aberto até às 22:00",
        maps_url: "https://www.google.com/maps/place/Hamburguer+BAKONGINHO/@-8.8938364,13.5157143,285m/data=!3m1!1e3!4m5!3m4!1s0x1a51ff943b54e54b:0x81f5bb624b697ee3!8m2!3d-8.8939491!4d13.5157987?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D",
        review_count: 6
    },


    // Categorias de produtos
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


    // Produtos de reserva
    products: [
        {
            category_id: 1,
            name: "Double Cheeseburger",
            description: "Hambúrguer duplo artesanal.",
            price: 2500,
            image:
                "assets/images/produto_20260911_153446_04612a9283.jpg",
            featured: 1,
            active: 1
        },

        {
            category_id: 1,
            name: "Crispy Chicken",
            description: "Frango crocante num pão brioche.",
            price: 2200,
            image:
                "assets/images/produto_20260911_153558_482ad29e45.jpg",
            featured: 1,
            active: 1
        },

        {
            category_id: 1,
            name: "Bacon Gourmet",
            description: "Hambúrguer gourmet com queijo e bacon.",
            price: 2800,
            image:
                "assets/images/produto_20260911_155619_7b9b217736.jpg",
            featured: 1,
            active: 1
        },

        {
            category_id: 2,
            name: "No nosso churrasco",
            description: "Especialidade preparada na brasa.",
            price: 3500,
            image:
                "assets/images/produto_20260911_161351_5d26f0bdb1.jpg",
            featured: 1,
            active: 1
        },

        {
            category_id: 5,
            name: "Smash Sliders",
            description: "Mini hambúrgueres smash.",
            price: 2000,
            image:
                "assets/images/products/bakonguinho.jfif",
            active: 1
        },

        {
            category_id: 5,
            name: "Cheeseburger Clássica",
            description: "Receita clássica americana.",
            price: 2000,
            image:
                "assets/images/products/bakonguinho2.jfif",
            active: 1
        }
    ],


    // Galeria de reserva
    gallery: [],


    // Avaliações de reserva
    reviews: [
        {
            name: "Cliente BAKONGUINHO",
            comment: "A sua opinião é importante para nós.",
            rating: 5,
            active: 1
        }
    ]
};


/* =========================================================
   3. OBTER DADOS DO BACKEND
   ---------------------------------------------------------
   Existe um limite de 5 segundos para evitar que o menu
   fique preso à espera do Render.
   ========================================================= */

async function getSite() {

    try {

        // Controlador para cancelar a requisição
        const controller = new AbortController();


        // Tempo máximo de espera: 5 segundos
        const timeout = setTimeout(() => {
            controller.abort();
        }, 5000);


        // Buscar dados do backend
        const response = await fetch("/api/site", {
            cache: "no-store",
            signal: controller.signal
        });


        // Limpar o temporizador
        clearTimeout(timeout);


        // Verificar se a resposta foi bem sucedida
        if (!response.ok) {
            throw new Error("Erro ao carregar a API.");
        }


        // Devolver os dados recebidos
        return await response.json();

    } catch (error) {

        // Utilizar fallback em caso de erro
        return fallback;
    }
}


/* =========================================================
   4. MOSTRAR FILTROS DAS CATEGORIAS
   ========================================================= */

function renderFilters(categories) {

    const filters = $("#filters");


    // Verificar se o elemento existe
    if (!filters) {
        return;
    }


    // Garantir que temos uma lista
    const list = Array.isArray(categories)
        ? categories
        : [];


    // Criar o botão "Todos"
    let html = `
        <button
            class="filter active"
            data-cat="all"
        >
            Todos
        </button>
    `;


    // Criar os botões das categorias
    html += list
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


    // Inserir filtros no HTML
    filters.innerHTML = html;
}


/* =========================================================
   5. CONFIGURAR FILTROS
   ---------------------------------------------------------
   Esta é a correção principal do problema.

   Antes:
       p.dataset.cat === p.dataset.category

   Agora:
       p.dataset.category === b.dataset.cat
   ========================================================= */

function setupFilters() {

    document
        .querySelectorAll(".filter")
        .forEach((button) => {

            button.onclick = () => {

                // Remover "active" de todos os filtros
                document
                    .querySelectorAll(".filter")
                    .forEach((item) => {
                        item.classList.remove("active");
                    });


                // Ativar o botão clicado
                button.classList.add("active");


                // Categoria escolhida
                const selectedCategory =
                    String(button.dataset.cat);


                // Percorrer todos os produtos
                document
                    .querySelectorAll(".product")
                    .forEach((product) => {

                        // Categoria do produto
                        const productCategory =
                            String(
                                product.dataset.category || ""
                            );


                        // Mostrar todos quando "Todos" estiver selecionado
                        // Caso contrário, comparar categorias
                        const shouldShow =
                            selectedCategory === "all" ||
                            productCategory === selectedCategory;


                        // Mostrar ou esconder produto
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
   ---------------------------------------------------------
   Evita que o utilizador fique a ver "A carregar menu..."
   enquanto o Render responde.
   ========================================================= */

function showFallbackMenuImmediately() {

    // Mostrar categorias imediatamente
    renderFilters(
        fallback.categories
    );


    // Mostrar produtos imediatamente
    renderProducts(
        fallback.products
    );


    // Ativar filtros
    setupFilters();
}


/* =========================================================
   7. CARREGAR INFORMAÇÕES DO SITE
   ========================================================= */

async function loadSite() {

    // Obter dados atualizados
    const data = await getSite();


    // Configurações
    const settings =
        data.settings ||
        fallback.settings;


    /* -------------------------------------------------------
       HERO
       ------------------------------------------------------- */

    const heroTitle = $("#heroTitle");

    if (heroTitle) {
        heroTitle.textContent =
            settings.hero_title ||
            fallback.settings.hero_title;
    }


    const heroText = $("#heroText");

    if (heroText) {
        heroText.textContent =
            settings.hero_text ||
            "";
    }


    /* -------------------------------------------------------
       SOBRE NÓS
       ------------------------------------------------------- */

    const aboutText = $("#aboutText");

    if (aboutText) {
        aboutText.textContent =
            settings.about_text ||
            "";
    }


    /* -------------------------------------------------------
       ENDEREÇO
       ------------------------------------------------------- */

    const address = $("#address");

    if (address) {
        address.textContent =
            settings.address ||
            "";
    }


    /* -------------------------------------------------------
       TELEFONE
       ------------------------------------------------------- */

    const phone = $("#phone");

    if (phone) {
        phone.textContent =
            settings.phone ||
            "";
    }


    /* -------------------------------------------------------
       HORÁRIO
       ------------------------------------------------------- */

    const hours = $("#hours");

    if (hours) {
        hours.textContent =
            settings.hours ||
            "";
    }


    /* -------------------------------------------------------
       GOOGLE MAPS
       ------------------------------------------------------- */

    const maps = $("#maps");

    if (maps) {
        maps.href =
            settings.maps_url ||
            "#";
    }


    /* -------------------------------------------------------
       AVALIAÇÕES
       ------------------------------------------------------- */

    const reviewCount =
        $("#reviewCount");

    if (reviewCount) {
        reviewCount.textContent =
            (settings.review_count || 6) +
            " avaliações";
    }


    /* =======================================================
       CATEGORIAS
       ======================================================= */

    const categories =
        Array.isArray(data.categories) &&
        data.categories.length

            ? data.categories

            : fallback.categories;


    // Mostrar categorias
    renderFilters(categories);


    /* =======================================================
       PRODUTOS
       ======================================================= */

    const products =
        Array.isArray(data.products) &&
        data.products.length

            ? data.products

            : fallback.products;


    // Mostrar produtos
    renderProducts(products);


    // Reativar filtros
    setupFilters();


    /* =======================================================
       GALERIA
       ======================================================= */

    const gallery =
        Array.isArray(data.gallery)
            ? data.gallery
            : fallback.gallery;


    renderGallery(gallery);


    /* =======================================================
       AVALIAÇÕES
       ======================================================= */

    const reviews =
        Array.isArray(data.reviews)
            ? data.reviews
            : fallback.reviews;


    renderReviews(reviews);
}


/* =========================================================
   8. RENDERIZAR PRODUTOS
   ========================================================= */

function renderProducts(products) {

    const container =
        $("#products");


    // Verificar se o elemento existe
    if (!container) {
        return;
    }


    // Garantir lista
    const list =
        Array.isArray(products)
            ? products
            : [];


    /* -------------------------------------------------------
       Nenhum produto
       ------------------------------------------------------- */

    if (!list.length) {

        container.innerHTML = `
            <div class="empty">
                Nenhum produto disponível.
            </div>
        `;

        return;
    }


    /* -------------------------------------------------------
       Criar cartões dos produtos
       ------------------------------------------------------- */

    container.innerHTML =
        list
            .map((product) => {

                // Categoria do produto
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


                // Cartão do produto
                return `
                    <article
                        class="product"
                        data-category="${esc(
                            categoryId
                        )}"
                    >

                        <!-- Imagem -->
                        <div class="product-img">
                            ${image}
                        </div>


                        <!-- Informações -->
                        <div class="product-body">

                            <!-- Nome -->
                            <h3>
                                ${esc(product.name)}
                            </h3>


                            <!-- Descrição -->
                            <p>
                                ${esc(
                                    product.description || ""
                                )}
                            </p>


                            <!-- Preço -->
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
   9. RENDERIZAR GALERIA
   ========================================================= */

function renderGallery(galleryItems) {

    const container =
        $("#gallery");


    // Verificar elemento
    if (!container) {
        return;
    }


    // Garantir lista
    const list =
        Array.isArray(galleryItems)
            ? galleryItems
            : [];


    // Galeria vazia
    if (!list.length) {

        container.innerHTML = `
            <div class="empty">
                Galeria disponível em breve.
            </div>
        `;

        return;
    }


    // Criar galeria
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
   10. RENDERIZAR AVALIAÇÕES
   ========================================================= */

function renderReviews(reviewItems) {

    const container =
        $("#reviews");


    // Verificar elemento
    if (!container) {
        return;
    }


    // Garantir lista
    const list =
        Array.isArray(reviewItems)
            ? reviewItems
            : [];


    // Sem avaliações
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

                // Garantir avaliação entre 0 e 5
                const rating =
                    Math.max(
                        0,
                        Math.min(
                            5,
                            Number(review.rating) || 5
                        )
                    );


                // Estrelas preenchidas
                const filledStars =
                    "★".repeat(rating);


                // Estrelas vazias
                const emptyStars =
                    "☆".repeat(5 - rating);


                return `
                    <article class="review">

                        <!-- Estrelas -->
                        <div class="stars">
                            ${filledStars}${emptyStars}
                        </div>


                        <!-- Nome do cliente -->
                        <h3>
                            ${esc(review.name)}
                        </h3>


                        <!-- Comentário -->
                        <p>
                            “${esc(review.comment)}”
                        </p>

                    </article>
                `;
            })
            .join("");
}


/* =========================================================
   11. MENU MOBILE
   ========================================================= */

function setupMobileMenu() {

    // Botão do menu
    const toggle =
        $(".menu-toggle");


    // Menu de navegação
    const nav =
        $(".main-nav");


    // Verificar existência
    if (!toggle || !nav) {
        return;
    }


    // Abrir / fechar menu
    toggle.onclick = () => {

        // Alternar menu
        nav.classList.toggle("open");


        // Verificar estado
        const isOpen =
            nav.classList.contains("open");


        // Atualizar acessibilidade
        toggle.setAttribute(
            "aria-expanded",
            isOpen
        );


        // Alterar ícone
        toggle.textContent =
            isOpen
                ? "✕"
                : "☰";
    };


    // Fechar menu quando clicar num link
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
   12. INICIALIZAÇÃO DO SITE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* ---------------------------------------------------
           Mostrar imediatamente o menu local
           --------------------------------------------------- */

        showFallbackMenuImmediately();


        /* ---------------------------------------------------
           Atualizar ano do copyright
           --------------------------------------------------- */

        const year =
            $("#year");

        if (year) {

            year.textContent =
                new Date().getFullYear();
        }


        /* ---------------------------------------------------
           Configurar menu mobile
           --------------------------------------------------- */

        setupMobileMenu();


        /* ---------------------------------------------------
           Buscar dados atualizados do backend
           --------------------------------------------------- */

        loadSite();
    }
);
