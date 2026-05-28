import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Design Expansion Demo",
  description: "A narrow V0 for generating and reviewing one empty-state expansion."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
