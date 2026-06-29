import React, { useState, useEffect } from 'react';
import { AppProvider, useApp, defaultSiswa, defaultGuruBTQ, defaultGuruBinaan, defaultJadwalShift, defaultHariLibur, defaultKelas, defaultStokJilid, defaultPengajuanTes, defaultTransaksi, generateHistoricalLogs } from './context/AppContext';
import DashboardData from './components/DashboardData';
import PJView from './components/PJView';
import AdminView from './components/AdminView';
import BendaharaView from './components/BendaharaView';
import GuruView from './components/GuruView';
import ArsipView from './components/ArsipView';
import LoginView from './components/LoginView';
import { initializeFirestoreWithDefaults } from './lib/initDb';

import { 
  Menu, X, BookOpen, Layers, Award, Landmark, 
  Settings, ShieldAlert, ChevronLeft, ChevronRight,
  Sparkles, GraduationCap, RefreshCw, UserCheck, HelpCircle,
  Lock
} from 'lucide-react';

type SidebarTab = 'dashboard' | 'pj' | 'admin' | 'bendahara' | 'guru' | 'arsip';

function MainAppContent() {
  useEffect(() => {
    initializeFirestoreWithDefaults(
      defaultSiswa,
      defaultGuruBTQ,
      defaultGuruBinaan,
      defaultJadwalShift,
      defaultHariLibur,
      defaultKelas,
      defaultStokJilid,
      defaultPengajuanTes,
      defaultTransaksi,
      generateHistoricalLogs
    );
  }, []);

  const { resetToDefault, loggedInRoles, logout } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');

  const renderActiveView = () => {
    // Check authentication for portal/user roles
    if (['pj', 'admin', 'bendahara', 'guru'].includes(activeTab)) {
      const role = activeTab as 'pj' | 'admin' | 'bendahara' | 'guru';
      if (!loggedInRoles[role]) {
        return <LoginView role={role} onLoginSuccess={() => {}} />;
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardData />;
      case 'arsip':
        return <ArsipView />;
      case 'pj':
        return <PJView />;
      case 'admin':
        return <AdminView />;
      case 'bendahara':
        return <BendaharaView />;
      case 'guru':
        return <GuruView />;
      default:
        return <DashboardData />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50/60 relative overflow-x-hidden">
      {/* Sidebar navigation */}
      <aside
        id="app-sidebar"
        className={`bg-[#114645] text-white flex flex-col justify-between transition-all duration-300 z-30 shadow-xl border-r border-[#115e5d]/30 ${
          isSidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar Header Brand */}
          <div className="p-5 border-b border-[#115e5d]/40 flex items-center gap-3 overflow-hidden">
            <div className="bg-[#d8be4c] text-[#114645] p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <BookOpen size={20} className="stroke-[2.5]" />
            </div>
            {isSidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="text-sm font-black tracking-wider text-white uppercase font-philosopher">BTQ Digital</h1>
                <p className="text-[9px] text-[#d8be4c] font-bold font-philosopher leading-tight">SMP Muhammadiyah 2 Cirebon</p>
              </div>
            )}
          </div>

          {/* Navigation Menu Links */}
          <div className="p-4 space-y-6">
            {/* 1. INFORMASI PUBLIK SECTION */}
            <div className="space-y-2">
              {isSidebarOpen && (
                <span className="text-[9px] font-black text-[#d8be4c] uppercase tracking-widest block px-3 opacity-80">
                  Informasi Publik
                </span>
              )}
              <div className="space-y-1">
                <button
                  id="tab-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-[#115e5d] text-white shadow-inner border border-[#d8be4c]/20'
                      : 'text-white/80 hover:bg-[#115e5d]/40 hover:text-white'
                  }`}
                  title="Dashboard Data"
                >
                  <Layers size={18} className="shrink-0 text-[#d8be4c]" />
                  {isSidebarOpen && <span>Dashboard Data</span>}
                </button>

                <button
                  id="tab-arsip"
                  onClick={() => setActiveTab('arsip')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'arsip'
                      ? 'bg-[#115e5d] text-white shadow-inner border border-[#d8be4c]/20'
                      : 'text-white/80 hover:bg-[#115e5d]/40 hover:text-white'
                  }`}
                  title="Arsip Lulusan"
                >
                  <GraduationCap size={18} className="shrink-0 text-[#d8be4c]" />
                  {isSidebarOpen && <span>Arsip Lulusan</span>}
                </button>
              </div>
            </div>

            {/* 2. PERSPEKTIF USER SECTION */}
            <div className="space-y-2">
              {isSidebarOpen && (
                <span className="text-[9px] font-black text-[#d8be4c] uppercase tracking-widest block px-3 opacity-80">
                  Portal User (Otoritas)
                </span>
              )}
              <div className="space-y-1">
                <button
                  id="tab-pj"
                  onClick={() => setActiveTab('pj')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'pj'
                      ? 'bg-[#115e5d] text-white shadow-inner border border-[#d8be4c]/20'
                      : 'text-white/80 hover:bg-[#115e5d]/40 hover:text-white'
                  }`}
                  title="PJ (Penanggung Jawab)"
                >
                  <UserCheck size={18} className="shrink-0" />
                  {isSidebarOpen && <span className="truncate">Penanggung Jawab (PJ)</span>}
                  {isSidebarOpen && (
                    <span className="ml-auto shrink-0">
                      {loggedInRoles.pj ? (
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-black uppercase">OK</span>
                      ) : (
                        <Lock size={11} className="text-white/40" />
                      )}
                    </span>
                  )}
                </button>

                <button
                  id="tab-admin"
                  onClick={() => setActiveTab('admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-[#115e5d] text-white shadow-inner border border-[#d8be4c]/20'
                      : 'text-white/80 hover:bg-[#115e5d]/40 hover:text-white'
                  }`}
                  title="Admin"
                >
                  <Settings size={18} className="shrink-0" />
                  {isSidebarOpen && <span className="truncate">Admin Master Data</span>}
                  {isSidebarOpen && (
                    <span className="ml-auto shrink-0">
                      {loggedInRoles.admin ? (
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-black uppercase">OK</span>
                      ) : (
                        <Lock size={11} className="text-white/40" />
                      )}
                    </span>
                  )}
                </button>

                <button
                  id="tab-bendahara"
                  onClick={() => setActiveTab('bendahara')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'bendahara'
                      ? 'bg-[#115e5d] text-white shadow-inner border border-[#d8be4c]/20'
                      : 'text-white/80 hover:bg-[#115e5d]/40 hover:text-white'
                  }`}
                  title="Bendahara"
                >
                  <Landmark size={18} className="shrink-0" />
                  {isSidebarOpen && <span className="truncate">Bendahara</span>}
                  {isSidebarOpen && (
                    <span className="ml-auto shrink-0">
                      {loggedInRoles.bendahara ? (
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-black uppercase">OK</span>
                      ) : (
                        <Lock size={11} className="text-white/40" />
                      )}
                    </span>
                  )}
                </button>

                <button
                  id="tab-guru"
                  onClick={() => setActiveTab('guru')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'guru'
                      ? 'bg-[#115e5d] text-white shadow-inner border border-[#d8be4c]/20'
                      : 'text-white/80 hover:bg-[#115e5d]/40 hover:text-white'
                  }`}
                  title="Guru"
                >
                  <Award size={18} className="shrink-0" />
                  {isSidebarOpen && <span className="truncate">Asatidz / Guru BTQ</span>}
                  {isSidebarOpen && (
                    <span className="ml-auto shrink-0">
                      {loggedInRoles.guru ? (
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-black uppercase">OK</span>
                      ) : (
                        <Lock size={11} className="text-white/40" />
                      )}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#115e5d]/40 space-y-3 overflow-hidden shrink-0">
          {isSidebarOpen && (
            <div className="bg-[#115e5d]/40 p-3 rounded-xl border border-[#115e5d]/50 text-center">
              <span className="text-[10px] text-[#d8be4c] font-extrabold uppercase tracking-widest block mb-1">
                Demo Workspace
              </span>
              <button
                onClick={() => {
                  if (confirm('Apakah Anda ingin mereset ulang semua data ke seed awal?')) {
                    resetToDefault();
                    alert('Data telah direset kembali ke seed bawaan!');
                  }
                }}
                className="text-[9px] bg-[#d8be4c] text-[#114645] hover:bg-[#d8be4c]/85 px-2 py-1 rounded font-bold uppercase tracking-wider transition inline-flex items-center gap-1"
              >
                <RefreshCw size={10} /> Reset Master Data
              </button>
            </div>
          )}
          {isSidebarOpen && (
            <p className="text-[9px] text-white/50 text-center font-medium font-mono">
              v1.2.0 • © SMP MUH 2 CRB
            </p>
          )}
        </div>
      </aside>

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-100 h-16 px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-4">
            {/* Toggle button ("tombol disamping yang bisa di hide") */}
            <button
              id="sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 text-[#114645] rounded-xl transition"
              title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </button>

            {/* School Brand font "Philosopher" */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-[#114645] text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider">BTQ</span>
                <h1 className="text-base font-bold text-[#114645] font-philosopher">SMP Muhammadiyah 2 Cirebon</h1>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider hidden sm:inline">
                Sistem Informasi Digital & Manajemen Qiroati
              </span>
            </div>
          </div>

          {/* Interactive Role Switcher at header */}
          <div className="flex items-center gap-3">
            <div className="bg-[#114645]/5 px-3 py-1.5 rounded-xl border border-[#114645]/10 hidden sm:flex items-center gap-2">
              <Sparkles size={14} className="text-[#d8be4c]" />
              <span className="text-xs font-semibold text-[#114645]">
                Portal: <span className="font-black uppercase">{activeTab === 'g_binaan' ? 'Guru Binaan' : activeTab}</span>
              </span>
            </div>

            {/* Logout button for the active restricted role if logged in */}
            {['pj', 'admin', 'bendahara', 'guru'].includes(activeTab) && loggedInRoles[activeTab as 'pj' | 'admin' | 'bendahara' | 'guru'] && (
              <button
                onClick={() => {
                  logout(activeTab as 'pj' | 'admin' | 'bendahara' | 'guru');
                }}
                className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Keluar dari Akun"
              >
                <ShieldAlert size={13} /> Keluar
              </button>
            )}

            {/* Float quick role help indicator */}
            <div className="relative">
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Sistem Aktif
              </span>
            </div>
          </div>
        </header>

        {/* Core application body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {/* Main workspace view router */}
          <div className="animate-fade-in duration-300">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
