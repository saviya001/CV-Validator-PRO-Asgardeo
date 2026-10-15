import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ShieldCheck, Mail, Globe, Link } from "lucide-react";
import { AsgardeoProvider } from "@asgardeo/nextjs/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vision Front Insights | AI CV Verification Engine",
  description: "Enterprise-grade AI solution for candidate verification and ATS analysis.",
};

// --- Footer Component Only ---
const Footer = () => (
  <footer className="bg-[#0f172a] border-t border-white/5 pt-16 pb-8 px-8 mt-auto">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShieldCheck className="text-indigo-500" size={20} />
            <span>CV Validator PRO</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs">
            Next generation AI recruitment intelligence designed to ensure data integrity and candidate authenticity.
          </p>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Global Standards</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/5 rounded-md text-[9px] text-slate-400 border border-white/10 uppercase font-bold">ATS Compliant</span>
            <span className="px-3 py-1 bg-white/5 rounded-md text-[9px] text-slate-400 border border-white/10 uppercase font-bold">Neural Analysis</span>
            <span className="px-3 py-1 bg-white/5 rounded-md text-[9px] text-slate-400 border border-white/10 uppercase font-bold">Safe Verification</span>
          </div>
        </div>

        <div className="space-y-4 text-right md:text-right">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Neural Linkage</h4>
          <div className="flex justify-end gap-4 text-slate-400">
            <button className="hover:text-indigo-400 transition-colors"><Link size={18} /></button>
            <button className="hover:text-indigo-400 transition-colors"><Link size={18} /></button>
            <button className="hover:text-indigo-400 transition-colors"><Mail size={18} /></button>
            <button className="hover:text-indigo-400 transition-colors"><Globe size={18} /></button>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Vision Front Insights.All Rights Reserved. 
        </p>
        <div className="flex gap-6 text-[9px] text-slate-600 font-black uppercase tracking-widest">
          <span className="cursor-pointer hover:text-slate-400">Privacy Protocol</span>
          <span className="cursor-pointer hover:text-slate-400">Security Core</span>
        </div>
      </div>
    </div>
  </footer>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#fcfdfe]`}
        suppressHydrationWarning
      >
      <main className="flex-grow">
  <AsgardeoProvider>
    {children}
  </AsgardeoProvider>
</main>

<Footer />
       
      </body>
    </html>
  );
}