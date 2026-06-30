import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { syncToFirestore, deleteFromFirestore, isCollectionEmpty, bulkSyncToFirestore } from '../lib/db';
import {
  Siswa,
  GuruBTQ,
  GuruBinaan,
  JadwalShift,
  HariLibur,
  Kelas,
  CapaianCapaian,
  CapaianHarian,
  PindahSementara,
  PengajuanTes,
  StokJilid,
  TransaksiKeuangan,
  ActiveRole,
  JilidType,
  UserCredentials
} from '../types';

interface AppContextProps {
  siswaList: Siswa[];
  guruBTQList: GuruBTQ[];
  guruBinaanList: GuruBinaan[];
  jadwalShiftList: JadwalShift[];
  hariLiburList: HariLibur[];
  kelasList: Kelas[];
  capaianHarianList: CapaianHarian[];
  pindahSementaraList: PindahSementara[];
  pengajuanTesList: PengajuanTes[];
  stokJilidList: StokJilid[];
  transaksiKeuanganList: TransaksiKeuangan[];
  
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  activeUserKode: string;
  setActiveUserKode: (kode: string) => void;

  userCredentialsList: UserCredentials[];
  loggedInRoles: Record<'pj' | 'admin' | 'bendahara' | 'guru', boolean>;
  updateCredentials: (role: 'pj' | 'admin' | 'bendahara' | 'guru', username: string, password?: string) => void;
  login: (role: 'pj' | 'admin' | 'bendahara' | 'guru', username: string, password?: string) => boolean;
  logout: (role: 'pj' | 'admin' | 'bendahara' | 'guru') => void;


  // Mutation functions
  addSiswa: (siswa: Omit<Siswa, 'id' | 'isLulus'>) => void;
  updateSiswa: (id: string, updates: Partial<Siswa>) => void;
  deleteSiswa: (id: string) => void;
  graduatedSiswa: (id: string, details: { tanggalLulus: string; statusKhatam?: boolean; tanggalKhatam?: string; nilaiKhatam?: string; nomorSertifikat?: string }) => void;

  addGuruBTQ: (guru: Omit<GuruBTQ, 'id'>) => void;
  updateGuruBTQ: (id: string, updates: Partial<GuruBTQ>) => void;
  deleteGuruBTQ: (id: string) => void;

  addGuruBinaan: (guru: Omit<GuruBinaan, 'id'>) => void;
  updateGuruBinaan: (id: string, updates: Partial<GuruBinaan>) => void;
  deleteGuruBinaan: (id: string) => void;

  addJadwalShift: (shift: Omit<JadwalShift, 'id'>) => void;
  updateJadwalShift: (id: string, updates: Partial<JadwalShift>) => void;
  deleteJadwalShift: (id: string) => void;

  addHariLibur: (libur: Omit<HariLibur, 'id'>) => void;
  updateHariLibur: (id: string, updates: Partial<HariLibur>) => void;
  deleteHariLibur: (id: string) => void;

  addKelas: (kelas: Omit<Kelas, 'id'>) => void;
  updateKelas: (id: string, updates: Partial<Kelas>) => void;
  deleteKelas: (id: string) => void;

  saveKehadiranAndCapaian: (records: Omit<CapaianHarian, 'id'>[]) => void;
  
  addPindahSementara: (pindah: Omit<PindahSementara, 'id' | 'timestamp'>) => void;
  clearPindahSementara: (id: string) => void;

  ajukanTes: (siswaId: string, jilidAsal: JilidType, jilidTujuan: JilidType, keteranganTasmi?: string) => void;
  verifikasiTes: (id: string, status: 'Disetujui' | 'Ditolak', diujiOleh: string, catatan: string) => void;

  updateStokJilid: (jilid: JilidType, jumlah: number, isSet?: boolean) => void;
  
  addTransaksi: (transaksi: Omit<TransaksiKeuangan, 'id'>) => void;
  updateTransaksiStatus: (id: string, status: 'Lunas' | 'Belum Lunas') => void;
  deleteTransaksi: (id: string) => void;

  resetToDefault: () => void;
  runClassPromotionManually: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const defaultCredentials: UserCredentials[] = [
  { role: 'pj', username: 'pj', password: 'pj' },
  { role: 'admin', username: 'admin', password: 'admin' },
  { role: 'admin', username: 'demo', password: 'demo' },
  { role: 'bendahara', username: 'bendahara', password: 'bendahara' },
  { role: 'guru', username: 'guru', password: 'guru' }
];

// Define default lists
export const defaultKelas: Kelas[] = [
  { id: 'K7A', kelas: 7, subKelas: '7 Abu Bakar', isKelasAkhir: false, shiftId: 'S01' },
  { id: 'K7B', kelas: 7, subKelas: '7 Umar', isKelasAkhir: false, shiftId: 'S02' },
  { id: 'K8A', kelas: 8, subKelas: '8 Utsman', isKelasAkhir: false, shiftId: 'S01' },
  { id: 'K8B', kelas: 8, subKelas: '8 Ali', isKelasAkhir: false, shiftId: 'S02' },
  { id: 'K9A', kelas: 9, subKelas: '9 Bilal (Sembilan A)', isKelasAkhir: true, shiftId: 'S03' },
  { id: 'K9B', kelas: 9, subKelas: '9 Khalid (Sembilan B)', isKelasAkhir: true, shiftId: 'S03' }
];

export const defaultGuruBTQ: GuruBTQ[] = [
  { id: 'G01', namaLengkap: 'Ustadz H. Ahmad Sobari', gender: 'LK', tempatLahir: 'Cirebon', tanggalLahir: '1980-05-12', kodeGuru: 'G01' },
  { id: 'G02', namaLengkap: 'Ustadzah Siti Khadijah', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '1985-08-20', kodeGuru: 'G02' },
  { id: 'G03', namaLengkap: 'Ustadz Yahya Muhaimin', gender: 'LK', tempatLahir: 'Indramayu', tanggalLahir: '1991-03-15', kodeGuru: 'G03' },
  { id: 'G04', namaLengkap: 'Ustadzah Nur Layla', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '1994-11-04', kodeGuru: 'G04' }
];

export const defaultGuruBinaan: GuruBinaan[] = [
  { id: 'GB01', namaLengkap: 'Ustadzah Annisa Fitri', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '1998-02-14', kodeGuruBinaan: 'GB01', jilid: '1A', guruKodeBTQ: 'G01' },
  { id: 'GB02', namaLengkap: 'Ustadz Wildan Syah', gender: 'LK', tempatLahir: 'Kuningan', tanggalLahir: '1999-07-22', kodeGuruBinaan: 'GB02', jilid: '2A', guruKodeBTQ: 'G02' },
  { id: 'GB03', namaLengkap: 'Ustadzah Fatimah Azzahra', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '1997-12-01', kodeGuruBinaan: 'GB03', jilid: '3A', guruKodeBTQ: 'G03' }
];

export const defaultJadwalShift: JadwalShift[] = [
  { id: 'S01', namaShift: 'Shift Pagi (Utama)', hari: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'], jam: '07:00 - 08:15' },
  { id: 'S02', namaShift: 'Shift Siang (Tambahan)', hari: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'], jam: '13:00 - 14:15' },
  { id: 'S03', namaShift: 'Shift Sore (Intensif)', hari: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'], jam: '15:45 - 17:00' }
];

export const defaultHariLibur: HariLibur[] = [
  { id: 'H01', bulan: 'Mei', tanggal: '2026-05-01', shiftId: 'semua', kelasId: 'semua', keterangan: 'Hari Buruh Internasional' },
  { id: 'H02', bulan: 'Mei', tanggal: '2026-05-14', shiftId: 'semua', kelasId: 'semua', keterangan: 'Kenaikan Isa Almasih' },
  { id: 'H03', bulan: 'Juni', tanggal: '2026-06-01', shiftId: 'semua', kelasId: 'semua', keterangan: 'Hari Lahir Pancasila' },
  { id: 'H04', bulan: 'Juni', tanggal: '2026-06-15', shiftId: 'semua', kelasId: 'semua', keterangan: 'Tahun Baru Islam 1448 H' },
  { id: 'H05', bulan: 'Juni', tanggal: '2026-06-25', shiftId: 'S03', kelasId: 'semua', keterangan: 'Rapat Persiapan Ujian Akhir (Shift Sore Libur)' }
];

export const defaultStokJilid: StokJilid[] = [
  { jilid: '1A', stok: 45, harga: 15000 },
  { jilid: '1B', stok: 40, harga: 15000 },
  { jilid: '2A', stok: 35, harga: 15000 },
  { jilid: '2B', stok: 32, harga: 15000 },
  { jilid: '3A', stok: 28, harga: 17500 },
  { jilid: '3B', stok: 30, harga: 17500 },
  { jilid: '4A', stok: 22, harga: 17500 },
  { jilid: '4B', stok: 25, harga: 17500 },
  { jilid: 'Juz 27', stok: 18, harga: 20000 },
  { jilid: 'Qur\'an', stok: 50, harga: 25000 },
  { jilid: 'Ghorib', stok: 24, harga: 20000 },
  { jilid: 'Tajwid', stok: 30, harga: 20000 },
  { jilid: 'Finishing', stok: 15, harga: 20000 },
  { jilid: 'Tahfidz', stok: 20, harga: 20000 }
];

export const defaultSiswa: Siswa[] = [
  { id: 'S01', namaLengkap: 'Ahmad Fauzi', gender: 'LK', tempatLahir: 'Cirebon', tanggalLahir: '2012-04-12', namaAyah: 'Sutisna', namaIbu: 'Siti Aminah', alamat: 'Jl. Tuparev No. 12, Kedawung, Cirebon', kelasId: 'K7A', jilid: '1B', guruKode: 'G01', isLulus: false },
  { id: 'S02', namaLengkap: 'Siti Aminah', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '2012-08-22', namaAyah: 'Mulyadi', namaIbu: 'Halimah', alamat: 'Jl. Kartini No. 45, Kejaksan, Cirebon', kelasId: 'K7A', jilid: '1B', guruKode: 'G01', isLulus: false },
  { id: 'S03', namaLengkap: 'Fathir Muhammad', gender: 'LK', tempatLahir: 'Cirebon', tanggalLahir: '2012-01-05', namaAyah: 'Lukman Hakim', namaIbu: 'Siti Sarah', alamat: 'Jl. Siliwangi No. 8, Kejaksan, Cirebon', kelasId: 'K7B', jilid: '2A', guruKode: 'G02', isLulus: false },
  { id: 'S04', namaLengkap: 'Rizky Ramadhan', gender: 'LK', tempatLahir: 'Cirebon', tanggalLahir: '2011-09-15', namaAyah: 'Yusuf', namaIbu: 'Aisyah', alamat: 'Jl. Pemuda No. 19, Kesambi, Cirebon', kelasId: 'K8A', jilid: 'Juz 27', guruKode: 'G03', isLulus: false },
  { id: 'S05', namaLengkap: 'Naila Putri Salsabila', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '2011-10-10', namaAyah: 'Budi Hartono', namaIbu: 'Rahmawati', alamat: 'Jl. Kesambi No. 102, Kesambi, Cirebon', kelasId: 'K8A', jilid: 'Juz 27', guruKode: 'G03', isLulus: false },
  { id: 'S06', namaLengkap: 'Zulfa Kamila', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '2011-03-24', namaAyah: 'Hasan Basri', namaIbu: 'Fatimah', alamat: 'Jl. Dr. Wahidin No. 34, Kejaksan, Cirebon', kelasId: 'K8B', jilid: 'Qur\'an', guruKode: 'G02', isLulus: false },
  { id: 'S07', namaLengkap: 'Yusuf Mahendra', gender: 'LK', tempatLahir: 'Cirebon', tanggalLahir: '2010-06-18', namaAyah: 'Faisal', namaIbu: 'Nuraeni', alamat: 'Jl. Cipto Mangunkusumo No. 5, Cirebon', kelasId: 'K9A', jilid: 'Ghorib', guruKode: 'G01', isLulus: false },
  { id: 'S08', namaLengkap: 'Sania Rahma', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '2010-07-30', namaAyah: 'Toto Mulyanto', namaIbu: 'Leni Marlina', alamat: 'Jl. Sudirman No. 70, Harjamukti, Cirebon', kelasId: 'K9A', jilid: 'Ghorib', guruKode: 'G01', isLulus: false },
  { id: 'S09', namaLengkap: 'Bagas Saputra', gender: 'LK', tempatLahir: 'Cirebon', tanggalLahir: '2011-11-12', namaAyah: 'Rudi', namaIbu: 'Evi', alamat: 'Jl. Perjuangan No. 11, Karyamulya, Cirebon', kelasId: 'K8B', jilid: 'Tajwid', guruKode: 'G04', isLulus: false },
  { id: 'S10', namaLengkap: 'Alya Syifa', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '2011-12-05', namaAyah: 'Iwan', namaIbu: 'Tini', alamat: 'Jl. Evakuasi No. 22, Karyamulya, Cirebon', kelasId: 'K8B', jilid: 'Tajwid', guruKode: 'G04', isLulus: false },
  { id: 'S11', namaLengkap: 'Muhammad Farhan', gender: 'LK', tempatLahir: 'Cirebon', tanggalLahir: '2010-02-14', namaAyah: 'Zainuddin', namaIbu: 'Maryam', alamat: 'Jl. Majasem No. 3, Karyamulya, Cirebon', kelasId: 'K9B', jilid: 'Finishing', guruKode: 'G02', isLulus: false },
  { id: 'S12', namaLengkap: 'Keysha Kirana', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '2010-05-20', namaAyah: 'Heri', namaIbu: 'Dewi', alamat: 'Jl. Rajawali No. 14, Harjamukti, Cirebon', kelasId: 'K9B', jilid: 'Finishing', guruKode: 'G02', isLulus: false },
  { id: 'S13', namaLengkap: 'Aditya Pratama', gender: 'LK', tempatLahir: 'Cirebon', tanggalLahir: '2012-10-18', namaAyah: 'Anwar', namaIbu: 'Rina', alamat: 'Jl. Wahid Hasyim No. 56, Cirebon', kelasId: 'K7B', jilid: 'Tahfidz', guruKode: 'G03', isLulus: false },
  { id: 'S14', namaLengkap: 'Putri Salma', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '2011-04-12', namaAyah: 'Karim', namaIbu: 'Wati', alamat: 'Jl. Diponegoro No. 89, Cirebon', kelasId: 'K8A', jilid: '3B', guruKode: 'G04', isLulus: false },
  
  // Graduated (Arsip)
  { id: 'S15', namaLengkap: 'Farhan Alamsyah', gender: 'LK', tempatLahir: 'Cirebon', tanggalLahir: '2009-08-11', namaAyah: 'Cecep', namaIbu: 'Dian', alamat: 'Jl. Tuparev No. 100, Cirebon', kelasId: 'K9A', jilid: 'Finishing', guruKode: 'G01', isLulus: true, tanggalLulus: '2025-06-15', statusKhatam: true, tanggalKhatam: '2025-05-10', nilaiKhatam: '92 (A)', nomorSertifikat: 'SRT/BTQ/2025/089' },
  { id: 'S16', namaLengkap: 'Safira Amalia', gender: 'PR', tempatLahir: 'Cirebon', tanggalLahir: '2009-12-01', namaAyah: 'Agus', namaIbu: 'Indah', alamat: 'Jl. Kartini No. 12, Cirebon', kelasId: 'K9B', jilid: 'Finishing', guruKode: 'G02', isLulus: true, tanggalLulus: '2025-06-15', statusKhatam: true, tanggalKhatam: '2025-05-12', nilaiKhatam: '94 (A)', nomorSertifikat: 'SRT/BTQ/2025/090' }
];

export const defaultPengajuanTes: PengajuanTes[] = [
  { id: 'T01', siswaId: 'S03', jilidAsal: '2A', jilidTujuan: '2B', tanggalPengajuan: '2026-06-27', status: 'Pending' },
  { id: 'T02', siswaId: 'S14', jilidAsal: '3B', jilidTujuan: '4A', tanggalPengajuan: '2026-06-28', status: 'Pending' },
  { id: 'T03', siswaId: 'S01', jilidAsal: '1A', jilidTujuan: '1B', tanggalPengajuan: '2026-06-25', status: 'Disetujui', diujiOleh: 'PJ - Ustadz Ahmad Sobari', tanggalUji: '2026-06-26', catatan: 'Alhamdulillah lancar, makhraj fasih, jilid naik ke 1B.' }
];

export const defaultTransaksi: TransaksiKeuangan[] = [
  { id: 'TR01', siswaId: 'S01', jenis: 'Syahriah', jumlah: 50000, tanggal: '2026-06-05', status: 'Lunas', keterangan: 'Iuran Syahriah BTQ Juni 2026' },
  { id: 'TR02', siswaId: 'S02', jenis: 'Pembelian Jilid', jumlah: 15000, tanggal: '2026-06-06', status: 'Lunas', keterangan: 'Pembelian Buku Qiroati Jilid 1B' },
  { id: 'TR03', siswaId: 'S04', jenis: 'Syahriah', jumlah: 50000, tanggal: '2026-06-10', status: 'Lunas', keterangan: 'Iuran Syahriah BTQ Juni 2026' },
  { id: 'TR04', siswaId: 'S07', jenis: 'Pembelian Jilid', jumlah: 20000, tanggal: '2026-06-11', status: 'Lunas', keterangan: 'Pembelian Buku Qiroati Ghorib' },
  { id: 'TR05', siswaId: 'S08', jenis: 'Syahriah', jumlah: 50000, tanggal: '2026-06-12', status: 'Belum Lunas', keterangan: 'Iuran Syahriah BTQ Juni 2026' }
];

// Helper to generate realistic CapaianHarian logs for the past 2 months (May and June 2026)
// while adhering to the user's specific rules:
// - Juz 27, Ghorib, Tajwid, Finishing groups have matching daily progress.
// - Excluding weekends
export function generateHistoricalLogs(siswas: Siswa[]): CapaianHarian[] {
  const logs: CapaianHarian[] = [];
  const activeSiswa = siswas.filter(s => !s.isLulus);
  
  // Set start to 2026-05-01 and end to 2026-06-28
  const startDate = new Date('2026-05-01');
  const endDate = new Date('2026-06-28');
  
  // Track group progress so that matching group levels keep synchronized daily progress!
  // key: groupName_jilid_guru => current value
  const groupProgress: Record<string, number> = {};

  // For Juz 27
  const juz27Suras = ['An-Naba', 'An-Naziat', 'Abasa', 'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq'];
  
  // Loop days
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip Sat & Sun
    
    const dateStr = d.toISOString().split('T')[0];
    
    // Check if it's a known global holiday (excluding shift-specific/class-specific ones for general logs)
    const isHoliday = defaultHariLibur.some(h => h.tanggal === dateStr && h.shiftId === 'semua' && h.kelasId === 'semua');
    if (isHoliday) continue;
    
    // Process each student
    activeSiswa.forEach(siswa => {
      // Deterministic pseudo-random seed based on student name and date
      const hashStr = `${siswa.id}-${dateStr}`;
      let hash = 0;
      for (let i = 0; i < hashStr.length; i++) {
        hash = hashStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      const rand = Math.abs(Math.sin(hash)); // value between 0 and 1
      
      // Kehadiran probabilities: 90% Hadir, 6% Izin, 3% Sakit, 1% Alpha
      let kehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' = 'Hadir';
      if (rand > 0.90 && rand <= 0.96) kehadiran = 'Izin';
      else if (rand > 0.96 && rand <= 0.99) kehadiran = 'Sakit';
      else if (rand > 0.99) kehadiran = 'Alpha';
      
      // Determine student group key for synchronization
      // "siswa jilid Juz 27 pada kelompok yang sama capaian hariannya sama, begitupun dengan Ghorib, Tajwid dan Finishing masing-masing"
      const isGroupSyncJilid = ['Juz 27', 'Ghorib', 'Tajwid', 'Finishing'].includes(siswa.jilid);
      const groupKey = isGroupSyncJilid ? `${siswa.jilid}_${siswa.guruKode}` : `${siswa.id}`;
      
      // Initialize progress index for this group if empty
      if (groupProgress[groupKey] === undefined) {
        groupProgress[groupKey] = 1;
      }
      
      // Only increment progress if student is Hadir
      // For sync groups, any active attendance of group members would slowly increment the progress index.
      // Let's increment it on certain days.
      const shouldIncrement = kehadiran === 'Hadir' && (hash % 5 > 1); // increment on ~60% of present days
      if (shouldIncrement) {
        groupProgress[groupKey] += 1;
      }
      
      const currentProg = groupProgress[groupKey];
      const capaian: CapaianCapaian = {};
      
      // Build progress data based on JilidType
      if (siswa.jilid === '1A' || siswa.jilid === '1B' || siswa.jilid === '2A' || siswa.jilid === '2B' || 
          siswa.jilid === '3A' || siswa.jilid === '3B' || siswa.jilid === '4A' || siswa.jilid === '4B') {
        const pageNum = (currentProg % 35) + 1;
        capaian.hal = pageNum.toString();
      } 
      else if (siswa.jilid === 'Juz 27') {
        // Juz 27 displays Surat and Ayat
        const suraIndex = Math.floor(currentProg / 10) % juz27Suras.length;
        const ayatNum = (currentProg % 15) + 1;
        capaian.surat = juz27Suras[suraIndex];
        capaian.ayat = ayatNum.toString();
      } 
      else if (siswa.jilid === 'Qur\'an') {
        // Al-Qur'an displays Juz, Surat, Ayat
        const juzNum = (Math.floor(currentProg / 30) % 30) + 1;
        const suras = ['Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Maidah', 'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Tawbah'];
        const suraName = suras[Math.floor(currentProg / 15) % suras.length];
        const ayatNum = (currentProg % 20) + 1;
        capaian.juz = juzNum.toString();
        capaian.surat = suraName;
        capaian.ayat = ayatNum.toString();
      } 
      else if (siswa.jilid === 'Ghorib') {
        // Ghorib displays Hal & Al-Qur'an (Juz, Surat, Ayat)
        const ghoribPage = (currentProg % 40) + 1;
        capaian.hal = ghoribPage.toString();
        
        // Al-Qur'an backing
        const qJuz = (Math.floor(currentProg / 40) % 30) + 1;
        capaian.juz = qJuz.toString();
        capaian.surat = 'Yasin';
        capaian.ayat = ((currentProg % 30) + 1).toString();
      } 
      else if (siswa.jilid === 'Tajwid') {
        // Tajwid displays Hal, murojaah Ghorib (Hal), and Al-Qur'an
        capaian.hal = ((currentProg % 30) + 1).toString();
        capaian.murojaahGhorib = (((currentProg + 5) % 40) + 1).toString();
        capaian.juz = '29';
        capaian.surat = 'Al-Mulk';
        capaian.ayat = ((currentProg % 20) + 1).toString();
      } 
      else if (siswa.jilid === 'Finishing') {
        // Finishing displays capaian Ghorib, Tajwid, and Al-Qur'an
        capaian.capaianGhorib = (((currentProg + 10) % 40) + 1).toString();
        capaian.capaianTajwid = (((currentProg + 2) % 30) + 1).toString();
        capaian.juz = '30';
        capaian.surat = 'An-Naba';
        capaian.ayat = ((currentProg % 10) + 1).toString();
      } 
      else if (siswa.jilid === 'Tahfidz') {
        capaian.juz = '30';
        capaian.surat = 'Ad-Duha';
        capaian.ayat = '1-11';
      }

      // Shift mapping based on class/id from class definition or fallback
      const kDef = defaultKelas.find(k => k.id === siswa.kelasId);
      const shiftId = kDef?.shiftId || (siswa.kelasId === 'K7A' || siswa.kelasId === 'K8A' ? 'S01' : (siswa.kelasId === 'K7B' || siswa.kelasId === 'K8B' ? 'S02' : 'S03'));

      logs.push({
        id: `LOG_${siswa.id}_${dateStr}`,
        siswaId: siswa.id,
        tanggal: dateStr,
        kehadiran,
        capaian: kehadiran === 'Hadir' ? capaian : {},
        keterangan: kehadiran === 'Hadir' ? 'Lancar, lanjut hal berikutnya' : (kehadiran === 'Izin' ? 'Izin sakit gigi / keluarga' : kehadiran === 'Sakit' ? 'Sakit demam' : 'Tanpa keterangan'),
        shiftId,
        guruKode: siswa.guruKode
      });
    });
  }

  return logs;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or use seeded defaults
  const [activeRole, setActiveRoleState] = useState<ActiveRole>('public');
  const [activeUserKode, setActiveUserKodeState] = useState<string>('G01');

  const [userCredentialsList, setUserCredentialsList] = useState<UserCredentials[]>([]);
  const [loggedInRoles, setLoggedInRoles] = useState<Record<'pj' | 'admin' | 'bendahara' | 'guru', boolean>>({
    pj: false,
    admin: false,
    bendahara: false,
    guru: false
  });

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [guruBTQList, setGuruBTQList] = useState<GuruBTQ[]>([]);
  const [guruBinaanList, setGuruBinaanList] = useState<GuruBinaan[]>([]);
  const [jadwalShiftList, setJadwalShiftList] = useState<JadwalShift[]>([]);
  const [hariLiburList, setHariLiburList] = useState<HariLibur[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [capaianHarianList, setCapaianHarianList] = useState<CapaianHarian[]>([]);
  const [pindahSementaraList, setPindahSementaraList] = useState<PindahSementara[]>([]);
  const [pengajuanTesList, setPengajuanTesList] = useState<PengajuanTes[]>([]);
  const [stokJilidList, setStokJilidList] = useState<StokJilid[]>([]);
  const [transaksiKeuanganList, setTransaksiKeuanganList] = useState<TransaksiKeuangan[]>([]);

  // Initialize data once on mount
  useEffect(() => {
    const unsubSiswa = onSnapshot(collection(db, 'siswa'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Siswa);
      if (data.length > 0) setSiswaList(data);
    }, (error) => console.error("Error fetching siswa:", error));

    const unsubGuruBTQ = onSnapshot(collection(db, 'guruBTQ'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as GuruBTQ);
      if (data.length > 0) setGuruBTQList(data);
    }, (error) => console.error("Error fetching guruBTQ:", error));

    const unsubGuruBinaan = onSnapshot(collection(db, 'guruBinaan'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as GuruBinaan);
      if (data.length > 0) setGuruBinaanList(data);
    }, (error) => console.error("Error fetching guruBinaan:", error));

    const unsubJadwalShift = onSnapshot(collection(db, 'jadwalShift'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as JadwalShift);
      if (data.length > 0) setJadwalShiftList(data);
    }, (error) => console.error("Error fetching jadwalShift:", error));

    const unsubHariLibur = onSnapshot(collection(db, 'hariLibur'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as HariLibur);
      if (data.length > 0) setHariLiburList(data);
    }, (error) => console.error("Error fetching hariLibur:", error));

    const unsubKelas = onSnapshot(collection(db, 'kelas'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Kelas);
      if (data.length > 0) setKelasList(data);
    }, (error) => console.error("Error fetching kelas:", error));

    const unsubCapaianHarian = onSnapshot(collection(db, 'capaianHarian'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as CapaianHarian);
      if (data.length > 0) setCapaianHarianList(data);
    }, (error) => console.error("Error fetching capaianHarian:", error));

    const unsubPindahSementara = onSnapshot(collection(db, 'pindahSementara'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as PindahSementara);
      if (data.length > 0) setPindahSementaraList(data);
    }, (error) => console.error("Error fetching pindahSementara:", error));

    const unsubPengajuanTes = onSnapshot(collection(db, 'pengajuanTes'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as PengajuanTes);
      if (data.length > 0) setPengajuanTesList(data);
    }, (error) => console.error("Error fetching pengajuanTes:", error));

    const unsubStokJilid = onSnapshot(collection(db, 'stokJilid'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as StokJilid);
      if (data.length > 0) setStokJilidList(data);
    }, (error) => console.error("Error fetching stokJilid:", error));

    const unsubTransaksi = onSnapshot(collection(db, 'transaksiKeuangan'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as TransaksiKeuangan);
      if (data.length > 0) setTransaksiKeuanganList(data);
    }, (error) => console.error("Error fetching transaksi:", error));

    const unsubSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
      snapshot.docs.forEach(doc => {
        if (doc.id === 'auth') {
          const data = doc.data();
          if (data.activeRole) setActiveRoleState(data.activeRole as ActiveRole);
          if (data.activeUserKode) setActiveUserKodeState(data.activeUserKode);
          if (data.loggedInRoles) setLoggedInRoles(data.loggedInRoles);
        } else if (doc.id === 'credentials') {
          const data = doc.data();
          if (data.list) setUserCredentialsList(data.list);
        }
      });
    }, (error) => console.error("Error fetching settings:", error));

    return () => {
      unsubSiswa();
      unsubGuruBTQ();
      unsubGuruBinaan();
      unsubJadwalShift();
      unsubHariLibur();
      unsubKelas();
      unsubCapaianHarian();
      unsubPindahSementara();
      unsubPengajuanTes();
      unsubStokJilid();
      unsubTransaksi();
      unsubSettings();
    };
  }, []);

  // Save changes wrapper helpers
  const saveRole = (role: ActiveRole) => {
    setActiveRoleState(role);
    syncToFirestore('settings', 'auth', { activeRole: role, activeUserKode, loggedInRoles });
  };

  const saveUserKode = (kode: string) => {
    setActiveUserKodeState(kode);
    syncToFirestore('settings', 'auth', { activeRole, activeUserKode: kode, loggedInRoles });
  };

  const saveSiswaList = (list: Siswa[]) => {
    setSiswaList(list);
  };

  const saveGuruBTQList = (list: GuruBTQ[]) => {
    setGuruBTQList(list);
  };

  const saveGuruBinaanList = (list: GuruBinaan[]) => {
    setGuruBinaanList(list);
  };

  const saveJadwalShiftList = (list: JadwalShift[]) => {
    setJadwalShiftList(list);
  };

  const saveHariLiburList = (list: HariLibur[]) => {
    setHariLiburList(list);
  };

  const saveKelasList = (list: Kelas[]) => {
    setKelasList(list);
  };

  const saveCapaianHarianList = (list: CapaianHarian[]) => {
    setCapaianHarianList(list);
  };

  const savePindahSementaraList = (list: PindahSementara[]) => {
    setPindahSementaraList(list);
  };

  const savePengajuanTesList = (list: PengajuanTes[]) => {
    setPengajuanTesList(list);
  };

  const saveStokJilidList = (list: StokJilid[]) => {
    setStokJilidList(list);
  };

  const saveTransaksiList = (list: TransaksiKeuangan[]) => {
    setTransaksiKeuanganList(list);
  };

  // Mutations
  const addSiswa = (siswa: Omit<Siswa, 'id' | 'isLulus'>) => {
    const newSiswa: Siswa = {
      ...siswa,
      id: `S_${Date.now()}`,
      isLulus: false
    };
    saveSiswaList([...siswaList, newSiswa]);
    syncToFirestore('siswa', newSiswa.id, newSiswa);
  };

  const updateSiswa = (id: string, updates: Partial<Siswa>) => {
    const existing = siswaList.find(s => s.id === id);
    if (existing) {
      const updatedSiswa = { ...existing, ...updates };
      saveSiswaList(siswaList.map(s => s.id === id ? updatedSiswa : s));
      syncToFirestore('siswa', id, updatedSiswa);
    }
  };

  const deleteSiswa = (id: string) => {
    saveSiswaList(siswaList.filter(s => s.id !== id));
    deleteFromFirestore('siswa', id);
  };

  const graduatedSiswa = (
    id: string, 
    details: { tanggalLulus: string; statusKhatam?: boolean; tanggalKhatam?: string; nilaiKhatam?: string; nomorSertifikat?: string }
  ) => {
    const existing = siswaList.find(s => s.id === id);
    if (existing) {
      const updatedSiswa = {
        ...existing,
        isLulus: true,
        ...details
      };
      saveSiswaList(siswaList.map(s => s.id === id ? updatedSiswa : s));
      syncToFirestore('siswa', id, updatedSiswa);
    }
  };

  const addGuruBTQ = (guru: Omit<GuruBTQ, 'id'>) => {
    const newGuru: GuruBTQ = {
      ...guru,
      id: `G_${Date.now()}`
    };
    saveGuruBTQList([...guruBTQList, newGuru]);
    syncToFirestore('guruBTQ', newGuru.id, newGuru);
  };

  const updateGuruBTQ = (id: string, updates: Partial<GuruBTQ>) => {
    const existing = guruBTQList.find(g => g.id === id);
    if (existing) {
      const updatedGuru = { ...existing, ...updates };
      saveGuruBTQList(guruBTQList.map(g => g.id === id ? updatedGuru : g));
      syncToFirestore('guruBTQ', id, updatedGuru);
    }
  };

  const deleteGuruBTQ = (id: string) => {
    saveGuruBTQList(guruBTQList.filter(g => g.id !== id));
    deleteFromFirestore('guruBTQ', id);
  };

  const addGuruBinaan = (guru: Omit<GuruBinaan, 'id'>) => {
    const newGuru: GuruBinaan = {
      ...guru,
      id: `GB_${Date.now()}`
    };
    saveGuruBinaanList([...guruBinaanList, newGuru]);
    syncToFirestore('guruBinaan', newGuru.id, newGuru);
  };

  const updateGuruBinaan = (id: string, updates: Partial<GuruBinaan>) => {
    const existing = guruBinaanList.find(g => g.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      saveGuruBinaanList(guruBinaanList.map(g => g.id === id ? updated : g));
      syncToFirestore('guruBinaan', id, updated);
    }
  };

  const deleteGuruBinaan = (id: string) => {
    saveGuruBinaanList(guruBinaanList.filter(g => g.id !== id));
    deleteFromFirestore('guruBinaan', id);
  };

  const addJadwalShift = (shift: Omit<JadwalShift, 'id'>) => {
    const newShift: JadwalShift = {
      ...shift,
      id: `S_${Date.now()}`
    };
    saveJadwalShiftList([...jadwalShiftList, newShift]);
    syncToFirestore('jadwalShift', newShift.id, newShift);
  };

  const updateJadwalShift = (id: string, updates: Partial<JadwalShift>) => {
    const existing = jadwalShiftList.find(s => s.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      saveJadwalShiftList(jadwalShiftList.map(s => s.id === id ? updated : s));
      syncToFirestore('jadwalShift', id, updated);
    }
  };

  const deleteJadwalShift = (id: string) => {
    saveJadwalShiftList(jadwalShiftList.filter(s => s.id !== id));
    deleteFromFirestore('jadwalShift', id);
  };

  const addHariLibur = (libur: Omit<HariLibur, 'id'>) => {
    const newLibur: HariLibur = {
      ...libur,
      id: `H_${Date.now()}`
    };
    saveHariLiburList([...hariLiburList, newLibur]);
    syncToFirestore('hariLibur', newLibur.id, newLibur);
  };

  const updateHariLibur = (id: string, updates: Partial<HariLibur>) => {
    const existing = hariLiburList.find(h => h.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      saveHariLiburList(hariLiburList.map(h => h.id === id ? updated : h));
      syncToFirestore('hariLibur', id, updated);
    }
  };

  const deleteHariLibur = (id: string) => {
    saveHariLiburList(hariLiburList.filter(h => h.id !== id));
    deleteFromFirestore('hariLibur', id);
  };

  const addKelas = (kelas: Omit<Kelas, 'id'>) => {
    const newKelas: Kelas = {
      ...kelas,
      id: `K_${Date.now()}`
    };
    saveKelasList([...kelasList, newKelas]);
    syncToFirestore('kelas', newKelas.id, newKelas);
  };

  const updateKelas = (id: string, updates: Partial<Kelas>) => {
    const existing = kelasList.find(k => k.id === id);
    if (existing) {
      const updated = { ...existing, ...updates };
      saveKelasList(kelasList.map(k => k.id === id ? updated : k));
      syncToFirestore('kelas', id, updated);
    }
  };

  const deleteKelas = (id: string) => {
    saveKelasList(kelasList.filter(k => k.id !== id));
    deleteFromFirestore('kelas', id);
  };

  const saveKehadiranAndCapaian = (records: Omit<CapaianHarian, 'id'>[]) => {
    const newRecords: CapaianHarian[] = records.map(r => ({
      ...r,
      id: `LOG_${r.siswaId}_${r.tanggal}`
    }));

    // Filter out old records with same siswaId and tanggal, then merge
    const filtered = capaianHarianList.filter(log => 
      !newRecords.some(nr => nr.siswaId === log.siswaId && nr.tanggal === log.tanggal)
    );

    const merged = [...filtered, ...newRecords];
    saveCapaianHarianList(merged);
    
    // Write new records to firestore
    newRecords.forEach(nr => syncToFirestore('capaianHarian', nr.id, nr));

    // Dynamic synchrony propagation!
    // "siswa jilid Juz 27 pada kelompok yang sama capaian hariannya sama, begitupun dengan Ghorib, Tajwid dan Finishing masing-masing"
    // If a teacher saves record for Juz 27, Qur'an, Ghorib, Tajwid, or Finishing, we should apply the same Capaian data
    // to all other active students in the same level (jilid) and under the same teacher (guruKode) for that date!
    const syncJilids = ['Juz 27', 'Qur\'an', 'Ghorib', 'Tajwid', 'Finishing'];
    
    // Check if any of our newly saved records are of sync jilids
    let syncListToPropagate: CapaianHarian[] = [...merged];
    let didSync = false;
    let autoGeneratedRecords: CapaianHarian[] = [];

    newRecords.forEach(rec => {
      const sis = siswaList.find(s => s.id === rec.siswaId);
      if (sis && syncJilids.includes(sis.jilid) && rec.kehadiran === 'Hadir') {
        // Find other students with the same jilid and teacher
        const sameGroupSiswas = siswaList.filter(s => 
          s.id !== rec.siswaId && !s.isLulus && s.jilid === sis.jilid && s.guruKode === rec.guruKode
        );

        sameGroupSiswas.forEach(gs => {
          // If the other student has a record on this date, update their capaian to match
          // If not, we can create one or update if present
          const existingLogIndex = syncListToPropagate.findIndex(log => log.siswaId === gs.id && log.tanggal === rec.tanggal);
          
          const syncedCapaian = { ...rec.capaian };
          // Do not sync keterangan (ket), keep the existing one if any
          
          if (existingLogIndex >= 0) {
            if (syncListToPropagate[existingLogIndex].kehadiran === 'Hadir') {
              const existingKet = syncListToPropagate[existingLogIndex].capaian.ket;
              if (existingKet !== undefined) syncedCapaian.ket = existingKet;
              else delete syncedCapaian.ket;

              syncListToPropagate[existingLogIndex] = {
                ...syncListToPropagate[existingLogIndex],
                capaian: syncedCapaian
              };
              autoGeneratedRecords.push(syncListToPropagate[existingLogIndex]);
              didSync = true;
            }
          } else {
            delete syncedCapaian.ket;
            // Auto generate record for them too to keep synchrony!
            const newLog: CapaianHarian = {
              id: `LOG_${gs.id}_${rec.tanggal}`,
              siswaId: gs.id,
              tanggal: rec.tanggal,
              kehadiran: 'Hadir',
              capaian: syncedCapaian,
              keterangan: 'Disamakan dengan kelompok',
              shiftId: rec.shiftId,
              guruKode: rec.guruKode
            };
            syncListToPropagate.push(newLog);
            autoGeneratedRecords.push(newLog);
            didSync = true;
          }
        });
      }
    });

    if (didSync) {
      saveCapaianHarianList(syncListToPropagate);
      autoGeneratedRecords.forEach(ar => syncToFirestore('capaianHarian', ar.id, ar));
    }
  };

  const addPindahSementara = (pindah: Omit<PindahSementara, 'id' | 'timestamp'>) => {
    const newPindah: PindahSementara = {
      ...pindah,
      id: `P_${Date.now()}`,
      timestamp: Date.now()
    };
    savePindahSementaraList([...pindahSementaraList, newPindah]);
    syncToFirestore('pindahSementara', newPindah.id, newPindah);
  };

  const clearPindahSementara = (id: string) => {
    savePindahSementaraList(pindahSementaraList.filter(p => p.id !== id));
    deleteFromFirestore('pindahSementara', id);
  };

  const ajukanTes = (siswaId: string, jilidAsal: JilidType, jilidTujuan: JilidType, keteranganTasmi?: string) => {
    // Check if there is already an active pending request
    const exists = pengajuanTesList.some(p => p.siswaId === siswaId && p.status === 'Pending');
    if (exists) return;

    const newRequest: PengajuanTes = {
      id: `T_${Date.now()}`,
      siswaId,
      jilidAsal,
      jilidTujuan,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      status: 'Pending',
      keteranganTasmi
    };
    savePengajuanTesList([...pengajuanTesList, newRequest]);
    syncToFirestore('pengajuanTes', newRequest.id, newRequest);
  };

  const verifikasiTes = (id: string, status: 'Disetujui' | 'Ditolak', diujiOleh: string, catatan: string) => {
    const existing = pengajuanTesList.find(p => p.id === id);
    if (existing) {
      const testRes = {
        ...existing,
        status,
        diujiOleh,
        tanggalUji: new Date().toISOString().split('T')[0],
        catatan
      };

      // If approved, automatically upgrade the student's Jilid!
      if (status === 'Disetujui') {
        updateSiswa(existing.siswaId, { jilid: existing.jilidTujuan });
      }

      savePengajuanTesList(pengajuanTesList.map(p => p.id === id ? testRes : p));
      syncToFirestore('pengajuanTes', id, testRes);
    }
  };

  const updateStokJilid = (jilid: JilidType, jumlah: number, isSet = false) => {
    const existing = stokJilidList.find(s => s.jilid === jilid);
    if (existing) {
      const updatedStok = {
        ...existing,
        stok: isSet ? jumlah : Math.max(0, existing.stok + jumlah)
      };
      saveStokJilidList(stokJilidList.map(s => s.jilid === jilid ? updatedStok : s));
      // Using jilid as document ID for stok
      syncToFirestore('stokJilid', jilid, updatedStok);
    }
  };

  const addTransaksi = (transaksi: Omit<TransaksiKeuangan, 'id'>) => {
    const newTrans: TransaksiKeuangan = {
      ...transaksi,
      id: `TR_${Date.now()}`
    };
    saveTransaksiList([...transaksiKeuanganList, newTrans]);
    syncToFirestore('transaksiKeuangan', newTrans.id, newTrans);

    // If it is a book purchase (Pembelian Jilid) and is paid (Lunas), let's automatically reduce book stock!
    if (transaksi.jenis === 'Pembelian Jilid' && transaksi.status === 'Lunas') {
      // Try to parse jilid from the description or use siswa's current jilid
      let purchasedJilid: JilidType | undefined;
      if (transaksi.siswaId) {
        const sis = siswaList.find(s => s.id === transaksi.siswaId);
        if (sis) purchasedJilid = sis.jilid;
      }

      if (purchasedJilid) {
        updateStokJilid(purchasedJilid, -1);
      }
    }
  };

  const updateTransaksiStatus = (id: string, status: 'Lunas' | 'Belum Lunas') => {
    const existing = transaksiKeuanganList.find(t => t.id === id);
    if (existing) {
      // If status changes to Lunas and it was a book purchase, reduce stock
      if (status === 'Lunas' && existing.status === 'Belum Lunas' && existing.jenis === 'Pembelian Jilid') {
        let purchasedJilid: JilidType | undefined;
        if (existing.siswaId) {
          const sis = siswaList.find(s => s.id === existing.siswaId);
          if (sis) purchasedJilid = sis.jilid;
        }
        if (purchasedJilid) {
          updateStokJilid(purchasedJilid, -1);
        }
      }
      const updatedTrans = { ...existing, status };
      saveTransaksiList(transaksiKeuanganList.map(t => t.id === id ? updatedTrans : t));
      syncToFirestore('transaksiKeuangan', id, updatedTrans);
    }
  };

  const deleteTransaksi = (id: string) => {
    saveTransaksiList(transaksiKeuanganList.filter(t => t.id !== id));
    deleteFromFirestore('transaksiKeuangan', id);
  };

  const updateCredentials = (role: 'pj' | 'admin' | 'bendahara' | 'guru', username: string, password?: string) => {
    const updated = userCredentialsList.map(c => {
      if (c.role === role) {
        return { ...c, username, password };
      }
      return c;
    });
    setUserCredentialsList(updated);
    syncToFirestore('settings', 'credentials', { list: updated });
  };

  const login = (role: 'pj' | 'admin' | 'bendahara' | 'guru', username: string, password?: string): boolean => {
    const account = userCredentialsList.find(c => c.role === role);
    if (account && account.username === username && account.password === password) {
      const updatedLoggedIn = { ...loggedInRoles, [role]: true };
      setLoggedInRoles(updatedLoggedIn);
      syncToFirestore('settings', 'auth', { activeRole, activeUserKode, loggedInRoles: updatedLoggedIn });
      return true;
    }
    return false;
  };

  const logout = (role: 'pj' | 'admin' | 'bendahara' | 'guru') => {
    const updatedLoggedIn = { ...loggedInRoles, [role]: false };
    setLoggedInRoles(updatedLoggedIn);
    syncToFirestore('settings', 'auth', { activeRole, activeUserKode, loggedInRoles: updatedLoggedIn });
  };

  const resetToDefault = async () => {
    setSiswaList(defaultSiswa);
    setGuruBTQList(defaultGuruBTQ);
    setGuruBinaanList(defaultGuruBinaan);
    setJadwalShiftList(defaultJadwalShift);
    setHariLiburList(defaultHariLibur);
    setKelasList(defaultKelas);
    setStokJilidList(defaultStokJilid);
    setTransaksiKeuanganList(defaultTransaksi);
    setPengajuanTesList(defaultPengajuanTes);
    setPindahSementaraList([]);
    const generated = generateHistoricalLogs(defaultSiswa);
    setCapaianHarianList(generated);
    setActiveRoleState('public');
    setActiveUserKodeState('G01');
    setUserCredentialsList(defaultCredentials);
    setLoggedInRoles({
      pj: false,
      admin: false,
      bendahara: false,
      guru: false
    });

    await bulkSyncToFirestore('siswa', defaultSiswa);
    await bulkSyncToFirestore('guruBTQ', defaultGuruBTQ);
    await bulkSyncToFirestore('guruBinaan', defaultGuruBinaan);
    await bulkSyncToFirestore('jadwalShift', defaultJadwalShift);
    await bulkSyncToFirestore('hariLibur', defaultHariLibur);
    await bulkSyncToFirestore('kelas', defaultKelas);
    await bulkSyncToFirestore('stokJilid', defaultStokJilid, 'jilid');
    await bulkSyncToFirestore('pengajuanTes', defaultPengajuanTes);
    await bulkSyncToFirestore('transaksiKeuangan', defaultTransaksi);
    await bulkSyncToFirestore('capaianHarian', generated);
    
    // Clear pindahSementara collection
    // Note: To fully reset we might need to delete all docs, but bulkSync will at least overwrite.
    
    await syncToFirestore('settings', 'credentials', { list: defaultCredentials });
    await syncToFirestore('settings', 'auth', {
      activeRole: 'public',
      activeUserKode: 'G01',
      loggedInRoles: {
        pj: false,
        admin: false,
        bendahara: false,
        guru: false
      }
    });
  };

  const runClassPromotionManually = () => {
    const promoted = siswaList.map(siswa => {
      if (siswa.isLulus) return siswa;
      const currentKelas = kelasList.find(k => k.id === siswa.kelasId);
      if (!currentKelas) return siswa;
      
      if (currentKelas.kelas === 7) {
        const suffix = siswa.kelasId.replace('K7', '');
        const nextKelasId = `K8${suffix}`;
        const exists = kelasList.some(k => k.id === nextKelasId);
        return { ...siswa, kelasId: exists ? nextKelasId : (kelasList.find(k => k.kelas === 8)?.id || siswa.kelasId) };
      } else if (currentKelas.kelas === 8) {
        const suffix = siswa.kelasId.replace('K8', '');
        const nextKelasId = `K9${suffix}`;
        const exists = kelasList.some(k => k.id === nextKelasId);
        return { ...siswa, kelasId: exists ? nextKelasId : (kelasList.find(k => k.kelas === 9)?.id || siswa.kelasId) };
      } else if (currentKelas.kelas === 9 || currentKelas.isKelasAkhir) {
        return {
          ...siswa,
          isLulus: true,
          tanggalLulus: new Date().toISOString().split('T')[0],
          statusKhatam: true,
          tanggalKhatam: new Date().toISOString().split('T')[0],
          nilaiKhatam: '88 (B)',
          nomorSertifikat: `SRT/BTQ/AUTO/${new Date().getFullYear()}${Math.floor(Math.random() * 900) + 100}`
        };
      }
      return siswa;
    });

    saveSiswaList(promoted);
    syncToFirestore('settings', 'promotion', { lastPromotionYear: new Date().getFullYear().toString() });
    promoted.forEach(p => syncToFirestore('siswa', p.id, p));
  };

  return (
    <AppContext.Provider
      value={{
        siswaList,
        guruBTQList,
        guruBinaanList,
        jadwalShiftList,
        hariLiburList,
        kelasList,
        capaianHarianList,
        pindahSementaraList,
        pengajuanTesList,
        stokJilidList,
        transaksiKeuanganList,
        activeRole,
        setActiveRole: saveRole,
        activeUserKode,
        setActiveUserKode: saveUserKode,
        
        userCredentialsList,
        loggedInRoles,
        updateCredentials,
        login,
        logout,

        // Mutations
        addSiswa,
        updateSiswa,
        deleteSiswa,
        graduatedSiswa,
        addGuruBTQ,
        updateGuruBTQ,
        deleteGuruBTQ,
        addGuruBinaan,
        updateGuruBinaan,
        deleteGuruBinaan,
        addJadwalShift,
        updateJadwalShift,
        deleteJadwalShift,
        addHariLibur,
        updateHariLibur,
        deleteHariLibur,
        addKelas,
        updateKelas,
        deleteKelas,
        saveKehadiranAndCapaian,
        addPindahSementara,
        clearPindahSementara,
        ajukanTes,
        verifikasiTes,
        updateStokJilid,
        addTransaksi,
        updateTransaksiStatus,
        deleteTransaksi,
        resetToDefault,
        runClassPromotionManually
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
