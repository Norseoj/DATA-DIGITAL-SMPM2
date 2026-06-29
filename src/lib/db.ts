import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

export const collections = {
  siswa: collection(db, 'siswa'),
  guruBTQ: collection(db, 'guruBTQ'),
  guruBinaan: collection(db, 'guruBinaan'),
  jadwalShift: collection(db, 'jadwalShift'),
  hariLibur: collection(db, 'hariLibur'),
  kelas: collection(db, 'kelas'),
  capaianHarian: collection(db, 'capaianHarian'),
  pindahSementara: collection(db, 'pindahSementara'),
  pengajuanTes: collection(db, 'pengajuanTes'),
  stokJilid: collection(db, 'stokJilid'),
  transaksiKeuangan: collection(db, 'transaksiKeuangan'),
  settings: collection(db, 'settings') // For userCredentials, activeRole, loggedInRoles
};

export async function syncToFirestore(collectionName: string, id: string, data: any) {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Error syncing to firestore for ${collectionName}:`, error);
  }
}

export async function deleteFromFirestore(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting from firestore for ${collectionName}:`, error);
  }
}

// Bulk sync function for initial data load
export async function bulkSyncToFirestore(collectionName: string, items: any[], idField = 'id') {
  try {
    for (const item of items) {
      const id = item[idField];
      if (id) {
        await setDoc(doc(db, collectionName, id), item, { merge: true });
      }
    }
  } catch (error) {
    console.error(`Error bulk syncing ${collectionName}:`, error);
  }
}

export async function isCollectionEmpty(collectionName: string) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.empty;
}
