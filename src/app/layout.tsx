import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Lora } from "next/font/google";
import "./globals.css";

/**
 * Fuentes del diseño. next/font las descarga en build y las sirve desde el
 * propio sitio; `variable` las expone como variables CSS que usa globals.css.
 */
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], style: "italic" });

export const metadata: Metadata = {
  title: "SIGIAM-CC · Reporteador",
  description:
    "Inventario y mantenimiento del Departamento de Control y Comunicaciones (prototipo académico).",
};

/**
 * Script que corre ANTES del primer pintado: aplica el tema guardado en
 * localStorage o, si no hay, la preferencia del sistema operativo. Evita que
 * la página se vea clara un instante y luego cambie a oscura.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-theme="light"
      // El script cambia data-theme antes de que React hidrate; esto le
      // indica a React que acepte el valor del DOM sin marcar error.
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${lora.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
