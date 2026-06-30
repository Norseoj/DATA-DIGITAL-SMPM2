import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JilidType, Gender, Siswa, GuruBTQ, GuruBinaan, Kelas, JadwalShift, HariLibur } from '../types';
import { Plus, Trash2, Calendar, FileText, UserPlus, Users, Layers, ShieldAlert, GraduationCap, Clock, Edit2, Key, Search, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ALL_JILIDS: JilidType[] = [
  '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B',
  'Juz 27', 'Qur\'an', 'Ghorib', 'Tajwid', 'Finishing', 'Tahfidz'
];

interface CredentialsCardProps {
  role: 'pj' | 'admin' | 'bendahara' | 'guru';
  label: string;
  colorClass: string;
}

function CredentialsCard({ role, label, colorClass }: CredentialsCardProps) {
  const { userCredentialsList, updateCredentials } = useApp();
  const cred = userCredentialsList.find(c => c.role === role) || { role, username: '', password: '' };
  
  const [username, setUsername] = useState(cred.username);
  const [password, setPassword] = useState(cred.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    setUsername(cred.username);
    setPassword(cred.password || '');
  }, [cred.username, cred.password]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCredentials(role, username, password);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <div>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colorClass}`}>
            Akses {label}
          </span>
          <h4 className="font-bold text-gray-800 text-sm mt-1">Akun {label}</h4>
        </div>
        <Key size={18} className="text-gray-400" />
      </div>
      
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Username</label>
          <input
            type="text"
            required
            placeholder={`Username ${label}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary font-medium"
          />
        </div>
        
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Password / PIN</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 pr-20 text-xs outline-none focus:border-brand-primary font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-[10px] text-brand-primary font-semibold hover:underline bg-brand-primary/5 px-2 py-1 rounded"
            >
              {showPassword ? "Sembunyikan" : "Lihat"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {success ? (
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 animate-pulse">
              ✓ Berhasil disimpan
            </span>
          ) : (
            <span className="text-[10px] text-gray-400">
              * Perubahan langsung aktif
            </span>
          )}
          <button
            type="submit"
            className="bg-brand-primary hover:bg-brand-accent text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-xs"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminView() {
  const {
    siswaList, guruBTQList, guruBinaanList, kelasList, jadwalShiftList, hariLiburList,
    addSiswa, updateSiswa, deleteSiswa, graduatedSiswa,
    addGuruBTQ, updateGuruBTQ, deleteGuruBTQ,
    addGuruBinaan, updateGuruBinaan, deleteGuruBinaan,
    addJadwalShift, updateJadwalShift, deleteJadwalShift,
    addHariLibur, updateHariLibur, deleteHariLibur,
    addKelas, updateKelas, deleteKelas,
    runClassPromotionManually
  } = useApp();

  const sortedKelasList = [...kelasList].sort((a, b) => {
    if (a.kelas !== b.kelas) {
      return a.kelas - b.kelas;
    }
    return a.subKelas.localeCompare(b.subKelas, undefined, { numeric: true });
  });

  const [activeTab, setActiveTab] = useState<'siswa' | 'guru' | 'g_binaan' | 'jadwal' | 'kelas' | 'kredensial'>('siswa');
  const [subJadwalTab, setSubJadwalTab] = useState<'shift' | 'libur'>('shift');

  // Form Collapse/Visibility states
  const [showSiswaForm, setShowSiswaForm] = useState(true);
  const [showGuruForm, setShowGuruForm] = useState(true);
  const [showGuruBinaanForm, setShowGuruBinaanForm] = useState(true);
  const [showJadwalForm, setShowJadwalForm] = useState(true);
  const [showKelasForm, setShowKelasForm] = useState(true);

  // Editing States
  const [editingSiswaId, setEditingSiswaId] = useState<string | null>(null);
  const [editingGuruBTQId, setEditingGuruBTQId] = useState<string | null>(null);
  const [editingGuruBinaanId, setEditingGuruBinaanId] = useState<string | null>(null);
  const [editingJadwalShiftId, setEditingJadwalShiftId] = useState<string | null>(null);
  const [editingHariLiburId, setEditingHariLiburId] = useState<string | null>(null);
  const [editingKelasId, setEditingKelasId] = useState<string | null>(null);

  // Search & Suggestion States
  const [siswaSearchQuery, setSiswaSearchQuery] = useState('');
  const [showSiswaSuggestions, setShowSiswaSuggestions] = useState(false);
  const [siswaGroupBy, setSiswaGroupBy] = useState<'none' | 'jilid' | 'kelas' | 'guru'>('none');
  const [promotionPassword, setPromotionPassword] = useState('');

  // Input States
  // 1. Siswa
  const [siswaNama, setSiswaNama] = useState('');
  const [siswaGender, setSiswaGender] = useState<Gender>('LK');
  const [siswaTempatLahir, setSiswaTempatLahir] = useState('');
  const [siswaTanggalLahir, setSiswaTanggalLahir] = useState('');
  const [siswaAyah, setSiswaAyah] = useState('');
  const [siswaIbu, setSiswaIbu] = useState('');
  const [siswaAlamat, setSiswaAlamat] = useState('');
  const [siswaKelas, setSiswaKelas] = useState('');
  const [siswaJilid, setSiswaJilid] = useState<JilidType>('1A');
  const [siswaGuru, setSiswaGuru] = useState('');

  // Graduation Trigger Modal
  const [graduatingSiswaId, setGraduatingSiswaId] = useState<string | null>(null);
  const [tglLulus, setTglLulus] = useState('2026-06-15');
  const [isKhatam, setIsKhatam] = useState(true);
  const [nilaiKhatam, setNilaiKhatam] = useState('92 (A)');
  const [nomorSertifikat, setNomorSertifikat] = useState('');

  // 2. Guru BTQ
  const [gNama, setGNama] = useState('');
  const [gGender, setGGender] = useState<Gender>('LK');
  const [gTempatLahir, setGTempatLahir] = useState('');
  const [gTanggalLahir, setGTanggalLahir] = useState('');
  const [gKode, setGKode] = useState('');
  const [gPassword, setGPassword] = useState('');

  // 3. Guru Binaan
  const [gbNama, setGbNama] = useState('');
  const [gbGender, setGbGender] = useState<Gender>('LK');
  const [gbTempatLahir, setGbTempatLahir] = useState('');
  const [gbTanggalLahir, setGbTanggalLahir] = useState('');
  const [gbKode, setGbKode] = useState('');
  const [gbJilid, setGbJilid] = useState<JilidType>('1A');
  const [gbPembina, setGbPembina] = useState('');

  // Triggers & Cancel functions
  const startEditSiswa = (siswa: Siswa) => {
    setEditingSiswaId(siswa.id);
    setSiswaNama(siswa.namaLengkap);
    setSiswaGender(siswa.gender);
    setSiswaTempatLahir(siswa.tempatLahir === '-' ? '' : siswa.tempatLahir);
    setSiswaTanggalLahir(siswa.tanggalLahir === '-' ? '' : siswa.tanggalLahir);
    setSiswaAyah(siswa.namaAyah === '-' ? '' : siswa.namaAyah);
    setSiswaIbu(siswa.namaIbu === '-' ? '' : siswa.namaIbu);
    setSiswaAlamat(siswa.alamat === '-' ? '' : siswa.alamat);
    setSiswaKelas(siswa.kelasId);
    setSiswaJilid(siswa.jilid);
    setSiswaGuru(siswa.guruKode);
  };

  const handleCancelEditSiswa = () => {
    setEditingSiswaId(null);
    setSiswaNama('');
    setSiswaGender('LK');
    setSiswaTempatLahir('');
    setSiswaTanggalLahir('');
    setSiswaAyah('');
    setSiswaIbu('');
    setSiswaAlamat('');
    if (sortedKelasList.length > 0) setSiswaKelas(sortedKelasList[0].id);
    if (guruBTQList.length > 0) setSiswaGuru(guruBTQList[0].kodeGuru);
    setSiswaJilid('1A');
  };

  const startEditGuruBTQ = (g: GuruBTQ) => {
    setEditingGuruBTQId(g.id);
    setGNama(g.namaLengkap);
    setGGender(g.gender);
    setGTempatLahir(g.tempatLahir === '-' ? '' : g.tempatLahir);
    setGTanggalLahir(g.tanggalLahir === '-' ? '' : g.tanggalLahir);
    setGKode(g.kodeGuru);
    setGPassword(g.password || '');
  };

  const handleCancelEditGuruBTQ = () => {
    setEditingGuruBTQId(null);
    setGNama('');
    setGKode('');
    setGPassword('');
    setGTempatLahir('');
    setGTanggalLahir('');
  };

  const startEditGuruBinaan = (gb: GuruBinaan) => {
    setEditingGuruBinaanId(gb.id);
    setGbNama(gb.namaLengkap);
    setGbGender(gb.gender);
    setGbTempatLahir(gb.tempatLahir === '-' ? '' : gb.tempatLahir);
    setGbTanggalLahir(gb.tanggalLahir === '-' ? '' : gb.tanggalLahir);
    setGbKode(gb.kodeGuruBinaan);
    setGbJilid(gb.jilid);
    setGbPembina(gb.guruKodeBTQ);
  };

  const handleCancelEditGuruBinaan = () => {
    setEditingGuruBinaanId(null);
    setGbNama('');
    setGbKode('');
    setGbTempatLahir('');
    setGbTanggalLahir('');
  };

  // 4. Jadwal Shift
  const [shiftNama, setShiftNama] = useState('');
  const [shiftHari, setShiftHari] = useState<string[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
  const [shiftJam, setShiftJam] = useState('14:00 - 15:15');

  // 5. Hari Libur
  const [liburBulan, setLiburBulan] = useState('Juni');
  const [liburTanggal, setLiburTanggal] = useState('');
  const [liburShift, setLiburShift] = useState('semua');
  const [liburKelas, setLiburKelas] = useState('semua');
  const [liburKeterangan, setLiburKeterangan] = useState('');

  // 6. Kelas
  const [kNomor, setKNomor] = useState(7);
  const [kSub, setKSub] = useState('');
  const [kIsAkhir, setKIsAkhir] = useState(false);
  const [kShift, setKShift] = useState('S01');

  // Initialize dropdowns safely
  React.useEffect(() => {
    if (sortedKelasList.length > 0 && !siswaKelas) setSiswaKelas(sortedKelasList[0].id);
    if (guruBTQList.length > 0 && !siswaGuru) setSiswaGuru(guruBTQList[0].kodeGuru);
    if (guruBTQList.length > 0 && !gbPembina) setGbPembina(guruBTQList[0].kodeGuru);
  }, [sortedKelasList, guruBTQList]);

  // Submit Handlers
  const handleAddSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaNama || !siswaKelas || !siswaGuru) {
      alert('Mohon lengkapi isian Nama, Kelas, dan Guru Pembimbing.');
      return;
    }
    const payload = {
      namaLengkap: siswaNama,
      gender: siswaGender,
      tempatLahir: siswaTempatLahir || '-',
      tanggalLahir: siswaTanggalLahir || '-',
      namaAyah: siswaAyah || '-',
      namaIbu: siswaIbu || '-',
      alamat: siswaAlamat || '-',
      kelasId: siswaKelas,
      jilid: siswaJilid,
      guruKode: siswaGuru
    };

    if (editingSiswaId) {
      updateSiswa(editingSiswaId, payload);
      setEditingSiswaId(null);
      alert('Data siswa berhasil diperbarui!');
    } else {
      addSiswa(payload);
      alert('Siswa berhasil didaftarkan!');
    }

    // Clear
    setSiswaNama('');
    setSiswaTempatLahir('');
    setSiswaTanggalLahir('');
    setSiswaAyah('');
    setSiswaIbu('');
    setSiswaAlamat('');
    if (sortedKelasList.length > 0) setSiswaKelas(sortedKelasList[0].id);
    if (guruBTQList.length > 0) setSiswaGuru(guruBTQList[0].kodeGuru);
    setSiswaJilid('1A');
  };

  const handleAddGuruBTQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gNama || !gKode) {
      alert('Mohon lengkapi Nama dan Kode Guru.');
      return;
    }
    const isDup = guruBTQList.some(g => g.id !== editingGuruBTQId && g.kodeGuru.toUpperCase() === gKode.toUpperCase());
    if (isDup) {
      alert('Kode Guru sudah terdaftar!');
      return;
    }

    const payload = {
      namaLengkap: gNama,
      gender: gGender,
      tempatLahir: gTempatLahir || '-',
      tanggalLahir: gTanggalLahir || '-',
      kodeGuru: gKode.toUpperCase(),
      password: gPassword || '123456' // Default if empty
    };

    if (editingGuruBTQId) {
      updateGuruBTQ(editingGuruBTQId, payload);
      setEditingGuruBTQId(null);
      alert('Data Guru BTQ berhasil diperbarui!');
    } else {
      addGuruBTQ(payload);
      alert('Guru BTQ berhasil disimpan!');
    }

    setGNama('');
    setGKode('');
    setGPassword('');
    setGTempatLahir('');
    setGTanggalLahir('');
  };

  const handleAddGuruBinaan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbNama || !gbKode || !gbPembina) {
      alert('Mohon lengkapi Nama, Kode Binaan, dan Pembina.');
      return;
    }

    const isDup = guruBinaanList.some(gb => gb.id !== editingGuruBinaanId && gb.kodeGuruBinaan.toUpperCase() === gbKode.toUpperCase());
    if (isDup) {
      alert('Kode Guru Binaan sudah terdaftar!');
      return;
    }

    const payload = {
      namaLengkap: gbNama,
      gender: gbGender,
      tempatLahir: gbTempatLahir || '-',
      tanggalLahir: gbTanggalLahir || '-',
      kodeGuruBinaan: gbKode.toUpperCase(),
      jilid: gbJilid,
      guruKodeBTQ: gbPembina
    };

    if (editingGuruBinaanId) {
      updateGuruBinaan(editingGuruBinaanId, payload);
      setEditingGuruBinaanId(null);
      alert('Data Guru Binaan berhasil diperbarui!');
    } else {
      addGuruBinaan(payload);
      alert('Guru Binaan berhasil didaftarkan!');
    }

    setGbNama('');
    setGbKode('');
    setGbTempatLahir('');
    setGbTanggalLahir('');
  };

  const handleAddJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    const currentHari = shiftHari || [];
    if (!shiftNama || currentHari.length === 0 || !shiftJam) {
      alert('Silakan lengkapi nama shift, checklist hari, dan jam.');
      return;
    }

    const isDup = jadwalShiftList.some(s => s.id !== editingJadwalShiftId && s.namaShift.toLowerCase() === shiftNama.toLowerCase());
    if (isDup) {
      alert('Nama Shift sudah terdaftar!');
      return;
    }

    const payload = {
      namaShift: shiftNama,
      hari: currentHari,
      jam: shiftJam
    };

    if (editingJadwalShiftId) {
      updateJadwalShift(editingJadwalShiftId, payload);
      setEditingJadwalShiftId(null);
      alert('Shift jadwal berhasil diperbarui!');
    } else {
      addJadwalShift(payload);
      alert('Shift jadwal berhasil ditambahkan!');
    }
    setShiftNama('');
    setShiftHari(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
    setShiftJam('14:00 - 15:15');
  };

  const startEditJadwalShift = (s: JadwalShift) => {
    setEditingJadwalShiftId(s.id);
    setShiftNama(s.namaShift);
    setShiftHari(s.hari || []);
    setShiftJam(s.jam);
    setShowJadwalForm(true);
  };

  const handleCancelEditJadwalShift = () => {
    setEditingJadwalShiftId(null);
    setShiftNama('');
    setShiftHari(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
    setShiftJam('14:00 - 15:15');
  };

  const handleAddLibur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liburTanggal || !liburKeterangan) {
      alert('Lengkapi tanggal dan keterangan libur.');
      return;
    }
    const payload = {
      bulan: liburBulan,
      tanggal: liburTanggal,
      shiftId: liburShift,
      kelasId: liburKelas,
      keterangan: liburKeterangan
    };

    if (editingHariLiburId) {
      updateHariLibur(editingHariLiburId, payload);
      setEditingHariLiburId(null);
      alert('Hari libur berhasil diperbarui!');
    } else {
      addHariLibur(payload);
      alert('Hari libur berhasil dijadwalkan!');
    }
    setLiburTanggal('');
    setLiburKeterangan('');
    setLiburShift('semua');
    setLiburKelas('semua');
  };

  const startEditHariLibur = (h: HariLibur) => {
    setEditingHariLiburId(h.id);
    setLiburBulan(h.bulan);
    setLiburTanggal(h.tanggal);
    setLiburShift(h.shiftId);
    setLiburKelas(h.kelasId);
    setLiburKeterangan(h.keterangan);
    setShowJadwalForm(true);
  };

  const handleCancelEditHariLibur = () => {
    setEditingHariLiburId(null);
    setLiburBulan('Juni');
    setLiburTanggal('');
    setLiburShift('semua');
    setLiburKelas('semua');
    setLiburKeterangan('');
  };

  const handleAddKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kSub) {
      alert('Tulis nama sub kelas / rombel.');
      return;
    }
    const payload = {
      kelas: kNomor,
      subKelas: kSub,
      isKelasAkhir: kIsAkhir,
      shiftId: kShift
    };

    if (editingKelasId) {
      updateKelas(editingKelasId, payload);
      setEditingKelasId(null);
      alert('Kelas berhasil diperbarui!');
    } else {
      addKelas(payload);
      alert('Kelas berhasil ditambahkan!');
    }
    setKSub('');
    setKIsAkhir(false);
    setKShift('S01');
  };

  const startEditKelas = (k: Kelas) => {
    setEditingKelasId(k.id);
    setKNomor(k.kelas);
    setKSub(k.subKelas);
    setKIsAkhir(k.isKelasAkhir);
    setKShift(k.shiftId || 'S01');
    setShowKelasForm(true);
  };

  const handleCancelEditKelas = () => {
    setEditingKelasId(null);
    setKNomor(7);
    setKSub('');
    setKIsAkhir(false);
    setKShift('S01');
  };

  const executeGraduation = () => {
    if (!graduatingSiswaId) return;
    graduatedSiswa(graduatingSiswaId, {
      tanggalLulus: tglLulus,
      statusKhatam: isKhatam,
      tanggalKhatam: isKhatam ? tglLulus : undefined,
      nilaiKhatam: isKhatam ? nilaiKhatam : undefined,
      nomorSertifikat: isKhatam ? nomorSertifikat || `SRT/BTQ/${Date.now().toString().slice(-4)}` : undefined
    });
    setGraduatingSiswaId(null);
    setNomorSertifikat('');
    alert('Siswa berhasil diluluskan dan diarsipkan!');
  };

  // Days options for Shift checklist
  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const toggleDayCheck = (day: string) => {
    const currentHari = shiftHari || [];
    if (currentHari.includes(day)) {
      setShiftHari(currentHari.filter(d => d !== day));
    } else {
      setShiftHari([...currentHari, day]);
    }
  };

  // Helper functions
  const getKelasLabel = (id: string) => {
    const k = kelasList.find(item => item.id === id);
    if (!k) return id;
    let suffix = k.subKelas;
    const prefixStr = k.kelas.toString();
    if (suffix.startsWith(prefixStr)) {
      suffix = suffix.substring(prefixStr.length).replace(/^[\s\-_]+/, '');
    }
    return `${k.kelas}-${suffix}`;
  };
  const getGuruLabel = (kode: string) => guruBTQList.find(g => g.kodeGuru === kode)?.namaLengkap || kode;

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div>
        <h2 className="text-2xl font-bold text-brand-primary font-philosopher">Laman Admin Utama</h2>
        <p className="text-xs text-gray-500">Manajemen master data santri, asatidz, kurikulum jilid Qiroati, rombel kelas, jadwal shift, dan tanggal merah.</p>
      </div>

      {/* Admin Subtabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('siswa')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'siswa' ? 'bg-brand-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Input Data Siswa
        </button>
        <button
          onClick={() => setActiveTab('guru')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'guru' ? 'bg-brand-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Input Guru BTQ
        </button>
        <button
          onClick={() => setActiveTab('g_binaan')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'g_binaan' ? 'bg-brand-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Input Guru Binaan
        </button>
        <button
          onClick={() => setActiveTab('jadwal')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'jadwal' ? 'bg-brand-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Input Jadwal & Libur
        </button>
        <button
          onClick={() => setActiveTab('kelas')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'kelas' ? 'bg-brand-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Input Kelas / Rombel
        </button>
        <button
          onClick={() => setActiveTab('kredensial')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'kredensial' ? 'bg-brand-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Key size={13} /> Kelola Akun Login
          </span>
        </button>
      </div>

      {/* Views */}

      {/* 1. SISWA VIEW */}
      {activeTab === 'siswa' && (() => {
        let sortedAndFilteredSiswa = [...siswaList]
          .filter(s => !s.isLulus)
          .filter(s => s.namaLengkap.toLowerCase().includes(siswaSearchQuery.toLowerCase()))
          .sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap));
          
        // Apply grouping if necessary
        const groupedSiswa: Record<string, typeof sortedAndFilteredSiswa> = {};
        if (siswaGroupBy === 'none') {
          groupedSiswa['Semua Siswa'] = sortedAndFilteredSiswa;
        } else {
          sortedAndFilteredSiswa.forEach(s => {
            let key = '';
            if (siswaGroupBy === 'jilid') key = s.jilid;
            else if (siswaGroupBy === 'kelas') key = kelasList.find(k => k.id === s.kelasId)?.nama || 'Tanpa Kelas';
            else if (siswaGroupBy === 'guru') key = guruBTQList.find(g => g.kode === s.guruKode)?.nama || 'Tanpa Guru';
            
            if (!groupedSiswa[key]) groupedSiswa[key] = [];
            groupedSiswa[key].push(s);
          });
        }

        return (
          <div className="space-y-4">
            {/* Quick Actions / Kenaikan Kelas */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 justify-between items-center animate-none">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
                  <Layers size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Kenaikan Kelas Santri (Awal Juli)</h4>
                  <p className="text-[11px] text-gray-400">Menaikkan tingkat kelas (7 ke 8, 8 ke 9) secara otomatis, dan mengarsipkan data kelas 9.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Password Kenaikan Kelas..."
                    value={promotionPassword}
                    onChange={(e) => setPromotionPassword(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-primary"
                  />
                  <button
                    onClick={() => {
                      if (promotionPassword !== app.promotionPassword) {
                        alert('Password salah!');
                        return;
                      }
                      if (window.confirm('Apakah Anda yakin ingin memproses kenaikan kelas otomatis saat ini? Kelas 7->8, 8->9, dan kelas 9 akan dimasukkan ke arsip kelulusan.')) {
                        runClassPromotionManually();
                        alert('Proses kenaikan kelas berhasil dijalankan!');
                        setPromotionPassword('');
                      }
                    }}
                    className="bg-brand-primary text-white hover:bg-brand-accent px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    Jalankan Kenaikan Kelas
                  </button>
                </div>
                <button
                  onClick={() => setShowSiswaForm(!showSiswaForm)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 justify-center mt-2 sm:mt-0"
                >
                  {showSiswaForm ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showSiswaForm ? 'Sembunyikan Form' : 'Tampilkan Form'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Form */}
              {showSiswaForm && (
                <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 xl:col-span-1 space-y-4">
                  <h3 className="font-bold text-brand-primary text-base flex items-center gap-2">
                    {editingSiswaId ? <Edit2 size={18} /> : <UserPlus size={18} />} 
                    {editingSiswaId ? 'Edit Data Siswa' : 'Registrasi Siswa Baru'}
                  </h3>
                  <form onSubmit={handleAddSiswa} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Faza Mubarak"
                    value={siswaNama}
                    onChange={(e) => setSiswaNama(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Gender</label>
                    <select
                      value={siswaGender}
                      onChange={(e) => setSiswaGender(e.target.value as Gender)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                    >
                      <option value="LK">LK</option>
                      <option value="PR">PR</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Jilid Awal</label>
                    <select
                      value={siswaJilid}
                      onChange={(e) => setSiswaJilid(e.target.value as JilidType)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                    >
                      {ALL_JILIDS.map(j => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tempat Lahir <span className="text-gray-400 font-normal">(opsional)</span></label>
                    <input
                      type="text"
                      placeholder="Cirebon"
                      value={siswaTempatLahir}
                      onChange={(e) => setSiswaTempatLahir(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Lahir <span className="text-gray-400 font-normal">(opsional)</span></label>
                    <input
                      type="date"
                      value={siswaTanggalLahir}
                      onChange={(e) => setSiswaTanggalLahir(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nama Ayah</label>
                    <input
                      type="text"
                      placeholder="Nama Ayah"
                      value={siswaAyah}
                      onChange={(e) => setSiswaAyah(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nama Ibu</label>
                    <input
                      type="text"
                      placeholder="Nama Ibu"
                      value={siswaIbu}
                      onChange={(e) => setSiswaIbu(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Alamat Rumah</label>
                  <textarea
                    placeholder="Jl. Sunan Gunung Jati..."
                    rows={2}
                    value={siswaAlamat}
                    onChange={(e) => setSiswaAlamat(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kelas / Rombel</label>
                    <select
                      value={siswaKelas}
                      onChange={(e) => setSiswaKelas(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                    >
                      {sortedKelasList.map(k => (
                        <option key={k.id} value={k.id}>Kelas {k.kelas} - {k.subKelas}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kode Guru Pembimbing</label>
                    <select
                      value={siswaGuru}
                      onChange={(e) => setSiswaGuru(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                    >
                      {guruBTQList.map(g => (
                        <option key={g.id} value={g.kodeGuru}>{g.kodeGuru} - {g.namaLengkap}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-grow bg-brand-primary hover:bg-brand-accent text-white font-bold p-2.5 rounded-lg text-xs shadow-xs transition"
                  >
                    {editingSiswaId ? 'Update Data' : 'Simpan & Registrasi Santri'}
                  </button>
                  {editingSiswaId && (
                    <button
                      type="button"
                      onClick={handleCancelEditSiswa}
                      className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold px-3 py-2.5 rounded-lg text-xs transition border border-gray-300"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
            )}

            {/* Table */}
            <div className={`bg-white p-6 rounded-xl shadow-xs border border-gray-100 space-y-4 ${showSiswaForm ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-base">Database Siswa Aktif</h3>
                
                {/* Search & Prediction block */}
                <div className="flex gap-2 w-full md:w-auto relative">
                  <select
                    value={siswaGroupBy}
                    onChange={(e) => setSiswaGroupBy(e.target.value as any)}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-brand-primary min-w-[130px]"
                  >
                    <option value="none">Tanpa Grup</option>
                    <option value="jilid">Kelompokkan Jilid</option>
                    <option value="kelas">Kelompokkan Kelas</option>
                    <option value="guru">Kelompokkan Guru</option>
                  </select>

                  <div className="relative w-full md:w-64">
                    <div className="relative flex items-center">
                    <Search className="absolute left-2.5 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="Cari nama & prediksi..."
                      value={siswaSearchQuery}
                      onChange={(e) => {
                        setSiswaSearchQuery(e.target.value);
                        setShowSiswaSuggestions(true);
                      }}
                      onFocus={() => setShowSiswaSuggestions(true)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-8 pr-8 py-1.5 text-xs outline-none focus:border-brand-primary"
                    />
                    {siswaSearchQuery && (
                      <button
                        onClick={() => {
                          setSiswaSearchQuery('');
                          setShowSiswaSuggestions(false);
                        }}
                        className="absolute right-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Autocomplete / Predictive suggestions dropdown */}
                  {showSiswaSuggestions && siswaSearchQuery && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {siswaList
                        .filter(s => !s.isLulus && s.namaLengkap.toLowerCase().includes(siswaSearchQuery.toLowerCase()))
                        .slice(0, 5)
                        .map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSiswaSearchQuery(s.namaLengkap);
                              setShowSiswaSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-brand-primary/10 text-xs text-gray-700 font-medium transition flex justify-between items-center"
                          >
                            <span>{s.namaLengkap}</span>
                            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1 py-0.5 rounded">{getKelasLabel(s.kelasId)}</span>
                          </button>
                        ))}
                      {siswaList.filter(s => !s.isLulus && s.namaLengkap.toLowerCase().includes(siswaSearchQuery.toLowerCase())).length === 0 && (
                        <div className="px-3 py-2 text-xs text-gray-400 italic">Siswa tidak ditemukan</div>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                      <th className="p-3">Nama Lengkap</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Kelas</th>
                      <th className="p-3">Jilid Qiroati</th>
                      <th className="p-3">GURU</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {Object.entries(groupedSiswa).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, groupSiswa]) => (
                      <React.Fragment key={groupName}>
                        {siswaGroupBy !== 'none' && (
                          <tr className="bg-brand-primary/5 border-b border-brand-primary/10">
                            <td colSpan={6} className="p-3 font-bold text-brand-primary">
                              {groupName} ({groupSiswa.length} Siswa)
                            </td>
                          </tr>
                        )}
                        {groupSiswa.map(siswa => (
                          <tr key={siswa.id} className="hover:bg-gray-50/50">
                            <td className="p-3 font-semibold text-gray-800">{siswa.namaLengkap}</td>
                            <td className="p-3">{siswa.gender === 'LK' ? 'LK' : 'PR'}</td>
                            <td className="p-3 font-medium text-brand-accent">{getKelasLabel(siswa.kelasId)}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-primary font-bold rounded">{siswa.jilid}</span>
                            </td>
                            <td className="p-3 font-mono font-medium">{siswa.guruKode}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => startEditSiswa(siswa)}
                                  className="text-brand-primary hover:text-brand-accent p-1 transition"
                                  title="Edit Data"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteSiswa(siswa.id)}
                                  className="text-red-500 hover:text-red-700 p-1 transition"
                                  title="Hapus Data"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {sortedAndFilteredSiswa.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400 italic">Tidak ada data siswa ditemukan</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
        );
      })()}

      {/* 2. GURU BTQ VIEW */}
      {activeTab === 'guru' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Form pendaftaran Guru BTQ dapat disembunyikan untuk memperluas tabel data.</span>
            <button
              onClick={() => setShowGuruForm(!showGuruForm)}
              className="bg-brand-primary text-white hover:bg-brand-accent px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              {showGuruForm ? <EyeOff size={13} /> : <Plus size={13} />}
              {showGuruForm ? 'Sembunyikan Form' : 'Tampilkan Form'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            {showGuruForm && (
              <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 lg:col-span-1 space-y-4">
            <h3 className="font-bold text-brand-primary text-base flex items-center gap-2">
              {editingGuruBTQId ? <Edit2 size={18} /> : <UserPlus size={18} />} 
              {editingGuruBTQId ? 'Edit Data Guru BTQ' : 'Registrasi Guru BTQ Baru'}
            </h3>
            <form onSubmit={handleAddGuruBTQ} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ustadz Yusuf Mansur"
                  value={gNama}
                  onChange={(e) => setGNama(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Gender</label>
                  <select
                    value={gGender}
                    onChange={(e) => setGGender(e.target.value as Gender)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  >
                    <option value="LK">LK</option>
                    <option value="PR">PR</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kode Guru (Unik)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. G05"
                    value={gKode}
                    onChange={(e) => setGKode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none font-mono focus:border-brand-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Password Login</label>
                <input
                  type="text"
                  placeholder="Default: 123456"
                  value={gPassword}
                  onChange={(e) => setGPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tempat Lahir <span className="text-gray-400 font-normal">(opsional)</span></label>
                  <input
                    type="text"
                    placeholder="Cirebon"
                    value={gTempatLahir}
                    onChange={(e) => setGTempatLahir(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Lahir <span className="text-gray-400 font-normal">(opsional)</span></label>
                  <input
                    type="date"
                    value={gTanggalLahir}
                    onChange={(e) => setGTanggalLahir(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-grow bg-brand-primary hover:bg-brand-accent text-white font-bold p-2.5 rounded-lg text-xs shadow-xs transition"
                >
                  {editingGuruBTQId ? 'Update Data' : 'Simpan Data Guru BTQ'}
                </button>
                {editingGuruBTQId && (
                  <button
                    type="button"
                    onClick={handleCancelEditGuruBTQ}
                    className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold px-3 py-2.5 rounded-lg text-xs transition border border-gray-300"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
          )}

          {/* Table */}
          <div className={`bg-white p-6 rounded-xl shadow-xs border border-gray-100 space-y-4 ${showGuruForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <h3 className="font-bold text-gray-800 text-base">Daftar Guru BTQ Terdaftar</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                    <th className="p-3">Kode Guru</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">TTL</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {guruBTQList.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-mono font-bold text-brand-primary">{g.kodeGuru}</td>
                      <td className="p-3 font-semibold text-gray-800">{g.namaLengkap}</td>
                      <td className="p-3">{g.gender === 'LK' ? 'LK' : 'PR'}</td>
                      <td className="p-3">{g.tempatLahir}, {g.tanggalLahir}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => startEditGuruBTQ(g)}
                            className="text-brand-primary hover:text-brand-accent p-1 transition"
                            title="Edit Data"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteGuruBTQ(g.id)}
                            className="text-red-500 hover:text-red-700 p-1 transition"
                            title="Hapus Data"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* 3. GURU BINAAN VIEW */}
      {activeTab === 'g_binaan' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Form pendaftaran Guru Binaan dapat disembunyikan untuk memperluas tabel data.</span>
            <button
              onClick={() => setShowGuruBinaanForm(!showGuruBinaanForm)}
              className="bg-brand-primary text-white hover:bg-brand-accent px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              {showGuruBinaanForm ? <EyeOff size={13} /> : <Plus size={13} />}
              {showGuruBinaanForm ? 'Sembunyikan Form' : 'Tampilkan Form'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            {showGuruBinaanForm && (
              <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 lg:col-span-1 space-y-4">
            <h3 className="font-bold text-brand-primary text-base flex items-center gap-2">
              {editingGuruBinaanId ? <Edit2 size={18} /> : <UserPlus size={18} />} 
              {editingGuruBinaanId ? 'Edit Data Guru Binaan' : 'Registrasi Guru Binaan Baru'}
            </h3>
            <form onSubmit={handleAddGuruBinaan} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ustadzah Annisa"
                  value={gbNama}
                  onChange={(e) => setGbNama(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Gender</label>
                  <select
                    value={gbGender}
                    onChange={(e) => setGbGender(e.target.value as Gender)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  >
                    <option value="LK">LK</option>
                    <option value="PR">PR</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kode Binaan (Unik)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GB04"
                    value={gbKode}
                    onChange={(e) => setGbKode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none font-mono focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Jilid</label>
                  <select
                    value={gbJilid}
                    onChange={(e) => setGbJilid(e.target.value as JilidType)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  >
                    {ALL_JILIDS.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">PEMBINA</label>
                  <select
                    value={gbPembina}
                    onChange={(e) => setGbPembina(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  >
                    {guruBTQList.map(g => (
                      <option key={g.id} value={g.kodeGuru}>{g.kodeGuru} - {g.namaLengkap}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tempat Lahir <span className="text-gray-400 font-normal">(opsional)</span></label>
                  <input
                    type="text"
                    placeholder="Cirebon"
                    value={gbTempatLahir}
                    onChange={(e) => setGbTempatLahir(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Lahir <span className="text-gray-400 font-normal">(opsional)</span></label>
                  <input
                    type="date"
                    value={gbTanggalLahir}
                    onChange={(e) => setGbTanggalLahir(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-grow bg-brand-primary hover:bg-brand-accent text-white font-bold p-2.5 rounded-lg text-xs shadow-xs transition"
                >
                  {editingGuruBinaanId ? 'Update Data' : 'Simpan Guru Binaan'}
                </button>
                {editingGuruBinaanId && (
                  <button
                    type="button"
                    onClick={handleCancelEditGuruBinaan}
                    className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold px-3 py-2.5 rounded-lg text-xs transition border border-gray-300"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
          )}

          {/* Table */}
          <div className={`bg-white p-6 rounded-xl shadow-xs border border-gray-100 space-y-6 ${showGuruBinaanForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-800 text-base">Dashboard Monitoring Guru Binaan</h3>
              <p className="text-xs text-gray-400">Data terdistribusi per jilid, dan guru BTQ pengampu binaan (Laman PJ memiliki data sinkron ini).</p>
            </div>

            {/* List breakdown */}
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                      <th className="p-3">Kode Binaan</th>
                      <th className="p-3">Nama Guru Binaan</th>
                      <th className="p-3">Jilid</th>
                      <th className="p-3">PEMBINA</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {guruBinaanList.map(gb => (
                      <tr key={gb.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-mono font-bold text-brand-primary">{gb.kodeGuruBinaan}</td>
                        <td className="p-3 font-semibold text-gray-800">{gb.namaLengkap}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-primary rounded font-bold">{gb.jilid}</span>
                        </td>
                        <td className="p-3 font-medium text-gray-700">{getGuruLabel(gb.guruKodeBTQ)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEditGuruBinaan(gb)}
                              className="text-brand-primary hover:text-brand-accent p-1 transition"
                              title="Edit Data"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteGuruBinaan(gb.id)}
                              className="text-red-500 hover:text-red-700 p-1 transition"
                              title="Hapus Data"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* 4. JADWAL VIEW */}
      {activeTab === 'jadwal' && (
        <div className="space-y-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSubJadwalTab('shift')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
                subJadwalTab === 'shift' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'
              }`}
            >
              1. Input Jadwal & Shift
            </button>
            <button
              onClick={() => setSubJadwalTab('libur')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
                subJadwalTab === 'libur' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500'
              }`}
            >
              2. Input Hari Libur & Tanggal Merah
            </button>
          </div>

          {subJadwalTab === 'shift' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium">Form pendaftaran Shift dapat disembunyikan untuk memperluas tabel data.</span>
                <button
                  onClick={() => setShowJadwalForm(!showJadwalForm)}
                  className="bg-brand-primary text-white hover:bg-brand-accent px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  {showJadwalForm ? <EyeOff size={13} /> : <Plus size={13} />}
                  {showJadwalForm ? 'Sembunyikan Form' : 'Tampilkan Form'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                {showJadwalForm && (
                  <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-brand-primary text-base flex items-center gap-2">
                      <Clock size={18} /> {editingJadwalShiftId ? 'Edit Jadwal & Shift' : 'Simpan Jadwal & Shift'}
                    </h3>
                    <form onSubmit={handleAddJadwal} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nama Shift</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shift Sore (Intensif)"
                      value={shiftNama}
                      onChange={(e) => setShiftNama(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Jam Efektif</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15:45 - 17:00"
                      value={shiftJam}
                      onChange={(e) => setShiftJam(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Hari Aktif</span>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDayCheck(day)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            (shiftHari || []).includes(day)
                              ? 'bg-brand-primary text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={(shiftHari || []).includes(day)}
                            readOnly
                            className="rounded text-brand-primary accent-brand-gold h-3 w-3"
                          />
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-brand-accent text-white font-bold p-2.5 rounded-lg text-xs shadow-xs transition mt-2"
                  >
                    {editingJadwalShiftId ? 'Update Jadwal Shift' : 'Simpan Jadwal Shift'}
                  </button>

                  {editingJadwalShiftId && (
                    <button
                      type="button"
                      onClick={handleCancelEditJadwalShift}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold p-2.5 rounded-lg text-xs transition mt-2"
                    >
                      Batal Edit
                    </button>
                  )}
                </form>
              </div>
              )}

              {/* Table */}
              <div className={`bg-white p-6 rounded-xl shadow-xs border border-gray-100 space-y-4 ${showJadwalForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <h3 className="font-bold text-gray-800 text-base">Jadwal Shift Sekolah</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                        <th className="p-3">Nama Shift</th>
                        <th className="p-3">Hari</th>
                        <th className="p-3">Jam Kerja</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {jadwalShiftList.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-bold text-gray-800">{s.namaShift}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {s.hari.map(h => (
                                <span key={h} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">{h}</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-brand-primary font-bold">{s.jam}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => startEditJadwalShift(s)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Edit"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => deleteJadwalShift(s.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Hapus"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            </div>
          )}

          {subJadwalTab === 'libur' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium">Form pendaftaran Hari Libur dapat disembunyikan untuk memperluas tabel data.</span>
                <button
                  onClick={() => setShowJadwalForm(!showJadwalForm)}
                  className="bg-brand-primary text-white hover:bg-brand-accent px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  {showJadwalForm ? <EyeOff size={13} /> : <Plus size={13} />}
                  {showJadwalForm ? 'Sembunyikan Form' : 'Tampilkan Form'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                {showJadwalForm && (
                  <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-brand-primary text-base flex items-center gap-2">
                      <Calendar size={18} /> {editingHariLiburId ? 'Edit Hari Libur' : 'Plot Hari Libur Baru'}
                    </h3>
                    <form onSubmit={handleAddLibur} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Bulan</label>
                      <select
                        value={liburBulan}
                        onChange={(e) => setLiburBulan(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      >
                        {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal</label>
                      <input
                        type="date"
                        required
                        value={liburTanggal}
                        onChange={(e) => setLiburTanggal(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Libur Shift</label>
                      <select
                        value={liburShift}
                        onChange={(e) => setLiburShift(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      >
                        <option value="semua">Semua Shift</option>
                        {jadwalShiftList.map(s => (
                          <option key={s.id} value={s.id}>{s.namaShift}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Libur Kelas</label>
                      <select
                        value={liburKelas}
                        onChange={(e) => setLiburKelas(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      >
                        <option value="semua">Semua Kelas</option>
                        {sortedKelasList.map(k => (
                          <option key={k.id} value={k.id}>Kelas {k.kelas} - {k.subKelas}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Keterangan Hari Libur</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hari Lahir Pancasila"
                      value={liburKeterangan}
                      onChange={(e) => setLiburKeterangan(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-brand-accent text-white font-bold p-2.5 rounded-lg text-xs shadow-xs transition mt-2"
                  >
                    {editingHariLiburId ? 'Update Hari Libur' : 'Simpan Hari Libur'}
                  </button>

                  {editingHariLiburId && (
                    <button
                      type="button"
                      onClick={handleCancelEditHariLibur}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold p-2.5 rounded-lg text-xs transition mt-2"
                    >
                      Batal Edit
                    </button>
                  )}
                </form>
              </div>
              )}

              {/* Table */}
              <div className={`bg-white p-6 rounded-xl shadow-xs border border-gray-100 space-y-4 ${showJadwalForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <h3 className="font-bold text-gray-800 text-base">Kalender Tanggal Merah & Libur Sekolah</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Keterangan</th>
                        <th className="p-3">Bulan</th>
                        <th className="p-3">Kriteria Shift</th>
                        <th className="p-3">Kriteria Kelas</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {hariLiburList.map(h => (
                        <tr key={h.id} className="hover:bg-gray-50/50 text-red-700 bg-red-50/30">
                          <td className="p-3 font-mono font-bold">{h.tanggal}</td>
                          <td className="p-3 font-semibold">{h.keterangan}</td>
                          <td className="p-3">{h.bulan}</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 font-bold">
                              {h.shiftId === 'semua' ? 'Semua Shift' : (jadwalShiftList.find(s => s.id === h.shiftId)?.namaShift || h.shiftId)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 font-bold">
                              {h.kelasId === 'semua' ? 'Semua Kelas' : (kelasList.find(k => k.id === h.kelasId)?.subKelas || h.kelasId)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => startEditHariLibur(h)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Edit"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => deleteHariLibur(h.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Hapus"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      )}

      {/* 5. KELAS VIEW */}
      {activeTab === 'kelas' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Form pendaftaran Rombel Kelas dapat disembunyikan untuk memperluas tabel data.</span>
            <button
              onClick={() => setShowKelasForm(!showKelasForm)}
              className="bg-brand-primary text-white hover:bg-brand-accent px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              {showKelasForm ? <EyeOff size={13} /> : <Plus size={13} />}
              {showKelasForm ? 'Sembunyikan Form' : 'Tampilkan Form'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            {showKelasForm && (
              <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 lg:col-span-1 space-y-4">
            <h3 className="font-bold text-brand-primary text-base flex items-center gap-2">
              <Layers size={18} /> {editingKelasId ? 'Edit Rombel Kelas' : 'Registrasi Rombel Kelas'}
            </h3>
            <form onSubmit={handleAddKelas} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Kelas (Angka)</label>
                <select
                  value={kNomor}
                  onChange={(e) => setKNomor(parseInt(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                >
                  <option value={7}>Kelas 7</option>
                  <option value={8}>Kelas 8</option>
                  <option value={9}>Kelas 9</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nama Sub Kelas / Rombel</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7 Abu Bakar"
                  value={kSub}
                  onChange={(e) => setKSub(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Shift Pendukung</label>
                <select
                  value={kShift}
                  onChange={(e) => setKShift(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                >
                  {jadwalShiftList.map(s => (
                    <option key={s.id} value={s.id}>{s.namaShift} ({s.jam})</option>
                  ))}
                </select>
              </div>

              <div className="bg-brand-primary/5 p-3 rounded-lg border border-brand-primary/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-primary block">Tandai Kelas Akhir?</span>
                  <span className="text-[10px] text-gray-500 block">Menentukan kelas kelulusan sebelum diarsipkan (e.g., Kelas 9 di SMP).</span>
                </div>
                <input
                  type="checkbox"
                  checked={kIsAkhir}
                  onChange={(e) => setKIsAkhir(e.target.checked)}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-accent text-white font-bold p-2.5 rounded-lg text-xs shadow-xs transition mt-2"
              >
                {editingKelasId ? 'Update Data Kelas' : 'Simpan Data Kelas'}
              </button>

              {editingKelasId && (
                <button
                  type="button"
                  onClick={handleCancelEditKelas}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold p-2.5 rounded-lg text-xs transition mt-2"
                >
                  Batal Edit
                </button>
              )}
            </form>
          </div>
          )}

          {/* Table */}
          <div className={`bg-white p-6 rounded-xl shadow-xs border border-gray-100 space-y-4 ${showKelasForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <h3 className="font-bold text-gray-800 text-base">Rombel Kelas Terdaftar</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Shift Pendukung</th>
                    <th className="p-3">Kategori Kelulusan</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedKelasList.map(k => (
                    <tr key={k.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-semibold text-brand-primary">Kelas {k.kelas} - {k.subKelas}</td>
                      <td className="p-3 font-medium text-gray-700">
                        {jadwalShiftList.find(s => s.id === k.shiftId)?.namaShift || 'Belum diatur'}
                      </td>
                      <td className="p-3">
                        {k.isKelasAkhir ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-gold/20 text-brand-primary font-bold rounded-full text-[10px]">
                            <GraduationCap size={12} /> Kelas Akhir (Kelulusan)
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEditKelas(k)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => deleteKelas(k.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* 6. KREDENSIAL VIEW */}
      {activeTab === 'kredensial' && (
        <div className="space-y-4">
          <div className="bg-brand-primary/5 p-5 rounded-xl border border-brand-primary/10">
            <h3 className="font-bold text-brand-primary text-base flex items-center gap-2 font-philosopher">
              <Key size={20} /> Manajemen Kredensial Pengguna
            </h3>
            <p className="text-xs text-gray-600 mt-1">Sebagai Administrator, Anda memiliki wewenang penuh untuk mengatur username dan kata sandi/PIN untuk masing-masing peran pengguna di bawah ini demi keamanan sistem.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CredentialsCard role="admin" label="Administrator" colorClass="bg-red-50 text-red-700 border border-red-100" />
            <CredentialsCard role="pj" label="PJ Qiroati" colorClass="bg-brand-primary/10 text-brand-primary border border-brand-primary/20" />
            <CredentialsCard role="bendahara" label="Bendahara" colorClass="bg-amber-50 text-amber-700 border border-amber-100" />
            <CredentialsCard role="guru" label="Guru BTQ / Pengampu" colorClass="bg-emerald-50 text-emerald-700 border border-emerald-100" />
          </div>
        </div>
      )}

      {/* Graduation Trigger Modal Dialog backdrop */}
      {graduatingSiswaId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden">
            <div className="bg-brand-primary p-4 text-white text-center">
              <GraduationCap className="mx-auto mb-1" size={32} />
              <h4 className="font-philosopher text-lg font-bold">Proses Kelulusan Siswa</h4>
              <p className="text-[10px] text-white/85">Meluluskan "{siswaList.find(s => s.id === graduatingSiswaId)?.namaLengkap}" dari BTQ Digital</p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tanggal Kelulusan</label>
                <input
                  type="date"
                  value={tglLulus}
                  onChange={(e) => setTglLulus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <span className="text-xs font-bold text-gray-700 block">Siswa Khatam Al-Qur'an?</span>
                  <span className="text-[10px] text-gray-500">Menerbitkan syahadah resmi untuk siswa bersangkutan.</span>
                </div>
                <input
                  type="checkbox"
                  checked={isKhatam}
                  onChange={(e) => setIsKhatam(e.target.checked)}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded cursor-pointer"
                />
              </div>

              {isKhatam && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nilai Munaqosah</label>
                    <input
                      type="text"
                      value={nilaiKhatam}
                      onChange={(e) => setNilaiKhatam(e.target.value)}
                      placeholder="92 (A)"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">No. Sertifikat/Syahadah</label>
                    <input
                      type="text"
                      value={nomorSertifikat}
                      onChange={(e) => setNomorSertifikat(e.target.value)}
                      placeholder="SRT/BTQ/2026/089"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-2 justify-end">
              <button
                onClick={() => setGraduatingSiswaId(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-bold text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={executeGraduation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold text-white shadow-xs"
              >
                Proses & Luluskan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
