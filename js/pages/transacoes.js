class TransacoesManager {
   constructor() {
      this.transacoes = [];
      this.categorias = [];
      this.cartoes = [];
      this.contas = [];
      this.filtros = {
         periodo: "mes-atual",
         tipo: "todos",
         status: "todos",
         categoria: "todas",
         metodo: "todos",
         ordem: "data-desc",
      };

      this.init();
   }

   init() {
      this.loadData();
      this.setupEventListeners();
      this.carregarCategorias();
      this.renderizar();
   }

   loadData() {
      const transacoesData = localStorage.getItem("financeAppTransacoes");
      if (transacoesData) {
         try {
            this.transacoes = JSON.parse(transacoesData);
            this.atualizarStatus();
         } catch (error) {
            console.error("Erro ao carregar transações:", error);
            this.transacoes = [];
         }
      }

      const cadastrosData = localStorage.getItem("financeAppCadastros");
      if (cadastrosData) {
         try {
            const cadastros = JSON.parse(cadastrosData);
            this.categorias = cadastros.categorias || [];
            this.cartoes = cadastros.cartoes || [];
            this.contas = cadastros.contas || [];
         } catch (error) {
            console.error("Erro ao carregar cadastros:", error);
         }
      }

      if (this.transacoes.length === 0) {
         this.criarExemplos();
      }
   }

   saveData() {
      try {
         localStorage.setItem(
            "financeAppTransacoes",
            JSON.stringify(this.transacoes)
         );
         console.log("Transações salvas");

         window.dispatchEvent(new CustomEvent("transacoesAtualizadas"));
      } catch (error) {
         console.error("Erro ao salvar:", error);
      }
   }

   criarExemplos() {
      const hoje = new Date();
      const exemplos = [
         {
            id: Date.now() + 1,
            tipo: "receita",
            descricao: "Salário",
            valor: 5200.0,
            valorPago: 5200.0,
            categoria_id:
               this.categorias.find((c) => c.nome === "Salário")?.id || null,
            data_vencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 5)
               .toISOString()
               .split("T")[0],
            data_pagamento: new Date(hoje.getFullYear(), hoje.getMonth(), 5)
               .toISOString()
               .split("T")[0],
            status: "pago",
            metodo_pagamento: "transferencia",
            conta_id: this.contas[0]?.id || null,
            parcelado: false,
            recorrente: true,
            tipo_recorrencia: "mensal",
            tags: [],
            observacoes: "",
            criado_em: new Date().toISOString(),
         },
         {
            id: Date.now() + 2,
            tipo: "despesa",
            descricao: "Conta de Luz",
            valor: 180.5,
            valorPago: null,
            categoria_id:
               this.categorias.find((c) => c.tipo === "despesa")?.id || null,
            data_vencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 15)
               .toISOString()
               .split("T")[0],
            data_pagamento: null,
            status: "pendente",
            metodo_pagamento: "boleto",
            conta_id: null,
            parcelado: false,
            recorrente: true,
            tipo_recorrencia: "mensal",
            tags: [],
            observacoes: "Conta recorrente",
            criado_em: new Date().toISOString(),
         },
         {
            id: Date.now() + 3,
            tipo: "despesa",
            descricao: "Supermercado",
            valor: 450.0,
            valorPago: 450.0,
            categoria_id:
               this.categorias.find((c) => c.nome === "Alimentação")?.id ||
               null,
            data_vencimento: new Date(
               hoje.getFullYear(),
               hoje.getMonth(),
               hoje.getDate() - 2
            )
               .toISOString()
               .split("T")[0],
            data_pagamento: new Date(
               hoje.getFullYear(),
               hoje.getMonth(),
               hoje.getDate() - 2
            )
               .toISOString()
               .split("T")[0],
            status: "pago",
            metodo_pagamento: "debito",
            cartao_id: this.cartoes[0]?.id || null,
            parcelado: false,
            recorrente: false,
            tags: [],
            observacoes: "",
            criado_em: new Date().toISOString(),
         },
      ];

      this.transacoes = exemplos;
      this.saveData();
   }

   atualizarStatus() {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      this.transacoes.forEach((transacao) => {
         if (
            transacao.valorPago !== null &&
            transacao.valorPago !== undefined
         ) {
            transacao.status = "pago";
            return;
         }

         const vencimento = new Date(transacao.data_vencimento + "T00:00:00");
         vencimento.setHours(0, 0, 0, 0);

         if (vencimento < hoje) {
            transacao.status = "atrasado";
         } else if (vencimento.getTime() === hoje.getTime()) {
            transacao.status = "pendente";
         } else {
            transacao.status = "agendado";
         }
      });
   }

   setupEventListeners() {
      document
         .getElementById("btnNovaTransacao")
         ?.addEventListener("click", () => {
            this.abrirModalNovaTransacao();
         });

      document
         .getElementById("filtrosToggle")
         ?.addEventListener("click", () => {
            this.toggleFiltros();
         });

      document
         .getElementById("btnAplicarFiltros")
         ?.addEventListener("click", () => {
            this.aplicarFiltros();
         });

      document
         .getElementById("btnLimparFiltros")
         ?.addEventListener("click", () => {
            this.limparFiltros();
         });
   }

   toggleFiltros() {
      const content = document.getElementById("filtrosContent");
      const icon = document.querySelector(".filtros__toggle-icon");

      if (content && icon) {
         content.classList.toggle("active");
         icon.classList.toggle("active");
      }
   }

   aplicarFiltros() {
      this.filtros.periodo = document.getElementById("filtroPeriodo").value;
      this.filtros.tipo = document.getElementById("filtroTipo").value;
      this.filtros.status = document.getElementById("filtroStatus").value;
      this.filtros.categoria = document.getElementById("filtroCategoria").value;
      this.filtros.metodo = document.getElementById("filtroMetodo").value;
      this.filtros.ordem = document.getElementById("filtroOrdem").value;

      this.renderizar();
   }

   limparFiltros() {
      this.filtros = {
         periodo: "mes-atual",
         tipo: "todos",
         status: "todos",
         categoria: "todas",
         metodo: "todos",
         ordem: "data-desc",
      };

      document.getElementById("filtroPeriodo").value = "mes-atual";
      document.getElementById("filtroTipo").value = "todos";
      document.getElementById("filtroStatus").value = "todos";
      document.getElementById("filtroCategoria").value = "todas";
      document.getElementById("filtroMetodo").value = "todos";
      document.getElementById("filtroOrdem").value = "data-desc";

      this.renderizar();
   }

   aplicarFiltrosInternos() {
      let resultado = [...this.transacoes];

      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      switch (this.filtros.periodo) {
         case "mes-atual":
            resultado = resultado.filter((t) => {
               const data = new Date(t.data_vencimento + "T00:00:00");
               return data >= primeiroDiaMes && data <= ultimoDiaMes;
            });
            break;
         case "mes-anterior":
            const primeiroDiaMesAnterior = new Date(
               hoje.getFullYear(),
               hoje.getMonth() - 1,
               1
            );
            const ultimoDiaMesAnterior = new Date(
               hoje.getFullYear(),
               hoje.getMonth(),
               0
            );
            resultado = resultado.filter((t) => {
               const data = new Date(t.data_vencimento + "T00:00:00");
               return (
                  data >= primeiroDiaMesAnterior && data <= ultimoDiaMesAnterior
               );
            });
            break;
      }

      if (this.filtros.tipo !== "todos") {
         resultado = resultado.filter((t) => t.tipo === this.filtros.tipo);
      }

      if (this.filtros.status !== "todos") {
         resultado = resultado.filter((t) => t.status === this.filtros.status);
      }

      resultado.sort((a, b) => {
         switch (this.filtros.ordem) {
            case "data-desc":
               return new Date(b.data_vencimento) - new Date(a.data_vencimento);
            case "data-asc":
               return new Date(a.data_vencimento) - new Date(b.data_vencimento);
            case "valor-desc":
               return b.valor - a.valor;
            case "valor-asc":
               return a.valor - b.valor;
            default:
               return 0;
         }
      });

      return resultado;
   }

   renderizar() {
      this.atualizarStatus();
      this.renderResumo();
      this.renderLista();
   }

   renderResumo() {
      const transacoesFiltradas = this.aplicarFiltrosInternos();

      let totalReceitas = 0;
      let totalDespesas = 0;

      transacoesFiltradas.forEach((t) => {
         const valor = t.valorPago !== null ? t.valorPago : t.valor;
         if (t.tipo === "receita") {
            totalReceitas += valor;
         } else {
            totalDespesas += valor;
         }
      });

      const saldo = totalReceitas - totalDespesas;

      document.getElementById("resumoReceitas").textContent =
         this.formatarMoeda(totalReceitas);
      document.getElementById("resumoDespesas").textContent =
         this.formatarMoeda(totalDespesas);
      document.getElementById("resumoSaldo").textContent =
         this.formatarMoeda(saldo);
   }

   renderLista() {
      const container = document.getElementById("transacoesLista");
      const empty = document.getElementById("transacoesEmpty");

      if (!container) return;

      container.innerHTML = "";

      const transacoesFiltradas = this.aplicarFiltrosInternos();

      if (transacoesFiltradas.length === 0) {
         if (empty) empty.style.display = "block";
         return;
      }

      if (empty) empty.style.display = "none";

      const grupos = this.agruparPorMes(transacoesFiltradas);

      grupos.forEach((grupo) => {
         const grupoEl = this.criarGrupoHTML(grupo);
         container.appendChild(grupoEl);
      });
   }

   agruparPorMes(transacoes) {
      const grupos = {};

      transacoes.forEach((t) => {
         const data = new Date(t.data_vencimento + "T00:00:00");
         const chave = `${data.getFullYear()}-${String(
            data.getMonth() + 1
         ).padStart(2, "0")}`;

         if (!grupos[chave]) {
            grupos[chave] = {
               data: data,
               transacoes: [],
            };
         }

         grupos[chave].transacoes.push(t);
      });

      return Object.values(grupos).sort((a, b) => b.data - a.data);
   }

   criarGrupoHTML(grupo) {
      const grupoDiv = document.createElement("div");
      grupoDiv.className = "transacoes-grupo";

      grupoDiv.innerHTML = `
         <div class="transacoes-grupo__header">
            <div class="transacoes-grupo__data">${this.formatarMesAno(
               grupo.data
            )}</div>
            <div class="transacoes-grupo__total">${
               grupo.transacoes.length
            } transações</div>
         </div>
      `;

      grupo.transacoes.forEach((t) => {
         const itemEl = this.criarTransacaoHTML(t);
         grupoDiv.appendChild(itemEl);
      });

      return grupoDiv;
   }

   criarTransacaoHTML(transacao) {
      const div = document.createElement("div");
      div.className = `transacao-item transacao-item--${transacao.tipo}`;

      if (transacao.status === "pago") {
         div.classList.add("transacao-item--pago");
      }

      const categoria = this.categorias.find(
         (c) => c.id === transacao.categoria_id
      );
      const statusInfo = this.getStatusInfo(transacao.status);

      div.innerHTML = `
         <div class="transacao-item__header">
            <div class="transacao-item__info">
               <div class="transacao-item__descricao">${
                  transacao.descricao
               }</div>
               <div class="transacao-item__categoria">
                  ${
                     categoria
                        ? `<span class="transacao-item__categoria-icone">${categoria.icone}</span>`
                        : ""
                  }
                  <span>${categoria ? categoria.nome : "Sem categoria"}</span>
               </div>
            </div>
            <div class="transacao-item__valor transacao-item__valor--${
               transacao.tipo
            }">
               ${transacao.tipo === "despesa" ? "-" : "+"} ${this.formatarMoeda(
         transacao.valorPago !== null ? transacao.valorPago : transacao.valor
      )}
            </div>
         </div>
         <div class="transacao-item__footer">
            <div class="transacao-item__detalhes">
               <div class="transacao-item__detalhe">
                  <span class="transacao-item__detalhe-icone">📅</span>
                  <span>${this.formatarData(transacao.data_vencimento)}</span>
               </div>
               <div class="transacao-item__detalhe">
                  <span class="transacao-item__detalhe-icone">${this.getMetodoIcone(
                     transacao.metodo_pagamento
                  )}</span>
                  <span>${this.getMetodoNome(transacao.metodo_pagamento)}</span>
               </div>
            </div>
            <div class="transacao-item__status transacao-item__status--${
               transacao.status
            }">
               <span>${statusInfo.icone}</span>
               <span>${statusInfo.nome}</span>
            </div>
         </div>
      `;

      div.addEventListener("click", () => {
         this.abrirModalTransacao(transacao);
      });

      return div;
   }

   getStatusInfo(status) {
      const statusMap = {
         pendente: { nome: "Pendente", icone: "⏳" },
         pago: { nome: "Pago", icone: "✅" },
         atrasado: { nome: "Atrasado", icone: "⚠️" },
         agendado: { nome: "Agendado", icone: "📌" },
      };
      return statusMap[status] || statusMap["pendente"];
   }

   getMetodoIcone(metodo) {
      const metodoMap = {
         debito: "💳",
         credito: "💳",
         pix: "📱",
         boleto: "📄",
         dinheiro: "💵",
         transferencia: "🏦",
      };
      return metodoMap[metodo] || "💰";
   }

   getMetodoNome(metodo) {
      const metodoMap = {
         debito: "Débito",
         credito: "Crédito",
         pix: "PIX",
         boleto: "Boleto",
         dinheiro: "Dinheiro",
         transferencia: "Transferência",
      };
      return metodoMap[metodo] || metodo;
   }

   carregarCategorias() {
      const select = document.getElementById("filtroCategoria");
      if (!select) return;

      select.innerHTML = '<option value="todas">Todas</option>';

      this.categorias.forEach((cat) => {
         const option = document.createElement("option");
         option.value = cat.id;
         option.textContent = `${cat.icone} ${cat.nome}`;
         select.appendChild(option);
      });
   }

   abrirModalNovaTransacao(transacao = null) {
      const isEdit = transacao !== null;
      const hoje = new Date().toISOString().split("T")[0];

      const modalHTML = `
         <div class="modal-overlay" onclick="if(event.target === this) transacoesManager.fecharModal()">
            <div class="modal modal-transacao">
               <div class="modal__header">
                  <h2 class="modal__title">${
                     isEdit ? "Editar" : "Nova"
                  } Transação</h2>
                  <button class="modal__close" onclick="transacoesManager.fecharModal()">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                  </button>
               </div>
               <div class="modal__body">
                  <form class="form" id="formTransacao">
                     <div class="form-group">
                        <label class="form-label form-label--required">Tipo</label>
                        <select class="form-select" name="tipo" id="tipoTransacao" required>
                           <option value="despesa" ${
                              isEdit && transacao.tipo === "despesa"
                                 ? "selected"
                                 : ""
                           }>Despesa</option>
                           <option value="receita" ${
                              isEdit && transacao.tipo === "receita"
                                 ? "selected"
                                 : ""
                           }>Receita</option>
                        </select>
                     </div>

                     <div class="form-group">
                        <label class="form-label form-label--required">Descrição</label>
                        <input type="text" class="form-input" name="descricao" 
                               placeholder="Ex: Conta de Luz" 
                               value="${
                                  isEdit ? transacao.descricao : ""
                               }" required>
                     </div>

                     <div class="form-group">
                        <label class="form-label form-label--required">Valor</label>
                        <div class="input-group">
                           <span class="input-prefix">R$</span>
                           <input type="number" class="form-input" name="valor" 
                                  placeholder="0,00" step="0.01" 
                                  value="${
                                     isEdit ? transacao.valor : ""
                                  }" required>
                        </div>
                     </div>

                     <div class="form-group">
                        <label class="form-label form-label--required">Data de Vencimento</label>
                        <input type="date" class="form-input" name="data_vencimento" 
                               value="${
                                  isEdit ? transacao.data_vencimento : hoje
                               }" required>
                     </div>

                     <div class="form-group">
                        <label class="form-label form-label--required">Categoria</label>
                        <select class="form-select" name="categoria_id" required>
                           <option value="">Selecione uma categoria</option>
                           ${this.categorias
                              .map(
                                 (cat) => `
                              <option value="${cat.id}" ${
                                    isEdit && transacao.categoria_id === cat.id
                                       ? "selected"
                                       : ""
                                 }>
                                 ${cat.icone} ${cat.nome}
                              </option>
                           `
                              )
                              .join("")}
                        </select>
                     </div>

                     <div class="form-group">
                        <label class="form-label form-label--required">Método de Pagamento</label>
                        <select class="form-select" name="metodo_pagamento" id="metodoPagamento" required>
                           <option value="debito" ${
                              isEdit && transacao.metodo_pagamento === "debito"
                                 ? "selected"
                                 : ""
                           }>💳 Débito</option>
                           <option value="credito" ${
                              isEdit && transacao.metodo_pagamento === "credito"
                                 ? "selected"
                                 : ""
                           }>💳 Crédito</option>
                           <option value="pix" ${
                              isEdit && transacao.metodo_pagamento === "pix"
                                 ? "selected"
                                 : ""
                           }>📱 PIX</option>
                           <option value="boleto" ${
                              isEdit && transacao.metodo_pagamento === "boleto"
                                 ? "selected"
                                 : ""
                           }>📄 Boleto</option>
                           <option value="dinheiro" ${
                              isEdit &&
                              transacao.metodo_pagamento === "dinheiro"
                                 ? "selected"
                                 : ""
                           }>💵 Dinheiro</option>
                           <option value="transferencia" ${
                              isEdit &&
                              transacao.metodo_pagamento === "transferencia"
                                 ? "selected"
                                 : ""
                           }>🏦 Transferência</option>
                        </select>
                     </div>

                     <div class="form-group" id="grupoCartao" style="display: none;">
                        <label class="form-label">Cartão</label>
                        <select class="form-select" name="cartao_id">
                           <option value="">Selecione um cartão</option>
                           ${this.cartoes
                              .map(
                                 (cartao) => `
                              <option value="${cartao.id}" ${
                                    isEdit && transacao.cartao_id === cartao.id
                                       ? "selected"
                                       : ""
                                 }>
                                 💳 ${cartao.nome} (${cartao.numero})
                              </option>
                           `
                              )
                              .join("")}
                        </select>
                     </div>

                     <div class="form-group">
                        <label class="form-label">Conta Bancária</label>
                        <select class="form-select" name="conta_id">
                           <option value="">Selecione uma conta</option>
                           ${this.contas
                              .map(
                                 (conta) => `
                              <option value="${conta.id}" ${
                                    isEdit && transacao.conta_id === conta.id
                                       ? "selected"
                                       : ""
                                 }>
                                 🏦 ${conta.nome}
                              </option>
                           `
                              )
                              .join("")}
                        </select>
                     </div>

                     <div class="form-group">
                        <label class="form-label">Observações</label>
                        <textarea class="form-input" name="observacoes" rows="3" 
                                  placeholder="Notas adicionais...">${
                                     isEdit ? transacao.observacoes || "" : ""
                                  }</textarea>
                     </div>

                     <div class="form-group">
                        <label class="checkbox-label">
                           <input type="checkbox" name="recorrente" ${
                              isEdit && transacao.recorrente ? "checked" : ""
                           }>
                           <span>Transação Recorrente</span>
                        </label>
                     </div>

                     <div class="form-group" id="grupoRecorrencia" style="display: none;">
                        <label class="form-label">Tipo de Recorrência</label>
                        <select class="form-select" name="tipo_recorrencia">
                           <option value="mensal" ${
                              isEdit && transacao.tipo_recorrencia === "mensal"
                                 ? "selected"
                                 : ""
                           }>Mensal</option>
                           <option value="anual" ${
                              isEdit && transacao.tipo_recorrencia === "anual"
                                 ? "selected"
                                 : ""
                           }>Anual</option>
                           <option value="semanal" ${
                              isEdit && transacao.tipo_recorrencia === "semanal"
                                 ? "selected"
                                 : ""
                           }>Semanal</option>
                           <option value="quinzenal" ${
                              isEdit &&
                              transacao.tipo_recorrencia === "quinzenal"
                                 ? "selected"
                                 : ""
                           }>Quinzenal</option>
                        </select>
                     </div>
                  </form>
               </div>
               <div class="modal__footer">
                  <button class="btn btn-secondary" onclick="transacoesManager.fecharModal()">Cancelar</button>
                  <button class="btn btn-primary" onclick="transacoesManager.salvarTransacao(${
                     isEdit ? transacao.id : "null"
                  })">
                     ${isEdit ? "Salvar Alterações" : "Criar Transação"}
                  </button>
               </div>
            </div>
         </div>
      `;

      const modalContainer = document.getElementById("modalContainer");
      modalContainer.innerHTML = modalHTML;

      setTimeout(() => {
         const overlay = modalContainer.querySelector(".modal-overlay");
         if (overlay) {
            overlay.style.opacity = "1";
            const modal = overlay.querySelector(".modal");
            if (modal) {
               modal.style.transform = "scale(1)";
               modal.style.opacity = "1";
            }
         }
      }, 10);

      this.setupFormListeners();
   }

   setupFormListeners() {
      const metodoPagamento = document.getElementById("metodoPagamento");
      const grupoCartao = document.getElementById("grupoCartao");

      if (metodoPagamento && grupoCartao) {
         const toggleCartao = () => {
            const metodo = metodoPagamento.value;
            if (metodo === "debito" || metodo === "credito") {
               grupoCartao.style.display = "flex";
            } else {
               grupoCartao.style.display = "none";
            }
         };

         toggleCartao();
         metodoPagamento.addEventListener("change", toggleCartao);
      }

      const checkRecorrente = document.querySelector(
         'input[name="recorrente"]'
      );
      const grupoRecorrencia = document.getElementById("grupoRecorrencia");

      if (checkRecorrente && grupoRecorrencia) {
         const toggleRecorrencia = () => {
            if (checkRecorrente.checked) {
               grupoRecorrencia.style.display = "flex";
            } else {
               grupoRecorrencia.style.display = "none";
            }
         };

         toggleRecorrencia();
         checkRecorrente.addEventListener("change", toggleRecorrencia);
      }
   }

   salvarTransacao(id) {
      const form = document.getElementById("formTransacao");

      if (!form.checkValidity()) {
         form.reportValidity();
         return;
      }

      const formData = new FormData(form);

      const transacao = {
         tipo: formData.get("tipo"),
         descricao: formData.get("descricao"),
         valor: parseFloat(formData.get("valor")),
         data_vencimento: formData.get("data_vencimento"),
         categoria_id: parseInt(formData.get("categoria_id")),
         metodo_pagamento: formData.get("metodo_pagamento"),
         cartao_id: formData.get("cartao_id")
            ? parseInt(formData.get("cartao_id"))
            : null,
         conta_id: formData.get("conta_id")
            ? parseInt(formData.get("conta_id"))
            : null,
         observacoes: formData.get("observacoes") || "",
         recorrente: formData.get("recorrente") === "on",
         tipo_recorrencia:
            formData.get("recorrente") === "on"
               ? formData.get("tipo_recorrencia")
               : null,
         valorPago: null,
         data_pagamento: null,
         status: "pendente",
         parcelado: false,
         tags: [],
         recorrencia_id: null,
      };

      if (id) {
         const index = this.transacoes.findIndex((t) => t.id === id);
         if (index !== -1) {
            this.transacoes[index] = {
               ...this.transacoes[index],
               ...transacao,
               atualizado_em: new Date().toISOString(),
            };
         }
      } else {
         transacao.id = Date.now();
         transacao.criado_em = new Date().toISOString();
         this.transacoes.push(transacao);
      }

      this.saveData();
      this.fecharModal();
      this.renderizar();
   }

   abrirModalTransacao(transacao) {
      if (transacao.status === "pago") {
         this.mostrarDetalhesTransacao(transacao);
      } else {
         this.mostrarModalPagamento(transacao);
      }
   }

   mostrarDetalhesTransacao(transacao) {
      const categoria = this.categorias.find(
         (c) => c.id === transacao.categoria_id
      );
      const statusInfo = this.getStatusInfo(transacao.status);
      const cartao = this.cartoes.find((c) => c.id === transacao.cartao_id);
      const conta = this.contas.find((c) => c.id === transacao.conta_id);

      const labelValorPago =
         transacao.tipo === "receita" ? "Valor Recebido" : "Valor Pago";
      const labelDataPagamento =
         transacao.tipo === "receita"
            ? "Data de Recebimento"
            : "Data de Pagamento";
      const labelAcao =
         transacao.tipo === "receita" ? "Recebimento" : "Pagamento";

      const modalHTML = `
         <div class="modal-overlay" onclick="if(event.target === this) transacoesManager.fecharModal()">
            <div class="modal modal-pagamento">
               <div class="modal__header">
                  <h2 class="modal__title">Detalhes da Transação</h2>
                  <button class="modal__close" onclick="transacoesManager.fecharModal()">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                  </button>
               </div>
               <div class="modal__body">
                  <div class="modal-pagamento__status">
                     <div class="modal-pagamento__status-icone">${
                        categoria ? categoria.icone : "💰"
                     }</div>
                     <div class="modal-pagamento__status-info">
                        <h3>${transacao.descricao}</h3>
                        <p>${categoria ? categoria.nome : "Sem categoria"}</p>
                     </div>
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
                     <div class="list-item">
                        <span class="list-item__label">Tipo</span>
                        <span class="list-item__value" style="color: ${
                           transacao.tipo === "receita"
                              ? "var(--success-color)"
                              : "var(--danger-color)"
                        }">
                           ${
                              transacao.tipo === "receita"
                                 ? "↑ Receita"
                                 : "↓ Despesa"
                           }
                        </span>
                     </div>

                     <div class="list-item">
                        <span class="list-item__label">Valor Provisionado</span>
                        <span class="list-item__value">${this.formatarMoeda(
                           transacao.valor
                        )}</span>
                     </div>

                     <div class="list-item">
                        <span class="list-item__label">${labelValorPago}</span>
                        <span class="list-item__value list-item__value--positive">
                           ${this.formatarMoeda(transacao.valorPago)}
                        </span>
                     </div>

                     ${
                        transacao.valor !== transacao.valorPago
                           ? `
                        <div class="list-item">
                           <span class="list-item__label">Diferença</span>
                           <span class="list-item__value" style="color: ${
                              transacao.valorPago < transacao.valor
                                 ? "var(--success-color)"
                                 : "var(--danger-color)"
                           }">
                              ${this.formatarMoeda(
                                 transacao.valorPago - transacao.valor
                              )}
                           </span>
                        </div>
                     `
                           : ""
                     }

                     <div class="list-item">
                        <span class="list-item__label">Data de Vencimento</span>
                        <span class="list-item__value">${this.formatarData(
                           transacao.data_vencimento
                        )}</span>
                     </div>

                     <div class="list-item">
                        <span class="list-item__label">${labelDataPagamento}</span>
                        <span class="list-item__value">${this.formatarData(
                           transacao.data_pagamento
                        )}</span>
                     </div>

                     <div class="list-item">
                        <span class="list-item__label">Método de Pagamento</span>
                        <span class="list-item__value">
                           ${this.getMetodoIcone(
                              transacao.metodo_pagamento
                           )} ${this.getMetodoNome(transacao.metodo_pagamento)}
                        </span>
                     </div>

                     ${
                        cartao
                           ? `
                        <div class="list-item">
                           <span class="list-item__label">Cartão</span>
                           <span class="list-item__value">💳 ${cartao.nome} (${cartao.numero})</span>
                        </div>
                     `
                           : ""
                     }

                     ${
                        conta
                           ? `
                        <div class="list-item">
                           <span class="list-item__label">Conta</span>
                           <span class="list-item__value">🏦 ${conta.nome}</span>
                        </div>
                     `
                           : ""
                     }

                     <div class="list-item">
                        <span class="list-item__label">Status</span>
                        <span class="transacao-item__status transacao-item__status--${
                           transacao.status
                        }">
                           ${statusInfo.icone} ${statusInfo.nome}
                        </span>
                     </div>

                     ${
                        transacao.observacoes
                           ? `
                        <div style="margin-top: 8px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                           <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Observações</div>
                           <div style="font-size: 14px; color: var(--text-primary);">${transacao.observacoes}</div>
                        </div>
                     `
                           : ""
                     }
                  </div>
               </div>
               <div class="modal__footer" style="flex-wrap: wrap;">
                  <button class="btn btn-secondary" onclick="transacoesManager.fecharModal()">Fechar</button>
                  <button class="btn" style="background: var(--warning-color); color: white;" onclick="transacoesManager.desfazerPagamento(${
                     transacao.id
                  })">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                     </svg>
                     Desfazer ${labelAcao}
                  </button>
                  <button class="btn btn-primary" onclick="transacoesManager.editarTransacao(${
                     transacao.id
                  })">
                     Editar
                  </button>
                  <button class="btn btn-danger" onclick="transacoesManager.excluirTransacao(${
                     transacao.id
                  })">
                     Excluir
                  </button>
               </div>
            </div>
         </div>
      `;

      const modalContainer = document.getElementById("modalContainer");
      modalContainer.innerHTML = modalHTML;

      setTimeout(() => {
         const overlay = modalContainer.querySelector(".modal-overlay");
         if (overlay) {
            overlay.style.opacity = "1";
            const modal = overlay.querySelector(".modal");
            if (modal) {
               modal.style.transform = "scale(1)";
               modal.style.opacity = "1";
            }
         }
      }, 10);
   }

   mostrarModalPagamento(transacao) {
      const categoria = this.categorias.find(
         (c) => c.id === transacao.categoria_id
      );
      const statusInfo = this.getStatusInfo(transacao.status);

      const labelAcao =
         transacao.tipo === "receita" ? "Recebimento" : "Pagamento";
      const labelVerbo = transacao.tipo === "receita" ? "Recebi" : "Paguei";

      const modalHTML = `
         <div class="modal-overlay" onclick="if(event.target === this) transacoesManager.fecharModal()">
            <div class="modal modal-pagamento">
               <div class="modal__header">
                  <h2 class="modal__title">Confirmar ${labelAcao}</h2>
                  <button class="modal__close" onclick="transacoesManager.fecharModal()">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                  </button>
               </div>
               <div class="modal__body">
                  <div class="modal-pagamento__status">
                     <div class="modal-pagamento__status-icone">${
                        categoria ? categoria.icone : "💰"
                     }</div>
                     <div class="modal-pagamento__status-info">
                        <h3>${transacao.descricao}</h3>
                        <p>Vencimento: ${this.formatarData(
                           transacao.data_vencimento
                        )}</p>
                        <p style="margin-top: 4px;">Status: <span style="color: ${
                           statusInfo.icone === "⚠️"
                              ? "var(--danger-color)"
                              : "var(--warning-color)"
                        }">${statusInfo.icone} ${statusInfo.nome}</span></p>
                     </div>
                  </div>

                  <div class="modal-pagamento__valores">
                     <div class="modal-pagamento__valor-item">
                        <span class="modal-pagamento__valor-label">Valor Provisionado</span>
                        <span class="modal-pagamento__valor-valor">${this.formatarMoeda(
                           transacao.valor
                        )}</span>
                     </div>
                  </div>

                  <div class="modal-pagamento__opcoes">
                     <div class="opcao-pagamento" data-opcao="mesmo-valor">
                        <div class="opcao-pagamento__header">
                           <span class="opcao-pagamento__icone">✅</span>
                           <span class="opcao-pagamento__titulo">${labelVerbo} o mesmo valor</span>
                        </div>
                        <p class="opcao-pagamento__descricao">
                           Confirmar ${labelAcao.toLowerCase()} de ${this.formatarMoeda(
         transacao.valor
      )}
                        </p>
                     </div>

                     <div class="opcao-pagamento" data-opcao="valor-diferente">
                        <div class="opcao-pagamento__header">
                           <span class="opcao-pagamento__icone">💵</span>
                           <span class="opcao-pagamento__titulo">${labelVerbo} valor diferente</span>
                        </div>
                        <p class="opcao-pagamento__descricao">
                           Informar o valor que foi ${
                              transacao.tipo === "receita" ? "recebido" : "pago"
                           }
                        </p>
                        <div class="opcao-pagamento__input">
                           <div class="form-group">
                              <label class="form-label">Valor ${
                                 transacao.tipo === "receita"
                                    ? "Recebido"
                                    : "Pago"
                              }</label>
                              <div class="input-group">
                                 <span class="input-prefix">R$</span>
                                 <input type="number" class="form-input" id="valorPago" 
                                        placeholder="0,00" step="0.01" value="${
                                           transacao.valor
                                        }">
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div class="modal__footer">
                  <button class="btn btn-secondary" onclick="transacoesManager.fecharModal()">Cancelar</button>
                  <button class="btn btn-primary" onclick="transacoesManager.confirmarPagamento(${
                     transacao.id
                  })">
                     Confirmar ${labelAcao}
                  </button>
               </div>
            </div>
         </div>
      `;

      const modalContainer = document.getElementById("modalContainer");
      modalContainer.innerHTML = modalHTML;

      setTimeout(() => {
         const overlay = modalContainer.querySelector(".modal-overlay");
         if (overlay) {
            overlay.style.opacity = "1";
            const modal = overlay.querySelector(".modal");
            if (modal) {
               modal.style.transform = "scale(1)";
               modal.style.opacity = "1";
            }
         }
      }, 10);

      document.querySelectorAll(".opcao-pagamento").forEach((opcao) => {
         opcao.addEventListener("click", function () {
            document
               .querySelectorAll(".opcao-pagamento")
               .forEach((o) => o.classList.remove("selected"));
            this.classList.add("selected");
         });
      });

      setTimeout(() => {
         const primeiraOpcao = document.querySelector(
            '.opcao-pagamento[data-opcao="mesmo-valor"]'
         );
         if (primeiraOpcao) {
            primeiraOpcao.classList.add("selected");
         }
      }, 50);
   }

   confirmarPagamento(transacaoId) {
      const transacao = this.transacoes.find((t) => t.id === transacaoId);
      if (!transacao) return;

      const opcaoSelecionada = document.querySelector(
         ".opcao-pagamento.selected"
      );

      if (!opcaoSelecionada) {
         alert("Selecione uma opção de pagamento");
         return;
      }

      const opcao = opcaoSelecionada.dataset.opcao;

      if (opcao === "mesmo-valor") {
         transacao.valorPago = transacao.valor;
      } else {
         const valorPago = parseFloat(
            document.getElementById("valorPago").value
         );
         if (isNaN(valorPago) || valorPago <= 0) {
            alert("Digite um valor válido");
            return;
         }
         transacao.valorPago = valorPago;
      }

      transacao.data_pagamento = new Date().toISOString().split("T")[0];
      transacao.status = "pago";

      this.saveData();
      this.fecharModal();
      this.renderizar();
   }

   desfazerPagamento(transacaoId) {
      const transacao = this.transacoes.find((t) => t.id === transacaoId);
      if (!transacao) return;

      const labelAcao =
         transacao.tipo === "receita" ? "recebimento" : "pagamento";

      if (
         confirm(
            `Tem certeza que deseja desfazer o ${labelAcao} desta transação?`
         )
      ) {
         transacao.valorPago = null;
         transacao.data_pagamento = null;
         transacao.status = "pendente";

         this.saveData();
         this.fecharModal();
         this.renderizar();
      }
   }

   fecharModal() {
      const modalContainer = document.getElementById("modalContainer");
      const overlay = modalContainer.querySelector(".modal-overlay");

      if (overlay) {
         overlay.style.opacity = "0";
         const modal = overlay.querySelector(".modal");
         if (modal) {
            modal.style.transform = "scale(0.9)";
            modal.style.opacity = "0";
         }

         setTimeout(() => {
            modalContainer.innerHTML = "";
         }, 300);
      } else {
         modalContainer.innerHTML = "";
      }
   }

   excluirTransacao(transacaoId) {
      const transacao = this.transacoes.find((t) => t.id === transacaoId);
      if (!transacao) return;

      const modalHTML = `
         <div class="modal-overlay" onclick="if(event.target === this) transacoesManager.fecharModal()">
            <div class="modal modal-confirmacao">
               <div class="modal__header">
                  <h2 class="modal__title">Confirmar Exclusão</h2>
                  <button class="modal__close" onclick="transacoesManager.fecharModal()">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                  </button>
               </div>
               <div class="modal__body">
                  <div class="confirmacao-box confirmacao-box--danger">
                     <div class="confirmacao-box__icone">⚠️</div>
                     <div class="confirmacao-box__conteudo">
                        <h3 class="confirmacao-box__titulo">Tem certeza?</h3>
                        <p class="confirmacao-box__texto">
                           Você está prestes a excluir a transação:
                        </p>
                        <div class="confirmacao-box__info">
                           <strong>${transacao.descricao}</strong>
                           <span>${this.formatarMoeda(transacao.valor)}</span>
                        </div>
                        <p class="confirmacao-box__aviso">
                           ⚠️ Esta ação não pode ser desfeita!
                        </p>
                     </div>
                  </div>
               </div>
               <div class="modal__footer">
                  <button class="btn btn-secondary" onclick="transacoesManager.fecharModal()">Cancelar</button>
                  <button class="btn btn-danger" onclick="transacoesManager.confirmarExclusao(${transacaoId})">
                     Excluir Transação
                  </button>
               </div>
            </div>
         </div>
      `;

      const modalContainer = document.getElementById("modalContainer");
      modalContainer.innerHTML = modalHTML;

      setTimeout(() => {
         const overlay = modalContainer.querySelector(".modal-overlay");
         if (overlay) {
            overlay.style.opacity = "1";
            const modal = overlay.querySelector(".modal");
            if (modal) {
               modal.style.transform = "scale(1)";
               modal.style.opacity = "1";
            }
         }
      }, 10);
   }

   confirmarExclusao(transacaoId) {
      const index = this.transacoes.findIndex((t) => t.id === transacaoId);
      if (index !== -1) {
         this.transacoes.splice(index, 1);
         this.saveData();
         this.fecharModal();
         this.renderizar();
      }
   }

   editarTransacao(transacaoId) {
      const transacao = this.transacoes.find((t) => t.id === transacaoId);
      if (transacao) {
         this.abrirModalNovaTransacao(transacao);
      }
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
         month: "2-digit",
         year: "numeric",
      });
   }

   formatarMesAno(data) {
      return data.toLocaleDateString("pt-BR", {
         month: "long",
         year: "numeric",
      });
   }

   obterDadosDashboard() {
      this.atualizarStatus();

      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      const transacoesMesAtual = this.transacoes.filter((t) => {
         const data = new Date(t.data_vencimento + "T00:00:00");
         return data >= primeiroDiaMes && data <= ultimoDiaMes;
      });

      let totalReceitas = 0;
      let totalDespesas = 0;
      let totalReceitasPagas = 0;
      let totalDespesasPagas = 0;
      let contaPagos = 0;
      let contaPendentes = 0;

      const despesasPorCategoria = {};

      transacoesMesAtual.forEach((t) => {
         const valor = t.valorPago !== null ? t.valorPago : t.valor;

         if (t.tipo === "receita") {
            totalReceitas += valor;
            if (t.status === "pago") {
               totalReceitasPagas += t.valorPago;
            }
         } else {
            totalDespesas += valor;
            if (t.status === "pago") {
               totalDespesasPagas += t.valorPago;
            }

            const categoria = this.categorias.find(
               (c) => c.id === t.categoria_id
            );
            const categoriaNome = categoria ? categoria.nome : "Outros";
            const categoriaIcone = categoria ? categoria.icone : "📦";
            const categoriaCor = categoria ? categoria.cor : "#64748b";

            if (!despesasPorCategoria[categoriaNome]) {
               despesasPorCategoria[categoriaNome] = {
                  nome: categoriaNome,
                  icone: categoriaIcone,
                  cor: categoriaCor,
                  valor: 0,
               };
            }
            despesasPorCategoria[categoriaNome].valor += valor;
         }

         if (t.status === "pago") {
            contaPagos++;
         } else if (t.status === "pendente" || t.status === "atrasado") {
            contaPendentes++;
         }
      });

      return {
         totalReceitas,
         totalDespesas,
         saldo: totalReceitas - totalDespesas,
         totalReceitasPagas,
         totalDespesasPagas,
         diferencaReceitas: totalReceitas - totalReceitasPagas,
         diferencaDespesas: totalDespesas - totalDespesasPagas,
         contaPagos,
         contaPendentes,
         totalAPagar: totalDespesas - totalDespesasPagas,
         despesasPorCategoria: Object.values(despesasPorCategoria).sort(
            (a, b) => b.valor - a.valor
         ),
         transacoesMesAtual,
      };
   }
}

document.addEventListener("DOMContentLoaded", () => {
   window.transacoesManager = new TransacoesManager();
});
