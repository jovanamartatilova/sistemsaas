import { User, LogOut, Upload, ChevronDown, LayoutDashboard, BookOpen, Award } from "lucide-react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { LoadingSpinner } from "../../components/LoadingSpinner";

import SidebarCandidate from "../../components/SidebarCandidate";

// --- Main Content ---
function ProfileContent({ userData, setUserData }) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const [formData, setFormData] = useState({
    full_name: userData?.name || "",
    email: userData?.email || "",
    phone_number: userData?.phone || "",
    university_name: userData?.university || "",
    major_name: userData?.major || "",
    bank_name: userData?.bank_name || "",
    bank_account_number: userData?.bank_account_number || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userData?.photo_url || null);

  // Sync formData ketika userData berubah
  useEffect(() => {
    if (userData) {
      setFormData({
        full_name: userData?.name || "",
        email: userData?.email || "",
        phone_number: userData?.phone || "",
        university_name: userData?.university || "",
        major_name: userData?.major || "",
        bank_name: userData?.bank_name || "",
        bank_account_number: userData?.bank_account_number || "",
      });
      setAvatarPreview(userData?.photo_url || null);
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "File size must be less than 2MB" });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Authentication required. Please login again." });
        return;
      }

      // Update profile using /candidate/profile endpoint
      const profileResponse = await fetch(`${API_BASE_URL}/candidate/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.full_name,
          phone: formData.phone_number,
          university_name: formData.university_name,
          major_name: formData.major_name,
          bank_name: formData.bank_name,
          bank_account_number: formData.bank_account_number,
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Upload avatar jika ada
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("photo", avatarFile);

        const uploadResponse = await fetch(`${API_BASE_URL}/candidate/profile/photo`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || "Failed to upload avatar");
        }
      }

      // Fetch data terbaru dari server
      const refreshResponse = await fetch(`${API_BASE_URL}/candidate/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const updatedUser = refreshData.data || refreshData;

        setUserData(updatedUser);
        localStorage.setItem("candidate_user", JSON.stringify(updatedUser));

        setFormData({
          full_name: updatedUser?.name || "",
          email: updatedUser?.email || "",
          phone_number: updatedUser?.phone || "",
          university_name: updatedUser?.university || "",
          major_name: updatedUser?.major || "",
          bank_name: updatedUser?.bank_name || "",
          bank_account_number: updatedUser?.bank_account_number || "",
        });

        if (updatedUser?.photo_url) {
          setAvatarPreview(updatedUser.photo_url);
        }
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setAvatarFile(null);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: userData?.name || "",
      email: userData?.email || "",
      phone_number: userData?.phone || "",
      university_name: userData?.university || "",
      major_name: userData?.major || "",
      bank_name: userData?.bank_name || "",
      bank_account_number: userData?.bank_account_number || "",
    });
    setAvatarFile(null);
    setAvatarPreview(userData?.photo_url || null);
    setMessage({ type: "", text: "" });
  };

  const initials = formData.full_name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase() || "UN";

  return (
    <div className="flex-1 w-full">
      {/* Page header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Update Your Profile</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${message.type === "success"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-700 border border-red-200"
          }`}>
          {message.text}
        </div>
      )}

      {/* Public Profile */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 tracking-widest mb-5">PUBLIC PROFILE</p>

        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300 overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-500 font-bold text-2xl">{initials}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-indigo-500 transition-colors cursor-pointer">
              <Upload size={12} className="text-white" />
              <input
                type="file"
                accept="image/jpg,image/jpeg,image/png"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Name + actions */}
          <div className="flex flex-col gap-0.5">
            <p className="text-gray-900 font-bold text-lg text-left">{formData.full_name}</p>
            <p className="text-gray-400 text-xs mb-3 text-left">
              {formData.university_name || "Universitas belum diisi"}
            </p>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                <Upload size={12} />
                Upload New Profile Picture
                <input
                  type="file"
                  accept="image/jpg,image/jpeg,image/png"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                className="px-4 py-1.5 border border-red-300 text-red-400 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
            <p className="text-gray-300 text-[10px] mt-1.5 text-left">
              Formats: JPG, PNG. Max size 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 tracking-widest mb-5">PERSONAL INFORMATION</p>

        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium text-left">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              disabled={loading}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium text-left">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* No. HP */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium text-left">No. Handphone</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              disabled={loading}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Universitas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium text-left">University</label>
            <input
              type="text"
              name="university_name"
              value={formData.university_name}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Your university name"
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Jurusan — full width */}
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs text-gray-500 font-medium text-left">Major</label>
            <input
              type="text"
              name="major_name"
              value={formData.major_name}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Your Major"
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Bank Information */}
        <div className="mt-8">
          <p className="text-xs font-semibold text-gray-400 tracking-widest mb-5 uppercase">Bank Account Information</p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium text-left">Bank Name</label>
              <select
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                disabled={loading}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                <option value="">Select Bank</option>
                <option value="BCA">Bank Central Asia (BCA)</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="BNI">Bank Negara Indonesia (BNI)</option>
                <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                <option value="BTPN">Bank BTPN / Jenius</option>
                <option value="CIMB">CIMB Niaga</option>
                <option value="Danamon">Bank Danamon</option>
                <option value="Permata">Bank Permata</option>
                <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                <option value="OCBC">OCBC NISP</option>
                <option value="Maybank">Maybank Indonesia</option>
                <option value="Panin">Panin Bank</option>
                <option value="Bank Jago">Bank Jago</option>
                <option value="Allo Bank">Allo Bank</option>
                <option value="SeaBank">SeaBank Indonesia</option>
                <option value="Other">Other Bank</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium text-left">Account Number</label>
              <input
                type="text"
                name="bank_account_number"
                value={formData.bank_account_number}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Example: 1234567890"
                className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm hover:text-gray-800 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-gray-300 mt-6">
        © 2026 EarlyPath · All rights reserved
      </p>
    </div>
  );
}

// --- Page ---
export default function ProfileSettings() {
  const navigate = useNavigate();
  const { logout: globalLogout } = useAuthStore();
  const { idCompany } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const [userData, setUserData] = useState(() => {
    try {
      const cached = localStorage.getItem("candidate_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!userData);
  const [error, setError] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate(`/c/${idCompany}/dashboard`);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/candidate/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("token");
            localStorage.removeItem("company");
            localStorage.removeItem("user");
            localStorage.removeItem("candidate_user");
            navigate("/");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        const user = data.data || data;

        setUserData(user);
        localStorage.setItem("candidate_user", JSON.stringify(user));
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (!userData) setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, idCompany]);

  const handleLogoutClick = () => {
    setLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token");
      localStorage.removeItem("candidate_user");
      globalLogout();
      setLogoutModal(false);
      navigate("/");
    }
  };

  const handleLogout = handleLogoutClick;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarCandidate 
          userName={userData?.name} 
          userPhoto={userData?.photo_url}
          company={JSON.parse(localStorage.getItem("company"))}
          onLogout={handleLogout} 
        />
        <main className="ml-56 flex-1 flex items-center justify-center">
          <LoadingSpinner message="Loading profile..." />
        </main>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarCandidate 
        userName={userData?.name} 
        userPhoto={userData?.photo_url}
        company={JSON.parse(localStorage.getItem("company"))}
        onLogout={handleLogout} 
      />
      <div className="ml-56 flex-1 flex flex-col">
        <main className="p-6">
          <ProfileContent userData={userData} setUserData={setUserData} />
        </main>
      </div>

      {/* Logout Modal */}
      {logoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", textAlign: "left" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", marginBottom: "14px" }}>
              <LogOut size={20} />
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>Are you sure you want to sign out of your account?</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setLogoutModal(false)} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "700", color: "#64748b", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmLogout} style={{ padding: "9px 18px", borderRadius: "9px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}