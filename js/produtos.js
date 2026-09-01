// Microcenter Informática — catálogo de produtos (lido de content/produtos.json)
(function () {
  "use strict";
  window.MC = window.MC || {};

  var CATEGORY_LABELS = {
    acessorios: "Acessórios",
    toners: "Toners e cartuchos",
    perifericos: "Periféricos",
    computadores: "Computadores",
    notebooks: "Notebooks",
    outros: "Outros",
  };
  MC.CATEGORY_LABELS = CATEGORY_LABELS;

  MC.loadProdutos = function () {
    return fetch("content/produtos.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        return (data && data.produtos) || [];
      })
      .catch(function () {
        return [];
      });
  };

  MC.loadServicos = function () {
    return fetch("content/servicos.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        return (data && data.servicos) || [];
      })
      .catch(function () {
        return [];
      });
  };

  function productCard(p) {
    var img = (p.imagens && p.imagens[0]) || "images/produto-placeholder.svg";
    var hasPromo = p.preco_promocional && p.preco && p.preco_promocional < p.preco;
    var priceHtml;
    if (hasPromo) {
      priceHtml =
        '<span class="price-old">' +
        MC.money(p.preco) +
        '</span><span class="price-now promo">' +
        MC.money(p.preco_promocional) +
        "</span>";
    } else if (p.preco) {
      priceHtml = '<span class="price-now">' + MC.money(p.preco) + "</span>";
    } else {
      priceHtml = '<span class="price-consult">Consultar preço</span>';
    }
    return (
      '<article class="product-card" data-id="' +
      p.id +
      '">' +
      '<div class="product-media" data-gallery="' +
      p.id +
      '">' +
      (hasPromo ? '<span class="product-badge">Promoção</span>' : "") +
      (p.imagens && p.imagens.length > 1 ? '<span class="product-imgcount">1/' + p.imagens.length + "</span>" : "") +
      '<img src="' +
      img +
      '" alt="' +
      p.nome +
      '" loading="lazy">' +
      "</div>" +
      '<div class="product-body">' +
      '<span class="product-cat">' +
      (CATEGORY_LABELS[p.categoria] || p.categoria || "") +
      "</span>" +
      '<h3 class="product-name">' +
      p.nome +
      "</h3>" +
      '<div class="product-price">' +
      priceHtml +
      "</div>" +
      '<button class="btn btn-primary btn-block product-add">Adicionar ao carrinho</button>' +
      "</div>" +
      "</article>"
    );
  }
  MC.productCard = productCard;

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.querySelector(".product-grid");
    if (!grid) return;

    var toolbar = document.querySelector(".catalog-toolbar");
    var activeCat = "todos";
    var allProdutos = [];

    function render() {
      var list = activeCat === "todos" ? allProdutos : allProdutos.filter((p) => p.categoria === activeCat);
      if (!list.length) {
        grid.innerHTML = "";
        grid.insertAdjacentHTML(
          "afterend",
          '<div class="empty-state" id="mc-empty"><h3>Nenhum produto por aqui ainda</h3><p>Estamos organizando o catálogo. Fale com a gente no WhatsApp que já te ajudamos.</p></div>'
        );
        return;
      }
      var existingEmpty = document.getElementById("mc-empty");
      if (existingEmpty) existingEmpty.remove();
      grid.innerHTML = list.map(productCard).join("");
    }

    MC.loadProdutos().then(function (produtos) {
      allProdutos = produtos;
      render();
    });

    if (toolbar) {
      toolbar.addEventListener("click", function (e) {
        var chip = e.target.closest(".chip");
        if (!chip) return;
        toolbar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeCat = chip.getAttribute("data-cat");
        render();
      });
    }

    document.addEventListener("click", function (e) {
      var addBtn = e.target.closest(".product-add");
      if (addBtn) {
        var card = addBtn.closest(".product-card");
        var id = card.getAttribute("data-id");
        var product = allProdutos.find((p) => p.id === id);
        if (product) MC.cart.add(product, 1);
        return;
      }
      var media = e.target.closest(".product-media");
      if (media) {
        var pid = media.getAttribute("data-gallery");
        var prod = allProdutos.find((p) => p.id === pid);
        if (prod && prod.imagens && prod.imagens.length) openLightbox(prod);
        return;
      }
      if (e.target.closest(".lightbox-close") || e.target.classList.contains("lightbox-overlay")) {
        closeLightbox();
      }
      var next = e.target.closest(".lightbox-next");
      var prev = e.target.closest(".lightbox-prev");
      if (next) stepLightbox(1);
      if (prev) stepLightbox(-1);
    });

    var lb = { images: [], index: 0, nome: "" };

    function injectLightbox() {
      if (document.querySelector(".lightbox-overlay")) return;
      var wrap = document.createElement("div");
      wrap.innerHTML =
        '<div class="lightbox-overlay">' +
        '<button class="lightbox-close" aria-label="Fechar">✕</button>' +
        '<button class="lightbox-prev" aria-label="Anterior">‹</button>' +
        '<div class="lightbox-stage"><img class="lightbox-img" src="" alt=""><span class="lightbox-count"></span></div>' +
        '<button class="lightbox-next" aria-label="Próxima">›</button>' +
        "</div>";
      document.body.appendChild(wrap);
    }

    function renderLightbox() {
      var img = document.querySelector(".lightbox-img");
      var count = document.querySelector(".lightbox-count");
      img.src = lb.images[lb.index];
      img.alt = lb.nome;
      count.textContent = lb.nome + " — " + (lb.index + 1) + "/" + lb.images.length;
      var overlay = document.querySelector(".lightbox-overlay");
      overlay.querySelectorAll(".lightbox-prev, .lightbox-next").forEach(function (btn) {
        btn.style.display = lb.images.length > 1 ? "flex" : "none";
      });
    }

    function openLightbox(product) {
      injectLightbox();
      lb.images = product.imagens;
      lb.index = 0;
      lb.nome = product.nome;
      renderLightbox();
      document.querySelector(".lightbox-overlay").classList.add("open");
    }
    function closeLightbox() {
      var overlay = document.querySelector(".lightbox-overlay");
      if (overlay) overlay.classList.remove("open");
    }
    function stepLightbox(dir) {
      lb.index = (lb.index + dir + lb.images.length) % lb.images.length;
      renderLightbox();
    }
  });
})();
