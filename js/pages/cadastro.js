class CadastroManager {
   constructor() {
      this.currentTab = "cartoes";
      this.data = {
         cartoes: [],
         categorias: [],
         contas: [],
         tags: [],
      };

      this.init();
   }

   init() {
      this.loadData();
      this.setupTabs();
      this.setupButtons();
      this.renderAll();
   }

   loadData() {
      const savedData = localStorage.getItem("financeAppCadastros");
      if (savedData) {
         try {
            this.data = JSON.parse(savedData);
         } catch (error) {
            console.error("Erro ao carregar dados:", error);
         }
      }
      if (this.data.cartoes.length === 0) {
         this.loadExampleData();
      }
   }

   saveData() {
      try {
         localStorage.setItem("financeAppCadastros", JSON.stringify(this.data));
         console.log("Dados salvos com sucesso");
      } catch (error) {
         console.error("Erro ao salvar dados:", error);
         alert("Erro ao salvar dados. Tente novamente.");
      }
   }

   loadExampleData() {
      this.data.categorias = [
         {
            id: 1,
            nome: "Alimentação",
            tipo: "despesa",
            cor: "#ef4444",
            icone: "🍔",
         },
         {
            id: 2,
            nome: "Transporte",
            tipo: "despesa",
            cor: "#3b82f6",
            icone: "🚗",
         },
         {
            id: 3,
            nome: "Salário",
            tipo: "receita",
            cor: "#10b981",
            icone: "💰",
         },
      ];

      this.data.cartoes = [
         {
            id: 1,
            nome: "Nubank",
            numero: "1234",
            tipo: "credito",
            bandeira: "Mastercard",
            limite: 5000,
            cor: "#8A05BE",
         },
         {
            id: 2,
            nome: "Banco do Brasil",
            numero: "5678",
            tipo: "debito",
            bandeira: "Visa",
            cor: "#FFED00",
         },
      ];

      this.data.contas = [
         {
            id: 1,
            nome: "Conta Corrente",
            banco: "Nubank",
            saldo: 3847.5,
            cor: "#8A05BE",
         },
         {
            id: 2,
            nome: "Poupança",
            banco: "Banco do Brasil",
            saldo: 15000.0,
            cor: "#FFED00",
         },
      ];

      this.data.tags = [
         { id: 1, nome: "Urgente", cor: "#ef4444" },
         { id: 2, nome: "Recorrente", cor: "#3b82f6" },
         { id: 3, nome: "Planejado", cor: "#10b981" },
      ];

      this.saveData();
   }

   // ✅ CORREÇÃO APLICADA AQUI!
   setupTabs() {
      const tabs = document.querySelectorAll(".tab");
      tabs.forEach((tab) => {
         tab.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            // ✅ USA currentTarget ao invés de target
            const clickedTab = e.currentTarget;
            const tabName = clickedTab.dataset.tab;

            if (tabName) {
               this.switchTab(tabName);
            }
         });
      });
   }

   switchTab(tabName) {
      document.querySelectorAll(".tab").forEach((tab) => {
         tab.classList.remove("active");
      });
      document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
      document.querySelectorAll(".tab-content").forEach((content) => {
         content.classList.remove("active");
      });
      document.getElementById(tabName).classList.add("active");

      this.currentTab = tabName;
   }

   setupButtons() {
      document.getElementById("addCartaoBtn")?.addEventListener("click", () => {
         this.openCartaoModal();
      });
      document
         .getElementById("addCategoriaBtn")
         ?.addEventListener("click", () => {
            this.openCategoriaModal();
         });
      document.getElementById("addContaBtn")?.addEventListener("click", () => {
         this.openContaModal();
      });
      document.getElementById("addTagBtn")?.addEventListener("click", () => {
         this.openTagModal();
      });
   }

   renderAll() {
      this.renderCartoes();
      this.renderCategorias();
      this.renderContas();
      this.renderTags();
   }

   renderCartoes() {
      const container = document.getElementById("listaCartoes");
      const empty = document.getElementById("emptyCartoes");

      if (this.data.cartoes.length === 0) {
         container.innerHTML = "";
         empty.style.display = "block";
         return;
      }

      empty.style.display = "none";
      container.innerHTML = this.data.cartoes
         .map(
            (cartao) => `
            <div class="list-card">
                <div class="list-card__content">
                    <div class="list-card__icon" style="background: ${
                       cartao.cor
                    }; color: white;">
                        💳
                    </div>
                    <div class="list-card__info">
                        <div class="list-card__title">${cartao.nome}</div>
                        <div class="list-card__subtitle">
                            ${
                               cartao.tipo === "credito" ? "Crédito" : "Débito"
                            } • ${cartao.bandeira} • ****${cartao.numero}
                        </div>
                    </div>
                </div>
                <div class="list-card__actions">
                    <button class="icon-btn" onclick="cadastroManager.editCartao(${
                       cartao.id
                    })">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn icon-btn--danger" onclick="cadastroManager.deleteCartao(${
                       cartao.id
                    })">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `
         )
         .join("");
   }

   renderCategorias() {
      const container = document.getElementById("listaCategorias");
      const empty = document.getElementById("emptyCategorias");

      if (this.data.categorias.length === 0) {
         container.innerHTML = "";
         empty.style.display = "block";
         return;
      }

      empty.style.display = "none";
      container.innerHTML = this.data.categorias
         .map(
            (cat) => `
            <div class="list-card">
                <div class="list-card__content">
                    <div class="list-card__icon" style="background: ${
                       cat.cor
                    }; color: white;">
                        ${cat.icone}
                    </div>
                    <div class="list-card__info">
                        <div class="list-card__title">${cat.nome}</div>
                        <div class="list-card__subtitle">
                            ${cat.tipo === "despesa" ? "Despesa" : "Receita"}
                        </div>
                    </div>
                </div>
                <div class="list-card__actions">
                    <button class="icon-btn" onclick="cadastroManager.editCategoria(${
                       cat.id
                    })">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn icon-btn--danger" onclick="cadastroManager.deleteCategoria(${
                       cat.id
                    })">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `
         )
         .join("");
   }

   renderContas() {
      const container = document.getElementById("listaContas");
      const empty = document.getElementById("emptyContas");

      if (this.data.contas.length === 0) {
         container.innerHTML = "";
         empty.style.display = "block";
         return;
      }

      empty.style.display = "none";
      container.innerHTML = this.data.contas
         .map(
            (conta) => `
            <div class="list-card">
                <div class="list-card__content">
                    <div class="list-card__icon" style="background: ${
                       conta.cor
                    }; color: white;">
                        🏦
                    </div>
                    <div class="list-card__info">
                        <div class="list-card__title">${conta.nome}</div>
                        <div class="list-card__subtitle">
                            ${conta.banco} • ${this.formatCurrency(conta.saldo)}
                        </div>
                    </div>
                </div>
                <div class="list-card__actions">
                    <button class="icon-btn" onclick="cadastroManager.editConta(${
                       conta.id
                    })">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn icon-btn--danger" onclick="cadastroManager.deleteConta(${
                       conta.id
                    })">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `
         )
         .join("");
   }

   renderTags() {
      const container = document.getElementById("listaTags");
      const empty = document.getElementById("emptyTags");

      if (this.data.tags.length === 0) {
         container.innerHTML = "";
         empty.style.display = "block";
         return;
      }

      empty.style.display = "none";
      container.innerHTML = this.data.tags
         .map(
            (tag) => `
            <div class="list-card">
                <div class="list-card__content">
                    <div class="list-card__icon" style="background: ${tag.cor}; color: white;">
                        🏷️
                    </div>
                    <div class="list-card__info">
                        <div class="list-card__title">${tag.nome}</div>
                    </div>
                </div>
                <div class="list-card__actions">
                    <button class="icon-btn" onclick="cadastroManager.editTag(${tag.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn icon-btn--danger" onclick="cadastroManager.deleteTag(${tag.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `
         )
         .join("");
   }

   openCartaoModal(cartao = null) {
      const isEdit = cartao !== null;
      const modalHTML = `
            <div class="modal-overlay" id="cartaoModal">
                <div class="modal">
                    <div class="modal__header">
                        <h2 class="modal__title">${
                           isEdit ? "Editar" : "Novo"
                        } Cartão</h2>
                        <button class="modal__close" onclick="cadastroManager.closeModal()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="modal__body">
                        <form class="form" id="cartaoForm">
                            <div class="form-group">
                                <label class="form-label form-label--required">Nome do Cartão</label>
                                <input type="text" class="form-input" name="nome" placeholder="Ex: Nubank" value="${
                                   isEdit ? cartao.nome : ""
                                }" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Últimos 4 dígitos</label>
                                <input type="text" class="form-input" name="numero" placeholder="1234" maxlength="4" value="${
                                   isEdit ? cartao.numero : ""
                                }" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Tipo</label>
                                <select class="form-select" name="tipo" required>
                                    <option value="credito" ${
                                       isEdit && cartao.tipo === "credito"
                                          ? "selected"
                                          : ""
                                    }>Crédito</option>
                                    <option value="debito" ${
                                       isEdit && cartao.tipo === "debito"
                                          ? "selected"
                                          : ""
                                    }>Débito</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Bandeira</label>
                                <select class="form-select" name="bandeira" required>
                                    <option value="Visa" ${
                                       isEdit && cartao.bandeira === "Visa"
                                          ? "selected"
                                          : ""
                                    }>Visa</option>
                                    <option value="Mastercard" ${
                                       isEdit &&
                                       cartao.bandeira === "Mastercard"
                                          ? "selected"
                                          : ""
                                    }>Mastercard</option>
                                    <option value="Elo" ${
                                       isEdit && cartao.bandeira === "Elo"
                                          ? "selected"
                                          : ""
                                    }>Elo</option>
                                    <option value="American Express" ${
                                       isEdit &&
                                       cartao.bandeira === "American Express"
                                          ? "selected"
                                          : ""
                                    }>American Express</option>
                                </select>
                            </div>
                            
                            <div class="form-group" id="limiteGroup">
                                <label class="form-label">Limite</label>
                                <div class="input-group">
                                    <span class="input-prefix">R$</span>
                                    <input type="number" class="form-input" name="limite" placeholder="5000.00" step="0.01" value="${
                                       isEdit && cartao.limite
                                          ? cartao.limite
                                          : ""
                                    }">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Cor</label>
                                <div class="color-picker">
                                    ${this.getColorOptions(
                                       isEdit ? cartao.cor : "#667eea"
                                    )}
                                </div>
                                <input type="hidden" name="cor" value="${
                                   isEdit ? cartao.cor : "#667eea"
                                }">
                            </div>
                        </form>
                    </div>
                    <div class="modal__footer">
                        <button class="btn btn-secondary" onclick="cadastroManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="cadastroManager.saveCartao(${
                           isEdit ? cartao.id : "null"
                        })">${isEdit ? "Salvar" : "Adicionar"}</button>
                    </div>
                </div>
            </div>
        `;

      document.getElementById("modalContainer").innerHTML = modalHTML;
      this.setupColorPicker();
      this.setupTipoCartaoListener();
   }

   openCategoriaModal(categoria = null) {
      const isEdit = categoria !== null;
      const modalHTML = `
            <div class="modal-overlay" id="categoriaModal">
                <div class="modal">
                    <div class="modal__header">
                        <h2 class="modal__title">${
                           isEdit ? "Editar" : "Nova"
                        } Categoria</h2>
                        <button class="modal__close" onclick="cadastroManager.closeModal()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="modal__body">
                        <form class="form" id="categoriaForm">
                            <div class="form-group">
                                <label class="form-label form-label--required">Nome</label>
                                <input type="text" class="form-input" name="nome" placeholder="Ex: Alimentação" value="${
                                   isEdit ? categoria.nome : ""
                                }" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Tipo</label>
                                <select class="form-select" name="tipo" required>
                                    <option value="despesa" ${
                                       isEdit && categoria.tipo === "despesa"
                                          ? "selected"
                                          : ""
                                    }>Despesa</option>
                                    <option value="receita" ${
                                       isEdit && categoria.tipo === "receita"
                                          ? "selected"
                                          : ""
                                    }>Receita</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Ícone</label>
                                <div class="icon-picker">
                                    ${this.getIconOptions(
                                       isEdit ? categoria.icone : "📁"
                                    )}
                                </div>
                                <input type="hidden" name="icone" value="${
                                   isEdit ? categoria.icone : "📁"
                                }">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Cor</label>
                                <div class="color-picker">
                                    ${this.getColorOptions(
                                       isEdit ? categoria.cor : "#667eea"
                                    )}
                                </div>
                                <input type="hidden" name="cor" value="${
                                   isEdit ? categoria.cor : "#667eea"
                                }">
                            </div>
                        </form>
                    </div>
                    <div class="modal__footer">
                        <button class="btn btn-secondary" onclick="cadastroManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="cadastroManager.saveCategoria(${
                           isEdit ? categoria.id : "null"
                        })">${isEdit ? "Salvar" : "Adicionar"}</button>
                    </div>
                </div>
            </div>
        `;

      document.getElementById("modalContainer").innerHTML = modalHTML;
      this.setupColorPicker();
      this.setupIconPicker();
   }

   openContaModal(conta = null) {
      const isEdit = conta !== null;
      const modalHTML = `
            <div class="modal-overlay" id="contaModal">
                <div class="modal">
                    <div class="modal__header">
                        <h2 class="modal__title">${
                           isEdit ? "Editar" : "Nova"
                        } Conta</h2>
                        <button class="modal__close" onclick="cadastroManager.closeModal()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="modal__body">
                        <form class="form" id="contaForm">
                            <div class="form-group">
                                <label class="form-label form-label--required">Nome da Conta</label>
                                <input type="text" class="form-input" name="nome" placeholder="Ex: Conta Corrente" value="${
                                   isEdit ? conta.nome : ""
                                }" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Banco</label>
                                <input type="text" class="form-input" name="banco" placeholder="Ex: Nubank" value="${
                                   isEdit ? conta.banco : ""
                                }" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Saldo Inicial</label>
                                <div class="input-group">
                                    <span class="input-prefix">R$</span>
                                    <input type="number" class="form-input" name="saldo" placeholder="1000.00" step="0.01" value="${
                                       isEdit ? conta.saldo : ""
                                    }" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Cor</label>
                                <div class="color-picker">
                                    ${this.getColorOptions(
                                       isEdit ? conta.cor : "#667eea"
                                    )}
                                </div>
                                <input type="hidden" name="cor" value="${
                                   isEdit ? conta.cor : "#667eea"
                                }">
                            </div>
                        </form>
                    </div>
                    <div class="modal__footer">
                        <button class="btn btn-secondary" onclick="cadastroManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="cadastroManager.saveConta(${
                           isEdit ? conta.id : "null"
                        })">${isEdit ? "Salvar" : "Adicionar"}</button>
                    </div>
                </div>
            </div>
        `;

      document.getElementById("modalContainer").innerHTML = modalHTML;
      this.setupColorPicker();
   }

   openTagModal(tag = null) {
      const isEdit = tag !== null;
      const modalHTML = `
            <div class="modal-overlay" id="tagModal">
                <div class="modal">
                    <div class="modal__header">
                        <h2 class="modal__title">${
                           isEdit ? "Editar" : "Nova"
                        } Tag</h2>
                        <button class="modal__close" onclick="cadastroManager.closeModal()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="modal__body">
                        <form class="form" id="tagForm">
                            <div class="form-group">
                                <label class="form-label form-label--required">Nome</label>
                                <input type="text" class="form-input" name="nome" placeholder="Ex: Urgente" value="${
                                   isEdit ? tag.nome : ""
                                }" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label form-label--required">Cor</label>
                                <div class="color-picker">
                                    ${this.getColorOptions(
                                       isEdit ? tag.cor : "#667eea"
                                    )}
                                </div>
                                <input type="hidden" name="cor" value="${
                                   isEdit ? tag.cor : "#667eea"
                                }">
                            </div>
                        </form>
                    </div>
                    <div class="modal__footer">
                        <button class="btn btn-secondary" onclick="cadastroManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="cadastroManager.saveTag(${
                           isEdit ? tag.id : "null"
                        })">${isEdit ? "Salvar" : "Adicionar"}</button>
                    </div>
                </div>
            </div>
        `;

      document.getElementById("modalContainer").innerHTML = modalHTML;
      this.setupColorPicker();
   }

   closeModal() {
      document.getElementById("modalContainer").innerHTML = "";
   }

   saveCartao(id) {
      const form = document.getElementById("cartaoForm");
      const formData = new FormData(form);

      if (!form.checkValidity()) {
         form.reportValidity();
         return;
      }

      const cartao = {
         nome: formData.get("nome"),
         numero: formData.get("numero"),
         tipo: formData.get("tipo"),
         bandeira: formData.get("bandeira"),
         limite: formData.get("limite")
            ? parseFloat(formData.get("limite"))
            : null,
         cor: formData.get("cor"),
      };

      if (id) {
         const index = this.data.cartoes.findIndex((c) => c.id === id);
         this.data.cartoes[index] = { ...this.data.cartoes[index], ...cartao };
      } else {
         cartao.id = Date.now();
         this.data.cartoes.push(cartao);
      }

      this.saveData();
      this.renderCartoes();
      this.closeModal();
   }

   saveCategoria(id) {
      const form = document.getElementById("categoriaForm");
      const formData = new FormData(form);

      if (!form.checkValidity()) {
         form.reportValidity();
         return;
      }

      const categoria = {
         nome: formData.get("nome"),
         tipo: formData.get("tipo"),
         icone: formData.get("icone"),
         cor: formData.get("cor"),
      };

      if (id) {
         const index = this.data.categorias.findIndex((c) => c.id === id);
         this.data.categorias[index] = {
            ...this.data.categorias[index],
            ...categoria,
         };
      } else {
         categoria.id = Date.now();
         this.data.categorias.push(categoria);
      }

      this.saveData();
      this.renderCategorias();
      this.closeModal();
   }

   saveConta(id) {
      const form = document.getElementById("contaForm");
      const formData = new FormData(form);

      if (!form.checkValidity()) {
         form.reportValidity();
         return;
      }

      const conta = {
         nome: formData.get("nome"),
         banco: formData.get("banco"),
         saldo: parseFloat(formData.get("saldo")),
         cor: formData.get("cor"),
      };

      if (id) {
         const index = this.data.contas.findIndex((c) => c.id === id);
         this.data.contas[index] = { ...this.data.contas[index], ...conta };
      } else {
         conta.id = Date.now();
         this.data.contas.push(conta);
      }

      this.saveData();
      this.renderContas();
      this.closeModal();
   }

   saveTag(id) {
      const form = document.getElementById("tagForm");
      const formData = new FormData(form);

      if (!form.checkValidity()) {
         form.reportValidity();
         return;
      }

      const tag = {
         nome: formData.get("nome"),
         cor: formData.get("cor"),
      };

      if (id) {
         const index = this.data.tags.findIndex((t) => t.id === id);
         this.data.tags[index] = { ...this.data.tags[index], ...tag };
      } else {
         tag.id = Date.now();
         this.data.tags.push(tag);
      }

      this.saveData();
      this.renderTags();
      this.closeModal();
   }

   editCartao(id) {
      const cartao = this.data.cartoes.find((c) => c.id === id);
      this.openCartaoModal(cartao);
   }

   editCategoria(id) {
      const categoria = this.data.categorias.find((c) => c.id === id);
      this.openCategoriaModal(categoria);
   }

   editConta(id) {
      const conta = this.data.contas.find((c) => c.id === id);
      this.openContaModal(conta);
   }

   editTag(id) {
      const tag = this.data.tags.find((t) => t.id === id);
      this.openTagModal(tag);
   }

   deleteCartao(id) {
      if (confirm("Tem certeza que deseja excluir este cartão?")) {
         this.data.cartoes = this.data.cartoes.filter((c) => c.id !== id);
         this.saveData();
         this.renderCartoes();
      }
   }

   deleteCategoria(id) {
      if (confirm("Tem certeza que deseja excluir esta categoria?")) {
         this.data.categorias = this.data.categorias.filter((c) => c.id !== id);
         this.saveData();
         this.renderCategorias();
      }
   }

   deleteConta(id) {
      if (confirm("Tem certeza que deseja excluir esta conta?")) {
         this.data.contas = this.data.contas.filter((c) => c.id !== id);
         this.saveData();
         this.renderContas();
      }
   }

   deleteTag(id) {
      if (confirm("Tem certeza que deseja excluir esta tag?")) {
         this.data.tags = this.data.tags.filter((t) => t.id !== id);
         this.saveData();
         this.renderTags();
      }
   }

   getColorOptions(selected) {
      const colors = [
         "#ef4444",
         "#f97316",
         "#f59e0b",
         "#eab308",
         "#84cc16",
         "#22c55e",
         "#10b981",
         "#14b8a6",
         "#06b6d4",
         "#0ea5e9",
         "#3b82f6",
         "#6366f1",
         "#8b5cf6",
         "#a855f7",
         "#d946ef",
         "#ec4899",
         "#f43f5e",
         "#667eea",
         "#764ba2",
         "#1f2937",
      ];

      return colors
         .map(
            (color) => `
            <div class="color-option ${color === selected ? "selected" : ""}" 
                 style="background: ${color};" 
                 data-color="${color}"></div>
        `
         )
         .join("");
   }

   getIconOptions(selected) {
      const icons = [
         "📁",
         "🍔",
         "🚗",
         "🏠",
         "⚡",
         "🎮",
         "📱",
         "💊",
         "🎓",
         "✈️",
         "🎬",
         "🎵",
         "💼",
         "🛒",
         "💰",
         "📊",
         "🏋️",
         "🎨",
         "📚",
         "☕",
         "🍕",
         "🎂",
         "🎁",
         "🔧",
      ];

      return icons
         .map(
            (icon) => `
            <div class="icon-option ${
               icon === selected ? "selected" : ""
            }" data-icon="${icon}">
                ${icon}
            </div>
        `
         )
         .join("");
   }

   setupColorPicker() {
      document.querySelectorAll(".color-option").forEach((option) => {
         option.addEventListener("click", (e) => {
            document
               .querySelectorAll(".color-option")
               .forEach((opt) => opt.classList.remove("selected"));
            e.target.classList.add("selected");
            const modal = e.target.closest(".modal");
            modal.querySelector('input[name="cor"]').value =
               e.target.dataset.color;
         });
      });
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

   setupTipoCartaoListener() {
      const tipoSelect = document.querySelector('select[name="tipo"]');
      const limiteGroup = document.getElementById("limiteGroup");

      tipoSelect?.addEventListener("change", (e) => {
         if (e.target.value === "debito") {
            limiteGroup.style.display = "none";
         } else {
            limiteGroup.style.display = "flex";
         }
      });

      if (tipoSelect?.value === "debito") {
         limiteGroup.style.display = "none";
      }
   }

   formatCurrency(value) {
      return new Intl.NumberFormat("pt-BR", {
         style: "currency",
         currency: "BRL",
      }).format(value);
   }
}

document.addEventListener("DOMContentLoaded", () => {
   window.cadastroManager = new CadastroManager();
});
