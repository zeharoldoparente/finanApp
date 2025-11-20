class Navigation {
   constructor() {
      this.currentPage = this.getCurrentPage();
      this.isMobile = window.innerWidth < 768;
      this.init();
   }

   init() {
      this.createSidebar();
      this.setActivePage();
      this.attachEventListeners();
      this.handleResize();
   }

   getCurrentPage() {
      const path = window.location.pathname;
      const fileName = path.split("/").pop();
      if (fileName === "" || fileName === "index.html") {
         return "index";
      }
      return fileName.replace(".html", "");
   }

   createSidebar() {
      // Verifica se já existe sidebar
      if (document.querySelector(".sidebar")) {
         return;
      }

      // Cria sidebar apenas para desktop
      if (window.innerWidth >= 768) {
         const sidebar = document.createElement("aside");
         sidebar.className = "sidebar";
         sidebar.innerHTML = `
            <div class="sidebar__logo">
               <div class="sidebar__logo-title">💰 Financeiro</div>
            </div>
            <nav class="sidebar__menu">
               <div class="sidebar__item" data-page="index">
                  <div class="sidebar__icon">
                     <svg viewBox="0 0 24 24">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                     </svg>
                  </div>
                  <span class="sidebar__label">Dashboard</span>
               </div>

               <div class="sidebar__item" data-page="cadastro">
                  <div class="sidebar__icon">
                     <svg viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                     </svg>
                  </div>
                  <span class="sidebar__label">Cadastros</span>
               </div>

               <div class="sidebar__item" data-page="transacoes">
                  <div class="sidebar__icon">
                     <svg viewBox="0 0 24 24">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                     </svg>
                  </div>
                  <span class="sidebar__label">Transações</span>
               </div>

               <div class="sidebar__item" data-page="perfil">
                  <div class="sidebar__icon">
                     <svg viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                     </svg>
                  </div>
                  <span class="sidebar__label">Perfil</span>
               </div>
            </nav>
            <div class="sidebar__footer">
               <div class="sidebar__version">v1.0.0</div>
            </div>
         `;

         document.body.insertBefore(sidebar, document.body.firstChild);

         // Adiciona listeners aos itens da sidebar
         const sidebarItems = sidebar.querySelectorAll(".sidebar__item");
         sidebarItems.forEach((item) => {
            item.addEventListener("click", (e) => this.handleNavClick(e, item));
         });
      }
   }

   setActivePage() {
      // Remove active de todos
      document.querySelectorAll(".nav-item, .sidebar__item").forEach((item) => {
         item.classList.remove("active");
      });

      // Adiciona active ao item da página atual
      document
         .querySelectorAll(
            `.nav-item[data-page="${this.currentPage}"], .sidebar__item[data-page="${this.currentPage}"]`
         )
         .forEach((item) => {
            item.classList.add("active");
         });
   }

   attachEventListeners() {
      // Navbar rodapé (mobile)
      const navItems = document.querySelectorAll(".nav-item");
      navItems.forEach((item) => {
         item.addEventListener("click", (e) => this.handleNavClick(e, item));
      });

      // Sidebar items já foram adicionados no createSidebar
   }

   handleNavClick(e, item) {
      e.preventDefault();
      e.stopPropagation();

      const targetPage = item.dataset.page;

      if (!targetPage || targetPage === this.currentPage) {
         return;
      }

      // Remove active de todos
      document
         .querySelectorAll(".nav-item, .sidebar__item")
         .forEach((navItem) => navItem.classList.remove("active"));

      // Adiciona active ao clicado
      document
         .querySelectorAll(
            `.nav-item[data-page="${targetPage}"], .sidebar__item[data-page="${targetPage}"]`
         )
         .forEach((navItem) => {
            navItem.classList.add("active");
         });

      this.navigateTo(targetPage);
   }

   navigateTo(page) {
      setTimeout(() => {
         if (page === "index") {
            window.location.href = "./index.html";
         } else {
            window.location.href = `./${page}.html`;
         }
      }, 150);
   }

   handleResize() {
      let resizeTimer;
      window.addEventListener("resize", () => {
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(() => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth < 768;

            // Se mudou de mobile para desktop ou vice-versa
            if (wasMobile !== this.isMobile) {
               if (!this.isMobile) {
                  // Mudou para desktop - cria sidebar
                  this.createSidebar();
                  this.setActivePage();
               } else {
                  // Mudou para mobile - remove sidebar
                  const sidebar = document.querySelector(".sidebar");
                  if (sidebar) {
                     sidebar.remove();
                  }
                  this.setActivePage();
               }
            }
         }, 250);
      });
   }
}

window.Navigation = Navigation;
