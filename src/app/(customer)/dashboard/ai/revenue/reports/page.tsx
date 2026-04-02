"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels } from "@/lib/business-context";
import { Download, Calendar, Loader2, FileSpreadsheet, FileText, Filter } from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

interface RevenueData {
  date: string;
  bookings: number;
  revenue: number;
  occupancy: number;
}

export default function RevenueReportsPage() {
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | "occupancy">("daily");
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedListing, setSelectedListing] = useState<string>("all");
  const [listings, setListings] = useState<{id: string, title: string}[]>([]);
  const [reportData, setReportData] = useState<RevenueData[]>([]);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    avgOccupancy: 0,
    avgDailyRate: 0
  });

  const loadData = async () => {
    try {
      const listingsData = await fetchWithAuth<{ listings: {id: string, title: string}[] }>(`/api/listings?tenant_id=${tenant?.id}`);
      setListings(listingsData.listings || []);
    } catch (error) {
      console.error("Failed to load listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenant?.id) {
      generateReport();
    }
  }, [tenant?.id, reportType, dateFrom, dateTo, selectedListing]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const listingFilter = selectedListing !== "all" ? `&listing_id=${selectedListing}` : "";
      const reportData = await fetchWithAuth<{ data: RevenueData[], summary: typeof summary }>(
        `/api/revenue/report?tenant_id=${tenant?.id}&report_type=${reportType}&date_from=${dateFrom}&date_to=${dateTo}${listingFilter}`
      );
      
      setReportData(reportData.data || []);
      setSummary(reportData.summary || {
        totalBookings: 0,
        totalRevenue: 0,
        avgOccupancy: 0,
        avgDailyRate: 0
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "pdf") => {
    setExporting(true);
    try {
      const listingFilter = selectedListing !== "all" ? `&listing_id=${selectedListing}` : "";
      const blob = await fetchWithAuth<Blob>(
        `/api/revenue/export?tenant_id=${tenant?.id}&report_type=${reportType}&date_from=${dateFrom}&date_to=${dateTo}&format=${format}${listingFilter}`
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revenue-report-${dateFrom}-to-${dateTo}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export:", error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue Reports</h1>
          <p className="text-muted-foreground">Generate and export financial reports</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="px-4 py-2 border rounded-md hover:bg-muted flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-card border rounded-lg p-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="bg-background border rounded-md px-3 py-2 text-sm"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="occupancy">Occupancy Report</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-background border rounded-md px-3 py-2 text-sm"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-background border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Property</label>
          <select
            value={selectedListing}
            onChange={(e) => setSelectedListing(e.target.value)}
            className="bg-background border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Properties</option>
            {listings.map(listing => (
              <option key={listing.id} value={listing.id}>{listing.title}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={generateReport}
            className="px-4 py-2 border rounded-md hover:bg-muted flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Apply
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Bookings</div>
          <div className="text-2xl font-bold">{summary.totalBookings}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Revenue</div>
          <div className="text-2xl font-bold">₹{summary.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Avg Occupancy</div>
          <div className="text-2xl font-bold">{summary.avgOccupancy.toFixed(1)}%</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Avg Daily Rate</div>
          <div className="text-2xl font-bold">₹{summary.avgDailyRate.toLocaleString()}</div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Date</th>
              <th className="text-right p-4 text-sm font-medium">Bookings</th>
              <th className="text-right p-4 text-sm font-medium">Revenue</th>
              <th className="text-right p-4 text-sm font-medium">Occupancy</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reportData.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No data available for the selected period
                </td>
              </tr>
            ) : (
              reportData.map((row, index) => (
                <tr key={index} className="hover:bg-muted/50">
                  <td className="p-4 text-sm">{row.date}</td>
                  <td className="p-4 text-sm text-right">{row.bookings}</td>
                  <td className="p-4 text-sm text-right">₹{row.revenue.toLocaleString()}</td>
                  <td className="p-4 text-sm text-right">{row.occupancy.toFixed(1)}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
