```javascript
/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

// Atalho para selecionar um único elemento
const $ = (s) => document.querySelector(s);


// Formata valores para Kwanza (Kz)
const money = (v) =>
    new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0
    })
        .format(Number(v) || 0)
        .replace("AOA", "Kz");


// Protege textos que serão inseridos no HTML
// contra caracteres especiais
const esc = (s) =>
    String(s ?? "").replace(
        /[&<>"']/g,
        (m) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[m])
    );


// Imagem padrão quando não existir uma imagem do produto
const img = (p) => p || "assets/images/logo.jpeg";


/* =========================================================
   DADOS DE RESERVA (FALLBACK)
   ---------------------------------------------------------
   Estes dados são usados caso a API do backend não esteja
   disponível.
   ========================================================= */

const fallback = {

    // Informações gerais do site
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
        maps_url: "https://maps.google.com",
        review_count: 6
    },


    // Categorias disponíveis
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


    // Galeria inicial
    gallery: [],


    // Avaliações iniciais
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
   OBTER DADOS DO SITE
   ---------------------------------------------------------
   Primeiro tenta carregar os dados através da API.
   Se a API falhar, utiliza os dados de fallback.
   ========================================================= */

async function getSite() {

    try {

        const r = await fetch("/api/site", {
            cache: "no-store"
        });


        // Se a API devolver erro, forçamos a utilização
        // dos dados de fallback
        if (!r.ok) {
            throw Error();
        }


        return await r.json();

    } catch {

        return fallback;
    }
}


/* =========================================================
   CARREGAR O SITE
   ========================================================= */

async function loadSite() {

    // Obtém os dados do backend ou do fallback
    const d = await getSite();

    // Configurações do site
    const s = d.settings || fallback.settings;


    /* -----------------------------------------------------
       ATUALIZAR INFORMAÇÕES PRINCIPAIS
       ----------------------------------------------------- */

    $("#heroTitle").textContent =
        s.hero_title || fallback.settings.hero_title;

    $("#heroText").textContent =
        s.hero_text || "";

    $("#aboutText").textContent =
        s.about_text || "";

    $("#address").textContent =
        s.address || "";

    $("#phone").textContent =
        s.phone || "";

    $("#hours").textContent =
        s.hours || "";

    $("#maps").href =
        s.maps_url || "#";

    $("#reviewCount").textContent =
        (s.review_count || 6) + " avaliações";


    /* -----------------------------------------------------
       CRIAR OS BOTÕES DAS CATEGORIAS
       ----------------------------------------------------- */

    const cats = d.categories || [];


    $("#filters").innerHTML =
        '<button class="filter active" data-cat="all">Todos</button>' +

        cats
            .map(
                (c) =>
                    `<button class="filter" data-cat="${c.id}">
                        ${esc(c.name)}
                    </button>`
            )
            .join("");


    /* -----------------------------------------------------
       CARREGAR PRODUTOS, GALERIA E AVALIAÇÕES
       ----------------------------------------------------- */

    renderProducts(d.products || []);

    renderGallery(d.gallery || []);

    renderReviews(d.reviews || []);


    /* -----------------------------------------------------
       FILTRO DOS PRODUTOS
       -----------------------------------------------------
       CORREÇÃO IMPORTANTE:

       Antes estava:

       p.dataset.cat === p.dataset.category

       O produto só possui "data-category".

       Agora usamos:

       p.dataset.category === b.dataset.cat
       ----------------------------------------------------- */

    document
        .querySelectorAll(".filter")
        .forEach((b) => {

            b.onclick = () => {

                // Remove o estado ativo de todos os filtros
                document
                    .querySelectorAll(".filter")
                    .forEach((x) => x.classList.remove("active"));


                // Ativa o filtro selecionado
                b.classList.add("active");


                // Percorre todos os produtos
                document
                    .querySelectorAll(".product")
                    .forEach((p) => {

                        /* -------------------------------------
                           "Todos" mostra todos os produtos.

                           Para uma categoria específica,
                           comparamos:

                           data-category do produto
                           com
                           data-cat do botão.
                           ------------------------------------- */

                        const mostrar =
                            b.dataset.cat === "all" ||
                            p.dataset.category === b.dataset.cat;


                        // Mostra ou esconde o produto
                        p.style.display = mostrar ? "" : "none";
                    });
            };
        });
}


/* =========================================================
   RENDERIZAR PRODUTOS
   ========================================================= */

function renderProducts(ps) {

    $("#products").innerHTML = ps.length

        ? ps
              .map(
                  (p) => `

                    <article
                        class="product"
                        data-category="${p.category_id || ""}"
                    >

                        <!-- Imagem do produto -->
                        <div class="product-img">

                            ${
                                p.image

                                    ? `
                                        <img
                                            src="${esc(img(p.image))}"
                                            alt="${esc(p.name)}"
                                            loading="lazy"
                                            onerror="this.style.display='none'"
                                        >
                                      `

                                    : `
                                        <div class="empty">
                                            Sem imagem
                                        </div>
                                      `
                            }

                        </div>


                        <!-- Informações do produto -->
                        <div class="product-body">

                            <h3>
                                ${esc(p.name)}
                            </h3>

                            <p>
                                ${esc(p.description || "")}
                            </p>

                            <span class="price">
                                A partir de ${money(p.price)}
                            </span>

                        </div>

                    </article>

                `
              )
              .join("")

        : `
            <div class="empty">
                Nenhum produto disponível.
            </div>
          `;
}


/* =========================================================
   RENDERIZAR GALERIA
   ========================================================= */

function renderGallery(gs) {

    $("#gallery").innerHTML = gs.length

        ? gs
              .map(
                  (g) => `
                    <figure>

                        <img
                            src="${esc(g.image)}"
                            alt="${esc(g.caption)}"
                            loading="lazy"
                        >

                    </figure>
                  `
              )
              .join("")

        : `
            <div class="empty">
                Galeria disponível em breve.
            </div>
          `;
}


/* =========================================================
   RENDERIZAR AVALIAÇÕES
   ========================================================= */

function renderReviews(rs) {

    $("#reviews").innerHTML = rs.length

        ? rs
              .map(
                  (r) => `

                    <article class="review">

                        <!-- Estrelas -->
                        <div class="stars">

                            ${"★".repeat(
                                Number(r.rating) || 5
                            )}

                            ${"☆".repeat(
                                5 - (Number(r.rating) || 5)
                            )}

                        </div>


                        <!-- Nome do cliente -->
                        <h3>
                            ${esc(r.name)}
                        </h3>


                        <!-- Comentário -->
                        <p>
                            “${esc(r.comment)}”
                        </p>

                    </article>

                  `
              )
              .join("")

        : `
            <div class="empty">
                Ainda não há avaliações.
            </div>
          `;
}


/* =========================================================
   INICIALIZAÇÃO DO SITE
   ---------------------------------------------------------
   Executado quando o HTML termina de carregar.
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* -----------------------------------------------------
           Carregar os dados do site
           ----------------------------------------------------- */

        loadSite();


        /* -----------------------------------------------------
           Atualizar automaticamente o ano do copyright
           ----------------------------------------------------- */

        $("#year").textContent =
            new Date().getFullYear();


        /* -----------------------------------------------------
           MENU MOBILE
           ----------------------------------------------------- */

        const t = $(".menu-toggle");

        const n = $(".main-nav");


        if (t && n) {

            t.onclick = () => {

                // Abre/fecha o menu
                n.classList.toggle("open");


                // Atualiza aria-expanded
                t.setAttribute(
                    "aria-expanded",
                    n.classList.contains("open")
                );


                // Altera o ícone do botão
                t.textContent =
                    n.classList.contains("open")
                        ? "✕"
                        : "☰";
            };
        }


        /* -----------------------------------------------------
           Fechar menu ao clicar num link
           ----------------------------------------------------- */

        document
            .querySelectorAll(".main-nav a")
            .forEach((a) =>

                a.addEventListener(
                    "click",
                    () => n?.classList.remove("open")
                )
            );
    }
);
```
