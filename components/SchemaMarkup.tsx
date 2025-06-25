import React from 'react';

// === THAY ĐỔI CÁC THÔNG TIN NÀY CHO PHÙ HỢP VỚI BẠN ===
const ORG_NAME = "BankerTool";
const SITE_URL = "https://bankertool.online";
const LOGO_URL = `${SITE_URL}/logo.png`; // <<<< Đảm bảo bạn có file logo.png trong thư mục /public
// =======================================================

const SchemaMarkup = () => {
  // Gộp tất cả các schema vào một mảng duy nhất
  const allSchemas = [
    // Schema cho Tổ chức (Organization)
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": ORG_NAME,
      "url": SITE_URL,
      "logo": LOGO_URL,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+84-947-154-784", // Thay bằng SĐT thật
        "contactType": "customer service"
      }
    },
    // Schema cho Website (bao gồm Sitelinks Searchbox)
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": SITE_URL,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    // Schema cho Trang Câu Hỏi Thường Gặp (FAQPage)
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Công cụ tính lãi ngân hàng online này có chính xác không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Công cụ sử dụng công thức tính toán chuẩn của ngành ngân hàng, kết quả chỉ mang tính chất tham khảo. Lãi suất và điều kiện thực tế có thể khác tùy theo chính sách từng ngân hàng."
          }
        },
        {
          "@type": "Question",
          "name": "Nên chọn tính lãi trả trên dư nợ gốc hay trả trên dư nợ giảm dần?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Việc lựa chọn giữa trả trên dư nợ gốc và trả trên dư nợ giảm dần phụ thuộc vào khả năng tài chính và kế hoạch trả nợ của bạn. Trả trên dư nợ gốc có số tiền trả hàng tháng ổn định, dễ dàng quản lý ngân sách. Trả trên dư nợ giảm dần giúp bạn trả ít lãi hơn về lâu dài."
          }
        },
        {
          "@type": "Question",
          "name": "Lãi suất ưu đãi và lãi suất sau ưu đãi khác nhau như thế nào?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Lãi suất ưu đãi là mức lãi suất thấp hơn áp dụng trong một khoảng thời gian nhất định (ví dụ: 3-6 tháng đầu). Sau thời gian ưu đãi, lãi suất sẽ điều chỉnh về mức thông thường, thường cao hơn."
          }
        },
        {
          "@type": "Question",
          "name": "Hồ sơ vay vốn ngân hàng cơ bản cần những gì?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hồ sơ vay vốn thường bao gồm: CMND/CCCD, sổ hộ khẩu, giấy tờ chứng minh thu nhập (sao kê lương, hợp đồng lao động), và giấy tờ liên quan đến tài sản đảm bảo (nếu có)."
          }
        }
      ]
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(allSchemas) }}
    />
  );
};

export default SchemaMarkup; 