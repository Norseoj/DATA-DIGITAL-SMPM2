import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { bulkSyncToFirestore } from './db';
import {
  Siswa, GuruBTQ, GuruBinaan, JadwalShift, HariLibur, Kelas, 
  StokJilid, PengajuanTes, TransaksiKeuangan, CapaianHarian
} from '../types';

export const initializeFirestoreWithDefaults = async (
  defaultSiswa: Siswa[],
  defaultGuruBTQ: GuruBTQ[],
  defaultGuruBinaan: GuruBinaan[],
  defaultJadwalShift: JadwalShift[],
  defaultHariLibur: HariLibur[],
  defaultKelas: Kelas[],
  defaultStokJilid: StokJilid[],
  defaultPengajuanTes: PengajuanTes[],
  defaultTransaksi: TransaksiKeuangan[],
  generateLogs: (siswas: Siswa[]) => CapaianHarian[]
) => {
  const siswaSnap = await getDocs(collection(db, 'siswa'));
  
  if (siswaSnap.empty) {
    console.log("Firestore is empty, seeding with default data...");
    await bulkSyncToFirestore('siswa', defaultSiswa);
    await bulkSyncToFirestore('guruBTQ', defaultGuruBTQ);
    await bulkSyncToFirestore('guruBinaan', defaultGuruBinaan);
    await bulkSyncToFirestore('jadwalShift', defaultJadwalShift);
    await bulkSyncToFirestore('hariLibur', defaultHariLibur);
    await bulkSyncToFirestore('kelas', defaultKelas);
    await bulkSyncToFirestore('stokJilid', defaultStokJilid, 'jilid');
    await bulkSyncToFirestore('pengajuanTes', defaultPengajuanTes);
    await bulkSyncToFirestore('transaksiKeuangan', defaultTransaksi);

    const generatedLogs = generateLogs(defaultSiswa);
    await bulkSyncToFirestore('capaianHarian', generatedLogs);
    console.log("Seeding complete!");
  } else {
    console.log("Firestore already has data.");
  }
};
