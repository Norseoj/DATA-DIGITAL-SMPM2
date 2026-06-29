import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TransaksiKeuangan, Siswa, JilidType } from '../types';
import { Landmark, CreditCard, ShoppingBag, Receipt, Trash2, Printer, Plus, CheckCircle, Clock, Eye, EyeOff } from 'lucide-react';

export default function BendaharaView() {
  const {
    siswaList, transaksiKeuanganList, stokJilidList, addTransaksi, updateTransaksiStatus, deleteTransaksi, kelasList
  } = useApp();

  const [activeTab, setActiveTab] = useState<'iuran' | 'transaksi'>('iuran');
  const [showForm, setShowForm] = useState(true);

  // New Transaction states
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [manualName, setManualName] = useState('');
  const [transJenis, setTransJenis] = useState<'Syahriah' | 'Pembelian Jilid' | 'Lain-lain'>('Syahriah');
  const [transJumlah, setTransJumlah] = useState(50000);
  const [transStatus, setTransStatus] = useState<'Lunas' | 'Belum Lunas'>('Lunas');
  const [transKet, setTransKet] = useState('Iuran Syahriah BTQ Juni 2026');

  // Receipt modal state
  const [receiptId, setReceiptId] = useState<string | null>(null);

  const activeSiswa = siswaList.filter(s => !s.isLulus);

  // Filter students based on selection to prefill book price
  React.useEffect(() => {
    if (transJenis === 'Pembelian Jilid' && selectedSiswaId) {
      const sis = activeSiswa.find(s => s.id === selectedSiswaId);
      if (sis) {
        const bookPrice = stokJilidList.find(b => b.jilid === sis.jilid)?.harga || 15000;
        setTransJumlah(bookPrice);
        setTransKet(`Pembelian Buku Qiroati Jilid ${sis.jilid}`);
      }
    } else if (transJenis === 'Syahriah') {
      setTransJumlah(50000);
      setTransKet('Iuran Syahriah BTQ Juni 2026');
    }
  }, [transJenis, selectedSiswaId, stokJilidList]);

  // Submit payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId && !manualName) {
      alert('Mohon pilih siswa atau isi nama secara manual.');
      return;
    }

    addTransaksi({
      siswaId: selectedSiswaId || undefined,
      namaSiswaManual: selectedSiswaId ? undefined : manualName,
      jenis: transJenis,
      jumlah: transJumlah,
      tanggal: new Date().toISOString().split('T')[0],
      status: transStatus,
      keterangan: transKet
    });

    setManualName('');
    setSelectedSiswaId('');
    alert('Transaksi berhasil disimpan!');
  };

  const getSiswaName = (id?: string) => {
    return siswaList.find(s => s.id === id)?.namaLengkap || 'Umum';
  };

  const getSiswaKelas = (id?: string) => {
    const s = siswaList.find(sis => sis.id === id);
    if (!s) return 'Umum';
    const k = kelasList.find(item => item.id === s.kelasId);
    if (!k) return 'Umum';
    let suffix = k.subKelas;
    const prefixStr = k.kelas.toString();
    if (suffix.startsWith(prefixStr)) {
      suffix = suffix.substring(prefixStr.length).replace(/^[\s\-_]+/, '');
    }
    return `${k.kelas}-${suffix}`;
  };

  const activeReceipt = transaksiKeuanganList.find(t => t.id === receiptId);

  // Financial statistics
  const totalRevenue = transaksiKeuanganList
    .filter(t => t.status === 'Lunas')
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const totalOutstanding = transaksiKeuanganList
    .filter(t => t.status === 'Belum Lunas')
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-primary font-philosopher">Laman Bendahara</h2>
        <p className="text-xs text-gray-500">
          Kelola pembayaran syahriah iuran bulanan, iuran munaqosah, pembelian buku Qiroati jilid, cetak tanda terima kwitansi, dan laporan arus keuangan.
        </p>
      </div>

      {/* Financial Overview widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Total Kas Masuk (Lunas)</span>
            <span className="text-2xl font-black text-brand-primary mt-1 block">{formatRupiah(totalRevenue)}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <Landmark size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Piutang (Belum Lunas)</span>
            <span className="text-2xl font-black text-yellow-600 mt-1 block">{formatRupiah(totalOutstanding)}</span>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Jumlah Transaksi</span>
            <span className="text-2xl font-black text-brand-accent mt-1 block">{transaksiKeuanganList.length} <span className="text-xs text-gray-400 font-normal">Kwitansi</span></span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Receipt size={24} />
          </div>
        </div>
      </div>

      {/* Menu Subtabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('iuran')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'iuran'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus size={16} /> Kasir Pembayaran Baru
        </button>
        <button
          onClick={() => setActiveTab('transaksi')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'transaksi'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Receipt size={16} /> Riwayat Transaksi & Kwitansi
        </button>
      </div>

      {/* Tab 1: Form Kasir Baru */}
      {activeTab === 'iuran' && (
        <div className="space-y-4">
          {/* Toggle Form Button */}
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Form kasir pembayaran dapat disembunyikan untuk melihat tabel monitoring buku penuh.</span>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-brand-primary text-white hover:bg-brand-accent px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              {showForm ? <EyeOff size={13} /> : <Plus size={13} />}
              {showForm ? 'Sembunyikan Form Kasir' : 'Tampilkan Form Kasir'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            {showForm && (
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs lg:col-span-1 space-y-4">
                <h3 className="font-bold text-brand-primary text-base flex items-center gap-2">
                  <Landmark size={18} /> Input Transaksi Pembayaran
                </h3>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Pilih Siswa</label>
                    <select
                      value={selectedSiswaId}
                      onChange={(e) => {
                        setSelectedSiswaId(e.target.value);
                        if (e.target.value) setManualName('');
                      }}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs outline-none focus:border-brand-primary"
                    >
                      <option value="">-- Cari / Pilih Siswa --</option>
                      {activeSiswa.map(s => (
                        <option key={s.id} value={s.id}>{s.namaLengkap} ({getSiswaKelas(s.id)})</option>
                      ))}
                    </select>
                  </div>

                  {!selectedSiswaId && (
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Atau Nama Pembayar Umum (Manual)</label>
                      <input
                        type="text"
                        placeholder="e.g. Wali Siswa Ahmad"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Jenis Pembayaran</label>
                      <select
                        value={transJenis}
                        onChange={(e) => setTransJenis(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      >
                        <option value="Syahriah">Iuran Syahriah</option>
                        <option value="Pembelian Jilid">Pembelian Jilid</option>
                        <option value="Lain-lain">Lain-lain / Tabungan</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Status</label>
                      <select
                        value={transStatus}
                        onChange={(e) => setTransStatus(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                      >
                        <option value="Lunas">Lunas</option>
                        <option value="Belum Lunas">Belum Lunas</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Jumlah Pembayaran (Rp)</label>
                    <input
                      type="number"
                      value={transJumlah}
                      onChange={(e) => setTransJumlah(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none font-semibold text-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Keterangan Nota</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Iuran BTQ Juni 2026"
                      value={transKet}
                      onChange={(e) => setTransKet(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-brand-accent text-white font-bold p-2.5 rounded-lg text-xs shadow-xs transition"
                  >
                    Simpan & Terbitkan Kwitansi
                  </button>
                </form>
              </div>
            )}

            {/* Quick Info Stok Jilid */}
            <div className={`bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4 ${showForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <h3 className="font-bold text-gray-800 text-base">Monitoring Harga & Ketersediaan Buku Qiroati</h3>
              <p className="text-xs text-gray-400">Pembelian buku Qiroati jilid yang langsung dibayarkan lunas oleh siswa akan otomatis mengurangi ketersediaan stok buku di gudang PJ.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stokJilidList.map(item => (
                  <div key={item.jilid} className="bg-gray-50/70 p-3 rounded-xl border border-gray-200 flex flex-col justify-between">
                    <span className="font-extrabold text-xs text-brand-primary block">Buku Jilid {item.jilid}</span>
                    <span className="text-sm font-black text-brand-accent my-1 block">{formatRupiah(item.harga)}</span>
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>Stok:</span>
                      <span className={`font-bold ${item.stok <= 15 ? 'text-red-600' : 'text-gray-700'}`}>{item.stok} Pcs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Riwayat Kwitansi */}
      {activeTab === 'transaksi' && (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-800 text-base">Database Arus Keuangan</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Kwitansi No.</th>
                  <th className="p-3">Nama Santri</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3">Jumlah (Rp)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Kwitansi</th>
                  <th className="p-3 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transaksiKeuanganList.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono">{t.tanggal}</td>
                    <td className="p-3 font-mono font-bold text-gray-400">{t.id.slice(-6).toUpperCase()}</td>
                    <td className="p-3 font-bold text-gray-800">{t.siswaId ? getSiswaName(t.siswaId) : t.namaSiswaManual}</td>
                    <td className="p-3">{getSiswaKelas(t.siswaId)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.jenis === 'Syahriah' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-blue-50 text-blue-800 border border-blue-100'
                      }`}>
                        {t.jenis}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{t.keterangan}</td>
                    <td className="p-3 font-extrabold text-brand-primary">{formatRupiah(t.jumlah)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => updateTransaksiStatus(t.id, t.status === 'Lunas' ? 'Belum Lunas' : 'Lunas')}
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 cursor-pointer transition ${
                          t.status === 'Lunas'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}
                        title="Klik untuk ubah status"
                      >
                        {t.status === 'Lunas' ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {t.status}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setReceiptId(t.id)}
                        className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 font-bold px-2 py-1 rounded flex items-center gap-1 mx-auto"
                      >
                        <Printer size={12} /> Cetak
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteTransaksi(t.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kwitansi Printable Modal Popup */}
      {receiptId && activeReceipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div id="printable-receipt" className="bg-white rounded-xl shadow-2xl max-w-lg w-full border-t-8 border-brand-primary p-6 relative">
            <button
              onClick={() => setReceiptId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-extrabold text-lg"
            >
              ✕
            </button>

            {/* Receipt Header */}
            <div className="text-center border-b border-gray-100 pb-4 mb-4">
              <h4 className="font-philosopher font-bold text-brand-primary text-xl">SMP Muhammadiyah 2 Cirebon</h4>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">Kwitansi Penerimaan Syahadah & BTQ Digital</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Jl. Dr. Wahidin No. 34, Kota Cirebon, Jawa Barat</p>
            </div>

            {/* Receipt Body */}
            <div className="space-y-4 text-xs">
              <div className="flex justify-between">
                <div>
                  <span className="text-gray-400 block uppercase text-[9px] font-bold">Kwitansi No.</span>
                  <span className="font-mono font-extrabold text-gray-800 text-sm">#REC-{activeReceipt.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block uppercase text-[9px] font-bold">Tanggal</span>
                  <span className="font-mono font-bold text-gray-800">{activeReceipt.tanggal}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                <div className="grid grid-cols-2 gap-2 border-b border-gray-200/50 pb-2">
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px] font-bold">Diterima Dari</span>
                    <span className="font-extrabold text-gray-800">{activeReceipt.siswaId ? getSiswaName(activeReceipt.siswaId) : activeReceipt.namaSiswaManual}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block uppercase text-[9px] font-bold">Rombel Kelas</span>
                    <span className="font-bold text-gray-700">{getSiswaKelas(activeReceipt.siswaId)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1">
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px] font-bold">Kategori / Deskripsi</span>
                    <span className="font-semibold text-gray-700">{activeReceipt.keterangan}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded font-extrabold uppercase">
                      {activeReceipt.jenis}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-b border-gray-100 py-3 my-2">
                <span className="text-sm font-extrabold text-gray-600">Jumlah Pembayaran</span>
                <span className="text-xl font-black text-brand-primary">{formatRupiah(activeReceipt.jumlah)}</span>
              </div>

              {/* Stamp & Footer */}
              <div className="pt-4 flex justify-between items-end text-[10px]">
                <div>
                  <span className="text-brand-primary font-black uppercase text-[11px] tracking-wider border-2 border-brand-primary px-3 py-1 rounded rotate-[-6deg] inline-block font-philosopher">
                    {activeReceipt.status === 'Lunas' ? 'LUNAS / PAID' : 'BELUM LUNAS'}
                  </span>
                </div>
                <div className="text-center w-40">
                  <span className="text-gray-400 block mb-10">Bendahara BTQ,</span>
                  <div className="border-t border-gray-300 pt-1 font-bold text-gray-800">
                    Siti Halimah, S.Pd.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full bg-brand-primary hover:bg-brand-accent text-white font-bold p-2.5 rounded-lg text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <Printer size={14} /> Cetak Kwitansi (Sistem)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
