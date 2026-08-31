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
      '<div class="product-media">' +
      (hasPromo ? '<span class="product-badge">Promoção</span>' : "") +
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
      if (!addBtn) return;
      var card = addBtn.closest(".product-card");
      var id = card.getAttribute("data-id");
      var product = allProdutos.find((p) => p.id === id);
      if (product) MC.cart.add(product, 1);
    });
  });
})();
