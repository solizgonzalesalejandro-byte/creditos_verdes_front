// src/app/menu/layout.tsx
import "./cas.css";
import "./publicacionCss.css"; // si lo necesitas

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <div className="layout-menu">{children}</div>;
}
