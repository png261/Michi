import { Toaster } from 'sonner';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from "@clerk/nextjs";
import TRPCProvider from '@/app/_trpc/Provider'
import { Analytics } from "@vercel/analytics/next"


import './globals.css';

export const viewport = {
    maximumScale: 1,
};

const geist = Geist({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-geist',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-geist-mono',
});

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="vi"
            suppressHydrationWarning
            className={`${geist.variable} ${geistMono.variable}`}

        >
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: THEME_COLOR_SCRIPT,
                    }}
                />
            </head>
            <body className="antialiased">
                <ClerkProvider>
                    <TRPCProvider>
                        <Analytics />
                        <Toaster position="top-center" />
                        {children}
                    </TRPCProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}

