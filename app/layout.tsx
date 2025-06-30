import type React from "react"
import { Inter } from "next/font/google"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import SchemaMarkup from '@/components/SchemaMarkup';
import { ThemeProvider } from '@/components/theme-provider';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
})

// --- METADATA ĐÃ ĐƯỢC TỐI ƯU SEO ---

const siteUrl = "https://www.bankertool.online/cong-cu-tinh-lai-suat-vay-ngan-hang";

export const metadata: Metadata = {
  // TỐI ƯU: Title đã rất tốt, giữ nguyên. Chứa từ khóa chính + lợi ích + thương hiệu.
  title: "Công Cụ Tính Lãi Suất Vay Ngân Hàng Online Chính Xác", 
  
  // TỐI ƯU: Viết lại mô tả để hấp dẫn và chứa nhiều từ khóa ngữ nghĩa hơn.
  description: "Sử dụng công cụ tính lãi suất vay ngân hàng online miễn phí và chính xác nhất. Hỗ trợ tính theo dư nợ gốc & giảm dần, giúp banker và người dùng lập kế hoạch trả nợ chi tiết.",

  // TỐI ƯU: Tập trung vào các từ khóa cốt lõi và quan trọng nhất.
  // Lưu ý: Thẻ keywords hiện ít quan trọng với Google nhưng vẫn nên có để hỗ trợ các công cụ tìm kiếm khác.
  keywords: ["công cụ tính lãi suất vay ngân hàng", "tính lãi suất ngân hàng", "tính lãi vay", "công cụ tính lãi vay ngân hàng", "lãi suất ngân hàng online", "dư nợ giảm dần", "công cụ tài chính", "bankertool"],

  authors: [{ name: "BankerTool" }],
  creator: "BankerTool",
  
  alternates: {
    canonical: siteUrl,
  },
  
  // TỐI ƯU: Tinh chỉnh lại tiêu đề và mô tả cho mạng xã hội để tăng tương tác.
  openGraph: {
    title: "Công Cụ Tính Lãi Suất Vay Ngân Hàng Online | BankerTool", // Tiêu đề ngắn gọn hơn một chút
    description: "Dễ dàng tính toán khoản vay, xem lịch trả nợ chi tiết và lập kế hoạch tài chính với công cụ từ BankerTool. Hoàn toàn miễn phí cho banker và người dùng cá nhân!",
    url: siteUrl,
    siteName: 'BankerTool',
    images: [
      {
        url: `${siteUrl}/og-image.png`, 
        width: 1200,
        height: 630,
        alt: 'Công cụ tính lãi suất vay ngân hàng online của BankerTool', // Alt text mô tả rõ hơn
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },

  // TỐI ƯU: Đồng bộ với Open Graph để nhất quán.
  twitter: {
    card: 'summary_large_image',
    title: "Công Cụ Tính Lãi Suất Vay Ngân Hàng Online | BankerTool",
    description: "Dễ dàng tính toán khoản vay, xem lịch trả nợ chi tiết và lập kế hoạch tài chính với công cụ từ BankerTool. Miễn phí cho banker và người dùng!",
    images: [`${siteUrl}/og-image.png`], 
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
  
  // verification: {
  //   google: 'MÃ_XÁC_MINH_GOOGLE_CỦA_BẠN', 
  // },

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
    <html lang="vi" className={inter.variable}>
      <head>
        <meta name="twitter:image" content="https://bankertool.online/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5QB8V2XJ');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5QB8V2XJ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        <ThemeProvider>
          <SchemaMarkup />
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
        {/* Footer với social links */}
        <footer className="mt-8 text-center py-6 border-t border-gray-100 bg-white">
          {/* Chèn script socialcare ngay phía trên logo social */}
          <Script src="https://socialcare.vn/widget/service.js?key=3iIxwIYvF8" strategy="afterInteractive" />
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
      </body>
    </html>
  )
}