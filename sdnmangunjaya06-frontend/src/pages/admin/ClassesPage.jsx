import { Save, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../services/api.js';
import { useToast } from '../../components/Toast.jsx';

export default function ClassesPage() {
  const { data, loading, error, refetch } = useFetch('/classes', { initialData: [] });
  const [name, setName] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    if (error) {
      showToast("Gagal memuat data kelas.", "error");
    }
  }, [error]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/classes', { name });
      setName('');
      showToast("Kelas berhasil disimpan.", "success");
      await refetch();
    } catch (err) {
      showToast(err?.response?.data?.message || "Gagal menyimpan kelas.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus kelas ini?')) return;
    try {
      await api.delete(`/classes/${id}`);
      showToast("Kelas berhasil dihapus.", "success");
      await refetch();
    } catch (err) {
      showToast(err?.response?.data?.message || "Gagal menghapus kelas.", "error");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Data Kelas"
        description="Kelola daftar kelas yang dipakai untuk pendataan siswa."
      />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit} className="card">
          <label className="label">Nama Kelas</label>
          <input className="input mb-5" placeholder="Contoh: 6A" value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="btn-primary w-full gap-2">
            <Save size={18} /> Simpan Kelas
          </button>
        </form>

        <div className="card">
          {loading && <p>Memuat data...</p>}
          {!loading && data?.length === 0 && <EmptyState />}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data?.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <span className="font-black text-slate-900">{item.name}</span>
                <button onClick={() => handleDelete(item.id)} className="rounded-xl bg-rose-50 p-2 text-rose-700">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
