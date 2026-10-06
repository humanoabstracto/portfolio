/* ═══════════════════════════════════════════════════════════════════
   Escritorio Web · Lógica
   No necesitas editar este archivo para cambiar contenido:
   todo sale de js/config.js.

   Índice
     1. Utilidades
     2. Barra de menú y reloj
     3. Escritorio: nota, íconos
     4. Dock
     5. Gestor de ventanas
     6. Contenido de ventanas: Vista previa, Fotos, QuickTime, Finder
     7. Descarga de archivos
     8. Mail, notificación y alerta
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  "use strict";
  const C = window.CONFIG;

  /* ─── 1. Utilidades ──────────────────────────────────────────── */
  // En la versión de un solo archivo, las rutas se resuelven desde un
  // paquete incrustado (window.__ASSETS). En la versión con carpetas,
  // se usa la ruta tal cual.
  const asset = (p) => (p && window.__ASSETS && window.__ASSETS[p]) || p;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const isMobile = () => matchMedia("(max-width:768px)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fileName = (p) => (p || "").split("/").pop();
  const store = {
    get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch{ return null; } },
    set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} }
  };
  // Hace visible un elemento dentro de su contenedor con scroll, sin mover nada más
  function revealIn(container, el){
    if(!container || !el) return;
    const c = container.getBoundingClientRect(), r = el.getBoundingClientRect();
    if(r.top < c.top) container.scrollTop -= c.top - r.top;
    else if(r.bottom > c.bottom) container.scrollTop += r.bottom - c.bottom;
    if(r.left < c.left) container.scrollLeft -= c.left - r.left;
    else if(r.right > c.right) container.scrollLeft += r.right - c.right;
  }
  const dockIcon = (id) => asset(C.dock.find(d => d.id === id)?.icon);
  const itemById = (id) => C.desktop.find(d => d.id === id);

  /* ─── 2. Barra de menú y reloj ───────────────────────────────── */
  document.title = C.pageTitle;
  $("#brand").textContent = C.owner;
  $("#menus").innerHTML = C.menus.map(m => `<span class="menu">${esc(m)}</span>`).join("");

  const clock = $("#clock");
  const fDate = new Intl.DateTimeFormat("es-PE", { weekday:"short", day:"numeric", month:"short" });
  const fTime = new Intl.DateTimeFormat("es-PE", { hour:"numeric", minute:"2-digit" });
  (function tick(){
    const now = new Date();
    $(".date", clock).textContent = fDate.format(now).replace(/[.,]/g, "");
    $(".time", clock).textContent = fTime.format(now);
    clock.dateTime = now.toISOString();
    setTimeout(tick, 1000 - now.getMilliseconds() + 5);
  })();

  /* ─── 3. Escritorio ──────────────────────────────────────────── */
  const desktop = $("#desktop");
  desktop.style.backgroundImage = `url("${asset(C.wallpaper)}")`;

  // Nota adhesiva
  const sticky = $("#sticky");
  $("#sticky-title").textContent = C.note.title;
  $("#sticky-text").innerHTML = C.note.paragraphs.map(p => `<p>${esc(p)}</p>`).join("");
  sticky.style.left = C.note.pos.left; sticky.style.top = C.note.pos.top;

  function toggleNote(){
    sticky.classList.toggle("is-hidden");
    const visible = !sticky.classList.contains("is-hidden");
    dockBtn("notas")?.classList.toggle("running", visible);
    if(visible && isMobile()) sticky.scrollIntoView({ behavior:"smooth", block:"center" });
  }

  sticky.addEventListener("pointerdown", e => {
    if(isMobile()) return;
    const r = sticky.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    sticky.setPointerCapture(e.pointerId); sticky.classList.add("dragging");
    const move = ev => {
      sticky.style.left = Math.min(Math.max(ev.clientX - dx, 0), innerWidth - r.width) + "px";
      sticky.style.top  = Math.min(Math.max(ev.clientY - dy, 28), innerHeight - 80) + "px";
    };
    const up = () => { sticky.removeEventListener("pointermove", move); sticky.classList.remove("dragging"); };
    sticky.addEventListener("pointermove", move);
    sticky.addEventListener("pointerup", up, { once:true });
  });

  // Ícono que se muestra para cada proyecto
  function iconFor(item){
    if(item.icon) return { src: asset(item.icon), cls: "" };
    if(item.type === "pdf")     return { src: asset(item.thumbs?.[0] || item.pages[0]), cls: "thumb-doc" };
    if(item.type === "image")   return { src: asset(item.thumb || item.src), cls: "thumb-photo" };
    if(item.type === "gallery") return { src: asset(item.images[0]?.thumb || item.images[0]?.src), cls: "thumb-photo" };
    return { src: asset("img/iconos/archivo.webp"), cls: "" };
  }

  // Crear íconos del escritorio
  const posKey = (id) => `pos:${C.layoutVersion}:${id}`;
  C.desktop.forEach(item => {
    const ic = iconFor(item);
    const b = document.createElement("button");
    b.className = "icon"; b.dataset.id = item.id;
    b.innerHTML = `<img class="${ic.cls}" src="${ic.src}" alt=""><span>${esc(item.label)}</span>`;
    const saved = store.get(posKey(item.id));
    const pos = saved || item.pos || { left:"50%", top:"50%" };
    b.style.left = pos.left; b.style.top = pos.top;
    desktop.appendChild(b);
  });
  // Apps que en móvil pasan del dock al escritorio
  C.dock.filter(d => d.mobile === "desktop").forEach(d => {
    const b = document.createElement("button");
    b.className = "icon app-icon mobile-only"; b.dataset.action = d.action;
    b.innerHTML = `<img src="${asset(d.icon)}" alt=""><span>${esc(d.label)}</span>`;
    desktop.appendChild(b);
  });

  const icons = $$(".icon", desktop);
  const activateIcon = (icon) => icon.dataset.id ? openItem(icon.dataset.id) : runAction(icon.dataset.action);

  icons.forEach(icon => {
    icon.addEventListener("pointerdown", e => {
      if(e.button !== 0) return;
      icons.forEach(x => x.classList.remove("selected"));
      icon.classList.add("selected");
      if(isMobile() || !icon.dataset.id) return;

      const r = icon.getBoundingClientRect();
      const offX = e.clientX - (r.left + r.width / 2), offY = e.clientY - (r.top + r.height / 2);
      const sx = e.clientX, sy = e.clientY; let dragging = false;
      icon.setPointerCapture(e.pointerId);
      const move = ev => {
        if(!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
        dragging = true; icon.classList.add("dragging");
        const d = desktop.getBoundingClientRect();
        icon.style.left = Math.max(5, Math.min(95, ((ev.clientX - offX - d.left) / d.width) * 100)) + "%";
        icon.style.top  = Math.max(8, Math.min(85, ((ev.clientY - offY - d.top) / d.height) * 100)) + "%";
      };
      const up = () => {
        icon.removeEventListener("pointermove", move);
        icon.classList.remove("dragging");
        if(dragging){ store.set(posKey(icon.dataset.id), { left:icon.style.left, top:icon.style.top }); icon.dataset.justDragged = "1"; }
      };
      icon.addEventListener("pointermove", move);
      icon.addEventListener("pointerup", up, { once:true });
      icon.addEventListener("pointercancel", up, { once:true });
    });
    // Computadora: doble clic · Celular / táctil: un toque
    icon.addEventListener("dblclick", () => { if(!isMobile()) activateIcon(icon); });
    icon.addEventListener("click", e => {
      if(icon.dataset.justDragged){ delete icon.dataset.justDragged; return; }
      if(isMobile() || e.pointerType === "touch") activateIcon(icon);
    });
    icon.addEventListener("keydown", e => { if(e.key === "Enter") activateIcon(icon); });
  });
  desktop.addEventListener("pointerdown", e => {
    if(!e.target.closest(".icon")) icons.forEach(x => x.classList.remove("selected"));
  });

  /* ─── 4. Dock ────────────────────────────────────────────────── */
  const dock = $("#dock");
  dock.innerHTML = C.dock.map(d => {
    const hideMobile = d.mobile === "desktop" || d.mobile === "hide" ? " desk-only" : "";
    if(d.separator) return `<div class="dock-separator${hideMobile}" aria-hidden="true"></div>`;
    const inner = `<img src="${asset(d.icon)}" alt="${esc(d.label)}"><span class="tooltip">${esc(d.label)}</span>`;
    if(d.link) return `<a class="dock-item${hideMobile}" data-id="${d.id}" href="${esc(d.link)}" target="_blank" rel="noopener">${inner}</a>`;
    if(d.action === "mail"){
      const q = C.email.subject ? `?subject=${encodeURIComponent(C.email.subject)}` : "";
      return `<a class="dock-item${hideMobile}" data-id="${d.id}" data-action="mail" href="mailto:${esc(C.email.address)}${q}" target="_top">${inner}</a>`;
    }
    return `<button class="dock-item${hideMobile}" data-id="${d.id}" data-action="${d.action}">${inner}</button>`;
  }).join("");
  const dockBtn = (id) => $(`.dock-item[data-id="${id}"]`, dock);
  dockBtn("notas")?.classList.add("running");

  $$(".dock-item", dock).forEach(item => {
    item.addEventListener("click", () => {
      if(!reduced){ item.classList.remove("bounce"); void item.offsetWidth; item.classList.add("bounce"); }
      const a = item.dataset.action;
      if(a === "mail") copyEmail();          // además abre la app de correo (enlace mailto)
      else if(a) runAction(a);
    });
  });

  // Magnificación estilo macOS
  const dockImgs = $$(".dock-item img", dock);
  let raf = null, mouseX = null;
  function renderDock(){
    raf = null;
    dockImgs.forEach(img => {
      let s = 1;
      if(mouseX !== null){
        const r = img.getBoundingClientRect(), d = Math.abs(mouseX - (r.left + r.width / 2));
        if(d < 140) s = 1 + 0.45 * Math.cos((d / 140) * Math.PI / 2);
      }
      img.style.transform = `scale(${s})`;
    });
  }
  if(!reduced){
    dock.addEventListener("pointermove", e => {
      if(e.pointerType !== "mouse" || isMobile()) return;
      mouseX = e.clientX; if(!raf) raf = requestAnimationFrame(renderDock);
    });
    dock.addEventListener("pointerleave", () => { mouseX = null; if(!raf) raf = requestAnimationFrame(renderDock); });
  }

  function runAction(a){
    if(a === "note")    return toggleNote();
    if(a === "warning") return showAlert(C.warning);
    if(a === "finder")  return openSystem("finder");
    if(a === "photos")  return openSystem("photos");
    if(a === "trash")   return openSystem("trash");
  }

  /* ─── 5. Gestor de ventanas ──────────────────────────────────── */
  let z = 2000;
  const openWins = new Map();   // key → { el, appName, dockId }

  function setActiveApp(){
    let top = null;
    openWins.forEach(w => { if(!w.el.classList.contains("is-min") && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w; });
    $("#active-app").textContent = top ? top.appName : "Finder";
  }
  const focusWin = (el) => { el.style.zIndex = ++z; setActiveApp(); };

  /**
   * Abre (o trae al frente) una ventana.
   * spec: { key, title, appName, kind, header?, body, init?, dockId? }
   */
  function openWindow(spec){
    if(openWins.has(spec.key)){
      const w = openWins.get(spec.key).el; w.classList.remove("is-min"); focusWin(w); return;
    }
    const el = document.createElement("section");
    el.className = "window" + (spec.kind ? ` ${spec.kind} centered` : "");
    el.setAttribute("role", "dialog"); el.setAttribute("aria-label", spec.title);
    if(!spec.kind){ const n = openWins.size; el.style.left = `calc(15% + ${n * 28}px)`; el.style.top = `calc(10% + ${n * 28}px)`; }
    el.innerHTML = `
      <div class="window-header">
        <button class="win-btn close" aria-label="Cerrar"></button>
        <button class="win-btn min" aria-label="Minimizar"></button>
        <button class="win-btn max" aria-label="Maximizar"></button>
        ${spec.header ?? `<div class="window-title">${esc(spec.title)}</div>`}
      </div>
      <div class="window-content">${spec.body}</div>`;
    document.body.appendChild(el);
    const rec = { el, appName: spec.appName, dockId: spec.dockId };
    openWins.set(spec.key, rec);
    focusWin(el);
    if(spec.dockId) dockBtn(spec.dockId)?.classList.add("running");

    el.addEventListener("pointerdown", () => focusWin(el));
    $(".close", el).onclick = () => {
      el.remove(); openWins.delete(spec.key);
      if(spec.dockId) dockBtn(spec.dockId)?.classList.remove("running");
      setActiveApp();
    };
    $(".min", el).onclick = () => { el._pauseMedia?.(); el.classList.add("is-min"); setActiveApp(); };
    $(".max", el).onclick = () => el.classList.toggle("is-max");
    $(".window-header", el).addEventListener("dblclick", e => { if(!e.target.closest("button, a")) el.classList.toggle("is-max"); });
    makeDraggable(el);
    spec.init?.(el);
    return el;
  }

  function makeDraggable(el){
    const head = $(".window-header", el);
    head.addEventListener("pointerdown", e => {
      if(e.target.closest("button, a") || isMobile() || el.classList.contains("is-max")) return;
      if(el.classList.contains("centered")){       // soltar el centrado antes de mover
        const b = el.getBoundingClientRect();
        el.classList.remove("centered"); el.style.left = b.left + "px"; el.style.top = b.top + "px";
      }
      const r = el.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
      head.setPointerCapture(e.pointerId); head.style.cursor = "grabbing";
      const move = ev => {
        el.style.left = Math.min(Math.max(ev.clientX - dx, -r.width + 120), innerWidth - 120) + "px";
        el.style.top  = Math.min(Math.max(ev.clientY - dy, 28), innerHeight - 60) + "px";
      };
      const up = () => { head.removeEventListener("pointermove", move); head.style.cursor = ""; };
      head.addEventListener("pointermove", move);
      head.addEventListener("pointerup", up, { once:true });
      head.addEventListener("pointercancel", up, { once:true });
    });
  }

  // Abrir un proyecto del escritorio según su tipo
  function openItem(id){
    const it = itemById(id); if(!it) return;
    const key = "item:" + id;
    switch(it.type){
      case "pdf": {
        const doc = {
          name: fileName(it.file) || it.label, download: it.download ? it.file : null,
          pages: it.pages.map(asset), thumbs: (it.thumbs || it.pages).map(asset)
        };
        return openWindow({ key, title: doc.name, appName: "Vista previa", kind: "preview",
          header: previewToolbar(doc), body: previewBody(doc), init: el => initPreview(el, doc) });
      }
      case "image": {
        const doc = { name: it.label, pages: [asset(it.src)], thumbs: [asset(it.thumb || it.src)], isImage: true, description: it.description };
        return openWindow({ key, title: doc.name, appName: "Vista previa", kind: "preview",
          header: previewToolbar(doc), body: previewBody(doc), init: el => initPreview(el, doc) });
      }
      case "gallery": {
        const imgs = it.images.map(im => ({ src: asset(im.src), thumb: asset(im.thumb || im.src), name: im.name || fileName(im.src) }));
        return openWindow({ key, title: it.label, appName: "Fotos", body: galleryBody(imgs, it.label),
          init: el => initGallery(el, imgs, it.label) });
      }
      case "video":
        return openWindow({ key, title: it.label, appName: "QuickTime Player", kind: "video",
          header: `<div class="window-title">${esc(it.label)}</div>
                   <a class="qt-yt" href="https://www.youtube.com/watch?v=${esc(it.youtube)}" target="_blank" rel="noopener">Ver en YouTube ↗</a>`,
          body: videoBody(it),
          init: el => { el._pauseMedia = () => $("iframe", el)?.contentWindow?.postMessage(JSON.stringify({ event:"command", func:"pauseVideo", args:[] }), "*"); } });
      case "link":
        return window.open(it.url, "_blank", "noopener");
      default:   // "empty": ventana de Error 404
        return openWindow({ key, title: it.label, appName: "Finder", kind: "notice",
          body: `<div class="nf">
              <img src="${dockIcon("warning")}" alt="">
              <h2>${esc(C.notFound.title)}</h2>
              <p>${esc(it.message || C.notFound.message)}</p>
              <button class="nf-ok">OK</button>
            </div>`,
          init: el => { const ok = $(".nf-ok", el); ok.onclick = () => $(".close", el).click(); ok.focus(); } });
    }
  }

  // Ventanas del sistema (Finder, Fotos, Papelera)
  function openSystem(name){
    if(name === "finder"){
      const items = C.desktop.map(it => { const ic = iconFor(it);
        return `<button data-open="${it.id}"><img class="${ic.cls}" src="${ic.src}" alt=""><span>${esc(it.label)}</span></button>`; }).join("");
      return openWindow({ key:"sys:finder", title: C.owner, appName:"Finder", dockId:"finder",
        body:`<div class="finder-grid">${items}</div>`,
        init: el => $$("[data-open]", el).forEach(b => b.onclick = () => openItem(b.dataset.open)) });
    }
    if(name === "photos"){
      const imgs = C.desktop.flatMap(it =>
        it.type === "image"   ? [{ src: asset(it.src), thumb: asset(it.thumb || it.src), name: it.label }] :
        it.type === "gallery" ? it.images.map(im => ({ src: asset(im.src), thumb: asset(im.thumb || im.src), name: im.name || fileName(im.src) })) : []);
      return openWindow({ key:"sys:photos", title:"Fotos", appName:"Fotos", dockId:"fotos",
        body: galleryBody(imgs, "Fotos"), init: el => initGallery(el, imgs, "Fotos") });
    }
    if(name === "trash"){
      return openWindow({ key:"sys:trash", title:"Papelera", appName:"Finder", dockId:"trash",
        body:`<div class="empty"><img src="${dockIcon("trash")}" alt=""><p>La papelera está vacía.</p></div>` });
    }
  }

  /* ─── 6. Contenido de ventanas ───────────────────────────────── */
  const ICON = {
    side:`<svg width="18" height="14" viewBox="0 0 18 14" fill="none"><rect x="0.75" y="0.75" width="16.5" height="12.5" rx="2.5" stroke="currentColor" stroke-width="1.4"/><line x1="6.5" y1="1" x2="6.5" y2="13" stroke="currentColor" stroke-width="1.4"/></svg>`,
    minus:`<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.8" cy="6.8" r="5.3" stroke="currentColor" stroke-width="1.4"/><line x1="10.7" y1="10.7" x2="14.6" y2="14.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="4.3" y1="6.8" x2="9.3" y2="6.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    plus:`<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.8" cy="6.8" r="5.3" stroke="currentColor" stroke-width="1.4"/><line x1="10.7" y1="10.7" x2="14.6" y2="14.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="4.3" y1="6.8" x2="9.3" y2="6.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="6.8" y1="4.3" x2="6.8" y2="9.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    fit:`<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 5.5V1.5H5.5M10.5 1.5H14.5V5.5M14.5 10.5V14.5H10.5M5.5 14.5H1.5V10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    download:`<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5V10M4.5 6.8L8 10.3L11.5 6.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 11V13Q2 14.5 3.5 14.5H12.5Q14 14.5 14 13V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    check:`<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    play:`<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="20" stroke="currentColor" stroke-width="2"/><path d="M18 14.5L30 22L18 29.5Z" fill="currentColor"/></svg>`
  };

  /* 6a. Vista previa (PDF de varias páginas o una imagen) */
  const previewToolbar = (doc) => `
    <div class="pv-tb">
      ${doc.pages.length > 1 ? `<button class="tb-btn tb-side" aria-label="Mostrar u ocultar miniaturas" title="Miniaturas">${ICON.side}</button>` : ""}
      <div class="pv-title"><strong>${esc(doc.name)}</strong><small class="pv-sub">${doc.isImage ? "" : `Página 1 de ${doc.pages.length}`}</small></div>
      <span class="pv-spacer"></span>
      <div class="tb-group">
        <button class="tb-btn tb-out" aria-label="Reducir" title="Reducir (⌘ −)">${ICON.minus}</button>
        <button class="tb-btn tb-zoom" aria-label="Ajustar al ancho" title="Ajustar al ancho (⌘ 0)">100%</button>
        <button class="tb-btn tb-in" aria-label="Ampliar" title="Ampliar (⌘ +)">${ICON.plus}</button>
      </div>
      <button class="tb-btn tb-fit" aria-label="Página completa" title="Ver página completa">${ICON.fit}</button>
      ${doc.download ? `<button class="tb-btn tb-dl" aria-label="Descargar" title="Descargar"${dl.hidden ? " hidden" : ""}>${ICON.download}</button>` : ""}
    </div>`;
  const previewBody = (doc) => `
    <div class="pv${isMobile() || doc.pages.length < 2 ? " noside" : ""}${doc.pages.length < 2 ? " single" : ""}">
      <aside class="pv-side" aria-label="Miniaturas">
        ${doc.thumbs.map((s, i) => `<button class="pv-thumb${i ? "" : " active"}" data-i="${i}" aria-label="Ir a la página ${i + 1}"><img src="${s}" alt=""><span>${i + 1}</span></button>`).join("")}
      </aside>
      <div class="pv-main" tabindex="0">
        <div class="pv-pages">${doc.pages.map((s, i) => `<img src="${s}" alt="${esc(doc.name)}, página ${i + 1}" data-i="${i}"${i ? ' loading="lazy"' : ""} decoding="async">`).join("")}</div>
        ${doc.description ? `<div class="pv-desc"><p>${esc(doc.description)}</p></div>` : ""}
      </div>
    </div>`;

  function initPreview(w, doc){
    const pv = $(".pv", w), main = $(".pv-main", w), wrap = $(".pv-pages", w);
    const pages = $$("img", wrap), thumbs = $$(".pv-thumb", w);
    const desc = $(".pv-desc", w);
    const sub = $(".pv-sub", w), zoomLbl = $(".tb-zoom", w), sideBtn = $(".tb-side", w);
    const MAXW = 900, STEPS = [.5, .75, 1, 1.25, 1.5, 2, 2.5, 3];
    let zoom = 1, current = 0, ratio = 0.74;

    // Proporción real de la primera página/imagen → sin datos manuales
    const first = pages[0];
    const onFirst = () => {
      if(!first.naturalWidth) return;
      ratio = first.naturalWidth / first.naturalHeight;
      pages.forEach(p => p.style.aspectRatio = `${first.naturalWidth} / ${first.naturalHeight}`);
      if(doc.isImage){
        const ext = (doc.name.split(".").pop() || "").toUpperCase();
        sub.textContent = `${first.naturalWidth} × ${first.naturalHeight}${ext && ext !== doc.name.toUpperCase() ? " · " + ext : ""}`;
        fitPage();
      }
    };
    first.complete ? onFirst() : first.addEventListener("load", onFirst, { once:true });

    const fitWidth = () => Math.min(main.clientWidth - (isMobile() ? 24 : 64), MAXW);
    function applyZoom(zv, keepCenter = true){
      const rel = keepCenter ? (main.scrollTop + main.clientHeight / 2) / Math.max(main.scrollHeight, 1) : 0;
      zoom = Math.max(STEPS[0], Math.min(STEPS[STEPS.length - 1], zv));
      wrap.style.width = Math.round(fitWidth() * zoom) + "px";
      if(desc) desc.style.width = main.clientWidth + "px";   // la descripción no cambia con el zoom
      zoomLbl.textContent = Math.round(zoom * 100) + "%";
      if(keepCenter) main.scrollTop = rel * main.scrollHeight - main.clientHeight / 2;
    }
    const stepZoom = dir => {
      const i = STEPS.findIndex(s => s >= zoom - 1e-3);
      applyZoom(STEPS[Math.max(0, Math.min(STEPS.length - 1, (STEPS[i] > zoom + 1e-3 && dir < 0 ? i : i + dir)))]);
    };
    function fitPage(){
      const h = main.clientHeight - 44;
      applyZoom(Math.max(STEPS[0], Math.min(1, (h * ratio) / fitWidth())), false);
      goTo(current, false);
    }
    function setCurrent(i){
      if(i === current && thumbs[i]?.classList.contains("active")) return;
      current = i;
      thumbs.forEach((t, k) => t.classList.toggle("active", k === i));
      revealIn($(".pv-side", w), thumbs[i]);
      if(!doc.isImage) sub.textContent = `Página ${i + 1} de ${pages.length}`;
    }
    function goTo(i, smooth = true){
      i = Math.max(0, Math.min(pages.length - 1, i));
      main.scrollTo({ top: pages[i].offsetTop - 22, behavior: smooth && !reduced ? "smooth" : "auto" });
      setCurrent(i);
    }
    main.addEventListener("scroll", () => {
      const mid = main.scrollTop + main.clientHeight * .4;
      let best = 0; pages.forEach((p, k) => { if(p.offsetTop <= mid) best = k; });
      setCurrent(best);
    }, { passive:true });

    function toggleSide(force){
      const show = force ?? pv.classList.contains("noside");
      pv.classList.toggle("noside", !show); sideBtn?.classList.toggle("on", show);
      if(!isMobile()) setTimeout(() => applyZoom(zoom), 210);
    }
    thumbs.forEach(t => t.onclick = () => { goTo(+t.dataset.i); if(isMobile()) toggleSide(false); });
    if(sideBtn){ sideBtn.classList.toggle("on", !pv.classList.contains("noside")); sideBtn.onclick = () => toggleSide(); }
    $(".tb-in", w).onclick  = () => stepZoom(1);
    $(".tb-out", w).onclick = () => stepZoom(-1);
    zoomLbl.onclick = () => applyZoom(1);
    $(".tb-fit", w).onclick = fitPage;
    const dlBtn = $(".tb-dl", w);
    if(dlBtn) dlBtn.onclick = () => downloadFile(dlBtn, doc.download);

    main.addEventListener("wheel", e => {            // ⌘/Ctrl + rueda o pellizco del trackpad
      if(!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault(); applyZoom(zoom * (e.deltaY < 0 ? 1.08 : 0.926));
    }, { passive:false });
    w.addEventListener("keydown", e => {
      const mod = e.metaKey || e.ctrlKey;
      if(mod && (e.key === "+" || e.key === "=")){ e.preventDefault(); stepZoom(1); }
      else if(mod && e.key === "-"){ e.preventDefault(); stepZoom(-1); }
      else if(mod && e.key === "0"){ e.preventDefault(); applyZoom(1); }
      else if(e.key === "ArrowRight") goTo(current + 1);
      else if(e.key === "ArrowLeft")  goTo(current - 1);
    });
    new ResizeObserver(() => applyZoom(zoom)).observe(main);
    applyZoom(1, false);
    main.focus({ preventScroll:true });
  }

  /* 6b. Visor tipo Fotos (varias imágenes) */
  function galleryBody(images, label){
    if(!images.length) return `<div class="empty"><img src="${dockIcon("fotos")}" alt=""><p>${esc(label)} todavía no tiene imágenes.</p></div>`;
    return `<div class="viewer" tabindex="-1">
      <div class="viewer-stage">
        <img class="viewer-img" src="${images[0].src}" alt="${esc(images[0].name)}">
        <button class="viewer-nav prev" aria-label="Anterior">‹</button>
        <button class="viewer-nav next" aria-label="Siguiente">›</button>
      </div>
      <div class="viewer-bar">
        <span class="viewer-count"></span>
        <div class="viewer-thumbs">${images.map((im, i) => `<button data-i="${i}" aria-label="Ver ${esc(im.name)}"><img src="${im.thumb}" alt="" loading="lazy"></button>`).join("")}</div>
      </div>
    </div>`;
  }
  function initGallery(w, images, baseTitle){
    const v = $(".viewer", w); if(!v) return;
    const stage = $(".viewer-stage", v), img = $(".viewer-img", v), prev = $(".prev", v), next = $(".next", v);
    const thumbs = $$(".viewer-thumbs button", v), count = $(".viewer-count", v), title = $(".window-title", w);
    let i = 0;
    function show(n){
      i = Math.max(0, Math.min(images.length - 1, n));
      stage.classList.remove("zoomed"); img.style.opacity = 0;
      setTimeout(() => { img.src = images[i].src; img.alt = images[i].name; img.style.opacity = 1; }, reduced ? 0 : 120);
      thumbs.forEach((t, k) => t.classList.toggle("active", k === i));
      revealIn($(".viewer-thumbs", v), thumbs[i]);
      prev.disabled = i === 0; next.disabled = i === images.length - 1;
      count.textContent = `${i + 1} de ${images.length}`;
      title.textContent = `${baseTitle} — ${images[i].name}`;
    }
    prev.onclick = () => show(i - 1); next.onclick = () => show(i + 1);
    thumbs.forEach(t => t.onclick = () => show(+t.dataset.i));
    img.addEventListener("click", () => { if(!isMobile()) stage.classList.toggle("zoomed"); });
    w.addEventListener("keydown", e => { if(e.key === "ArrowLeft") show(i - 1); if(e.key === "ArrowRight") show(i + 1); });
    let sx = null;
    stage.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive:true });
    stage.addEventListener("touchend", e => {
      if(sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
      if(Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
    });
    show(0); v.focus({ preventScroll:true });
  }

  /* 6c. Reproductor tipo QuickTime (YouTube sin cookies) */
  const videoBody = (it) => `
    <div class="qt-fallback" aria-hidden="true">${ICON.play}<span>Cargando video…</span></div>
    <iframe src="https://www.youtube-nocookie.com/embed/${esc(it.youtube)}?autoplay=1&rel=0&playsinline=1&enablejsapi=1"
      title="${esc(it.label)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

  /* ─── 7. Descarga de archivos ────────────────────────────────── */
  // · Dentro de claude.ai: usa la función de descargas de la plataforma.
  // · En tu propio hosting: descarga directa desde la carpeta docs/.
  const inClaude = typeof window.claude?.use === "function";
  const dl = { hidden: inClaude, api: null };
  if(inClaude){
    window.claude.use("downloads").then(api => {
      dl.api = api; dl.hidden = !api;
      $$(".tb-dl").forEach(b => b.hidden = !api);
    }).catch(() => {});
  }
  async function fileBlob(path){
    const src = asset(path);
    if(src.startsWith("data:")){
      const bin = atob(src.slice(src.indexOf(",") + 1)), bytes = new Uint8Array(bin.length);
      for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Blob([bytes], { type: src.slice(5, src.indexOf(";")) });
    }
    return (await fetch(src)).blob();
  }
  async function downloadFile(btn, path){
    const name = fileName(path);
    const done = () => { btn.innerHTML = ICON.check; btn.classList.add("on"); setTimeout(() => { btn.innerHTML = ICON.download; btn.classList.remove("on"); }, 1600); };
    btn.disabled = true;
    try{
      if(dl.api){ await dl.api.save({ filename: name, data: await fileBlob(path) }); done(); }
      else if(!inClaude){
        const a = Object.assign(document.createElement("a"), { href: asset(path), download: name });
        if(a.href.startsWith("data:")) a.href = URL.createObjectURL(await fileBlob(path));
        document.body.appendChild(a); a.click(); a.remove(); done();
      }
    }catch(err){
      if(err?.code === "rate_limited") showAlert("Ya hay una descarga pendiente de confirmar.");
      else if(err?.code !== "declined") showAlert("No se pudo descargar el archivo en esta vista.");
    }finally{ btn.disabled = false; }
  }

  /* ─── 8. Mail, notificación y alerta ─────────────────────────── */
  const notifEl = $("#notif"); let notifTimer;
  function notify(title, body, icon){
    $("#notif-icon").src = icon;
    $("#notif-title").textContent = title;
    $("#notif-body").textContent = body;
    notifEl.classList.add("show"); clearTimeout(notifTimer);
    notifTimer = setTimeout(() => notifEl.classList.remove("show"), 4500);
  }
  function copyText(text){
    const ta = Object.assign(document.createElement("textarea"), { value:text, readOnly:true });
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta); ta.select();
    let ok = false; try{ ok = document.execCommand("copy"); }catch{}
    ta.remove();
    if(!ok && navigator.clipboard) return navigator.clipboard.writeText(text).then(() => true, () => false);
    return Promise.resolve(ok);
  }
  function copyEmail(){
    const e = C.email;
    copyText(e.address).then(ok => notify(ok ? e.copiedTitle : e.fallbackTitle, e.address, dockIcon("mail")));
  }

  const alertEl = $("#alert");
  $("#alert-icon").src = dockIcon("warning") || "";
  function showAlert(msg){
    $("#alert-message").textContent = msg;
    alertEl.hidden = false; $("#alert-ok").focus();
  }
  $("#alert-ok").onclick = () => alertEl.hidden = true;
  alertEl.addEventListener("click", e => { if(e.target === alertEl) alertEl.hidden = true; });
  document.addEventListener("keydown", e => { if(e.key === "Escape") alertEl.hidden = true; });
})();
