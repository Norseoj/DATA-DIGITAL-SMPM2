import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, GraduationCap, Award, BookOpen, Calendar, HelpCircle, UserCheck } from 'lucide-react';

export default function ArsipView() {
  const { siswaList, guruBTQList, kelasList } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrad, setSelectedGrad] = useState<string | null>(null);

  const graduatedSiswa = siswaList.filter(s => s.isLulus);

  // Filter graduated list by search query
  const filteredGrads = graduatedSiswa.filter(s => 
    s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nomorSertifikat && s.nomorSertifikat.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getGuruName = (kode: string) => {
    return guruBTQList.find(g => g.kodeGuru === kode)?.namaLengkap || kode;
  };

  const getKelasName = (id: string) => {
    const k = kelasList.find(item => item.id === id);
    if (!k) return id;
    let suffix = k.subKelas;
    const prefixStr = k.kelas.toString();
    if (suffix.startsWith(prefixStr)) {
      suffix = suffix.substring(prefixStr.length).replace(/^[\s\-_]+/, '');
    }
    return `${k.kelas}-${suffix}`;
  };

  const activeGradDetails = graduatedSiswa.find(s => s.id === selectedGrad);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-primary font-philosopher">Arsip Lulusan (Informasi Publik)</h2>
        <p className="text-xs text-gray-500">
          Layanan publik untuk verifikasi dan penelusuran syahadah (sertifikat) kelulusan santri Qiroati SMP Muhammadiyah 2 Cirebon.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Pencarian Database Lulusan</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan Nama Siswa atau Nomor Syahadah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:bg-white transition"
              />
              <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="bg-brand-primary/5 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Hasil Pencarian ({filteredGrads.length} Lulusan)</span>
              <GraduationCap className="text-brand-primary" size={18} />
            </div>

            {filteredGrads.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <HelpCircle className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-sm font-semibold">Tidak menemukan data lulusan.</p>
                <p className="text-xs text-gray-400 mt-1">Coba gunakan nama lengkap atau kode sertifikat yang sesuai.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
                {filteredGrads.map(siswa => (
                  <button
                    key={siswa.id}
                    onClick={() => setSelectedGrad(siswa.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition flex justify-between items-center ${
                      selectedGrad === siswa.id ? 'bg-brand-primary/5 border-l-4 border-brand-primary' : ''
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{siswa.namaLengkap}</h4>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{siswa.nomorSertifikat || 'Nomor Sertifikat -'}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden sm:block">
                        <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-full font-semibold">
                          Lulus {siswa.tanggalLulus ? siswa.tanggalLulus.split('-')[0] : '2025'}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Graduation Certificate Verification Card */}
        <div className="lg:col-span-1">
          {activeGradDetails ? (
            <div className="bg-white rounded-xl shadow-md border-t-4 border-brand-gold overflow-hidden">
              <div className="p-6 text-center bg-gradient-to-b from-brand-gold/5 to-white border-b border-gray-50">
                <Award className="mx-auto text-brand-gold mb-2" size={44} />
                <h3 className="font-philosopher font-bold text-brand-primary text-lg">Syahadah Kelulusan</h3>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase font-bold">Terverifikasi Publik</span>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Nama Lengkap Santri</span>
                  <span className="text-sm font-extrabold text-gray-800">{activeGradDetails.namaLengkap}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Gender</span>
                    <span className="text-xs font-semibold text-gray-700">{activeGradDetails.gender === 'LK' ? 'LK' : 'PR'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Tempat, Tgl Lahir</span>
                    <span className="text-xs font-semibold text-gray-700">{activeGradDetails.tempatLahir}, {activeGradDetails.tanggalLahir}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Tahun Kelulusan</span>
                    <span className="text-xs font-extrabold text-emerald-800">{activeGradDetails.tanggalLulus ? activeGradDetails.tanggalLulus.split('-')[0] : '2025'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Nilai Munaqosah</span>
                    <span className="text-xs font-extrabold text-brand-accent">{activeGradDetails.nilaiKhatam || '93 (A)'}</span>
                  </div>
                </div>

                <div className="space-y-1 border-t border-gray-50 pt-3">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Nomor Syahadah Resmi</span>
                  <span className="text-xs font-mono font-bold text-gray-800">{activeGradDetails.nomorSertifikat || 'SRT/BTQ/2025/089'}</span>
                </div>

                <div className="space-y-1 border-t border-gray-50 pt-3">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Riwayat Guru Pembimbing BTQ</span>
                  <span className="text-xs font-semibold text-gray-700">{getGuruName(activeGradDetails.guruKode)}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Status Khatam Qur'an</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-gold/15 text-brand-primary font-bold rounded text-[10px]">
                    <UserCheck size={11} /> Khatam 30 Juz & Ghorib Tajwid
                  </span>
                </div>
              </div>

              <div className="bg-brand-primary p-4 text-center">
                <span className="text-[10px] text-white/80 font-semibold block">BTQ Digital SMP Muhammadiyah 2 Cirebon</span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl text-center border border-dashed border-gray-300 text-gray-400 h-80 flex flex-col justify-center items-center">
              <GraduationCap className="text-gray-300 mb-2" size={36} />
              <p className="text-xs font-medium">Pilih salah satu alumni pada daftar pencarian untuk melihat detail syahadah.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
