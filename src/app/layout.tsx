// src/app/layout.tsx
export const metadata = {
  title: "Mi App",
  description: "App sin estilos globales de layout",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}   {/* <- ya no estamos forzando main.contenido */}
      </body>
    </html>
  );
}
