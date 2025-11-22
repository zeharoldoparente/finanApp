class DashboardManager {
   constructor() {
      this.dados = null;
      this.monthNavigator = null;
      this.currentPeriod = null;
      this.init();
   }

   init() {
      this.setupMonthNavigator();
      this.carregarDados();
      this.renderizar();

      window.addEventListener("transacoesAtualizadas", () => {
         this.carregarDados();
         this.renderizar();
      });
   }
   setupMonthNavigator() {
      this.monthNavigator = new MonthNavigator(
         "monthNavigatorContainer",
         (period) => {
            this.currentPeriod = period;
            this.carregarDados();
            this.renderizar();
         }
      );
      this.currentPeriod = this.monthNavigator.getCurrentPeriod();
   }

   carregarDados() {
      const transacoesData = localStorage.getItem("financeAppTransacoes");
      const cadastrosData = localStorage.getItem("financeAppCadastros");

      let transacoes = [];
      let categorias = [];
      let contas = [];

      if (transacoesData) {
         try {
            transacoes = JSON.parse(transacoesData);
         } catch (error) {
            console.error("Erro ao carregar transações:", error);
         }
      }

      if (cadastrosData) {
         try {
            const cadastros = JSON.parse(cadastrosData);
            categorias = cadastros.categorias || [];
            contas = cadastros.contas || [];
         } catch (error) {
            console.error("Erro ao carregar cadastros:", error);
         }
      }

      this.dados = this.processarDados(transacoes, categorias, contas);
   }

   processarDados(transacoes, categorias, contas) {
      const primeiroDiaMes = this.currentPeriod.firstDay;
      const ultimoDiaMes = this.currentPeriod.lastDay;

      const transacoesMesAtual = transacoes.filter((t) => {
         const data = new Date(t.data_vencimento + "T00:00:00");
         return data >= primeiroDiaMes && data <= ultimoDiaMes;
      });

      transacoesMesAtual.forEach((t) => {
         if (t.valorPago !== null && t.valorPago !== undefined) {
            t.status = "pago";
         } else {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const vencimento = new Date(t.data_vencimento + "T00:00:00");
            vencimento.setHours(0, 0, 0, 0);

            if (vencimento < hoje) {
               t.status = "atrasado";
            } else if (vencimento.getTime() === hoje.getTime()) {
               t.status = "pendente";
            } else {
               t.status = "agendado";
            }
         }
      });

      let totalReceitas = 0;
      let totalDespesas = 0;
      let totalReceitasPagas = 0;
      let totalDespesasPagas = 0;
      let contaPagos = 0;
      let contaPendentes = 0;
      let contaAtrasados = 0;

      const despesasPorCategoria = {};
      const receitasPorCategoria = {};

      transacoesMesAtual.forEach((t) => {
         const valor = t.valorPago !== null ? t.valorPago : t.valor;

         if (t.tipo === "receita") {
            totalReceitas += valor;
            if (t.status === "pago") {
               totalReceitasPagas += t.valorPago;
            }

            const categoria = categorias.find((c) => c.id === t.categoria_id);
            const categoriaNome = categoria ? categoria.nome : "Outros";
            const categoriaIcone = categoria ? categoria.icone : "💰";
            const categoriaCor = categoria ? categoria.cor : "#10b981";

            if (!receitasPorCategoria[categoriaNome]) {
               receitasPorCategoria[categoriaNome] = {
                  nome: categoriaNome,
                  icone: categoriaIcone,
                  cor: categoriaCor,
                  valor: 0,
               };
            }
            receitasPorCategoria[categoriaNome].valor += valor;
         } else {
            totalDespesas += valor;
            if (t.status === "pago") {
               totalDespesasPagas += t.valorPago;
            }

            const categoria = categorias.find((c) => c.id === t.categoria_id);
            const categoriaNome = categoria ? categoria.nome : "Outros";
            const categoriaIcone = categoria ? categoria.icone : "📦";
            const categoriaCor = categoria ? categoria.cor : "#ef4444";

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
         } else if (t.status === "atrasado") {
            contaAtrasados++;
            contaPendentes++;
         } else if (t.status === "pendente" || t.status === "agendado") {
            contaPendentes++;
         }
      });

      const saldoTotal = contas.reduce(
         (acc, conta) => acc + (conta.saldo || 0),
         0
      );
      const mesAtual = primeiroDiaMes.toLocaleDateString("pt-BR", {
         month: "long",
         year: "numeric",
      });

      return {
         mesAtual,
         saldoTotal,
         totalReceitas,
         totalDespesas,
         saldo: totalReceitas - totalDespesas,
         totalReceitasPagas,
         totalDespesasPagas,
         diferencaReceitas: totalReceitas - totalReceitasPagas,
         diferencaDespesas: totalDespesas - totalDespesasPagas,
         contaPagos,
         contaPendentes,
         contaAtrasados,
         totalAPagar: totalDespesas - totalDespesasPagas,
         despesasPorCategoria: Object.values(despesasPorCategoria).sort(
            (a, b) => b.valor - a.valor
         ),
         receitasPorCategoria: Object.values(receitasPorCategoria).sort(
            (a, b) => b.valor - a.valor
         ),
         transacoesMesAtual,
      };
   }

   renderizar() {
      if (!this.dados) return;

      this.renderHeader();
      this.renderSaldoCard();
      this.renderResumoMes();
      this.renderStatusPagamentos();
      this.renderGraficoDespesas();
      this.renderProximosVencimentos();
   }

   renderHeader() {
      const header = document.querySelector(".header__subtitle");
      if (header) {
         header.textContent = this.dados.mesAtual;
      }
   }

   renderSaldoCard() {
      const saldoValue = document.querySelector(".balance-card__value");
      if (saldoValue) {
         saldoValue.textContent = this.formatarMoeda(this.dados.saldoTotal);
      }
   }

   renderResumoMes() {
      const container = document.querySelector("#resumoMes");
      if (!container) return;

      container.innerHTML = `
         <div class="list-item">
            <span class="list-item__label">Provisionado</span>
            <span class="list-item__value list-item__value--neutral">
               ${this.formatarMoeda(this.dados.totalReceitas)}
            </span>
         </div>

         <div class="list-item">
            <span class="list-item__label">Real (Gastos)</span>
            <span class="list-item__value list-item__value--negative">
               ${this.formatarMoeda(this.dados.totalDespesasPagas)}
            </span>
         </div>

         <div class="list-item">
            <span class="list-item__label">Diferença</span>
            <span class="list-item__value ${
               this.dados.totalReceitas - this.dados.totalDespesasPagas > 0
                  ? "list-item__value--positive"
                  : "list-item__value--negative"
            }">
               ${this.formatarMoeda(
                  this.dados.totalReceitas - this.dados.totalDespesasPagas
               )}
            </span>
         </div>
      `;
   }

   renderStatusPagamentos() {
      const container = document.querySelector("#statusPagamentos");
      if (!container) return;

      container.innerHTML = `
         <div class="status-grid">
            <div class="status-box">
               <div class="status-box__label">Pagos</div>
               <div class="status-box__value text-success">${
                  this.dados.contaPagos
               }</div>
            </div>
            <div class="status-box">
               <div class="status-box__label">A Pagar</div>
               <div class="status-box__value text-warning">${
                  this.dados.contaPendentes
               }</div>
            </div>
         </div>

         <div class="list-item mt-md">
            <span class="list-item__label">Total a Pagar</span>
            <span class="list-item__value list-item__value--warning">
               ${this.formatarMoeda(this.dados.totalAPagar)}
            </span>
         </div>

         <div class="list-item">
            <span class="list-item__label">Total Pago</span>
            <span class="list-item__value list-item__value--negative">
               ${this.formatarMoeda(this.dados.totalDespesasPagas)}
            </span>
         </div>
         
         ${
            this.dados.contaAtrasados > 0
               ? `
            <div class="list-item">
               <span class="list-item__label">⚠️ Atrasados</span>
               <span class="list-item__value text-danger">
                  ${this.dados.contaAtrasados}
               </span>
            </div>
         `
               : ""
         }
      `;
   }

   renderGraficoDespesas() {
      const container = document.querySelector("#graficoDespesas");
      if (!container) return;

      if (this.dados.despesasPorCategoria.length === 0) {
         container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
               <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
               <p>Nenhuma despesa registrada neste mês</p>
            </div>
         `;
         return;
      }

      const totalDespesas = this.dados.despesasPorCategoria.reduce(
         (acc, cat) => acc + cat.valor,
         0
      );

      container.innerHTML = `
         <div class="chart-legend">
            ${this.dados.despesasPorCategoria
               .map((cat) => {
                  const percentual = (
                     (cat.valor / totalDespesas) *
                     100
                  ).toFixed(1);
                  return `
                  <div class="chart-legend-item">
                     <div class="chart-legend-item__header">
                        <div class="chart-legend-item__info">
                           <span class="chart-legend-item__icone">${
                              cat.icone
                           }</span>
                           <span class="chart-legend-item__nome">${
                              cat.nome
                           }</span>
                        </div>
                        <span class="chart-legend-item__valor">${this.formatarMoeda(
                           cat.valor
                        )}</span>
                     </div>
                     <div class="chart-legend-item__barra">
                        <div class="chart-legend-item__progresso" style="width: ${percentual}%; background: ${
                     cat.cor
                  };"></div>
                     </div>
                     <div class="chart-legend-item__percentual">${percentual}%</div>
                  </div>
               `;
               })
               .join("")}
         </div>
      `;
   }

   renderProximosVencimentos() {
      const container = document.querySelector("#proximosVencimentos");
      if (!container) return;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const proximosDias = new Date(hoje);
      proximosDias.setDate(proximosDias.getDate() + 7);

      const vencimentosProximos = this.dados.transacoesMesAtual
         .filter((t) => {
            if (t.status === "pago") return false;
            const vencimento = new Date(t.data_vencimento + "T00:00:00");
            vencimento.setHours(0, 0, 0, 0);
            return vencimento >= hoje && vencimento <= proximosDias;
         })
         .sort(
            (a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento)
         )
         .slice(0, 5);

      if (vencimentosProximos.length === 0) {
         container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
               <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
               <p>Nenhum vencimento nos próximos 7 dias</p>
            </div>
         `;
         return;
      }

      container.innerHTML = vencimentosProximos
         .map((t) => {
            const vencimento = new Date(t.data_vencimento + "T00:00:00");
            const diasRestantes = Math.ceil(
               (vencimento - hoje) / (1000 * 60 * 60 * 24)
            );

            let statusClass = "";
            let statusText = "";

            if (diasRestantes === 0) {
               statusClass = "text-warning";
               statusText = "Vence hoje";
            } else if (diasRestantes === 1) {
               statusClass = "text-warning";
               statusText = "Vence amanhã";
            } else {
               statusClass = "text-info";
               statusText = `Vence em ${diasRestantes} dias`;
            }

            return `
            <div class="list-item">
               <div class="list-item__label">
                  <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 2px;">
                     ${t.descricao}
                  </div>
                  <div style="font-size: 12px; color: var(--text-secondary);">
                     ${this.formatarData(t.data_vencimento)}
                  </div>
               </div>
               <div style="text-align: right;">
                  <div class="list-item__value ${
                     t.tipo === "receita"
                        ? "list-item__value--positive"
                        : "list-item__value--negative"
                  }">
                     ${this.formatarMoeda(t.valor)}
                  </div>
                  <div style="font-size: 11px; margin-top: 2px;" class="${statusClass}">
                     ${statusText}
                  </div>
               </div>
            </div>
         `;
         })
         .join("");
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
      });
   }
}

document.addEventListener("DOMContentLoaded", () => {
   window.dashboardManager = new DashboardManager();
});
