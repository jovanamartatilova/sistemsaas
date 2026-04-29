import { useState } from "react";
import { LogOut } from "lucide-react";
import SidebarCandidate from "./SidebarCandidate";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

/**
 * DashboardLayout - Reusable layout component for candidate dashboard
 * Props:
 *  - children: Page content
 *  - userName: User name for sidebar (optional, will use auth store if not provided)
 *  - userPhoto: User photo URL (optional, will use auth store if not provided)
 *  - company: Company object (optional, will use auth store if not provided)
 */
export default function DashboardLayout({
  children,
  userName,
  userPhoto,
  company,
}) {
  const navigate = useNavigate();
  const { logout, user, company: authCompany } = useAuthStore();
  const [logoutModal, setLogoutModal] = useState(false);

  // Fallback to auth store if props not provided
  const displayName = userName || user?.name || "User";
  const displayPhoto = userPhoto || user?.photo_path || user?.photo || null;
  const displayCompany = company || authCompany || null;

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleLogoutClick = () => {
    setLogoutModal(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <SidebarCandidate
        userName={displayName}
        userPhoto={displayPhoto}
        company={displayCompany}
        onLogout={handleLogoutClick}
      />

      {/* Main Content */}
      <main className="flex-1 ml-56">
        <div className="min-h-screen p-8">{children}</div>
      </main>

      {/* Logout Modal */}
      {logoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
