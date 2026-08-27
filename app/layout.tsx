import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JCL.AI — AI Full-Stack Engineer",
  description: "蒋朝龙的个人作品集：Agentic RAG、多模态 AI、实时智能系统与全栈产品工程。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
