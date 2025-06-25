import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'

interface LoanCalculation {
  schedule: {
    month: number
    principal: number
    interest: number
    balance: number
    monthlyPayment: number
    startingBalance: number
  }[]
  totalInterest: number
  totalPayment: number
  monthlyPayment: number
}

interface ExportableResultProps {
  calculation: LoanCalculation | null
  loanAmount: string
  interestRate: string
  loanTerm: string
  loanType: string
  bank: string
  bankerName: string
  contactInfo: string
}

const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
}

const loanTypeMap: { [key: string]: string } = {
    "equal-payment": "Trả trên dư nợ gốc",
    "decreasing-balance": "Trả trên dư nợ giảm dần"
};

export const ExportableResult = React.forwardRef<HTMLDivElement, ExportableResultProps>(
  ({ calculation, loanAmount, interestRate, loanTerm, loanType, bank, bankerName, contactInfo }, ref) => {
    
    if (!calculation) return null;

    const loanAmountNumber = Number(loanAmount.replace(/[^\d]/g, ""));
    const loanTypeName = loanTypeMap[loanType] || loanType;

    const bankLogoMap: { [key: string]: string } = {
      acb: '/logos-bank/acb.jpeg',
      hdbank: '/logos-bank/hdbank.jpg',
      mbbank: '/logos-bank/mbbank.jpg',
      ocb: '/logos-bank/ocb.jpg',
      tpbank: '/logos-bank/tpbank.jpg',
      techcombank: '/logos-bank/techcombank.jpg',
      uob: '/logos-bank/uob.jpg',
      vib: '/logos-bank/vib.jpg',
      vietinbank: '/logos-bank/vietinbank.jpg',
      vpbank: '/logos-bank/vpbank.jpg',
      hsbc: '/logos-bank/hsbc.png',
      shinhanbank: '/logos-bank/shinhanbank.jpg',
      standardchartered: '/logos-bank/standardchartered.png',
    };
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
      shinhanbank: 'Shinhan Bank',
      hsbc: 'HSBC',
      standardchartered: 'Standard Chartered',
    };

    return (
      <div ref={ref} className="relative overflow-hidden p-8 bg-white font-sans text-gray-800" style={{ width: 800, maxWidth: 800 }}>
        <div className="flex flex-row items-center justify-between mb-6 gap-6">
          <div className="flex flex-row items-center flex-1 min-w-0">
            {bank && bankLogoMap[bank] && (
              <div className="flex-shrink-0 flex items-center justify-center mr-4">
                <img src={bankLogoMap[bank]} alt={bankNameMap[bank] || bank} width={56} height={56} style={{width: 56, height: 56, objectFit: 'contain', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)', border: '2px solid #e5e7eb', borderRadius: 12}} />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-2xl font-bold block truncate">Kết Quả Tính Lãi Vay Ngân Hàng</span>
              <div className="text-sm text-gray-600 mt-1 truncate">
                Ngân hàng: <span className="font-semibold text-blue-600">{bankNameMap[bank] || bank}</span>
                {bankerName && <span> | Banker: <span className="font-semibold text-blue-600">{bankerName}</span></span>}
                {contactInfo && <span> | Liên hệ: <span className="font-semibold text-blue-600">{contactInfo}</span></span>}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0 select-none pointer-events-none">
          {bankerName && (
            <div className="text-black/5 text-6xl font-extrabold -rotate-30 whitespace-nowrap leading-tight">
              {bankerName}
            </div>
          )}
          {contactInfo && (
            <div className="text-black/5 text-5xl font-extrabold -rotate-30 whitespace-nowrap leading-tight">
              {contactInfo}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg border-blue-200">
            <CardHeader className="bg-blue-600 text-white p-3 rounded-t-lg">
              <CardTitle className="text-base font-semibold">Tóm tắt thông tin</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm">
              <ul className="space-y-2">
                <li className="flex justify-between border-b pb-2"><span>Số tiền vay</span><span className="font-medium">{formatCurrency(loanAmountNumber)}</span></li>
                <li className="flex justify-between border-b pb-2"><span>Thời hạn vay</span><span className="font-medium">{loanTerm} tháng</span></li>
                <li className="flex justify-between border-b pb-2"><span>Lãi suất</span><span className="font-medium">{interestRate} %/năm</span></li>
                <li className="flex justify-between border-b pb-2"><span>Phương thức trả</span><span className="font-medium">{loanTypeName}</span></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-blue-200">
            <CardHeader className="bg-blue-600 text-white p-3 rounded-t-lg">
              <CardTitle className="text-base font-semibold">Tổng quan khoản vay</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm">
              <ul className="space-y-2">
                <li className="flex justify-between border-b pb-2"><span>Số tiền vay gốc</span><span className="font-medium">{formatCurrency(loanAmountNumber)}</span></li>
                <li className="flex justify-between border-b pb-2"><span>Tổng tiền lãi</span><span className="font-medium">{formatCurrency(calculation.totalInterest)}</span></li>
                <li className="flex justify-between border-b pb-2"><span>Tổng tiền phải trả</span><span className="font-bold text-base">{formatCurrency(calculation.totalPayment)}</span></li>
                <li className="flex justify-between mt-4 p-2 bg-blue-50 rounded-md">
                    <span className="font-semibold text-blue-700">{loanType === "equal-payment" ? "Trả hàng tháng" : "Trả tháng đầu"}</span>
                    <span className="font-bold text-base text-blue-700">{formatCurrency(calculation.monthlyPayment)}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg overflow-hidden border shadow-lg">
            <table className="w-full text-xs text-left bg-white">
            <thead className="bg-blue-600/10">
                <tr>
                <th className="p-2 font-semibold text-blue-800 text-center">Kỳ</th>
                <th className="p-2 font-semibold text-blue-800 text-right">Dư nợ đầu kỳ</th>
                <th className="p-2 font-semibold text-blue-800 text-right">Trả gốc</th>
                <th className="p-2 font-semibold text-blue-800 text-right">Trả lãi</th>
                <th className="p-2 font-semibold text-blue-800 text-right">Tổng trả</th>
                <th className="p-2 font-semibold text-blue-800 text-right">Dư nợ còn lại</th>
                </tr>
            </thead>
            <tbody>
                {calculation.schedule.map((p) => (
                <tr key={p.month} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="p-2 text-center font-medium align-middle">{p.month}</td>
                    <td className="p-2 text-right">{formatCurrency(p.startingBalance)}</td>
                    <td className="p-2 text-right text-green-600">{formatCurrency(p.principal)}</td>
                    <td className="p-2 text-right text-red-600">{formatCurrency(p.interest)}</td>
                    <td className="p-2 text-right font-semibold">{formatCurrency(p.monthlyPayment)}</td>
                    <td className="p-2 text-right font-bold text-blue-800">{formatCurrency(p.balance)}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        <div className="mt-2 text-xs italic text-gray-500 text-right">*Công cụ tính lãi suất vay ngân hàng: BankerTool.Online</div>
      </div>
    )
  }
)

ExportableResult.displayName = 'ExportableResult'; 