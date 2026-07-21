import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FleetPulse — Live Fleet Tracking",
  description:
    "Premium real-time courier and vehicle tracking dashboard with Mapbox 3D visualisation.",
};

// Runs before hydration to apply the persisted theme and avoid a flash of the
// wrong colour scheme. Defaults to dark when nothing is stored.
const themeScript = `(function(){try{var t=localStorage.getItem('fleetpulse-theme')||'dark';var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
