// src/app/menuData.tsx
export type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon?: string; // emoji o path a svg
  children?: MenuItem[];
};

const MENU: MenuItem[] = [
  { id: "inicio", label: "Inicio", href: "/", icon: "🏠" },
  { id: "publicaciones", label: "Publicaciones", href: "/publicaciones", icon: "👥" },
  { id: "publicar", label: "Publicar", href: "/publicar", icon: "🧰" },
  { id: "usuario", label: "Usuario", href: "/usuario", icon: "👤" },
  { id: "transacciones", label: "Transacciones", href: "/transacciones", icon: "🛒" },
  {
    id: "mas",
    label: "Más",
    href: "#",
    icon: "🔧",
    children: [
      { id: "config", label: "Configuración", href: "/config" },
      { id: "ayuda", label: "Ayuda", href: "/ayuda" },
    ],
  },
];

export default MENU;
