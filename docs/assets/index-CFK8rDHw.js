var x=Object.defineProperty;var H=(s,e,t)=>e in s?x(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var f=(s,e,t)=>H(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(a){if(a.ep)return;a.ep=!0;const n=t(a);fetch(a.href,n)}})();class j extends Error{constructor(e,t){super(e),this.status=t,this.name="ApiError"}}class F{constructor(e){f(this,"userId",null);this.baseUrl=e,this.userId=localStorage.getItem("todo_user_id")}setUserId(e){this.userId=e,e?localStorage.setItem("todo_user_id",e):localStorage.removeItem("todo_user_id")}getUserId(){return this.userId}async get(e){return this.request("GET",e)}async post(e,t){return this.request("POST",e,t)}async put(e,t){return this.request("PUT",e,t)}async delete(e){await this.request("DELETE",e)}async request(e,t,i){const a={"Content-Type":"application/json"};this.userId&&(a["X-User-Id"]=this.userId);const n=await fetch(`${this.baseUrl}${t}`,{method:e,headers:a,body:i!==void 0?JSON.stringify(i):void 0});if(n.status===204)return;const r=await n.json().catch(()=>({}));if(!n.ok){const o=typeof r=="object"&&r!==null&&"message"in r&&typeof r.message=="string"?r.message:`Помилка сервера (${n.status})`;throw new j(o,n.status)}return r}}const M="/api",h=new F(M),$="todo_current_user";class Y{constructor(){f(this,"currentUser",null);f(this,"listeners",[]);const e=localStorage.getItem($);if(e)try{this.currentUser=JSON.parse(e),h.setUserId(this.currentUser.id)}catch{this.currentUser=null}}getUser(){return this.currentUser}isAuthenticated(){return!!(this.currentUser&&h.getUserId())}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){for(const e of this.listeners)e(this.currentUser)}persistUser(e){this.currentUser=e,e?(localStorage.setItem($,JSON.stringify(e)),h.setUserId(e.id)):(localStorage.removeItem($),h.setUserId(null)),this.notify()}async register(e,t,i){const a=await h.post("/auth/register",{email:e,password:t,displayName:i});return this.persistUser(a.user),a.user}async login(e,t){const i=await h.post("/auth/login",{email:e,password:t});return this.persistUser(i.user),i.user}logout(){this.persistUser(null)}}const g=new Y,E={low:"Низький",medium:"Середній",high:"Високий"},I={work:"Робота",personal:"Особисте",study:"Навчання",other:"Інше"},q={high:3,medium:2,low:1};class J{constructor(){f(this,"tasks",[]);f(this,"listeners",[])}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){for(const e of this.listeners)e(this.tasks)}getTasks(){return[...this.tasks]}async syncFromServer(){const e=await h.get("/tasks");this.tasks=e,this.notify()}async create(e){const t=await h.post("/tasks",e);return this.tasks.push(t),this.notify(),t}async update(e,t){const i=await h.put(`/tasks/${e}`,t);return this.tasks=this.tasks.map(a=>a.id===e?i:a),this.notify(),i}async remove(e){await h.delete(`/tasks/${e}`),this.tasks=this.tasks.filter(t=>t.id!==e),this.notify()}filterAndSort(e,t,i){let a=[...this.tasks];if(e.search.trim()){const r=e.search.trim().toLowerCase();a=a.filter(o=>o.title.toLowerCase().includes(r))}e.priority!=="all"&&(a=a.filter(r=>r.priority===e.priority)),e.category!=="all"&&(a=a.filter(r=>r.category===e.category)),e.status==="active"?a=a.filter(r=>!r.completed):e.status==="completed"&&(a=a.filter(r=>r.completed));const n=i==="asc"?1:-1;return a.sort((r,o)=>{switch(t){case"priority":return(q[r.priority]-q[o.priority])*n;case"title":return r.title.localeCompare(o.title,"uk")*n;case"createdAt":return(new Date(r.createdAt).getTime()-new Date(o.createdAt).getTime())*n;case"deadline":default:return(new Date(r.deadline).getTime()-new Date(o.deadline).getTime())*n}}),a}getStats(){const e=Date.now(),t=1440*60*1e3;let i=0,a=0;for(const n of this.tasks){if(n.completed)continue;const r=new Date(n.deadline).getTime();r<e?i+=1:r-e<=t&&(a+=1)}return{total:this.tasks.length,active:this.tasks.filter(n=>!n.completed).length,completed:this.tasks.filter(n=>n.completed).length,overdue:i,dueSoon:a}}}const d=new J;function u(s,e="info",t=4e3){const i=document.getElementById("toast-root");if(!i)return;const a=document.createElement("div");a.className=`toast toast--${e}`,a.textContent=s,i.appendChild(a),requestAnimationFrame(()=>a.classList.add("toast--visible")),window.setTimeout(()=>{a.classList.remove("toast--visible"),window.setTimeout(()=>a.remove(),300)},t)}const T="todo_reminder_notified",K=6e4;class G{constructor(){f(this,"intervalId",null);f(this,"enabled",!0)}start(e){this.stop(),this.check(e),this.intervalId=window.setInterval(()=>{this.check(e)},K)}stop(){this.intervalId!==null&&(window.clearInterval(this.intervalId),this.intervalId=null)}setEnabled(e){this.enabled=e,localStorage.setItem("todo_reminders_enabled",String(e))}isEnabled(){const e=localStorage.getItem("todo_reminders_enabled");return e===null?this.enabled:e==="true"}getNotifiedIds(){try{const e=sessionStorage.getItem(T);return e?new Set(JSON.parse(e)):new Set}catch{return new Set}}saveNotifiedIds(e){sessionStorage.setItem(T,JSON.stringify([...e]))}check(e){if(!this.isEnabled())return;const t=Date.now(),i=1440*60*1e3,a=this.getNotifiedIds(),n=new Set(a);for(const r of e()){if(r.completed)continue;const l=new Date(r.deadline).getTime()-t,p=`${r.id}-${r.deadline}`;l<0&&!a.has(p)?(u(`Прострочено: «${r.title}»`,"warning",8e3),n.add(p),this.tryBrowserNotification(r.title,"Дедлайн минув!")):l>=0&&l<=i&&!a.has(p)&&(u(`Скоро дедлайн: «${r.title}»`,"info",6e3),n.add(p),this.tryBrowserNotification(r.title,"Дедлайн протягом 24 годин"))}this.saveNotifiedIds(n)}tryBrowserNotification(e,t){"Notification"in window&&Notification.permission==="granted"&&new Notification(e,{body:t,icon:"📋"})}async requestNotificationPermission(){return"Notification"in window?Notification.permission==="granted"?!0:Notification.permission==="denied"?!1:await Notification.requestPermission()==="granted":!1}}const b=new G,V={login:/^login$/,register:/^register$/,dashboard:/^dashboard$/,tasks:/^tasks$/,"task-new":/^tasks\/new$/,"task-edit":/^tasks\/edit\/(.+)$/,settings:/^settings$/};function L(){const e=window.location.hash.replace(/^#\/?/,"")||"dashboard";for(const[t,i]of Object.entries(V)){const a=e.match(i);if(a)return t==="task-edit"&&a[1]?{name:t,params:{id:a[1]}}:{name:t,params:{}}}return{name:"dashboard",params:{}}}class X{constructor(){f(this,"handler",null)}init(e){this.handler=e,window.addEventListener("hashchange",()=>this.emit()),this.emit()}navigate(e,t={}){let i;e==="task-new"?i="tasks/new":e==="task-edit"&&t.id?i=`tasks/edit/${t.id}`:i=e,window.location.hash=`#/${i}`}getCurrent(){return L()}emit(){this.handler&&this.handler(L())}}const c=new X;function z(s,e,t,i){var r,o;const n=[{route:"dashboard",label:"Дашборд",icon:"📊"},{route:"tasks",label:"Завдання",icon:"✅"},{route:"settings",label:"Налаштування",icon:"⚙️"}].map(l=>`
      <a href="#/${l.route}" class="nav-link ${e===l.route?"nav-link--active":""}" data-route="${l.route}">
        <span class="nav-icon">${l.icon}</span>
        <span class="nav-label">${l.label}</span>
      </a>`).join("");s.innerHTML=`
    <div class="app-shell">
      <header class="app-header">
        <div class="brand">
          <span class="brand-icon">📋</span>
          <span class="brand-text">Smart TODO</span>
        </div>
        <button type="button" class="btn btn--primary btn--sm" id="btn-add-task">
          + Додати завдання
        </button>
        <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Меню">☰</button>
      </header>
      <div class="app-body">
        <aside class="sidebar" id="sidebar">
          <nav class="sidebar-nav">${n}</nav>
          <div class="sidebar-user">
            <div class="user-avatar">${t.displayName.charAt(0).toUpperCase()}</div>
            <div class="user-info">
              <div class="user-name">${w(t.displayName)}</div>
              <div class="user-email">${w(t.email)}</div>
            </div>
          </div>
        </aside>
        <main class="main-content">${i}</main>
      </div>
    </div>
  `,(r=document.getElementById("btn-add-task"))==null||r.addEventListener("click",()=>{c.navigate("task-new")}),(o=document.getElementById("nav-toggle"))==null||o.addEventListener("click",()=>{var l;(l=document.getElementById("sidebar"))==null||l.classList.toggle("sidebar--open")}),s.querySelectorAll("[data-route]").forEach(l=>{l.addEventListener("click",()=>{var p;(p=document.getElementById("sidebar"))==null||p.classList.remove("sidebar--open")})})}function w(s){const e=document.createElement("div");return e.textContent=s,e.innerHTML}function Q(s){const e=s==="login";return`
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-logo">📋</span>
          <h1>Smart TODO Planner</h1>
          <p>${e?"Увійдіть до облікового запису":"Створіть обліковий запис"}</p>
        </div>
        <form id="auth-form" class="auth-form" novalidate>
          ${e?"":`<div class="form-group">
            <label for="displayName">Ім'я</label>
            <input type="text" id="displayName" name="displayName" placeholder="Ваше ім'я" autocomplete="name" />
          </div>`}
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="you@example.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label for="password">Пароль</label>
            <input type="password" id="password" name="password" required minlength="6" placeholder="мін. 6 символів" autocomplete="${e?"current-password":"new-password"}" />
          </div>
          <p class="form-error" id="auth-error" hidden></p>
          <button type="submit" class="btn btn--primary btn--block">
            ${e?"Увійти":"Зареєструватися"}
          </button>
        </form>
        <p class="auth-switch">
          ${e?'Немає облікового запису? <a href="#/register">Зареєструватися</a>':'Вже є обліковий запис? <a href="#/login">Увійти</a>'}
        </p>
      </div>
    </div>
  `}function W(s,e){const t=s.querySelector("#auth-form"),i=s.querySelector("#auth-error");t==null||t.addEventListener("submit",async a=>{if(a.preventDefault(),!i)return;i.hidden=!0;const n=t.querySelector("#email").value,r=t.querySelector("#password").value,o=t.querySelector("#displayName"),l=(o==null?void 0:o.value)??"";try{e==="login"?(await g.login(n,r),u("Вітаємо!","success")):(await g.register(n,r,l),u("Реєстрацію завершено!","success")),c.navigate("dashboard")}catch(p){const B=p instanceof Error?p.message:"Помилка авторизації";i.textContent=B,i.hidden=!1}})}function Z(s){return new Date(s).toLocaleDateString("uk-UA",{day:"numeric",month:"short",year:"numeric"})}function O(s){const e=new Date(s),t=i=>String(i).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}function ee(s,e){if(e)return"ok";const t=Date.now(),i=new Date(s).getTime(),a=1440*60*1e3;return i<t?"overdue":i-t<=a?"soon":"ok"}function _(s,e={}){const t=e.showActions!==!1,i=ee(s.deadline,s.completed),a=i==="overdue"?"task-card--overdue":i==="soon"?"task-card--soon":"";return`
    <article class="task-card ${s.completed?"task-card--done":""} ${a}" data-id="${s.id}">
      <label class="task-check">
        <input type="checkbox" class="task-toggle" data-id="${s.id}" ${s.completed?"checked":""} />
        <span class="checkmark"></span>
      </label>
      <div class="task-body">
        <h3 class="task-title">${w(s.title)}</h3>
        <div class="task-meta">
          <span class="badge badge--priority-${s.priority}">${E[s.priority]}</span>
          <span class="badge badge--category">${I[s.category]}</span>
          <span class="task-deadline">📅 ${Z(s.deadline)}</span>
        </div>
      </div>
      ${t?`<div class="task-actions">
        <button type="button" class="btn btn--ghost btn--icon task-edit" data-id="${s.id}" title="Редагувати">✏️</button>
        <button type="button" class="btn btn--ghost btn--icon task-delete" data-id="${s.id}" title="Видалити">🗑️</button>
      </div>`:""}
    </article>
  `}function C(s,e){s.querySelectorAll(".task-toggle").forEach(t=>{t.addEventListener("change",()=>{const i=t.dataset.id;i&&e.onToggle(i,t.checked)})}),s.querySelectorAll(".task-edit").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.id;i&&e.onEdit(i)})}),s.querySelectorAll(".task-delete").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.id;i&&confirm("Видалити це завдання?")&&e.onDelete(i)})})}function N(){const s=d.getStats(),e=d.filterAndSort({search:"",priority:"all",category:"all",status:"active"},"deadline","asc").slice(0,5),t=e.length>0?e.map(i=>_(i,{showActions:!1})).join(""):'<p class="empty-state">Немає активних завдань. Додайте перше!</p>';return`
    <div class="page">
      <header class="page-header">
        <h1>Дашборд</h1>
        <p class="page-subtitle">Огляд ваших завдань</p>
      </header>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">${s.total}</span>
          <span class="stat-label">Усього</span>
        </div>
        <div class="stat-card stat-card--accent">
          <span class="stat-value">${s.active}</span>
          <span class="stat-label">Активні</span>
        </div>
        <div class="stat-card stat-card--success">
          <span class="stat-value">${s.completed}</span>
          <span class="stat-label">Виконані</span>
        </div>
        <div class="stat-card stat-card--warning">
          <span class="stat-value">${s.dueSoon}</span>
          <span class="stat-label">Скоро дедлайн</span>
        </div>
        <div class="stat-card stat-card--danger">
          <span class="stat-value">${s.overdue}</span>
          <span class="stat-label">Прострочені</span>
        </div>
      </div>
      <section class="section">
        <div class="section-header">
          <h2>Найближчі завдання</h2>
          <a href="#/tasks" class="link">Усі завдання →</a>
        </div>
        <div class="task-list" id="dashboard-tasks">${t}</div>
      </section>
    </div>
  `}function te(s){const e=s.querySelector("#dashboard-tasks");e&&C(e,{onToggle:async(t,i)=>{await d.update(t,{completed:i})},onEdit:t=>c.navigate("task-edit",{id:t}),onDelete:async t=>{await d.remove(t)}})}let v={search:"",priority:"all",category:"all",status:"all"},y="deadline",k="asc";function se(){const s=d.filterAndSort(v,y,k),e=s.length>0?s.map(t=>_(t)).join(""):'<p class="empty-state">Завдань не знайдено. Змініть фільтри або додайте нове.</p>';return`
    <div class="page">
      <header class="page-header">
        <h1>Завдання</h1>
        <p class="page-subtitle">Список усіх завдань з фільтрацією та сортуванням</p>
      </header>
      <div class="toolbar card">
        <div class="toolbar-row">
          <input type="search" id="filter-search" class="input" placeholder="Пошук..." value="${v.search}" />
          <select id="filter-priority" class="select">
            <option value="all">Усі пріоритети</option>
            ${["low","medium","high"].map(t=>`<option value="${t}" ${v.priority===t?"selected":""}>${E[t]}</option>`).join("")}
          </select>
          <select id="filter-category" class="select">
            <option value="all">Усі категорії</option>
            ${["work","personal","study","other"].map(t=>`<option value="${t}" ${v.category===t?"selected":""}>${I[t]}</option>`).join("")}
          </select>
          <select id="filter-status" class="select">
            <option value="all" ${v.status==="all"?"selected":""}>Усі статуси</option>
            <option value="active" ${v.status==="active"?"selected":""}>Активні</option>
            <option value="completed" ${v.status==="completed"?"selected":""}>Виконані</option>
          </select>
        </div>
        <div class="toolbar-row">
          <select id="sort-field" class="select">
            <option value="deadline" ${y==="deadline"?"selected":""}>За дедлайном</option>
            <option value="priority" ${y==="priority"?"selected":""}>За пріоритетом</option>
            <option value="title" ${y==="title"?"selected":""}>За назвою</option>
            <option value="createdAt" ${y==="createdAt"?"selected":""}>За датою створення</option>
          </select>
          <select id="sort-direction" class="select">
            <option value="asc" ${k==="asc"?"selected":""}>За зростанням</option>
            <option value="desc" ${k==="desc"?"selected":""}>За спаданням</option>
          </select>
          <button type="button" class="btn btn--secondary" id="btn-sync">🔄 Синхронізувати</button>
        </div>
      </div>
      <div class="task-list" id="tasks-list">${e}</div>
    </div>
  `}function ae(s,e){var a,n;const t=()=>{v={search:s.querySelector("#filter-search").value,priority:s.querySelector("#filter-priority").value,category:s.querySelector("#filter-category").value,status:s.querySelector("#filter-status").value},y=s.querySelector("#sort-field").value,k=s.querySelector("#sort-direction").value,e()};(a=s.querySelector("#filter-search"))==null||a.addEventListener("input",t),["#filter-priority","#filter-category","#filter-status","#sort-field","#sort-direction"].forEach(r=>{var o;return(o=s.querySelector(r))==null?void 0:o.addEventListener("change",t)}),(n=s.querySelector("#btn-sync"))==null||n.addEventListener("click",async()=>{try{await d.syncFromServer(),u("Синхронізовано з сервером","success"),e()}catch(r){u(r instanceof Error?r.message:"Помилка синхронізації","error")}});const i=s.querySelector("#tasks-list");i&&C(i,{onToggle:async(r,o)=>{await d.update(r,{completed:o})},onEdit:r=>c.navigate("task-edit",{id:r}),onDelete:async r=>{await d.remove(r),e()}})}function ie(){const s=new Date;return s.setDate(s.getDate()+7),O(s.toISOString())}function A(s){const e=!!s,t=s?{title:s.title,priority:s.priority,deadline:O(s.deadline),category:s.category}:{title:"",priority:"medium",deadline:ie(),category:"personal"},i=["low","medium","high"].map(n=>`<option value="${n}" ${t.priority===n?"selected":""}>${E[n]}</option>`).join(""),a=["work","personal","study","other"].map(n=>`<option value="${n}" ${t.category===n?"selected":""}>${I[n]}</option>`).join("");return`
    <div class="page page--narrow">
      <header class="page-header">
        <h1>${e?"Редагування завдання":"Нове завдання"}</h1>
        <p class="page-subtitle">${e?"Змініть дані та збережіть":"Заповніть форму для створення"}</p>
      </header>
      <form id="task-form" class="card form-card" novalidate>
        <div class="form-group">
          <label for="title">Назва</label>
          <input type="text" id="title" name="title" required value="${t.title.replace(/"/g,"&quot;")}" placeholder="Назва завдання" />
        </div>
        <div class="form-group">
          <label for="priority">Пріоритет</label>
          <select id="priority" name="priority" class="select">${i}</select>
        </div>
        <div class="form-group">
          <label for="deadline">Дедлайн</label>
          <input type="date" id="deadline" name="deadline" required value="${t.deadline}" />
        </div>
        <div class="form-group">
          <label for="category">Категорія</label>
          <select id="category" name="category" class="select">${a}</select>
        </div>
        <p class="form-error" id="form-error" hidden></p>
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">Зберегти</button>
          <button type="button" class="btn btn--secondary" id="btn-cancel">Скасувати</button>
        </div>
      </form>
    </div>
  `}function D(s,e){var a;const t=s.querySelector("#task-form"),i=s.querySelector("#form-error");(a=s.querySelector("#btn-cancel"))==null||a.addEventListener("click",()=>{c.navigate("tasks")}),t==null||t.addEventListener("submit",async n=>{if(n.preventDefault(),!t||!i)return;i.hidden=!0;const r={title:t.querySelector("#title").value,priority:t.querySelector("#priority").value,deadline:t.querySelector("#deadline").value,category:t.querySelector("#category").value};if(!r.title.trim()){i.textContent="Вкажіть назву завдання",i.hidden=!1;return}const o=new Date(r.deadline+"T23:59:59").toISOString();try{e?(await d.update(e,{...r,deadline:o}),u("Завдання оновлено","success")):(await d.create({...r,deadline:o}),u("Завдання створено","success")),c.navigate("tasks")}catch(l){i.textContent=l instanceof Error?l.message:"Помилка збереження",i.hidden=!1}})}function re(){const s=g.getUser(),e=b.isEnabled();return`
    <div class="page page--narrow">
      <header class="page-header">
        <h1>Налаштування</h1>
        <p class="page-subtitle">Профіль та параметри додатку</p>
      </header>
      <section class="card settings-section">
        <h2>Профіль</h2>
        <dl class="settings-dl">
          <dt>Ім'я</dt>
          <dd>${s?w(s.displayName):"—"}</dd>
          <dt>Email</dt>
          <dd>${s?w(s.email):"—"}</dd>
        </dl>
      </section>
      <section class="card settings-section">
        <h2>Нагадування</h2>
        <label class="toggle-row">
          <input type="checkbox" id="reminders-enabled" ${e?"checked":""} />
          <span>Сповіщення про дедлайни (в додатку та браузері)</span>
        </label>
        <button type="button" class="btn btn--secondary" id="btn-notify-permission">
          Дозволити push-сповіщення браузера
        </button>
      </section>
      <section class="card settings-section">
        <h2>Синхронізація</h2>
        <p class="text-muted">Завдання зберігаються на сервері та доступні після входу з будь-якого пристрою.</p>
        <button type="button" class="btn btn--secondary" id="btn-settings-sync">Синхронізувати зараз</button>
      </section>
      <section class="card settings-section settings-section--danger">
        <h2>Сесія</h2>
        <button type="button" class="btn btn--danger" id="btn-logout">Вийти з облікового запису</button>
      </section>
    </div>
  `}function ne(s){var e,t,i,a;(e=s.querySelector("#reminders-enabled"))==null||e.addEventListener("change",n=>{const r=n.target.checked;b.setEnabled(r),u(r?"Нагадування увімкнено":"Нагадування вимкнено","info")}),(t=s.querySelector("#btn-notify-permission"))==null||t.addEventListener("click",async()=>{const n=await b.requestNotificationPermission();u(n?"Дозвіл надано":"Дозвіл не надано або не підтримується",n?"success":"warning")}),(i=s.querySelector("#btn-settings-sync"))==null||i.addEventListener("click",async()=>{try{await d.syncFromServer(),u("Дані синхронізовано","success")}catch(n){u(n instanceof Error?n.message:"Помилка","error")}}),(a=s.querySelector("#btn-logout"))==null||a.addEventListener("click",()=>{g.logout(),b.stop(),c.navigate("login"),u("Ви вийшли з облікового запису","info")})}const P=document.getElementById("app");if(!P)throw new Error("Root element #app not found");const m=P,U=["login","register"];function oe(s){return s.name==="task-new"||s.name==="task-edit"?"tasks":s.name}async function R(){if(g.isAuthenticated())try{await d.syncFromServer(),b.start(()=>d.getTasks())}catch(s){u(s instanceof Error?s.message:"Не вдалося завантажити завдання. Перевірте сервер.","error",6e3)}}function S(s){if(!g.isAuthenticated()){if(!U.includes(s.name)){c.navigate("login");return}const a=s.name==="register"?"register":"login";m.innerHTML=Q(a),W(m,a);return}if(U.includes(s.name)){c.navigate("dashboard");return}const e=g.getUser();if(!e){c.navigate("login");return}let t="";const i=()=>S(c.getCurrent());switch(s.name){case"dashboard":t=N();break;case"tasks":t=se();break;case"task-new":t=A();break;case"task-edit":{const a=d.getTasks().find(n=>n.id===s.params.id);t=A(a);break}case"settings":t=re();break;default:t=N()}switch(z(m,oe(s),e,t),s.name){case"dashboard":te(m);break;case"tasks":ae(m,i);break;case"task-new":D(m);break;case"task-edit":D(m,s.params.id);break;case"settings":ne(m);break}}g.subscribe(()=>{R().then(()=>S(c.getCurrent()))});d.subscribe(()=>{g.isAuthenticated()&&S(c.getCurrent())});c.init(s=>{S(s)});R().then(()=>{g.isAuthenticated()&&!window.location.hash&&c.navigate("dashboard")});
