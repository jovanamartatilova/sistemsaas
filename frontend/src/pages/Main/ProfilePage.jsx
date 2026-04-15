import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../api/authService';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        setProfileData(response.company);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '50px auto',
      padding: '20px',
    }}>
      <h2>Profil Perusahaan</h2>
      
      {profileData && (
        <div style={{
          border: '1px solid #ccc',
          padding: '20px',
          borderRadius: '5px',
          marginBottom: '20px',
        }}>
          <p><strong>ID Perusahaan:</strong> {profileData.id_company}</p>
          <p><strong>Nama Perusahaan:</strong> {profileData.name}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>Alamat:</strong> {profileData.address}</p>
          <p><strong>Telepon:</strong> {profileData.phone || '-'}</p>
          <p><strong>Terdaftar:</strong> {new Date(profileData.created_at).toLocaleDateString('id-ID')}</p>
        </div>
      )}

      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Logout
      </button>
    </div>
  );
}
