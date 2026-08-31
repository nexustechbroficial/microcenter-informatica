// Microcenter Informática — carrinho (localStorage) + finalizar pedido via WhatsApp
(function () {
  "use strict";
  window.MC = window.MC || {};
  var STORAGE_KEY = "mc_cart_v1";

  function read() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function write(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
    renderCart();
    updateCount();
  }

  MC.cart = {
    getItems: read,
    add: function (product, qty) {
      qty = qty || 1;
      var items = read();
      var existing = items.find(function (i) {
        return i.id === product.id;
      });
      if (existing) {
        existing.qty += qty;
      } else {
        items.push({
          id: product.id,
          nome: product.nome,
          preco: product.preco_promocional || product.preco || null,
          imagem: (product.imagens && product.imagens[0]) || "",
          qty: qty,
        });
      }
      write(items);
      MC.toast(product.nome + " adicionado ao carrinho");
    },
    setQty: function (id, qty) {
      var items = read();
      var it = items.find(function (i) {
        return i.id === id;
      });
      if (!it) return;
      it.qty = qty;
      if (it.qty <= 0) items = items.filter((i) => i.id !== id);
      write(items);
    },
    remove: function (id) {
      write(read().filter((i) => i.id !== id));
    },
    clear: function () {
      write([]);
    },
    total: function () {
      return read().reduce(function (sum, i) {
        return sum + (i.preco || 0) * i.qty;
      }, 0);
    },
    count: function () {
      return read().reduce(function (sum, i) {
        return sum + i.qty;
      }, 0);
    },
  };

  function updateCount() {
    var n = MC.cart.count();
    document.querySelectorAll(".cart-count").forEach(function (el) {
      el.textContent = n;
      el.style.display = n > 0 ? "flex" : "none";
    });
  }

  function itemRow(item) {
    var priceLabel = item.preco ? MC.money(item.preco) : "Consultar";
    return (
      '<div class="cart-item" data-id="' +
      item.id +
      '">' +
      '<img src="' +
      (item.imagem || "images/produto-placeholder.svg") +
      '" alt="">' +
      '<div class="cart-item-info">' +
      "<b>" +
      item.nome +
      "</b>" +
      '<span style="font-size:.82rem;color:var(--ink-500)">' +
      priceLabel +
      "</span>" +
      '<div class="qty-control">' +
      '<button class="qty-minus" aria-label="Diminuir">–</button>' +
      '<span>' +
      item.qty +
      "</span>" +
      '<button class="qty-plus" aria-label="Aumentar">+</button>' +
      "</div>" +
      "</div>" +
      '<button class="cart-item-remove">remover</button>' +
      "</div>"
    );
  }

  function renderCart() {
    var wrap = document.querySelector(".cart-items");
    var totalEl = document.querySelector(".cart-total-value");
    if (!wrap) return;
    var items = read();
    if (!items.length) {
      wrap.innerHTML = '<div class="cart-empty">Seu carrinho está vazio.<br>Adicione produtos no catálogo.</div>';
    } else {
      wrap.innerHTML = items.map(itemRow).join("");
    }
    if (totalEl) {
      var total = MC.cart.total();
      var hasUnpriced = items.some((i) => !i.preco);
      totalEl.textContent = (total > 0 ? MC.money(total) : "R$ 0,00") + (hasUnpriced ? " + itens a consultar" : "");
    }
    var finishBtn = document.querySelector(".cart-finish");
    if (finishBtn) finishBtn.disabled = items.length === 0;
  }

  function buildOrderMessage() {
    var items = read();
    var lines = ["Olá! Gostaria de fazer o seguinte pedido na " + MC.STORE_NAME + ":", ""];
    items.forEach(function (i, idx) {
      var priceLabel = i.preco ? " — " + MC.money(i.preco) + " (un.)" : " — a consultar";
      lines.push(idx + 1 + ". " + i.qty + "x " + i.nome + priceLabel);
    });
    var total = MC.cart.total();
    lines.push("");
    if (total > 0) lines.push("Total estimado: " + MC.money(total));
    lines.push("Pode confirmar disponibilidade e valor final? Obrigado(a)!");
    return lines.join("\n");
  }
  MC.cart.buildOrderMessage = buildOrderMessage;

  function openDrawer() {
    document.querySelector(".cart-overlay").classList.add("open");
    document.querySelector(".cart-drawer").classList.add("open");
  }
  function closeDrawer() {
    document.querySelector(".cart-overlay").classList.remove("open");
    document.querySelector(".cart-drawer").classList.remove("open");
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectDrawer();
    renderCart();
    updateCount();

    document.querySelectorAll(".cart-btn").forEach(function (btn) {
      btn.addEventListener("click", openDrawer);
    });

    document.addEventListener("click", function (e) {
      if (e.target.closest(".cart-close") || e.target.classList.contains("cart-overlay")) {
        closeDrawer();
      }
      var minus = e.target.closest(".qty-minus");
      var plus = e.target.closest(".qty-plus");
      var remove = e.target.closest(".cart-item-remove");
      if (minus || plus || remove) {
        var row = e.target.closest(".cart-item");
        var id = row.getAttribute("data-id");
        var items = read();
        var it = items.find((i) => i.id === id);
        if (!it) return;
        if (minus) MC.cart.setQty(id, it.qty - 1);
        if (plus) MC.cart.setQty(id, it.qty + 1);
        if (remove) MC.cart.remove(id);
      }
      var finish = e.target.closest(".cart-finish");
      if (finish && !finish.disabled) {
        var msg = buildOrderMessage();
        window.open(MC.waLink(msg), "_blank", "noopener");
      }
    });
  });

  function injectDrawer() {
    if (document.querySelector(".cart-drawer")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="cart-overlay"></div>' +
      '<aside class="cart-drawer">' +
      '<div class="cart-head"><h3>Seu carrinho</h3><button class="cart-close" aria-label="Fechar">✕</button></div>' +
      '<div class="cart-items"></div>' +
      '<div class="cart-foot">' +
      '<div class="cart-total"><span>Total</span><span class="cart-total-value">R$ 0,00</span></div>' +
      '<p class="cart-note">Itens sem preço cadastrado são combinados direto com a loja.</p>' +
      '<button class="btn btn-accent btn-block cart-finish">Finalizar pedido no WhatsApp</button>' +
      "</div>" +
      "</aside>";
    document.body.appendChild(wrap);
  }
})();
