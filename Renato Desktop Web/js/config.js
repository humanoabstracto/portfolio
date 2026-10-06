/* ═══════════════════════════════════════════════════════════════════
   ⚙️  CONFIGURACIÓN DEL ESCRITORIO — EDITA SOLO ESTE ARCHIVO
   ───────────────────────────────────────────────────────────────────
   Aquí están todos los textos, enlaces, imágenes y archivos de la web.
   No hace falta tocar index.html, style.css ni app.js para cambiar
   contenido.

   🖼️  CAMBIAR UNA IMAGEN
       1. Copia la imagen nueva en la carpeta img/ (ej. img/proyectos/).
       2. Cambia aquí la ruta ("src", "icon" o "thumb").
       Formatos recomendados: .webp o .jpg.
       Tamaños: íconos del dock 256×256 px · proyectos máx. 2000 px.

   📄  CAMBIAR EL PDF DEL CV
       1. Reemplaza docs/CV_Renato_Figueroa.pdf (mismo nombre, o cambia "file").
       2. Exporta cada página como imagen y reemplaza img/cv/pagina-1.webp,
          pagina-2.webp… (ancho ~1700 px). Las miniaturas mini-*.webp son
          opcionales: si las borras de "thumbs", se usan las páginas.
       3. Si el PDF tiene más o menos páginas, agrega o quita líneas en "pages".

   🔗  CAMBIAR UN ENLACE → busca el enlace en la sección "dock".

   ➕  AGREGAR UN PROYECTO → copia un bloque { … } de "desktop" y cambia
       id (único, sin espacios), label, type y sus archivos.

   Tipos de proyecto ("type"):
     "pdf"     → Vista previa con páginas, miniaturas, zoom y descarga
     "image"   → Vista previa de una sola imagen (+ "description" opcional)
     "gallery" → Visor tipo Fotos con varias imágenes
     "video"   → Reproductor tipo QuickTime (YouTube)
     "link"    → Abre una página externa en otra pestaña
     "empty"   → Muestra la ventana "Error 404 · Seguimos en construcción"

   Íconos del escritorio: si no pones "icon", se usa una miniatura
   automática (primera página del PDF o la propia imagen).
   ═══════════════════════════════════════════════════════════════════ */

window.CONFIG = {

  /* ── General ─────────────────────────────────────────────────── */
  owner: "Renato Figueroa",                 // nombre en la barra de menú
  pageTitle: "Renato Figueroa · Desktop",   // título de la pestaña
  wallpaper: "img/fondo.webp",              // fondo de pantalla
  menus: ["Archivo", "Edición", "Ver", "Ayuda"],

  /* Sube este número cuando cambies posiciones ("pos") de los íconos:
     así los visitantes que ya movieron íconos ven el nuevo orden. */
  layoutVersion: 3,

  /* ── Correo (ícono Mail) ─────────────────────────────────────── */
  email: {
    address: "renatoon.fi.qui@gmail.com",
    subject: "Hola Renato — vi tu portafolio",   // "" para dejarlo vacío
    copiedTitle: "Correo copiado al portapapeles",
    fallbackTitle: "Escríbeme a"
  },

  /* ── Nota adhesiva (sticky) ──────────────────────────────────── */
  note: {
    title: "Hola!",
    paragraphs: [
      "Bienvenvenido a mi escritorio o mi portfolio, lo que sea busca dentro de él."
    ],
    pos: { left: "32%", top: "10%" }        // solo en computadora
  },

  /* ── Ventana para proyectos sin contenido (type: "empty") ──────── */
  notFound: {
    title: "Error 404",
    message: "Seguimos en construcción"
  },

  /* ── Mensaje del ícono Warning ───────────────────────────────── */
  warning: "⚠️ Este es un mensaje de advertencia",

  /* ── Íconos del escritorio (proyectos) ───────────────────────────
     pos: posición en computadora, en % del ancho (left) y alto (top).
     En celular se ordenan solos en grilla, en este mismo orden.      */
  desktop: [
    {
      id: "cv",
      label: "CV_Renato_Figueroa",
      type: "pdf",
      file: "docs/CV_Renato_Figueroa.pdf",   // archivo que se descarga
      download: true,                         // botón de descarga en Vista previa
      pages: [
        "img/cv/pagina-1.webp",
        "img/cv/pagina-2.webp",
        "img/cv/pagina-3.webp"
      ],
      thumbs: [
        "img/cv/mini-1.webp",
        "img/cv/mini-2.webp",
        "img/cv/mini-3.webp"
      ],
      pos: { left: "18%", top: "14%" }
    },
    {
      id: "error404",
      label: "Error404",
      type: "empty",
      icon: "img/iconos/carpeta.webp",
      pos: { left: "18%", top: "36%" }
    },
    {
      id: "proyecto3",
      label: "Proyecto 3",
      type: "empty",
      icon: "img/iconos/archivo.webp",
      pos: { left: "82%", top: "14%" }
    },
    {
      id: "espejismos",
      label: "espejismos-portada.jpg",
      type: "image",
      src: "img/proyectos/espejismos-portada.webp",
      thumb: "img/proyectos/espejismos-portada-mini.webp",   // opcional (carga más rápido)
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud.",
      pos: { left: "82%", top: "36%" }
    },
    {
      id: "la-luna",
      label: "la-luna-que-compartiamos-portada.jpg",
      type: "image",
      src: "img/proyectos/la-luna-que-compartiamos-portada.webp",
      thumb: "img/proyectos/la-luna-que-compartiamos-portada-mini.webp",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud.",
      pos: { left: "70%", top: "14%" }
    },
    {
      id: "respira",
      label: "RESPIRA.jpg",
      type: "image",
      src: "img/proyectos/respira.webp",
      thumb: "img/proyectos/respira-mini.webp",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud.",
      pos: { left: "70%", top: "36%" }
    },
    {
      id: "culpable",
      label: "CULPABLE Videoclip",
      type: "video",
      youtube: "-qNJKk4bl5E",               // ID del video: lo que va después de "v=" o "/embed/"
      icon: "img/iconos/video.svg",
      pos: { left: "70%", top: "58%" }
    },
    {
      id: "proyecto6",
      label: "Proyecto 6",
      type: "empty",
      icon: "img/iconos/carpeta.webp",
      pos: { left: "82%", top: "58%" }
    }
  ],

  /* ── Dock ─────────────────────────────────────────────────────────
     link:   abre esa dirección en otra pestaña.
     action: "finder" | "mail" | "note" | "photos" | "warning" | "trash"
     mobile: "dock" (se queda en el dock) · "desktop" (pasa al escritorio)
             · "hide" (se oculta). Por defecto: "dock".               */
  dock: [
    { id: "finder",    label: "Finder",    icon: "img/dock/finder.webp",    action: "finder", mobile: "desktop" },
    { id: "mail",      label: "Mail",      icon: "img/dock/mail.webp",      action: "mail" },
    { id: "notas",     label: "Notas",     icon: "img/dock/notas.webp",     action: "note",   mobile: "desktop" },
    { id: "fotos",     label: "Fotos",     icon: "img/dock/fotos.webp",     action: "photos", mobile: "desktop" },
    { id: "music",     label: "Music",     icon: "img/dock/music.webp",     link: "https://music.apple.com/pe/artist/abstracto/1139046855" },
    { id: "spotify",   label: "Spotify",   icon: "img/dock/spotify.webp",   link: "https://open.spotify.com/artist/7Hyj6BPMtfg5VkRmpuw3SK?si=QzYE0xI4RpGcg_CAhhmEnw" },
    { id: "instagram", label: "Instagram", icon: "img/dock/instagram.webp", link: "https://www.instagram.com/humano.abstracto/" },
    { id: "warning",   label: "Warning",   icon: "img/dock/warning.webp",   action: "warning", mobile: "hide" },
    { separator: true, mobile: "hide" },
    { id: "trash",     label: "Trash",     icon: "img/dock/papelera.webp",  action: "trash",   mobile: "hide" }
  ]
};
