import React, { useState, useEffect } from 'react';
import { adminDataService } from '../services/adminDataService';

export default function AdminPanel({ onBack }) {
  const [activeTab, setActiveTab] = useState('both'); // 'both' | 'magneto' | 'gcc' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState({ totalBoth: 0, totalMagneto: 0, totalGcc: 0, totalUnique: 0, conversionRate: 0 });
  const [selectedLead, setSelectedLead] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordGccForm, setRecordGccForm] = useState({
    email: '',
    name: '',
    company: '',
    role: '',
    riskScore: 72,
    p1Score: 75,
    p2Score: 68,
    p3Score: 72
  });

  // Load leads and metrics on mount and listen to storage events
  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  async function loadData() {
    const { leads: allLeads, summary } = await adminDataService.fetchLiveMergedLeads();
    setLeads(allLeads);
    setMetrics(summary);
  }

  function handleRecordGccSubmit(e) {
    e.preventDefault();
    if (!recordGccForm.email) {
      alert('Corporate Email is required.');
      return;
    }

    const emailLower = recordGccForm.email.trim().toLowerCase();
    const payload = {
      email: emailLower,
      firstName: recordGccForm.name.split(' ')[0] || 'Leader',
      lastName: recordGccForm.name.split(' ')[1] || '',
      company: recordGccForm.company || 'Enterprise',
      role: recordGccForm.role || 'Executive',
      riskScore: recordGccForm.riskScore,
      tier: recordGccForm.riskScore >= 70 ? 'Critical Exposure' : recordGccForm.riskScore >= 45 ? 'Moderate Risk' : 'Strong Foundation',
      p1Score: recordGccForm.p1Score,
      p2Score: recordGccForm.p2Score,
      p3Score: recordGccForm.p3Score,
      completedAt: new Date().toISOString()
    };

    adminDataService.saveGccSubmission(payload);
    setIsRecordModalOpen(false);
    setRecordGccForm({ email: '', name: '', company: '', role: '', riskScore: 72, p1Score: 75, p2Score: 68, p3Score: 72 });
    loadData();
  }

  function handleRecordSubmission(e) {
    e.preventDefault();
    if (!newLeadForm.email || !newLeadForm.company) {
      alert('Corporate Email and Company Name are required.');
      return;
    }

    const emailLower = newLeadForm.email.trim().toLowerCase();

    // Record AI Readiness submission
    adminDataService.saveAiReadinessSubmission({
      email: emailLower,
      name: newLeadForm.name || 'Respondent',
      company: newLeadForm.company || 'Enterprise',
      role: newLeadForm.role || 'Executive Leader',
      overallPct: newLeadForm.aiScore || 84,
      tier: 'Leader'
    });

    // Record GCC submission
    adminDataService.saveGccSubmission({
      email: emailLower,
      name: newLeadForm.name || 'Respondent',
      company: newLeadForm.company || 'Enterprise',
      role: newLeadForm.role || 'Executive Leader',
      riskScore: newLeadForm.gccScore || 72,
      tier: 'High Risk'
    });

    setIsAddModalOpen(false);
    setNewLeadForm({ name: '', email: '', company: '', role: '', aiScore: 84, gccScore: 72 });
    loadData();
  }

  // Filter leads according to active tab & search term
  const filteredLeads = leads.filter(lead => {
    // Tab filter
    if (activeTab === 'both' && !lead.filledBoth) return false;
    if (activeTab === 'magneto' && (!lead.magneto?.completed || lead.gcc?.completed)) return false;
    if (activeTab === 'gcc' && (!lead.gcc?.completed || lead.magneto?.completed)) return false;

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchEmail = lead.email.toLowerCase().includes(term);
      const matchCompany = lead.company.toLowerCase().includes(term);
      const matchName = lead.name.toLowerCase().includes(term);
      const matchRole = lead.role.toLowerCase().includes(term);
      return matchEmail || matchCompany || matchName || matchRole;
    }

    return true;
  });

  function handleExportCsv() {
    adminDataService.exportToCsv(filteredLeads, activeTab);
  }

  function handleClearData() {
    if (window.confirm('Clear all recorded live respondent submissions?')) {
      adminDataService.clearAllSubmissions();
      loadData();
    }
  }

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans p-4 sm:p-6 md:p-8 relative">
      {/* Background ambient glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#3B82F6]/5 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#8B5CF6]/5 blur-[140px]" />
      </div>

      <div className="max-w-[1280px] mx-auto space-y-6">
        
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0E1F]/80 backdrop-blur-lg p-5 rounded-2xl border border-white/10 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Instrek Admin Portal
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Live Form Respondents Only
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Live records of individuals who filled out the AI Readiness Assessment and Shield GCC Risk Scan forms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>←</span> Exit Admin
              </button>
            )}

            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs sm:text-sm font-semibold text-purple-300 transition-all flex items-center gap-1.5"
            >
              <span>🛡️</span> Record GCC Scan
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs sm:text-sm font-semibold text-blue-300 transition-all flex items-center gap-1.5"
            >
              <span>📥</span> Export CSV
            </button>

            <button
              onClick={loadData}
              title="Refresh submissions"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-all"
            >
              🔄 Refresh
            </button>

            <button
              onClick={handleClearData}
              title="Clear all recorded submissions"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs text-rose-300 transition-all"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Both Forms Completed */}
          <div 
            onClick={() => setActiveTab('both')}
            className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
              activeTab === 'both' 
                ? 'bg-gradient-to-br from-blue-900/30 via-[#0A0E2A] to-purple-900/30 border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.2)]' 
                : 'bg-[#0A0E1F]/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">Filled Both Forms</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold">TARGET DATA</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white">{metrics.totalBoth}</span>
              <span className="text-xs text-slate-400">leads matched</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Users who submitted both AI Readiness & GCC Risk forms
            </p>
          </div>

          {/* Card 2: AI Readiness Submissions */}
          <div 
            onClick={() => setActiveTab('magneto')}
            className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
              activeTab === 'magneto' 
                ? 'bg-[#0A0E2A] border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                : 'bg-[#0A0E1F]/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase">AI Readiness Forms</span>
              <span className="text-xs">📊</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white">{metrics.totalMagneto}</span>
              <span className="text-xs text-slate-400">total submissions</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Magneto AI Readiness Assessment entries
            </p>
          </div>

          {/* Card 3: GCC Risk Scan Submissions */}
          <div 
            onClick={() => setActiveTab('gcc')}
            className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
              activeTab === 'gcc' 
                ? 'bg-[#0A0E2A] border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                : 'bg-[#0A0E1F]/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-purple-400 uppercase">GCC Risk Scans</span>
              <span className="text-xs">🛡️</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white">{metrics.totalGcc}</span>
              <span className="text-xs text-slate-400">total submissions</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Shield GCC Security Risk Scan entries
            </p>
          </div>

          {/* Card 4: Dual Completion Rate */}
          <div className="p-5 rounded-2xl bg-[#0A0E1F]/60 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">Dual Match Rate</span>
              <span className="text-xs">⚡</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white">{metrics.conversionRate}%</span>
              <span className="text-xs text-emerald-400 font-semibold">({metrics.totalBoth}/{metrics.totalUnique})</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                style={{ width: `${metrics.conversionRate}%` }}
              />
            </div>
          </div>

        </div>

        {/* CONTROLS & FILTER TABS */}
        <div className="bg-[#0A0E1F]/70 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#050811] p-1.5 rounded-xl border border-white/10 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('both')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'both'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Filled Both Forms ({metrics.totalBoth})
              </button>

              <button
                onClick={() => setActiveTab('magneto')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'magneto'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                AI Readiness Only
              </button>

              <button
                onClick={() => setActiveTab('gcc')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'gcc'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                GCC Risk Scan Only
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                All Submissions ({metrics.totalUnique})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search by mail, company name, or person name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#050811] border border-white/10 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

          </div>

          {/* ACTIVE TAB DESCRIPTION */}
          <div className="text-xs text-slate-400 flex items-center justify-between border-t border-white/5 pt-3">
            <span>
              {activeTab === 'both' && 'Showing individuals who completed BOTH AI Readiness Assessment AND Shield GCC Risk Scan.'}
              {activeTab === 'magneto' && 'Showing leads who completed ONLY AI Readiness Assessment.'}
              {activeTab === 'gcc' && 'Showing leads who completed ONLY Shield GCC Risk Scan.'}
              {activeTab === 'all' && 'Showing all unique leads across both assessments.'}
            </span>
            <span className="font-semibold text-slate-300">
              Displaying {filteredLeads.length} record{filteredLeads.length === 1 ? '' : 's'}
            </span>
          </div>

        </div>

        {/* DATA TABLE */}
        <div className="bg-[#0A0E1F]/70 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="text-4xl">📭</div>
              <h3 className="text-base font-bold text-white">No Live Submissions Recorded Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No real respondents have submitted form responses matching this filter yet. When users fill out the AI Readiness Assessment or Shield GCC Risk Scan, their entries will automatically populate here.
              </p>
              <button
                onClick={() => { setActiveTab('all'); setSearchTerm(''); }}
                className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse min-w-[1050px]">
                <thead>
                  <tr className="border-b border-white/10 bg-[#070A16] text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    <th className="py-4 px-5 min-w-[240px]">Person / Mail</th>
                    <th className="py-4 px-5 min-w-[190px]">Company Name</th>
                    <th className="py-4 px-5 min-w-[190px]">Role & Size</th>
                    <th className="py-4 px-5 min-w-[160px]">AI Readiness</th>
                    <th className="py-4 px-5 min-w-[160px]">GCC Risk Scan</th>
                    <th className="py-4 px-5 min-w-[170px]">Form Status</th>
                    <th className="py-4 px-5 min-w-[120px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredLeads.map((lead, idx) => (
                    <tr 
                      key={lead.email || idx}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      
                      {/* Person & Mail */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md flex-shrink-0">
                            {lead.name ? lead.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-white group-hover:text-blue-300 transition-colors whitespace-nowrap">
                              {lead.name}
                            </div>
                            <div className="text-blue-400 font-mono text-[11px] whitespace-nowrap">
                              {lead.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company Name */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-bold text-slate-100 text-sm whitespace-nowrap">{lead.company}</div>
                        <div className="text-slate-400 text-[11px] whitespace-nowrap">{lead.revenue || 'Enterprise'}</div>
                      </td>

                      {/* Role & Size */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="text-slate-200 font-medium whitespace-nowrap">{lead.role}</div>
                        <div className="text-slate-400 text-[11px] whitespace-nowrap">Size: {lead.size}</div>
                      </td>

                      {/* AI Readiness Score */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {lead.magneto?.completed ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <span className="font-bold text-emerald-400 text-sm">{lead.magneto.overallPct}%</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
                                {lead.magneto.tier}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(lead.magneto.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Not Filled</span>
                        )}
                      </td>

                      {/* GCC Risk Score */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {lead.gcc?.completed ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <span className="font-bold text-amber-400 text-sm">{lead.gcc.riskScore}/100</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
                                {lead.gcc.tier}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(lead.gcc.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Not Filled</span>
                        )}
                      </td>

                      {/* Form Completion Status Badge */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {lead.filledBoth ? (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/40 font-bold text-[10px] tracking-wide inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                            BOTH FORMS FILLED
                          </span>
                        ) : lead.magneto?.completed ? (
                          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-medium whitespace-nowrap">
                            AI Readiness Only
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-medium whitespace-nowrap">
                            GCC Scan Only
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-blue-600/30 hover:text-white border border-white/10 text-slate-300 transition-all font-semibold text-[11px] whitespace-nowrap"
                        >
                          View Profile
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* LEAD PROFILE DETAIL MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0E22] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-xl">
                {selectedLead.name ? selectedLead.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">{selectedLead.name}</h2>
                <p className="text-sm text-blue-400 font-mono">{selectedLead.email}</p>
                <p className="text-xs text-slate-300">{selectedLead.role} @ <strong className="text-white">{selectedLead.company}</strong></p>
              </div>
            </div>

            {/* Lead Status Tag */}
            <div className="p-4 rounded-2xl bg-[#050814] border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Submission Profile</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedLead.filledBoth ? 'Completed Both AI Readiness & GCC Forms' : 'Single Form Respondent'}
                </div>
              </div>
              {selectedLead.filledBoth && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold">
                  High Priority Lead
                </span>
              )}
            </div>

            {/* AI Readiness Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                <span>📊</span> AI Readiness Assessment (Magneto)
              </h3>
              {selectedLead.magneto?.completed ? (
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Composite Readiness Index:</span>
                    <span className="text-lg font-black text-emerald-400">{selectedLead.magneto.overallPct}% ({selectedLead.magneto.tier})</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Completed: {new Date(selectedLead.magneto.completedAt).toLocaleString()}
                  </div>
                  {selectedLead.magneto.dimensionScores && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                      {Object.entries(selectedLead.magneto.dimensionScores).map(([key, val]) => (
                        <div key={key} className="flex justify-between bg-white/5 p-2 rounded-lg">
                          <span className="capitalize text-slate-400">{key}:</span>
                          <span className="font-bold text-slate-200">{val}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-400 italic">
                  Has not completed the AI Readiness assessment yet.
                </div>
              )}
            </div>

            {/* GCC Risk Scan Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                <span>🛡️</span> Shield GCC Security Risk Scan
              </h3>
              {selectedLead.gcc?.completed ? (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Security Risk Index:</span>
                    <span className="text-lg font-black text-amber-400">{selectedLead.gcc.riskScore}/100 ({selectedLead.gcc.tier})</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Completed: {new Date(selectedLead.gcc.completedAt).toLocaleString()}
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs text-center">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">P1 IP Risk</div>
                      <div className="font-bold text-amber-300">{selectedLead.gcc.p1Score || 0}</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">P2 Agent Risk</div>
                      <div className="font-bold text-amber-300">{selectedLead.gcc.p2Score || 0}</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">P3 DPDP Risk</div>
                      <div className="font-bold text-amber-300">{selectedLead.gcc.p3Score || 0}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-400 italic">
                  Has not completed the Shield GCC Risk Scan yet.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RECORD GCC SCAN MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0E22] border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-black text-white">Record GCC Risk Scan Submission</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter details to manually pair or record a GCC Risk Scan for an email address.
              </p>
            </div>

            <form onSubmit={handleRecordGccSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Respondent Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. respondent@company.com"
                  value={recordGccForm.email}
                  onChange={e => setRecordGccForm({ ...recordGccForm, email: e.target.value })}
                  className="w-full bg-[#050811] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Respondent Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Mehta"
                  value={recordGccForm.name}
                  onChange={e => setRecordGccForm({ ...recordGccForm, name: e.target.value })}
                  className="w-full bg-[#050811] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. TechCorp GCC"
                  value={recordGccForm.company}
                  onChange={e => setRecordGccForm({ ...recordGccForm, company: e.target.value })}
                  className="w-full bg-[#050811] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Role / Title</label>
                <input
                  type="text"
                  placeholder="e.g. VP of Security"
                  value={recordGccForm.role}
                  onChange={e => setRecordGccForm({ ...recordGccForm, role: e.target.value })}
                  className="w-full bg-[#050811] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Risk Score (1-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={recordGccForm.riskScore}
                    onChange={e => setRecordGccForm({ ...recordGccForm, riskScore: parseInt(e.target.value) || 70 })}
                    className="w-full bg-[#050811] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">P1 IP Risk</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={recordGccForm.p1Score}
                    onChange={e => setRecordGccForm({ ...recordGccForm, p1Score: parseInt(e.target.value) || 75 })}
                    className="w-full bg-[#050811] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg"
                >
                  Save GCC Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
