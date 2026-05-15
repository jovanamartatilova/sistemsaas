export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('At Least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('At Least 1 Uppercase Letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('At Least 1 Lowercase Letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('At Least 1 Number');
  }
  if (/\s/.test(password)) {
    errors.push('No Spaces allowed');
  }
  if (/\s$/.test(password)) {
    errors.push('Password cannot end with a space');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'Weak', color: '#ef4444' };
  if (score <= 3) return { level: 2, label: 'Fair', color: '#f97316' };
  if (score <= 4) return { level: 3, label: 'Good', color: '#eab308' };
  return { level: 4, label: 'Strong', color: '#22c55e' };
};