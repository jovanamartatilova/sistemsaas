/**
 * Utility untuk mendeteksi role/scoped_role dari user object
 * Backend mungkin mengirim dengan nama field yang berbeda
 */

export function getScopedRole(user) {
  if (!user) return null;

  // Try multiple field names yang mungkin digunakan backend
  return (
    user.scoped_role ||
    user.team_role ||
    user.role_type ||
    user.team_scoped_role ||
    null
  );
}

/**
 * Check apakah user adalah leader
 */
export function isLeader(user) {
  const role = getScopedRole(user);
  return role === "leader" || role === "Team Leader";
}

/**
 * Check apakah user adalah member
 */
export function isMember(user) {
  const role = getScopedRole(user);
  return role === "member" || role === "Team Member" || role === "team_member";
}

/**
 * Check apakah user independent (tidak ada team)
 */
export function isIndependent(user) {
  return !user?.team_id && !user?.leader_id && !user?.team_name;
}

/**
 * Debug: Log user role information
 */
export function debugUserRole(user, context = "") {
  console.log(`[DEBUG ${context}]`, {
    scoped_role: user?.scoped_role,
    team_role: user?.team_role,
    role_type: user?.role_type,
    role: user?.role,
    team_id: user?.team_id,
    leader_id: user?.leader_id,
    team_name: user?.team_name,
    detected_role: getScopedRole(user),
    is_leader: isLeader(user),
    is_member: isMember(user),
    is_independent: isIndependent(user),
  });
}
