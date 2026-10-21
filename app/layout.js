import "./globals.css";
import { Unbounded, Manrope } from "next/font/google";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "Race2Space OFal team 2026 - Claim your seat",
  description: "Register for free and get your Rocket Mission ticket.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <div className="stars" aria-hidden="true" />
        <div className="horizon" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
