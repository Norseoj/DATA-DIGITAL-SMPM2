import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { bulkSyncToFirestore, syncToFirestore } from './db';
import {
  Siswa, GuruBTQ, GuruBinaan, JadwalShift, HariLibur, Kelas, 
  StokJilid, PengajuanTes, TransaksiKeuangan, CapaianHarian, UserCredentials
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
  generateLogs: (siswas: Siswa[]) => CapaianHarian[],
  defaultCredentials: UserCredentials[]
) => {
  let siswaSnap;
  try {
    siswaSnap = await getDocs(collection(db, 'siswa'));
  } catch (error) {
    console.error("Error checking Firestore for initial seed. If permission is denied, check rules.", error);
    return;
  }
  
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

    console.log("Seeding complete!");
  } else {
    console.log("Firestore already has data.");
    // Force sync credentials in case new default credentials (like demo account) were added in code
    await syncToFirestore('settings', 'credentials', { list: defaultCredentials });
  }
};

