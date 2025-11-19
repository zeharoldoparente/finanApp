const APP_CONFIG = {
   name: "Controle Financeiro",
   version: "1.0.0",
   currency: "BRL",
   locale: "pt-BR",
};

document.addEventListener("DOMContentLoaded", () => {
   console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} iniciado`);

   initializeApp();
});

function initializeApp() {
   if (typeof Navigation !== "undefined") {
      new Navigation();
   }

   setupGlobalListeners();
   loadUserData();
}
function setupGlobalListeners() {
   document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
         e.preventDefault();
      });
   });
}
function loadUserData() {
   const userData = localStorage.getItem("financeAppData");
   if (userData) {
      try {
         const data = JSON.parse(userData);
         console.log("Dados do usuário carregados:", data);
      } catch (error) {
         console.error("Erro ao carregar dados:", error);
      }
   }
}
function saveUserData(data) {
   try {
      localStorage.setItem("financeAppData", JSON.stringify(data));
      console.log("Dados salvos com sucesso");
   } catch (error) {
      console.error("Erro ao salvar dados:", error);
   }
}
function formatCurrency(value) {
   return new Intl.NumberFormat(APP_CONFIG.locale, {
      style: "currency",
      currency: APP_CONFIG.currency,
   }).format(value);
}
function formatDate(date, options = {}) {
   const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
   };

   return new Intl.DateTimeFormat(APP_CONFIG.locale, {
      ...defaultOptions,
      ...options,
   }).format(new Date(date));
}

window.AppUtils = {
   formatCurrency,
   formatDate,
   saveUserData,
   loadUserData,
};
