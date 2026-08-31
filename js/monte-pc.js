// Microcenter Informática — assistente "Monte seu PC"
(function () {
  "use strict";
  window.MC = window.MC || {};

  var USE_LABELS = {
    "uso-basico": "Uso básico (navegação, WhatsApp, vídeos)",
    "estudos-trabalho": "Estudos e trabalho (planilhas, aulas, home office)",
    "jogos-leves": "Jogos leves / eSports (Valorant, LoL, Free Fire)",
    "jogos-pesados": "Jogos pesados (AAA, alta configuração)",
    "edicao-video-design": "Edição de vídeo, foto ou design",
  };

  var SPECS = {
    "uso-basico": {
      minimo: ["Processador Intel Celeron/Pentium ou AMD equivalente", "4GB de memória RAM", "SSD 128GB", "Vídeo integrado"],
      recomendado: ["Intel Core i3 (10ª geração ou superior)", "8GB de memória RAM", "SSD 256GB", "Vídeo integrado"],
      ideal: ["Intel Core i5 recente", "8GB de memória RAM", "SSD 480GB", "Vídeo integrado"],
    },
    "estudos-trabalho": {
      minimo: ["Intel Core i3 / AMD Ryzen 3", "8GB de memória RAM", "SSD 256GB", "Vídeo integrado"],
      recomendado: ["Intel Core i5 / AMD Ryzen 5", "8GB a 16GB de memória RAM", "SSD 480GB", "Vídeo integrado"],
      ideal: ["Intel Core i5/i7 / AMD Ryzen 5/7", "16GB de memória RAM", "SSD 512GB ou mais", "Vídeo dedicado de entrada"],
    },
    "jogos-leves": {
      minimo: ["AMD Ryzen 5 / Intel Core i5", "8GB de memória RAM", "SSD 256GB", "Placa de vídeo de entrada (GTX 1650 ou similar)"],
      recomendado: ["AMD Ryzen 5 / Intel Core i5 recente", "16GB de memória RAM", "SSD 480GB", "Placa de vídeo GTX 1660 / RTX 3050 ou similar"],
      ideal: ["AMD Ryzen 7 / Intel Core i7", "16GB de memória RAM", "SSD 512GB ou mais", "Placa de vídeo RTX 4060 ou superior"],
    },
    "jogos-pesados": {
      minimo: ["AMD Ryzen 5 / Intel Core i5 recente", "16GB de memória RAM", "SSD 480GB", "Placa de vídeo RTX 3060 ou similar"],
      recomendado: ["AMD Ryzen 7 / Intel Core i7", "16GB a 32GB de memória RAM", "SSD 1TB", "Placa de vídeo RTX 4060 Ti / 4070"],
      ideal: ["AMD Ryzen 9 / Intel Core i9", "32GB de memória RAM", "SSD 1TB ou mais + fonte de alta capacidade", "Placa de vídeo RTX 4080 ou superior"],
    },
    "edicao-video-design": {
      minimo: ["AMD Ryzen 5 / Intel Core i5", "16GB de memória RAM", "SSD 480GB", "Placa de vídeo de entrada dedicada"],
      recomendado: ["AMD Ryzen 7 / Intel Core i7", "32GB de memória RAM", "SSD 1TB", "Placa de vídeo RTX 3060/4060 ou similar"],
      ideal: ["AMD Ryzen 9 / Intel Core i9", "32GB a 64GB de memória RAM", "SSD 1TB ou mais + monitor calibrado", "Placa de vídeo RTX 4070 ou superior"],
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.querySelector(".builder-shell");
    if (!root) return;

    var state = { uso: null, tipo: null, orcamento: null };
    var steps = Array.from(root.querySelectorAll(".builder-step"));
    var progressBars = Array.from(root.querySelectorAll(".builder-progress span"));
    var stepIndex = 0;

    function goTo(i, skipScroll) {
      steps.forEach((s, idx) => s.classList.toggle("active", idx === i));
      progressBars.forEach((p, idx) => p.classList.toggle("done", idx <= i));
      stepIndex = i;
      if (!skipScroll) {
        window.scrollTo({ top: root.offsetTop - 100, behavior: "smooth" });
      }
    }

    root.addEventListener("click", function (e) {
      var opt = e.target.closest(".option-card");
      if (opt) {
        var group = opt.closest(".builder-step");
        group.querySelectorAll(".option-card").forEach((c) => c.classList.remove("selected"));
        opt.classList.add("selected");
        var field = opt.getAttribute("data-field");
        state[field] = opt.getAttribute("data-value");
        var nextBtn = group.querySelector(".builder-next");
        if (nextBtn) nextBtn.disabled = false;
      }
      var next = e.target.closest(".builder-next");
      if (next && !next.disabled) {
        if (stepIndex === steps.length - 2) {
          renderResult();
        }
        goTo(Math.min(stepIndex + 1, steps.length - 1));
      }
      var back = e.target.closest(".builder-back");
      if (back) goTo(Math.max(stepIndex - 1, 0));
      var restart = e.target.closest(".builder-restart");
      if (restart) {
        state = { uso: null, tipo: null, orcamento: null };
        root.querySelectorAll(".option-card").forEach((c) => c.classList.remove("selected"));
        root.querySelectorAll(".builder-next").forEach((b) => (b.disabled = true));
        goTo(0);
      }
    });

    function specTierHtml(tiers) {
      function list(items) {
        return items.map((i) => "<li>" + i + "</li>").join("");
      }
      return (
        '<div class="spec-tiers">' +
        '<div class="spec-tier"><b>Mínimo</b><ul>' +
        list(tiers.minimo) +
        "</ul></div>" +
        '<div class="spec-tier"><b>Recomendado</b><ul>' +
        list(tiers.recomendado) +
        "</ul></div>" +
        '<div class="spec-tier"><b>Ideal</b><ul>' +
        list(tiers.ideal) +
        "</ul></div>" +
        "</div>"
      );
    }

    function renderResult() {
      var resultEl = root.querySelector(".builder-result");
      var tiers = SPECS[state.uso] || SPECS["estudos-trabalho"];
      var summary =
        '<div class="result-panel">' +
        "<h3>Configuração sugerida para: " +
        (USE_LABELS[state.uso] || "seu uso") +
        "</h3>" +
        specTierHtml(tiers) +
        "</div>";
      resultEl.innerHTML = summary + '<div class="match-wrap"><p>Buscando produtos cadastrados que combinam com esse perfil…</p></div>';

      MC.loadProdutos().then(function (produtos) {
        var tipoFiltro = state.tipo === "notebook" ? "notebooks" : state.tipo === "pc" ? "computadores" : null;
        var matches = produtos.filter(function (p) {
          var catMatch = tipoFiltro ? p.categoria === tipoFiltro : p.categoria === "computadores" || p.categoria === "notebooks";
          var usoMatch = Array.isArray(p.perfil_uso) && p.perfil_uso.indexOf(state.uso) !== -1;
          return catMatch && usoMatch;
        });

        var matchWrap = resultEl.querySelector(".match-wrap");
        if (matches.length) {
          matchWrap.innerHTML =
            "<h4>Temos opções em estoque para esse perfil:</h4>" +
            '<div class="match-list">' +
            matches.map(MC.productCard).join("") +
            "</div>";
        } else {
          var msg = buildOrcamentoMessage(tiers);
          matchWrap.innerHTML =
            '<div class="empty-state">' +
            "<h3>Nenhum modelo cadastrado nesse perfil no momento</h3>" +
            "<p>Mande as respostas direto pro WhatsApp da loja — a equipe monta uma configuração sob medida pra você.</p>" +
            '<a class="btn btn-accent" style="margin-top:16px" target="_blank" rel="noopener" href="' +
            MC.waLink(msg) +
            '">Solicitar orçamento no WhatsApp</a>' +
            "</div>";
        }
      });
    }

    function buildOrcamentoMessage(tiers) {
      var orcLabels = {
        "ate-2000": "até R$ 2.000",
        "2000-4000": "R$ 2.000 a R$ 4.000",
        "4000-7000": "R$ 4.000 a R$ 7.000",
        "acima-7000": "acima de R$ 7.000",
        "nao-sei": "ainda não sei / quero orientação",
      };
      var tipoLabels = { pc: "Computador de mesa", notebook: "Notebook", "tanto-faz": "Tanto faz (PC ou notebook)" };
      var lines = [
        "Olá! Fiz o assistente \"Monte seu PC\" no site e gostaria de um orçamento.",
        "",
        "Uso principal: " + (USE_LABELS[state.uso] || "-"),
        "Tipo de equipamento: " + (tipoLabels[state.tipo] || "-"),
        "Orçamento aproximado: " + (orcLabels[state.orcamento] || "-"),
        "",
        "Configuração recomendada sugerida pelo site:",
      ];
      tiers.recomendado.forEach(function (i) {
        lines.push("- " + i);
      });
      lines.push("", "Poderiam me ajudar a montar essa configuração?");
      return lines.join("\n");
    }

    goTo(0, true);
  });
})();
