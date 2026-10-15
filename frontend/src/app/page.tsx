"use client";

import { useState, useEffect } from "react"; 

import axios from "axios";
import { SignInButton, SignOutButton, SignedIn, SignedOut, User as AsgardeoUser } from "@asgardeo/nextjs";

import { 

  Upload, FileText, CheckCircle, AlertTriangle, Phone, Mail, 

  Search, Eye, MessageSquare, ShieldCheck, User, X, Globe, Star, ExternalLink, Briefcase, GraduationCap, Award, FolderGit2, Heart, Trophy, Check, Clock, ListFilter, UserCircle, Download

} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {

  const [files, setFiles] = useState([]);

  const [jd, setJd] = useState("");

  const [constraints, setConstraints] = useState("");

  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState([]);

  const [progress, setProgress] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);

  const [activeModal, setActiveModal] = useState(null); 

  const [modalData, setModalData] = useState(null);

  const [modalLoading, setModalLoading] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [initialSelected, setInitialSelected] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {

    setMounted(true);

  }, []);

  const handleFileChange = (e) => {

    setFiles(Array.from(e.target.files).slice(0, 50));

  };

  const handleAnalyze = async () => {

    if (files.length === 0 || !jd) return alert("Please upload CVs and JD first!");

    setLoading(true);

    setProgress(5);

    const estimatedSecs = files.length * 12;

    setTimeLeft(estimatedSecs);

    setInitialSelected(false);

    setSelectedCandidate(null);

    const formData = new FormData();

    files.forEach(f => formData.append("files", f));

    formData.append("jd", jd);

    formData.append("constraints", constraints);

    const timer = setInterval(() => {

      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));

      setProgress((prev) => (prev < 92 ? prev + 1 : prev));

    }, 1000);

    try {

      const res = await axios.post("/api/cv/analyze-multiple", formData)

      setProgress(100);

      setResults(res.data);

    } catch (e) { 

      alert("Backend Error! Check your FastAPI server."); 

    } finally { 

      clearInterval(timer);

      setLoading(false); 

    }

  };

  const viewPdf = (base64String) => {

    try {

      const byteCharacters = atob(base64String);

      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {

        byteNumbers[i] = byteCharacters.charCodeAt(i);

      }

      const byteArray = new Uint8Array(byteNumbers);

      const file = new Blob([byteArray], { type: 'application/pdf' });

      const fileURL = URL.createObjectURL(file);

      window.open(fileURL, '_blank');

    } catch (error) {

      alert("Error opening PDF.");

    }

  };

  const downloadPdf = (base64String, filename) => {

    try {

      const byteCharacters = atob(base64String);

      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {

        byteNumbers[i] = byteCharacters.charCodeAt(i);

      }

      const byteArray = new Uint8Array(byteNumbers);

      const file = new Blob([byteArray], { type: "application/pdf" });

      const fileURL = URL.createObjectURL(file);

      const link = document.createElement("a");

      link.href = fileURL;

      link.download = filename?.toLowerCase().endsWith(".pdf") ? filename : `${filename || "candidate_cv"}.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(fileURL);

    } catch (error) {

      alert("Error downloading PDF.");

    }

  };

  // --- 🔥 FIXED: Smart Quiz opens in a New Tab with a Unique ID ---

  const openQuiz = (cvText, candidateName) => {

    const reportId = Date.now();

    localStorage.setItem(`quiz_cv_${candidateName}_${reportId}`, cvText);

    localStorage.setItem(`quiz_jd_${candidateName}_${reportId}`, jd);

    window.open(`/interview/${encodeURIComponent(candidateName)}?rid=${reportId}`, '_blank');

  };

  // --- 🔥 FIXED: SaaS Grade Multi-Tab Logic for Full Analysis ---

  const openReport = (cvText, candidateName) => {

    const reportId = Date.now(); 

    localStorage.setItem(`active_cv_${candidateName}_${reportId}`, cvText);

    window.open(`/analysis/${encodeURIComponent(candidateName)}?rid=${reportId}`, '_blank');

  };

  const getScoreColor = (score) => {

    if (score >= 70) return "text-emerald-500";

    if (score >= 40) return "text-indigo-600";

    return "text-amber-500";

  };

  const sortedResults = [...results].sort((a,b) => b.analysis.match_score - a.analysis.match_score);

  useEffect(() => {

    if (!initialSelected && sortedResults.length > 0) {

      setSelectedCandidate(sortedResults[0]);

      setInitialSelected(true);

    }

  }, [sortedResults, initialSelected]);

  if (!mounted) return null;

  const previewCandidate = selectedCandidate || sortedResults[0] || null;

  return (

    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {loading && (

        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">

          <div className="bg-white/90 p-12 rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] w-full max-w-md text-center border border-white/50">

            <div className="relative w-32 h-32 mx-auto mb-10">

               <div className="absolute inset-0 border-[6px] border-indigo-50 rounded-full"></div>

               <div className="absolute inset-0 border-[6px] border-indigo-600 rounded-full border-t-transparent animate-[spin_1.5s_linear_infinite]"></div>

               <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-600 text-2xl tracking-tighter">{progress}%</div>

            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Processing Intelligence</h3>

            <p className="text-sm text-slate-400 font-bold mb-10 uppercase tracking-[0.2em]">Analyzing Candidate Batch</p>

            <div className="w-full bg-slate-100 h-2.5 rounded-full mb-4 overflow-hidden p-0.5 border border-slate-200/50">

               <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>

            </div>

            <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest">

               <Clock size={14} className="animate-pulse" /> Approximately {timeLeft}s remaining

            </div>

          </div>

        </div>

      )}

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-10 py-5 flex justify-between items-center sticky top-0 z-50">

        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2.5 tracking-tight group cursor-default">

          <ShieldCheck size={32} className="group-hover:rotate-12 transition-transform duration-300" /> 

          CV Validator  <span className="text-slate-400 font-light italic">PRO</span>

        </h1>
        <div className="flex items-center gap-3">
          <SignedIn>
            <AsgardeoUser>
              {(user) => (
                <span className="hidden sm:inline text-sm font-semibold text-slate-600">
                  {user.displayName || user.userName || user.username || user.sub || "Account"}
                </span>
              )}
            </AsgardeoUser>
            <SignOutButton className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors">
              Sign Out
            </SignOutButton>
          </SignedIn>
          <SignedOut>
            <SignInButton className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">
              Sign In
            </SignInButton>
          </SignedOut>
        </div>
      </nav>

      <SignedOut>
        <section className="max-w-xl mx-auto my-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm px-8 py-14 text-center">
          <ShieldCheck size={50} className="text-indigo-600 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-3">Welcome to CV Validator PRO</h2>
          <p className="text-sm text-slate-500 mb-8">Sign in to upload CVs, run AI verification, and view candidate reports.</p>
          <SignInButton className="inline-flex px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">
            Sign In to Continue
          </SignInButton>
        </section>
      </SignedOut>

      <SignedIn>
      <main className="max-w-[1500px] mx-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        <div className="lg:col-span-4 space-y-8">

          <div className="bg-white p-8 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 sticky top-28 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">

            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3"><Upload size={16} className="text-indigo-500"/>Control Panel</h2>

            <div className="space-y-6">

              <textarea 

                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.8rem] h-48 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300" 

                placeholder="Paste the target Job Description..." 

                value={jd} 

                onChange={(e) => setJd(e.target.value)} 

              />

              <input 

                type="text" 

                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300" 

                placeholder="Hard Constraints..." 

                value={constraints} 

                onChange={(e) => setConstraints(e.target.value)} 

              />

              <div className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer relative overflow-hidden">

                <input type="file" multiple accept=".pdf" id="cv-upload" className="hidden" onChange={handleFileChange} />

                <label htmlFor="cv-upload" className="cursor-pointer relative z-10">

                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">

                    <Upload className="text-indigo-500" size={20} />

                  </div>

                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{files.length > 0 ? `${files.length} Candidates Loaded` : "Upload Batch PDF"}</span>

                </label>

              </div>

              <button 

                onClick={handleAnalyze} 

                disabled={loading} 

                className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transform active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-[10px]"

              >

                {loading ? "Initializing..." : "Launch AI Verification"}

              </button>

              {files.length > 0 && (

                <div className="pt-6 border-t border-slate-100">

                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">

                    {files.map((f, i) => (

                      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">

                        <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50"><FileText size={14} className="text-slate-400 group-hover:text-indigo-500" /></div>

                        <p className="text-[10px] font-bold text-slate-500 truncate">{f.name}</p>

                      </div>

                    ))}

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

        <div className="lg:col-span-8">

          {results.length > 0 ? (

            <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">

              <div className="flex justify-between items-end px-4">

                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Scoring Leaderboard</h3>

                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase italic tracking-tighter">AI Match Index</span>

              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">

                <div className="grid grid-cols-12 px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">

                  <div className="col-span-1">#</div>

                  <div className="col-span-4">Candidate</div>

                  <div className="col-span-2">Score</div>

                  <div className="col-span-3">Top Skills</div>

                  <div className="col-span-2 text-right">Actions</div>

                </div>

                <div className="max-h-[520px] overflow-y-auto">

                  {sortedResults.map((res, idx) => (

                    <div

                      key={idx}

                      onClick={() => setSelectedCandidate(res)}

                      className={`grid grid-cols-12 items-center px-6 py-5 border-b border-slate-100 transition-all cursor-pointer ${

                        previewCandidate === res ? "bg-indigo-50/70 border-l-4 border-indigo-600" : "hover:bg-slate-50/70"

                      }`}

                    >

                      <div className="col-span-1">

                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${

                          previewCandidate === res ? "bg-indigo-600 text-white" : idx < 5 ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"

                        }`}>

                          {idx + 1}

                        </div>

                      </div>

                      <div className="col-span-4 min-w-0 pr-4">

                        <div className="flex items-center gap-2 flex-wrap">

                          <p className="text-sm font-black text-slate-800 truncate">{res.analysis.name}</p>

                          {idx < 5 && (

                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-full uppercase tracking-widest border border-emerald-100">

                              Top 5

                            </span>

                          )}

                        </div>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-1">

                          Candidate Profile

                        </p>

                      </div>

                      <div className="col-span-2">

                        <div className={`text-2xl font-black tracking-tight ${getScoreColor(res.analysis.match_score)}`}>

                          {res.analysis.match_score}<span className="text-xs opacity-60">%</span>

                        </div>

                      </div>

                      <div className="col-span-3 min-w-0 pr-4">

                        <div className="flex flex-wrap gap-2">

                          {res.analysis.skills_found?.slice(0, 2).map((skill, i) => (

                            <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-lg border border-emerald-100 uppercase tracking-wider truncate">

                              {skill}

                            </span>

                          ))}

                          {(!res.analysis.skills_found || res.analysis.skills_found.length === 0) && (

                            <span className="text-[10px] font-bold text-slate-300 uppercase">No Skills</span>

                          )}

                        </div>

                      </div>

                      <div className="col-span-2 flex justify-end gap-2">

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            viewPdf(res.pdf_view);

                          }}

                          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-all flex items-center justify-center"

                          title="Preview CV"

                        >

                          <Eye size={16} />

                        </button>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            downloadPdf(res.pdf_view, res.filename || res.analysis.name);

                          }}

                          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"

                          title="Download CV"

                        >

                          <Download size={16} />

                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {previewCandidate && (

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">

                  <div className="flex items-start justify-between gap-4 mb-6">

                    <div>

                      <div className="flex items-center gap-3 mb-2 flex-wrap">

                        <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{previewCandidate.analysis.name}</h4>

                        <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-slate-200">

                          Selected Candidate

                        </span>

                      </div>

                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Quick Candidate Snapshot</p>

                    </div>

                    <div className={`text-4xl font-black tracking-tighter ${getScoreColor(previewCandidate.analysis.match_score)}`}>

                      {previewCandidate.analysis.match_score}<span className="text-lg opacity-50">%</span>

                    </div>

                  </div>

                  <div className="mb-6">

                    <p className="text-sm text-slate-600 leading-7 italic">

                      "{previewCandidate.analysis.match_reason}"

                    </p>

                  </div>

                  <div className="space-y-5">

                    <div>

                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Matched Skills</p>

                      <div className="flex flex-wrap gap-2">

                        {previewCandidate.analysis.skills_found?.slice(0, 6).map((skill, i) => (

                          <span key={i} className="px-3 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl border border-emerald-100 uppercase tracking-wider">

                            {skill}

                          </span>

                        ))}

                        {(!previewCandidate.analysis.skills_found || previewCandidate.analysis.skills_found.length === 0) && (

                          <span className="text-[10px] font-bold text-slate-300 uppercase">No Matched Skills</span>

                        )}

                      </div>

                    </div>

                    <div>

                      <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">Missing Skills</p>

                      <div className="flex flex-wrap gap-2">

                        {previewCandidate.analysis.missing_skills?.slice(0, 6).map((skill, i) => (

                          <span key={i} className="px-3 py-2 bg-red-50 text-red-700 text-[10px] font-black rounded-xl border border-red-100 uppercase tracking-wider">

                            {skill}

                          </span>

                        ))}

                        {(!previewCandidate.analysis.missing_skills || previewCandidate.analysis.missing_skills.length === 0) && (

                          <span className="text-[10px] font-bold text-slate-300 uppercase">No Missing Skills</span>

                        )}

                      </div>

                    </div>

                  </div>

                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">

                    <button 

                      onClick={() => viewPdf(previewCandidate.pdf_view)} 

                      className="py-4 bg-slate-50 text-slate-600 font-black text-[10px] rounded-2xl hover:bg-sky-50 hover:text-sky-600 uppercase border border-slate-100 tracking-[0.2em] transition-all active:scale-95 shadow-sm"

                    >

                      <span className="flex items-center justify-center gap-2">

                        <Eye size={16} /> Preview

                      </span>

                    </button>

                    <button 

                      onClick={() => downloadPdf(previewCandidate.pdf_view, previewCandidate.filename || previewCandidate.analysis.name)} 

                      className="py-4 bg-white text-slate-600 font-black text-[10px] rounded-2xl hover:bg-slate-900 hover:text-white uppercase border border-slate-200 tracking-[0.2em] transition-all active:scale-95 shadow-sm"

                    >

                      <span className="flex items-center justify-center gap-2">

                        <Download size={16} /> Download

                      </span>

                    </button>

                    <button 

                      onClick={() => openQuiz(previewCandidate.cv_text, previewCandidate.analysis.name)} 

                      className="py-4 bg-indigo-50 text-indigo-600 font-black text-[10px] rounded-2xl hover:bg-indigo-600 hover:text-white uppercase border border-indigo-100 tracking-[0.2em] transition-all active:scale-95"

                    >

                      🧠 Smart Interview

                    </button>

                    <button 

                      onClick={() => openReport(previewCandidate.cv_text, previewCandidate.analysis.name)} 

                      className="py-4 bg-slate-900 text-white font-black text-[10px] rounded-2xl uppercase border-none tracking-[0.2em] transition-all hover:bg-indigo-600 active:scale-95 shadow-slate-200"

                    >

                      📄 Full Analysis

                    </button>

                  </div>

                </div>

              )}

            </div>

          ) : (

            <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[4rem] border border-slate-100 shadow-inner-lg group">

              <div className="p-10 bg-slate-50 rounded-[2.5rem] mb-8 group-hover:scale-110 transition-transform duration-700 group-hover:bg-indigo-50">

                <Search size={64} className="text-slate-200 group-hover:text-indigo-200 transition-colors" />

              </div>

              <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-xs text-center px-10 leading-relaxed">System Ready. <br/> Please upload candidate files to begin.</p>

            </div>

          )}

        </div>

      </main>
      </SignedIn>

    </div>

  );

}
