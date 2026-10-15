"use client";

import { useEffect, useState } from "react";

import { useParams, useSearchParams } from "next/navigation";

import axios from "axios";

import {

  ShieldCheck,

  Zap,

  ArrowLeft,

  Copy,

  CheckCircle2,

  Loader2,

  Sparkles,

  UserCircle,

  FileText,

  Terminal,

  Cpu,

  Fingerprint

} from "lucide-react";



// Interview requests use the authenticated Next.js CV API route.



export default function InterviewPage() {

  const params = useParams();

  const searchParams = useSearchParams();

  const [quizData, setQuizData] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [copied, setCopied] = useState(false);



  useEffect(() => {

    const fetchQuiz = async () => {

      const candidateName = decodeURIComponent(params.id as string);

      const rid = searchParams.get("rid");



      const savedQuiz = localStorage.getItem(`report_quiz_${candidateName}_${rid}`);

      if (savedQuiz) {

        setQuizData(savedQuiz);

        setLoading(false);

        return;

      }



      const cvText = localStorage.getItem(`quiz_cv_${candidateName}_${rid}`);

      const jdText = localStorage.getItem(`quiz_jd_${candidateName}_${rid}`);



      if (!cvText || !jdText) {

        setQuizData("Error: Required intelligence data not found. Please re-launch from dashboard.");

        setLoading(false);

        return;

      }



      try {

        // The Next.js route forwards this request with the server-side Asgardeo access token.
        const formData = new FormData();
        formData.append("cv_text", cvText);
        formData.append("jd", jdText);

        const res = await axios.post("/api/cv/get-quiz", formData);



        setQuizData(res.data.quiz);

        localStorage.setItem(`report_quiz_${candidateName}_${rid}`, res.data.quiz);

        localStorage.removeItem(`quiz_cv_${candidateName}_${rid}`);

        localStorage.removeItem(`quiz_jd_${candidateName}_${rid}`);

      } catch (e) {

        setQuizData("Failed to establish AI connection. Please verify your backend server.");

      } finally {

        setLoading(false);

      }

    };



    fetchQuiz();

  }, [params.id, searchParams]);



  const handleCopy = () => {

    if (!quizData) return;

    navigator.clipboard.writeText(quizData);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

  };



  if (loading) {

    return (

      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white font-sans">

        <div className="relative flex items-center justify-center">

          <div className="absolute w-40 h-40 border border-indigo-500/10 rounded-full animate-[ping_3s_linear_infinite]" />

          <div className="absolute w-32 h-32 border-2 border-indigo-500/20 rounded-full animate-[spin_4s_linear_infinite]" />

          <div className="z-10 bg-indigo-500/10 p-5 rounded-3xl backdrop-blur-xl border border-indigo-500/20">

            <Cpu className="w-10 h-10 text-indigo-400 animate-pulse" />

          </div>

        </div>

        <div className="mt-12 text-center space-y-3">

          <h2 className="text-[11px] font-black uppercase tracking-[1em] text-indigo-400">

            Synthesizing Intelligence

          </h2>

          <p className="text-[9px] tracking-[0.4em] text-slate-500 font-bold uppercase italic">

            Neural Processing Unit Active

          </p>

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 pb-24 selection:bg-indigo-100 font-sans">



      {/* ENTERPRISE HEADER */}

      <header className="bg-[#020617] pt-24 pb-40 px-8 relative overflow-hidden">

        {/* Abstract Background Gradients */}

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[140px] rounded-full -mr-32 -mt-32" />

        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full -ml-24 -mb-24" />



        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-12">

          <div className="space-y-6 max-w-2xl">

            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">

              <Sparkles size={14} className="text-indigo-400" />

              <span className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em]">

                Neural Strategic Module

              </span>

            </div>

            <h1 className="text-6xl font-black tracking-tighter text-white leading-[1.1]">

              Smart Interview <br/>

              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-500">Intelligence.</span>

            </h1>

          </div>



          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-2xl relative group overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[1.2rem] flex items-center justify-center text-indigo-400 shadow-inner border border-white/5 relative z-10">

              <UserCircle size={32} strokeWidth={1.5} />

            </div>

            <div className="relative z-10">

              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Target Candidate</p>

              <p className="text-xl text-white font-bold tracking-tight">{decodeURIComponent(params.id as string)}</p>

            </div>

          </div>

        </div>

      </header>



      {/* INTELLIGENCE CONTAINER */}

      <main className="max-w-6xl mx-auto px-8 -mt-24 relative z-20">

        <div className="bg-white border border-slate-200/60 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] overflow-hidden">



          {/* CONTROL CONSOLE */}

          <div className="px-12 py-7 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-6">

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 shadow-lg">

                <Terminal size={18} />

              </div>

              <div className="space-y-0.5">

                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Script Terminal</p>

                <div className="flex items-center gap-2">

                  <div className="w-2 h-2 rounded-full bg-emerald-500" />

                  <span className="text-[11px] font-bold text-slate-600 uppercase">Analysis Engine Complete</span>

                </div>

              </div>

            </div>



            <button

              onClick={handleCopy}

              className={`group flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 shadow-sm hover:-translate-y-0.5 active:translate-y-0 ${

                copied

                  ? "bg-emerald-500 text-white"

                  : "bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200"

              }`}

            >

              {copied ? (

                <><CheckCircle2 size={16} /> Data Copied</>

              ) : (

                <><Copy size={16} className="group-hover:rotate-12 transition-transform" /> Copy Full Script</>

              )}

            </button>

          </div>



          {/* SCRIPT OUTPUT */}

          <div className="p-12 md:p-24 relative">

            <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-indigo-600 pointer-events-none">

              <Fingerprint size={240} />

            </div>



            <div className="max-w-4xl mx-auto space-y-12 relative z-10">

              <div className="flex items-center gap-4 mb-4">

                <div className="w-[2px] h-8 bg-indigo-500 rounded-full" />

                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Structured Intelligence Report</h3>

              </div>



              <div className="bg-slate-50/70 border border-slate-100 rounded-[2.5rem] p-12 md:p-16">

                <div className="whitespace-pre-wrap text-base md:text-lg leading-[1.9] text-slate-700 font-medium tracking-tight">

                  {quizData}

                </div>

              </div>



              {/* ANALYTICS METRICS */}

              <div className="grid sm:grid-cols-2 gap-8">

                <div className="p-10 rounded-[2rem] bg-indigo-50/40 border border-indigo-100/50 flex items-start gap-6 hover:bg-indigo-50 transition-colors duration-500">

                  <div className="shrink-0 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">

                    <ShieldCheck size={28} strokeWidth={1.5} />

                  </div>

                  <div className="space-y-1.5">

                    <h4 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest">Neural Validation</h4>

                    <p className="text-xs text-indigo-700/60 leading-relaxed font-medium">Verified cross-alignment between CV history and JD requirements.</p>

                  </div>

                </div>



                <div className="p-10 rounded-[2rem] bg-blue-50/40 border border-blue-100/50 flex items-start gap-6 hover:bg-blue-50 transition-colors duration-500">

                  <div className="shrink-0 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">

                    <Zap size={28} strokeWidth={1.5} />

                  </div>

                  <div className="space-y-1.5">

                    <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Strategic Insight</h4>

                    <p className="text-xs text-blue-700/70 leading-relaxed font-medium">Advanced LLM logic pinpointing high-value inquiry vectors.</p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>



        {/* NAVIGATION */}

        <div className="mt-16 flex justify-center">

          <button

            onClick={() => window.close()}

            className="group flex items-center gap-4 px-12 py-5 bg-white border border-slate-200 text-slate-500 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95"

          >

            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />

            Terminate & Return to Mission Control

          </button>

        </div>

      </main>



      <footer className="mt-32 pb-16 text-center">

        <div className="flex flex-col items-center gap-6 opacity-30">

          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

          <p className="text-[9px] tracking-[0.8em] font-black text-slate-500 uppercase">

            Vision Front Insights • Proprietary Intelligence Engine v2.0

          </p>

        </div>

      </footer>

    </div>

  );

}