export function getImageUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) return `http://localhost:5000${path}`;
  if (path.startsWith('uploads/')) return `http://localhost:5000/uploads/${path.replace(/^uploads\//, '')}`;
  if (path.startsWith('/')) return path;
  return `http://localhost:5000/uploads/${path}`;
}
