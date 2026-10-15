"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import { 
  ShieldCheck, Mail, Phone, Briefcase, GraduationCap, 
  Trophy, FolderGit2, Zap, ExternalLink, Target, 
  UserCheck, AlertCircle, Calendar, Info, CheckCircle2,
  ArrowUpRight, Users, Globe, Fingerprint, AlertTriangle, 
  Link2, Feather, Award, MessageSquare, Quote,
  Code2, Hash, Clock, XCircle, Languages, Search
} from "lucide-react";

const WhatsAppIcon = ({ size = 12 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function AnalysisPage() {
  const params = useParams();
  const searchParams = useSearchParams(); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("work");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      const candidateName = decodeURIComponent(params.id as string);
      const rid = searchParams.get('rid'); 

      const savedData = localStorage.getItem(`report_${candidateName}_${rid}`);
      if (savedData) {
        setData(JSON.parse(savedData));
        setLoading(false);
        return;
      }

      const cvText = localStorage.getItem(`active_cv_${candidateName}_${rid}`);

      if (!cvText) {
        setLoading(false);
        return;
      }

      const interval = setInterval(() => {
        setProgress(prev => (prev < 98 ? prev + 1 : prev));
      }, 80);

      try {
        const formData = new FormData();
        formData.append("cv_text", cvText);
        const res = await axios.post("/api/cv/generate-report", formData);
        setData(res.data);
        localStorage.setItem(`report_${candidateName}_${rid}`, JSON.stringify(res.data));
        localStorage.removeItem(`active_cv_${candidateName}_${rid}`);
      } catch (e) {
        console.error("Backend Sync Error:", e);
      } finally {
        clearInterval(interval);
        setLoading(false);
      }
    };
    fetchReport();
  }, [params.id, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c14] text-white font-sans">
        <div className="relative mb-10 flex items-center justify-center">
          <div className="w-24 h-24 border-2 border-white/5 rounded-full"></div>
          <div className="absolute inset-0 w-24 h-24 border-t-2 border-indigo-50 rounded-full animate-spin"></div>
          <span className="absolute text-xl font-medium font-mono">{progress}%</span>
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.8em] text-indigo-400">Processing Dossier</h2>
            <p className="text-white/30 text-[10px] font-medium tracking-[0.2em]">VISION FRONT INSIGHTS AI</p>
        </div>
      </div>
    );
  }

  const getCount = (list: any[]) => list ? list.length : 0;

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("linkedin")) return <div className="p-2.5 bg-[#0077B5]/10 text-[#0077B5] border border-[#0077B5]/20 rounded-xl"><Link2 size={20} strokeWidth={2.5} /></div>;
    if (p.includes("github")) return <div className="p-2.5 bg-slate-900/5 text-slate-900 border border-slate-900/10 rounded-xl"><Code2 size={20} /></div>;
    if (p.includes("medium")) return <div className="p-2.5 bg-black/5 text-black border border-black/10 rounded-xl"><Feather size={20} /></div>;
    if (p.includes("facebook")) return <div className="p-2.5 bg-blue-600/10 text-blue-600 border border-blue-600/20 rounded-xl"><Users size={20} /></div>;
    if (p.includes("instagram")) return <div className="p-2.5 bg-pink-600/10 text-pink-600 border border-pink-600/20 rounded-xl"><MessageSquare size={20} /></div>;
    if (p.includes("portfolio") || p.includes("website")) return <div className="p-2.5 bg-indigo-600/10 text-indigo-600 border border-indigo-600/20 rounded-xl"><Globe size={20} /></div>;
    return <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl"><Link2 size={20} /></div>;
  };

  const isSchoolExamEntry = (itemText: string) => {
    const t = (itemText || "").toLowerCase();
    return (
      t.includes("o/l") ||
      t.includes("ordinary level") ||
      t.includes("a/l") ||
      t.includes("advanced level") ||
      t.includes("g.c.e") ||
      t.includes("gce")
    );
  };

  const getVerificationBadge = (confidence?: string) => {
    if (confidence === "verified") {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">
          <CheckCircle2 size={12} /> Verified
        </span>
      );
    }
    if (confidence === "likely") {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-widest">
          <AlertTriangle size={12} /> Likely Match
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[9px] font-black uppercase tracking-widest">
        <XCircle size={12} /> Manual Review
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-indigo-100 pb-20">
      <div className="bg-[#0f172a] h-[400px] w-full relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 h-full flex flex-col justify-center relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl shadow-2xl flex items-center justify-center text-5xl font-bold text-white ring-8 ring-white/5">
                {decodeURIComponent(params.id as string).charAt(0)}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Candidate Report</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest"><ShieldCheck size={12}/> Verification Signals</span>
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight text-white uppercase">{decodeURIComponent(params.id as string)}</h1>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-300/60 mb-1">Overall Score</p>
                <div className="text-6xl font-black text-white tracking-tighter">
                  {data?.scores?.overall_score ?? data?.ats_analysis?.score}<span className="text-2xl text-indigo-400">%</span>
                </div>
                <div className="mt-3 text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    JD Match: {data?.scores?.jd_match_score ?? "-"}%
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Credibility: {data?.scores?.credibility_score ?? "-"}%
                  </p>
                </div>
              </div>
              <div className="h-12 w-[1px] bg-white/10"></div>
              <div className="hidden sm:block text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">Word Count</p>
                <span className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[12px] font-bold">Optimal Range</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${data?.contact_info?.email_valid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        <Mail size={24}/>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Port</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{data?.contact_info?.email || "Missing Address"}</p>
                        {data?.contact_info?.email && (
                          <p className={`text-[9px] font-black uppercase mt-1 ${data?.contact_info?.email_valid ? 'text-emerald-500' : 'text-red-400'}`}>
                             {data?.contact_info?.email_valid ? "🏢 Domain Active" : "⚠️ Email Check Failed"}
                          </p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${data?.phone_verification?.valid ? 'bg-emerald-50 text-indigo-600' : 'bg-slate-50 text-indigo-600'}`}>
                        <Phone size={24}/>
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Line</p>
                        <p className="text-sm font-semibold text-slate-700">{data?.contact_info?.phone || "N/A"}</p>

                        {data?.contact_info?.phone && (
                            <div className="mt-2 flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        const cleanNum = data.contact_info.phone.replace(/[^\d]/g, '');
                                        window.open(`https://wa.me/${cleanNum}`, '_blank');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                >
                                    <WhatsAppIcon size={14} /> Found WhatsApp
                                </button>
                                {data?.phone_verification?.valid && (
                                  <span className="text-[9px] font-bold text-emerald-500 uppercase">{data?.phone_verification?.country}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-4 bg-white p-7 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-center items-center">
                <div className="flex flex-wrap justify-center gap-4">
                  {data?.social_links?.map((link: any, idx: number) => (
                    <button key={idx} onClick={() => window.open(link.url, '_blank')} className="transition-all hover:scale-110 active:scale-95 group" title={link.platform}>
                      {getSocialIcon(link.platform)}
                    </button>
                  ))}
                  {getCount(data?.social_links) === 0 && <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Links Detected</p>}
                </div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">Score Breakdown</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Component Wise Evaluation</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Experience", value: data?.score_breakdown?.experience ?? 0 },
              { label: "Skills", value: data?.score_breakdown?.skills ?? 0 },
              { label: "Education", value: data?.score_breakdown?.education ?? 0 },
              { label: "Projects & Leadership", value: data?.score_breakdown?.projects_leadership ?? 0 },
              { label: "Contact Validity", value: data?.score_breakdown?.contact_validity ?? 0 },
              { label: "Keyword Density", value: data?.score_breakdown?.keyword_density ?? 0 },
              { label: "Formatting", value: data?.score_breakdown?.formatting_word_count ?? 0 },
              { label: "Logical Consistency", value: data?.score_breakdown?.logical_consistency ?? 0 }
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-3xl font-black text-slate-800 tracking-tighter">{item.value}<span className="text-base text-slate-400">%</span></p>
                  <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.max(0, Math.min(100, item.value))}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200/60 mb-10 flex flex-wrap gap-2 shadow-sm sticky top-6 z-30">
            {[
              { id: "work", icon: <Briefcase size={18}/>, label: "Experience", count: getCount(data?.experience_links) },
              { id: "edu", icon: <GraduationCap size={18}/>, label: "Education", count: getCount(data?.education_links) + getCount(data?.certification_links) },
              { id: "leadership", icon: <Trophy size={18}/>, label: "Leadership", count: getCount(data?.personal_leadership) },
              { id: "projects", icon: <FolderGit2 size={18}/>, label: "Projects", count: getCount(data?.projects) },
              { id: "refs", icon: <Users size={18}/>, label: "References", count: getCount(data?.references) }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {tab.icon} {tab.label} <span className="ml-2 opacity-50">{tab.count}</span>
              </button>
            ))}
        </div>

        <div className="bg-white border border-slate-200/60 rounded-[3rem] p-12 shadow-xl shadow-slate-200/20 min-h-[600px]">
          {activeTab === "work" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
              {data?.career_warnings && data.career_warnings.length > 0 && (
                <div className="bg-red-50 border border-red-100 p-8 rounded-3xl">
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                    <AlertTriangle size={20} className="animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest">Risk Alert</span>
                  </div>
                  <ul className="space-y-2">
                    {data.career_warnings.map((warning: string, i: number) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2 italic">
                        <span>⚠️</span> {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="relative bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">AI Profile Summary</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Automated Executive Summary</p>
                  </div>
                </div>
                <p className="text-slate-600 text-lg leading-[1.8] font-medium italic relative z-10">{data?.ats_analysis?.reason}</p>
              </div>
              <div className="grid gap-6">
                {data?.experience_links?.map((v: any, i: number) => (
                  <div key={i} className="group p-8 rounded-[2rem] border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-indigo-200 transition-all flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-2xl text-slate-800 group-hover:text-indigo-600 transition-colors">{v.item}</h4>
                      {getVerificationBadge(v.verification_confidence)}
                    </div>
                    <div className="flex flex-col items-end">
                      {v.link ? (
                        <button onClick={() => window.open(v.link, '_blank')} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Verify Source <ArrowUpRight size={14}/></button>
                      ) : (
                        <button onClick={() => window.open(`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(v.search_name || v.company || v.item)}`, '_blank')} className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0077B5] hover:text-white transition-all shadow-sm">
                          <Link2 size={14}/> Manual Search
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "edu" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                  <GraduationCap size={18}/> Academic Credentials
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {data?.education_links?.map((e: any, i: number) => (
                    <div key={i} className="p-10 rounded-[2.5rem] border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-2xl hover:border-indigo-200 transition-all flex flex-col justify-between h-full group relative overflow-hidden">
                      {e.status && e.status.toLowerCase().includes("ongoing") && (
                        <div className="absolute top-6 right-6 px-4 py-1.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full flex items-center gap-2 uppercase tracking-widest">
                          <Clock size={12} className="animate-pulse"/> Ongoing
                        </div>
                      )}

                      <div>
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                          <GraduationCap size={28}/>
                        </div>
                        <h4 className="font-bold text-xl text-slate-800 leading-snug mb-4">{e.item}</h4>
                        {!isSchoolExamEntry(e.item) && (
                          <div className="mb-8">
                            {getVerificationBadge(e.verification_confidence)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        {isSchoolExamEntry(e.item) ? (
                           <div className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-500 border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest">
                             <ShieldCheck size={14}/> Standard School Qualification
                           </div>
                        ) : (
                           <>
                             {e.linkedin ? (
                               <button 
                                 onClick={() => window.open(e.linkedin, '_blank')} 
                                 className="flex items-center justify-center gap-3 py-4 bg-[#0077B5]/10 text-[#0077B5] border border-[#0077B5]/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0077B5] hover:text-white transition-all"
                               >
                                 <Link2 size={16}/> LinkedIn Verification
                               </button>
                             ) : (
                               <button onClick={() => window.open(`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(e.search_name || e.institution)}`, '_blank')} className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-500 border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-[#0077B5] hover:text-white transition-all"><Search size={14}/> Manual LinkedIn Search</button>
                             )}
                             {e.link ? (
                               <button 
                                 onClick={() => window.open(e.link, '_blank')} 
                                 className="flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                               >
                                 <Globe size={16}/> Institution Website
                               </button>
                             ) : (
                               <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent((e.degree ? e.degree + ' ' : '') + (e.search_name || e.institution || e.item))}`, '_blank')} className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-500 border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"><Search size={14}/> Manual Google Search</button>
                             )}
                           </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                  <Award size={18} className="text-amber-500"/> Professional Certifications
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {data?.certification_links?.map((c: any, i: number) => (
                    <div key={i} className="p-10 rounded-[2.5rem] border border-slate-100 bg-amber-50/10 hover:bg-white transition-all flex flex-col justify-between h-full">
                      <div>
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-8"><Award size={28}/></div>
                        <h4 className="font-bold text-xl text-slate-800 leading-snug mb-2">{c.course_name || c.name}</h4>
                        {c.issuing_organization && (
                          <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-4">{c.issuing_organization}</p>
                        )}
                        <div className="mb-8">
                          {getVerificationBadge(c.verification_confidence)}
                        </div>
                      </div>
                      {c.link ? (
                        <button onClick={() => window.open(c.link, '_blank')} className="w-fit text-amber-600 font-bold text-[10px] uppercase tracking-widest border-b-2 border-amber-100 hover:border-amber-600 pb-1 transition-all text-left">Verify Registry</button>
                      ) : (
                        <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent((c.course_name || c.name) + ' ' + (c.issuing_organization || '') + ' certification')}`, '_blank')} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-500 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-sm w-fit">
                          <Search size={14}/> Manual Search
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <Zap size={18} className="text-emerald-500"/>   Skills
                  </h3>
                  <div className="flex flex-wrap gap-3 p-10 bg-emerald-50/20 border border-emerald-100 rounded-[3rem]">
                    {data?.skills?.map((skill: string, i: number) => (
                      <span key={i} className="px-6 py-3 bg-white text-emerald-700 text-[10px] font-black rounded-xl border border-emerald-100 shadow-sm flex items-center gap-2 uppercase tracking-wider">
                        <CheckCircle2 size={14} className="text-emerald-500"/> {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <Languages size={18} className="text-indigo-500"/> Language
                  </h3>
                  <div className="flex flex-wrap gap-3 p-10 bg-indigo-50/20 border border-indigo-100 rounded-[3rem]">
                    {data?.languages?.map((lang: string, i: number) => (
                      <span key={i} className="px-6 py-3 bg-white text-indigo-700 text-[10px] font-black rounded-xl border border-indigo-100 shadow-sm flex items-center gap-2 uppercase tracking-wider">
                        <Globe size={14} className="text-indigo-500"/> {lang}
                      </span>
                    ))}
                    {getCount(data?.languages) === 0 && <p className="text-[10px] font-bold text-slate-300 uppercase italic">No Language Data</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leadership" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-2 gap-8">
              {data?.personal_leadership?.map((l: any, i: number) => (
                <div key={i} className="p-10 rounded-[2.5rem] border border-slate-100 bg-slate-50/30 hover:bg-white transition-all">
                   <div className="flex items-center gap-3 mb-4"><Trophy className="text-amber-500" size={24}/><h4 className="font-bold text-xl text-slate-800">{l.activity}</h4></div>
                   <p className="text-[11px] font-black text-indigo-500 uppercase mb-4">{l.organization}</p>
                   <p className="text-sm text-slate-500 leading-relaxed italic">"{l.description}"</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {data?.projects?.map((p: any, i: number) => (
                <div key={i} className="group relative bg-white border border-slate-50 p-8 rounded-[2.5rem] hover:border-indigo-500 transition-all">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="text-indigo-600"><Code2 size={32} /></div>
                      <div className="space-y-1">
                        <h4 className="text-2xl font-bold text-slate-800 leading-tight">{p.title}</h4>
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 rounded text-[9px] font-black text-indigo-500 uppercase">Project {i + 1}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pl-14"><p className="text-slate-500 leading-relaxed italic text-sm">"{p.description}"</p></div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "refs" && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-2 gap-8">
                {data?.references?.map((r: any, i: number) => (
                  <div key={i} className="p-10 border border-slate-200 rounded-[3rem] bg-slate-50/50 hover:bg-white transition-all group">
                    <div className="flex items-center gap-6 mb-8">
                       <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all"><UserCheck size={28}/></div>
                       <div>
                         <p className="font-bold text-slate-800 text-xl mb-1">{r.name || "Unknown Reference"}</p>
                         <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">
                           {(r.designation && r.designation !== "undefined") ? r.designation : "Designation"} @ {(r.company && r.company !== "undefined") ? r.company : "Company"}
                         </p>
                       </div>
                    </div>
                    <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent((r.name || '') + ' ' + (r.company || ''))}`, '_blank')} className="w-full py-5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Search Reference</button>
                  </div>
                ))}
             </div>
          )}
        </div>
      </main>

      <footer className="py-24 border-t border-slate-200 bg-white text-center">
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-slate-900"><ShieldCheck size={28} className="text-indigo-600" /><span className="font-black uppercase tracking-[0.6em] text-sm">Vision Front Insights</span></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1.2em]">Automated Intelligence Dossier</p>
        </div>
      </footer>
    </div>
  );
}
