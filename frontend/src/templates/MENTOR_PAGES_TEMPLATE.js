// QUICK UPDATE GUIDE FOR REMAINING MENTOR PAGES
// Apply these changes to: ScoreRecapMentor, InputScoreMentor, CertificateMentor, EvaluationMentor, CompetenciesMentor.jsx

// STEP 1: Replace all imports at the top of file with:
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SidebarMentor } from "./DashboardMentor";
import { mentorApi } from "../../api/mentorApi";
import { useAuthStore } from "../../stores/authStore";

// STEP 2: Inside your component function, ADD these hooks:
const navigate = useNavigate();
const [mentor, setMentor] = useState(null);

// STEP 3: In your useEffect or fetch function, ADD:
const profileRes = await mentorApi.getProfile();
setMentor(profileRes.data);

// STEP 4: ADD this function after your fetch functions:
const handleLogout = () => {
  localStorage.clear();
  useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
  navigate("/login");
};

// STEP 5: Find ALL places where <SidebarMentor /> appears and replace with:
<SidebarMentor mentor={mentor} onLogout={handleLogout} />

// Example fetch function pattern:
const fetchData = async () => {
  try {
    setLoading(true);
    const [profileRes, dataRes] = await Promise.all([
      mentorApi.getProfile(),
      mentorApi.getInterns(), // or whatever endpoint you need
    ]);
    setMentor(profileRes.data);
    setData(dataRes.data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
