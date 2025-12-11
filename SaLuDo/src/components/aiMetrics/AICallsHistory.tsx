import { useState, useEffect } from "react";
import {
  AIMetricsEntry,
  CallHistoryFilters,
  DateRangeOption,
  SERVICE_DISPLAY_NAMES,
  AIServiceType,
} from "../../types/aiMetrics";
import { fetchCallHistory } from "../../utils/aiMetricsApi";
import AICallDetailsModal from "./AICallDetailsModal";
import "../css/AIMetrics.css";

interface AICallsHistoryProps {
  dateRange: DateRangeOption;
}

const AICallsHistory: React.FC<AICallsHistoryProps> = ({ dateRange }) => {
  const [calls, setCalls] = useState<AIMetricsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<AIMetricsEntry | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;
  
  // Filters
  const [serviceFilter, setServiceFilter] = useState<AIServiceType | "">("");
  const [successFilter, setSuccessFilter] = useState<"all" | "success" | "failed">("all");

  useEffect(() => {
    loadCallHistory();
  }, [dateRange, currentPage, serviceFilter, successFilter]);

  const loadCallHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: CallHistoryFilters = {
        page: currentPage,
        limit: pageSize,
      };
      
      if (serviceFilter) {
        filters.service = serviceFilter;
      }
      
      if (successFilter !== "all") {
        filters.success = successFilter === "success";
      }
      
      // Add date range
      const endDate = new Date();
      const startDate = new Date();
      const daysMap: Record<DateRangeOption, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365,
      };
      startDate.setDate(startDate.getDate() - daysMap[dateRange]);
      
      filters.startDate = startDate.toISOString();
      filters.endDate = endDate.toISOString();
      
      const response = await fetchCallHistory(filters);
      setCalls(response.entries);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error("Failed to load call history:", err);
      setError(err.message || "Failed to load call history");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (call: AIMetricsEntry) => {
    setSelectedCall(call);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const formatCurrency = (value: number): string => `$${value.toFixed(6)}`;
  const formatNumber = (value: number): string => value.toLocaleString();
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (loading && calls.length === 0) {
    return <div className="loading-state">Loading call history...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={loadCallHistory}>Retry</button>
      </div>
    );
  }

  return (
    <div className="call-history-container">
      {/* Filters */}
      <div className="call-history-filters">
        <div className="filter-group">
          <label>Service:</label>
          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value as AIServiceType | "");
              setCurrentPage(1);
            }}
          >
            <option value="">All Services</option>
            <option value="RESUME_PARSING">Resume Parsing</option>
            <option value="JOB_ANALYSIS">Job Analysis</option>
            <option value="TRANSCRIPT_ANALYSIS">Transcript Analysis</option>
            <option value="PREDICTIVE_INSIGHTS">Predictive Insights</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={successFilter}
            onChange={(e) => {
              setSuccessFilter(e.target.value as "all" | "success" | "failed");
              setCurrentPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="success">Success Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
        
        <div className="filter-info">
          Showing {calls.length} of {formatNumber(total)} calls
        </div>
      </div>

      {/* Table */}
      <div className="call-history-table-container">
        <table className="call-history-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Service</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Tokens</th>
              <th>Cost</th>
              <th>Retries</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr
                key={call.metricsId}
                onClick={() => handleRowClick(call)}
                className={`call-row ${!call.success ? "failed" : ""}`}
              >
                <td>{formatDate(call.timestamp)}</td>
                <td>{SERVICE_DISPLAY_NAMES[call.service]}</td>
                <td>
                  <span className={`status-badge ${call.success ? "success" : "failed"}`}>
                    {call.success ? "Success" : "Failed"}
                  </span>
                </td>
                <td>{call.latencyMs.toFixed(0)}ms</td>
                <td>{formatNumber(call.tokenUsage.totalTokens)}</td>
                <td>{formatCurrency(call.costEstimate.totalCostUsd)}</td>
                <td>{call.retryCount > 0 ? call.retryCount : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {calls.length === 0 && (
          <div className="empty-state">
            <p>No calls found for the selected filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedCall && (
        <AICallDetailsModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
};

export default AICallsHistory;
