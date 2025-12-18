import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { KEYWORD, SITE_DESCRIPTION, SITE_TITLE, SITE_URL, THUMBNAIL } from 'src/constant/metadata';
import { LexendFont } from 'src/constant';
import DotGrid from 'src/components/DotGrid/DotGrid';
// import { ThemeToggle } from 'src/components/ThemeToggle';
import MobileSafeArea from 'src/components/MobileSafeArea';
import GeneralProvider from 'src/provider';
import LockGuard from 'src/components/LockGuard';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: KEYWORD,
  publisher: 'A-Star Group',
  robots: {
    follow: true,
    index: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_TITLE,
    countryName: 'Vietnam',
    images: {
      url: SITE_URL + THUMBNAIL.src,
      secureUrl: THUMBNAIL.src,
      type: 'image/png',
      width: THUMBNAIL.width,
      height: THUMBNAIL.height,
    },
  },
  twitter: {
    card: 'summary_large_image',
    site: '@site',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: {
      url: SITE_URL + THUMBNAIL.src,
      secureUrl: THUMBNAIL.src,
      type: 'image/png',
      width: THUMBNAIL.width,
      height: THUMBNAIL.height,
    },
  },
  appleWebApp: {
    capable: true,
    title: SITE_TITLE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KJ4LZ39Z');`}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body className={`${LexendFont.className} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KJ4LZ39Z"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <GeneralProvider>
          {/* <ThemeToggle /> */}
          {/* Outer background container */}
          <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-4 max-[480px]:p-0 relative">
            {/* Animated dot grid background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <DotGrid
                dotSize={4}
                gap={24}
                baseColor="#C4C9CD"
                activeColor="#062682"
                baseColorDark="#3f3f46"
                activeColorDark="#60a5fa"
                proximity={120}
                returnDuration={3}
                shockStrength={6}
                shockRadius={300}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            {/* Mobile screen container */}
            <div className="w-full max-w-[480px] h-[932px] max-h-[95vh] bg-white dark:bg-black shadow-2xl rounded-[3rem] overflow-hidden border-12 border-zinc-800 dark:border-zinc-700 relative z-10 flex flex-col max-[480px]:max-w-full max-[480px]:max-h-full max-[480px]:h-full max-[480px]:border-0 max-[480px]:rounded-none">
              <MobileSafeArea />
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-6">
                <LockGuard>{children}</LockGuard>
              </div>
              <div className="pt-6" />

              {/* Portal container for dialogs and modals */}
              <div id="dialog-portal" className="contents" />
            </div>
          </div>
        </GeneralProvider>
      </body>
    </html>
  );
}
