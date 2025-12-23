"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL || "http://localhost:8000";

export default function AnalyticsCharts({ view }: { view?: 'beneficiary'|'flow'|'donor'|'visits' }) {
  const [donationData, setDonationData] = useState<any | null>(null);
  const [donorData, setDonorData] = useState<any | null>(null);
  const [pageVisits, setPageVisits] = useState<any | null>(null);
  const [beneficiaryData, setBeneficiaryData] = useState<any | null>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [donationCenterId, setDonationCenterId] = useState<string | null>(null);
  const [donorLimit, setDonorLimit] = useState<number>(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // which tab is shown internally; initialize from the prop and keep in sync
  const [activeTab, setActiveTab] = useState<'beneficiary'|'flow'|'donor'|'visits'>(view || 'beneficiary');

  useEffect(() => {
    if (view) setActiveTab(view);
  }, [view]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const centersRes = await axios.get(`${ANALYTICS_URL}/charts/donation-centers`);
        setCenters(centersRes.data.data.items || []);
      } catch (e) {
        console.debug('Failed to fetch centers', e);
      }
    };
    fetchCenters();
  }, []);

  useEffect(() => {
    // fetch beneficiary demographics whenever filters change
    const fetchBeneficiary = async () => {
      try {
        const res = await axios.get(`${ANALYTICS_URL}/charts/beneficiary-demographics`, { params: { year, donationCenterId } });
        setBeneficiaryData(res.data.data);
      } catch (e) {
        console.debug('Failed to fetch beneficiary demographics', e);
      }
    };
    fetchBeneficiary();
  }, [year, donationCenterId]);

  const fetchCharts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dRes, donorsRes, visitsRes] = await Promise.all([
        axios.get(`${ANALYTICS_URL}/charts/donation-flow`, { params: { year, donationCenterId } }),
        axios.get(`${ANALYTICS_URL}/charts/donor-activity`, { params: { limit: donorLimit, donationCenterId } }),
        axios.get(`${ANALYTICS_URL}/charts/page-visits`, { params: {} }),
      ]);
      setDonationData(dRes.data.data);
      setDonorData(donorsRes.data.data);
      setPageVisits(visitsRes.data.data);
    } catch (e: any) {
      console.error("Failed to fetch analytics:", e);
      setError(e?.response?.data?.error || e?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // refresh when filters change
  useEffect(() => {
    fetchCharts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, donationCenterId, donorLimit]);

  // respond to externally selected view
  useEffect(() => {
    if (view) setActiveTab(view);
  }, [view]);

  if (loading) return <div className="p-4">Loading charts…</div>;
  if (!donationData) return <div className="p-4">No donation data available</div>;

  const chartData = donationData.labels.map((label: string, i: number) => ({
    month: label,
    monetary: donationData.monetary[i],
    goods: donationData.goods[i],
  }));

  const pieData = donorData?.details?.map((d: any) => ({ name: d.name, value: d.total })) || [];
  const COLORS = ["#111827", "#6B7280", "#10B981", "#F59E0B", "#EF4444", "#60A5FA"];



  const LegendList: React.FC<{items: any[]}> = ({items}) => (
    <div className="flex flex-col gap-3">
      {items.map((it, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <span style={{width:12,height:12,background:COLORS[idx % COLORS.length],borderRadius:6,display:'inline-block'}} />
          <div className="text-sm">{it.label} <span className="text-gray-500">({it.value})</span></div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab('beneficiary')} className={`px-3 py-1 rounded ${activeTab==='beneficiary' ? 'bg-gray-200' : ''}`}>Beneficiary Demographics</button>
          <button onClick={() => setActiveTab('flow')} className={`px-3 py-1 rounded ${activeTab==='flow' ? 'bg-gray-200' : ''}`}>Donation Flow</button>
          <button onClick={() => setActiveTab('donor')} className={`px-3 py-1 rounded ${activeTab==='donor' ? 'bg-gray-200' : ''}`}>Donor Activity</button>
          <button onClick={() => setActiveTab('visits')} className={`px-3 py-1 rounded ${activeTab==='visits' ? 'bg-gray-200' : ''}`}>Total Page Visits</button>
        </div>

        <div className="flex items-center gap-3">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border rounded px-2 py-1">
            {Array.from({length:5}).map((_,i)=>{
              const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>
            })}
          </select>

          <select value={donationCenterId || ''} onChange={(e)=>setDonationCenterId(e.target.value || null)} className="border rounded px-2 py-1">
            <option value="">All centers</option>
            {centers.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <input type="number" value={donorLimit} onChange={(e)=>setDonorLimit(Number(e.target.value))} className="w-20 border rounded px-2 py-1" />

        </div>
      </div>

      {activeTab === 'beneficiary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-4 border rounded flex gap-4 items-center">
            <div style={{width:220,height:220}}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={beneficiaryData?.household_numbers || []} dataKey="value" nameKey="label" innerRadius={0} outerRadius={80}>
                    {(beneficiaryData?.household_numbers || []).map((entry: any, idx: number) => (
                      <Cell key={`h-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">By Household Number</h4>
              <LegendList items={beneficiaryData?.household_numbers || []} />
            </div>
          </div>

          <div className="p-4 border rounded flex gap-4 items-center">
            <div style={{width:220,height:220}}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={beneficiaryData?.locations || []} dataKey="value" nameKey="label" innerRadius={0} outerRadius={80}>
                    {(beneficiaryData?.locations || []).map((entry: any, idx: number) => (
                      <Cell key={`l-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">By Household Location</h4>
              <LegendList items={beneficiaryData?.locations || []} />
            </div>
          </div>

          <div className="p-4 border rounded">
            <h4 className="font-semibold mb-2">By Monthly Income</h4>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={(beneficiaryData?.income_buckets || [])}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'flow' && (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="p-4 border rounded">
            <h4 className="font-semibold mb-2">Donation Flow (Monetary + Goods)</h4>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="monetary" stroke="#004225" strokeWidth={2} dot />
                  <Bar dataKey="goods" fill="#FFB000" barSize={12} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 border rounded mt-4">
            <h4 className="font-semibold mb-2">Donation Flow (Table)</h4>
            <div className="text-sm text-gray-600">Tabular list (mocked for now) — we can add server-side table export / filters.</div>
          </div>
        </div>
      )}

      {activeTab === 'donor' && (
        <div className="p-4 border rounded">
          <h4 className="font-semibold mb-2">Top Donors</h4>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} fill="#8884d8">
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'visits' && (
        <div className="p-4 border rounded">
          <h4 className="font-semibold mb-2">Total Page Visits</h4>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={(pageVisits?.labels || []).map((l: string, i: number) => ({ label: l, value: (pageVisits?.values || [])[i] || 0 }))}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#9CA3AF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
