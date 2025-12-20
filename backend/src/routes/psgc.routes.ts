import express from 'express';
import * as psgc from '../services/psgc.service.js';

const router = express.Router();

// GET /api/psgc/regions?q=term
router.get('/regions', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    const data = await psgc.getRegions();
    if (q) {
      const filtered = (data || []).filter((r: any) => (r.regionName || r.name || '').toLowerCase().includes(q));
      return res.json({ results: filtered });
    }
    return res.json({ results: data });
  } catch (e: any) {
    console.error('[PSGC ROUTE] regions error', e?.message || e);
    res.status(502).json({ error: 'Failed to fetch regions' });
  }
});

// GET /api/psgc/regions/:regionCode/cities
router.get('/regions/:regionCode/cities', async (req, res) => {
  try {
    const { regionCode } = req.params;
    const q = String(req.query.q || '').trim().toLowerCase();
    const data = await psgc.getRegionCities(regionCode);
    if (q) {
      const filtered = (data || []).filter((m: any) => (m.name || '').toLowerCase().includes(q));
      return res.json({ results: filtered });
    }
    return res.json({ results: data });
  } catch (e: any) {
    console.error('[PSGC ROUTE] region cities error', e?.message || e);
    res.status(502).json({ error: 'Failed to fetch municipalities/cities' });
  }
});

// GET /api/psgc/cities/:code/barangays
router.get('/cities/:code/barangays', async (req, res) => {
  try {
    const { code } = req.params;
    const q = String(req.query.q || '').trim().toLowerCase();
    const data = await psgc.getCityMunicipalityBarangays(code);
    if (q) {
      const filtered = (data || []).filter((b: any) => (b.name || '').toLowerCase().includes(q));
      return res.json({ results: filtered });
    }
    return res.json({ results: data });
  } catch (e: any) {
    console.error('[PSGC ROUTE] city barangays error', e?.message || e);
    res.status(502).json({ error: 'Failed to fetch barangays' });
  }
});

// Fallback for municipality-specific barangays
router.get('/municipalities/:code/barangays', async (req, res) => {
  try {
    const { code } = req.params;
    const q = String(req.query.q || '').trim().toLowerCase();
    const data = await psgc.getMunicipalityBarangays(code);
    if (q) {
      const filtered = (data || []).filter((b: any) => (b.name || '').toLowerCase().includes(q));
      return res.json({ results: filtered });
    }
    return res.json({ results: data });
  } catch (e: any) {
    console.error('[PSGC ROUTE] municipality barangays error', e?.message || e);
    res.status(502).json({ error: 'Failed to fetch barangays' });
  }
});

export default router;
