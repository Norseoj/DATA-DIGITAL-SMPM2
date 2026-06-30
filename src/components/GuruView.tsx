import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { JilidType, Siswa, CapaianCapaian, CapaianHarian } from '../types';
import { BookOpen, Calendar, Save, Award, RefreshCw, Layers, ShieldCheck, UserCheck, Search, HelpCircle, BadgeAlert } from 'lucide-react';
import { quranData } from '../data/quranData';
import ModalAjukanTasmi from './ModalAjukanTasmi';

/**
 * Validates a verse range or single verse input.
 * E.g., "15", "1-10", "142-200".
 * Returns { isValid: boolean, error?: string }
 */
export const validateQuranProgress = (juzStr: string | undefined, surahNama: string | undefined, ayatInput: string | undefined): { isValid: boolean; error?: string } => {
  if (!surahNama) {
    return { isValid: true }; // Not filled yet, so don't show error
  }

  // Parse Juz
  const cleanJuz = juzStr ? parseInt(juzStr.replace(/\D/g, '')) : NaN;
  
  // Find surah in our database
  let surahDetail;
  let actualJuz = NaN;

  if (!isNaN(cleanJuz)) {
    const juzObj = quranData.find(d => d.juz === cleanJuz);
    if (juzObj) {
      surahDetail = juzObj.surahs.find(s => s.nama.toLowerCase().includes(surahNama.toLowerCase()) || surahNama.toLowerCase().includes(s.nama.toLowerCase()));
      actualJuz = cleanJuz;
    }
  } else {
    // Search across all Juz if Juz is not specified
    for (const juzObj of quranData) {
      const s = juzObj.surahs.find(s => s.nama.toLowerCase().includes(surahNama.toLowerCase()) || surahNama.toLowerCase().includes(s.nama.toLowerCase()));
      if (s) {
        surahDetail = s;
        actualJuz = juzObj.juz;
        break;
      }
    }
  }

  if (!surahDetail) {
    return { isValid: true }; // If surah name is not in database, skip strict validation to prevent blockings
  }

  if (!ayatInput || ayatInput.trim() === '') {
    return { isValid: true }; // Empty, so fine
  }

  const { startAyat, endAyat } = surahDetail;

  // Clean the input (replace Arabic digits or fancy hyphens if any)
  let cleanInput = ayatInput.replace(/[–—]/g, '-').trim();
  
  // Try to match single number e.g. "15" or range "1-10" or "142-200"
  const rangeRegex = /^(\d+)(?:\s*-\s*(\d+))?$/;
  const match = cleanInput.match(rangeRegex);

  if (!match) {
    return { isValid: false, error: "Format ayat tidak valid. Gunakan format angka (misal: 5) atau rentang (misal: 1-10)." };
  }

  const start = parseInt(match[1]);
  const end = match[2] ? parseInt(match[2]) : null;

  if (isNaN(start)) {
    return { isValid: false, error: "Angka ayat tidak valid." };
  }

  // If single number
  if (end === null) {
    if (start < startAyat || start > endAyat) {
      return { 
        isValid: false, 
        error: `Ayat ${start} di luar rentang Juz ${actualJuz} (${surahDetail.nama}: Ayat ${startAyat}–${endAyat}).` 
      };
    }
  } else {
    // If range
    if (isNaN(end)) {
      return { isValid: false, error: "Angka rentang ayat tidak valid." };
    }
    if (start > end) {
      return { isValid: false, error: "Ayat mulai tidak boleh lebih besar dari ayat selesai." };
    }
    if (start < startAyat || end > endAyat) {
      return { 
        isValid: false, 
        error: `Ayat ${start}–${end} di luar rentang Juz ${actualJuz} (${surahDetail.nama}: Ayat ${startAyat}–${endAyat}).` 
      };
    }
  }

  return { isValid: true };
};

export default function GuruView() {
  const {
    siswaList, guruBTQList, guruBinaanList, jadwalShiftList, hariLiburList, capaianHarianList,
    pindahSementaraList, saveKehadiranAndCapaian, ajukanTes, activeUserKode, setActiveUserKode, kelasList, pengajuanTesList
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'input' | 'rekap'>('input');
  
  // Active shift selection for input harian
  const [selectedShift, setSelectedShift] = useState('S01');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states inside the table, keyed by studentId
  const [kehadiranState, setKehadiranState] = useState<Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alpha'>>({});
  const [capaianState, setCapaianState] = useState<Record<string, CapaianCapaian>>({});
  const [keteranganState, setKeteranganState] = useState<Record<string, string>>({});

  // State for Tasmi modal
  const [tasmiSiswa, setTasmiSiswa] = useState<Siswa | null>(null);

  // Active student in rekap bulanan to drill down
  const [selectedSiswaRekap, setSelectedSiswaRekap] = useState<string>('');

  const activeGuru = guruBTQList.find(g => g.kodeGuru === activeUserKode) || guruBTQList[0];

  // Resolve students under this teacher
  // 1. Regular students of this teacher
  const regularSiswa = siswaList.filter(s => !s.isLulus && s.guruKode === activeUserKode);
  
  // 2. "Siswa Titipan" (Temporary moves) matching this teacher as target
  const tempSiswaIds = pindahSementaraList
    .filter(p => p.guruBaruKode === activeUserKode && (selectedShift === 'semua' || p.shiftId === selectedShift))
    .map(p => p.siswaId);
  const tempSiswas = siswaList.filter(s => !s.isLulus && tempSiswaIds.includes(s.id));

  // Merge regular and temp students
  const combinedSiswa = [...regularSiswa, ...tempSiswas];

  // Filter combinedSiswa by selected shift
  const filteredSiswaForShift = combinedSiswa.filter(siswa => {
    if (selectedShift === 'semua') return true;
    
    // If it's a temporary student, they are bound to the shift in which they were delegated
    const isTemp = tempSiswaIds.includes(siswa.id);
    if (isTemp) return true; // already filtered by shift above
    
    const kObj = kelasList.find(k => k.id === siswa.kelasId);
    const calculatedShift = kObj?.shiftId || (siswa.kelasId === 'K7A' || siswa.kelasId === 'K8A' ? 'S01' : (siswa.kelasId === 'K7B' || siswa.kelasId === 'K8B' ? 'S02' : 'S03'));
    return calculatedShift === selectedShift;
  });

  // Sort alphabetical A-Z
  const sortedSiswaList = [...filteredSiswaForShift].sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap));

  // Load existing records for selected shift and date to populate fields
  useEffect(() => {
    const nextKehadiran: Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alpha'> = {};
    const nextCapaian: Record<string, CapaianCapaian> = {};
    const nextKeterangan: Record<string, string> = {};

    sortedSiswaList.forEach(siswa => {
      const existingLog = capaianHarianList.find(log => log.siswaId === siswa.id && log.tanggal === selectedDate);
      
      nextKehadiran[siswa.id] = existingLog ? existingLog.kehadiran : 'Hadir';
      nextCapaian[siswa.id] = existingLog ? { ...existingLog.capaian } : {};
      nextKeterangan[siswa.id] = existingLog ? existingLog.keterangan : '';
    });

    setKehadiranState(nextKehadiran);
    setCapaianState(nextCapaian);
    setKeteranganState(nextKeterangan);
  }, [selectedShift, selectedDate, activeUserKode, capaianHarianList, siswaList, pindahSementaraList, kelasList]);

  // Initial student selection for rekap tab
  useEffect(() => {
    if (regularSiswa.length > 0 && !selectedSiswaRekap) {
      setSelectedSiswaRekap(regularSiswa[0].id);
    }
  }, [regularSiswa]);

  // Change handlers with automatic group level synchronization!
  // "siswa jilid Juz 27 pada kelompok yang sama capaian hariannya sama, begitupun dengan Ghorib, Tajwid dan Finishing masing-masing"
  const handleCapaianChange = (siswaId: string, jilid: JilidType, key: keyof CapaianCapaian, val: string) => {
    const isSyncJilid = ['Juz 27', 'Qur\'an', 'Ghorib', 'Tajwid', 'Finishing'].includes(jilid);
    
    // Update active student
    const updatedSiswaCapaian = {
      ...capaianState[siswaId],
      [key]: val
    };

    const nextCapaian = {
      ...capaianState,
      [siswaId]: updatedSiswaCapaian
    };

    // If it is a synced jilid, automatically propagate to all other students of the same level under this teacher!
    // Exclude 'ket' from syncing: "hanya berbeda keterangan dan catatan"
    if (isSyncJilid && key !== 'ket') {
      sortedSiswaList.forEach(other => {
        if (other.id !== siswaId && other.jilid === jilid) {
          nextCapaian[other.id] = {
            ...nextCapaian[other.id],
            [key]: val
          };
        }
      });
    }

    setCapaianState(nextCapaian);
  };

  const getSiswaShiftId = (s: Siswa) => {
    const isTemp = tempSiswaIds.includes(s.id);
    if (isTemp) {
      const transfer = pindahSementaraList.find(p => p.siswaId === s.id && p.guruBaruKode === activeUserKode);
      if (transfer) return transfer.shiftId;
    }
    const kObj = kelasList.find(k => k.id === s.kelasId);
    return kObj?.shiftId || (s.kelasId === 'K7A' || s.kelasId === 'K8A' ? 'S01' : (s.kelasId === 'K7B' || s.kelasId === 'K8B' ? 'S02' : 'S03'));
  };

  const handleSaveAttendanceAndProgress = () => {
    const recordsToSave: Omit<CapaianHarian, 'id'>[] = sortedSiswaList.map(siswa => ({
      siswaId: siswa.id,
      tanggal: selectedDate,
      kehadiran: kehadiranState[siswa.id] || 'Hadir',
      capaian: (kehadiranState[siswa.id] || 'Hadir') === 'Hadir' ? (capaianState[siswa.id] || {}) : {},
      keterangan: keteranganState[siswa.id] || '',
      shiftId: getSiswaShiftId(siswa),
      guruKode: activeUserKode
    }));

    saveKehadiranAndCapaian(recordsToSave);
    alert(`Capaian Harian & Kehadiran untuk ${recordsToSave.length} siswa berhasil disimpan!`);
  };

  const handleSaveAttendanceOnly = () => {
    const recordsToSave: Omit<CapaianHarian, 'id'>[] = sortedSiswaList.map(siswa => {
      const existingLog = capaianHarianList.find(log => log.siswaId === siswa.id && log.tanggal === selectedDate);
      return {
        siswaId: siswa.id,
        tanggal: selectedDate,
        kehadiran: kehadiranState[siswa.id] || 'Hadir',
        capaian: existingLog ? { ...existingLog.capaian } : {},
        keterangan: keteranganState[siswa.id] || (existingLog ? existingLog.keterangan : ''),
        shiftId: getSiswaShiftId(siswa),
        guruKode: activeUserKode
      };
    });

    saveKehadiranAndCapaian(recordsToSave);
    alert(`Kehadiran (Presensi) untuk ${recordsToSave.length} siswa berhasil disimpan!`);
  };

  const renderQuranFields = (siswaId: string, jilid: JilidType, currentVal: CapaianCapaian, hasJuz: boolean, fixedJuz?: number) => {
    const sId = siswaId;
    
    // Determine active Juz
    const activeJuzStr = hasJuz ? currentVal.juz || '' : `Juz ${fixedJuz}`;
    const activeJuzNum = hasJuz 
      ? (currentVal.juz ? parseInt(currentVal.juz.replace(/\D/g, '')) : NaN) 
      : (fixedJuz || NaN);

    // Get surahs for the active Juz
    const juzObj = !isNaN(activeJuzNum) ? quranData.find(d => d.juz === activeJuzNum) : null;
    const availableSurahs = juzObj ? juzObj.surahs : [];

    // Find current selected surah info
    const selectedSurahObj = availableSurahs.find(s => s.nama === currentVal.surat);

    // Generate list of ayats for dropdown
    const ayats: number[] = [];
    if (selectedSurahObj) {
      for (let i = selectedSurahObj.startAyat; i <= selectedSurahObj.endAyat; i++) {
        ayats.push(i);
      }
    }

    return (
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-1">
          {/* Juz Selector (if required) */}
          {hasJuz ? (
            <select
              value={currentVal.juz || ''}
              onChange={(e) => {
                handleCapaianChange(sId, jilid, 'juz', e.target.value);
                // Clear surah and ayat when juz changes to keep it pristine
                handleCapaianChange(sId, jilid, 'surat', '');
                handleCapaianChange(sId, jilid, 'ayat', '');
              }}
              className="bg-white border border-gray-300 rounded p-1 text-[11px] outline-none w-full font-sans text-gray-700 font-medium"
            >
              <option value="">Pilih Juz...</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                <option key={num} value={`Juz ${num}`}>{`Juz ${num}`}</option>
              ))}
            </select>
          ) : (
            <div className="bg-gray-100 text-gray-500 border border-gray-200 rounded p-1 text-[11px] font-extrabold flex items-center justify-center font-sans">
              Juz {fixedJuz}
            </div>
          )}

          {/* Surah Selector */}
          <select
            value={currentVal.surat || ''}
            onChange={(e) => {
              const surahName = e.target.value;
              handleCapaianChange(sId, jilid, 'surat', surahName);
              // Clear ayat when surah changes to avoid old invalid ayat from previous surah
              handleCapaianChange(sId, jilid, 'ayat', '');
            }}
            disabled={hasJuz && !currentVal.juz}
            className="bg-white border border-gray-300 rounded p-1 text-[11px] outline-none w-full disabled:opacity-50 disabled:bg-gray-50 font-sans text-gray-700 font-medium font-arabic text-right dir-rtl"
            style={{ direction: 'rtl' }}
          >
            <option value="">{hasJuz && !currentVal.juz ? 'Pilih Juz' : 'Pilih Surah...'}</option>
            {availableSurahs.map(s => {
              const arabicName = s.nama.split(' (')[0];
              return <option key={s.nama} value={s.nama}>{arabicName}</option>;
            })}
          </select>

          {/* Ayat Input */}
          <input
            type="number"
            value={currentVal.ayat || ''}
            onChange={(e) => handleCapaianChange(sId, jilid, 'ayat', e.target.value)}
            disabled={!currentVal.surat}
            placeholder="Ayat..."
            className="bg-white border border-gray-300 rounded p-1 text-[11px] outline-none w-full disabled:opacity-50 disabled:bg-gray-50 font-sans text-gray-700 font-medium"
          />
        </div>

        {/* Info Message */}
        <div className="flex flex-col gap-0.5">
          {selectedSurahObj && (
            <p className="text-[9px] text-gray-500 font-sans">
              Rentang: <span className="font-semibold text-brand-primary">Ayat {selectedSurahObj.startAyat}–{selectedSurahObj.endAyat}</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render Capaian Input fields depending on the student's Jilid
  const renderCapaianInputFields = (siswa: Siswa, isGroupInput: boolean = false) => {
    const jilid = siswa.jilid;
    const sId = siswa.id;
    const currentVal = capaianState[sId] || {};
    const isSyncJilid = ['Juz 27', 'Qur\'an', 'Ghorib', 'Tajwid', 'Finishing'].includes(jilid);

    if (!isGroupInput) {
      const isHadir = (kehadiranState[sId] || 'Hadir') === 'Hadir';
      if (!isHadir) {
        return <span className="text-gray-400 italic text-[11px]">Siswa tidak hadir</span>;
      }
    }

    return (
      <div className="space-y-2">
        {/* Label indicator for sync groups */}
        {isSyncJilid && !isGroupInput && (
          <span className="inline-block text-[9px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded font-extrabold mb-1">
            🔗 Kelompok Level Sinkron
          </span>
        )}

        {/* Level 1A - 4B: "Halaman" */}
        {['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B'].includes(jilid) && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 font-bold">Hal:</span>
            <input
              type="text"
              placeholder="12"
              value={currentVal.hal || ''}
              onChange={(e) => handleCapaianChange(sId, jilid, 'hal', e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded px-1.5 py-1 text-xs w-20 outline-none focus:bg-white"
            />
          </div>
        )}

        {/* Juz 27: Surat & Ayat */}
        {jilid === 'Juz 27' && renderQuranFields(sId, jilid, currentVal, false, 27)}

        {/* Qur'an: Juz, Surat, Ayat */}
        {jilid === 'Qur\'an' && renderQuranFields(sId, jilid, currentVal, true)}

        {/* Ghorib: Halaman & Capaian Al-Qur'an (Juz, Surat, Ayat) */}
        {jilid === 'Ghorib' && (
          <div className="space-y-1 bg-brand-primary/5 p-1.5 rounded border border-brand-primary/10">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] text-brand-primary font-bold shrink-0">Ghorib Hal:</span>
              <input
                type="text"
                placeholder="Hal 15"
                value={currentVal.hal || ''}
                onChange={(e) => handleCapaianChange(sId, jilid, 'hal', e.target.value)}
                className="bg-white border border-gray-300 rounded px-1 py-0.5 text-[11px] w-20 outline-none"
              />
            </div>
            <div className="pt-1 border-t border-brand-primary/10">
              {renderQuranFields(sId, jilid, currentVal, true)}
            </div>
          </div>
        )}

        {/* Tajwid: Halaman, murojaah Ghorib (Halaman), and Al-Qur'an */}
        {jilid === 'Tajwid' && (
          <div className="space-y-1 bg-brand-primary/5 p-1.5 rounded border border-brand-primary/10">
            <div className="grid grid-cols-2 gap-1 mb-1">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-gray-500 font-bold">Tajwid:</span>
                <input
                  type="text"
                  placeholder="Hal"
                  value={currentVal.hal || ''}
                  onChange={(e) => handleCapaianChange(sId, jilid, 'hal', e.target.value)}
                  className="bg-white border border-gray-300 rounded px-1 py-0.5 text-[10px] w-12 outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-gray-500 font-bold">M. Ghorib:</span>
                <input
                  type="text"
                  placeholder="Hal"
                  value={currentVal.murojaahGhorib || ''}
                  onChange={(e) => handleCapaianChange(sId, jilid, 'murojaahGhorib', e.target.value)}
                  className="bg-white border border-gray-300 rounded px-1 py-0.5 text-[10px] w-12 outline-none"
                />
              </div>
            </div>
            <div className="pt-1 border-t border-brand-primary/10">
              {renderQuranFields(sId, jilid, currentVal, true)}
            </div>
          </div>
        )}

        {/* Finishing: capaian Ghorib, Tajwid, and Al-Qur'an */}
        {jilid === 'Finishing' && (
          <div className="space-y-1 bg-brand-primary/5 p-1.5 rounded border border-brand-primary/10 text-[10px]">
            <div className="grid grid-cols-2 gap-1 mb-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-gray-400 font-bold">Ghorib Hal</span>
                <input
                  type="text"
                  placeholder="Hal"
                  value={currentVal.capaianGhorib || ''}
                  onChange={(e) => handleCapaianChange(sId, jilid, 'capaianGhorib', e.target.value)}
                  className="bg-white border border-gray-300 rounded p-1 text-[10px] outline-none"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-gray-400 font-bold">Tajwid Hal</span>
                <input
                  type="text"
                  placeholder="Hal"
                  value={currentVal.capaianTajwid || ''}
                  onChange={(e) => handleCapaianChange(sId, jilid, 'capaianTajwid', e.target.value)}
                  className="bg-white border border-gray-300 rounded p-1 text-[10px] outline-none"
                />
              </div>
            </div>
            <div className="pt-1 border-t border-brand-primary/10">
              {renderQuranFields(sId, jilid, currentVal, true)}
            </div>
          </div>
        )}

        {/* Tahfidz: Juz, Surat, Ayat */}
        {jilid === 'Tahfidz' && renderQuranFields(sId, jilid, currentVal, true)}
      </div>
    );
  };

  // Render rekap bulanan table for selected student
  const renderRekapSiswaBulanan = () => {
    const selectedSiswa = siswaList.find(s => s.id === selectedSiswaRekap);
    if (!selectedSiswa) {
      return (
        <div className="p-8 text-center bg-white border border-gray-100 rounded-xl text-gray-400">
          <HelpCircle className="mx-auto mb-2 text-gray-300" size={32} />
          <p className="text-sm font-semibold">Silakan pilih santri terlebih dahulu untuk menampilkan rekap capaian harian.</p>
        </div>
      );
    }

    // Filter logs for selected student in past 2 months: May 2026, June 2026
    const studentLogs = capaianHarianList
      .filter(log => log.siswaId === selectedSiswaRekap)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal)); // newest first

    // Group logs by Month
    const monthsGrouped: Record<string, CapaianHarian[]> = {
      'Juni 2026': [],
      'Mei 2026': []
    };

    studentLogs.forEach(log => {
      if (log.tanggal.startsWith('2026-06-')) {
        monthsGrouped['Juni 2026'].push(log);
      } else if (log.tanggal.startsWith('2026-05-')) {
        monthsGrouped['Mei 2026'].push(log);
      }
    });

    const formatCapaianOutput = (capaian: CapaianCapaian) => {
      const parts = [];
      if (capaian.hal) parts.push(`Hal ${capaian.hal}`);
      if (capaian.juz) parts.push(`Juz ${capaian.juz}`);
      if (capaian.surat) parts.push(`${capaian.surat}`);
      if (capaian.ayat) parts.push(`Ayat ${capaian.ayat}`);
      if (capaian.murojaahGhorib) parts.push(`Mur. Ghorib Hal ${capaian.murojaahGhorib}`);
      if (capaian.capaianGhorib) parts.push(`Ghorib Hal ${capaian.capaianGhorib}`);
      if (capaian.capaianTajwid) parts.push(`Tajwid Hal ${capaian.capaianTajwid}`);
      return parts.join(' • ') || '-';
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="font-philosopher font-bold text-brand-primary text-lg">Rekap 2 Bulan Terakhir</h4>
            <p className="text-xs text-gray-500">Santri: <b>{selectedSiswa.namaLengkap}</b> (Jilid {selectedSiswa.jilid})</p>
          </div>
          <span className="px-3 py-1 bg-brand-gold text-brand-primary font-bold text-xs rounded shadow-xs">
            {selectedSiswa.jilid}
          </span>
        </div>

        {Object.entries(monthsGrouped).map(([monthTitle, logs]) => {
          if (logs.length === 0) return null;

          return (
            <div key={monthTitle} className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="bg-brand-primary text-white p-4 font-bold text-sm">
                Bulan {monthTitle}
              </div>

              <div className="divide-y divide-gray-100 text-xs">
                {/* Headers */}
                <div className="grid grid-cols-12 gap-2 bg-gray-50 p-3 font-bold text-gray-500 uppercase tracking-wider">
                  <span className="col-span-2">Tanggal</span>
                  <span className="col-span-2 text-center">Kehadiran</span>
                  <span className="col-span-5">Capaian Capaian Qiroati</span>
                  <span className="col-span-3">Catatan / Keterangan</span>
                </div>

                {logs.map((log, index) => {
                  // Weekly separation grid: check if previous log was in a different week!
                  // JS Date parses date: e.g. Day of week. Or simply we separate every 5 working days (which equals a school week).
                  const isNewWeek = index > 0 && index % 5 === 0;

                  // Check if this date has any holiday scheduled
                  const matchingHoliday = hariLiburList.find(h => h.tanggal === log.tanggal);

                  return (
                    <React.Fragment key={log.id}>
                      {isNewWeek && (
                        <div className="bg-brand-gold/10 text-brand-primary text-[10px] font-black text-center py-1 uppercase tracking-widest border-t-2 border-b border-brand-gold/20">
                          --- SEKAT PEKANAN BARU ---
                        </div>
                      )}

                      <div className={`grid grid-cols-12 gap-2 p-3 items-center ${
                        matchingHoliday 
                          ? 'bg-red-50 text-red-800 font-semibold' 
                          : log.kehadiran === 'Alpha' 
                            ? 'bg-red-50/30' 
                            : ''
                      }`}>
                        <span className="col-span-2 font-mono">{log.tanggal}</span>
                        <div className="col-span-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            log.kehadiran === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.kehadiran === 'Izin'
                                ? 'bg-yellow-100 text-yellow-800'
                                : log.kehadiran === 'Sakit'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                          }`}>
                            {log.kehadiran}
                          </span>
                        </div>
                        <span className="col-span-5 font-medium text-gray-700">
                          {matchingHoliday ? (
                            <span className="text-red-700 font-bold uppercase tracking-wider">★ HARI LIBUR: {matchingHoliday.keterangan}</span>
                          ) : (
                            formatCapaianOutput(log.capaian)
                          )}
                        </span>
                        <span className="col-span-3 text-gray-500 italic">
                          {matchingHoliday ? `Sekolah ditiadakan (${matchingHoliday.keterangan})` : log.keterangan || '-'}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const nextTargetJilid = (jilid: JilidType): JilidType => {
    const idx = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', 'Juz 27', 'Qur\'an', 'Ghorib', 'Tajwid', 'Finishing', 'Tahfidz'].indexOf(jilid);
    if (idx >= 0 && idx < 13) {
      return ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', 'Juz 27', 'Qur\'an', 'Ghorib', 'Tajwid', 'Finishing', 'Tahfidz'][idx + 1] as JilidType;
    }
    return 'Tahfidz';
  };

  const getSiswaKelasLabel = (id: string) => {
    const s = siswaList.find(sis => sis.id === id);
    if (!s) return '';
    const k = kelasList.find(item => item.id === s.kelasId);
    if (!k) return '';
    let suffix = k.subKelas;
    const prefixStr = k.kelas.toString();
    if (suffix.startsWith(prefixStr)) {
      suffix = suffix.substring(prefixStr.length).replace(/^[\s\-_]+/, '');
    }
    return `${k.kelas}-${suffix}`;
  };

  const renderKetField = (siswa: Siswa) => {
    const sId = siswa.id;
    const currentVal = capaianState[sId] || {};
    const isTahfidz = siswa.jilid === 'Tahfidz';
    const value = currentVal.ket || '';

    const options = isTahfidz
      ? [
          { value: 'L', label: 'L' },
          { value: 'U', label: 'U' }
        ]
      : [
          { value: 'L', label: 'L' },
          { value: 'TL', label: 'TL' }
        ];

    return (
      <select
        value={value}
        onChange={(e) => {
          handleCapaianChange(sId, siswa.jilid, 'ket', e.target.value);
        }}
        className="bg-white border border-gray-300 rounded p-1 text-[11px] outline-none w-full font-sans text-gray-700 font-bold"
      >
        <option value="">-</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  };

  const renderAjukanTesButton = (siswa: Siswa) => {
    const hasPending = pengajuanTesList.some(p => p.siswaId === siswa.id && p.status === 'Pending');

    if (hasPending) {
      return (
        <button
          disabled
          className="bg-gray-200 text-gray-500 font-bold px-2 py-1 rounded text-[10px] shadow-sm whitespace-nowrap font-sans cursor-not-allowed"
        >
          Menunggu Verifikasi
        </button>
      );
    }

    let buttonLabel = "Ajukan Munaqosah";
    let target = nextTargetJilid(siswa.jilid);

    if (siswa.jilid === 'Tahfidz') {
      buttonLabel = "Ajukan Tasmi'";
      target = 'Tahfidz';
    } else if (siswa.jilid === 'Finishing') {
      buttonLabel = "Ajukan EBTAQ";
      target = 'Tahfidz';
    } else {
      buttonLabel = "Ajukan Tes Naik Jilid";
    }

    return (
      <button
        onClick={() => {
          if (siswa.jilid === 'Tahfidz') {
            setTasmiSiswa(siswa);
          } else {
            ajukanTes(siswa.id, siswa.jilid, target);
            alert(`${buttonLabel} telah diajukan ke PJ.`);
          }
        }}
        className="bg-brand-gold text-brand-primary hover:bg-brand-gold/80 border border-brand-gold/40 font-bold px-2 py-1 rounded text-[10px] shadow-2xs transition whitespace-nowrap font-sans"
      >
        {buttonLabel}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-gradient-to-r from-brand-primary to-brand-accent p-6 rounded-2xl text-white shadow-xs">
        <div>
          <h2 className="text-2xl font-bold font-philosopher flex items-center gap-2">Laman Asatidz (Guru BTQ)</h2>
          <p className="text-xs text-white/80 mt-1">
            Ustadz/ah pengampu: <b>{activeGuru?.namaLengkap || 'Belum terpilih'} ({activeUserKode})</b>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white/80">Ubah Guru Pengampu:</span>
          <select
            value={activeUserKode}
            onChange={(e) => setActiveUserKode(e.target.value)}
            className="bg-white/10 text-white font-bold border border-white/20 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:bg-brand-primary"
          >
            {guruBTQList.map(g => (
              <option key={g.id} value={g.kodeGuru} className="text-gray-800">{g.kodeGuru} - {g.namaLengkap}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('input')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'input'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen size={16} /> Input Harian Santri
        </button>
        <button
          onClick={() => setActiveSubTab('rekap')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'rekap'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={16} /> Rekap Harian & Bulanan
        </button>
      </div>

      {/* 1. INPUT HARIAN TAB */}
      {activeSubTab === 'input' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tanggal Capaian</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg p-1.5 text-xs outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pilih Shift Bimbingan</label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg p-1.5 text-xs outline-none focus:border-brand-primary font-bold text-gray-700"
                >
                  <option value="semua">Semua Shift</option>
                  {jadwalShiftList.map(s => (
                    <option key={s.id} value={s.id}>{s.namaShift}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-400 block font-semibold">Total Santri pada Shift</span>
              <span className="text-xl font-extrabold text-brand-primary">{sortedSiswaList.length} Siswa</span>
            </div>
          </div>

          {/* Combined student attendance & progress logging table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="bg-brand-primary/5 px-4 py-3 border-b border-gray-100 flex justify-between items-center text-xs">
              <span className="font-extrabold text-brand-primary uppercase">Presensi & Capaian Belajar ({sortedSiswaList.length} Santri)</span>
              <span className="text-[10px] text-gray-400">Semua form otomatis default "Hadir"</span>
            </div>

            {sortedSiswaList.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <HelpCircle className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-sm font-semibold">Tidak ada bimbingan santri pada shift ini.</p>
                <p className="text-xs text-gray-400 mt-1">Coba beralih ke shift lain atau tambahkan penugasan santri di laman Admin/PJ.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                      <th className="p-4" style={{ width: '40px' }}>No</th>
                      <th className="p-4" style={{ minWidth: '150px' }}>Nama</th>
                      <th className="p-4 text-center" style={{ width: '120px' }}>Kehadiran</th>
                      <th className="p-4" style={{ width: '320px' }}>Capaian</th>
                      <th className="p-4" style={{ width: '80px' }}>Ket</th>
                      <th className="p-4">Catatan</th>
                      <th className="p-4 text-center">Ajukan Tes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(() => {
                      // Group by Jilid
                      const groups = sortedSiswaList.reduce((acc, siswa) => {
                        if (!acc[siswa.jilid]) acc[siswa.jilid] = [];
                        acc[siswa.jilid].push(siswa);
                        return acc;
                      }, {} as Record<string, Siswa[]>);

                      const syncJilids = ['Juz 27', 'Qur\'an', 'Ghorib', 'Tajwid', 'Finishing'];

                      let globalIndex = 0;

                      return Object.entries(groups).map(([jilid, groupSiswas]) => {
                        const isSyncGroup = syncJilids.includes(jilid);

                        return (
                          <React.Fragment key={jilid}>
                            {isSyncGroup && (
                              <tr className="bg-brand-primary/5 border-b border-brand-primary/10">
                                <td colSpan={3} className="p-4 text-brand-primary font-extrabold text-right uppercase tracking-wider text-[10px]">
                                  Isi Capaian Kelompok {jilid} ➔
                                </td>
                                <td className="p-4">
                                  {renderCapaianInputFields(groupSiswas[0], true)}
                                </td>
                                <td colSpan={3}></td>
                              </tr>
                            )}
                            
                            {groupSiswas.map((siswa) => {
                              globalIndex++;
                              const isTemp = tempSiswaIds.includes(siswa.id);
                              
                              const jilidLabel = ['Juz 27', 'Qur\'an', 'Finishing', 'Tahfidz'].includes(siswa.jilid) 
                                ? siswa.jilid 
                                : `Jilid ${siswa.jilid}`;

                              return (
                                <tr key={siswa.id} className={`hover:bg-gray-50/50 ${isTemp ? 'bg-yellow-50/20' : ''}`}>
                                  <td className="p-4 font-mono font-bold text-gray-400">
                                    {globalIndex}
                                  </td>
                                  <td className="p-4">
                                    <div className="font-bold text-gray-800 flex items-center gap-1.5">
                                      {siswa.namaLengkap}
                                      {isTemp && (
                                        <span className="bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                                          Siswa Titipan
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 block font-medium mt-0.5">{getSiswaKelasLabel(siswa.id)} • {jilidLabel}</span>
                                  </td>

                                  <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      {[{ label: 'H', val: 'Hadir' }, { label: 'I', val: 'Izin' }, { label: 'S', val: 'Sakit' }, { label: 'A', val: 'Alpha' }].map((status) => {
                                        const isSelected = (kehadiranState[siswa.id] || 'Hadir') === status.val;
                                        let btnClass = "";
                                        if (status.val === 'Hadir') {
                                          btnClass = isSelected ? "bg-emerald-600 text-white font-extrabold scale-105" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
                                        } else if (status.val === 'Izin') {
                                          btnClass = isSelected ? "bg-yellow-500 text-white font-extrabold scale-105" : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100";
                                        } else if (status.val === 'Sakit') {
                                          btnClass = isSelected ? "bg-orange-500 text-white font-extrabold scale-105" : "bg-orange-50 text-orange-700 hover:bg-orange-100";
                                        } else {
                                          btnClass = isSelected ? "bg-red-600 text-white font-extrabold scale-105" : "bg-red-50 text-red-700 hover:bg-red-100";
                                        }
                                        return (
                                          <button
                                            key={status.val}
                                            title={status.val}
                                            onClick={() => setKehadiranState(prev => ({ ...prev, [siswa.id]: status.val as any }))}
                                            className={`w-6 h-6 flex items-center justify-center text-[10px] font-extrabold rounded transition ${btnClass}`}
                                          >
                                            {status.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>

                                  <td className="p-4">
                                    {isSyncGroup ? (
                                      (kehadiranState[siswa.id] || 'Hadir') === 'Hadir' ? (
                                        <div className="text-center text-gray-400 italic text-[10px] bg-gray-50 py-1 rounded">
                                          (Sama dgn Kelompok)
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 italic text-[11px]">Siswa tidak hadir</span>
                                      )
                                    ) : (
                                      renderCapaianInputFields(siswa)
                                    )}
                                  </td>

                                  <td className="p-4">
                                    {renderKetField(siswa)}
                                  </td>

                                  <td className="p-4">
                                    <input
                                      type="text"
                                      placeholder="Catatan..."
                                      value={keteranganState[siswa.id] || ''}
                                      onChange={(e) => setKeteranganState({
                                        ...keteranganState,
                                        [siswa.id]: e.target.value
                                      })}
                                      className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs outline-none focus:bg-white"
                                    />
                                  </td>

                                  <td className="p-4 text-center">
                                    {renderAjukanTesButton(siswa)}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            )}

            {sortedSiswaList.length > 0 && (
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={handleSaveAttendanceOnly}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-xs transition"
                >
                  <Save size={15} /> Simpan Presensi (Kehadiran Saja)
                </button>
                <button
                  onClick={handleSaveAttendanceAndProgress}
                  className="bg-brand-primary hover:bg-brand-accent text-white font-extrabold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-xs transition"
                >
                  <Save size={15} /> Simpan Presensi & Capaian Belajar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. REKAP HARIAN & BULANAN TAB */}
      {activeSubTab === 'rekap' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Student selection sidebar */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs xl:col-span-1 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-2">Asatidz Binaan Santri</h3>
            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {regularSiswa.map(siswa => (
                <button
                  key={siswa.id}
                  onClick={() => setSelectedSiswaRekap(siswa.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition flex justify-between items-center ${
                    selectedSiswaRekap === siswa.id
                      ? 'bg-brand-primary text-white font-bold'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate max-w-[140px]">{siswa.namaLengkap}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    selectedSiswaRekap === siswa.id ? 'bg-white text-brand-primary' : 'bg-brand-gold/20 text-brand-primary'
                  }`}>
                    {siswa.jilid}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Historical logs display */}
          <div className="xl:col-span-3">
            {renderRekapSiswaBulanan()}
          </div>
        </div>
      )}

      {tasmiSiswa && (
        <ModalAjukanTasmi
          siswa={tasmiSiswa}
          onClose={() => setTasmiSiswa(null)}
          onSubmit={(ket) => {
            ajukanTes(tasmiSiswa.id, 'Tahfidz', 'Tahfidz', ket);
            setTasmiSiswa(null);
            alert(`Ajukan Tasmi' telah diajukan ke PJ.`);
          }}
        />
      )}
    </div>
  );
}
