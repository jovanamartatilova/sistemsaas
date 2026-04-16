import { User, LogOut, Upload, ChevronDown, LayoutDashboard, BookOpen, Award } from "lucide-react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";

// --- Sidebar ---
function Sidebar({ userName, onLogout }) {
  const { slug } = useParams();
  const location = useLocation();
  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, to: `/c/${slug}/dashboard` },
    { label: "Programs", icon: <BookOpen size={16} />, to: `/c/${slug}/programs` },
    { label: "My Profile", icon: <User size={16} />, to: `/c/${slug}/profile` },
    { label: "Certificates", icon: <Award size={16} />, to: `/c/${slug}/certificates` },
  ];

  return (
    <aside className="w-56 min-h-screen bg-[#0f1e3a] text-white flex flex-col px-4 py-6 fixed top-0 left-0 z-10">
      <Link to="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity cursor-pointer">
        <img src="/assets/images/logo.png" alt="EarlyPath" className="h-16 w-auto" />
        <span className="font-bold text-lg tracking-tight">EarlyPath</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.label} to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-[#1a2f54] hover:text-white"}`}>
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
          {userName?.charAt(0).toUpperCase() || "U"}
        </div>
        <span className="text-sm text-slate-300 flex-1">{userName || "User"}</span>
        <button
          onClick={onLogout}
          className="text-slate-500 hover:text-white cursor-pointer transition-colors"
          title="Logout"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}

// --- Main Content ---
function ProfileContent({ userData, setUserData }) {
  const { slug } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const [formData, setFormData] = useState({
    full_name:       userData?.full_name || "",
    email:           userData?.email || "",
    phone_number:    userData?.phone_number || "",
    university_name: userData?.university || "",
    major_name:      userData?.major || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userData?.profile_picture || null);

  // Sync formData ketika userData berubah
  useEffect(() => {
    if (userData) {
      setFormData({
        full_name:       userData?.full_name || "",
        email:           userData?.email || "",
        phone_number:    userData?.phone_number || "",
        university_name: userData?.university || "",
        major_name:      userData?.major || "",
      });
      setAvatarPreview(userData?.profile_picture || null);
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

      // Update profile
      const profileResponse = await fetch(`${API_BASE_URL}/users/${userData?.id_user}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Upload avatar jika ada
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("avatar", avatarFile);

        const uploadResponse = await fetch(`${API_BASE_URL}/users/${userData?.id_user}/upload-avatar`, {
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
      const refreshResponse = await fetch(`${API_BASE_URL}/users/me`, {
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
          full_name:       updatedUser?.full_name || "",
          email:           updatedUser?.email || "",
          phone_number:    updatedUser?.phone_number || "",
          university_name: updatedUser?.university || "",
          major_name:      updatedUser?.major || "",
        });

        if (updatedUser?.profile_picture) {
          setAvatarPreview(updatedUser.profile_picture);
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
      full_name:       userData?.full_name || "",
      email:           userData?.email || "",
      phone_number:    userData?.phone_number || "",
      university_name: userData?.university || "",
      major_name:      userData?.major || "",
    });
    setAvatarFile(null);
    setAvatarPreview(userData?.profile_picture || null);
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
        <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${
          message.type === "success"
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
            <p className="text-gray-500 text-sm text-left">{userData?.role || "Apprentice"}</p>
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
              Format: JPG, PNG. Ukuran maks. 2MB.
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
            <label className="text-xs text-gray-500 font-medium text-left">Universitas</label>
            <input
              type="text"
              name="university_name"
              value={formData.university_name}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Nama universitas kamu"
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Jurusan — full width */}
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs text-gray-500 font-medium text-left">Jurusan</label>
            <input
              type="text"
              name="major_name"
              value={formData.major_name}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Jurusan kamu"
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
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
        © 2025 EarlyPath · Platform Magang Modern
      </p>
    </div>
  );
}

// --- Page ---
export default function ProfileSettings() {
  const navigate = useNavigate();
  const { logout: globalLogout } = useAuthStore();
  const { slug } = useParams();
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate(`/c/${slug}/dashboard`);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

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
  }, [navigate, slug]);

  const handleLogout = async () => {
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
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
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
      <Sidebar userName={userData?.full_name} onLogout={handleLogout} />
      <div className="ml-56 flex-1 flex flex-col">
        <main className="p-6">
          <ProfileContent userData={userData} setUserData={setUserData} />
        </main>
      </div>
    </div>
  );
}