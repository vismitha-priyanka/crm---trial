import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const LeadAnalytics: React.FC = () => {
  // State for all data
  const [leadSources, setLeadSources] = useState<
    { name: string; value: number }[]
  >([]);
  const [leadStatusData, setLeadStatusData] = useState<
    { status: string; count: number }[]
  >([]);
  const [recentLeads, setRecentLeads] = useState<
    { date: string; leads: number }[]
  >([]);
  const [KPIData, setKPIData] = useState<
    { title: string; value: string | number }[]
  >([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [sourceForm, setSourceForm] = useState({ name: "", value: "" });
  const [statusForm, setStatusForm] = useState({ status: "", count: "" });
  const [recentForm, setRecentForm] = useState({ date: "", leads: "" });
  const [kpiForm, setKpiForm] = useState({ title: "", value: "" });

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data from backend
  useEffect(() => {
    const fetchLeadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use paged endpoint
        const response = await axios.get(
          `http://localhost:8080/api/lead-analytics/paged?page=${page}&size=${size}`
        );
        const data = response.data;
        // Aggregate by source for pie chart
        if (data && data.content && data.content.length > 0) {
          // Aggregate sources
          const sources: Record<string, number> = {};
          data.content.forEach((item: any) => {
            if (sources[item.source]) {
              sources[item.source] += item.count;
            } else {
              sources[item.source] = item.count;
            }
          });
          const pieChartData = Object.entries(sources).map(([name, value]) => ({
            name,
            value,
          }));
          setLeadSources(pieChartData);

          // Calculate KPIs from the data
          const totalLeads = data.content.reduce(
            (sum: number, item: any) => sum + item.count,
            0
          );
          const avgConversionRate =
            data.content.reduce(
              (sum: number, item: any) =>
                sum +
                (item.conversionRate
                  ? parseFloat(item.conversionRate.toString())
                  : 0),
              0
            ) / data.content.length;
          const totalConversionRate = data.content.reduce(
            (sum: number, item: any) =>
              sum +
              (item.conversionRate
                ? parseFloat(item.conversionRate.toString())
                : 0),
            0
          );
          const kpis = [
            { title: "Total Leads", value: totalLeads },
            {
              title: "Avg Conversion",
              value: `${avgConversionRate.toFixed(1)}%`,
            },
            {
              title: "Total Conversion",
              value: `${totalConversionRate.toFixed(1)}%`,
            },
            { title: "Lead Sources", value: pieChartData.length },
          ];
          setKPIData(kpis);
          // Create lead status data (using conversion rate as status indicator)
          const statusData = pieChartData.map((item: any) => ({
            status: item.name,
            count: item.value,
          }));
          setLeadStatusData(statusData);
          // For recent leads, fill in all days of the current month for a smooth line
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          // Build a map from the current recentLeads
          const leadMap: Record<string, number> = {};
          data.content.forEach((item: any) => {
            leadMap[item.date] = item.count;
          });
          // Fill in all days, using 0 if missing
          const fullRecentLeads = Array.from(
            { length: daysInMonth },
            (_, i) => {
              const day = i + 1;
              const dateStr = `${month + 1}/${day}/${year}`;
              return {
                date: dateStr,
                leads: leadMap[dateStr] || 0,
              };
            }
          );
          setRecentLeads(fullRecentLeads);
        } else {
          setLeadSources([]);
          setKPIData([]);
          setLeadStatusData([]);
          setRecentLeads([]);
        }
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching lead analytics:", err);
        setError("Failed to load lead analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchLeadAnalytics();
  }, [page, size]);

  // Handlers for adding data
  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceForm.name || !sourceForm.value) return;

    try {
      // Create new lead analytics for backend
      const newLeadAnalytics = {
        source: sourceForm.name,
        count: Number(sourceForm.value),
        conversionRate: 15.5, // Default conversion rate
      };

      await axios.post(
        "http://localhost:8080/api/lead-analytics",
        newLeadAnalytics
      );

      // Update local state: add or increment
      setLeadSources((prev) => {
        const idx = prev.findIndex((s) => s.name === sourceForm.name);
        if (idx !== -1) {
          // Already exists, increment value
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            value: updated[idx].value + Number(sourceForm.value),
          };
          return updated;
        } else {
          // New source
          return [
            ...prev,
            { name: sourceForm.name, value: Number(sourceForm.value) },
          ];
        }
      });
      setSourceForm({ name: "", value: "" });
    } catch (err) {
      console.error("Error adding source:", err);
      setError("Failed to add lead source");
    }
  };

  const addStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusForm.status || !statusForm.count) return;
    setLeadStatusData((prev) => {
      const idx = prev.findIndex((s) => s.status === statusForm.status);
      if (idx !== -1) {
        // Already exists, increment count
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          count: updated[idx].count + Number(statusForm.count),
        };
        return updated;
      } else {
        // New status
        return [
          ...prev,
          { status: statusForm.status, count: Number(statusForm.count) },
        ];
      }
    });
    setStatusForm({ status: "", count: "" });
  };

  const addRecent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recentForm.date || !recentForm.leads) return;
    setRecentLeads([
      ...recentLeads,
      { date: recentForm.date, leads: Number(recentForm.leads) },
    ]);
    setRecentForm({ date: "", leads: "" });
  };

  const addKPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpiForm.title || !kpiForm.value) return;
    setKPIData([...KPIData, { title: kpiForm.title, value: kpiForm.value }]);
    setKpiForm({ title: "", value: "" });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Lead Analytics</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading lead analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Lead Analytics</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Lead Analytics</h2>

      {/* KPI Cards + Form */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {KPIData.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">{item.title}</p>
            <p className="text-xl font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>
      <form onSubmit={addKPI} className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          className="input input-bordered flex-1 px-2 py-1 rounded border"
          placeholder="KPI Title"
          value={kpiForm.title}
          onChange={(e) => setKpiForm((f) => ({ ...f, title: e.target.value }))}
        />
        <input
          className="input input-bordered flex-1 px-2 py-1 rounded border"
          placeholder="KPI Value"
          value={kpiForm.value}
          onChange={(e) => setKpiForm((f) => ({ ...f, value: e.target.value }))}
        />
        <button
          type="submit"
          className="btn bg-blue-500 text-white px-4 py-1 rounded"
        >
          Add KPI
        </button>
      </form>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 my-4">
        <button
          className="btn px-3 py-1 rounded border"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          className="btn px-3 py-1 rounded border"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
        >
          Next
        </button>
        <select
          className="ml-4 border rounded px-2 py-1"
          value={size}
          onChange={(e) => {
            setSize(Number(e.target.value));
            setPage(0);
          }}
        >
          {[5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>
              {s} per page
            </option>
          ))}
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lead Source Pie Chart */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={leadSources}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {leadSources.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <form onSubmit={addSource} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Source Name"
              value={sourceForm.name}
              onChange={(e) =>
                setSourceForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Value"
              type="number"
              value={sourceForm.value}
              onChange={(e) =>
                setSourceForm((f) => ({ ...f, value: e.target.value }))
              }
            />
            <button
              type="submit"
              className="btn bg-blue-500 text-white px-4 py-1 rounded"
            >
              Add
            </button>
          </form>
        </div>

        {/* Lead Status Bar Chart */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Lead Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={leadStatusData}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <form onSubmit={addStatus} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Status"
              value={statusForm.status}
              onChange={(e) =>
                setStatusForm((f) => ({ ...f, status: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Count"
              type="number"
              value={statusForm.count}
              onChange={(e) =>
                setStatusForm((f) => ({ ...f, count: e.target.value }))
              }
            />
            <button
              type="submit"
              className="btn bg-blue-500 text-white px-4 py-1 rounded"
            >
              Add
            </button>
          </form>
        </div>

        {/* Recent Leads Line Chart */}
        <div className="bg-white rounded-2xl shadow p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Recent Lead Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={recentLeads}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#00C49F"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <form onSubmit={addRecent} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Date"
              value={recentForm.date}
              onChange={(e) =>
                setRecentForm((f) => ({ ...f, date: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Leads"
              type="number"
              value={recentForm.leads}
              onChange={(e) =>
                setRecentForm((f) => ({ ...f, leads: e.target.value }))
              }
            />
            <button
              type="submit"
              className="btn bg-blue-500 text-white px-4 py-1 rounded"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadAnalytics;
