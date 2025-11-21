const TransacaoModel = {
   id: null,
   tipo: "despesa",
   descricao: "",
   valor: 0,
   valorPago: null,
   categoria_id: null,
   data_vencimento: null,
   data_pagamento: null,
   status: "pendente",
   metodo_pagamento: null,
   cartao_id: null,
   conta_id: null,
   parcelado: false,
   num_parcela_atual: null,
   total_parcelas: null,
   valor_parcela: null,
   parcelamento_id: null,
   tipo_parcelamento: null,
   recorrente: false,
   tipo_recorrencia: null,
   recorrencia_id: null,
   recorrencia_ativa: true,
   tags: [],
   observacoes: "",
   criado_em: null,
   atualizado_em: null,
};

const MetodosPagamento = {
   DEBITO: {
      id: "debito",
      nome: "Cartão de Débito",
      icone: "💳",
      requer_cartao: true,
      permite_parcelamento: false,
   },
   CREDITO: {
      id: "credito",
      nome: "Cartão de Crédito",
      icone: "💳",
      requer_cartao: true,
      permite_parcelamento: true,
   },
   PIX: {
      id: "pix",
      nome: "PIX",
      icone: "📱",
      requer_cartao: false,
      permite_parcelamento: false,
   },
   BOLETO: {
      id: "boleto",
      nome: "Boleto",
      icone: "📄",
      requer_cartao: false,
      permite_parcelamento: false,
   },
   DINHEIRO: {
      id: "dinheiro",
      nome: "Dinheiro",
      icone: "💵",
      requer_cartao: false,
      permite_parcelamento: false,
   },
   TRANSFERENCIA: {
      id: "transferencia",
      nome: "Transferência Bancária",
      icone: "🏦",
      requer_cartao: false,
      permite_parcelamento: false,
   },
};

const TiposRecorrencia = {
   MENSAL: { id: "mensal", nome: "Mensal", icone: "📅" },
   ANUAL: { id: "anual", nome: "Anual", icone: "📆" },
   SEMANAL: { id: "semanal", nome: "Semanal", icone: "🗓️" },
   QUINZENAL: { id: "quinzenal", nome: "Quinzenal", icone: "📋" },
};

const StatusTransacao = {
   PENDENTE: { id: "pendente", nome: "Pendente", cor: "#f59e0b", icone: "⏳" },
   PAGO: { id: "pago", nome: "Pago", cor: "#10b981", icone: "✅" },
   ATRASADO: { id: "atrasado", nome: "Atrasado", cor: "#ef4444", icone: "⚠️" },
   AGENDADO: { id: "agendado", nome: "Agendado", cor: "#3b82f6", icone: "📌" },
};

const CategoriasPreDefinidas = {
   DESPESAS: [
      { nome: "Alimentação", icone: "🍔", cor: "#ef4444" },
      { nome: "Transporte", icone: "🚗", cor: "#3b82f6" },
      { nome: "Moradia", icone: "🏠", cor: "#8b5cf6" },
      { nome: "Saúde", icone: "💊", cor: "#ec4899" },
      { nome: "Educação", icone: "🎓", cor: "#14b8a6" },
      { nome: "Lazer", icone: "🎮", cor: "#f59e0b" },
      { nome: "Vestuário", icone: "👕", cor: "#06b6d4" },
      { nome: "Contas Fixas", icone: "📋", cor: "#6366f1" },
      { nome: "Outros", icone: "📦", cor: "#64748b" },
   ],
   RECEITAS: [
      { nome: "Salário", icone: "💰", cor: "#10b981" },
      { nome: "Freelance", icone: "💼", cor: "#3b82f6" },
      { nome: "Investimentos", icone: "📈", cor: "#8b5cf6" },
      { nome: "Outros", icone: "💵", cor: "#64748b" },
   ],
};

function calcularStatus(transacao) {
   if (transacao.valorPago !== null) {
      return "pago";
   }

   const hoje = new Date();
   hoje.setHours(0, 0, 0, 0);

   const vencimento = new Date(transacao.data_vencimento);
   vencimento.setHours(0, 0, 0, 0);

   if (vencimento < hoje) {
      return "atrasado";
   } else if (vencimento.getTime() === hoje.getTime() || vencimento > hoje) {
      return "agendado";
   }

   return "pendente";
}

function gerarParcelas(transacaoBase, numParcelas) {
   const parcelas = [];
   const valorParcela = transacaoBase.valor / numParcelas;
   const dataInicio = new Date(transacaoBase.data_vencimento);
   const parcelamentoId = Date.now();

   for (let i = 1; i <= numParcelas; i++) {
      const dataVencimento = new Date(dataInicio);
      dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1));

      parcelas.push({
         ...transacaoBase,
         id: Date.now() + i,
         valor: valorParcela,
         valor_parcela: valorParcela,
         num_parcela_atual: i,
         total_parcelas: numParcelas,
         parcelamento_id: parcelamentoId,
         data_vencimento: dataVencimento.toISOString().split("T")[0],
         descricao: `${transacaoBase.descricao} (${i}/${numParcelas})`,
      });
   }

   return parcelas;
}

function gerarRecorrencias(transacaoBase, tipoRecorrencia, quantidade = 12) {
   const recorrencias = [];
   const dataInicio = new Date(transacaoBase.data_vencimento);
   const recorrenciaId = Date.now();

   for (let i = 0; i < quantidade; i++) {
      const dataVencimento = new Date(dataInicio);

      switch (tipoRecorrencia) {
         case "mensal":
            dataVencimento.setMonth(dataVencimento.getMonth() + i);
            break;
         case "anual":
            dataVencimento.setFullYear(dataVencimento.getFullYear() + i);
            break;
         case "semanal":
            dataVencimento.setDate(dataVencimento.getDate() + i * 7);
            break;
         case "quinzenal":
            dataVencimento.setDate(dataVencimento.getDate() + i * 15);
            break;
      }

      recorrencias.push({
         ...transacaoBase,
         id: Date.now() + i + 1000,
         recorrencia_id: recorrenciaId,
         data_vencimento: dataVencimento.toISOString().split("T")[0],
      });
   }

   return recorrencias;
}

function formatarMoeda(valor) {
   return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
   }).format(valor);
}

function formatarData(data, formato = "completo") {
   const d = new Date(data + "T00:00:00");

   if (formato === "completo") {
      return d.toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "long",
         year: "numeric",
      });
   } else if (formato === "curto") {
      return d.toLocaleDateString("pt-BR");
   } else if (formato === "mes-ano") {
      return d.toLocaleDateString("pt-BR", {
         month: "long",
         year: "numeric",
      });
   }

   return d.toLocaleDateString("pt-BR");
}

if (typeof window !== "undefined") {
   window.FinanceModels = {
      TransacaoModel,
      MetodosPagamento,
      TiposRecorrencia,
      StatusTransacao,
      CategoriasPreDefinidas,
      calcularStatus,
      gerarParcelas,
      gerarRecorrencias,
      formatarMoeda,
      formatarData,
   };
}
