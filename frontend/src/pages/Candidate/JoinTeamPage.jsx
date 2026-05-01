import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const getToken = () => localStorage.getItem("auth_token") || localStorage.getItem("token");

const getCompanyId = () => {
  try {
    return JSON.parse(localStorage.getItem("company") || "{}")?.id_company || null;
  } catch {
    return null;
  }
};

export default function JoinTeamPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    const join = async () => {
      const authToken = getToken();
      if (!authToken) {
        localStorage.setItem("redirect_after_login", `/join-team/${token}`);
        setStatus("not_logged_in");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/team-invitations/${token}/join`, {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();

        if (res.ok || data.already_joined) {
            setTeamName(data.team_name || "");
            setStatus("success");
            setMessage(data.message || "Successfully joined the team!");

            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const updatedUser = { ...currentUser, scoped_role: "member" };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            // Ambil company id dari data response atau dari user
            const companyId = getCompanyId() 
                || data?.company_id 
                || data?.id_company
                || currentUser?.id_company
                || currentUser?.company?.id_company;

            console.log("COMPANY ID:", companyId, "data:", JSON.stringify(data));

            setTimeout(() => {
                window.location.href = companyId ? `/c/${companyId}/dashboard` : "/";
            }, 2500);
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to join team");
        }
      } catch {
        setStatus("error");
        setMessage("A network error occurred. Please try again.");
      }
    };

    join();
  }, [token, navigate]);

  const handleGoToLogin = () => {
    const companyId = getCompanyId();
    localStorage.setItem("redirect_after_login", `/join-team/${token}`);
    navigate(companyId ? `/c/${companyId}/login` : "/");
  };

  const btnStyle = {
    padding: "10px 24px", borderRadius: 10, background: "#4f46e5",
    color: "#fff", border: "none", fontWeight: 700, cursor: "pointer",
    fontSize: 13, fontFamily: "Poppins, sans-serif",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f8fafc",
      fontFamily: "Poppins, sans-serif"
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "48px 40px",
        textAlign: "center", maxWidth: "380px", width: "100%",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0"
      }}>
        {status === "loading" && (
          <>
            <Loader size={40} color="#4f46e5" style={{ animation: "spin 1s linear infinite", marginBottom: 16 }} />
            <p style={{ color: "#64748b", fontSize: 14 }}>Processing invitation...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={48} color="#10b981" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
              Successfully Joined!
            </h2>
            {teamName && <p style={{ color: "#4f46e5", fontWeight: 700, marginBottom: 8 }}>{teamName}</p>}
            <p style={{ color: "#64748b", fontSize: 13 }}>{message}</p>
            <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 8 }}>Redirecting to your programs...</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Failed to Join</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{message}</p>
            <button onClick={handleGoToLogin} style={btnStyle}>Back to Home</button>
          </>
        )}

        {status === "not_logged_in" && (
            <>
                <AlertCircle size={48} color="#f59e0b" style={{ marginBottom: 16 }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Login Required</h2>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
                You need to log in first to join this team.
                </p>
                <button onClick={handleGoToLogin} style={btnStyle}>Go to Login</button>
            </>
            )}

            {/* fallback debug */}
            <p style={{ color: "#94a3b8", fontSize: 11, marginTop: 16 }}>status: {status}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}