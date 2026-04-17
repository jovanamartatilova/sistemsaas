/**
 * IMPORTANT: API Response Changes
 * 
 * The MentorController.getDashboard() endpoint now returns different metrics.
 * Update any frontend consumers accordingly.
 */

// OLD RESPONSE (Deprecated)
// {
//   "total_interns": 10,
//   "interns_passed": 5,
//   "in_progress": 5,           ← Remove this field
//   "recent_interns": [...]
// }

// NEW RESPONSE (Current)
// {
//   "total_interns": 10,
//   "pending_scores": 2,        ← NEW: Interns without scores
//   "needs_input": 1,           ← NEW: Scores but no evaluation
//   "interns_passed": 5,        ← KEPT: Recommendation = Pass
//   "ready_for_certificate": 5, ← NEW: For certificate issuance
//   "average_score": 78.5,      ← NEW: Average of all scores
//   "recent_interns": [...]
// }

// Updated DashboardMentor uses these metrics:
//
// Card 1: My Interns = total_interns
// Card 2: Average Score = average_score
// Card 3: Pending Scores = pending_scores (need input)
// Card 4: Needs Input = needs_input (evaluation)
// Card 5: Passed = interns_passed
// Card 6: Ready for Certificate = ready_for_certificate

export const MENTOR_DASHBOARD_METRICS = {
  totalInterns: 'total_interns',
  pendingScores: 'pending_scores',       // No scores yet
  needsInput: 'needs_input',             // Scores but no evaluation
  interns_passed: 'interns_passed',      // Recommended to Pass
  readyForCertificate: 'ready_for_certificate',
  averageScore: 'average_score',
  recentInterns: 'recent_interns',
};

/**
 * Migration Guide for API Consumers:
 * 
 * OLD CODE:
 * const pendingCount = dashData?.in_progress ?? 0;
 * 
 * NEW CODE (Option 1 - More Accurate):
 * const pendingCount = dashData?.pending_scores ?? 0;
 * const needsEval = dashData?.needs_input ?? 0;
 * const totalPending = pendingCount + needsEval;
 * 
 * NEW CODE (Option 2 - Simple Migration):
 * const pendingCount = (dashData?.pending_scores ?? 0) + (dashData?.needs_input ?? 0);
 */
