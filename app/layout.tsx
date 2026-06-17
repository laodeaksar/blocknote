import type { Metadata, Viewport } from "next";
import { ConvexClientProvider } from "@/lib/convex";
import { ThemeProvider } from "next-themes";
import { ThemeShortcut } from "@/components/theme-shortcut";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion Clone",
  description: "A Notion-like collaborative editor built with BlockNote",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ConvexClientProvider>
            {children}
            <ThemeShortcut />
            <Toaster richColors position="bottom-right" />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
