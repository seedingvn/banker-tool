"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Calculator,
  Download,
  FileSpreadsheet,
  ImageIcon,
  Building2,
  Sparkles,
  Banknote,
  Percent,
  Calendar,
  User,
  DollarSign,
  LinkIcon,
  Clock,
  Phone,
  Mail,
  PiggyBank,
  CreditCard,
  Home,
  UserCheck,
  Menu,
  X,
  CheckCircle,
  TrendingUp,
  Shield,
  HelpCircle,
  Target,
  Settings,
  CheckIcon,
} from "lucide-react"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"
import html2canvas from "html2canvas"
import * as XLSX from "xlsx"
import { toPng } from 'html-to-image';
import { ExportableResult } from '@/components/ui/ExportableResult';
import Image from 'next/image';
import { useRouter, useSearchParams } from "next/navigation";

interface LoanCalculation {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  schedule: {
    month: number
    principal: number
    interest: number
    balance: number
    monthlyPayment: number
    startingBalance: number
  }[]
}

const bankLogos = {
  Vietcombank: "🏦",
  BIDV: "🏛️",
  Techcombank: "🏢",
}

// Định nghĩa cho window.dataLayer để tránh lỗi TS
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default function BankLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [loanTerm, setLoanTerm] = useState("")
  const [loanType, setLoanType] = useState("")
  const [bank, setBank] = useState("")
  const [bankerName, setBankerName] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const hiddenResultRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [month, setMonth] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const router = useRouter();
  const searchParams = useSearchParams();

  const bankLogoMap: { [key: string]: string } = {
    'hsbc': '/logos-bank/hsbc.png',
    'vib': '/logos-bank/vib.jpg',
    'vietinbank': '/logos-bank/vietinbank.jpg',
    'acb': '/logos-bank/acb.jpeg',
    'standardchartered': '/logos-bank/standardchartered.png',
    'ocb': '/logos-bank/ocb.jpg',
    'tpbank': '/logos-bank/tpbank.jpg',
    'mbbank': '/logos-bank/mbbank.jpg',
    'vpbank': '/logos-bank/vpbank.jpg',
    'hdbank': '/logos-bank/hdbank.jpg',
    'techcombank': '/logos-bank/techcombank.jpg',
    'uob': '/logos-bank/uob.jpg',
  };

  // Map key chuẩn hóa sang tên đẹp
  const bankNameMap: { [key: string]: string } = {
    acb: 'ACB',
    hdbank: 'HDBank',
    mbbank: 'MB Bank',
    ocb: 'OCB',
    tpbank: 'TPBank',
    techcombank: 'Techcombank',
    uob: 'UOB',
    vib: 'VIB',
    vietinbank: 'VietinBank',
    vpbank: 'VPBank',
    hsbc: 'HSBC',
    standardchartered: 'Standard Chartered',
  };

  // Format currency input
  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "")
    if (!numericValue) return ""
    return new Intl.NumberFormat("vi-VN").format(Number(numericValue))
  }

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value)
    setLoanAmount(formatted)
  }

  // Hàm tính toán nhận parameter đầu vào, trả về calculation object
  const calculateLoanFromParams = (amount: string, rate: string, term: string, type: string) => {
    const principal = Number.parseFloat(amount.replace(/[^\d]/g, ""));
    const monthlyRate = Number.parseFloat(rate) / 100 / 12;
    const months = Number.parseInt(term);
    if (!principal || !monthlyRate || !months || !type) return null;
    const schedule: LoanCalculation["schedule"] = [];
    let totalInterest = 0;
    let balance = principal;
    if (type === "equal-payment") {
      const monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1);
      for (let month = 1; month <= months; month++) {
        const startingBalance = balance;
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        totalInterest += interestPayment;
        schedule.push({
          month,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance),
          monthlyPayment,
          startingBalance,
        });
      }
    } else {
      const principalPayment = principal / months;
      for (let month = 1; month <= months; month++) {
        const startingBalance = balance;
        const interestPayment = balance * monthlyRate;
        const monthlyPayment = principalPayment + interestPayment;
        balance -= principalPayment;
        totalInterest += interestPayment;
        schedule.push({
          month,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance),
          monthlyPayment,
          startingBalance,
        });
      }
    }
    return {
      monthlyPayment: type === "equal-payment" ? schedule[0].monthlyPayment : schedule[0].monthlyPayment,
      totalInterest,
      totalPayment: principal + totalInterest,
      schedule,
    };
  };

  // Sửa useEffect để dùng hàm trên, setCalculation và showResults đúng giá trị, cuộn xuống kết quả
  useEffect(() => {
    const amount = searchParams.get("amount");
    const rate = searchParams.get("rate");
    const term = searchParams.get("term");
    const type = searchParams.get("type");
    const bankParam = searchParams.get("bank");
    const banker = searchParams.get("banker");
    const contact = searchParams.get("contact");
    if (amount && rate && term && type && bankParam && banker && contact) {
      setLoanAmount(formatCurrencyInput(amount));
      setInterestRate(rate);
      setLoanTerm(term);
      setLoanType(type);
      setBank(bankParam);
      setBankerName(banker);
      setContactInfo(contact);
      // Tính toán và show kết quả luôn
      const calc = calculateLoanFromParams(amount, rate, term, type);
      if (calc) {
        setCalculation(calc);
        setShowResults(true);
        setTimeout(() => {
          document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, [searchParams]);

  // Sửa hàm calculateLoan để giữ vị trí scroll khi cập nhật URL
  const calculateLoan = () => {
    const calc = calculateLoanFromParams(
      loanAmount.replace(/[^\d]/g, ""),
      interestRate,
      loanTerm,
      loanType
    );
    if (!calc) return;
    setCalculation(calc);
    setShowResults(true);
    // Cập nhật URL parameter, giữ nguyên vị trí scroll
    const params = new URLSearchParams({
      amount: loanAmount.replace(/[^\d]/g, ""),
      rate: interestRate,
      term: loanTerm,
      type: loanType,
      bank: bank,
      banker: bankerName,
      contact: contactInfo,
    });
    router.replace(`?${params.toString()}`, { scroll: false });
    // Scroll to results section
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const handleDownloadImage = async () => {
    if (!hiddenResultRef.current) {
      alert("Không tìm thấy nội dung để tải.");
      console.error("hiddenResultRef.current is null");
      return;
    }
    try {
      const options = { quality: 1.0, pixelRatio: 2, style: { fontFamily: 'sans-serif' } };
      const dataUrl = await toPng(hiddenResultRef.current, options);
      // Tạo tên file theo rule
      const clean = (str: string) => str?.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/đ/g, "d") || "";
      const formatMoney = (str: string) => {
        const num = parseInt(str.replace(/[^\d]/g, ""), 10);
        if (!num) return "";
        if (num >= 1000000000) return Math.round(num/1000000000) + "ty";
        if (num >= 1000000) return Math.round(num/1000000) + "tr";
        if (num >= 1000) return Math.round(num/1000) + "k";
        return num+"";
      };
      const fileName = `${clean(bankerName)}-${clean(bank)}-${loanTerm}thang-${formatMoney(loanAmount)}.png`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Oops, something went wrong when exporting image!", error);
      alert("Đã có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại.\n" + (error instanceof Error ? error.message : ''));
    }
  };

  // Đặt tên file export giống logic file ảnh
  const clean = (str: string) => str?.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/đ/g, "d") || "";
  const formatMoney = (str: string) => {
    const num = parseInt(str.replace(/[^\d]/g, ""), 10);
    if (!num) return "";
    if (num >= 1000000000) return Math.round(num/1000000000) + "ty";
    if (num >= 1000000) return Math.round(num/1000000) + "tr";
    if (num >= 1000) return Math.round(num/1000) + "k";
    return num+"";
  };

  const handleExportSheets = () => {
    if (!calculation) return
    const wsData = [
      ["Kỳ", "Dư nợ đầu kỳ", "Trả gốc", "Trả lãi", "Tổng trả", "Dư nợ còn lại"],
      ...calculation.schedule.map((p) => [
        p.month,
        p.startingBalance,
        p.principal,
        p.interest,
        p.monthlyPayment,
        p.balance,
      ]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Lich tra no")
    // Đặt tên file theo logic giống ảnh
    const fileName = `${clean(bankerName)}-${clean(bank)}-${loanTerm}thang-${formatMoney(loanAmount)}.xlsx`;
    XLSX.writeFile(wb, fileName)
  }

  const handleCopyURL = () => {
    const params = new URLSearchParams({
      amount: loanAmount.replace(/[^\d]/g, ""),
      rate: interestRate,
      term: loanTerm,
      type: loanType,
      bank: bank,
      banker: bankerName,
      contact: contactInfo,
    });
    const url = `${window.location.origin}/cong-cu-tinh-lai-suat-vay-ngan-hang?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const scrollToForm = () => {
    document.getElementById("loan-form")?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
  }, []);

  // 1. Bản đồ bankLinks
  const bankLinks: Record<string, string> = {
    "Eximbank": "https://www.eximbank.com.vn/",
    "SHB": "https://www.shb.com.vn/",
    "HDBank": "https://www.hdbank.com.vn/",
    "MSB": "https://www.msb.com.vn/",
    "BVBank": "https://www.bvbank.vn/",
    "VPBank": "https://www.vpbank.com.vn/",
    "Agribank": "https://www.agribank.com.vn/",
    "BIDV": "https://www.bidv.com.vn/",
    "Vietinbank": "https://www.vietinbank.vn/",
    "VIB": "https://www.vib.com.vn/",
    "MBBank": "https://www.mbbank.com.vn/",
    "Vietcombank": "https://www.vietcombank.com.vn/",
    "Standard Chartered": "https://www.sc.com/vn/",
    "Sacombank": "https://www.sacombank.com.vn/",
    "Techcombank": "https://www.techcombank.com.vn/"
  };
  // 2. Dữ liệu lãi suất mapping
  const bankRates: Record<string, {rate: number, max: number, term: number}> = {
    "Eximbank": {rate: 3.68, max: 100, term: 40},
    "SHB": {rate: 3.99, max: 90, term: 25},
    "HDBank": {rate: 4.5, max: 85, term: 35},
    "MSB": {rate: 4.5, max: 90, term: 35},
    "BVBank": {rate: 5, max: 75, term: 20},
    "VPBank": {rate: 5.2, max: 75, term: 25},
    "Agribank": {rate: 5.5, max: 100, term: 30},
    "BIDV": {rate: 5.5, max: 100, term: 30},
    "Vietinbank": {rate: 5.6, max: 80, term: 20},
    "VIB": {rate: 5.9, max: 85, term: 30},
    "MBBank": {rate: 6.0, max: 80, term: 20},
    "Vietcombank": {rate: 6.2, max: 70, term: 20},
    "Standard Chartered": {rate: 6.3, max: 75, term: 25},
    "Sacombank": {rate: 6.5, max: 90, term: 35},
    "Techcombank": {rate: 6.7, max: 80, term: 35},
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Hero Section */}
      <BackgroundBeamsWithCollision
        className="min-h-[40vh] md:min-h-[60vh] pt-2 md:pt-8 pb-4 md:pb-12"
      >
        <div className="max-w-6xl mx-auto text-left md:text-center px-4 relative z-20 flex flex-col min-h-full h-full justify-start md:justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 md:mb-10"
          >
            <h1 className="mb-4 md:mb-6">
              <span className="block text-2xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#7B61FF] via-[#7B61FF] to-[#F857A6] drop-shadow-md">
                Công Cụ Tính Lãi Suất
              </span>
              <span className="block text-xl md:text-4xl lg:text-5xl font-bold text-black mt-2">
                Vay Ngân Hàng Online Chính Xác
              </span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto md:mx-auto">
              Công cụ tính lãi vay chuyên nghiệp giúp banker và người dùng dễ dàng tính toán tiền gốc & lãi phải trả
              hàng tháng, lập kế hoạch tài chính hiệu quả
            </p>
            <Button
              id="btn-hero-calculate"
              onClick={() => {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                  event: 'button_click',
                  button_name: 'btn-hero-calculate'
                });
                scrollToForm();
              }}
              size="lg"
              className="bg-primary-blue hover:bg-primary-blue-dark text-white px-8 md:px-10 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Tính Lãi Vay Ngay
            </Button>
          </motion.div>

          {/* Features Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto"
          >
            <div className="border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-start mb-3">
                <TrendingUp className="h-5 w-5 mr-3 text-primary-blue" />
                <h3 className="font-semibold text-black text-sm md:text-base">Tính năng nổi bật</h3>
              </div>
              <ul className="space-y-2 text-gray-600 text-xs md:text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Tính toán chính xác 100%
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Xuất báo cáo PNG, Excel
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Chia sẻ bảng tính dễ dàng
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-start mb-3">
                <Shield className="h-5 w-5 mr-3 text-primary-blue" />
                <h3 className="font-semibold text-black text-sm md:text-base">Bảo mật & Tin cậy</h3>
              </div>
              <ul className="space-y-2 text-gray-600 text-xs md:text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Không lưu trữ thông tin cá nhân
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Miễn phí hoàn toàn
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-start mb-3">
                <Settings className="h-5 w-5 mr-3 text-primary-blue" />
                <h3 className="font-semibold text-black text-sm md:text-base">Cá nhân hóa</h3>
              </div>
              <ul className="space-y-2 text-gray-600 text-xs md:text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Tùy chỉnh thương hiệu cá nhân
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </BackgroundBeamsWithCollision>

      {/* Form Section */}
      <section id="loan-form" className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-left md:text-center mb-8 md:mb-12"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-blue to-transparent"></div>
              </div>
              <div className="relative bg-white px-4 md:px-8">
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <div className="bg-primary-blue/10 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <Target className="h-6 w-6 md:h-8 md:w-8 text-primary-blue" />
                  </div>
                  <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-black text-left md:text-center">
                    Nhập Thông Tin Để Tính Lãi Suất Vay Chi Tiết
                  </h2>
                </div>
              </div>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto mt-3 md:mt-4 text-sm md:text-base text-left md:text-center">
              Điền thông tin chi tiết để nhận được kết quả tính toán chính xác nhất
            </p>
          </motion.div>

          <motion.div
            className="max-w-7xl mx-auto bg-white p-4 md:p-8 rounded-2xl shadow-xl border border-gray-100 card-hover"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Hàng 1: 4 fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-6 md:mb-8">
              {/* Số tiền vay */}
              <div className="space-y-2 md:space-y-3">
                <Label
                  htmlFor="loan-amount"
                  className="text-xs md:text-sm font-semibold text-primary-blue flex items-center"
                >
                  <div className="bg-primary-blue/10 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3">
                    <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-primary-blue" />
                  </div>
                  Số tiền vay
                </Label>
                <div className="relative">
                  <Input
                    id="loan-amount"
                    type="text"
                    placeholder="500.000.000"
                    value={loanAmount}
                    onChange={handleLoanAmountChange}
                    className="border-2 border-gray-200 focus:border-primary-blue transition-colors h-10 md:h-14 pr-12 md:pr-16 text-left text-sm md:text-lg font-medium rounded-xl placeholder:text-gray-400"
                  />
                  <span className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 text-primary-blue text-xs md:text-sm font-semibold bg-primary-blue/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                    VND
                  </span>
                </div>
              </div>

              {/* Lãi suất */}
              <div className="space-y-2 md:space-y-3">
                <Label
                  htmlFor="interest-rate"
                  className="text-xs md:text-sm font-semibold text-primary-blue flex items-center"
                >
                  <div className="bg-primary-blue/10 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3">
                    <Percent className="h-3 w-3 md:h-4 md:w-4 text-primary-blue" />
                  </div>
                  Lãi suất
                </Label>
                <div className="relative">
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="border-2 border-gray-200 focus:border-primary-blue transition-colors h-10 md:h-14 pr-12 md:pr-16 text-left text-sm md:text-lg font-medium rounded-xl placeholder:text-gray-400"
                  />
                  <span className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 text-primary-blue text-xs md:text-sm font-semibold bg-primary-blue/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                    %
                  </span>
                </div>
              </div>

              {/* Thời hạn vay */}
              <div className="space-y-2 md:space-y-3">
                <Label
                  htmlFor="loan-term"
                  className="text-xs md:text-sm font-semibold text-primary-blue flex items-center"
                >
                  <div className="bg-primary-blue/10 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 text-primary-blue" />
                  </div>
                  Thời hạn vay
                </Label>
                <div className="relative">
                  <Input
                    id="loan-term"
                    type="number"
                    placeholder="24"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    className="border-2 border-gray-200 focus:border-primary-blue transition-colors h-10 md:h-14 pr-14 md:pr-20 text-left text-sm md:text-lg font-medium rounded-xl placeholder:text-gray-400"
                  />
                  <span className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 text-primary-blue text-xs md:text-sm font-semibold bg-primary-blue/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                    tháng
                  </span>
                </div>
              </div>

              {/* Loại hình vay */}
              <div className="space-y-2 md:space-y-3">
                <Label className="text-xs md:text-sm font-semibold text-primary-blue flex items-center">
                  <div className="bg-primary-blue/10 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3">
                    <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary-blue" />
                  </div>
                  Loại hình vay
                </Label>
                <Select value={loanType} onValueChange={setLoanType}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-primary-blue h-10 md:h-14 text-sm md:text-lg rounded-xl">
                    <SelectValue placeholder="Chọn loại hình vay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal-payment">Trả trên dư nợ gốc</SelectItem>
                    <SelectItem value="decreasing-balance">Trả trên dư nợ giảm dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hàng 2: 3 fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {/* Ngân hàng */}
              <div className="space-y-2 md:space-y-3">
                <Label className="text-xs md:text-sm font-semibold text-primary-blue flex items-center">
                  <div className="bg-primary-blue/10 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3">
                    <Building2 className="h-3 w-3 md:h-4 md:w-4 text-primary-blue" />
                  </div>
                  Ngân hàng
                </Label>
                <Select value={bank} onValueChange={setBank} name="bank">
                  <SelectTrigger className="border-2 border-gray-200 focus:border-primary-blue transition-colors h-10 md:h-14 text-sm md:text-lg font-medium rounded-xl placeholder:text-gray-400">
                    <SelectValue placeholder="Chọn ngân hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(bankLogoMap).map((bankKey) => {
                      const logoUrl = bankLogoMap[bankKey];
                      const isValidLogo = typeof logoUrl === 'string' && logoUrl.length > 0;
                      return (
                        <SelectItem key={bankKey} value={bankKey} className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            {isValidLogo ? (
                              <img src={logoUrl} alt={bankNameMap[bankKey] || bankKey} width={20} height={20} style={{ borderRadius: 4, background: '#fff', border: '1px solid #eee' }} />
                            ) : (
                              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500">
                                {bankNameMap[bankKey]?.charAt(0) || bankKey.charAt(0)}
                              </span>
                            )}
                            <span>{bankNameMap[bankKey] || bankKey}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Tên Banker */}
              <div className="space-y-2 md:space-y-3">
                <Label
                  htmlFor="banker-name"
                  className="text-xs md:text-sm font-semibold text-primary-blue flex items-center"
                >
                  <div className="bg-primary-blue/10 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3">
                    <User className="h-3 w-3 md:h-4 md:w-4 text-primary-blue" />
                  </div>
                  Tên Banker
                </Label>
                <Input
                  id="banker-name"
                  placeholder="Banker xinh gái"
                  value={bankerName}
                  onChange={(e) => setBankerName(e.target.value)}
                  className="border-2 border-gray-200 focus:border-primary-blue transition-colors h-10 md:h-14 text-sm md:text-lg font-medium rounded-xl placeholder:text-gray-400"
                />
              </div>

              {/* Liên hệ */}
              <div className="space-y-2 md:space-y-3">
                <Label
                  htmlFor="contact-info"
                  className="text-xs md:text-sm font-semibold text-primary-blue flex items-center"
                >
                  <div className="bg-primary-blue/10 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3">
                    <Phone className="h-3 w-3 md:h-4 md:w-4 text-primary-blue" />
                  </div>
                  Liên hệ
                </Label>
                <Input
                  id="contact-info"
                  placeholder="0123 456 789"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="border-2 border-gray-200 focus:border-primary-blue transition-colors h-10 md:h-14 text-sm md:text-lg font-medium rounded-xl placeholder:text-gray-400"
                />
              </div>

              {/* Ô trống để cân bằng layout */}
              <div className="hidden lg:block"></div>
            </div>

            <div className="text-center mt-8 md:mt-12">
              <Button
                id="btn-form-calculate"
                onClick={() => {
                  window.dataLayer = window.dataLayer || [];
                  window.dataLayer.push({
                    event: 'button_click',
                    button_name: 'btn-form-calculate'
                  });
                  calculateLoan();
                }}
                size="lg"
                className="bg-primary-blue hover:bg-primary-blue-dark text-white px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <Calculator className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Tính Toán Ngay
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && calculation && (
          <motion.section
            id="results-section"
            className="py-12 md:py-16 px-4 bg-gray-50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div ref={resultRef} className="max-w-7xl mx-auto space-y-6 md:space-y-8">
              {/* Header - Mobile Responsive */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                {/* Header Responsive: Mobile giữ nguyên, Desktop (lg) tất cả trên 1 hàng */}
                <div className="w-full lg:flex lg:items-center lg:justify-between lg:space-x-6">
                  {/* Cụm logo + text: bên trái, flex-1 trên desktop */}
                  <div className="flex items-center lg:flex-1">
                    {/* Logo ngân hàng */}
                    {bank && bankLogoMap[bank] && (
                      <div className="flex-shrink-0 flex items-center justify-center mr-3">
                        <Image src={bankLogoMap[bank]} alt={bank} width={40} height={40} className="w-10 h-10 md:w-12 md:h-12 object-contain border-2 border-gray-200 shadow-lg rounded-lg" />
                      </div>
                    )}
                    {/* Text */}
                    <div>
                      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-black text-left">
                        Kết Quả Tính Lãi Vay Ngân Hàng
                      </h2>
                      <p className="text-xs md:text-sm lg:text-base text-gray-600 text-left">
                        Ngân hàng: <span className="font-semibold text-primary-blue">{bankNameMap[bank] || bank}</span> | Banker:{" "}
                        <span className="font-semibold text-primary-blue">{bankerName}</span> | Liên hệ:{" "}
                        <span className="font-semibold text-primary-blue">{contactInfo}</span>
                      </p>
                    </div>
                  </div>
                  {/* Cụm nút: phải trên desktop, dưới trên mobile */}
                  <div className="flex flex-wrap gap-2 w-auto justify-end mt-2 lg:mt-0">
                    <Button
                      id="btn-download-image"
                      onClick={() => {
                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                          event: 'button_click',
                          button_name: 'btn-download-image',
                          loan_amount: loanAmount,
                          interest_rate: interestRate,
                          loan_term: loanTerm,
                          loan_type: loanType,
                          bank: bank,
                          banker_name: bankerName,
                          contact_info: contactInfo
                        });
                        handleDownloadImage();
                      }}
                      size="sm"
                      variant="outline"
                      className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white text-xs px-2 md:px-3 h-8 md:h-9 min-w-16"
                    >
                      <ImageIcon className="mr-1 h-3 w-3" />
                      Ảnh
                    </Button>
                    <Button
                      id="btn-download-excel"
                      onClick={() => {
                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                          event: 'button_click',
                          button_name: 'btn-download-excel',
                          loan_amount: loanAmount,
                          interest_rate: interestRate,
                          loan_term: loanTerm,
                          loan_type: loanType,
                          bank: bank,
                          banker_name: bankerName,
                          contact_info: contactInfo
                        });
                        handleExportSheets();
                      }}
                      size="sm"
                      variant="outline"
                      className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white text-xs px-2 md:px-3 h-8 md:h-9 min-w-16"
                    >
                      <FileSpreadsheet className="mr-1 h-3 w-3" />
                      Excel
                    </Button>
                    <Button
                      id="btn-copy-link"
                      onClick={() => {
                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                          event: 'button_click',
                          button_name: 'btn-copy-link',
                          loan_amount: loanAmount,
                          interest_rate: interestRate,
                          loan_term: loanTerm,
                          loan_type: loanType,
                          bank: bank,
                          banker_name: bankerName,
                          contact_info: contactInfo
                        });
                        handleCopyURL();
                      }}
                      size="sm"
                      variant="outline"
                      className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white text-xs px-2 md:px-3 h-8 md:h-9 min-w-16"
                    >
                      {copied ? <CheckIcon className="mr-1 h-3 w-3" /> : <LinkIcon className="mr-1 h-3 w-3" />}
                      {copied ? "Đã sao chép" : "Link"}
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Layout 2 bảng cùng 1 dòng */}
              <div ref={resultRef} className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
                {/* Tổng Quan - 2/5 */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <Card className="shadow-xl border-0 bg-white card-hover h-full">
                    <CardHeader className="bg-primary-blue text-white rounded-t-lg h-12 md:h-16 flex flex-row items-center justify-start px-4 md:px-6">
                      <CardTitle className="flex items-center text-sm md:text-lg font-semibold">
                        <Banknote className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Tổng Quan Khoản Vay
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium text-xs md:text-sm">Số tiền vay gốc</span>
                          <span className="font-semibold text-gray-800 text-xs md:text-base">
                            {formatCurrency(Number.parseFloat(loanAmount.replace(/[^\d]/g, "")))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium text-xs md:text-sm">Tổng tiền lãi</span>
                          <span className="font-semibold text-gray-800 text-xs md:text-base">
                            {formatCurrency(calculation.totalInterest)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b-2 border-primary-blue/20">
                          <span className="text-gray-700 font-semibold text-xs md:text-base">Tổng tiền phải trả</span>
                          <span className="font-bold text-gray-800 text-sm md:text-lg">
                            {formatCurrency(calculation.totalPayment)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 bg-primary-blue/10 rounded-lg px-4">
                          <span className="text-gray-700 font-semibold text-xs md:text-sm">
                            {loanType === "equal-payment" ? "Số tiền trả hàng tháng" : "Số tiền trả tháng đầu"}
                          </span>
                          <span className="font-bold text-primary-blue text-sm md:text-lg">
                            {formatCurrency(calculation.monthlyPayment)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Bảng chi tiết - 3/5 */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="lg:col-span-3"
                >
                  <div className="bg-white rounded-lg shadow-xl border-0 card-hover h-full">
                    <div className="bg-primary-blue text-white p-3 md:p-4 rounded-t-lg h-12 md:h-16 flex items-center justify-start px-4 md:px-6">
                      <h3 className="text-sm md:text-lg font-semibold flex items-center">
                        <Clock className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Lịch Thanh Toán Chi Tiết
                      </h3>
                    </div>
                    <div className="p-3 md:p-4">
                      <div className="overflow-x-auto">
                        <div className="h-[300px] md:h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100">
                          <table className="w-full min-w-[600px] md:min-w-[700px]">
                            <thead className="sticky top-0 bg-white z-10">
                              <tr className="border-b-2 border-primary-blue">
                                <th className="text-center py-2 md:py-3 px-1 md:px-2 font-semibold text-primary-blue text-xs md:text-sm w-12 md:w-16">
                                  Kỳ
                                </th>
                                <th className="text-right py-2 md:py-3 px-1 md:px-2 font-bold text-primary-blue text-xs md:text-sm w-24 md:w-32">
                                  Dự nợ đầu kỳ
                                </th>
                                <th className="text-right py-2 md:py-3 px-1 md:px-2 font-semibold text-primary-blue text-xs md:text-sm w-20 md:w-24">
                                  Trả gốc
                                </th>
                                <th className="text-right py-2 md:py-3 px-1 md:px-2 font-semibold text-primary-blue text-xs md:text-sm w-20 md:w-24">
                                  Trả lãi
                                </th>
                                <th className="text-right py-2 md:py-3 px-1 md:px-2 font-semibold text-primary-blue text-xs md:text-sm w-24 md:w-28">
                                  Tổng trả
                                </th>
                                <th className="text-right py-2 md:py-3 px-1 md:px-2 font-bold text-primary-blue text-xs md:text-sm w-24 md:w-32">
                                  Dư nợ còn lại
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {calculation.schedule.map((payment, index) => (
                                <motion.tr key={payment.month} className="border-b border-gray-100 hover:bg-blue-50">
                                  <td className="py-2 md:py-3 px-1 md:px-2 font-medium text-center text-xs md:text-sm">
                                    {payment.month}
                                  </td>
                                  <td className="py-2 md:py-3 px-1 md:px-2 text-right text-xs md:text-sm font-bold text-primary-blue">
                                    {formatCurrency(payment.startingBalance)}
                                  </td>
                                  <td className="py-2 md:py-3 px-1 md:px-2 text-right text-xs md:text-sm">
                                    {formatCurrency(payment.principal)}
                                  </td>
                                  <td className="py-2 md:py-3 px-1 md:px-2 text-right text-xs md:text-sm">
                                    {formatCurrency(payment.interest)}
                                  </td>
                                  <td className="py-2 md:py-3 px-1 md:px-2 text-right font-medium text-gray-800 text-xs md:text-sm">
                                    {formatCurrency(payment.monthlyPayment)}
                                  </td>
                                  <td className="py-2 md:py-3 px-1 md:px-2 text-right text-xs md:text-sm font-bold text-primary-blue">
                                    {formatCurrency(payment.balance)}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="mt-3 md:mt-4 text-center">
                        <p className="text-xs md:text-sm text-gray-500 italic">
                          (*) Công cụ tính lãi suất vay có tính chất tham khảo. Vui lòng liên hệ ngân hàng để được tư
                          vấn cụ thể.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-left md:text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-blue to-transparent"></div>
              </div>
              <div className="relative bg-gray-50 px-4 md:px-8">
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <div className="bg-primary-blue/10 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-primary-blue" />
                  </div>
                  <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-black text-left md:text-center">
                    Câu Hỏi Thường Gặp
                  </h2>
                </div>
              </div>
            </div>
            <p className="text-gray-600 max-w-3x2 mx-auto mt-3 md:mt-4 text-sm md:text-base text-left md:text-center">
              Giải đáp các thắc mắc phổ biến về lãi suất vay ngân hàng và cách sử dụng công cụ tính lãi của chúng tôi.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
                <AccordionItem
                  value="item-1"
                  className="border border-gray-200 rounded-lg px-3 md:px-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-black font-semibold hover:no-underline text-left md:text-left text-sm md:text-base">
                    Công cụ tính lãi ngân hàng online này có chính xác không?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-left md:text-left text-xs md:text-sm">
                    Công cụ sử dụng công thức tính toán chuẩn của ngành ngân hàng, kết quả chỉ mang tính chất tham khảo.
                    Lãi suất và điều kiện thực tế có thể khác tùy theo chính sách từng ngân hàng.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-2"
                  className="border border-gray-200 rounded-lg px-3 md:px-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-black font-semibold hover:no-underline text-left md:text-left text-sm md:text-base">
                    Nên chọn tính lãi trả trên dư nợ gốc hay trả trên dư nợ giảm dần?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-left md:text-left text-xs md:text-sm">
                    Việc lựa chọn giữa trả trên dư nợ gốc và trả trên dư nợ giảm dần phụ thuộc vào khả năng tài chính và kế hoạch trả nợ
                    của bạn. Trả trên dư nợ gốc có số tiền trả hàng tháng ổn định, dễ dàng quản lý ngân sách. Trả trên dư nợ giảm dần giúp
                    bạn trả ít lãi hơn về lâu dài.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:block hidden"
            >
              <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
                <AccordionItem
                  value="item-3"
                  className="border border-gray-200 rounded-lg px-3 md:px-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-black font-semibold hover:no-underline text-left md:text-left text-sm md:text-base">
                    Lãi suất ưu đãi và lãi suất sau ưu đãi khác nhau như thế nào?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-left md:text-left text-xs md:text-sm">
                    Lãi suất ưu đãi là mức lãi suất thấp hơn áp dụng trong một khoảng thời gian nhất định (ví dụ: 3-6
                    tháng đầu). Sau thời gian ưu đãi, lãi suất sẽ điều chỉnh về mức thông thường, thường cao hơn lãi
                    suất ưu đãi.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-4"
                  className="border border-gray-200 rounded-lg px-3 md:px-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-black font-semibold hover:no-underline text-left md:text-left text-sm md:text-base">
                    Hồ sơ vay vốn ngân hàng cơ bản cần những gì?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-left md:text-left text-xs md:text-sm">
                    Hồ sơ vay vốn thường bao gồm: CMND/CCCD, sổ hộ khẩu, giấy tờ chứng minh thu nhập (sao kê lương, hợp
                    đồng lao động), giấy tờ liên quan đến tài sản đảm bảo (nếu có).
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>

            {/* Mobile FAQ - Single Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:hidden block"
            >
              <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
                <AccordionItem
                  value="item-3"
                  className="border border-gray-200 rounded-lg px-3 md:px-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-black font-semibold hover:no-underline text-left md:text-left text-sm md:text-base">
                    Lãi suất ưu đãi và lãi suất sau ưu đãi khác nhau như thế nào?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-left md:text-left text-xs md:text-sm">
                    Lãi suất ưu đãi là mức lãi suất thấp hơn áp dụng trong một khoảng thời gian nhất định (ví dụ: 3-6
                    tháng đầu). Sau thời gian ưu đãi, lãi suất sẽ điều chỉnh về mức thông thường, thường cao hơn lãi
                    suất ưu đãi.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-4"
                  className="border border-gray-200 rounded-lg px-3 md:px-4 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-black font-semibold hover:no-underline text-left md:text-left text-sm md:text-base">
                    Hồ sơ vay vốn ngân hàng cơ bản cần những gì?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-left md:text-left text-xs md:text-sm">
                    Hồ sơ vay vốn thường bao gồm: CMND/CCCD, sổ hộ khẩu, giấy tờ chứng minh thu nhập (sao kê lương, hợp
                    đồng lao động), giấy tờ liên quan đến tài sản đảm bảo (nếu có).
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section - Đặt sau FAQ */}
      <section className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 md:mb-6">
                Lãi Suất Vay Ngân Hàng Là Gì và Vì Sao Cần Tính Toán Chính Xác?
              </h2>

              <p className="text-gray-700 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                Lãi suất vay ngân hàng là tỷ lệ phần trăm (%) trên số tiền gốc mà bạn phải trả thêm cho ngân hàng khi
                vay vốn. Hiểu đơn giản, đây là chi phí bạn phải trả để được sử dụng tiền của ngân hàng trong một khoảng
                thời gian nhất định. Việc sử dụng một <strong>công cụ tính lãi suất ngân hàng online</strong> chính xác
                sẽ giúp bạn lập kế hoạch tài chính hiệu quả, tránh những bất ngờ không đáng có và so sánh các lựa chọn
                vay vốn một cách minh bạch.
              </p>

              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">
                Các Loại Lãi Suất Vay Phổ Biến
              </h3>
              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-gray-700 text-sm md:text-base">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>
                    <strong>Lãi suất cố định:</strong> Là loại lãi suất không thay đổi trong suốt thời gian vay. Ưu điểm
                    là giúp bạn dễ dàng dự trù chi phí trả nợ hàng tháng.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>
                    <strong>Lãi suất thả nổi:</strong> Lãi suất sẽ thay đổi theo từng kỳ điều chỉnh (ví dụ: 3 tháng, 6
                    tháng, 12 tháng) dựa trên biến động của thị trường. Lãi suất này có thể thấp hơn lúc đầu nhưng tiềm
                    ẩn rủi ro tăng lên sau này.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>
                    <strong>Lãi suất hỗn hợp:</strong> Là sự kết hợp của hai loại trên, thường là cố định trong một thời
                    gian đầu (gọi là thời gian ưu đãi) và sau đó chuyển sang thả nổi.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 md:mb-6">
                Hướng Dẫn Sử Dụng Công Cụ Tính Lãi Vay Của Chúng Tôi
              </h2>
              <p className="text-gray-700 mb-3 md:mb-4 text-sm md:text-base">
                Để có cái nhìn tổng quan về khoản vay tương lai, bạn chỉ cần thực hiện các bước đơn giản sau:
              </p>

              <ol className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-gray-700 text-sm md:text-base">
                <li className="flex items-start">
                  <span className="bg-primary-blue text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 mt-0.5 flex-shrink-0">
                    1
                  </span>
                  <span>
                    <strong>Bước 1: Nhập tổng số tiền cần vay:</strong> Điền chính xác số vốn bạn dự định vay từ ngân
                    hàng.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-blue text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 mt-0.5 flex-shrink-0">
                    2
                  </span>
                  <span>
                    <strong>Bước 2: Nhập thời hạn vay:</strong> Thời gian bạn muốn trả hết khoản vay, tính bằng tháng
                    hoặc năm.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-blue text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 mt-0.5 flex-shrink-0">
                    3
                  </span>
                  <span>
                    <strong>Bước 3: Nhập lãi suất (%/năm):</strong> Điền mức lãi suất dự kiến mà ngân hàng cung cấp.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-blue text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 mt-0.5 flex-shrink-0">
                    4
                  </span>
                  <span>
                    <strong>Bước 4: Chọn phương pháp tính lãi:</strong> Lựa chọn giữa 'Trả trên dư nợ gốc' hoặc 'Trả
                    trên dư nợ giảm dần'.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-blue text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 mt-0.5 flex-shrink-0">
                    5
                  </span>
                  <span>
                    <strong>Bước 5: Nhấn nút "Tính lãi vay":</strong> Hệ thống sẽ ngay lập tức trả về bảng chi tiết số
                    tiền gốc và lãi phải trả hàng tháng, cùng tổng số tiền phải thanh toán.
                  </span>
                </li>
              </ol>

              {showFullContent && (
                <div className="space-y-4 md:space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 md:mb-6">
                    {month && year
                      ? `Bảng Lãi Suất Vay Ngân Hàng Cập Nhật Tháng ${month}/${year} (Tham khảo)`
                      : 'Bảng Lãi Suất Vay Ngân Hàng (Tham khảo)'}
                  </h2>
                  <p className="text-gray-700 mb-4 md:mb-6 text-sm md:text-base">
                    Dưới đây là bảng tổng hợp lãi suất cho vay mua nhà tại một số ngân hàng lớn tại Việt Nam để bạn tham
                    khảo. Lưu ý rằng các <strong>lãi suất ngân hàng online</strong> này có thể thay đổi.
                  </p>

                  <div className="overflow-x-auto mb-6 md:mb-8">
                    <table className="w-full border-collapse border border-gray-300 rounded-lg text-xs md:text-sm">
                      <thead className="bg-primary-blue/10">
                        <tr>
                          <th className="border border-gray-300 px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary-blue">
                            Ngân hàng
                          </th>
                          <th className="border border-gray-300 px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-primary-blue">
                            Lãi suất ưu đãi (%/năm)
                          </th>
                          <th className="border border-gray-300 px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-primary-blue">
                            Tỷ lệ cho vay tối đa (%)
                          </th>
                          <th className="border border-gray-300 px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-primary-blue">
                            Kỳ hạn vay tối đa (năm)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(bankLinks).map(([name, url]) => (
                          <tr className="hover:bg-gray-50" key={name}>
                            <td className="border border-gray-300 px-2 md:px-4 py-2 md:py-3">
                              <a href={url} target="_blank" rel="noopener" className="text-primary-blue underline hover:text-blue-700 font-semibold">{name}</a>
                            </td>
                            <td className="border border-gray-300 px-2 md:px-4 py-2 md:py-3 text-center">{bankRates[name]?.rate ?? "-"}</td>
                            <td className="border border-gray-300 px-2 md:px-4 py-2 md:py-3 text-center">{bankRates[name]?.max ?? "-"}</td>
                            <td className="border border-gray-300 px-2 md:px-4 py-2 md:py-3 text-center">{bankRates[name]?.term ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-gray-700 mb-6 md:mb-8 text-sm md:text-base">
                    <strong>Lưu ý quan trọng:</strong> Bảng lãi suất trên chỉ mang tính chất tham khảo tại thời điểm
                    tháng 6/2025 và có thể thay đổi. Lãi suất thực tế sẽ phụ thuộc vào chính sách của từng ngân hàng và
                    hồ sơ cụ thể của khách hàng. Hãy liên hệ trực tiếp với ngân hàng để có thông tin chính xác nhất.
                  </p>
                </div>
              )}

              <div className="mt-6 md:mt-8 text-center">
                <Button
                  onClick={() => setShowFullContent(!showFullContent)}
                  variant="outline"
                  className="border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white transition-colors text-sm md:text-base"
                >
                  {showFullContent ? "Thu gọn" : "Xem thêm nội dung"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DOM ẩn để export ảnh/PDF */}
      <div style={{ opacity: 0, pointerEvents: 'none', position: "absolute", left: 0, top: 0, width: '100vw', height: 'auto', zIndex: -1 }}>
        <ExportableResult
          ref={hiddenResultRef}
          calculation={calculation}
          loanAmount={loanAmount}
          interestRate={interestRate}
          loanTerm={loanTerm}
          loanType={loanType}
          bank={bank}
          bankerName={bankerName}
          contactInfo={contactInfo}
        />
      </div>

      {/* Footer */}
      <div className="w-full text-center text-gray-500 text-xs md:text-sm py-8">
        <div>© 2025 BankerTool. Tất cả bản quyền được bảo lưu.</div>
        <div>Đối với quan hệ đối tác quảng cáo hoặc đóng góp, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:support@bankertool.online" className="underline hover:text-primary-blue">support@bankertool.online</a></div>
      </div>
    </div>
  )
}
