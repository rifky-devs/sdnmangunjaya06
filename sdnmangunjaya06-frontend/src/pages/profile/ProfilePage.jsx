import React, { useState, useEffect } from 'react';
import { Camera, Shield, User, AlertCircle, CheckCircle2, Save, Sparkles } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';

export default function ProfilePage() {
  const { user, updateUserSession } = useAuth();
  const { showToast } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await api.get('/profile/me');
      setProfile(data);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Gagal memuat profil.');
      showToast('Gagal memuat profil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    setErrorMsg('');
    setSuccessMsg('');
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (500 KB = 512,000 bytes)
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      setErrorMsg("Ukuran foto maksimal 500 KB.");
      setSelectedFile(null);
      setPreviewUrl(null);
      showToast("Ukuran foto maksimal 500 KB.", "error");
      return;
    }

    // Validate format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Format foto harus JPG, JPEG, PNG, atau WEBP.");
      setSelectedFile(null);
      setPreviewUrl(null);
      showToast("Format foto harus JPG, JPEG, PNG, atau WEBP.", "error");
      return;
    }

    // Set file & preview
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);

      const { data } = await api.patch('/profile/me/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update local profile state
      setProfile(prev => ({
        ...prev,
        photo: data.photo,
        photo_url: data.photo_url
      }));

      // Update sessionStorage and user state globally via AuthContext
      updateUserSession({
        photo: data.photo,
        photo_url: data.photo_url
      });

      // Update localStorage to ensure total persistence
      const savedUserStr = localStorage.getItem("sdn_user") || sessionStorage.getItem("sdn_user");
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        localStorage.setItem("sdn_user", JSON.stringify({
          ...parsed,
          photo: data.photo,
          photo_url: data.photo_url
        }));
      }

      setSuccessMsg("Foto profil berhasil diperbarui.");
      showToast("Foto profil berhasil diperbarui.", "success");
      setSelectedFile(null);
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Gagal memperbarui foto profil.';
      setErrorMsg(errMsg);
      showToast(errMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Cleanup preview URL object to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <>
      <PageHeader
        eyebrow="Akun"
        title="Profil Saya"
        description="Kelola informasi identitas Anda dan lakukan pembaruan berkas foto profil pribadi."
      />

      {loading ? (
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-soft animate-pulse flex items-center justify-center h-64">
          <p className="text-sm text-slate-400 font-bold">Memproses data profil...</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {errorMsg && (
            <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-bold text-rose-700 flex items-center gap-2.5">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 rounded-2xl bg-teal-50 border border-teal-100 p-4 text-xs font-bold text-teal-800 flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-teal-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <AnimatedCard hoverEffect={false} className="p-8">
            <form onSubmit={handleUpload} className="space-y-8">
              {/* Photo Upload Area */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-full ring-4 ring-teal-500/10 shadow-lg">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview Foto" 
                        className="h-28 w-28 object-cover rounded-full" 
                      />
                    ) : (
                      <Avatar 
                        photoUrl={profile?.photo_url} 
                        name={profile?.name} 
                        size="lg" 
                        className="h-28 w-28 text-2xl" 
                      />
                    )}
                  </div>
                  
                  <label 
                    htmlFor="photo-upload" 
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-r from-teal-700 to-emerald-600 text-white shadow-md cursor-pointer ring-2 ring-white hover:scale-105 transition"
                  >
                    <Camera size={14} />
                    <input 
                      id="photo-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg,image/jpg,image/png,image/webp" 
                      onChange={handleFileChange} 
                    />
                  </label>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-black text-slate-900 leading-tight font-plus-jakarta">{profile?.name}</h3>
                  <p className="text-[10px] font-extrabold text-teal-700 mt-1 uppercase tracking-widest font-mono">@{profile?.username}</p>
                </div>
              </div>

              {/* Biodata Summary Info (Read-Only) */}
              <div className="bg-slate-50 p-5 rounded-[1.75rem] border border-slate-100/80 grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">Nama Pengguna</span>
                  <span className="font-bold text-slate-800 block">{profile?.name || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">Username Login</span>
                  <span className="font-bold text-slate-800 block font-mono">@{profile?.username || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">Hak Akses Sistem</span>
                  <span className="font-black text-teal-700 uppercase block tracking-wider">{profile?.role || '-'}</span>
                </div>
                {profile?.role === 'siswa' && (
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">Nomor Induk Siswa (NIS)</span>
                    <span className="font-bold text-slate-800 block font-mono">{profile?.nis || '-'}</span>
                  </div>
                )}
                {profile?.role === 'guru' && (
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">NIP Guru</span>
                    <span className="font-bold text-slate-800 block font-mono">{profile?.teacher_code || '-'}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedFile && (
                <div className="flex gap-3 justify-center">
                  <button 
                    type="button" 
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setErrorMsg('');
                    }}
                    className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition font-plus-jakarta"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="btn-primary gap-2 px-5 py-3 font-bold text-xs rounded-2xl shadow-lg shadow-teal-500/10 font-plus-jakarta"
                  >
                    <Save size={15} />
                    {saving ? "Menyimpan..." : "Simpan Foto"}
                  </button>
                </div>
              )}
            </form>
          </AnimatedCard>
        </div>
      )}
    </>
  );
}
