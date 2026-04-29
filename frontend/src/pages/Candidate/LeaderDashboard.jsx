import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Stats Card Component
function StatsCard({ icon: Icon, label, value, color = "indigo" }) {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
        <Icon size={24} />
      </div>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

// Team Member Card Component
function TeamMemberCard({ member, onViewTasks }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        {member.photo ? (
          <img
            src={member.photo.startsWith('http') ? member.photo : `http://localhost:8000/storage/${member.photo}`}
            alt={member.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-white">
            {member.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
          <p className="text-xs text-slate-500">{member.email}</p>
        </div>
      </div>
      <button
        onClick={() => onViewTasks(member.id)}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        View Tasks
      </button>
    </div>
  );
}

export default function LeaderDashboard() {
  const navigate = useNavigate();
  const { user, company } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    fetchLeaderData();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/candidate/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.photo_url) {
          setUserPhoto(data.data.photo_url);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const fetchLeaderData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");

      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // Fetch leader dashboard data
      const response = await fetch(`${API_BASE_URL}/leader/dashboard`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leader dashboard");
      }

      const data = await response.json();
      setDashboardData(data.data || {
        totalMembers: 0,
        activeTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        teamMembers: [],
      });
    } catch (err) {
      setError(err.message);
      // Set mock data for demo purposes
      setDashboardData({
        totalMembers: 5,
        activeTasks: 12,
        completedTasks: 8,
        pendingTasks: 4,
        teamMembers: [
          { id: 1, name: "Budi Santoso", email: "budi@example.com", photo: null },
          { id: 2, name: "Siti Nurhaliza", email: "siti@example.com", photo: null },
          { id: 3, name: "Ahmad Hidayat", email: "ahmad@example.com", photo: null },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewTasks = (memberId) => {
    navigate(`/c/${company?.id_company}/member/tasks?team=${memberId}`);
  };

  const handleNavigateToTeam = () => {
    navigate(`/c/${company?.id_company}/leader/team`);
  };

  if (loading) {
    return (
      <DashboardLayout
        userName={user?.name}
        userPhoto={userPhoto || user?.photo}
        company={company}
      >
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={user?.name}
      userPhoto={userPhoto || user?.photo}
      company={company}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Team Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your team and track progress</p>
          </div>
          <button
            onClick={handleNavigateToTeam}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Team Management
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={Users}
            label="Team Members"
            value={dashboardData?.totalMembers || 0}
            color="indigo"
          />
          <StatsCard
            icon={TrendingUp}
            label="Active Tasks"
            value={dashboardData?.activeTasks || 0}
            color="emerald"
          />
          <StatsCard
            icon={CheckCircle}
            label="Completed"
            value={dashboardData?.completedTasks || 0}
            color="emerald"
          />
          <StatsCard
            icon={AlertCircle}
            label="Pending"
            value={dashboardData?.pendingTasks || 0}
            color="amber"
          />
        </div>

        {/* Team Members Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
            <p className="text-sm text-slate-600 mt-1">Manage your team and assign tasks</p>
          </div>
          {dashboardData?.teamMembers && dashboardData.teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.teamMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onViewTasks={handleViewTasks}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No team members yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Add members to your team to start assigning tasks
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
