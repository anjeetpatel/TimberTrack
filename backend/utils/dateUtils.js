/**
 * Calculate the number of days between two dates.
 * Returns minimum 1 day (same-day rental is charged as 1 day).
 */
const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffMs = Math.abs(d2 - d1);
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, days); // Minimum 1 day charge
};

/**
 * Format a date to DD/MM/YYYY string.
 */
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

module.exports = { daysBetween, formatDate };
