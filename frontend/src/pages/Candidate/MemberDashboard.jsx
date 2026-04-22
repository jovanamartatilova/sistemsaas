import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { isIndependent, debugUserRole, getScopedRole } from "../../utils/roleUtils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Task Status Badge Component (matches existing design)
function TaskStatusBadge({ status }) {
  const statusConfig = {
    pending: { bg: "bg-amber-50", text: "text-amber-600", label: "Pending" },
    "in_progress": { bg: "bg-blue-50", text: "text-blue-600", label: "In Progress" },
    "in progress": { bg: "bg-blue-50", text: "text-blue-600", label: "In Progress" },
    done: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Completed" },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// Task Status Icon Component
function TaskStatusIcon({ status }) {
  const statusConfig = {
    pending: { icon: AlertCircle, color: "text-amber-500" },
    "in_progress": { icon: Clock, color: "text-blue-500" },
    "in progress": { icon: Clock, color: "text-blue-500" },
    done: { icon: CheckCircle, color: "text-emerald-500" },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const Icon = config.icon;

  return <Icon size={18} className={config.color} />;
}


// Task Card Component (matches existing design)
function TaskCard({ task, isIndependent, onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(task.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = ["pending", "in_progress", "done"];
  const normalizedStatus = task.status?.toLowerCase().replace(" ", "_") || "pending";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 hover:shadow-sm transition-shadow">
      {/* Header with title and status icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
          {task.description && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <TaskStatusIcon status={task.status} />
      </div>

      {/* Metadata - only show if part of team */}
      {!isIndependent && task.assignedBy && (
        <div className="text-xs text-slate-600 border-t border-slate-100 pt-3">
          <p>
            <span className="font-medium text-slate-700">Assigned by:</span> {task.assignedBy}
          </p>
          {task.deadline && (
            <p className="mt-1">
              <span className="font-medium text-slate-700">Deadline:</span> {new Date(task.deadline).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Status and Action Buttons */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">Status</span>
          <TaskStatusBadge status={task.status} />
        </div>

        {/* Status Change Buttons */}
        <div className="flex gap-2 pt-1">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isUpdating || normalizedStatus === status}
              className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
                normalizedStatus === status
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {status === "in_progress" ? "Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function MemberDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, company } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [userIsIndependent, setUserIsIndependent] = useState(false);

  useEffect(() => {
    fetchMemberTasks();
    
    // Debug: Check user and team info
    debugUserRole(user, "MemberDashboard");
    console.log("MemberDashboard - userIsIndependent:", isIndependent(user));
  }, []);

  const fetchMemberTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");

      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // Determine which endpoint to use based on role
      const scopedRole = getScopedRole(user);
      const endpoint = scopedRole === "leader" ? `/leader/tasks` : `/member/tasks`;
      
      console.log("MemberDashboard - fetching from endpoint:", endpoint, "for role:", scopedRole);

      // Fetch tasks based on role
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data.data || []);
      
      // Check if user is independent (no team/leader) using utility function
      setUserIsIndependent(isIndependent(user));
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
      // Set mock tasks for demo purposes
      setTasks([
        {
          id: 1,
          title: "Complete Project Proposal",
          description: "Prepare and submit the quarterly project proposal",
          status: "in_progress",
          assignedBy: "John Leader",
          deadline: "2024-05-15",
        },
        {
          id: 2,
          title: "Code Review",
          description: "Review pull requests and provide feedback",
          status: "pending",
          assignedBy: "John Leader",
          deadline: "2024-05-10",
        },
        {
          id: 3,
          title: "Documentation Update",
          description: "Update technical documentation",
          status: "done",
          assignedBy: "John Leader",
          deadline: "2024-05-01",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");

      // Determine which endpoint to use based on role
      const scopedRole = getScopedRole(user);
      const endpoint = scopedRole === "leader" ? `/leader/tasks/${taskId}` : `/member/tasks/${taskId}`;

      // Normalize status value (convert "in_progress" to proper format if needed)
      const payload = {
        status: newStatus, // send as provided (pending, in_progress, done)
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to update task`);
      }

      const data = await response.json();
      
      // Update local state optimistically
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Error updating task status:", err);
      // Show error but allow retry
      const message = err.message || "Failed to update task status. Please try again.";
      alert(message);
      // Optionally refresh data on error
      // fetchMemberTasks();
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
        {/* Header - consistent with other pages */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-sm text-slate-600 mt-2">
            {tasks.length > 0
              ? `You have ${tasks.length} task${tasks.length !== 1 ? "s" : ""}`
              : "No tasks assigned yet"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <p className="text-sm text-rose-700 font-medium">{error}</p>
            <button
              onClick={fetchMemberTasks}
              className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tasks List */}
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isIndependent={userIsIndependent}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <CheckCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-700 font-semibold text-base">No Tasks Assigned</p>
            <p className="text-slate-600 text-sm mt-1">
              {isIndependent
                ? "You're working independently. Tasks will appear here once assigned."
                : "Your team leader will assign tasks to you here."}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
