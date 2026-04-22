import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Task Assignment Form Modal
function TaskAssignmentModal({ isOpen, onClose, teamMembers, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignTo: "",
    deadline: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.assignTo) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(formData);
    setFormData({ title: "", description: "", assignTo: "", deadline: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Assign New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Complete Project Proposal"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed task description..."
              rows="3"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assign To *
            </label>
            <select
              name="assignTo"
              value={formData.assignTo}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">Select team member...</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Team Member Item Component
function TeamMemberItem({ member, isLeader }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
      {member.photo ? (
        <img
          src={member.photo.startsWith('http') ? member.photo : `http://localhost:8000/storage/${member.photo}`}
          alt={member.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {member.name?.charAt(0).toUpperCase() || "U"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-900">{member.name}</p>
          {isLeader && (
            <span className="text-[9px] font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full whitespace-nowrap">
              Leader
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-600">{member.email}</p>
      </div>
    </div>
  );
}

export default function LeaderTeamManagement() {
  const { slug } = useParams();
  const { user, company } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasksToShare, setTasksToShare] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderData();
  }, []);

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

      // Fetch both team members and tasks in parallel
      const [membersRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/leader/team-members`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE_URL}/leader/tasks`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (!membersRes.ok) {
        throw new Error("Failed to fetch team members");
      }

      const membersData = await membersRes.json();
      setTeamMembers(membersData.data || []);

      // Fetch tasks if available
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasksToShare(tasksData.data || []);
      }
    } catch (err) {
      setError(err.message);
      // Set mock data for demo
      setTeamMembers([
        {
          id: 1,
          name: "Budi Santoso",
          email: "budi@example.com",
          photo: null,
        },
        {
          id: 2,
          name: "Siti Nurhaliza",
          email: "siti@example.com",
          photo: null,
        },
        {
          id: 3,
          name: "Ahmad Hidayat",
          email: "ahmad@example.com",
          photo: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    // This function is now part of fetchLeaderData, kept for compatibility
    await fetchLeaderData();
  };

  const handleAssignTask = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/leader/tasks`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          assigned_to: formData.assignTo,
          deadline: formData.deadline,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign task");
      }

      setShowModal(false);
      alert("Task assigned successfully!");
      // Optionally refresh data
    } catch (err) {
      alert("Error assigning task: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMember = (member) => {
    // This could open an edit modal in the future
    console.log("Edit member:", member);
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/leader/team-members/${memberId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove member");
      }

      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
      alert("Member removed successfully!");
    } catch (err) {
      alert("Error removing member: " + err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        userName={user?.name}
        userPhoto={user?.photo}
        company={company}
      >
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={user?.name}
      userPhoto={user?.photo}
      company={company}
    >
      <div className="space-y-6">
        {/* Header - centered */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="text-sm text-slate-600 mt-1">Manage team members and assign tasks</p>
        </div>

        {/* Assign Task Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            <Plus size={18} />
            Assign Task
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Tasks to Share Section - Mentor-Assigned Tasks */}
        {tasksToShare.length > 0 && (
          <div className="space-y-3 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h2 className="text-sm font-bold text-slate-900">📋 Tasks to Share with Members</h2>
            <p className="text-xs text-slate-600">These tasks were assigned by your mentor. You can share them with your team members.</p>
            <div className="space-y-2">
              {tasksToShare.map((task) => (
                <div key={task.id} className="bg-white border border-indigo-100 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">{task.title}</p>
                      {task.description && (
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{task.description}</p>
                      )}
                      {task.deadline && (
                        <p className="text-[10px] text-slate-500 mt-1">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                      )}
                    </div>
                    <span className={`text-[9px] font-semibold px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${
                      task.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {task.status === 'in_progress' ? 'In Progress' : task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Members Section */}
        <div className="space-y-3 mt-8">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Team Members</h2>
            <p className="text-xs text-slate-600 mt-1">
              {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} in your team
            </p>
          </div>

          {teamMembers.length > 0 ? (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <TeamMemberItem
                  key={member.id}
                  member={member}
                  isLeader={false}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No team members yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Team members will appear here once they join your team
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Assignment Modal */}
      <TaskAssignmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        teamMembers={[
          // Include the leader (current user) first
          {
            id: user?.id_user || `leader-${Date.now()}`,
            name: `${user?.name || "You"} (Leader)`,
            email: user?.email || "",
            photo: user?.photo_path || user?.photo,
          },
          // Then include all team members
          ...teamMembers,
        ]}
        onSubmit={handleAssignTask}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  );
}
