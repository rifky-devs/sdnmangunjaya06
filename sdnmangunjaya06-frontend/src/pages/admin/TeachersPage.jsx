import React, { useState } from "react";
import { Plus, Save, Trash2, Edit2, X, Eye, UserCheck, UserX, Key, ChevronLeft, ChevronRight, Search, SlidersHorizontal, AlertCircle, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { api } from "../../services/api.js";
import { useToast } from "../../components/Toast.jsx";

const initialForm = {
  teacher_code: "",
  name: "",
  subject_id: "",
  username: "",
  password: "",
};

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function TeachersPage() {
  const { showToast } = useToast();
  const { data, loading, error, refetch } = useFetch("/teachers", { initialData: [] });
  const { data: subjects } = useFetch("/subjects", { initialData: [] });

  // Page states
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Show toast on load error
  React.useEffect(() => {
    if (error) {
      showToast("Gagal memuat data guru.", "error");
    }
  }, [error]);

  // Add Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(initialForm);
  const [addFile, setAddFile] = useState(null);
  const [addPreview, setAddPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    teacher_code: "",
    name: "",
    subject_id: "",
    username: "",
    password: "",
    is_active: 1,
  });
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editingSave, setEditingSave] = useState(false);

  // Detail Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // Handlers for Add File
  const handleAddFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setAddFile(null);
      setAddPreview(null);
      return;
    }

    if (selectedFile.size > 500 * 1024) {
      showToast("Ukuran foto maksimal 500 KB.", "error");
      e.target.value = "";
      setAddFile(null);
      setAddPreview(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      showToast("Format foto harus JPG, JPEG, PNG, atau WEBP.", "error");
      e.target.value = "";
      setAddFile(null);
      setAddPreview(null);
      return;
    }

    setAddFile(selectedFile);
    setAddPreview(URL.createObjectURL(selectedFile));
  };

  // Handlers for Edit File
  const handleEditFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setEditFile(null);
      setEditPreview(editItem?.photo_url || null);
      return;
    }

    if (selectedFile.size > 500 * 1024) {
      showToast("Ukuran foto maksimal 500 KB.", "error");
      e.target.value = "";
      setEditFile(null);
      setEditPreview(editItem?.photo_url || null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      showToast("Format foto harus JPG, JPEG, PNG, atau WEBP.", "error");
      e.target.value = "";
      setEditFile(null);
      setEditPreview(editItem?.photo_url || null);
      return;
    }

    setEditFile(selectedFile);
    setEditPreview(URL.createObjectURL(selectedFile));
  };

  // Submit Add Teacher
  const handleAddSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    // Frontend validation
    const usernameRegex = /^[A-Za-z0-9]+$/;
    if (addForm.username && !usernameRegex.test(addForm.username)) {
      showToast("Username hanya boleh berisi huruf kecil, huruf besar, dan angka.", "error");
      setSaving(false);
      return;
    }
    if (!addForm.password || !addForm.password.trim()) {
      showToast("Password wajib diisi.", "error");
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("teacher_code", addForm.teacher_code);
      formData.append("name", addForm.name);
      formData.append("subject_id", addForm.subject_id);
      formData.append("username", addForm.username);
      formData.append("password", addForm.password);
      if (addFile) {
        formData.append("photo", addFile);
      }

      await api.post("/teachers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAddForm(initialForm);
      setAddFile(null);
      setAddPreview(null);
      setShowAddModal(false);
      showToast("Akun berhasil dibuat.", "success");
      await refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menyimpan data guru.";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Modal
  const handleEditOpen = (teacher) => {
    setEditItem(teacher);
    setEditForm({
      teacher_code: teacher.teacher_code,
      name: teacher.name,
      subject_id: teacher.subject_id,
      username: teacher.username || "",
      password: "",
      is_active: teacher.is_active !== undefined ? teacher.is_active : 1,
    });
    setEditFile(null);
    setEditPreview(teacher.photo_url || null);
    setShowEditModal(true);
  };

  // Submit Edit Teacher
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setEditingSave(true);

    const usernameRegex = /^[A-Za-z0-9]+$/;
    if (editForm.username && !usernameRegex.test(editForm.username)) {
      showToast("Username hanya boleh berisi huruf kecil, huruf besar, dan angka.", "error");
      setEditingSave(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("teacher_code", editForm.teacher_code);
      formData.append("name", editForm.name);
      formData.append("subject_id", editForm.subject_id);
      formData.append("username", editForm.username);
      if (editForm.password) {
        formData.append("password", editForm.password);
      }
      formData.append("is_active", editForm.is_active);
      if (editFile) {
        formData.append("photo", editFile);
      }

      await api.put(`/teachers/${editItem.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowEditModal(false);
      setEditItem(null);
      setEditFile(null);
      setEditPreview(null);
      showToast("Akun berhasil diperbarui.", "success");
      await refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal memperbarui data guru.";
      showToast(msg, "error");
    } finally {
      setEditingSave(false);
    }
  };

  // Delete Teacher
  const handleDelete = async (id, item) => {
    setDeleteTarget({ id, name: item?.name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSaving(true);
    try {
      await api.delete(`/teachers/${deleteTarget.id}`);
      showToast("Akun berhasil dihapus.", "success");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menghapus data guru. Akun guru ini mungkin telah menginput nilai siswa.";
      showToast(msg, "error");
    } finally {
      setDeleteSaving(false);
    }
  };

  // Toggle Account Active Status
  const handleToggleStatus = async (item) => {
    const newStatus = item.is_active === 1 ? 0 : 1;
    try {
      await api.patch(`/users/${item.user_id}/status`, { is_active: newStatus });
      showToast(`Status keaktifan ${item.name} berhasil diperbarui.`, "success");
      await refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal merubah status keaktifan.";
      showToast(msg, "error");
    }
  };

  // Reset Password Shortcut
  const handleResetPassword = async (item) => {
    const newPass = prompt(`Reset Password: Masukkan password baru untuk guru ${item.name}:`);
    if (!newPass) return;
    if (newPass.length < 6) {
      showToast("Password minimal 6 karakter.", "error");
      return;
    }
    try {
      await api.patch(`/users/${item.user_id}/password`, { password: newPass });
      showToast(`Sandi untuk ${item.name} berhasil diubah.`, "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mereset password.";
      showToast(msg, "error");
    }
  };

  // Filter & Search Logic
  const filteredTeachers = (data || []).filter((item) => {
    const matchesSearch = searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.teacher_code.toLowerCase().includes(searchTerm.toLowerCase()) || (item.username && item.username.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    const matchesSubject = subjectFilter ? String(item.subject_id) === String(subjectFilter) : true;
    return matchesSearch && matchesSubject;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const paginatedTeachers = filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Data Guru"
        description="Kelola identitas ID Guru, nama lengkap, mata pelajaran yang diampu, serta akun login akses guru."
        action={
          <button onClick={() => setShowAddModal(true)} className="btn-primary gap-2 font-bold py-2.5 px-4 rounded-2xl flex items-center shadow-lg shadow-teal-500/20">
            <Plus size={18} /> Tambah Guru
          </button>
        }
      />

      {/* Toolbar Pencarian & Penyaringan */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari ID Guru, nama, atau username..."
              className="input pl-10 py-2 w-full text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200/70">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Semua Mata Pelajaran</option>
              {(subjects || []).map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400">Menampilkan {filteredTeachers.length} guru</span>
      </div>

      {/* Tabel Utama Card */}
      <div className="card overflow-hidden">
        {loading && <p className="p-6 text-sm text-slate-500">Memuat data guru...</p>}
        {error && <p className="p-6 text-sm font-semibold text-rose-600">{error}</p>}
        {!loading && paginatedTeachers.length === 0 && <EmptyState title="Guru tidak ditemukan" description="Tidak ada guru terdaftar yang cocok dengan pencarian atau filter Anda." />}

        {!loading && paginatedTeachers.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="table-head">
                  <tr>
                    <th className="px-6 py-3 w-20 text-center">Foto</th>
                    <th className="px-6 py-3 w-32">ID Guru</th>
                    <th className="px-6 py-3">Nama Guru</th>
                    <th className="px-6 py-3">Mata Pelajaran</th>
                    <th className="px-6 py-3 w-36">Username</th>
                    <th className="px-6 py-3 w-36 text-center">Status</th>
                    <th className="px-6 py-3 w-52 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTeachers.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="table-cell text-center flex justify-center py-3">
                        <Avatar photoUrl={item.photo_url} name={item.name} size="sm" />
                      </td>
                      <td className="table-cell font-mono font-bold text-slate-800">{item.teacher_code}</td>
                      <td className="table-cell font-bold text-slate-900">{item.name}</td>
                      <td className="table-cell font-bold text-teal-700">{item.subject_name}</td>
                      <td className="table-cell font-mono text-slate-500 text-xs">@{item.username || "-"}</td>
                      <td className="table-cell text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black border uppercase tracking-wider ${
                            item.is_active === 1 ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-rose-50 border-rose-200 text-rose-700"
                          }`}
                        >
                          {item.is_active === 1 ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setDetailItem(item);
                              setShowDetailModal(true);
                            }}
                            title="Detail Profil"
                            className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
                          >
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleEditOpen(item)} title="Edit Data" className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleResetPassword(item)} title="Reset Sandi" className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition">
                            <Key size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item)}
                            title={item.is_active === 1 ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                            className={`rounded-xl p-2 border transition ${item.is_active === 1 ? "bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100" : "bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100"}`}
                          >
                            {item.is_active === 1 ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                          <button onClick={() => handleDelete(item.id, item)} title="Hapus Data" className="rounded-xl bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-black text-slate-950">Tambah Guru Baru</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm(initialForm);
                  setAddFile(null);
                  setAddPreview(null);
                }}
                className="rounded-xl bg-slate-50 p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="mb-5 flex flex-col items-center gap-3">
                <label className="label self-start">Foto Profil</label>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-slate-50 overflow-hidden shadow-inner">
                  {addPreview ? (
                    <img src={addPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : addForm.name ? (
                    <div className="flex h-full w-full items-center justify-center bg-teal-600 text-xl font-black text-white">{getInitials(addForm.name)}</div>
                  ) : (
                    <span className="text-xs text-slate-400">Pilih Foto</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAddFileChange}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer w-full"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">ID Guru (NIP)</label>
                  <input className="input w-full font-mono" value={addForm.teacher_code} onChange={(e) => setAddForm({ ...addForm, teacher_code: e.target.value })} placeholder="Contoh: 1982001" required />
                </div>
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input className="input w-full" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Contoh: Sri Wahyuni, S.Pd" required />
                </div>
                <div>
                  <label className="label">Mata Pelajaran</label>
                  <select className="input w-full font-bold text-slate-700" value={addForm.subject_id} onChange={(e) => setAddForm({ ...addForm, subject_id: e.target.value })} required>
                    <option value="">Pilih mapel</option>
                    {(subjects || []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Username</label>
                  <input className="input w-full font-mono" value={addForm.username} onChange={(e) => setAddForm({ ...addForm, username: e.target.value })} placeholder="Contoh: sriwahyuni" required />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Password Akun</label>
                  <input className="input w-full font-mono" type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="Minimal 6 karakter" required />
                </div>
              </div>

              <button className="btn-primary w-full gap-2 mt-6 py-3 font-bold rounded-2xl" disabled={saving}>
                <Save size={18} /> {saving ? "Menyimpan..." : "Simpan Guru"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-black text-slate-950">Edit Data Guru</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditItem(null);
                }}
                className="rounded-xl bg-slate-50 p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="mb-4 flex flex-col items-center gap-3">
                <label className="label self-start">Foto Profil</label>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-slate-50 overflow-hidden shadow-inner">
                  {editPreview ? (
                    <img src={editPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : editForm.name ? (
                    <div className="flex h-full w-full items-center justify-center bg-teal-600 text-xl font-black text-white">{getInitials(editForm.name)}</div>
                  ) : (
                    <span className="text-xs text-slate-400">Pilih Foto</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleEditFileChange}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer w-full"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">ID Guru (NIP)</label>
                  <input className="input w-full font-mono" value={editForm.teacher_code} onChange={(e) => setEditForm({ ...editForm, teacher_code: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Nama Guru</label>
                  <input className="input w-full" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Mata Pelajaran</label>
                  <select className="input w-full font-bold text-slate-700" value={editForm.subject_id} onChange={(e) => setEditForm({ ...editForm, subject_id: e.target.value })} required>
                    <option value="">Pilih mapel</option>
                    {(subjects || []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Username</label>
                  <input className="input w-full font-mono" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Sandi Baru (kosongkan jika tidak diubah)</label>
                  <input className="input w-full font-mono" type="password" placeholder="••••••••" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                </div>
                <div>
                  <label className="label">Status Akun</label>
                  <select className="input w-full font-bold text-slate-700" value={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: Number(e.target.value) })}>
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary w-full gap-2 mt-6 py-3 font-bold rounded-2xl" disabled={editingSave}>
                <Save size={18} /> {editingSave ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Teacher Modal */}
      {showDetailModal && detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-black text-slate-950">Detail Guru</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailItem(null);
                }}
                className="rounded-xl bg-slate-50 p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar photoUrl={detailItem.photo_url} name={detailItem.name} size="lg" className="ring-4 ring-indigo-500/10" />
              <div>
                <h4 className="text-base font-black text-slate-900">{detailItem.name}</h4>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-black mt-1">NIP: {detailItem.teacher_code}</p>
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-3.5">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400 uppercase">Mata Pelajaran</span>
                  <span className="font-extrabold text-teal-700">{detailItem.subject_name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400 uppercase">Username</span>
                  <span className="font-extrabold text-slate-800 font-mono">@{detailItem.username || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-400 uppercase">Status Akun</span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${detailItem.is_active === 1 ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}
                  >
                    {detailItem.is_active === 1 ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">Konfirmasi Hapus Data Guru</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Hapus data guru <span className="font-bold">{deleteTarget.name}</span> secara permanen?
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="rounded-xl bg-slate-50 p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                disabled={deleteSaving}
                className="btn-secondary flex-1 py-2 rounded-2xl disabled:opacity-60"
              >
                Batal
              </button>
              <button onClick={confirmDelete} disabled={deleteSaving} className="bg-rose-600 text-white flex-1 py-2 rounded-2xl disabled:opacity-60">
                {deleteSaving ? "Menghapus..." : "Hapus Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
