export const formatDate = (date) =>
  new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });