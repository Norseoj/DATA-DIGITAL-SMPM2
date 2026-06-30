import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Key, ShieldCheck, AlertCircle, Eye, EyeOff, BookOpen } from 'lucide-react';

interface LoginViewProps {
  role: 'pj' | 'admin' | 'bendahara' | 'guru';
  onLoginSuccess: () => void;
}

export default function LoginView({ role, onLoginSuccess }: LoginViewProps) {
  const app = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabels: Record<string, string> = {
    admin: 'Administrator Utama',
    pj: 'PJ Qiroati (Penanggung Jawab)',
    bendahara: 'Bendahara Keuangan',
    guru: 'Asatidz / Guru BTQ',
  };

  const roleColors: Record<string, string> = {
    admin: 'from-red-600 to-red-800 bg-red-600',
    pj: 'from-brand-primary to-brand-accent bg-brand-primary',
    bendahara: 'from-amber-500 to-amber-700 bg-brand-gold',
    guru: 'from-emerald-600 to-emerald-800 bg-emerald-600',
  };

  const currentCreds = app.userCredentialsList.find(c => c.role === role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = app.login(role, username, password);
    if (success) {
      onLoginSuccess();
    } else {
      setError('Username atau Password salah. Silakan coba lagi atau hubungi Admin.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-150 overflow-hidden">
        {/* Header Branding Banner */}
        <div className={`p-6 text-white text-center bg-gradient-to-br ${roleColors[role]} relative`}>
          <div className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-full backdrop-blur-xs">
            <ShieldCheck size={18} />
          </div>
          
          <div className="bg-white text-[#114645] mx-auto w-12 h-12 rounded-xl flex items-center justify-center shadow-md mb-3">
            <BookOpen size={24} className="stroke-[2.5]" />
          </div>
          
          <h3 className="font-philosopher text-lg font-black tracking-wide">Portal Otentikasi</h3>
          <p className="text-xs text-white/95 font-bold mt-1 uppercase tracking-wider">
            {roleLabels[role]}
          </p>
          <p className="text-[10px] text-white/80 font-medium mt-0.5">
            SMP Muhammadiyah 2 Cirebon
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Gagal Masuk:</span> {error}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              {role === 'guru' ? 'Pilih Guru' : 'Username'}
            </label>
            {role === 'guru' ? (
              <select
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs outline-none focus:border-brand-primary focus:bg-white font-medium transition"
              >
                <option value="">-- Pilih Nama Guru --</option>
                {app.guruBTQList.map(g => (
                  <option key={g.kodeGuru} value={g.kodeGuru}>{g.kodeGuru} - {g.namaLengkap}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                autoFocus
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs outline-none focus:border-brand-primary focus:bg-white font-medium transition"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Password / PIN
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan sandi / PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 pr-10 text-xs outline-none focus:border-brand-primary focus:bg-white font-mono transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#114645] hover:bg-[#115e5d] text-white font-bold p-3 rounded-xl text-xs shadow-md transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Key size={14} /> Masuk ke Dasbor {role.toUpperCase()}
          </button>
        </form>

        {/* Credentials hints for easy testing (as required for prototype workspace) */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-150 text-center">
          <span className="text-[9px] bg-brand-gold/20 text-[#114645] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mb-1.5">
            Petunjuk Simulasi Login
          </span>
          {role === 'guru' ? (
            <p className="text-[11px] text-gray-600 font-medium">
              Pilih nama Anda, dan PIN default adalah <span className="font-mono bg-gray-200 px-1 py-0.5 rounded font-bold text-gray-800">123456</span> jika belum diatur admin.
            </p>
          ) : (
            <p className="text-[11px] text-gray-600 font-medium">
              Username: <span className="font-mono bg-gray-200 px-1 py-0.5 rounded font-bold text-gray-800">{currentCreds?.username}</span> • PIN: <span className="font-mono bg-gray-200 px-1 py-0.5 rounded font-bold text-gray-800">{currentCreds?.password || '(tidak diatur)'}</span>
            </p>
          )}
          <p className="text-[9px] text-gray-400 mt-1">
            * Kredensial di atas dapat diganti kapan saja oleh Admin.
          </p>
        </div>
      </div>
    </div>
  );
}
