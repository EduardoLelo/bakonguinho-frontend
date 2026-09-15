```javascript
/* =========================================================
   BAKONGUINHO - FRONTEND
   Arquivo: assets/js/app.js

   Responsabilidades deste arquivo:
   - Carregar dados do backend
   - Utilizar dados de reserva (fallback)
   - Mostrar produtos
   - Filtrar produtos por categoria
   - Mostrar galeria
   - Mostrar avaliações
   - Atualizar informações do site
   - Controlar o menu mobile

   IMPORTANTE:
   O visual do site não é alterado por este arquivo.
   ========================================================= */


/* =========================================================
   1. FUNÇÕES AUXILIARES
   ========================================================= */

/**
 * Atalho para selecionar um elemento do HTML.
 */
const $ = (selector) => document.querySelector(selector);


/**
 * Formata valores monetários em Kwanza.
 *
 * Exemplo:
 * 2500 -> 2 500 Kz
 */
const money = (value) =>
    new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0
    })
        .format(Number(value) || 0)
        .replace("AOA", "Kz");


/**
 * Protege textos que serão inseridos diretamente no HTML.
 *
 * Evita problemas com caracteres especiais.
 */
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


/**
 * Define uma imagem padrão caso o produto não tenha imagem.
 */
const img = (path) =>
    path || "assets/images/logo.jpeg";


/* =========================================================
   2. DADOS DE RESERVA - FALLBACK
   ---------------------------------------------------------
   Estes dados são utilizados quando:
   - O Render está a acordar;
   - A API está temporariamente indisponível;
   - Existe algum problema de ligação.

   Assim o site não fica vazio.
   ========================================================= */

const fallback = {

    /* -------------------------------------------------------
       Configurações gerais do site
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
            "https://maps.google.com",

        review_count:
            6
    },


    /* -------------------------------------------------------
       Categorias de produtos
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
       Produtos de reserva
       ------------------------------------------------------- */
    products: [

        {
            category_id: 1,

            name:
                "Double Cheeseburger",

            description:
                "Hambúrguer duplo artesanal.",

            price:
                2500,

            image:
                "assets/images/produto_20260911_153446_04612a9283.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 1,

            name:
                "Crispy Chicken",

            description:
                "Frango crocante num pão brioche.",

            price:
                2200,

            image:
                "assets/images/produto_20260911_153558_482ad29e45.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 1,

            name:
                "Bacon Gourmet",

            description:
                "Hambúrguer gourmet com queijo e bacon.",

            price:
                2800,

            image:
                "assets/images/produto_20260911_155619_7b9b217736.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 2,

            name:
                "No nosso churrasco",

            description:
                "Especialidade preparada na brasa.",

            price:
                3500,

            image:
                "assets/images/produto_20260911_161351_5d26f0bdb1.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 5,

            name:
                "Smash Sliders",

            description:
                "Mini hambúrgueres smash.",

            price:
                2000,

            image:
                "assets/images/products/bakonguinho.jfif",

            active:
                1
        },


        {
            category_id: 5,

            name:
                "Cheeseburger Clássica",

            description:
                "Receita clássica americana.",

            price:
                2000,

            image:
                "assets/images/products/bakonguinho2.jfif",

            active:
                1
        }

    ],


    /* -------------------------------------------------------
       Galeria de reserva
       ------------------------------------------------------- */
    gallery: [],


    /* -------------------------------------------------------
       Avaliações de reserva
       ------------------------------------------------------- */
    reviews: [

        {
            name:
                "Cliente BAKONGUINHO",

            comment:
                "A sua opinião é importante para nós.",

            rating:
                5,

            active:
                1
        }

    ]

};


/* =========================================================
   3. OBTER DADOS DA API
   ========================================================= */

/**
 * Busca os dados atuais do backend.
 *
 * Existe um limite de 5 segundos para não deixar o site
 * preso indefinidamente caso o Render demore a responder.
 */
async function getSite() {

    try {

        /* ---------------------------------------------------
           Controlador para limitar o tempo da requisição
           --------------------------------------------------- */

        const controller =
            new AbortController();


        /* ---------------------------------------------------
           Depois de 5 segundos, cancelar a requisição
           --------------------------------------------------- */

        const timeout =
            setTimeout(() => {
                controller.abort();
            }, 5000);


        /* ---------------------------------------------------
           Fazer pedido à API
           --------------------------------------------------- */

        const response =
            await fetch("/api/site", {
                cache: "no-store",
                signal: controller.signal
            });


        /* ---------------------------------------------------
           Limpar temporizador
           --------------------------------------------------- */

        clearTimeout(timeout);


        /* ---------------------------------------------------
           Verificar resposta
           --------------------------------------------------- */

        if (!response.ok) {
            throw new Error(
                "Não foi possível carregar a API."
            );
        }


        /* ---------------------------------------------------
           Devolver dados do backend
           --------------------------------------------------- */

        return await response.json();

    } catch (error) {

        /* ---------------------------------------------------
           Se houver erro, usar os dados locais.
           O site continua funcionando.
           --------------------------------------------------- */

        return fallback;
    }
}


/* =========================================================
   4. MOSTRAR CATEGORIAS
   ========================================================= */

/**
 * Cria os botões das categorias.
 *
 * O botão "Todos" aparece sempre.
 */
function renderFilters(categories) {

    const filters =
        $("#filters");


    /* -------------------------------------------------------
       Verificar se o elemento existe
       ------------------------------------------------------- */

    if (!filters) {
        return;
    }


    /* -------------------------------------------------------
       Garantir que temos um array
       ------------------------------------------------------- */

    const cats =
        Array.isArray(categories)
            ? categories
            : [];


    /* -------------------------------------------------------
       Criar o botão "Todos"
       ------------------------------------------------------- */

    let html =
        `
        <button
            class="filter active"
            data-cat="all"
        >
            Todos
        </button>
        `;


    /* -------------------------------------------------------
       Criar os restantes botões
       ------------------------------------------------------- */

    html += cats
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


    /* -------------------------------------------------------
       Inserir no HTML
       ------------------------------------------------------- */

    filters.innerHTML =
        html;
}


/* =========================================================
   5. APLICAR FILTRO DOS PRODUTOS
   ========================================================= */

/**
 * Aplica o filtro selecionado aos produtos.
 *
 * CORREÇÃO:
 * Antes o código comparava:
 *
 *     p.dataset.cat
 *
 * mas o produto possui:
 *
 *     data-category
 *
 * Agora a comparação é feita corretamente:
 *
 *     p.dataset.category === b.dataset.cat
 *
 * Também utilizamos String() para evitar problemas quando
 * uma categoria vem como número e outra como texto.
 */
function setupFilters() {

    document
        .querySelectorAll(".filter")
        .forEach((button) => {

            button.onclick = () => {

                /* -------------------------------------------
                   Remover "active" de todos os botões
                   ------------------------------------------- */

                document
                    .querySelectorAll(".filter")
                    .forEach((item) => {
                        item.classList.remove("active");
                    });


                /* -------------------------------------------
                   Ativar o botão selecionado
                   ------------------------------------------- */

                button.classList.add("active");


                /* -------------------------------------------
                   Categoria selecionada
                   ------------------------------------------- */

                const selectedCategory =
                    String(button.dataset.cat);


                /* -------------------------------------------
                   Percorrer todos os produtos
                   ------------------------------------------- */

                document
                    .querySelectorAll(".product")
                    .forEach((product) => {

                        const productCategory =
                            String(
                                product.dataset.category || ""
                            );


                        /* -------------------------------------
                           Se "Todos" estiver selecionado,
                           mostrar todos os produtos.

                           Caso contrário, mostrar somente
                           os produtos da categoria escolhida.
                           ------------------------------------- */

                        const shouldShow =
                            selectedCategory === "all" ||
                            productCategory === selectedCategory;


                        /* -------------------------------------
                           Mostrar ou esconder
                           ------------------------------------- */

                        product.style.display =
                            shouldShow
                                ? ""
                                : "none";
                    });
            };

        });
}


/* =========================================================
   6. CARREGAR PRODUTOS INICIALMENTE
   ========================================================= */

/**
 * Mostra os produtos locais imediatamente.
 *
 * Isso evita que o cliente fique muito tempo a ver:
 *
 * "A carregar menu..."
 */
function showFallbackMenuImmediately() {

    /* -------------------------------------------------------
       Mostrar categorias
       ------------------------------------------------------- */

    renderFilters(
        fallback.categories
    );


    /* -------------------------------------------------------
       Mostrar produtos locais
       ------------------------------------------------------- */

    renderProducts(
        fallback.products
    );


    /* -------------------------------------------------------
       Configurar os filtros
       ------------------------------------------------------- */

    setupFilters();
}


/* =========================================================
   7. CARREGAR O SITE COMPLETO
   ========================================================= */

/**
 * Atualiza todos os dados utilizando o backend.
 */
async function loadSite() {

    /* -------------------------------------------------------
       IMPORTANTE:
       O fallback já foi mostrado antes desta função.

       Portanto o menu aparece imediatamente.

       Agora apenas atualizamos com os dados do backend.
       ------------------------------------------------------- */

    const data =
        await getSite();


    /* -------------------------------------------------------
       Configurações
       ------------------------------------------------------- */

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
       Endereço
       ------------------------------------------------------- */

    const address =
        $("#address");

    if (address) {

        address.textContent =
            settings.address ||
            "";
    }


    /* -------------------------------------------------------
       Telefone
       ------------------------------------------------------- */

    const phone =
        $("#phone");

    if (phone) {

        phone.textContent =
            settings.phone ||
            "";
    }


    /* -------------------------------------------------------
       Horário
       ------------------------------------------------------- */

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
       Número de avaliações
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


    /* -------------------------------------------------------
       Mostrar categorias
       ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       Mostrar produtos
       ------------------------------------------------------- */

    renderProducts(
        products
    );


    /* -------------------------------------------------------
       Reativar filtros depois de atualizar os produtos
       ------------------------------------------------------- */

    setupFilters();


    /* =======================================================
       GALERIA
       ======================================================= */

    const gallery =
        Array.isArray(data.gallery)
            ? data.gallery
            : fallback.gallery;


    renderGallery(
        gallery
    );


    /* =======================================================
       AVALIAÇÕES
       ======================================================= */

    const reviews =
        Array.isArray(data.reviews)
            ? data.reviews
            : fallback.reviews;


    renderReviews(
        reviews
    );
}


/* =========================================================
   8. RENDERIZAR PRODUTOS
   ========================================================= */

/**
 * Cria os cartões dos produtos.
 */
function renderProducts(products) {

    const container =
        $("#products");


    /* -------------------------------------------------------
       Verificar se o elemento existe
       ------------------------------------------------------- */

    if (!container) {
        return;
    }


    /* -------------------------------------------------------
       Garantir que recebemos um array
       ------------------------------------------------------- */

    const list =
        Array.isArray(products)
            ? products
            : [];


    /* -------------------------------------------------------
       Se não existirem produtos
       ------------------------------------------------------- */

    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty">
                Nenhum produto disponível.
            </div>
            `;

        return;
    }


    /* -------------------------------------------------------
       Criar HTML dos produtos
       ------------------------------------------------------- */

    container.innerHTML =
        list
            .map(
                (product) => {

                    /* ---------------------------------------
                       Categoria do produto
                       --------------------------------------- */

                    const categoryId =
                        product.category_id ?? "";


                    /* ---------------------------------------
                       Imagem do produto
                       --------------------------------------- */

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


                    /* ---------------------------------------
                       Cartão completo
                       --------------------------------------- */

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


                            <!-- Informações do produto -->
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
                }
            )
            .join("");
}


/* =========================================================
   9. RENDERIZAR GALERIA
   ========================================================= */

/**
 * Mostra as imagens da galeria.
 */
function renderGallery(galleryItems) {

    const container =
        $("#gallery");


    if (!container) {
        return;
    }


    const list =
        Array.isArray(galleryItems)
            ? galleryItems
            : [];


    /* -------------------------------------------------------
       Sem imagens
       ------------------------------------------------------- */

    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty">
                Galeria disponível em breve.
            </div>
            `;

        return;
    }


    /* -------------------------------------------------------
       Criar galeria
       ------------------------------------------------------- */

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

/**
 * Mostra as avaliações dos clientes.
 */
function renderReviews(reviewItems) {

    const container =
        $("#reviews");


    if (!container) {
        return;
    }


    const list =
        Array.isArray(reviewItems)
            ? reviewItems
            : [];


    /* -------------------------------------------------------
       Sem avaliações
       ------------------------------------------------------- */

    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty">
                Ainda não há avaliações.
            </div>
            `;

        return;
    }


    /* -------------------------------------------------------
       Criar avaliações
       ------------------------------------------------------- */

    container.innerHTML =
        list
            .map(
                (review) => {

                    /* ---------------------------------------
                       Número de estrelas
                       --------------------------------------- */

                    const rating =
                        Math.max(
                            0,
                            Math.min(
                                5,
                                Number(review.rating) || 5
                            )
                        );


                    /* ---------------------------------------
                       Estrelas preenchidas
                       --------------------------------------- */

                    const filledStars =
                        "★".repeat(
                            rating
                        );


                    /* ---------------------------------------
                       Estrelas vazias
                       --------------------------------------- */

                    const emptyStars =
                        "☆".repeat(
                            5 - rating
                        );


                    /* ---------------------------------------
                       HTML da avaliação
                       --------------------------------------- */

                    return `
                        <article class="review">

                            <!-- Estrelas -->
                            <div class="stars">
                                ${filledStars}
                                ${emptyStars}
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
                }
            )
            .join("");
}


/* =========================================================
   11. MENU MOBILE
   ========================================================= */

/**
 * Configura o menu mobile.
 */
function setupMobileMenu() {

    const toggle =
        $(".menu-toggle");

    const nav =
        $(".main-nav");


    /* -------------------------------------------------------
       Se os elementos não existirem, terminar
       ------------------------------------------------------- */

    if (!toggle || !nav) {
        return;
    }


    /* -------------------------------------------------------
       Abrir / fechar menu
       ------------------------------------------------------- */

    toggle.onclick = () => {

        /* Alternar classe "open" */
        nav.classList.toggle("open");


        /* Verificar estado */
        const isOpen =
            nav.classList.contains("open");


        /* Atualizar acessibilidade */
        toggle.setAttribute(
            "aria-expanded",
            isOpen
        );


        /* Alterar ícone */
        toggle.textContent =
            isOpen
                ? "✕"
                : "☰";
    };


    /* -------------------------------------------------------
       Fechar menu ao clicar num link
       ------------------------------------------------------- */

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
   12. INICIALIZAÇÃO
   ========================================================= */

/**
 * Executado quando o HTML termina de carregar.
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* ---------------------------------------------------
           1. Mostrar o menu local imediatamente
           --------------------------------------------------- */

        showFallbackMenuImmediately();


        /* ---------------------------------------------------
           2. Atualizar o ano do copyright
           --------------------------------------------------- */

        const year =
            $("#year");

        if (year) {

            year.textContent =
                new Date().getFullYear();
        }


        /* ---------------------------------------------------
           3. Configurar menu mobile
           --------------------------------------------------- */

        setupMobileMenu();


        /* ---------------------------------------------------
           4. Buscar dados atualizados do backend
           --------------------------------------------------- */

        loadSite();
    }
);
```
```javascript
/* =========================================================
   BAKONGUINHO - FRONTEND
   Arquivo: assets/js/app.js

   Responsabilidades deste arquivo:
   - Carregar dados do backend
   - Utilizar dados de reserva (fallback)
   - Mostrar produtos
   - Filtrar produtos por categoria
   - Mostrar galeria
   - Mostrar avaliações
   - Atualizar informações do site
   - Controlar o menu mobile

   IMPORTANTE:
   O visual do site não é alterado por este arquivo.
   ========================================================= */


/* =========================================================
   1. FUNÇÕES AUXILIARES
   ========================================================= */

/**
 * Atalho para selecionar um elemento do HTML.
 */
const $ = (selector) => document.querySelector(selector);


/**
 * Formata valores monetários em Kwanza.
 *
 * Exemplo:
 * 2500 -> 2 500 Kz
 */
const money = (value) =>
    new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0
    })
        .format(Number(value) || 0)
        .replace("AOA", "Kz");


/**
 * Protege textos que serão inseridos diretamente no HTML.
 *
 * Evita problemas com caracteres especiais.
 */
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


/**
 * Define uma imagem padrão caso o produto não tenha imagem.
 */
const img = (path) =>
    path || "assets/images/logo.jpeg";


/* =========================================================
   2. DADOS DE RESERVA - FALLBACK
   ---------------------------------------------------------
   Estes dados são utilizados quando:
   - O Render está a acordar;
   - A API está temporariamente indisponível;
   - Existe algum problema de ligação.

   Assim o site não fica vazio.
   ========================================================= */

const fallback = {

    /* -------------------------------------------------------
       Configurações gerais do site
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
            "https://maps.google.com",

        review_count:
            6
    },


    /* -------------------------------------------------------
       Categorias de produtos
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
       Produtos de reserva
       ------------------------------------------------------- */
    products: [

        {
            category_id: 1,

            name:
                "Double Cheeseburger",

            description:
                "Hambúrguer duplo artesanal.",

            price:
                2500,

            image:
                "assets/images/produto_20260911_153446_04612a9283.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 1,

            name:
                "Crispy Chicken",

            description:
                "Frango crocante num pão brioche.",

            price:
                2200,

            image:
                "assets/images/produto_20260911_153558_482ad29e45.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 1,

            name:
                "Bacon Gourmet",

            description:
                "Hambúrguer gourmet com queijo e bacon.",

            price:
                2800,

            image:
                "assets/images/produto_20260911_155619_7b9b217736.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 2,

            name:
                "No nosso churrasco",

            description:
                "Especialidade preparada na brasa.",

            price:
                3500,

            image:
                "assets/images/produto_20260911_161351_5d26f0bdb1.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 5,

            name:
                "Smash Sliders",

            description:
                "Mini hambúrgueres smash.",

            price:
                2000,

            image:
                "assets/images/products/bakonguinho.jfif",

            active:
                1
        },


        {
            category_id: 5,

            name:
                "Cheeseburger Clássica",

            description:
                "Receita clássica americana.",

            price:
                2000,

            image:
                "assets/images/products/bakonguinho2.jfif",

            active:
                1
        }

    ],


    /* -------------------------------------------------------
       Galeria de reserva
       ------------------------------------------------------- */
    gallery: [],


    /* -------------------------------------------------------
       Avaliações de reserva
       ------------------------------------------------------- */
    reviews: [

        {
            name:
                "Cliente BAKONGUINHO",

            comment:
                "A sua opinião é importante para nós.",

            rating:
                5,

            active:
                1
        }

    ]

};


/* =========================================================
   3. OBTER DADOS DA API
   ========================================================= */

/**
 * Busca os dados atuais do backend.
 *
 * Existe um limite de 5 segundos para não deixar o site
 * preso indefinidamente caso o Render demore a responder.
 */
async function getSite() {

    try {

        /* ---------------------------------------------------
           Controlador para limitar o tempo da requisição
           --------------------------------------------------- */

        const controller =
            new AbortController();


        /* ---------------------------------------------------
           Depois de 5 segundos, cancelar a requisição
           --------------------------------------------------- */

        const timeout =
            setTimeout(() => {
                controller.abort();
            }, 5000);


        /* ---------------------------------------------------
           Fazer pedido à API
           --------------------------------------------------- */

        const response =
            await fetch("/api/site", {
                cache: "no-store",
                signal: controller.signal
            });


        /* ---------------------------------------------------
           Limpar temporizador
           --------------------------------------------------- */

        clearTimeout(timeout);


        /* ---------------------------------------------------
           Verificar resposta
           --------------------------------------------------- */

        if (!response.ok) {
            throw new Error(
                "Não foi possível carregar a API."
            );
        }


        /* ---------------------------------------------------
           Devolver dados do backend
           --------------------------------------------------- */

        return await response.json();

    } catch (error) {

        /* ---------------------------------------------------
           Se houver erro, usar os dados locais.
           O site continua funcionando.
           --------------------------------------------------- */

        return fallback;
    }
}


/* =========================================================
   4. MOSTRAR CATEGORIAS
   ========================================================= */

/**
 * Cria os botões das categorias.
 *
 * O botão "Todos" aparece sempre.
 */
function renderFilters(categories) {

    const filters =
        $("#filters");


    /* -------------------------------------------------------
       Verificar se o elemento existe
       ------------------------------------------------------- */

    if (!filters) {
        return;
    }


    /* -------------------------------------------------------
       Garantir que temos um array
       ------------------------------------------------------- */

    const cats =
        Array.isArray(categories)
            ? categories
            : [];


    /* -------------------------------------------------------
       Criar o botão "Todos"
       ------------------------------------------------------- */

    let html =
        `
        <button
            class="filter active"
            data-cat="all"
        >
            Todos
        </button>
        `;


    /* -------------------------------------------------------
       Criar os restantes botões
       ------------------------------------------------------- */

    html += cats
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


    /* -------------------------------------------------------
       Inserir no HTML
       ------------------------------------------------------- */

    filters.innerHTML =
        html;
}


/* =========================================================
   5. APLICAR FILTRO DOS PRODUTOS
   ========================================================= */

/**
 * Aplica o filtro selecionado aos produtos.
 *
 * CORREÇÃO:
 * Antes o código comparava:
 *
 *     p.dataset.cat
 *
 * mas o produto possui:
 *
 *     data-category
 *
 * Agora a comparação é feita corretamente:
 *
 *     p.dataset.category === b.dataset.cat
 *
 * Também utilizamos String() para evitar problemas quando
 * uma categoria vem como número e outra como texto.
 */
function setupFilters() {

    document
        .querySelectorAll(".filter")
        .forEach((button) => {

            button.onclick = () => {

                /* -------------------------------------------
                   Remover "active" de todos os botões
                   ------------------------------------------- */

                document
                    .querySelectorAll(".filter")
                    .forEach((item) => {
                        item.classList.remove("active");
                    });


                /* -------------------------------------------
                   Ativar o botão selecionado
                   ------------------------------------------- */

                button.classList.add("active");


                /* -------------------------------------------
                   Categoria selecionada
                   ------------------------------------------- */

                const selectedCategory =
                    String(button.dataset.cat);


                /* -------------------------------------------
                   Percorrer todos os produtos
                   ------------------------------------------- */

                document
                    .querySelectorAll(".product")
                    .forEach((product) => {

                        const productCategory =
                            String(
                                product.dataset.category || ""
                            );


                        /* -------------------------------------
                           Se "Todos" estiver selecionado,
                           mostrar todos os produtos.

                           Caso contrário, mostrar somente
                           os produtos da categoria escolhida.
                           ------------------------------------- */

                        const shouldShow =
                            selectedCategory === "all" ||
                            productCategory === selectedCategory;


                        /* -------------------------------------
                           Mostrar ou esconder
                           ------------------------------------- */

                        product.style.display =
                            shouldShow
                                ? ""
                                : "none";
                    });
            };

        });
}


/* =========================================================
   6. CARREGAR PRODUTOS INICIALMENTE
   ========================================================= */

/**
 * Mostra os produtos locais imediatamente.
 *
 * Isso evita que o cliente fique muito tempo a ver:
 *
 * "A carregar menu..."
 */
function showFallbackMenuImmediately() {

    /* -------------------------------------------------------
       Mostrar categorias
       ------------------------------------------------------- */

    renderFilters(
        fallback.categories
    );


    /* -------------------------------------------------------
       Mostrar produtos locais
       ------------------------------------------------------- */

    renderProducts(
        fallback.products
    );


    /* -------------------------------------------------------
       Configurar os filtros
       ------------------------------------------------------- */

    setupFilters();
}


/* =========================================================
   7. CARREGAR O SITE COMPLETO
   ========================================================= */

/**
 * Atualiza todos os dados utilizando o backend.
 */
async function loadSite() {

    /* -------------------------------------------------------
       IMPORTANTE:
       O fallback já foi mostrado antes desta função.

       Portanto o menu aparece imediatamente.

       Agora apenas atualizamos com os dados do backend.
       ------------------------------------------------------- */

    const data =
        await getSite();


    /* -------------------------------------------------------
       Configurações
       ------------------------------------------------------- */

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
       Endereço
       ------------------------------------------------------- */

    const address =
        $("#address");

    if (address) {

        address.textContent =
            settings.address ||
            "";
    }


    /* -------------------------------------------------------
       Telefone
       ------------------------------------------------------- */

    const phone =
        $("#phone");

    if (phone) {

        phone.textContent =
            settings.phone ||
            "";
    }


    /* -------------------------------------------------------
       Horário
       ------------------------------------------------------- */

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
       Número de avaliações
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


    /* -------------------------------------------------------
       Mostrar categorias
       ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       Mostrar produtos
       ------------------------------------------------------- */

    renderProducts(
        products
    );


    /* -------------------------------------------------------
       Reativar filtros depois de atualizar os produtos
       ------------------------------------------------------- */

    setupFilters();


    /* =======================================================
       GALERIA
       ======================================================= */

    const gallery =
        Array.isArray(data.gallery)
            ? data.gallery
            : fallback.gallery;


    renderGallery(
        gallery
    );


    /* =======================================================
       AVALIAÇÕES
       ======================================================= */

    const reviews =
        Array.isArray(data.reviews)
            ? data.reviews
            : fallback.reviews;


    renderReviews(
        reviews
    );
}


/* =========================================================
   8. RENDERIZAR PRODUTOS
   ========================================================= */

/**
 * Cria os cartões dos produtos.
 */
function renderProducts(products) {

    const container =
        $("#products");


    /* -------------------------------------------------------
       Verificar se o elemento existe
       ------------------------------------------------------- */

    if (!container) {
        return;
    }


    /* -------------------------------------------------------
       Garantir que recebemos um array
       ------------------------------------------------------- */

    const list =
        Array.isArray(products)
            ? products
            : [];


    /* -------------------------------------------------------
       Se não existirem produtos
       ------------------------------------------------------- */

    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty">
                Nenhum produto disponível.
            </div>
            `;

        return;
    }


    /* -------------------------------------------------------
       Criar HTML dos produtos
       ------------------------------------------------------- */

    container.innerHTML =
        list
            .map(
                (product) => {

                    /* ---------------------------------------
                       Categoria do produto
                       --------------------------------------- */

                    const categoryId =
                        product.category_id ?? "";


                    /* ---------------------------------------
                       Imagem do produto
                       --------------------------------------- */

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


                    /* ---------------------------------------
                       Cartão completo
                       --------------------------------------- */

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


                            <!-- Informações do produto -->
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
                }
            )
            .join("");
}


/* =========================================================
   9. RENDERIZAR GALERIA
   ========================================================= */

/**
 * Mostra as imagens da galeria.
 */
function renderGallery(galleryItems) {

    const container =
        $("#gallery");


    if (!container) {
        return;
    }


    const list =
        Array.isArray(galleryItems)
            ? galleryItems
            : [];


    /* -------------------------------------------------------
       Sem imagens
       ------------------------------------------------------- */

    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty">
                Galeria disponível em breve.
            </div>
            `;

        return;
    }


    /* -------------------------------------------------------
       Criar galeria
       ------------------------------------------------------- */

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

/**
 * Mostra as avaliações dos clientes.
 */
function renderReviews(reviewItems) {

    const container =
        $("#reviews");


    if (!container) {
        return;
    }


    const list =
        Array.isArray(reviewItems)
            ? reviewItems
            : [];


    /* -------------------------------------------------------
       Sem avaliações
       ------------------------------------------------------- */

    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty">
                Ainda não há avaliações.
            </div>
            `;

        return;
    }


    /* -------------------------------------------------------
       Criar avaliações
       ------------------------------------------------------- */

    container.innerHTML =
        list
            .map(
                (review) => {

                    /* ---------------------------------------
                       Número de estrelas
                       --------------------------------------- */

                    const rating =
                        Math.max(
                            0,
                            Math.min(
                                5,
                                Number(review.rating) || 5
                            )
                        );


                    /* ---------------------------------------
                       Estrelas preenchidas
                       --------------------------------------- */

                    const filledStars =
                        "★".repeat(
                            rating
                        );


                    /* ---------------------------------------
                       Estrelas vazias
                       --------------------------------------- */

                    const emptyStars =
                        "☆".repeat(
                            5 - rating
                        );


                    /* ---------------------------------------
                       HTML da avaliação
                       --------------------------------------- */

                    return `
                        <article class="review">

                            <!-- Estrelas -->
                            <div class="stars">
                                ${filledStars}
                                ${emptyStars}
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
                }
            )
            .join("");
}


/* =========================================================
   11. MENU MOBILE
   ========================================================= */

/**
 * Configura o menu mobile.
 */
function setupMobileMenu() {

    const toggle =
        $(".menu-toggle");

    const nav =
        $(".main-nav");


    /* -------------------------------------------------------
       Se os elementos não existirem, terminar
       ------------------------------------------------------- */

    if (!toggle || !nav) {
        return;
    }


    /* -------------------------------------------------------
       Abrir / fechar menu
       ------------------------------------------------------- */

    toggle.onclick = () => {

        /* Alternar classe "open" */
        nav.classList.toggle("open");


        /* Verificar estado */
        const isOpen =
            nav.classList.contains("open");


        /* Atualizar acessibilidade */
        toggle.setAttribute(
            "aria-expanded",
            isOpen
        );


        /* Alterar ícone */
        toggle.textContent =
            isOpen
                ? "✕"
                : "☰";
    };


    /* -------------------------------------------------------
       Fechar menu ao clicar num link
       ------------------------------------------------------- */

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
   12. INICIALIZAÇÃO
   ========================================================= */

/**
 * Executado quando o HTML termina de carregar.
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* ---------------------------------------------------
           1. Mostrar o menu local imediatamente
           --------------------------------------------------- */

        showFallbackMenuImmediately();


        /* ---------------------------------------------------
           2. Atualizar o ano do copyright
           --------------------------------------------------- */

        const year =
            $("#year");

        if (year) {

            year.textContent =
                new Date().getFullYear();
        }


        /* ---------------------------------------------------
           3. Configurar menu mobile
           --------------------------------------------------- */

        setupMobileMenu();


        /* ---------------------------------------------------
           4. Buscar dados atualizados do backend
           --------------------------------------------------- */

        loadSite();
    }
);
```
```javascript
/* =========================================================
   BAKONGUINHO - FRONTEND
   Arquivo: assets/js/app.js

   Responsabilidades deste arquivo:
   - Carregar dados do backend
   - Utilizar dados de reserva (fallback)
   - Mostrar produtos
   - Filtrar produtos por categoria
   - Mostrar galeria
   - Mostrar avaliações
   - Atualizar informações do site
   - Controlar o menu mobile

   IMPORTANTE:
   O visual do site não é alterado por este arquivo.
   ========================================================= */


/* =========================================================
   1. FUNÇÕES AUXILIARES
   ========================================================= */

/**
 * Atalho para selecionar um elemento do HTML.
 */
const $ = (selector) => document.querySelector(selector);


/**
 * Formata valores monetários em Kwanza.
 *
 * Exemplo:
 * 2500 -> 2 500 Kz
 */
const money = (value) =>
    new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0
    })
        .format(Number(value) || 0)
        .replace("AOA", "Kz");


/**
 * Protege textos que serão inseridos diretamente no HTML.
 *
 * Evita problemas com caracteres especiais.
 */
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


/**
 * Define uma imagem padrão caso o produto não tenha imagem.
 */
const img = (path) =>
    path || "assets/images/logo.jpeg";


/* =========================================================
   2. DADOS DE RESERVA - FALLBACK
   ---------------------------------------------------------
   Estes dados são utilizados quando:
   - O Render está a acordar;
   - A API está temporariamente indisponível;
   - Existe algum problema de ligação.

   Assim o site não fica vazio.
   ========================================================= */

const fallback = {

    /* -------------------------------------------------------
       Configurações gerais do site
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
            "https://maps.google.com",

        review_count:
            6
    },


    /* -------------------------------------------------------
       Categorias de produtos
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
       Produtos de reserva
       ------------------------------------------------------- */
    products: [

        {
            category_id: 1,

            name:
                "Double Cheeseburger",

            description:
                "Hambúrguer duplo artesanal.",

            price:
                2500,

            image:
                "assets/images/produto_20260911_153446_04612a9283.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 1,

            name:
                "Crispy Chicken",

            description:
                "Frango crocante num pão brioche.",

            price:
                2200,

            image:
                "assets/images/produto_20260911_153558_482ad29e45.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 1,

            name:
                "Bacon Gourmet",

            description:
                "Hambúrguer gourmet com queijo e bacon.",

            price:
                2800,

            image:
                "assets/images/produto_20260911_155619_7b9b217736.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 2,

            name:
                "No nosso churrasco",

            description:
                "Especialidade preparada na brasa.",

            price:
                3500,

            image:
                "assets/images/produto_20260911_161351_5d26f0bdb1.jpg",

            featured:
                1,

            active:
                1
        },


        {
            category_id: 5,

            name:
                "Smash Sliders",

            description:
                "Mini hambúrgueres smash.",

            price:
                2000,

            image:
                "assets/images/products/bakonguinho.jfif",

            active:
                1
        },


        {
            category_id: 5,

            name:
                "Cheeseburger Clássica",

            description:
                "Receita clássica americana.",

            price:
                2000,

            image:
                "assets/images/products/bakonguinho2.jfif",

            active:
                1
        }

    ],


    /* -------------------------------------------------------
       Galeria de reserva
       ------------------------------------------------------- */
    gallery: [],


    /* -------------------------------------------------------
       Avaliações de reserva
       ------------------------------------------------------- */
    reviews: [

        {
            name:
                "Cliente BAKONGUINHO",

            comment:
                "A sua opinião é importante para nós.",

            rating:
                5,

            active:
                1
        }

    ]

};


/* =========================================================
   3. OBTER DADOS DA API
   ========================================================= */

/**
 * Busca os dados atuais do backend.
 *
 * Existe um limite de 5 segundos para não deixar o site
 * preso indefinidamente caso o Render demore a responder.
 */
async function getSite() {

    try {

        /* ---------------------------------------------------
           Controlador para limitar o tempo da requisição
           --------------------------------------------------- */

        const controller =
            new AbortController();


        /* ---------------------------------------------------
           Depois de 5 segundos, cancelar a requisição
           --------------------------------------------------- */

        const timeout =
            setTimeout(() => {
                controller.abort();
            }, 5000);


        /* ---------------------------------------------------
           Fazer pedido à API
           --------------------------------------------------- */

        const response =
            await fetch("/api/site", {
                cache: "no-store",
                signal: controller.signal
            });


        /* ---------------------------------------------------
           Limpar temporizador
           --------------------------------------------------- */

        clearTimeout(timeout);


        /* ---------------------------------------------------
           Verificar resposta
           --------------------------------------------------- */

        if (!response.ok) {
            throw new Error(
                "Não foi possível carregar a API."
            );
        }


        /* ---------------------------------------------------
           Devolver dados do backend
           --------------------------------------------------- */

        return await response.json();

    } catch (error) {

        /* ---------------------------------------------------
           Se houver erro, usar os dados locais.
           O site continua funcionando.
           --------------------------------------------------- */

        return fallback;
    }
}


/* =========================================================
   4. MOSTRAR CATEGORIAS
   ========================================================= */

/**
 * Cria os botões das categorias.
 *
 * O botão "Todos" aparece sempre.
 */
function renderFilters(categories) {

    const filters =
        $("#filters");


    /* -------------------------------------------------------
       Verificar se o elemento existe
       ------------------------------------------------------- */

    if (!filters) {
        return;
    }


    /* -------------------------------------------------------
       Garantir que temos um array
       ------------------------------------------------------- */

    const cats =
        Array.isArray(categories)
            ? categories
            : [];


    /* -------------------------------------------------------
       Criar o botão "Todos"
       ------------------------------------------------------- */

    let html =
        `
        <button
            class="filter active"
            data-cat="all"
        >
            Todos
        </button>
        `;


    /* -------------------------------------------------------
       Criar os restantes botões
       ------------------------------------------------------- */

    html += cats
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


    /* -------------------------------------------------------
       Inserir no HTML
       ------------------------------------------------------- */

    filters.innerHTML =
        html;
}


/* =========================================================
   5. APLICAR FILTRO DOS PRODUTOS
   ========================================================= */

/**
 * Aplica o filtro selecionado aos produtos.
 *
 * CORREÇÃO:
 * Antes o código comparava:
 *
 *     p.dataset.cat
 *
 * mas o produto possui:
 *
 *     data-category
 *
 * Agora a comparação é feita corretamente:
 *
 *     p.dataset.category === b.dataset.cat
 *
 * Também utilizamos String() para evitar problemas quando
 * uma categoria vem como número e outra como texto.
 */
function setupFilters() {

    document
        .querySelectorAll(".filter")
        .forEach((button) => {

            button.onclick = () => {

                /* -------------------------------------------
                   Remover "active" de todos os botões
                   ------------------------------------------- */

                document
                    .querySelectorAll(".filter")
                    .forEach((item) => {
                        item.classList.remove("active");
                    });


                /* -------------------------------------------
                   Ativar o botão selecionado
                   ------------------------------------------- */

                button.classList.add("active");


                /* -------------------------------------------
                   Categoria selecionada
                   ------------------------------------------- */

                const selectedCategory =
                    String(button.dataset.cat);


                /* -------------------------------------------
                   Percorrer todos os produtos
                   ------------------------------------------- */

                document
                    .querySelectorAll(".product")
                    .forEach((product) => {

                        const productCategory =
                            String(
                                product.dataset.category || ""
                            );


                        /* -------------------------------------
                           Se "Todos" estiver selecionado,
                           mostrar todos os produtos.

                           Caso contrário, mostrar somente
                           os produtos da categoria escolhida.
                           ------------------------------------- */

                        const shouldShow =
                            selectedCategory === "all" ||
                            productCategory === selectedCategory;


                        /* -------------------------------------
                           Mostrar ou esconder
                           ------------------------------------- */

                        product.style.display =
                            shouldShow
                                ? ""
                                : "none";
                    });
            };

        });
}


/* =========================================================
   6. CARREGAR PRODUTOS INICIALMENTE
   ========================================================= */

/**
 * Mostra os produtos locais imediatamente.
 *
 * Isso evita que o cliente fique muito tempo a ver:
 *
 * "A carregar menu..."
 */
function showFallbackMenuImmediately() {

    /* -------------------------------------------------------
       Mostrar categorias
       ------------------------------------------------------- */

    renderFilters(
        fallback.categories
    );


    /* -------------------------------------------------------
       Mostrar produtos locais
       ------------------------------------------------------- */

    renderProducts(
        fallback.products
    );


    /* -------------------------------------------------------
       Configurar os filtros
       ------------------------------------------------------- */

    setupFilters();
}


/* =========================================================
   7. CARREGAR O SITE COMPLETO
   ========================================================= */

/**
 * Atualiza todos os dados utilizando o backend.
 */
async function loadSite() {

    /* -------------------------------------------------------
       IMPORTANTE:
       O fallback já foi mostrado antes desta função.

       Portanto o menu aparece imediatamente.

       Agora apenas atualizamos com os dados do backend.
       ------------------------------------------------------- */

    const data =
        await getSite();


    /* -------------------------------------------------------
       Configurações
       ------------------------------------------------------- */

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
       Endereço
       ------------------------------------------------------- */

    const address =
        $("#address");

    if (address) {

        address.textContent =
            settings.address ||
            "";
    }


    /* -------------------------------------------------------
       Telefone
       ------------------------------------------------------- */

    const phone =
        $("#phone");

    if (phone) {

        phone.textContent =
            settings.phone ||
            "";
    }


    /* -------------------------------------------------------
       Horário
       ------------------------------------------------------- */

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
       Número de avaliações
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


    /* -------------------------------------------------------
       Mostrar categorias
       ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       Mostrar produtos
       ------------------------------------------------------- */

    renderProducts(
        products
    );


    /* -------------------------------------------------------
       Reativar filtros depois de atualizar os produtos
       ------------------------------------------------------- */

    setupFilters();


    /* =======================================================
       GALERIA
       ======================================================= */

    const gallery =
        Array.isArray(data.gallery)
            ? data.gallery
            : fallback.gallery;


    renderGallery(
        gallery
    );


    /* =======================================================
       AVALIAÇÕES
       ======================================================= */

    const reviews =
        Array.isArray(data.reviews)
            ? data.reviews
            : fallback.reviews;


    renderReviews(
        reviews
    );
}


/* =========================================================
   8. RENDERIZAR PRODUTOS
   ========================================================= */

/**
 * Cria os cartões dos produtos.
 */
function renderProducts(products) {

    const container =
        $("#products");


    /* -------------------------------------------------------
       Verificar se o elemento existe
       ------------------------------------------------------- */

    if (!container) {
        return;
    }


    /* -------------------------------------------------------
       Garantir que recebemos um array
       ------------------------------------------------------- */

    const list =
        Array.isArray(products)
            ? products
            : [];


    /* -------------------------------------------------------
       Se não existirem produtos
       ------------------------------------------------------- */

    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty">
                Nenhum produto disponível.
            </div>
            `;

        return;
    }


    /* -------------------------------------------------------
       Criar HTML dos produtos
       ------------------------------------------------------- */

    container.innerHTML =
        list
            .map(
                (product) => {

                    /* ---------------------------------------
                       Categoria do produto
                       --------------------------------------- */

                    const categoryId =
                        product.category_id ?? "";


                    /* ---------------------------------------
                       Imagem do produto
                       --------------------------------------- */

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


                    /* ---------------------------------------
                       Cartão completo
                       --------------------------------------- */

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


                            <!-- Informações do produto -->
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
                }
            )
            .join("");
}


/* =========================================================
   9. RENDERIZAR GALERIA
   ========================================================= */

/**
 * Mostra as imagens da galeria.
 */
function renderGallery(galleryItems) {

    const container =
        $("#gallery");


    if (!container) {
        return;
    }


    const list =
        Array.isArray(galleryItems)
            ? galleryItems
            : [];


    /* -------------------------------------------------------
       Sem imagens
       ------------------------------------------------------- */

    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty">
                Galeria disponível em breve.
            </div>
            `;

        return;
    }


    /* -------------------------------------------------------
       Criar galeria
       ------------------------------------------------------- */

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

/**
 * Mostra as avaliações dos clientes.
 */
function renderReviews(reviewItems) {

    const container =
        $("#reviews");


    if (!container) {
        return;
    }


    const list =
        Array.isArray(reviewItems)
            ? reviewItems
            : [];


    /* -------------------------------------------------------
       Sem avaliações
       ------------------------------------------------------- */

    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty">
                Ainda não há avaliações.
            </div>
            `;

        return;
    }


    /* -------------------------------------------------------
       Criar avaliações
       ------------------------------------------------------- */

    container.innerHTML =
        list
            .map(
                (review) => {

                    /* ---------------------------------------
                       Número de estrelas
                       --------------------------------------- */

                    const rating =
                        Math.max(
                            0,
                            Math.min(
                                5,
                                Number(review.rating) || 5
                            )
                        );


                    /* ---------------------------------------
                       Estrelas preenchidas
                       --------------------------------------- */

                    const filledStars =
                        "★".repeat(
                            rating
                        );


                    /* ---------------------------------------
                       Estrelas vazias
                       --------------------------------------- */

                    const emptyStars =
                        "☆".repeat(
                            5 - rating
                        );


                    /* ---------------------------------------
                       HTML da avaliação
                       --------------------------------------- */

                    return `
                        <article class="review">

                            <!-- Estrelas -->
                            <div class="stars">
                                ${filledStars}
                                ${emptyStars}
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
                }
            )
            .join("");
}


/* =========================================================
   11. MENU MOBILE
   ========================================================= */

/**
 * Configura o menu mobile.
 */
function setupMobileMenu() {

    const toggle =
        $(".menu-toggle");

    const nav =
        $(".main-nav");


    /* -------------------------------------------------------
       Se os elementos não existirem, terminar
       ------------------------------------------------------- */

    if (!toggle || !nav) {
        return;
    }


    /* -------------------------------------------------------
       Abrir / fechar menu
       ------------------------------------------------------- */

    toggle.onclick = () => {

        /* Alternar classe "open" */
        nav.classList.toggle("open");


        /* Verificar estado */
        const isOpen =
            nav.classList.contains("open");


        /* Atualizar acessibilidade */
        toggle.setAttribute(
            "aria-expanded",
            isOpen
        );


        /* Alterar ícone */
        toggle.textContent =
            isOpen
                ? "✕"
                : "☰";
    };


    /* -------------------------------------------------------
       Fechar menu ao clicar num link
       ------------------------------------------------------- */

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
   12. INICIALIZAÇÃO
   ========================================================= */

/**
 * Executado quando o HTML termina de carregar.
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* ---------------------------------------------------
           1. Mostrar o menu local imediatamente
           --------------------------------------------------- */

        showFallbackMenuImmediately();


        /* ---------------------------------------------------
           2. Atualizar o ano do copyright
           --------------------------------------------------- */

        const year =
            $("#year");

        if (year) {

            year.textContent =
                new Date().getFullYear();
        }


        /* ---------------------------------------------------
           3. Configurar menu mobile
           --------------------------------------------------- */

        setupMobileMenu();


        /* ---------------------------------------------------
           4. Buscar dados atualizados do backend
           --------------------------------------------------- */

        loadSite();
    }
);
```
