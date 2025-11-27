// src/app/layout.tsx
import styles from "./layout.module.css";
import AuthGate from "./components/AuthGate";
import MenuLateral from "./components/MenuLateral";

export const metadata = {
  title: "Mi App",
  description: "App con menú lateral",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className={styles.appShell}>
          <AuthGate>
            <MenuLateral />
          </AuthGate>

          <main className={styles.contenido}>{children}</main>
        </div>
      </body>
    </html>
  );
}
