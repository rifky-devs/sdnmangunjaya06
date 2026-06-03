import React, { useState, useEffect, useRef } from "react";
import { Users, UserPlus, RefreshCw, Search, Key, Trash2, Edit2, CheckCircle2, XCircle, UserCog, Save, X, Shield, BookOpen, GraduationCap } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import UploadPhoto from "../../components/ui/UploadPhoto.jsx";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";

const initialForm = {
  name: "",
  username: "",
  password: "",
  role: "siswa",
  is_active: 1,
};

export default function UsersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Forms States
  const [addForm, setAddForm] = useState(initialForm);
  const [addPhotoFile, setAddPhotoFile] = useState(null);
  const [addSaving, setAddSaving] = useState(false);

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", username: "", role: "", is_active: 1 });
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetSaving, setResetSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // Filters States
  const [filterRole, setFilterRole] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Refs for polling
  const isEditingRef = useRef(false);

  const fetchUsers = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data);
      setError("");
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Gagal memuat data akun.";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Safe Polling every 5 seconds
  useEffect(() => {
    fetchUsers(true);

    const interval = setInterval(() => {
      // Only refetch background data if no modals are actively being interacted with
      if (!isEditingRef.current) {
        fetchUsers(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Monitor Modal opens to pause background polling from disrupting UI focus
  useEffect(() => {
    isEditingRef.current = showAddModal || showEditModal || showResetModal;
  }, [showAddModal, showEditModal, showResetModal]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Frontend validation for username pattern and required fields
    const usernameRegex = /^[A-Za-z0-9]+$/;
    if (!usernameRegex.test(addForm.username)) {
      return showToast("Username hanya boleh berisi huruf kecil, huruf besar, dan angka.", "error");
    }
    if (!addForm.password || !addForm.password.trim()) {
      return showToast("Password wajib diisi.", "error");
    }
    if (!addForm.role) {
      return showToast("Role wajib dipilih.", "error");
    }
    try {
      setAddSaving(true);
      const formData = new FormData();
      formData.append("name", addForm.name);
      formData.append("username", addForm.username);
      formData.append("password", addForm.password);
      formData.append("role", addForm.role);
      formData.append("is_active", addForm.is_active);
      if (addPhotoFile) {
        formData.append("photo", addPhotoFile);
      }

      await api.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAddForm(initialForm);
      setAddPhotoFile(null);
      setShowAddModal(false);
      showToast("Akun berhasil dibuat.", "success");
      fetchUsers(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menambahkan akun.";
      showToast(msg, "error");
    } finally {
      setAddSaving(false);
    }
  };

  const handleEditOpen = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
    });
    setEditPhotoFile(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setEditSaving(true);
      const usernameRegex = /^[A-Za-z0-9]+$/;
      if (!usernameRegex.test(editForm.username)) {
        return showToast("Username hanya boleh berisi huruf kecil, huruf besar, dan angka.", "error");
      }
      if (!editForm.role) {
        return showToast("Role wajib dipilih.", "error");
      }
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("username", editForm.username);
      formData.append("role", editForm.role);
      formData.append("is_active", editForm.is_active);
      if (editPhotoFile) {
        formData.append("photo", editPhotoFile);
      }

      await api.put(`/users/${editUser.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowEditModal(false);
      setEditUser(null);
      showToast("Akun berhasil diperbarui.", "success");
      fetchUsers(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal memperbarui akun.";
      showToast(msg, "error");
    } finally {
      setEditSaving(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    try {
      setResetSaving(true);
      await api.patch(`/users/${resetUser.id}/password`, { password: newPassword });
      setShowResetModal(false);
      setResetUser(null);
      setNewPassword("");
      showToast(`Password untuk akun ${resetUser.username} berhasil direset.`, "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mereset password.";
      showToast(msg, "error");
    } finally {
      setResetSaving(false);
    }
  };
  const handleDelete = (user) => {
    // Client-side guard
    if (user.role === "admin" && stats.admin <= 1) {
      return showToast("Tidak dapat menghapus admin utama. Setidaknya harus ada satu administrator aktif.", "warning");
    }

    setDeleteTarget(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSaving(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      showToast("Akun berhasil dihapus.", "success");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchUsers(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menghapus akun.";
      showToast(msg, "error");
    } finally {
      setDeleteSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.is_active === 1 ? 0 : 1;
    try {
      await api.patch(`/users/${user.id}/status`, { is_active: newStatus });
      fetchUsers(false);
      showToast(`Status akun ${user.username} berhasil diperbarui.`, "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal merubah status akun.";
      showToast(msg, "error");
    }
  };

  // Stats Calculations
  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    guru: users.filter((u) => u.role === "guru").length,
    siswa: users.filter((u) => u.role === "siswa").length,
    aktif: users.filter((u) => u.is_active === 1).length,
    nonaktif: users.filter((u) => u.is_active === 0).length,
  };

  // Filter & Search Logic
  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole ? u.role === filterRole : true;
    const matchesActive = filterActive !== "" ? u.is_active === Number(filterActive) : true;
    const matchesKeyword = searchKeyword ? u.name.toLowerCase().includes(searchKeyword.toLowerCase()) || u.username.toLowerCase().includes(searchKeyword.toLowerCase()) : true;
    return matchesRole && matchesActive && matchesKeyword;
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Manajemen Akun"
        description="Kelola akun Administrator, Guru, dan Siswa. Monitor inaktivitas dan lakukan reset password secara terpusat."
        action={
          <button onClick={() => setShowAddModal(true)} className="btn-primary gap-2">
            <UserPlus size={18} /> Tambah Akun
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
        <div className="card p-4 flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Akun</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center border-l-4 border-l-indigo-500">
          <p className="text-xs font-bold text-slate-400 uppercase">Admin</p>
          <p className="text-2xl font-black text-indigo-700 mt-1">{stats.admin}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-400 uppercase">Guru</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.guru}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-400 uppercase">Siswa</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.siswa}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center border-l-4 border-l-teal-500">
          <p className="text-xs font-bold text-slate-400 uppercase">Aktif</p>
          <p className="text-2xl font-black text-teal-700 mt-1">{stats.aktif}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center border-l-4 border-l-rose-500">
          <p className="text-xs font-bold text-slate-400 uppercase">Nonaktif</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{stats.nonaktif}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Cari nama atau username..." className="input pl-10 py-1.5 w-64 text-sm" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
          </div>

          <select className="input py-1.5 px-3 w-40 text-sm" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">Semua Peran</option>
            <option value="admin">Administrator</option>
            <option value="guru">Guru</option>
            <option value="siswa">Siswa</option>
          </select>

          <select className="input py-1.5 px-3 w-40 text-sm" value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="1">Aktif</option>
            <option value="0">Nonaktif</option>
          </select>
        </div>

        <button onClick={() => fetchUsers(true)} className="btn-secondary py-2 px-3 flex items-center gap-1.5 text-xs font-bold">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Users Table Card */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-950">Daftar Akun Pengguna</h2>
          <span className="text-xs font-semibold text-slate-400">Auto refresh aktif (5d)</span>
        </div>

        {loading && <p className="p-6 text-sm text-slate-500">Memuat data akun...</p>}
        {error && <p className="p-6 text-sm font-semibold text-rose-600">{error}</p>}
        {!loading && filteredUsers.length === 0 && <EmptyState title="Akun tidak ditemukan" description="Tidak ada akun yang sesuai dengan filter atau kata kunci." />}

        {!loading && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="table-head">
                <tr>
                  <th className="px-6 py-3 w-16 text-center">Foto</th>
                  <th className="px-6 py-3">Nama Lengkap</th>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3 w-40">Peran</th>
                  <th className="px-6 py-3 w-36 text-center">Status</th>
                  <th className="px-6 py-3 w-44">Tanggal Dibuat</th>
                  <th className="px-6 py-3 w-40 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="table-cell text-center flex justify-center py-3">
                      <Avatar photoUrl={item.photo_url} name={item.name} size="sm" />
                    </td>
                    <td className="table-cell font-bold text-slate-900">{item.name}</td>
                    <td className="table-cell font-mono text-slate-600">{item.username}</td>
                    <td className="table-cell uppercase text-xs font-black tracking-wider">
                      {item.role === "admin" && <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Admin</span>}
                      {item.role === "guru" && <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Guru</span>}
                      {item.role === "siswa" && <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Siswa</span>}
                    </td>
                    <td className="table-cell text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border transition ${
                          item.is_active === 1 ? "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100" : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                        }`}
                      >
                        {item.is_active === 1 ? (
                          <>
                            <CheckCircle2 size={12} /> Aktif
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Nonaktif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="table-cell text-slate-500 text-xs">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditOpen(item)} title="Edit Akun" className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition">
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setResetUser(item);
                            setShowResetModal(true);
                          }}
                          title="Reset Password"
                          className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition"
                        >
                          <Key size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Hapus Akun"
                          className="rounded-xl bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 transition"
                          disabled={item.id === user.id} // Cannot delete self
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-black text-slate-950">Tambah Akun Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="rounded-xl bg-slate-50 p-1.5 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="mb-5 flex justify-center">
                <UploadPhoto name={addForm.name || "U"} onChange={(file) => setAddPhotoFile(file)} size="lg" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input className="input w-full" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Username</label>
                  <input className="input w-full" value={addForm.username} onChange={(e) => setAddForm({ ...addForm, username: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input className="input w-full" type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Peran (Role)</label>
                  <select className="input w-full" value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} required>
                    <option value="admin">Administrator</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>
              </div>

              <label className="label mt-4">Status Akun</label>
              <select className="input w-full mb-6" value={addForm.is_active} onChange={(e) => setAddForm({ ...addForm, is_active: Number(e.target.value) })}>
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </select>

              <button disabled={addSaving} className="btn-primary w-full gap-2 py-3 font-bold rounded-2xl disabled:opacity-60">
                <Save size={18} /> {addSaving ? "Menyimpan..." : "Simpan Akun"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-black text-slate-950">Edit Akun</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditUser(null);
                }}
                className="rounded-xl bg-slate-50 p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="mb-5 flex justify-center">
                <UploadPhoto name={editForm.name || "U"} initialPreview={editUser.photo_url} onChange={(file) => setEditPhotoFile(file)} size="lg" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input className="input w-full" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Username</label>
                  <input className="input w-full" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Peran (Role)</label>
                  <select className="input w-full" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} required>
                    <option value="admin">Administrator</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status Akun</label>
                  <select className="input w-full" value={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: Number(e.target.value) })}>
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </div>
              </div>

              <button disabled={editSaving} className="btn-primary w-full gap-2 py-3 font-bold mt-6 rounded-2xl disabled:opacity-60">
                <Save size={18} /> {editSaving ? "Menyimpan..." : "Perbarui Akun"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-black text-slate-950">Reset Password</h3>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetUser(null);
                  setNewPassword("");
                }}
                className="rounded-xl bg-slate-50 p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Masukkan password baru untuk akun <span className="font-bold text-slate-950 font-mono">{resetUser.username}</span>:
            </p>

            <form onSubmit={handleResetSubmit}>
              <label className="label">Password Baru</label>
              <input type="password" className="input w-full mb-5 font-mono" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />

              <button className="btn-primary w-full gap-2 font-bold py-2.5 rounded-2xl">
                <Key size={16} /> Reset Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">Konfirmasi Hapus Akun</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Anda akan menghapus akun <span className="font-bold">{deleteTarget.name}</span> (<span className="font-mono">{deleteTarget.username}</span>) secara permanen. Tindakan ini tidak dapat dibatalkan.
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
