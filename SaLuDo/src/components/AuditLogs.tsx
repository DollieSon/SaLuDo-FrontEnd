import { FormEvent, useEffect, useMemo, useState } from "react";
import "./css/AuditLogs.css";
import { useAuth } from "../context/AuthContext";
import { auditLogsApi } from "../utils/api";
import {
  AuditEventType,
  AuditLogEntry,
  AuditSeverity,
  AuditStatistics,
  SecurityAlert,
} from "../types/audit";

const eventTypeOptions: { label: string; value: AuditEventType }[] = [
  { label: "Login Success", value: "LOGIN_SUCCESS" },
  { label: "Login Failure", value: "LOGIN_FAILURE" },
  { label: "Logout", value: "LOGOUT" },
  { label: "Token Refresh", value: "TOKEN_REFRESH" },
  { label: "User Created", value: "USER_CREATED" },
  { label: "User Updated", value: "USER_UPDATED" },
  { label: "User Deleted", value: "USER_DELETED" },
  { label: "User Activated", value: "USER_ACTIVATED" },
  { label: "User Deactivated", value: "USER_DEACTIVATED" },
  { label: "Password Changed", value: "PASSWORD_CHANGED" },
  { label: "Password Reset", value: "PASSWORD_RESET" },
  { label: "Password Reset Requested", value: "PASSWORD_RESET_REQUESTED" },
  { label: "Failed Login Attempt", value: "FAILED_LOGIN_ATTEMPT" },
  { label: "Account Locked", value: "ACCOUNT_LOCKED" },
  { label: "Suspicious Activity", value: "SUSPICIOUS_ACTIVITY" },
  { label: "Rate Limit Exceeded", value: "RATE_LIMIT_EXCEEDED" },
  {
    label: "Unauthorized Access Attempt",
    value: "UNAUTHORIZED_ACCESS_ATTEMPT",
  },
  { label: "Profile Viewed", value: "PROFILE_VIEWED" },
  { label: "Sensitive Data Accessed", value: "SENSITIVE_DATA_ACCESSED" },
  { label: "File Uploaded", value: "FILE_UPLOADED" },
  { label: "File Downloaded", value: "FILE_DOWNLOADED" },
  { label: "System Error", value: "SYSTEM_ERROR" },
  { label: "Config Changed", value: "CONFIG_CHANGED" },
  { label: "Backup Created", value: "BACKUP_CREATED" },
];

const severityOptions: { label: string; value: AuditSeverity }[] = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Critical", value: "CRITICAL" },
];

const successOptions = [
  { label: "All", value: "" },
  { label: "Successful", value: "true" },
  { label: "Failed", value: "false" },
];

const initialFilters = {
  eventType: "",
  severityLevels: [] as AuditSeverity[],
  success: "",
  userId: "",
  ipAddress: "",
  startDate: "",
  endDate: "",
};

const AuditLogs = () => {
  const { accessToken } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditStatistics | null>(null);
  const [statsWindow, setStatsWindow] = useState(30);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [alertsWindow, setAlertsWindow] = useState(24);
  const [alertsVersion, setAlertsVersion] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  const formattedFilters = useMemo(
    () => ({
      eventTypes: appliedFilters.eventType
        ? [appliedFilters.eventType as AuditEventType]
        : undefined,
      severityLevels: appliedFilters.severityLevels.length
        ? appliedFilters.severityLevels
        : undefined,
      success:
        appliedFilters.success === ""
          ? undefined
          : appliedFilters.success === "true",
      userId: appliedFilters.userId || undefined,
      ipAddress: appliedFilters.ipAddress || undefined,
      startDate: appliedFilters.startDate || undefined,
      endDate: appliedFilters.endDate || undefined,
    }),
    [appliedFilters]
  );

  useEffect(() => {
    if (!accessToken) return;

    const loadLogs = async () => {
      setLoadingLogs(true);
      setError(null);
      try {
        const response = await auditLogsApi.getLogs(accessToken, {
          page,
          limit,
          ...formattedFilters,
        });
        setLogs(response.data);
        setPagination(response.pagination);
      } catch (err) {
        console.error(err);
        setLogs([]);
        setError(
          err instanceof Error ? err.message : "Failed to load audit logs"
        );
      } finally {
        setLoadingLogs(false);
      }
    };

    loadLogs();
  }, [accessToken, page, limit, formattedFilters]);

  useEffect(() => {
    if (!accessToken) return;

    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const response = await auditLogsApi.getStats(accessToken, statsWindow);
        setStats(response.data);
      } catch (err) {
        console.error("Failed to load stats", err);
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [accessToken, statsWindow]);

  useEffect(() => {
    if (!accessToken) return;

    const loadAlerts = async () => {
      setLoadingAlerts(true);
      setAlertsError(null);
      try {
        const response = await auditLogsApi.getAlerts(
          accessToken,
          alertsWindow
        );
        setAlerts(response.data);
      } catch (err) {
        console.error("Failed to load alerts", err);
        setAlerts([]);
        setAlertsError(
          err instanceof Error ? err.message : "Failed to load alerts"
        );
      } finally {
        setLoadingAlerts(false);
      }
    };

    loadAlerts();
  }, [accessToken, alertsWindow, alertsVersion]);

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSeverityToggle = (value: AuditSeverity) => {
    setFilters((prev) => {
      const exists = prev.severityLevels.includes(value);
      const severityLevels = exists
        ? prev.severityLevels.filter((level) => level !== value)
        : [...prev.severityLevels, value];
      return { ...prev, severityLevels };
    });
  };

  const handleApplyFilters = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
  };

  const handleAlertsRefresh = () => {
    setAlertsVersion((current) => current + 1);
  };

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && page > 1) {
      setPage((current) => current - 1);
    }

    if (direction === "next" && page < pagination.totalPages) {
      setPage((current) => current + 1);
    }
  };

  return (
    <div className="candidate-list">
      <div className="candidate-list-header" data-text="Track authentication events and privileged admin actions">
        <h2>Security Audit Logs</h2>
        <div className="audit-header-controls">
          <label>
            Page Size
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
            >
              {[25, 50, 100, 200].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <section className="stats-grid">
        <div className="audit-card">
          <p>Total Events</p>
          <h3>{loadingStats ? "--" : stats?.totalEvents ?? 0}</h3>
          <small>All audit events captured</small>
        </div>
        <div className="audit-card">
          <p>Unique Users</p>
          <h3>{loadingStats ? "--" : stats?.uniqueUsers ?? 0}</h3>
          <small>Actors in window</small>
        </div>
        <div className="audit-card">
          <p>Unique IPs</p>
          <h3>{loadingStats ? "--" : stats?.uniqueIPs ?? 0}</h3>
          <small>Source addresses</small>
        </div>
        <div className="audit-card">
          <p>Security Events</p>
          <h3>{loadingStats ? "--" : stats?.securityEvents ?? 0}</h3>
          <small>High-risk detections</small>
        </div>
        <div className="audit-card">
          <p>Failed Attempts</p>
          <h3>{loadingStats ? "--" : stats?.failedAttempts ?? 0}</h3>
          <small>Auth failures</small>
        </div>
        <div className="audit-card">
          <p>Events Window (days)</p>
          <select
            value={statsWindow}
            onChange={(event) => setStatsWindow(Number(event.target.value))}
          >
            {[7, 30, 60, 90, 180, 365].map((days) => (
              <option key={days} value={days}>
                Last {days}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="info-box" style={{padding: "20px", margin: "20px"}}>
        <form onSubmit={handleApplyFilters}>
          <div className="filter-grid">
            <label>
              Event Type
              <select
                name="eventType"
                value={filters.eventType}
                onChange={handleFilterChange}
              >
                <option value="">All events</option>
                {eventTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="filter-field severity-field">
              <span>Severity</span>
              <div className="severity-checkboxes">
                {severityOptions.map((option) => (
                  <label key={option.value} className="severity-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.severityLevels.includes(option.value)}
                      onChange={() => handleSeverityToggle(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <label>
              Result
              <select
                name="success"
                value={filters.success}
                onChange={handleFilterChange}
              >
                {successOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              User ID or Email
              <input
                type="text"
                name="userId"
                placeholder="Search actor"
                value={filters.userId}
                onChange={handleFilterChange}
              />
            </label>

            <label>
              IP Address
              <input
                type="text"
                name="ipAddress"
                placeholder="e.g. 192.168.0.1"
                value={filters.ipAddress}
                onChange={handleFilterChange}
              />
            </label>

            <label>
              Start Date
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </label>

            <label>
              End Date
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </label>
          </div>

          <div className="filter-actions">
            <button type="submit" className="primary" disabled={loadingLogs}>
              Apply Filters
            </button>
            <button
              type="button"
              className="secondary"
              onClick={handleResetFilters}
              disabled={loadingLogs}
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="info-box" style={{padding: "20px", margin: "20px"}}>
        <div className="alerts-header">
          <div>
            <h2>Security Alerts</h2>
            <p>High-priority events from the last {alertsWindow} hours</p>
          </div>
          <div className="alerts-controls">
            <label>
              Window
              <select
                value={alertsWindow}
                onChange={(event) =>
                  setAlertsWindow(Number(event.target.value))
                }
              >
                {[6, 12, 24, 48, 168].map((hours) => (
                  <option key={hours} value={hours}>
                    {hours}h
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleAlertsRefresh}
              disabled={loadingAlerts}
            >
              Refresh
            </button>
          </div>
        </div>
        {alertsError && <div className="error-banner">{alertsError}</div>}
        {loadingAlerts ? (
          <div className="loading-state">Checking alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">No security alerts detected.</div>
        ) : (
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <article key={alert.id} className="alert-card">
                <div className="alert-meta">
                  <span
                    className={`severity-badge severity-${alert.severity.toLowerCase()}`}
                  >
                    {alert.severity.toLowerCase()}
                  </span>
                  <span>{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
                <h3>{alert.type}</h3>
                <p>{alert.message}</p>
                <div className="alert-details">
                  <span>User: {alert.userId ?? "N/A"}</span>
                  <span>IP: {alert.ipAddress ?? "Unknown"}</span>
                </div>
                {alert.details?.action && (
                  <small>Action: {alert.details.action}</small>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="info-box" style={{padding: "20px", margin: "20px"}}>
        <div className="table-header">
          <h2>Event Log</h2>
          <p>
            Showing {logs.length} of {pagination.total} records
          </p>
        </div>
        {error && <div className="error-banner">{error}</div>}
        {loadingLogs ? (
          <div className="loading-state">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">No audit entries found.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="timestamp-column">Timestamp</th>
                  <th className="event-column">Event</th>
                  <th className="severity-column">Severity</th>
                  <th className="user-column">User</th>
                  <th>Result</th>
                  <th>Network</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="timestamp-column">
                      <div className="timestamp-cell">
                        <strong>
                          {new Date(log.timestamp).toLocaleString()}
                        </strong>
                      </div>
                    </td>
                    <td className="event-column">
                      <span className="event-label">{log.eventType}</span>
                    </td>
                    <td className="severity-column">
                      <span
                        className={`severity-badge severity-${log.severity.toLowerCase()}`}
                      >
                        {log.severity.toLowerCase()}
                      </span>
                    </td>
                    <td className="user-column">
                      <div className="user-cell">
                        <strong>{log.userEmail || log.userId || "N/A"}</strong>
                        {log.targetUserId && (
                          <small>Target user: {log.targetUserId}</small>
                        )}
                        {log.sessionId && (
                          <small>Session: {log.sessionId}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`result-badge ${
                          log.success ? "success" : "failure"
                        }`}
                      >
                        {log.success ? "Success" : "Failure"}
                      </span>
                      {typeof log.duration === "number" && (
                        <small className="duration-label">
                          {log.duration.toFixed(0)}ms
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="network-cell">
                        <div>
                          <strong>{log.ipAddress || "Unknown IP"}</strong>
                        </div>
                        {(log.location?.city || log.location?.country) && (
                          <small>
                            {log.location.city ? `${log.location.city}, ` : ""}
                            {log.location.country || ""}
                            {log.location.timezone
                              ? ` (${log.location.timezone})`
                              : ""}
                          </small>
                        )}
                        {log.userAgent && <small>{log.userAgent}</small>}
                      </div>
                    </td>
                    <td>
                      <div className="details-cell">
                        <div>{log.details.action}</div>
                        {log.details.resource && (
                          <small>
                            Resource: {log.details.resource}
                            {log.details.resourceId
                              ? ` (${log.details.resourceId})`
                              : ""}
                          </small>
                        )}
                        {log.details.metadata && (
                          <details>
                            <summary>View metadata</summary>
                            <pre>
                              {JSON.stringify(log.details.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                        {(log.details.oldValue !== undefined ||
                          log.details.newValue !== undefined) && (
                          <details>
                            <summary>View change set</summary>
                            <pre>
                              {JSON.stringify(
                                {
                                  old: log.details.oldValue,
                                  new: log.details.newValue,
                                },
                                null,
                                2
                              )}
                            </pre>
                          </details>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <button
            onClick={() => handlePageChange("prev")}
            disabled={page === 1 || loadingLogs}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange("next")}
            disabled={page >= pagination.totalPages || loadingLogs}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
};

export default AuditLogs;
