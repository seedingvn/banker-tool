import type React from "react"
import { Inter } from "next/font/google"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { ThemeProvider } from '@/components/theme-provider'
import SchemaMarkup from '@/components/SchemaMarkup'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"

// SỬA LỖI 1: Đổi tên biến '--font-inter' thành '--font-sans'
// Đây là quy ước chuẩn của Tailwind CSS để dễ dàng tích hợp.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
})

// --- METADATA GIỮ NGUYÊN ---
const siteUrl = "https://www.bankertool.online/cong-cu-tinh-lai-suat-vay-ngan-hang";

export const metadata: Metadata = {
  title: "Công Cụ Tính Lãi Suất Vay Ngân Hàng Online Chính Xác",
  description: "Sử dụng công cụ tính lãi suất vay ngân hàng online miễn phí và chính xác nhất. Hỗ trợ tính theo dư nợ gốc & giảm dần, giúp banker và người dùng lập kế hoạch trả nợ chi tiết.",
  keywords: ["công cụ tính lãi suất vay ngân hàng", "tính lãi suất ngân hàng", "tính lãi vay", "công cụ tính lãi vay ngân hàng", "lãi suất ngân hàng online", "dư nợ giảm dần", "công cụ tài chính", "bankertool"],
  authors: [{ name: "BankerTool" }],
  creator: "BankerTool",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Công Cụ Tính Lãi Suất Vay Ngân Hàng Online | BankerTool",
    description: "Dễ dàng tính toán khoản vay, xem lịch trả nợ chi tiết và lập kế hoạch tài chính với công cụ từ BankerTool. Hoàn toàn miễn phí cho banker và người dùng cá nhân!",
    url: siteUrl,
    siteName: 'BankerTool',
    images: [
      {
        url: `https://www.bankertool.online/og-image.png`, 
        width: 1200,
        height: 630,
        alt: 'Công cụ tính lãi suất vay ngân hàng online của BankerTool',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Công Cụ Tính Lãi Suất Vay Ngân Hàng Online | BankerTool",
    description: "Dễ dàng tính toán khoản vay, xem lịch trả nợ chi tiết và lập kế hoạch tài chính với công cụ từ BankerTool. Miễn phí cho banker và người dùng!",
    images: [`https://www.bankertool.online/og-image.png`], 
    creator: '@YourTwitterHandle', 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
    themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // SỬA LỖI 2: Áp dụng biến font vào thẻ `html`
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <head>
        <SchemaMarkup />
      </head>
      {/* SỬA LỖI 3: Xóa className khỏi thẻ `body` */}
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=GTM-5QB8V2XJ`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
        
        <footer className="mt-8 text-center py-6 border-t border-gray-100 bg-white">
          <div className="flex justify-center gap-4">
            <a href="https://www.facebook.com/bankertool.online/" target="_blank" rel="noopener noreferrer">
              <img src="/facebook-icon.svg" alt="Facebook" width={24} height={24} />
            </a>
            <a href="https://www.instagram.com/bankertool.online/" target="_blank" rel="noopener noreferrer">
              <img src="/instagram-icon.svg" alt="Instagram" width={24} height={24} />
            </a>
            <a href="https://www.threads.com/@bankertool.online" target="_blank" rel="noopener noreferrer">
              <img src="/threads-icon.svg" alt="Threads" width={24} height={24} />
            </a>
          </div>
        </footer>

        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-5QB8V2XJ');
            `,
          }}
        />
        <Script src="https://socialcare.vn/widget/service.js?key=3iIxwIYvF8" strategy="lazyOnload" />
      </body>
    </html>
  )
}
