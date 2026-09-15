/* =========================================================
   CARREGAR O SITE
   ---------------------------------------------------------
   Primeiro mostra os dados locais para o menu aparecer
   imediatamente.

   Depois tenta atualizar os dados através da API do Render.
   ========================================================= */

async function loadSite() {

    // ---------------------------------------------------------
    // 1. Mostrar imediatamente os dados locais
    // ---------------------------------------------------------

    // Renderiza o menu local sem esperar pelo servidor
    renderProducts(fallback.products);

    // Renderiza as categorias locais
    const fallbackCats = fallback.categories || [];

    $("#filters").innerHTML =
        '<button class="filter active" data-cat="all">Todos</button>' +

        fallbackCats
            .map(
                (c) =>
                    `<button class="filter" data-cat="${c.id}">
                        ${esc(c.name)}
                    </button>`
            )
            .join("");

    // ---------------------------------------------------------
    // 2. Carregar dados atualizados do backend
    // ---------------------------------------------------------

    const d = await getSite();

    const s = d.settings || fallback.settings;


    /* ---------------------------------------------------------
       Atualizar informações do site
       --------------------------------------------------------- */

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


    /* ---------------------------------------------------------
       Atualizar categorias
       --------------------------------------------------------- */

    const cats = d.categories || fallback.categories;

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


    /* ---------------------------------------------------------
       Atualizar produtos
       --------------------------------------------------------- */

    renderProducts(
        d.products && d.products.length
            ? d.products
            : fallback.products
    );


    /* ---------------------------------------------------------
       Atualizar galeria
       --------------------------------------------------------- */

    renderGallery(d.gallery || fallback.gallery);


    /* ---------------------------------------------------------
       Atualizar avaliações
       --------------------------------------------------------- */

    renderReviews(d.reviews || fallback.reviews);


    /* ---------------------------------------------------------
       Filtros dos produtos
       --------------------------------------------------------- */

    document
        .querySelectorAll(".filter")
        .forEach((b) => {

            b.onclick = () => {

                // Remove "active" dos outros botões
                document
                    .querySelectorAll(".filter")
                    .forEach((x) =>
                        x.classList.remove("active")
                    );

                // Ativa o botão selecionado
                b.classList.add("active");


                // Mostra/esconde os produtos
                document
                    .querySelectorAll(".product")
                    .forEach((p) => {

                        const mostrar =
                            b.dataset.cat === "all" ||
                            p.dataset.category === b.dataset.cat;

                        p.style.display =
                            mostrar ? "" : "none";
                    });
            };
        });
}
