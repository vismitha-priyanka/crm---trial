import React, { useState, useEffect } from "react";
import axios from "axios";
import * as Icons from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
// import PageHeader from '../../components/Common/PageHeader';
// import { salesMetrics, chartData } from '../../data/mockData';

const Overview: React.FC = () => {
  // State for all data
  const [pieData, setPieData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [activityData, setActivityData] = useState<
    { name: string; value: number }[]
  >([]);
  const [topPerformers, setTopPerformers] = useState<
    { name: string; deals: number; revenue: number }[]
  >([]);
  const [chartData, setChartData] = useState<
    { month: string; revenue: number }[]
  >([]);
  const [salesMetrics, setSalesMetrics] = useState<{
    totalRevenue: number;
    monthlyGrowth: number;
    conversionRate: number;
  } | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [pieForm, setPieForm] = useState({
    name: "",
    value: "",
    color: "#10B981",
  });
  const [activityForm, setActivityForm] = useState({ name: "", value: "" });
  const [performerForm, setPerformerForm] = useState({
    name: "",
    deals: "",
    revenue: "",
  });
  const [chartForm, setChartForm] = useState({ month: "", revenue: "" });
  const [metricsForm, setMetricsForm] = useState({
    totalRevenue: "",
    monthlyGrowth: "",
    conversionRate: "",
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data from backend
  useEffect(() => {
    const fetchOverviewMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use paged endpoint
        const response = await axios.get(
          `http://localhost:8080/api/overview-metrics/paged?page=${page}&size=${size}`
        );
        const data = response.data;
        // data.content is the array, data.totalPages is the total number of pages
        if (data && data.content && data.content.length > 0) {
          // Extract sales metrics from overview data
          const totalRevenueMetric = data.content.find(
            (item: any) => item.title === "Total Revenue"
          );
          const monthlyGrowthMetric = data.content.find(
            (item: any) => item.title === "Monthly Growth"
          );
          const conversionRateMetric = data.content.find(
            (item: any) => item.title === "Conversion Rate"
          );

          if (
            totalRevenueMetric &&
            monthlyGrowthMetric &&
            conversionRateMetric
          ) {
            setSalesMetrics({
              totalRevenue: parseFloat(totalRevenueMetric.value) || 0,
              monthlyGrowth: parseFloat(monthlyGrowthMetric.value) || 0,
              conversionRate: parseFloat(conversionRateMetric.value) || 0,
            });
          }

          // Create pie data from deal status metrics
          const dealStatusMetrics = data.content.filter(
            (item: any) =>
              item.title.includes("Deal") || item.title.includes("Status")
          );

          const pieChartData = dealStatusMetrics.map(
            (item: any, index: number) => ({
              name: item.title,
              value: parseFloat(item.value) || 0,
              color: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"][index % 4],
            })
          );
          setPieData(pieChartData);

          // Create activity data from activity metrics
          const activityMetrics = data.content.filter(
            (item: any) =>
              item.title.includes("Activity") || item.title.includes("Task")
          );

          const activityChartData = activityMetrics.map((item: any) => ({
            name: item.title,
            value: parseFloat(item.value) || 0,
          }));
          setActivityData(activityChartData);

          // Create chart data from revenue metrics
          const revenueMetrics = data.content.filter(
            (item: any) =>
              item.title.includes("Revenue") || item.title.includes("Month")
          );

          const revenueChartData = revenueMetrics.map(
            (item: any, index: number) => ({
              month: item.title,
              revenue: parseFloat(item.value) || 0,
            })
          );
          setChartData(revenueChartData);

          // Create top performers data from performer metrics
          const performerMetrics = data.content.filter(
            (item: any) =>
              item.title.includes("Performer") || item.title.includes("Sales")
          );

          const performersData = performerMetrics.map((item: any) => ({
            name: item.title,
            deals: Math.floor(Math.random() * 20) + 5, // Random deals for demo
            revenue: parseFloat(item.value) || 0,
          }));
          setTopPerformers(performersData);
        } else {
          setPieData([]);
          setActivityData([]);
          setTopPerformers([]);
          setChartData([]);
          setSalesMetrics(null);
        }
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching overview metrics:", err);
        setError("Failed to load overview metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewMetrics();
  }, [page, size]);

  // Handlers for adding data
  const addPie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pieForm.name || !pieForm.value || !pieForm.color) return;

    try {
      // Create new overview metric for backend
      const newMetric = {
        title: pieForm.name,
        value: pieForm.value,
      };

      await axios.post("http://localhost:8080/api/overview-metrics", newMetric);

      // Update local state
      setPieData([
        ...pieData,
        {
          name: pieForm.name,
          value: Number(pieForm.value),
          color: pieForm.color,
        },
      ]);
      setPieForm({ name: "", value: "", color: "#10B981" });
    } catch (err) {
      console.error("Error adding pie data:", err);
      setError("Failed to add deal status");
    }
  };

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.name || !activityForm.value) return;

    try {
      // Create new overview metric for backend
      const newMetric = {
        title: activityForm.name,
        value: activityForm.value,
      };

      await axios.post("http://localhost:8080/api/overview-metrics", newMetric);

      // Update local state
      setActivityData([
        ...activityData,
        { name: activityForm.name, value: Number(activityForm.value) },
      ]);
      setActivityForm({ name: "", value: "" });
    } catch (err) {
      console.error("Error adding activity:", err);
      setError("Failed to add activity");
    }
  };

  const addPerformer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!performerForm.name || !performerForm.deals || !performerForm.revenue)
      return;

    try {
      // Create new overview metric for backend
      const newMetric = {
        title: performerForm.name,
        value: performerForm.revenue,
      };

      await axios.post("http://localhost:8080/api/overview-metrics", newMetric);

      // Update local state
      setTopPerformers([
        ...topPerformers,
        {
          name: performerForm.name,
          deals: Number(performerForm.deals),
          revenue: Number(performerForm.revenue),
        },
      ]);
      setPerformerForm({ name: "", deals: "", revenue: "" });
    } catch (err) {
      console.error("Error adding performer:", err);
      setError("Failed to add performer");
    }
  };

  const addChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartForm.month || !chartForm.revenue) return;

    try {
      // Create new overview metric for backend
      const newMetric = {
        title: chartForm.month,
        value: chartForm.revenue,
      };

      await axios.post("http://localhost:8080/api/overview-metrics", newMetric);

      // Update local state
      setChartData([
        ...chartData,
        { month: chartForm.month, revenue: Number(chartForm.revenue) },
      ]);
      setChartForm({ month: "", revenue: "" });
    } catch (err) {
      console.error("Error adding chart data:", err);
      setError("Failed to add revenue data");
    }
  };

  const setMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !metricsForm.totalRevenue ||
      !metricsForm.monthlyGrowth ||
      !metricsForm.conversionRate
    )
      return;

    try {
      // Create metrics for backend
      const metrics = [
        { title: "Total Revenue", value: metricsForm.totalRevenue },
        { title: "Monthly Growth", value: metricsForm.monthlyGrowth },
        { title: "Conversion Rate", value: metricsForm.conversionRate },
      ];

      // Save each metric to backend
      for (const metric of metrics) {
        await axios.post("http://localhost:8080/api/overview-metrics", metric);
      }

      // Update local state
      setSalesMetrics({
        totalRevenue: Number(metricsForm.totalRevenue),
        monthlyGrowth: Number(metricsForm.monthlyGrowth),
        conversionRate: Number(metricsForm.conversionRate),
      });
      setMetricsForm({
        totalRevenue: "",
        monthlyGrowth: "",
        conversionRate: "",
      });
    } catch (err) {
      console.error("Error setting metrics:", err);
      setError("Failed to set metrics");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Organization Overview</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading overview metrics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Organization Overview</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* <PageHeader ... /> */}
      <h2 className="text-2xl font-semibold mb-4">Organization Overview</h2>
      <p className="mb-8 text-gray-500">
        High-level insights across your organization
      </p>

      {/* Key Performance Indicators + Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {salesMetrics
                  ? `$${salesMetrics.totalRevenue.toLocaleString()}`
                  : "-"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icons.TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">
              ↗ +{salesMetrics ? salesMetrics.monthlyGrowth : "-"}% from last
              month
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Deals</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icons.Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-blue-600">Pipeline value: -</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {salesMetrics ? `${salesMetrics.conversionRate}%` : "-"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icons.BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-purple-600">
              Above industry average
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Team Performance
              </p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icons.Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-orange-600">-</span>
          </div>
        </div>
      </div>
      <form
        onSubmit={setMetrics}
        className="flex flex-col md:flex-row gap-2 mb-8"
      >
        <input
          className="input input-bordered flex-1 px-2 py-1 rounded border"
          placeholder="Total Revenue"
          type="number"
          value={metricsForm.totalRevenue}
          onChange={(e) =>
            setMetricsForm((f) => ({ ...f, totalRevenue: e.target.value }))
          }
        />
        <input
          className="input input-bordered flex-1 px-2 py-1 rounded border"
          placeholder="Monthly Growth %"
          type="number"
          value={metricsForm.monthlyGrowth}
          onChange={(e) =>
            setMetricsForm((f) => ({ ...f, monthlyGrowth: e.target.value }))
          }
        />
        <input
          className="input input-bordered flex-1 px-2 py-1 rounded border"
          placeholder="Conversion Rate %"
          type="number"
          value={metricsForm.conversionRate}
          onChange={(e) =>
            setMetricsForm((f) => ({ ...f, conversionRate: e.target.value }))
          }
        />
        <button
          type="submit"
          className="btn bg-blue-500 text-white px-4 py-1 rounded"
        >
          Set Metrics
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
          <form onSubmit={addChart} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Month"
              value={chartForm.month}
              onChange={(e) =>
                setChartForm((f) => ({ ...f, month: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Revenue"
              type="number"
              value={chartForm.revenue}
              onChange={(e) =>
                setChartForm((f) => ({ ...f, revenue: e.target.value }))
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

        {/* Deal Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Deal Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <form onSubmit={addPie} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Status Name"
              value={pieForm.name}
              onChange={(e) =>
                setPieForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Value"
              type="number"
              value={pieForm.value}
              onChange={(e) =>
                setPieForm((f) => ({ ...f, value: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="#Color"
              value={pieForm.color}
              onChange={(e) =>
                setPieForm((f) => ({ ...f, color: e.target.value }))
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activity Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
          <form onSubmit={addActivity} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Activity Name"
              value={activityForm.name}
              onChange={(e) =>
                setActivityForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Value"
              type="number"
              value={activityForm.value}
              onChange={(e) =>
                setActivityForm((f) => ({ ...f, value: e.target.value }))
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

        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performers
          </h3>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-700">
                      {performer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {performer.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {performer.deals} deals closed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${performer.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={addPerformer} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Name"
              value={performerForm.name}
              onChange={(e) =>
                setPerformerForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Deals"
              type="number"
              value={performerForm.deals}
              onChange={(e) =>
                setPerformerForm((f) => ({ ...f, deals: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Revenue"
              type="number"
              value={performerForm.revenue}
              onChange={(e) =>
                setPerformerForm((f) => ({ ...f, revenue: e.target.value }))
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

export default Overview;
