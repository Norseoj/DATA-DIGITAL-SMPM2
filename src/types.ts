export type Gender = 'LK' | 'PR';

export type JilidType =
  | '1A'
  | '1B'
  | '2A'
  | '2B'
  | '3A'
  | '3B'
  | '4A'
  | '4B'
  | 'Juz 27'
  | 'Qur\'an'
  | 'Ghorib'
  | 'Tajwid'
  | 'Finishing'
  | 'Tahfidz';

export interface Siswa {
  id: string;
  namaLengkap: string;
  gender: Gender;
  tempatLahir: string;
  tanggalLahir: string;
  namaAyah: string;
  namaIbu: string;
  alamat: string;
  kelasId: string; // references Kelas.id
  jilid: JilidType;
  guruKode: string; // references GuruBTQ.kodeGuru
  isLulus: boolean;
  tanggalLulus?: string;
  statusKhatam?: boolean;
  tanggalKhatam?: string;
  nilaiKhatam?: string;
  nomorSertifikat?: string;
}

export interface GuruBTQ {
  id: string;
  namaLengkap: string;
  gender: Gender;
  tempatLahir: string;
  tanggalLahir: string;
  kodeGuru: string; // e.g. "G01", "G02" (unique identifier)
}

export interface GuruBinaan {
  id: string;
  namaLengkap: string;
  gender: Gender;
  tempatLahir: string;
  tanggalLahir: string;
  kodeGuruBinaan: string; // e.g. "GB01"
  jilid: JilidType;
  guruKodeBTQ: string; // references GuruBTQ.kodeGuru (Guru BTQ yang membina)
}

export interface JadwalShift {
  id: string;
  namaShift: string; // e.g. "Shift Pagi", "Shift Sore"
  hari: string[]; // e.g. ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]
  jam: string; // e.g. "14:00 - 15:30"
}

export interface HariLibur {
  id: string;
  bulan: string; // e.g. "Juni"
  tanggal: string; // YYYY-MM-DD
  shiftId: string; // references JadwalShift.id or "semua"
  kelasId: string; // references Kelas.id or "semua"
  keterangan: string;
}

export interface Kelas {
  id: string; // e.g. "K7A", "K8B"
  kelas: number; // e.g. 7, 8, 9
  subKelas: string; // e.g. "7 Abu Bakar", "8 Umar", "9 Ali"
  isKelasAkhir: boolean; // true for kelas 9 (SMP)
  shiftId?: string; // references JadwalShift.id
}

export interface CapaianCapaian {
  hal?: string; // 1A-4B, Ghorib, Tajwid
  surat?: string; // Juz 27, Qur'an, Ghorib, Tajwid, Finishing
  ayat?: string; // Juz 27, Qur'an, Ghorib, Tajwid, Finishing
  juz?: string; // Qur'an, Ghorib, Tajwid, Finishing
  murojaahGhorib?: string; // Tajwid
  capaianGhorib?: string; // Finishing
  capaianTajwid?: string; // Finishing
  ket?: string; // 'L' | 'TL' | 'U'
}

export interface CapaianHarian {
  id: string;
  siswaId: string;
  tanggal: string; // YYYY-MM-DD
  kehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  capaian: CapaianCapaian;
  keterangan: string;
  shiftId: string; // references JadwalShift.id
  guruKode: string; // references GuruBTQ.kodeGuru or GuruBinaan
}

export interface PindahSementara {
  id: string;
  siswaId: string;
  guruLamaKode: string;
  guruBaruKode: string;
  timestamp: number; // Date.now()
  shiftId: string;
}

export interface PengajuanTes {
  id: string;
  siswaId: string;
  jilidAsal: JilidType;
  jilidTujuan: JilidType;
  tanggalPengajuan: string; // YYYY-MM-DD
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  diujiOleh?: string;
  tanggalUji?: string;
  catatan?: string;
}

export interface StokJilid {
  jilid: JilidType;
  stok: number;
  harga: number; // for integration with Bendahara payments
}

export interface TransaksiKeuangan {
  id: string;
  siswaId?: string; // references Siswa.id
  namaSiswaManual?: string; // if not registered or other
  jenis: 'Syahriah' | 'Pembelian Jilid' | 'Lain-lain';
  jumlah: number;
  tanggal: string; // YYYY-MM-DD
  status: 'Lunas' | 'Belum Lunas';
  keterangan: string;
}

export type ActiveRole = 'public' | 'guru' | 'pj' | 'bendahara' | 'admin';

export interface UserCredentials {
  role: 'pj' | 'admin' | 'bendahara' | 'guru';
  username: string;
  password?: string;
}

