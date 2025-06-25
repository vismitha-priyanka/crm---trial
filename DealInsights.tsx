import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const DealInsights: React.FC = () => {
  // State for all data
  const [dealStages, setDealStages] = useState<
    { stage: string; count: number }[]
  >([]);
  const [monthlyDeals, setMonthlyDeals] = useState<
    { month: string; deals: number }[]
  >([]);
  const [revenueSources, setRevenueSources] = useState<
    { name: string; value: number }[]
  >([]);
  const [KPIData, setKPIData] = useState<
    { title: string; value: string | number }[]
  >([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [stageForm, setStageForm] = useState({ stage: "", count: "" });
  const [monthForm, setMonthForm] = useState({ month: "", deals: "" });
  const [revenueForm, setRevenueForm] = useState({ name: "", value: "" });
  const [kpiForm, setKpiForm] = useState({ title: "", value: "" });

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data from backend
  useEffect(() => {
    const fetchDealInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:8080/api/deal-insights/paged?page=${page}&size=${size}`
        );
        const data = response.data;

        // Aggregate by stage for both charts
        if (data && data.content && data.content.length > 0) {
          const stageMap: Record<
            string,
            { count: number; totalValue: number }
          > = {};
          data.content.forEach((item: any) => {
            if (stageMap[item.stage]) {
              stageMap[item.stage].count += item.count;
              stageMap[item.stage].totalValue += parseFloat(
                item.totalValue || 0
              );
            } else {
              stageMap[item.stage] = {
                count: item.count,
                totalValue: parseFloat(item.totalValue || 0),
              };
            }
          });

          // For Deal Stages Distribution (bar chart)
          const stages = Object.entries(stageMap).map(([stage, obj]) => ({
            stage,
            count: obj.count,
          }));
          setDealStages(stages);

          // For Revenue Sources (pie chart)
          const revenueSources = Object.entries(stageMap)
            .filter(([_, obj]) => obj.totalValue > 0)
            .map(([stage, obj]) => ({
              name: stage,
              value: obj.totalValue,
            }));
          setRevenueSources(revenueSources);

          // Calculate KPIs from the aggregated data
          const totalDeals = stages.reduce((sum, item) => sum + item.count, 0);
          const totalValue = revenueSources.reduce(
            (sum, item) => sum + item.value,
            0
          );
          const avgDealValue =
            totalDeals > 0 ? Math.round(totalValue / totalDeals) : 0;
          const kpis = [
            { title: "Total Deals", value: totalDeals },
            { title: "Total Value", value: `$${totalValue.toLocaleString()}` },
            {
              title: "Avg Deal Value",
              value: `$${avgDealValue.toLocaleString()}`,
            },
            { title: "Active Stages", value: stages.length },
          ];
          setKPIData(kpis);

          // For monthly deals, we'll create a placeholder since the backend doesn't have month data
          const currentMonth = new Date().toLocaleString("default", {
            month: "short",
          });
          const monthOrder = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          // Build a map from the current monthlyDeals
          const monthMap: Record<string, number> = {};
          if (monthlyDeals && monthlyDeals.length > 0) {
            monthlyDeals.forEach((item: any) => {
              monthMap[item.month] = item.deals;
            });
          } else {
            // If monthlyDeals is not set yet, use the placeholder
            monthMap[currentMonth] = totalDeals;
          }
          // Fill in all months, using 0 if missing
          const fullMonthlyDeals = monthOrder.map((month) => ({
            month,
            deals: monthMap[month] || 0,
          }));
          setMonthlyDeals(fullMonthlyDeals);
        } else {
          setDealStages([]);
          setKPIData([]);
          setRevenueSources([]);
          setMonthlyDeals([]);
        }
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching deal insights:", err);
        setError("Failed to load deal insights");
      } finally {
        setLoading(false);
      }
    };
    fetchDealInsights();
  }, [page, size]);

  // Handlers for adding data
  const addStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageForm.stage || !stageForm.count) return;

    try {
      // Create new deal insight for backend
      const newDealInsight = {
        stage: stageForm.stage,
        count: Number(stageForm.count),
        totalValue: Number(stageForm.count) * 10000, // Estimate value per deal
      };

      await axios.post(
        "http://localhost:8080/api/deal-insights",
        newDealInsight
      );

      // Update local state
      setDealStages([
        ...dealStages,
        { stage: stageForm.stage, count: Number(stageForm.count) },
      ]);
      setStageForm({ stage: "", count: "" });
    } catch (err) {
      console.error("Error adding stage:", err);
      setError("Failed to add deal stage");
    }
  };

  const addMonth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthForm.month || !monthForm.deals) return;
    setMonthlyDeals([
      ...monthlyDeals,
      { month: monthForm.month, deals: Number(monthForm.deals) },
    ]);
    setMonthForm({ month: "", deals: "" });
  };

  const addRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revenueForm.name || !revenueForm.value) return;
    setRevenueSources([
      ...revenueSources,
      { name: revenueForm.name, value: Number(revenueForm.value) },
    ]);
    setRevenueForm({ name: "", value: "" });
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
        <h2 className="text-2xl font-semibold mb-4">Deal Insights</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading deal insights...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Deal Insights</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Deal Insights</h2>

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deal Stages */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-semibold mb-2">
            Deal Stages Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dealStages}>
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <form onSubmit={addStage} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Stage"
              value={stageForm.stage}
              onChange={(e) =>
                setStageForm((f) => ({ ...f, stage: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Count"
              type="number"
              value={stageForm.count}
              onChange={(e) =>
                setStageForm((f) => ({ ...f, count: e.target.value }))
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

        {/* Revenue Sources */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Revenue Sources</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={revenueSources}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {revenueSources.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <form onSubmit={addRevenue} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Source Name"
              value={revenueForm.name}
              onChange={(e) =>
                setRevenueForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Value"
              type="number"
              value={revenueForm.value}
              onChange={(e) =>
                setRevenueForm((f) => ({ ...f, value: e.target.value }))
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

        {/* Monthly Deal Trend */}
        <div className="bg-white rounded-2xl shadow p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Monthly Deal Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyDeals}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="deals"
                stroke="#00C49F"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <form onSubmit={addMonth} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Month"
              value={monthForm.month}
              onChange={(e) =>
                setMonthForm((f) => ({ ...f, month: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Deals"
              type="number"
              value={monthForm.deals}
              onChange={(e) =>
                setMonthForm((f) => ({ ...f, deals: e.target.value }))
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
    </div>
  );
};

export default DealInsights;
