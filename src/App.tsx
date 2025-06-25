import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import ActivityStats from "../ActivityStats";
import DealInsights from "../DealInsights";
import LeadAnalytics from "../LeadAnalytics";
import Overview from "../Overview";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow mb-8">
        <div className="container mx-auto px-4 py-4 flex gap-4">
          <Link
            to="/activity-stats"
            className="font-semibold text-blue-600 hover:underline"
          >
            Activity Stats
          </Link>
          <Link
            to="/deal-insights"
            className="font-semibold text-blue-600 hover:underline"
          >
            Deal Insights
          </Link>
          <Link
            to="/lead-analytics"
            className="font-semibold text-blue-600 hover:underline"
          >
            Lead Analytics
          </Link>
          <Link
            to="/overview"
            className="font-semibold text-blue-600 hover:underline"
          >
            Overview
          </Link>
        </div>
      </nav>
      <div className="container mx-auto px-4">
        <Routes>
          <Route path="/activity-stats" element={<ActivityStats />} />
          <Route path="/deal-insights" element={<DealInsights />} />
          <Route path="/lead-analytics" element={<LeadAnalytics />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
