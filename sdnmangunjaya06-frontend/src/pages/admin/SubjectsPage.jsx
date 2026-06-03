import { Save, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../services/api.js';
import { useToast } from '../../components/Toast.jsx';

export default function SubjectsPage() {
  const { data, loading, error, refetch } = useFetch('/subjects', { initialData: [] });
  const [name, setName] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    if (error) {
      showToast("Gagal memuat data mata pelajaran.", "error");
    }
  }, [error]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/subjects', { name });
      setName('');
      showToast("Mata pelajaran berhasil disimpan.", "success");
      await refetch();
    } catch (err) {
      showToast(err?.response?.data?.message || "Gagal menyimpan mata pelajaran.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus mata pelajaran ini?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      showToast("Mata pelajaran berhasil dihapus.", "success");
      await refetch();
    } catch (err) {
      showToast(err?.response?.data?.message || "Gagal menghapus mata pelajaran.", "error");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Mata Pelajaran"
        description="Kelola mata pelajaran untuk pengisian nilai oleh guru."
      />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit} className="card">
          <label className="label">Nama Mata Pelajaran</label>
          <input className="input mb-5" placeholder="Contoh: Matematika" value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="btn-primary w-full gap-2">
            <Save size={18} /> Simpan Mapel
          </button>
        </form>

        <div className="card">
          {loading && <p>Memuat data...</p>}
          {!loading && data?.length === 0 && (
            <EmptyState
              title="Belum ada mata pelajaran"
              description="Daftar mata pelajaran masih kosong. Silakan gunakan formulir di sebelah kiri untuk menambahkan mata pelajaran baru."
            />
          )}
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
