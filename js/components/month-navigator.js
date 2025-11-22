class MonthNavigator {
   constructor(containerId, onChange) {
      this.container = document.getElementById(containerId);
      this.onChange = onChange;
      this.currentDate = new Date();
      this.init();
   }

   init() {
      this.render();
      this.attachEventListeners();
   }

   render() {
      const monthName = this.currentDate.toLocaleDateString("pt-BR", {
         month: "long",
      });
      const year = this.currentDate.getFullYear();

      this.container.innerHTML = `
         <div class="month-navigator">
            <div class="month-navigator__controls">
               <button class="month-navigator__btn" id="prevMonth" title="Mês anterior">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
               </button>
               
               <div class="month-navigator__current">
                  <div class="month-navigator__month">${monthName}</div>
                  <div class="month-navigator__year">${year}</div>
               </div>
               
               <button class="month-navigator__btn" id="nextMonth" title="Próximo mês">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
               </button>
            </div>
            
            <button class="month-navigator__today" id="todayMonth">
               Hoje
            </button>
         </div>
      `;
   }

   attachEventListeners() {
      const prevBtn = document.getElementById("prevMonth");
      const nextBtn = document.getElementById("nextMonth");
      const todayBtn = document.getElementById("todayMonth");

      prevBtn?.addEventListener("click", () => this.previousMonth());
      nextBtn?.addEventListener("click", () => this.nextMonth());
      todayBtn?.addEventListener("click", () => this.goToToday());
   }

   previousMonth() {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
      this.attachEventListeners();
      this.notifyChange();
   }

   nextMonth() {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
      this.attachEventListeners();
      this.notifyChange();
   }

   goToToday() {
      this.currentDate = new Date();
      this.render();
      this.attachEventListeners();
      this.notifyChange();
   }

   notifyChange() {
      if (this.onChange) {
         this.onChange({
            year: this.currentDate.getFullYear(),
            month: this.currentDate.getMonth(),
            firstDay: new Date(
               this.currentDate.getFullYear(),
               this.currentDate.getMonth(),
               1
            ),
            lastDay: new Date(
               this.currentDate.getFullYear(),
               this.currentDate.getMonth() + 1,
               0
            ),
         });
      }
   }

   getCurrentPeriod() {
      return {
         year: this.currentDate.getFullYear(),
         month: this.currentDate.getMonth(),
         firstDay: new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            1
         ),
         lastDay: new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
            0
         ),
      };
   }

   setDate(year, month) {
      this.currentDate = new Date(year, month, 1);
      this.render();
      this.attachEventListeners();
   }
}

if (typeof window !== "undefined") {
   window.MonthNavigator = MonthNavigator;
}
