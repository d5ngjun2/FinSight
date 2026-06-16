import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "FinSight - AI 개인 가계부",
  description: "AI 기반 소비 패턴 분석 및 절약 가이드를 제공하는 스마트 가계부",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
