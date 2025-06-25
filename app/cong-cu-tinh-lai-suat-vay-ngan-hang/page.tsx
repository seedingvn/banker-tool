"use client";

export const dynamic = "force-dynamic";
import { Suspense } from "react";
import BankLoanCalculatorClient from './BankLoanCalculatorClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <BankLoanCalculatorClient />
    </Suspense>
  );
}