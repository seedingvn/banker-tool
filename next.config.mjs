/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- Các cấu hình hiện tại của bạn được giữ nguyên ---
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // --- THÊM PHẦN CHUYỂN HƯỚNG VÀO ĐÂY ---
  async redirects() {
    return [
      {
        source: '/',
        destination: '/cong-cu-tinh-lai-suat-vay-ngan-hang',
        permanent: true, // Chuyển hướng vĩnh viễn, tốt cho SEO
      },
    ]
  },
}

export default nextConfig
