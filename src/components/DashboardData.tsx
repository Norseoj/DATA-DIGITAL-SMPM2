import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JilidType, Siswa, GuruBTQ, Kelas, JadwalShift } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Users, BookOpen, Layers, Award, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const ALL_JILIDS: JilidType[] = [
  '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B',
  'Juz 27', 'Qur\'an', 'Ghorib', 'Tajwid', 'Finishing', 'Tahfidz'
];

export default function DashboardData() {
  const { siswaList, guruBTQList, guruBinaanList, kelasList, jadwalShiftList, hariLiburList, capaianHarianList } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'bulanan' | 'matrix' | 'khatimin'>('bulanan');
  
  // Data Bulanan Subtabs
  const [bulananTab, setBulananTab] = useState<'jilid' | 'kelas' | 'guru' | 'efektif' | 'rekap_tabel'>('jilid');
  
  // Table search & filter states
  const [rekapSearch, setRekapSearch] = useState('');
  const [rekapKelas, setRekapKelas] = useState('all');
  const [rekapJilid, setRekapJilid] = useState('all');
  const [rekapGuru, setRekapGuru] = useState('all');
  
  // Filters
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('all');
  
  // Effective Day filters
  const [selectedKelasFilter, setSelectedKelasFilter] = useState<string[]>([...kelasList.map(k => k.id)]);
  const [selectedShiftEffFilter, setSelectedShiftEffFilter] = useState<string[]>([...jadwalShiftList.map(s => s.id)]);
  const [currentYearMonth, setCurrentYearMonth] = useState<{ year: number; month: number }>({ year: 2026, month: 5 }); // June 2026

  const activeSiswa = siswaList.filter(s => !s.isLulus);

  // Helper to resolve guru name
  const getGuruName = (kode: string) => {
    return guruBTQList.find(g => g.kodeGuru === kode)?.namaLengkap || kode;
  };

  // Helper to resolve kelas name
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

  // Render Data Bulanan
  const renderBulanan = () => {
    switch (bulananTab) {
      case 'jilid': {
        // Group students by Jilid
        const filteredSiswa = activeSiswa.filter(s => {
          if (selectedShiftFilter === 'all') return true;
          // Determine student's general shift based on their class
          const kObj = kelasList.find(k => k.id === s.kelasId);
          const sShift = kObj?.shiftId || (s.kelasId === 'K7A' || s.kelasId === 'K8A' ? 'S01' : (s.kelasId === 'K7B' || s.kelasId === 'K8B' ? 'S02' : 'S03'));
          return sShift === selectedShiftFilter;
        });

        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-brand-primary">Rekap per Jilid Qiroati</h3>
                <p className="text-sm text-gray-500">Jumlah siswa aktif dikelompokkan berdasarkan tingkatan jilid.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Pilih Shift:</span>
                <select
                  value={selectedShiftFilter}
                  onChange={(e) => setSelectedShiftFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-brand-primary"
                >
                  <option value="all">Semua Shift</option>
                  {jadwalShiftList.map(shift => (
                    <option key={shift.id} value={shift.id}>{shift.namaShift}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_JILIDS.map(jilid => {
                const jilidSiswa = filteredSiswa.filter(s => s.jilid === jilid);
                if (jilidSiswa.length === 0) return null;
                return (
                  <div key={jilid} className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 hover:border-brand-primary transition">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary font-bold rounded-lg text-sm">{jilid}</span>
                      <span className="text-2xl font-bold text-gray-800">{jilidSiswa.length} <span className="text-xs text-gray-500 font-normal">Siswa</span></span>
                    </div>
                    <div className="space-y-2 border-t border-gray-50 pt-3">
                      {jilidSiswa.map(siswa => (
                        <div key={siswa.id} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700 truncate max-w-[150px]">{siswa.namaLengkap}</span>
                          <span className="text-xs text-gray-500">{getKelasName(siswa.kelasId)} • {siswa.guruKode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case 'kelas': {
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
              <h3 className="text-lg font-semibold text-brand-primary">Rekap per Kelas</h3>
              <p className="text-sm text-gray-500">Jumlah siswa dikelompokkan berdasarkan Rombel/Sub Kelas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kelasList.map(kelas => {
                const kelasSiswa = activeSiswa.filter(s => s.kelasId === kelas.id);
                return (
                  <div key={kelas.id} className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                      <div>
                        <h4 className="font-bold text-gray-800">{kelas.subKelas}</h4>
                        <span className="text-xs text-gray-400">{kelas.isKelasAkhir ? 'Kelas Akhir Kelulusan' : (jadwalShiftList.find(s => s.id === kelas.shiftId)?.namaShift || '')}</span>
                      </div>
                      <span className="text-xl font-bold text-brand-accent">{kelasSiswa.length} <span className="text-xs text-gray-400 font-normal">Siswa</span></span>
                    </div>
                    {kelasSiswa.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Belum ada siswa di kelas ini.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {kelasSiswa.map(siswa => (
                          <div key={siswa.id} className="flex justify-between items-center text-xs">
                            <span className="font-medium text-gray-700 truncate max-w-[140px]">{siswa.namaLengkap}</span>
                            <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-primary text-[10px] rounded font-bold">{siswa.jilid}</span>
                            <span className="text-[10px] text-gray-500">{siswa.guruKode}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case 'guru': {
        const filteredSiswa = activeSiswa.filter(s => {
          if (selectedShiftFilter === 'all') return true;
          const kObj = kelasList.find(k => k.id === s.kelasId);
          const sShift = kObj?.shiftId || (s.kelasId === 'K7A' || s.kelasId === 'K8A' ? 'S01' : (s.kelasId === 'K7B' || s.kelasId === 'K8B' ? 'S02' : 'S03'));
          return sShift === selectedShiftFilter;
        });

        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-brand-primary">Rekap per Guru BTQ</h3>
                <p className="text-sm text-gray-500">Kelompok bimbingan siswa aktif berdasarkan Guru BTQ.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Pilih Shift:</span>
                <select
                  value={selectedShiftFilter}
                  onChange={(e) => setSelectedShiftFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-brand-primary"
                >
                  <option value="all">Semua Shift</option>
                  {jadwalShiftList.map(shift => (
                    <option key={shift.id} value={shift.id}>{shift.namaShift}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guruBTQList.map(guru => {
                const guruSiswa = filteredSiswa.filter(s => s.guruKode === guru.kodeGuru);
                const binaan = guruBinaanList.filter(gb => gb.guruKodeBTQ === guru.kodeGuru);
                return (
                  <div key={guru.id} className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
                    <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
                      <div>
                        <h4 className="font-bold text-gray-800 text-base">{guru.namaLengkap}</h4>
                        <span className="text-xs bg-brand-accent/10 text-brand-primary px-2 py-0.5 rounded-full font-semibold">{guru.kodeGuru}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-brand-primary block">{guruSiswa.length} <span className="text-xs text-gray-400 font-normal">Binaan</span></span>
                        <span className="text-[10px] text-gray-500">{binaan.length} Guru Binaan di bawahnya</span>
                      </div>
                    </div>
                    {guruSiswa.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Belum mengampu siswa pada kriteria shift ini.</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1">
                          <span>Nama Siswa</span>
                          <div className="flex justify-between">
                            <span>Kelas</span>
                            <span>Jilid Qiroati</span>
                          </div>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {guruSiswa.map(siswa => (
                            <div key={siswa.id} className="flex justify-between items-center text-xs py-1 hover:bg-gray-50 rounded px-1">
                              <span className="font-medium text-gray-700 truncate max-w-[150px]">{siswa.namaLengkap}</span>
                              <div className="flex gap-4 items-center">
                                <span className="text-gray-500 text-[11px]">{getKelasName(siswa.kelasId)}</span>
                                <span className="px-2 py-0.5 bg-brand-gold text-brand-primary font-bold text-[10px] rounded shadow-2xs">{siswa.jilid}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case 'efektif': {
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        // Generate calendar days for selected year and month
        const year = currentYearMonth.year;
        const month = currentYearMonth.month; // 0-indexed for JS Date, let's say 4 for May, 5 for June
        
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, etc.
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const calendarCells: { dateStr: string; dayNum: number; isEffective: boolean; reason?: string; isWeekend: boolean }[] = [];
        
        // Month string
        const monthStr = (month + 1).toString().padStart(2, '0');
        
        for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${year}-${monthStr}-${i.toString().padStart(2, '0')}`;
          const dayOfWeek = new Date(year, month, i).getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          // Check if this date has any holiday overlapping with selected filter
          const matchingHolidays = hariLiburList.filter(h => {
            if (h.tanggal !== dateStr) return false;
            // Overlap check
            const matchesShift = h.shiftId === 'semua' || selectedShiftEffFilter.includes(h.shiftId);
            const matchesKelas = h.kelasId === 'semua' || selectedKelasFilter.includes(h.kelasId);
            return matchesShift && matchesKelas;
          });
          
          const isHoliday = matchingHolidays.length > 0;
          const isEffective = !isWeekend && !isHoliday;
          
          calendarCells.push({
            dateStr,
            dayNum: i,
            isEffective,
            reason: matchingHolidays.map(h => h.keterangan).join(', '),
            isWeekend
          });
        }
        
        const totalEffectiveDays = calendarCells.filter(c => c.isEffective).length;

        // Calendar grid padding
        // JS Sunday is 0. If Monday is 1, let's offset
        const gridOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // start from Monday

        const handlePrevMonth = () => {
          if (currentYearMonth.month === 0) {
            setCurrentYearMonth({ year: currentYearMonth.year - 1, month: 11 });
          } else {
            setCurrentYearMonth({ year: currentYearMonth.year, month: currentYearMonth.month - 1 });
          }
        };

        const handleNextMonth = () => {
          if (currentYearMonth.month === 11) {
            setCurrentYearMonth({ year: currentYearMonth.year + 1, month: 0 });
          } else {
            setCurrentYearMonth({ year: currentYearMonth.year, month: currentYearMonth.month + 1 });
          }
        };

        const toggleKelasFilter = (id: string) => {
          if (selectedKelasFilter.includes(id)) {
            setSelectedKelasFilter(selectedKelasFilter.filter(k => k !== id));
          } else {
            setSelectedKelasFilter([...selectedKelasFilter, id]);
          }
        };

        const toggleShiftFilter = (id: string) => {
          if (selectedShiftEffFilter.includes(id)) {
            setSelectedShiftEffFilter(selectedShiftEffFilter.filter(s => s !== id));
          } else {
            setSelectedShiftEffFilter([...selectedShiftEffFilter, id]);
          }
        };

        return (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
              <h3 className="text-lg font-semibold text-brand-primary">Rekap Hari Efektif Belajar BTQ</h3>
              <p className="text-sm text-gray-500">Menganalisis hari efektif bimbingan berdasarkan kalender libur dan shift.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Configuration Filter Sidebar */}
              <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 space-y-5">
                <h4 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-2 flex items-center gap-2 text-brand-primary">
                  <Layers size={16} /> Filter Analisis
                </h4>
                
                {/* Classes Checkbox List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider">Ceklis Kelas</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {kelasList.map(kelas => (
                      <label key={kelas.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedKelasFilter.includes(kelas.id)}
                          onChange={() => toggleKelasFilter(kelas.id)}
                          className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                        />
                        <span>{kelas.subKelas}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Shift Checkbox List */}
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider">Ceklis Shift</span>
                  <div className="space-y-1.5">
                    {jadwalShiftList.map(shift => (
                      <label key={shift.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedShiftEffFilter.includes(shift.id)}
                          onChange={() => toggleShiftFilter(shift.id)}
                          className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                        />
                        <span>{shift.namaShift}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50">
                  <div className="bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10 text-center">
                    <span className="text-xs text-brand-primary font-semibold block">Hari Efektif</span>
                    <span className="text-3xl font-extrabold text-brand-primary">{totalEffectiveDays}</span>
                    <span className="text-[10px] text-gray-500 block mt-1">Hari pada bulan {monthNames[month]} {year}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Calendar Grid */}
              <div className="lg:col-span-3 bg-white p-5 rounded-xl shadow-xs border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <button 
                    onClick={handlePrevMonth} 
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Calendar className="text-brand-primary" size={20} />
                    {monthNames[month]} {year}
                  </h4>
                  <button 
                    onClick={handleNextMonth} 
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
                    <span key={day} className="text-xs font-bold text-gray-400 uppercase tracking-wider py-1">{day}</span>
                  ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Grid Offset spacing */}
                  {Array.from({ length: gridOffset }).map((_, idx) => (
                    <div key={`offset-${idx}`} className="bg-gray-50 border border-dashed border-gray-100 rounded-lg h-20 opacity-40"></div>
                  ))}

                  {/* Active Month days */}
                  {calendarCells.map(cell => (
                    <div
                      key={cell.dateStr}
                      title={cell.reason || (cell.isWeekend ? 'Akhir Pekan' : 'Hari Efektif Belajar')}
                      className={`h-20 p-2 rounded-lg border flex flex-col justify-between relative transition ${
                        cell.isWeekend 
                          ? 'bg-gray-50 border-gray-100 text-gray-400' 
                          : !cell.isEffective 
                            ? 'bg-red-50 border-red-100 text-red-700' 
                            : 'bg-emerald-50/50 border-emerald-100 text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      <span className="text-xs font-bold">{cell.dayNum}</span>
                      
                      {/* Label indicators */}
                      {!cell.isWeekend && !cell.isEffective && (
                        <span className="text-[9px] bg-red-100 px-1 py-0.5 rounded truncate w-full text-red-800 font-medium select-none" title={cell.reason}>
                          {cell.reason || 'Libur'}
                        </span>
                      )}
                      
                      {cell.isEffective && (
                        <div className="flex justify-end">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </div>
                      )}

                      {cell.isWeekend && (
                        <div className="flex justify-end">
                          <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">Off</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'rekap_tabel': {
        const filtered = activeSiswa.filter(s => {
          const matchesSearch = s.namaLengkap.toLowerCase().includes(rekapSearch.toLowerCase());
          const matchesKelas = rekapKelas === 'all' || s.kelasId === rekapKelas;
          const matchesJilid = rekapJilid === 'all' || s.jilid === rekapJilid;
          const matchesGuru = rekapGuru === 'all' || s.guruKode === rekapGuru;
          return matchesSearch && matchesKelas && matchesJilid && matchesGuru;
        });

        return (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-brand-primary">Rekap Data Santri / Siswa Aktif</h3>
                <p className="text-sm text-gray-500">Tabel lengkap berisi seluruh informasi santri yang aktif belajar di BTQ.</p>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Cari Nama</label>
                  <input
                    type="text"
                    placeholder="Cari santri..."
                    value={rekapSearch}
                    onChange={(e) => setRekapSearch(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kelas</label>
                  <select
                    value={rekapKelas}
                    onChange={(e) => setRekapKelas(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  >
                    <option value="all">Semua Kelas</option>
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.subKelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Jilid</label>
                  <select
                    value={rekapJilid}
                    onChange={(e) => setRekapJilid(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  >
                    <option value="all">Semua Jilid</option>
                    {ALL_JILIDS.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Guru</label>
                  <select
                    value={rekapGuru}
                    onChange={(e) => setRekapGuru(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  >
                    <option value="all">Semua Guru</option>
                    {guruBTQList.map(g => (
                      <option key={g.kodeGuru} value={g.kodeGuru}>{g.namaLengkap} ({g.kodeGuru})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase font-bold tracking-wider">
                      <th className="p-3 font-semibold">Nama</th>
                      <th className="p-3 font-semibold">Kelas</th>
                      <th className="p-3 font-semibold">Jilid</th>
                      <th className="p-3 font-semibold">Guru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400 italic">
                          Tidak ada data siswa yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(siswa => (
                        <tr key={siswa.id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-semibold text-gray-800">{siswa.namaLengkap}</td>
                          <td className="p-3 text-brand-accent font-medium">{getKelasName(siswa.kelasId)}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-primary font-bold rounded">
                              {siswa.jilid}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-gray-700">{getGuruName(siswa.guruKode)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                Menampilkan {filtered.length} dari {activeSiswa.length} total siswa aktif
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  // Render Rekap Tes & Matrix
  const renderMatrix = () => {
    // Generate cross tabulation matrix: row = Jilid, col = Kelas
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
          <h3 className="text-lg font-semibold text-brand-primary">Matriks Capaian Jilid Qiroati</h3>
          <p className="text-sm text-gray-500">Pemetaan jumlah siswa aktif per tingkatan jilid pada setiap rombel kelas.</p>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-bold text-gray-700">Tingkat Jilid Qiroati</th>
                  {kelasList.map(kelas => (
                    <th key={kelas.id} className="p-4 text-center font-bold text-gray-700">{kelas.subKelas}</th>
                  ))}
                  <th className="p-4 text-center font-bold text-brand-primary">Total Siswa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {ALL_JILIDS.map(jilid => {
                  const totalForJilid = activeSiswa.filter(s => s.jilid === jilid).length;
                  return (
                    <tr key={jilid} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-semibold text-gray-800">
                        <span className="px-2.5 py-1 bg-brand-primary/5 text-brand-primary rounded-md text-xs font-extrabold">{jilid}</span>
                      </td>
                      {kelasList.map(kelas => {
                        const count = activeSiswa.filter(s => s.jilid === jilid && s.kelasId === kelas.id).length;
                        return (
                          <td key={kelas.id} className="p-4 text-center">
                            {count > 0 ? (
                              <span className="inline-block px-2 py-1 bg-brand-gold/10 text-brand-primary rounded font-extrabold text-xs">
                                {count}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-4 text-center font-extrabold text-brand-primary">
                        {totalForJilid > 0 ? totalForJilid : <span className="text-gray-300 font-normal">0</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100/50 font-bold text-sm">
                  <td className="p-4 text-gray-700">Total Per Kelas</td>
                  {kelasList.map(kelas => {
                    const count = activeSiswa.filter(s => s.kelasId === kelas.id).length;
                    return (
                      <td key={kelas.id} className="p-4 text-center text-brand-accent font-extrabold">{count}</td>
                    );
                  })}
                  <td className="p-4 text-center text-brand-primary font-extrabold">{activeSiswa.length}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Data Khatimin
  const renderKhatimin = () => {
    // Khatimin are students (active or graduated) who have Al-Qur'an checked as statusKhatam
    const khatimList = siswaList.filter(s => s.statusKhatam || s.jilid === 'Tahfidz');

    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-brand-primary">Laporan Data Khatimin Al-Qur'an</h3>
            <p className="text-sm text-gray-500">Daftar siswa yang telah menyelesaikan khatam Al-Qur'an 30 Juz & Tahfidz.</p>
          </div>
          <Award size={36} className="text-brand-gold" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {khatimList.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-xl text-center border border-gray-100 text-gray-400">
              <ShieldAlert className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-sm font-medium">Belum ada siswa yang tercatat khatam Al-Qur'an.</p>
            </div>
          ) : (
            khatimList.map(siswa => (
              <div key={siswa.id} className="bg-white p-5 rounded-xl shadow-xs border border-brand-gold/30 hover:shadow-md transition relative overflow-hidden flex flex-col justify-between">
                {/* Gold ribbon */}
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                  <div className="absolute top-3 -right-5 bg-brand-gold text-brand-primary font-bold text-[8px] py-0.5 px-5 text-center rotate-45 uppercase tracking-widest shadow-xs">
                    Khatam
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-gray-800 text-base">{siswa.namaLengkap}</h4>
                  <p className="text-xs text-gray-400 mt-1">{getKelasName(siswa.kelasId)} • {siswa.gender === 'LK' ? 'LK' : 'PR'}</p>
                  
                  <div className="mt-4 space-y-2 border-t border-gray-50 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tanggal Khatam:</span>
                      <span className="font-medium text-gray-700">{siswa.tanggalKhatam || '22 Juni 2026'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nilai Munaqosah:</span>
                      <span className="font-bold text-brand-accent">{siswa.nilaiKhatam || '90 (A)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nomor Syahadah:</span>
                      <span className="font-mono text-[10px] text-gray-700">{siswa.nomorSertifikat || 'SRT/BTQ/2026/012'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Guru Pembimbing:</span>
                      <span className="font-medium text-gray-700">{getGuruName(siswa.guruKode)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-brand-primary/5 p-2 rounded text-[10px] text-brand-primary font-medium text-center flex items-center justify-center gap-1.5">
                  <CheckCircle size={12} className="text-brand-accent" />
                  Sertifikasi & Syahadah Qiroati Terbit
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Philosopher header title */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold text-brand-primary font-philosopher">Dashboard Data & Informasi Publik</h2>
        <p className="text-xs text-gray-500">Informasi rekap harian, bulanan, capaian siswa, serta database Khatimin.</p>
      </div>

      {/* Primary tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('bulanan')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'bulanan'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={16} /> Data Bulanan
        </button>
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'matrix'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers size={16} /> Rekap Tes & Matrix
        </button>
        <button
          onClick={() => setActiveSubTab('khatimin')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'khatimin'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Award size={16} /> Data Khatimin
        </button>
      </div>

      {activeSubTab === 'bulanan' && (
        <div className="space-y-6">
          {/* Sub menu untuk data bulanan */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setBulananTab('jilid')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs ${
                bulananTab === 'jilid'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Rekap per Jilid
            </button>
            <button
              onClick={() => setBulananTab('kelas')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs ${
                bulananTab === 'kelas'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Rekap per Kelas
            </button>
            <button
              onClick={() => setBulananTab('guru')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs ${
                bulananTab === 'guru'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Rekap per Guru
            </button>
            <button
              onClick={() => setBulananTab('efektif')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs ${
                bulananTab === 'efektif'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Rekap Hari Efektif
            </button>
            <button
              onClick={() => setBulananTab('rekap_tabel')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs ${
                bulananTab === 'rekap_tabel'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Rekap Tabel Lengkap
            </button>
          </div>

          <div>{renderBulanan()}</div>
        </div>
      )}

      {activeSubTab === 'matrix' && renderMatrix()}

      {activeSubTab === 'khatimin' && renderKhatimin()}
    </div>
  );
}
