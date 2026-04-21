import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Code Evaluation Platform",
  description: "Automated code analysis, pattern detection, and intelligent interview evaluation system for student Python repositories",
  keywords: ["code evaluation", "AI", "code analysis", "algorithm detection", "interview system"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
