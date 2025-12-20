import fs from 'fs';
import path from 'path';

const BASE = 'https://psgc.gitlab.io/api';
const CACHE_DIR = path.join(process.cwd(), 'backend', 'cache', 'psgc');
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

type CacheEntry = { expires: number; data: any };

// In-memory cache for fast lookups
const memoryCache = new Map<string, CacheEntry>();

function ensureCacheDir() {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function diskCachePath(key: string) {
  return path.join(CACHE_DIR, encodeURIComponent(key) + '.json');
}

async function readDiskCache(key: string): Promise<any | null> {
  const p = diskCachePath(key);
  try {
    if (fs.existsSync(p)) {
      const raw = await fs.promises.readFile(p, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed?.expires && parsed?.data) {
        if (parsed.expires > Date.now()) return parsed.data;
      }
    }
  } catch (e) {
    console.error('[PSGC] disk cache read error', e?.message || e);
  }
  return null;
}

async function writeDiskCache(key: string, data: any, ttl = DEFAULT_TTL_MS) {
  ensureCacheDir();
  const p = diskCachePath(key);
  const payload = { expires: Date.now() + ttl, data };
  try {
    await fs.promises.writeFile(p, JSON.stringify(payload), 'utf-8');
  } catch (e) {
    console.error('[PSGC] disk cache write error', e?.message || e);
  }
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PSGC fetch failed ${res.status}`);
  return await res.json();
}

export async function cachedFetch(key: string, url: string, ttl = DEFAULT_TTL_MS) {
  // check in-memory
  const mem = memoryCache.get(key);
  if (mem && mem.expires > Date.now()) return mem.data;

  // check disk
  const disk = await readDiskCache(key);
  if (disk) {
    // populate memory for faster subsequent reads
    memoryCache.set(key, { expires: Date.now() + ttl, data: disk });
    return disk;
  }

  // fetch remote
  const data = await fetchJson(url);
  memoryCache.set(key, { expires: Date.now() + ttl, data });
  // write to disk async
  writeDiskCache(key, data, ttl).catch(() => {});
  return data;
}

// Helpers for common endpoints
export async function getRegions() {
  return cachedFetch('regions', `${BASE}/regions.json`);
}

export async function getRegionCities(regionCode: string) {
  const key = `region:${regionCode}:cities`;
  return cachedFetch(key, `${BASE}/regions/${regionCode}/cities-municipalities.json`);
}

export async function getCityMunicipalityBarangays(code: string) {
  const key = `citymun:${code}:barangays`;
  return cachedFetch(key, `${BASE}/cities-municipalities/${code}/barangays.json`);
}

export async function getMunicipalityBarangays(code: string) {
  const key = `municipality:${code}:barangays`;
  return cachedFetch(key, `${BASE}/municipalities/${code}/barangays.json`);
}

export default { getRegions, getRegionCities, getCityMunicipalityBarangays, getMunicipalityBarangays };
