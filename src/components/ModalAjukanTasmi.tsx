import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Siswa } from '../types';

interface Props {
  siswa: Siswa;
  onClose: () => void;
  onSubmit: (keteranganTasmi: string) => void;
}

export default function ModalAjukanTasmi({ siswa, onClose, onSubmit }: Props) {
  const [jumlahJuz, setJumlahJuz] = useState<number | ''>('');
  const [juzStart, setJuzStart] = useState<number | ''>('');
  const [juzEnd, setJuzEnd] = useState<number | ''>('');
  const [opsiTambahan, setOpsiTambahan] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jumlahJuz === '' || juzStart === '' || juzEnd === '') {
      alert('Mohon lengkapi data jumlah juz dan rentang juz.');
      return;
    }
    
    let ket = `${jumlahJuz} Juz (Juz ${juzStart} - ${juzEnd})`;
    if (jumlahJuz === 1 && opsiTambahan) {
      ket += ` [${opsiTambahan}]`;
    }
    
    onSubmit(ket);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-brand-primary p-4 flex justify-between items-center text-white">
          <h3 className="font-bold">Ajukan Tasmi' - {siswa.namaLengkap}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm text-gray-700">
          <div>
            <label className="block text-xs font-bold mb-1">Jumlah Juz</label>
            <input 
              type="number" 
              min="1" max="30"
              value={jumlahJuz} 
              onChange={e => setJumlahJuz(e.target.value ? Number(e.target.value) : '')} 
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 outline-none focus:border-brand-primary focus:bg-white"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Mulai Juz</label>
              <input 
                type="number" 
                min="1" max="30"
                value={juzStart} 
                onChange={e => setJuzStart(e.target.value ? Number(e.target.value) : '')} 
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 outline-none focus:border-brand-primary focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Sampai Juz</label>
              <input 
                type="number" 
                min="1" max="30"
                value={juzEnd} 
                onChange={e => setJuzEnd(e.target.value ? Number(e.target.value) : '')} 
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 outline-none focus:border-brand-primary focus:bg-white"
                required
              />
            </div>
          </div>

          {jumlahJuz === 1 && (
            <div>
              <label className="block text-xs font-bold mb-1">Opsi Tambahan (Bila 1 Juz)</label>
              <select 
                value={opsiTambahan} 
                onChange={e => setOpsiTambahan(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 outline-none focus:border-brand-primary focus:bg-white"
              >
                <option value="">- Penuh 1 Juz -</option>
                <option value="1/4 juz 1">1/4 juz 1</option>
                <option value="1/4 juz 2">1/4 juz 2</option>
                <option value="1/2 juz 1">1/2 juz 1</option>
                <option value="1/4 juz 3">1/4 juz 3</option>
                <option value="1/4 juz 4">1/4 juz 4</option>
                <option value="1/2 juz 2">1/2 juz 2</option>
              </select>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent font-bold"
            >
              Simpan & Ajukan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
