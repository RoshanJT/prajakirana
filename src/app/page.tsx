"use client";

import Link from "next/link";
import { useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import DonationChart from "@/components/DonationChart";
import DonationForm from "@/components/DonationForm";

export default function Dashboard() {
  const [showDonationForm, setShowDonationForm] = useState(false);

  return (
    <div>
      <header className="flex justify-between items-end" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Dashboard Overview</h1>
          <p className="text-muted">Welcome back, Administrator</p>
        </div>
        <button
          className="btn"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
          }}
          onClick={() => setShowDonationForm(true)}
        >
          + New Donation
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <DonationChart />

        {/* Recent Activity / Quick Actions Placeholder */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="text-lg font-bold" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Quick Actions</h3>
          <div className="flex flex-col gap-4">
            <Link href="/donors" className="btn btn-outline w-full justify-between" style={{ padding: '1rem', justifyContent: 'space-between' }}>
              Add Donor <span style={{ color: 'var(--primary)' }}>→</span>
            </Link>
            <Link href="/campaigns" className="btn btn-outline w-full justify-between" style={{ padding: '1rem', justifyContent: 'space-between' }}>
              Create Campaign <span style={{ color: 'var(--primary)' }}>→</span>
            </Link>
            <Link href="/communication" className="btn btn-outline w-full justify-between" style={{ padding: '1rem', justifyContent: 'space-between' }}>
              Send Broadcast <span style={{ color: 'var(--primary)' }}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
