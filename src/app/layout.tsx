import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Tech ERP",
  description: "ERP system for Digital Tech repair and sales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
