"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import DashboardStats from "@/components/DashboardStats";
import DonationChart from "@/components/DonationChart";
import DonationForm from "@/components/DonationForm";
import EventCalendar from "@/components/EventCalendar";
import RecentActivity from "@/components/RecentActivity";

export default function Dashboard() {
  const [showDonationForm, setShowDonationForm] = useState(false);

  return (
    <div>
      <header className="dashboard-header flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div className="header-content">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Dashboard Overview</h1>
          <p className="text-muted">Welcome back, Administrator</p>
        </div>
        <button
          className="btn btn-primary header-action"
          onClick={() => setShowDonationForm(true)}
        >
          <Plus size={18} /> <span>New Donation</span>
        </button>
      </header>

      {showDonationForm && (
        <DonationForm
          onClose={() => setShowDonationForm(false)}
          onSubmit={() => {
            setShowDonationForm(false);
            // Optionally trigger a refresh of stats/charts here
            window.location.reload();
          }}
        />
      )}

      <DashboardStats />

      <div className="dashboard-main-grid">
        <div className="flex flex-col gap-8">
          <DonationChart />
          <div className="flex flex-col gap-6">
            <EventCalendar />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
