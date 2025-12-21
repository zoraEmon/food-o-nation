import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'generated', 'prisma');
console.log('Cleaning tmp files in', dir);
try {
  const files = fs.readdirSync(dir);
  const tmp = files.filter(f => f.startsWith('query-engine-windows.exe.tmp'));
  if (tmp.length === 0) {
    console.log('No tmp files found');
    process.exit(0);
  }
  for (const f of tmp) {
    const full = path.join(dir, f);
    try {
      fs.unlinkSync(full);
      console.log('Deleted', f);
    } catch (err) {
      console.error('Failed to delete', f, err.message);
    }
  }
} catch (err) {
  console.error('Cleanup failed', err.message);
  process.exit(1);
}
