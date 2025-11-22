class PlanejamentoManager {
   constructor() {
      this.objetivos = [];
      this.filtroAtual = "todos";
      this.init();
   }

   init() {
      this.loadData();
      this.setupEventListeners();
      this.renderizar();
      this.gerarInsights();
   }

   loadData() {
      const data = localStorage.getItem("financeAppPlanejamento");
      if (data) {
         try {
            this.objetivos = JSON.parse(data);
         } catch (error) {
            console.error("Erro ao carregar planejamento:", error);
            this.objetivos = [];
         }
      }

      if (this.objetivos.length === 0) {
         this.criarExemplo();
      }
   }

   saveData() {
      try {
         localStorage.setItem(
            "financeAppPlanejamento",
            JSON.stringify(this.objetivos)
         );
         console.log("Planejamento salvo");
      } catch (error) {
         console.error("Erro ao salvar:", error);
      }
   }

   criarExemplo() {
      const hoje = new Date();
      const exemplo = {
         id: Date.now(),
         nome: "Fundo de Emergência",
         descricao: "Reserva para imprevistos",
         icone: "🛡️",
         categoria: "curto_prazo",
         valor_meta: 10000,
         valor_atual: 3500,
         data_criacao: hoje.toISOString().split("T")[0],
         data_meta: new Date(
            hoje.getFullYear(),
            hoje.getMonth() + 6,
            hoje.getDate()
         )
            .toISOString()
            .split("T")[0],
         status: "ativo",
         aportes: [
            {
               id: Date.now() + 1,
               valor: 1500,
               data: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 15)
                  .toISOString()
                  .split("T")[0],
               descricao: "Aporte inicial",
            },
            {
               id: Date.now() + 2,
               valor: 1000,
               data: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 15)
                  .toISOString()
                  .split("T")[0],
               descricao: "Aporte mensal",
            },
            {
               id: Date.now() + 3,
               valor: 1000,
               data: new Date(hoje.getFullYear(), hoje.getMonth(), 15)
                  .toISOString()
                  .split("T")[0],
               descricao: "Aporte mensal",
            },
         ],
         estrategia: "equilibrada",
         criado_em: hoje.toISOString(),
      };

      this.objetivos.push(exemplo);
      this.saveData();
   }

   setupEventListeners() {
      document
         .getElementById("btnNovoObjetivo")
         ?.addEventListener("click", () => {
            this.abrirModalObjetivo();
         });

      document
         .getElementById("btnCalculadora")
         ?.addEventListener("click", () => {
            this.abrirCalculadora();
         });

      document.querySelectorAll(".filtro-btn").forEach((btn) => {
         btn.addEventListener("click", (e) => {
            document
               .querySelectorAll(".filtro-btn")
               .forEach((b) => b.classList.remove("active"));
            e.target.classList.add("active");
            this.filtroAtual = e.target.dataset.filtro;
            this.renderListaObjetivos();
         });
      });
   }

   renderizar() {
      this.renderResumo();
      this.renderListaObjetivos();
   }

   renderResumo() {
      const objetivosAtivos = this.objetivos.filter(
         (o) => o.status === "ativo"
      );
      const totalGuardado = this.objetivos.reduce(
         (acc, obj) => acc + obj.valor_atual,
         0
      );

      const progressoMedio =
         objetivosAtivos.length > 0
            ? objetivosAtivos.reduce((acc, obj) => {
                 return acc + (obj.valor_atual / obj.valor_meta) * 100;
              }, 0) / objetivosAtivos.length
            : 0;

      document.getElementById("totalObjetivos").textContent =
         objetivosAtivos.length;
      document.getElementById("totalGuardado").textContent =
         this.formatarMoeda(totalGuardado);
      document.getElementById("progressoMedio").textContent =
         progressoMedio.toFixed(1) + "%";
   }

   renderListaObjetivos() {
      const container = document.getElementById("objetivosLista");
      const empty = document.getElementById("planejamentoEmpty");

      if (!container) return;

      let objetivosFiltrados = [...this.objetivos];

      if (this.filtroAtual === "ativo") {
         objetivosFiltrados = objetivosFiltrados.filter(
            (o) => o.status === "ativo"
         );
      } else if (this.filtroAtual === "concluido") {
         objetivosFiltrados = objetivosFiltrados.filter(
            (o) => o.status === "concluido"
         );
      }

      if (objetivosFiltrados.length === 0) {
         container.innerHTML = "";
         if (empty) empty.style.display = "block";
         return;
      }

      if (empty) empty.style.display = "none";

      container.innerHTML = objetivosFiltrados
         .map((obj) => this.criarObjetivoHTML(obj))
         .join("");

      objetivosFiltrados.forEach((obj) => {
         const card = document.querySelector(`[data-objetivo-id="${obj.id}"]`);
         if (card) {
            card.addEventListener("click", (e) => {
               if (!e.target.closest(".objetivo-card__btn")) {
                  this.abrirDetalhes(obj.id);
               }
            });
         }
      });
   }

   criarObjetivoHTML(objetivo) {
      const progresso = (objetivo.valor_atual / objetivo.valor_meta) * 100;
      const progressoLimitado = Math.min(progresso, 100);
      const categoria = this.getCategoriaInfo(objetivo.categoria);
      const diasRestantes = this.calcularDiasRestantes(objetivo.data_meta);

      const isConcluido = objetivo.status === "concluido";

      return `
         <div class="objetivo-card ${
            isConcluido ? "objetivo-card--concluido" : ""
         }" data-objetivo-id="${objetivo.id}">
            <div class="objetivo-card__header">
               <div class="objetivo-card__info">
                  <div class="objetivo-card__icone">${objetivo.icone}</div>
                  <div class="objetivo-card__nome">${objetivo.nome}</div>
                  <div class="objetivo-card__categoria">${categoria.nome}</div>
               </div>
               <div class="objetivo-card__badge objetivo-card__badge--${
                  objetivo.status
               }">
                  ${isConcluido ? "✅ Concluído" : "🎯 Ativo"}
               </div>
            </div>

            <div class="objetivo-card__valores">
               <div class="objetivo-card__valor-atual">
                  ${this.formatarMoeda(objetivo.valor_atual)}
               </div>
               <div class="objetivo-card__valor-meta">
                  de ${this.formatarMoeda(objetivo.valor_meta)}
               </div>
            </div>

            <div class="objetivo-card__progresso">
               <div class="objetivo-card__progresso-barra">
                  <div class="objetivo-card__progresso-fill ${
                     isConcluido
                        ? "objetivo-card__progresso-fill--concluido"
                        : ""
                  }" 
                       style="width: ${progressoLimitado}%"></div>
               </div>
               <div class="objetivo-card__progresso-info">
                  <span>Faltam ${this.formatarMoeda(
                     Math.max(0, objetivo.valor_meta - objetivo.valor_atual)
                  )}</span>
                  <span class="objetivo-card__progresso-percentual">${progressoLimitado.toFixed(
                     1
                  )}%</span>
               </div>
            </div>

            <div class="objetivo-card__footer">
               <div class="objetivo-card__prazo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                     <circle cx="12" cy="12" r="10"></circle>
                     <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>${
                     isConcluido
                        ? "Concluído"
                        : diasRestantes > 0
                        ? `${diasRestantes} dias restantes`
                        : "Prazo vencido"
                  }</span>
               </div>
               <div class="objetivo-card__acoes">
                  ${
                     !isConcluido
                        ? `
                     <button class="objetivo-card__btn" onclick="planejamentoManager.abrirModalAporte(${objetivo.id}); event.stopPropagation();" title="Adicionar aporte">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                           <line x1="12" y1="5" x2="12" y2="19"></line>
                           <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                     </button>
                  `
                        : ""
                  }
                  <button class="objetivo-card__btn" onclick="planejamentoManager.editarObjetivo(${
                     objetivo.id
                  }); event.stopPropagation();" title="Editar">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                     </svg>
                  </button>
               </div>
            </div>
         </div>
      `;
   }

   getCategoriaInfo(categoria) {
      const categorias = {
         curto_prazo: { nome: "Curto Prazo", icone: "⚡" },
         medio_prazo: { nome: "Médio Prazo", icone: "📅" },
         longo_prazo: { nome: "Longo Prazo", icone: "🎯" },
      };
      return categorias[categoria] || categorias.medio_prazo;
   }

   calcularDiasRestantes(dataMeta) {
      const hoje = new Date();
      const meta = new Date(dataMeta + "T00:00:00");
      const diff = meta - hoje;
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
   }

   gerarInsights() {
      const container = document.getElementById("insightsContainer");
      if (!container) return;

      const insights = [];
      const objetivosAtivos = this.objetivos.filter(
         (o) => o.status === "ativo"
      );

      if (objetivosAtivos.length === 0) {
         container.innerHTML = "";
         return;
      }

      objetivosAtivos.forEach((obj) => {
         const diasRestantes = this.calcularDiasRestantes(obj.data_meta);
         const faltaGuardar = obj.valor_meta - obj.valor_atual;
         const progressoAtual = (obj.valor_atual / obj.valor_meta) * 100;

         if (diasRestantes < 30 && diasRestantes > 0 && progressoAtual < 90) {
            const valorMensal = faltaGuardar / (diasRestantes / 30);
            insights.push({
               tipo: "warning",
               icone: "⚠️",
               titulo: "Atenção: Meta Próxima!",
               texto: `Seu objetivo "${
                  obj.nome
               }" está próximo do prazo! Você precisa guardar aproximadamente ${this.formatarMoeda(
                  valorMensal
               )} por mês para atingir sua meta.`,
            });
         }

         if (progressoAtual >= 50 && progressoAtual < 75) {
            insights.push({
               tipo: "success",
               icone: "🎉",
               titulo: "Você está no caminho certo!",
               texto: `Parabéns! Você já conquistou ${progressoAtual.toFixed(
                  1
               )}% do objetivo "${obj.nome}". Continue assim!`,
            });
         }

         if (progressoAtual >= 90 && obj.status !== "concluido") {
            insights.push({
               tipo: "success",
               icone: "🏆",
               titulo: "Quase lá!",
               texto: `Falta muito pouco! Você está a apenas ${this.formatarMoeda(
                  faltaGuardar
               )} de completar "${obj.nome}".`,
            });
         }

         if (
            obj.aportes.length > 0 &&
            this.calcularMediaAportes(obj) > faltaGuardar / 3
         ) {
            insights.push({
               tipo: "info",
               icone: "💡",
               titulo: "Dica de Economia",
               texto: `Com sua média de aportes, você pode concluir "${
                  obj.nome
               }" em aproximadamente ${Math.ceil(
                  faltaGuardar / this.calcularMediaAportes(obj)
               )} meses!`,
            });
         }
      });

      if (insights.length === 0) {
         insights.push({
            tipo: "info",
            icone: "💪",
            titulo: "Continue firme!",
            texto: "Você está no controle das suas finanças. Mantenha seus aportes regulares e seus objetivos serão alcançados!",
         });
      }

      container.innerHTML = insights
         .slice(0, 3)
         .map(this.criarInsightHTML)
         .join("");
   }

   criarInsightHTML(insight) {
      return `
         <div class="insight-card insight-card--${insight.tipo}">
            <div class="insight-card__header">
               <span class="insight-card__icone">${insight.icone}</span>
               <h3 class="insight-card__titulo">${insight.titulo}</h3>
            </div>
            <p class="insight-card__texto">${insight.texto}</p>
         </div>
      `;
   }

   calcularMediaAportes(objetivo) {
      if (objetivo.aportes.length === 0) return 0;
      const total = objetivo.aportes.reduce((acc, a) => acc + a.valor, 0);
      return total / objetivo.aportes.length;
   }

   abrirModalObjetivo(objetivo = null) {
      const isEdit = objetivo !== null;
      const hoje = new Date().toISOString().split("T")[0];

      const modalHTML = `
         <div class="modal-overlay" onclick="if(event.target === this) planejamentoManager.fecharModal()">
            <div class="modal modal-objetivo">
               <div class="modal__header">
                  <h2 class="modal__title">${
                     isEdit ? "Editar" : "Novo"
                  } Objetivo</h2>
                  <button class="modal__close" onclick="planejamentoManager.fecharModal()">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                  </button>
               </div>
               <div class="modal__body">
                  <form class="form" id="formObjetivo">
                     <div class="form-group">
                        <label class="form-label form-label--required">Nome do Objetivo</label>
                        <input type="text" class="form-input" name="nome" 
                               placeholder="Ex: Viagem para Europa" 
                               value="${isEdit ? objetivo.nome : ""}" required>
                     </div>

                     <div class="form-group">
                        <label class="form-label">Descrição</label>
                        <textarea class="form-input" name="descricao" rows="3" 
                                  placeholder="Descreva seu objetivo...">${
                                     isEdit ? objetivo.descricao || "" : ""
                                  }</textarea>
                     </div>

                     <div class="form-group">
                        <label class="form-label form-label--required">Ícone</label>
                        <div class="icon-picker">
                           ${this.getIconesObjetivo(
                              isEdit ? objetivo.icone : "🎯"
                           )}
                        </div>
                        <input type="hidden" name="icone" value="${
                           isEdit ? objetivo.icone : "🎯"
                        }">
                     </div>

                     <div class="form-group">
                        <label class="form-label form-label--required">Categoria</label>
                        <select class="form-select" name="categoria" required>
                           <option value="curto_prazo" ${
                              isEdit && objetivo.categoria === "curto_prazo"
                                 ? "selected"
                                 : ""
                           }>⚡ Curto Prazo (até 6 meses)</option>
                           <option value="medio_prazo" ${
                              isEdit && objetivo.categoria === "medio_prazo"
                                 ? "selected"
                                 : ""
                           }>📅 Médio Prazo (6 meses a 2 anos)</option>
                           <option value="longo_prazo" ${
                              isEdit && objetivo.categoria === "longo_prazo"
                                 ? "selected"
                                 : ""
                           }>🎯 Longo Prazo (mais de 2 anos)</option>
                        </select>
                     </div>

                     <div class="form-group">
                        <label class="form-label form-label--required">Valor da Meta</label>
                        <div class="input-group">
                           <span class="input-prefix">R$</span>
                           <input type="number" class="form-input" name="valor_meta" 
                                  placeholder="0,00" step="0.01" 
                                  value="${
                                     isEdit ? objetivo.valor_meta : ""
                                  }" required>
                        </div>
                     </div>

                     ${
                        isEdit
                           ? `
                        <div class="form-group">
                           <label class="form-label">Valor Atual</label>
                           <div class="input-group">
                              <span class="input-prefix">R$</span>
                              <input type="number" class="form-input" name="valor_atual" 
                                     placeholder="0,00" step="0.01" 
                                     value="${objetivo.valor_atual}" readonly>
                           </div>
                           <p class="form-hint">Use o botão "Adicionar Aporte" para incrementar este valor</p>
                        </div>
                     `
                           : ""
                     }

                     <div class="form-group">
                        <label class="form-label form-label--required">Data Meta</label>
                        <input type="date" class="form-input" name="data_meta" 
                               value="${isEdit ? objetivo.data_meta : ""}" 
                               min="${hoje}" required>
                     </div>

                     <div class="form-group">
                        <label class="form-label">Estratégia de Economia</label>
                        <select class="form-select" name="estrategia">
                           <option value="agressiva" ${
                              isEdit && objetivo.estrategia === "agressiva"
                                 ? "selected"
                                 : ""
                           }>🚀 Agressiva (maior esforço)</option>
                           <option value="equilibrada" ${
                              isEdit && objetivo.estrategia === "equilibrada"
                                 ? "selected"
                                 : ""
                           }>⚖️ Equilibrada (recomendada)</option>
                           <option value="confortavel" ${
                              isEdit && objetivo.estrategia === "confortavel"
                                 ? "selected"
                                 : ""
                           }>😌 Confortável (menor pressão)</option>
                        </select>
                     </div>
                  </form>
               </div>
               <div class="modal__footer">
                  <button class="btn btn-secondary" onclick="planejamentoManager.fecharModal()">Cancelar</button>
                  <button class="btn btn-primary" onclick="planejamentoManager.salvarObjetivo(${
                     isEdit ? objetivo.id : "null"
                  })">
                     ${isEdit ? "Salvar" : "Criar Objetivo"}
                  </button>
               </div>
            </div>
         </div>
      `;

      document.getElementById("modalContainer").innerHTML = modalHTML;
      this.setupIconPicker();
   }

   getIconesObjetivo(selected) {
      const icones = [
         "🎯",
         "✈️",
         "🏠",
         "🚗",
         "💍",
         "🎓",
         "💻",
         "📱",
         "🏖️",
         "💰",
         "🛡️",
         "🎉",
         "🏋️",
         "🎸",
         "📚",
         "🎮",
         "⚡",
         "🌟",
         "💎",
         "🏆",
      ];

      return icones
         .map(
            (icone) => `
            <div class="icon-option ${
               icone === selected ? "selected" : ""
            }" data-icon="${icone}">
               ${icone}
            </div>
         `
         )
         .join("");
   }

   setupIconPicker() {
      document.querySelectorAll(".icon-option").forEach((option) => {
         option.addEventListener("click", (e) => {
            document
               .querySelectorAll(".icon-option")
               .forEach((opt) => opt.classList.remove("selected"));
            e.currentTarget.classList.add("selected");
            const modal = e.currentTarget.closest(".modal");
            modal.querySelector('input[name="icone"]').value =
               e.currentTarget.dataset.icon;
         });
      });
   }

   salvarObjetivo(id) {
      const form = document.getElementById("formObjetivo");

      if (!form.checkValidity()) {
         form.reportValidity();
         return;
      }

      const formData = new FormData(form);

      const objetivo = {
         nome: formData.get("nome"),
         descricao: formData.get("descricao"),
         icone: formData.get("icone"),
         categoria: formData.get("categoria"),
         valor_meta: parseFloat(formData.get("valor_meta")),
         data_meta: formData.get("data_meta"),
         estrategia: formData.get("estrategia"),
      };

      if (id) {
         const index = this.objetivos.findIndex((o) => o.id === id);
         if (index !== -1) {
            this.objetivos[index] = {
               ...this.objetivos[index],
               ...objetivo,
            };
         }
      } else {
         const hoje = new Date();
         objetivo.id = Date.now();
         objetivo.valor_atual = 0;
         objetivo.data_criacao = hoje.toISOString().split("T")[0];
         objetivo.status = "ativo";
         objetivo.aportes = [];
         objetivo.criado_em = hoje.toISOString();

         this.objetivos.push(objetivo);
      }

      this.saveData();
      this.fecharModal();
      this.renderizar();
      this.gerarInsights();
   }

   abrirModalAporte(objetivoId) {
      const objetivo = this.objetivos.find((o) => o.id === objetivoId);
      if (!objetivo) return;

      const hoje = new Date().toISOString().split("T")[0];
      const faltaGuardar = objetivo.valor_meta - objetivo.valor_atual;

      const modalHTML = `
         <div class="modal-overlay" onclick="if(event.target === this) planejamentoManager.fecharModal()">
            <div class="modal modal-aporte">
               <div class="modal__header">
                  <h2 class="modal__title">Adicionar Aporte</h2>
                  <button class="modal__close" onclick="planejamentoManager.fecharModal()">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                  </button>
               </div>
               <div class="modal__body">
                  <div style="text-align: center; margin-bottom: 20px;">
                     <div style="font-size: 48px; margin-bottom: 12px;">${
                        objetivo.icone
                     }</div>
                     <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${
                        objetivo.nome
                     }</h3>
                     <p style="font-size: 14px; color: var(--text-secondary);">
                        Faltam ${this.formatarMoeda(faltaGuardar)} para sua meta
                     </p>
                  </div>

                  <form class="form" id="formAporte">
                     <div class="form-group">
                        <label class="form-label form-label--required">Valor do Aporte</label>
                        <div class="input-group">
                           <span class="input-prefix">R$</span>
                           <input type="number" class="form-input" name="valor" id="valorAporte"
                                  placeholder="0,00" step="0.01" required>
                        </div>
                     </div>

                     <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px;">
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('valorAporte').value = 50">R$ 50</button>
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('valorAporte').value = 100">R$ 100</button>
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('valorAporte').value = 200">R$ 200</button>
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('valorAporte').value = 500">R$ 500</button>
                     </div>

                     <div class="form-group">
                        <label class="form-label form-label--required">Data</label>
                        <input type="date" class="form-input" name="data" 
                               value="${hoje}" max="${hoje}" required>
                     </div>

                     <div class="form-group">
                        <label class="form-label">Descrição</label>
                        <input type="text" class="form-input" name="descricao" 
                               placeholder="Ex: Aporte mensal">
                     </div>
                  </form>

                  <div class="dica-card">
                     <div class="dica-card__header">
                        <span class="dica-card__icone">💡</span>
                        <span class="dica-card__titulo">Dica</span>
                     </div>
                     <p class="dica-card__texto">
                        Aportes regulares, mesmo que pequenos, fazem grande diferença no longo prazo!
                     </p>
                  </div>
               </div>
               <div class="modal__footer">
                  <button class="btn btn-secondary" onclick="planejamentoManager.fecharModal()">Cancelar</button>
                  <button class="btn btn-primary" onclick="planejamentoManager.salvarAporte(${objetivoId})">
                     Adicionar Aporte
                  </button>
               </div>
            </div>
         </div>
      `;

      document.getElementById("modalContainer").innerHTML = modalHTML;
   }

   salvarAporte(objetivoId) {
      const form = document.getElementById("formAporte");

      if (!form.checkValidity()) {
         form.reportValidity();
         return;
      }

      const formData = new FormData(form);
      const valor = parseFloat(formData.get("valor"));

      const objetivo = this.objetivos.find((o) => o.id === objetivoId);
      if (!objetivo) return;

      const aporte = {
         id: Date.now(),
         valor: valor,
         data: formData.get("data"),
         descricao: formData.get("descricao") || "Aporte",
      };

      objetivo.aportes.push(aporte);
      objetivo.valor_atual += valor;

      if (objetivo.valor_atual >= objetivo.valor_meta) {
         objetivo.status = "concluido";
         this.saveData();
         this.fecharModal();
         this.mostrarCelebracao(objetivo);
      } else {
         this.saveData();
         this.fecharModal();
         this.renderizar();
         this.gerarInsights();
      }
   }

   mostrarCelebracao(objetivo) {
      const totalAportes = objetivo.aportes.length;
      const diasLevados = Math.ceil(
         (new Date() - new Date(objetivo.data_criacao)) / (1000 * 60 * 60 * 24)
      );

      const modalHTML = `
         <div class="modal-overlay" onclick="if(event.target === this) planejamentoManager.fecharModal()">
            <div class="modal">
               <div class="modal__body celebracao-modal">
                  <div class="celebracao-icone">🎉</div>
                  <h2 class="celebracao-titulo">Parabéns! Objetivo Concluído!</h2>
                  <p class="celebracao-texto">
                     Você alcançou seu objetivo "${objetivo.nome}"! 
                     Isso mostra sua disciplina e comprometimento com suas metas financeiras.
                  </p>

                  <div class="celebracao-stats">
                     <div class="celebracao-stat">
                        <div class="celebracao-stat__label">Total Guardado</div>
                        <div class="celebracao-stat__valor">${this.formatarMoeda(
                           objetivo.valor_atual
                        )}</div>
                     </div>
                     <div class="celebracao-stat">
                        <div class="celebracao-stat__label">Aportes Realizados</div>
                        <div class="celebracao-stat__valor">${totalAportes}</div>
                     </div>
                     <div class="celebracao-stat">
                        <div class="celebracao-stat__label">Dias Investidos</div>
                        <div class="celebracao-stat__valor">${diasLevados}</div>
                     </div>
                     <div class="celebracao-stat">
                        <div class="celebracao-stat__label">Média por Aporte</div>
                        <div class="celebracao-stat__valor">${this.formatarMoeda(
                           objetivo.valor_atual / totalAportes
                        )}</div>
                     </div>
                  </div>

                  <button class="btn btn-primary" onclick="planejamentoManager.fecharModalCelebracao()">
                     Continuar Planejando
                  </button>
               </div>
            </div>
         </div>
      `;

      document.getElementById("modalContainer").innerHTML = modalHTML;
   }

   fecharModalCelebracao() {
      this.fecharModal();
      this.renderizar();
      this.gerarInsights();
   }

   abrirCalculadora() {
      const modalHTML = `
         <div class="modal-overlay" onclick="if(event.target === this) planejamentoManager.fecharModal()">
            <div class="modal modal-calculadora">
               <div class="modal__header">
                  <h2 class="modal__title">💡 Calculadora Inteligente</h2>
                  <button class="modal__close" onclick="planejamentoManager.fecharModal()">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                  </button>
               </div>
               <div class="modal__body">
                  <div id="resultadoCalculadora" style="display: none;">
                     <div class="calculadora-resultado">
                        <div class="calculadora-resultado__label">Você precisa guardar mensalmente</div>
                        <div class="calculadora-resultado__valor" id="valorMensal">R$ 0,00</div>
                        <div class="calculadora-resultado__descricao" id="descricaoResultado"></div>
                     </div>
                  </div>

                  <form class="form" id="formCalculadora">
                     <div class="form-group">
                        <label class="form-label form-label--required">Quanto você quer guardar?</label>
                        <div class="input-group">
                           <span class="input-prefix">R$</span>
                           <input type="number" class="form-input" name="valor_meta" id="calcValorMeta"
                                  placeholder="0,00" step="0.01" required>
                        </div>
                     </div>

                     <div class="form-group">
                        <label class="form-label form-label--required">Em quanto tempo?</label>
                        <select class="form-select" name="prazo" id="calcPrazo" required>
                           <option value="">Selecione o prazo</option>
                           <option value="3">3 meses</option>
                           <option value="6">6 meses</option>
                           <option value="12">1 ano</option>
                           <option value="18">1 ano e meio</option>
                           <option value="24">2 anos</option>
                           <option value="36">3 anos</option>
                           <option value="48">4 anos</option>
                           <option value="60">5 anos</option>
                        </select>
                     </div>

                     <div class="form-group">
                        <label class="form-label">Você já tem algum valor guardado?</label>
                        <div class="input-group">
                           <span class="input-prefix">R$</span>
                           <input type="number" class="form-input" name="valor_inicial" id="calcValorInicial"
                                  placeholder="0,00" step="0.01" value="0">
                        </div>
                     </div>

                     <button type="button" class="btn btn-primary" style="width: 100%;" onclick="planejamentoManager.calcular()">
                        Calcular
                     </button>
                  </form>

                  <div id="estrategiasContainer" style="display: none; margin-top: 24px;">
                     <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">
                        Estratégias Personalizadas
                     </h3>
                     <div id="estrategiasList"></div>
                  </div>

                  <div style="margin-top: 24px;">
                     <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                        💡 Dicas para Guardar Dinheiro
                     </h3>
                     <div class="dica-card">
                        <div class="dica-card__header">
                           <span class="dica-card__icone">1️⃣</span>
                           <span class="dica-card__titulo">Automatize seus aportes</span>
                        </div>
                        <p class="dica-card__texto">
                           Configure transferências automáticas logo após receber seu salário
                        </p>
                     </div>
                     <div class="dica-card">
                        <div class="dica-card__header">
                           <span class="dica-card__icone">2️⃣</span>
                           <span class="dica-card__titulo">Comece pequeno</span>
                        </div>
                        <p class="dica-card__texto">
                           Mesmo R$ 50 por mês fazem diferença. O importante é criar o hábito
                        </p>
                     </div>
                     <div class="dica-card">
                        <div class="dica-card__header">
                           <span class="dica-card__icone">3️⃣</span>
                           <span class="dica-card__titulo">Revise gastos desnecessários</span>
                        </div>
                        <p class="dica-card__texto">
                           Avalie assinaturas não utilizadas e pequenos gastos do dia a dia
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      `;

      document.getElementById("modalContainer").innerHTML = modalHTML;
   }

   calcular() {
      const valorMeta = parseFloat(
         document.getElementById("calcValorMeta").value
      );
      const prazo = parseInt(document.getElementById("calcPrazo").value);
      const valorInicial = parseFloat(
         document.getElementById("calcValorInicial").value || 0
      );

      if (!valorMeta || !prazo) {
         alert("Preencha todos os campos obrigatórios");
         return;
      }

      const valorRestante = valorMeta - valorInicial;
      const valorMensal = valorRestante / prazo;

      document.getElementById("valorMensal").textContent =
         this.formatarMoeda(valorMensal);
      document.getElementById(
         "descricaoResultado"
      ).textContent = `Para atingir ${this.formatarMoeda(
         valorMeta
      )} em ${prazo} meses`;
      document.getElementById("resultadoCalculadora").style.display = "block";

      const estrategias = [
         {
            nome: "Economia Agressiva",
            icone: "🚀",
            multiplicador: 1.3,
            descricao: "Guarde um pouco mais para concluir antes do prazo",
         },
         {
            nome: "Economia Equilibrada",
            icone: "⚖️",
            multiplicador: 1.0,
            descricao: "Valor ideal calculado para seu prazo",
         },
         {
            nome: "Economia Confortável",
            icone: "😌",
            multiplicador: 0.75,
            descricao: "Valor menor com prazo um pouco mais flexível",
         },
      ];

      const estrategiasHTML = estrategias
         .map(
            (est) => `
         <div class="estrategia-card">
            <div class="estrategia-card__header">
               <span class="estrategia-card__icone">${est.icone}</span>
               <span class="estrategia-card__titulo">${est.nome}</span>
            </div>
            <p class="estrategia-card__descricao">${est.descricao}</p>
            <div class="estrategia-card__valor">
               ${this.formatarMoeda(valorMensal * est.multiplicador)}/mês
            </div>
         </div>
      `
         )
         .join("");

      document.getElementById("estrategiasList").innerHTML = estrategiasHTML;
      document.getElementById("estrategiasContainer").style.display = "block";
   }

   abrirDetalhes(objetivoId) {
      const objetivo = this.objetivos.find((o) => o.id === objetivoId);
      if (!objetivo) return;

      const progresso = (objetivo.valor_atual / objetivo.valor_meta) * 100;
      const diasRestantes = this.calcularDiasRestantes(objetivo.data_meta);
      const categoria = this.getCategoriaInfo(objetivo.categoria);

      const aportes = objetivo.aportes
         .sort((a, b) => new Date(b.data) - new Date(a.data))
         .map(
            (aporte) => `
         <div class="aporte-item">
            <div class="aporte-item__info">
               <div class="aporte-item__data">${this.formatarData(
                  aporte.data
               )}</div>
               <div class="aporte-item__descricao">${aporte.descricao}</div>
            </div>
            <div class="aporte-item__valor">+${this.formatarMoeda(
               aporte.valor
            )}</div>
         </div>
      `
         )
         .join("");

      const modalHTML = `
         <div class="modal-overlay" onclick="if(event.target === this) planejamentoManager.fecharModal()">
            <div class="modal modal-objetivo">
               <div class="modal__header">
                  <h2 class="modal__title">Detalhes do Objetivo</h2>
                  <button class="modal__close" onclick="planejamentoManager.fecharModal()">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                  </button>
               </div>
               <div class="modal__body">
                  <div style="text-align: center; margin-bottom: 24px;">
                     <div style="font-size: 64px; margin-bottom: 12px;">${
                        objetivo.icone
                     }</div>
                     <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">${
                        objetivo.nome
                     }</h3>
                     <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">
                        ${categoria.icone} ${categoria.nome}
                     </p>
                     ${
                        objetivo.descricao
                           ? `<p style="font-size: 14px; color: var(--text-secondary);">${objetivo.descricao}</p>`
                           : ""
                     }
                  </div>

                  <div style="background: var(--bg-secondary); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                     <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                        <div>
                           <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Guardado</div>
                           <div style="font-size: 20px; font-weight: 700; color: var(--primary-color);">
                              ${this.formatarMoeda(objetivo.valor_atual)}
                           </div>
                        </div>
                        <div>
                           <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Meta</div>
                           <div style="font-size: 20px; font-weight: 700;">
                              ${this.formatarMoeda(objetivo.valor_meta)}
                           </div>
                        </div>
                        <div>
                           <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Progresso</div>
                           <div style="font-size: 20px; font-weight: 700; color: var(--success-color);">
                              ${progresso.toFixed(1)}%
                           </div>
                        </div>
                        <div>
                           <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
                              ${
                                 objetivo.status === "concluido"
                                    ? "Concluído em"
                                    : "Tempo Restante"
                              }
                           </div>
                           <div style="font-size: 20px; font-weight: 700;">
                              ${
                                 objetivo.status === "concluido"
                                    ? this.formatarData(
                                         objetivo.aportes[
                                            objetivo.aportes.length - 1
                                         ].data
                                      )
                                    : diasRestantes > 0
                                    ? `${diasRestantes} dias`
                                    : "Vencido"
                              }
                           </div>
                        </div>
                     </div>
                  </div>

                  <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                     Histórico de Aportes
                  </h4>
                  ${
                     objetivo.aportes.length > 0
                        ? `<div class="historico-aportes">${aportes}</div>`
                        : '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">Nenhum aporte realizado ainda</p>'
                  }
               </div>
               <div class="modal__footer">
                  <button class="btn btn-secondary" onclick="planejamentoManager.fecharModal()">Fechar</button>
                  ${
                     objetivo.status !== "concluido"
                        ? `
                     <button class="btn btn-primary" onclick="planejamentoManager.abrirModalAporte(${objetivo.id})">
                        Adicionar Aporte
                     </button>
                  `
                        : ""
                  }
               </div>
            </div>
         </div>
      `;

      document.getElementById("modalContainer").innerHTML = modalHTML;
   }

   editarObjetivo(objetivoId) {
      const objetivo = this.objetivos.find((o) => o.id === objetivoId);
      if (objetivo) {
         this.abrirModalObjetivo(objetivo);
      }
   }

   fecharModal() {
      document.getElementById("modalContainer").innerHTML = "";
   }

   formatarMoeda(valor) {
      return new Intl.NumberFormat("pt-BR", {
         style: "currency",
         currency: "BRL",
      }).format(valor);
   }

   formatarData(data) {
      const d = new Date(data + "T00:00:00");
      return d.toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "short",
         year: "numeric",
      });
   }
}

document.addEventListener("DOMContentLoaded", () => {
   window.planejamentoManager = new PlanejamentoManager();
});
