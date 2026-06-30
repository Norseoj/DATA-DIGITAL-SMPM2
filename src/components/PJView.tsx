import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JilidType, Siswa, GuruBTQ, PengajuanTes, StokJilid, PindahSementara, GuruBinaan } from '../types';
import { Users, CheckCircle, XCircle, RefreshCw, Archive, BookOpen, Layers, Settings, ShieldAlert, BadgeAlert } from 'lucide-react';

export default function PJView() {
  const {
    siswaList, guruBTQList, guruBinaanList, pengajuanTesList, stokJilidList, pindahSementaraList,
    updateSiswa, verifikasiTes, updatePengajuanTes, updateStokJilid, addPindahSementara, clearPindahSementara, kelasList
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kelompok' | 'verifikasi' | 'stok' | 'binaan'>('kelompok');

  // Permanent Move States
  const [selectedSiswaId, setSelectedSiswaId] = useState<string | null>(null);
  const [targetGuruKode, setTargetGuruKode] = useState('');

  // Temporary Move States
  const [tempSiswaId, setTempSiswaId] = useState<string | null>(null);
  const [tempGuruKode, setTempGuruKode] = useState('');
  const [tempShiftId, setTempShiftId] = useState('S01');

  // Restock state
  const [selectedJilidStok, setSelectedJilidStok] = useState<JilidType>('1A');
  const [addQty, setAddQty] = useState(10);

  const activeSiswa = siswaList.filter(s => !s.isLulus);

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

  // Permanent Move submit
  const handlePermanentMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId || !targetGuruKode) return;
    updateSiswa(selectedSiswaId, { guruKode: targetGuruKode });
    setSelectedSiswaId(null);
    alert('Siswa berhasil dipindahkan secara permanen ke guru baru!');
  };

  // Temporary Move submit
  const handleTempMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSiswaId || !tempGuruKode) return;
    const oldSiswa = activeSiswa.find(s => s.id === tempSiswaId);
    if (!oldSiswa) return;
    addPindahSementara({
      siswaId: tempSiswaId,
      guruLamaKode: oldSiswa.guruKode,
      guruBaruKode: tempGuruKode,
      shiftId: tempShiftId
    });
    setTempSiswaId(null);
    alert('Siswa didelegasikan sementara (berlaku 12 jam) ke guru pendamping baru!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-primary font-philosopher">Laman Penanggung Jawab (PJ)</h2>
        <p className="text-xs text-gray-500">
          Otoritas verifikasi kelulusan jilid Qiroati, penataan kelompok bimbingan belajar, mutasi siswa, bimbingan asatidz binaan, dan stok buku jilid.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('kelompok')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'kelompok'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={16} /> Kelompok Ajar & Mutasi
        </button>
        <button
          onClick={() => setActiveTab('verifikasi')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'verifikasi'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle size={16} /> Verifikasi Tes Jilid
          {pengajuanTesList.filter(p => p.status === 'Pending').length > 0 && (
            <span className="bg-brand-gold text-brand-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {pengajuanTesList.filter(p => p.status === 'Pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stok')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'stok'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Archive size={16} /> Data Stok Jilid
        </button>
        <button
          onClick={() => setActiveTab('binaan')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'binaan'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers size={16} /> Data Guru Binaan
        </button>
      </div>

      {/* Tab content */}

      {/* Tab 1: Kelompok Ajar */}
      {activeTab === 'kelompok' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="xl:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-800 text-base">Distribusi Kelompok Ajar Santri</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                    <th className="p-3">Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Jilid</th>
                    <th className="p-3">Guru Tetap</th>
                    <th className="p-3">Delegasi Sementara (12 Jam)</th>
                    <th className="p-3 text-center">Mutasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeSiswa.map(siswa => {
                    const activeTemp = pindahSementaraList.find(p => p.siswaId === siswa.id);
                    return (
                      <tr key={siswa.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-semibold text-gray-800">{siswa.namaLengkap}</td>
                        <td className="p-3">{getKelasName(siswa.kelasId)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-primary font-bold rounded">{siswa.jilid}</span>
                        </td>
                        <td className="p-3 font-medium text-gray-700">{getGuruName(siswa.guruKode)}</td>
                        <td className="p-3">
                          {activeTemp ? (
                            <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-800 border border-yellow-100 px-2 py-1 rounded font-semibold text-[10px]">
                              <span>Dititipkan ke <b>{activeTemp.guruBaruKode}</b></span>
                              <button
                                onClick={() => clearPindahSementara(activeTemp.id)}
                                className="text-red-500 hover:text-red-700 ml-auto font-bold"
                                title="Batalkan titip sementara"
                              >
                                [X]
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Tidak ada</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => {
                                setSelectedSiswaId(siswa.id);
                                setTargetGuruKode(guruBTQList[0]?.kodeGuru || '');
                              }}
                              className="bg-brand-primary text-white font-bold px-2 py-1 rounded text-[10px] hover:bg-brand-accent transition"
                            >
                              Pindah Tetap
                            </button>
                            <button
                              onClick={() => {
                                setTempSiswaId(siswa.id);
                                setTempGuruKode(guruBTQList[0]?.kodeGuru || '');
                              }}
                              className="bg-brand-gold text-brand-primary font-bold px-2 py-1 rounded text-[10px] hover:bg-brand-gold/80 transition"
                            >
                              Titip Sementara
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action sidebars */}
          <div className="space-y-6">
            {/* 1. Permanent Move Panel */}
            {selectedSiswaId && (
              <div className="bg-white p-5 rounded-xl border-t-4 border-brand-primary shadow-md space-y-3">
                <h4 className="font-bold text-brand-primary text-sm flex items-center gap-1.5">
                  <RefreshCw size={16} /> Pindah Guru (Permanen)
                </h4>
                <p className="text-[11px] text-gray-500">
                  Siswa <b>{activeSiswa.find(s => s.id === selectedSiswaId)?.namaLengkap}</b> akan dipindahkan bimbingannya secara permanen.
                </p>
                <form onSubmit={handlePermanentMove} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Pilih Guru Baru</label>
                    <select
                      value={targetGuruKode}
                      onChange={(e) => setTargetGuruKode(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                    >
                      {guruBTQList.map(g => (
                        <option key={g.id} value={g.kodeGuru}>{g.kodeGuru} - {g.namaLengkap}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSiswaId(null)}
                      className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold p-2 rounded text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 bg-brand-primary hover:bg-brand-accent text-white font-bold p-2 rounded text-xs"
                    >
                      Konfirmasi
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. Temporary Move Panel */}
            {tempSiswaId && (
              <div className="bg-white p-5 rounded-xl border-t-4 border-brand-gold shadow-md space-y-3">
                <h4 className="font-bold text-brand-primary text-sm flex items-center gap-1.5">
                  <RefreshCw size={16} /> Titip Sementara (12 Jam)
                </h4>
                <p className="text-[11px] text-gray-500">
                  Siswa <b>{activeSiswa.find(s => s.id === tempSiswaId)?.namaLengkap}</b> akan didelegasikan sementara agar namanya muncul di capaian harian guru pengganti.
                </p>
                <form onSubmit={handleTempMove} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Guru Pengganti</label>
                      <select
                        value={tempGuruKode}
                        onChange={(e) => setTempGuruKode(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      >
                        {guruBTQList.map(g => (
                          <option key={g.id} value={g.kodeGuru}>{g.kodeGuru} - {g.namaLengkap}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Shift</label>
                      <select
                        value={tempShiftId}
                        onChange={(e) => setTempShiftId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      >
                        <option value="S01">Pagi</option>
                        <option value="S02">Siang</option>
                        <option value="S03">Sore</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTempSiswaId(null)}
                      className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold p-2 rounded text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 bg-brand-primary hover:bg-brand-accent text-white font-bold p-2 rounded text-xs"
                    >
                      Delegasikan
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Verifikasi Tes */}
      {activeTab === 'verifikasi' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
            <h3 className="font-bold text-gray-800 text-base mb-1">Verifikasi Ajuan Tes Kenaikan Jilid, Tasmi', dan EBTAQ</h3>
            <p className="text-xs text-gray-400">Verifikasi ajuan tes dari asatidz.</p>
          </div>

          {/* Kenaikan Jilid */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden mb-6">
            <h4 className="font-bold text-brand-primary bg-brand-primary/10 p-3 text-sm">Tes Kenaikan Jilid</h4>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">Nama</th>
                  <th className="p-4">Jilid</th>
                  <th className="p-4">Naik Ke</th>
                  <th className="p-4">Tanggal Pengajuan</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4">Catatan</th>
                  <th className="p-4">Pindah Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pengajuanTesList.filter(p => p.jilidAsal !== 'Finishing' && p.jilidAsal !== 'Tahfidz').length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic">Belum ada pengajuan.</td></tr>
                ) : (
                  pengajuanTesList.filter(p => p.jilidAsal !== 'Finishing' && p.jilidAsal !== 'Tahfidz').map((tes, index) => {
                    const sis = siswaList.find(s => s.id === tes.siswaId);
                    return (
                      <tr key={tes.id} className="hover:bg-gray-50/50">
                        <td className="p-4 text-center text-gray-400 font-mono font-bold">{index + 1}</td>
                        <td className="p-4 font-bold text-gray-800">{sis?.namaLengkap || 'Siswa tidak ditemukan'}</td>
                        <td className="p-4"><span className="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded">{tes.jilidAsal}</span></td>
                        <td className="p-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">{tes.jilidTujuan}</span></td>
                        <td className="p-4 font-mono">{tes.tanggalPengajuan}</td>
                        <td className="p-4">
                          {tes.status === 'Pending' ? (
                            <select 
                              value=""
                              onChange={(e) => verifikasiTes(tes.id, e.target.value as 'Disetujui' | 'Ditolak', 'PJ', tes.catatan || '')}
                              className="bg-gray-50 border border-gray-200 rounded p-1 text-[10px] w-full outline-none focus:border-brand-primary"
                            >
                              <option value="">--Pilih--</option>
                              <option value="Disetujui">Lulus</option>
                              <option value="Ditolak">Tidak Lulus</option>
                            </select>
                          ) : (
                            <span className={`font-bold ${tes.status === 'Disetujui' ? 'text-emerald-600' : 'text-red-600'}`}>{tes.status === 'Disetujui' ? 'Lulus' : 'Tidak Lulus'}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={tes.catatan || ''}
                            onChange={(e) => updatePengajuanTes(tes.id, { catatan: e.target.value })}
                            placeholder="Catatan..."
                            disabled={tes.status !== 'Pending'}
                            className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-[10px] outline-none focus:border-brand-primary focus:bg-white disabled:opacity-50"
                          />
                        </td>
                        <td className="p-4">
                          {tes.status === 'Disetujui' && (
                             <button
                               onClick={() => {
                                 setSelectedSiswaId(tes.siswaId);
                                 setTargetGuruKode(sis?.guruKode || '');
                                 setActiveTab('kelompok');
                               }}
                               className="bg-brand-primary text-white font-bold px-2 py-1 rounded text-[10px] hover:bg-brand-accent transition"
                             >
                               Pindah Guru
                             </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Tes Tasmi' */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden mb-6">
            <h4 className="font-bold text-brand-primary bg-brand-primary/10 p-3 text-sm">Tes Tasmi'</h4>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">Nama</th>
                  <th className="p-4">Juz</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pengajuanTesList.filter(p => p.jilidAsal === 'Tahfidz').length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Belum ada pengajuan.</td></tr>
                ) : (
                  pengajuanTesList.filter(p => p.jilidAsal === 'Tahfidz').map((tes, index) => {
                    const sis = siswaList.find(s => s.id === tes.siswaId);
                    return (
                      <tr key={tes.id} className="hover:bg-gray-50/50">
                        <td className="p-4 text-center text-gray-400 font-mono font-bold">{index + 1}</td>
                        <td className="p-4 font-bold text-gray-800">{sis?.namaLengkap || 'Siswa tidak ditemukan'}</td>
                        <td className="p-4 text-brand-primary font-bold">{tes.keteranganTasmi || '-'}</td>
                        <td className="p-4">
                          {tes.status === 'Pending' ? (
                            <select 
                              value=""
                              onChange={(e) => updatePengajuanTes(tes.id, { status: e.target.value as 'Disetujui' | 'Ditolak' })}
                              className="bg-gray-50 border border-gray-200 rounded p-1 text-[10px] w-full outline-none focus:border-brand-primary"
                            >
                              <option value="">--Pilih--</option>
                              <option value="Disetujui">Lulus</option>
                              <option value="Ditolak">Tidak Lulus</option>
                            </select>
                          ) : (
                            <span className={`font-bold ${tes.status === 'Disetujui' ? 'text-emerald-600' : 'text-red-600'}`}>{tes.status === 'Disetujui' ? 'Lulus' : 'Tidak Lulus'}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={tes.catatan || ''}
                            onChange={(e) => updatePengajuanTes(tes.id, { catatan: e.target.value })}
                            placeholder="Catatan..."
                            disabled={tes.status !== 'Pending'}
                            className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-[10px] outline-none focus:border-brand-primary focus:bg-white disabled:opacity-50"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Tes EBTAQ */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden mb-6">
            <h4 className="font-bold text-brand-primary bg-brand-primary/10 p-3 text-sm">Tes EBTAQ</h4>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center" rowSpan={2}>No</th>
                  <th className="p-4" rowSpan={2}>Nama</th>
                  <th className="p-4 text-center border-b border-gray-100 border-l" colSpan={2}>Lembaga</th>
                  <th className="p-4 text-center border-b border-gray-100 border-l" colSpan={2}>Korcam</th>
                  <th className="p-4 text-center border-b border-gray-100 border-l" colSpan={2}>Korcab</th>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="p-2 text-center border-l border-gray-100">Ket</th>
                  <th className="p-2 text-center">Catatan</th>
                  <th className="p-2 text-center border-l border-gray-100">Ket</th>
                  <th className="p-2 text-center">Catatan</th>
                  <th className="p-2 text-center border-l border-gray-100">Ket</th>
                  <th className="p-2 text-center">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pengajuanTesList.filter(p => p.jilidAsal === 'Finishing').length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic">Belum ada pengajuan.</td></tr>
                ) : (
                  pengajuanTesList.filter(p => p.jilidAsal === 'Finishing').map((tes, index) => {
                    const sis = siswaList.find(s => s.id === tes.siswaId);
                    
                    const EbtaqStage = ({ stage, valField, catField }: { 
                      stage: 'Lembaga' | 'Korcam' | 'Korcab',
                      valField: 'ebtaqLembaga' | 'ebtaqKorcam' | 'ebtaqKorcab',
                      catField: 'catatanLembaga' | 'catatanKorcam' | 'catatanKorcab'
                    }) => {
                      const isDisabled = tes.status !== 'Pending';
                      
                      if (stage === 'Korcam' && !(tes.ebtaqLembaga === 'Lulus' || tes.ebtaqLembaga === 'Lulus Bersyarat')) {
                        return (
                          <>
                            <td className="p-2 border-l border-gray-100 text-center"><span className="text-gray-300 italic">-</span></td>
                            <td className="p-2"><span className="text-gray-300 italic">-</span></td>
                          </>
                        );
                      }
                      
                      if (stage === 'Korcab' && !(tes.ebtaqKorcam === 'Lulus' || tes.ebtaqKorcam === 'Lulus Bersyarat')) {
                        return (
                          <>
                            <td className="p-2 border-l border-gray-100 text-center"><span className="text-gray-300 italic">-</span></td>
                            <td className="p-2"><span className="text-gray-300 italic">-</span></td>
                          </>
                        );
                      }

                      return (
                        <>
                          <td className="p-2 border-l border-gray-100">
                            <select 
                              value={tes[valField] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updates: Partial<PengajuanTes> = { [valField]: val };
                                
                                if (stage === 'Korcab' && (val === 'Lulus' || val === 'Lulus Bersyarat')) {
                                   updates.status = 'Disetujui';
                                   updateSiswa(tes.siswaId, { jilid: 'Tahfidz' }); 
                                } else if (val === 'Tidak Lulus') {
                                   updates.status = 'Ditolak';
                                }
                                
                                updatePengajuanTes(tes.id, updates);
                              }}
                              disabled={isDisabled}
                              className="bg-gray-50 border border-gray-200 rounded p-1 text-[10px] w-full disabled:opacity-50 outline-none focus:border-brand-primary"
                            >
                              <option value="">--Pilih--</option>
                              <option value="Lulus">Lulus</option>
                              <option value="Lulus Bersyarat">Lulus Bersyarat</option>
                              <option value="Tidak Lulus">Tidak Lulus</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={tes[catField] || ''}
                              onChange={(e) => updatePengajuanTes(tes.id, { [catField]: e.target.value })}
                              placeholder="Catatan..."
                              disabled={isDisabled}
                              className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-[10px] outline-none focus:border-brand-primary focus:bg-white disabled:opacity-50"
                            />
                          </td>
                        </>
                      );
                    };

                    return (
                      <tr key={tes.id} className="hover:bg-gray-50/50">
                        <td className="p-4 text-center text-gray-400 font-mono font-bold">{index + 1}</td>
                        <td className="p-4 font-bold text-gray-800 whitespace-nowrap">{sis?.namaLengkap || 'Siswa tidak ditemukan'}</td>
                        <EbtaqStage stage="Lembaga" valField="ebtaqLembaga" catField="catatanLembaga" />
                        <EbtaqStage stage="Korcam" valField="ebtaqKorcam" catField="catatanKorcam" />
                        <EbtaqStage stage="Korcab" valField="ebtaqKorcab" catField="catatanKorcab" />
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Data Stok Jilid */}
      {activeTab === 'stok' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Restock panel */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs lg:col-span-1 space-y-4">
            <h3 className="font-bold text-brand-primary text-base flex items-center gap-1.5">
              <Archive size={18} /> Update Stok Buku Qiroati
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Pilih Buku Jilid</label>
                <select
                  value={selectedJilidStok}
                  onChange={(e) => setSelectedJilidStok(e.target.value as JilidType)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                >
                  {stokJilidList.map(s => (
                    <option key={s.jilid} value={s.jilid}>Buku Qiroati Jilid {s.jilid}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Jumlah Restock (Pcs)</label>
                <input
                  type="number"
                  value={addQty}
                  onChange={(e) => setAddQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    updateStokJilid(selectedJilidStok, addQty);
                    alert(`Stok Jilid ${selectedJilidStok} berhasil ditambah sebanyak ${addQty} pcs.`);
                  }}
                  className="w-full bg-brand-primary hover:bg-brand-accent text-white font-bold p-2.5 rounded-lg text-xs shadow-xs transition"
                >
                  Tambah Stok (+)
                </button>
              </div>
            </div>
          </div>

          {/* Stocks Inventory list */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-800 text-base">Inventarisasi Buku Qiroati (Gudang PJ)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stokJilidList.map(stok => (
                <div
                  key={stok.jilid}
                  className={`p-3 rounded-lg border text-center transition ${
                    stok.stok <= 15
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                >
                  <span className="font-extrabold text-xs block text-brand-primary">Jilid {stok.jilid}</span>
                  <span className="text-2xl font-black block my-1">{stok.stok}</span>
                  <span className="text-[10px] text-gray-500 block">Stok tersisa</span>
                  {stok.stok <= 15 && (
                    <span className="inline-flex items-center gap-1 text-[9px] bg-red-100 px-1 py-0.5 rounded font-extrabold text-red-700 mt-1 uppercase tracking-widest">
                      <BadgeAlert size={10} /> Restock
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Data Guru Binaan */}
      {activeTab === 'binaan' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
            <h3 className="font-bold text-gray-800 text-base">Informasi Binaan Asatidz</h3>
            <p className="text-xs text-gray-400">Data monitoring seluruh Guru Binaan, klasifikasi bimbingan per jilid, serta guru pengampu tetap.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="font-bold text-brand-primary text-sm">Rekap Guru per Jilid</h4>
              <div className="space-y-2">
                {['1A', '2A', '3A', '4A', 'Juz 27', 'Qur\'an', 'Ghorib', 'Tajwid', 'Finishing'].map(level => {
                  const matchingGurus = guruBinaanList.filter(gb => gb.jilid === level);
                  return (
                    <div key={level} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50">
                      <span className="font-extrabold text-brand-primary">Jilid {level}</span>
                      <div className="text-right">
                        {matchingGurus.length > 0 ? (
                          matchingGurus.map(g => (
                            <span key={g.id} className="bg-brand-accent/10 text-brand-primary px-2 py-0.5 rounded font-semibold ml-1">
                              {g.namaLengkap} ({g.kodeGuruBinaan})
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">Belum terplot</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="font-bold text-brand-primary text-sm">Asatidz Pembina BTQ</h4>
              <div className="space-y-2">
                {guruBTQList.map(btq => {
                  const binaans = guruBinaanList.filter(gb => gb.guruKodeBTQ === btq.kodeGuru);
                  return (
                    <div key={btq.id} className="flex justify-between items-start text-xs py-2 border-b border-gray-50">
                      <div>
                        <span className="font-bold text-gray-800 block">{btq.namaLengkap}</span>
                        <span className="text-[10px] text-gray-400 font-mono">Kode BTQ: {btq.kodeGuru}</span>
                      </div>
                      <div className="text-right">
                        {binaans.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {binaans.map(b => (
                              <span key={b.id} className="bg-brand-gold/20 text-brand-primary px-2 py-0.5 rounded font-bold text-[10px]">
                                {b.namaLengkap} - Jilid {b.jilid}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Belum mengampu asatidz</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
