import React, { useState, useEffect } from "react";
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

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

const ActivityStats: React.FC = () => {
  // State for all data
  const [activityTrends, setActivityTrends] = useState<
    { day: string; activities: number }[]
  >([]);
  const [activityTypes, setActivityTypes] = useState<
    { name: string; value: number }[]
  >([]);
  const [userActivity, setUserActivity] = useState<
    { user: string; count: number }[]
  >([]);
  const [KPIs, setKPIs] = useState<{ title: string; value: string | number }[]>(
    []
  );

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [trendForm, setTrendForm] = useState({ day: "", activities: "" });
  const [typeForm, setTypeForm] = useState({ name: "", value: "" });
  const [userForm, setUserForm] = useState({ user: "", count: "" });
  const [kpiForm, setKpiForm] = useState({ title: "", value: "" });

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data from backend
  useEffect(() => {
    const fetchActivityStats = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use paged endpoint
        const response = await axios.get(
          `http://localhost:8080/api/activity-stats/paged?page=${page}&size=${size}`
        );
        const data = response.data;
        // data.content is the array, data.totalPages is the total number of pages
        if (data && data.content && data.content.length > 0) {
          // Transform activity trends
          const trends = data.content.map((item: any) => ({
            day: item.day,
            activities: item.calls + item.emails + item.meetings,
          }));
          setActivityTrends(trends);
          // Transform activity types (aggregate from all records)
          const totalCalls = data.content.reduce(
            (sum: number, item: any) => sum + item.calls,
            0
          );
          const totalEmails = data.content.reduce(
            (sum: number, item: any) => sum + item.emails,
            0
          );
          const totalMeetings = data.content.reduce(
            (sum: number, item: any) => sum + item.meetings,
            0
          );
          const types = [
            { name: "Calls", value: totalCalls },
            { name: "Emails", value: totalEmails },
            { name: "Meetings", value: totalMeetings },
          ].filter((type) => type.value > 0);
          setActivityTypes(types);
          // Set KPIs based on aggregated data
          const totalActivities = totalCalls + totalEmails + totalMeetings;
          const avgActivitiesPerDay =
            data.content.length > 0
              ? Math.round(totalActivities / data.content.length)
              : 0;
          const kpis = [
            { title: "Total Activities", value: totalActivities },
            { title: "Avg/Day", value: avgActivitiesPerDay },
            { title: "Total Calls", value: totalCalls },
            { title: "Total Emails", value: totalEmails },
          ];
          setKPIs(kpis);
          // Remove the placeholder for user activity; only use user-added entries
          setUserActivity([]);
        } else {
          setActivityTrends([]);
          setActivityTypes([]);
          setKPIs([]);
          setUserActivity([]);
        }
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching activity stats:", err);
        setError("Failed to load activity statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchActivityStats();
  }, [page, size]);

  // Handlers for adding data
  const addTrend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trendForm.day || !trendForm.activities) return;

    try {
      // Create new activity stat for backend
      const newActivityStat = {
        day: trendForm.day,
        calls: Math.floor(Number(trendForm.activities) * 0.4), // Distribute activities
        emails: Math.floor(Number(trendForm.activities) * 0.4),
        meetings: Math.floor(Number(trendForm.activities) * 0.2),
      };

      await axios.post(
        "http://localhost:8080/api/activity-stats",
        newActivityStat
      );

      // Update local state
      setActivityTrends([
        ...activityTrends,
        { day: trendForm.day, activities: Number(trendForm.activities) },
      ]);
      setTrendForm({ day: "", activities: "" });
    } catch (err) {
      console.error("Error adding trend:", err);
      setError("Failed to add activity trend");
    }
  };

  const addType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeForm.name || !typeForm.value) return;
    setActivityTypes([
      ...activityTypes,
      { name: typeForm.name, value: Number(typeForm.value) },
    ]);
    setTypeForm({ name: "", value: "" });
  };

  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.user || !userForm.count) return;
    setUserActivity([
      ...userActivity,
      { user: userForm.user, count: Number(userForm.count) },
    ]);
    setUserForm({ user: "", count: "" });
  };

  const addKPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpiForm.title || !kpiForm.value) return;
    setKPIs([...KPIs, { title: kpiForm.title, value: kpiForm.value }]);
    setKpiForm({ title: "", value: "" });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Activity Stats</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading activity statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Activity Stats</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Activity Stats</h2>

      {/* KPI Cards + Form */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {KPIs.map((item, index) => (
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
        {/* Activity Trends */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-semibold mb-2">
            Activity Trends (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityTrends}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="activities"
                stroke="#00C49F"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <form onSubmit={addTrend} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Day"
              value={trendForm.day}
              onChange={(e) =>
                setTrendForm((f) => ({ ...f, day: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Activities"
              type="number"
              value={trendForm.activities}
              onChange={(e) =>
                setTrendForm((f) => ({ ...f, activities: e.target.value }))
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

        {/* Activity Types */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-semibold mb-2">
            Activity Type Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={activityTypes}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {activityTypes.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <form onSubmit={addType} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Type Name"
              value={typeForm.name}
              onChange={(e) =>
                setTypeForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Value"
              type="number"
              value={typeForm.value}
              onChange={(e) =>
                setTypeForm((f) => ({ ...f, value: e.target.value }))
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

        {/* User Activity */}
        <div className="bg-white rounded-2xl shadow p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">User-wise Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userActivity}>
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <form onSubmit={addUser} className="flex gap-2 mt-2">
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="User Name"
              value={userForm.user}
              onChange={(e) =>
                setUserForm((f) => ({ ...f, user: e.target.value }))
              }
            />
            <input
              className="input input-bordered flex-1 px-2 py-1 rounded border"
              placeholder="Count"
              type="number"
              value={userForm.count}
              onChange={(e) =>
                setUserForm((f) => ({ ...f, count: e.target.value }))
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

export default ActivityStats;
