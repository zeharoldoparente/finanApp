class Navigation {
   constructor() {
      this.navItems = document.querySelectorAll(".nav-item");
      this.currentPage = this.getCurrentPage();
      this.init();
   }

   init() {
      this.setActivePage();
      this.attachEventListeners();
   }

   getCurrentPage() {
      const path = window.location.pathname;
      const fileName = path.split("/").pop();
      if (fileName === "" || fileName === "index.html") {
         return "index";
      }
      return fileName.replace(".html", "");
   }

   setActivePage() {
      this.navItems.forEach((item) => {
         const itemPage = item.dataset.page;
         if (itemPage === this.currentPage) {
            item.classList.add("active");
         } else {
            item.classList.remove("active");
         }
      });
   }

   attachEventListeners() {
      this.navItems.forEach((item) => {
         item.addEventListener("click", (e) => this.handleNavClick(e, item));
      });
   }

   handleNavClick(e, item) {
      e.preventDefault();

      const targetPage = item.dataset.page;

      if (targetPage === this.currentPage) {
         return;
      }
      this.navItems.forEach((navItem) => navItem.classList.remove("active"));
      item.classList.add("active");
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
}

window.Navigation = Navigation;
