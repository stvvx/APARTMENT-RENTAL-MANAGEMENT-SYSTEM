import React, { useState, useEffect } from "react";
import AdminHeader from "../header/admin_header";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
document.head.appendChild(fontLink);

const styles = {
  container: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "#fff",
    minHeight: "100vh",
    color: "#222",
  },
  content: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "60px 40px",
  },
  titleSection: {
    marginBottom: 40,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: "#222",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: 400,
    color: "#717171",
    margin: 0,
  },
  tabsContainer: {
    display: "flex",
    gap: 0,
    marginBottom: 30,
    borderBottom: "1px solid #ebebeb",
  },
  tab: {
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#717171",
    transition: "all 0.2s",
    borderBottom: "2px solid transparent",
  },
  tabActive: {
    color: "#FF385C",
    borderBottom: "2px solid #FF385C",
  },
  tableContainer: {
    background: "#f7f7f7",
    border: "1px solid #ebebeb",
    borderRadius: 16,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  tableHeader: {
    background: "#ebebeb",
    borderBottom: "1px solid #ddd",
  },
  tableHeaderCell: {
    padding: "16px",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 700,
    color: "#222",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #ebebeb",
    transition: "background 0.2s",
  },
  tableRowHover: {
    background: "#f0f0f0",
  },
  tableCell: {
    padding: "16px",
    fontSize: 14,
    color: "#222",
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  badgeTenant: {
    background: "#e3f2fd",
    color: "#1976d2",
  },
  badgeLandlord: {
    background: "#f3e5f5",
    color: "#7b1fa2",
  },
  badgeAdmin: {
    background: "#fce4ec",
    color: "#c2185b",
  },
  badgePending: {
    background: "#fff3e0",
    color: "#e65100",
  },
  badgeApproved: {
    background: "#e8f5e9",
    color: "#2e7d32",
  },
  badgeRejected: {
    background: "#ffebee",
    color: "#c62828",
  },
  badgeActive: {
    background: "#e8f5e9",
    color: "#2e7d32",
  },
  badgeInactive: {
    background: "#ffebee",
    color: "#c62828",
  },
  actionButtons: {
    display: "flex",
    gap: 8,
  },
  actionButton: {
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid #ddd",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  approveBtnHover: {
    background: "#e8f5e9",
    borderColor: "#2e7d32",
    color: "#2e7d32",
  },
  rejectBtnHover: {
    background: "#ffebee",
    borderColor: "#c62828",
    color: "#c62828",
  },
  editBtnHover: {
    background: "#e3f2fd",
    borderColor: "#1976d2",
    color: "#1976d2",
  },
  deleteBtnHover: {
    background: "#ffebee",
    borderColor: "#c62828",
    color: "#c62828",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    borderRadius: 12,
    padding: 32,
    maxWidth: 500,
    width: "90%",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#222",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: "#717171",
    marginBottom: 24,
    lineHeight: 1.6,
  },
  modalButtons: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
  },
  modalButton: {
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "all 0.2s",
  },
  cancelButton: {
    background: "#f0f0f0",
    color: "#222",
  },
  confirmButton: {
    background: "#FF385C",
    color: "#fff",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#f7f7f7",
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#717171",
    margin: 0,
  },
};

export default function AdminUsers() {
  const API_BASE = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const [activeTab, setActiveTab] = useState("accounts");
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [modal, setModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("tenant");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearAlerts = () => {
    setError("");
    setSuccess("");
  };

  const getResponseMessage = async (response, fallback) => {
    try {
      const data = await response.json();
      return data.message || fallback;
    } catch {
      return fallback;
    }
  };

  const resolveDocumentUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") return "";

    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }

    const normalized = rawUrl.replace(/\\/g, "/").replace(/^\/+/, "");

    if (normalized.startsWith("uploads/")) {
      return `${API_BASE}/${normalized}`;
    }

    return `${API_BASE}/${normalized}`;
  };

  const getDocumentType = (application) => {
    const mimeType = application?.landlordApplication?.idDocumentMimeType || "";
    const rawUrl = application?.landlordApplication?.idDocumentURL || "";
    const lowerUrl = rawUrl.toLowerCase();

    if (mimeType.includes("pdf") || lowerUrl.endsWith(".pdf")) return "pdf";
    if (mimeType.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(lowerUrl)) return "image";
    return "file";
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        setError(data.message || "Failed to fetch users.");
      }
    } catch (err) {
      setError("Error fetching users.");
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/landlord-applications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setApplications(data);
      } else {
        setError(data.message || "Failed to fetch landlord applications.");
      }
    } catch (err) {
      setError("Error fetching landlord applications.");
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchUsers(), fetchApplications()]);
  };

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      clearAlerts();
      await refreshData();
      setLoading(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleApprove = async (userId) => {
    clearAlerts();
    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/approve-landlord/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setSuccess("Landlord application approved.");
        await refreshData();
      } else {
        setError(await getResponseMessage(response, "Failed to approve application."));
      }
    } catch (err) {
      setError("Error approving application.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId) => {
    clearAlerts();
    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/reject-landlord/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setSuccess("Landlord application rejected.");
        await refreshData();
      } else {
        setError(await getResponseMessage(response, "Failed to reject application."));
      }
    } catch (err) {
      setError("Error rejecting application.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (userId, currentActive) => {
    clearAlerts();
    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}/toggle-active`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active: !currentActive }),
        }
      );
      if (response.ok) {
        setSuccess(`User ${currentActive ? "deactivated" : "activated"} successfully.`);
        await refreshData();
        setModal(null);
      } else {
        setError(await getResponseMessage(response, "Failed to update user status."));
      }
    } catch (err) {
      setError("Error updating user status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    clearAlerts();
    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${selectedUser._id}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (response.ok) {
        setSuccess(`Role updated to ${newRole}.`);
        await refreshData();
        setModal(null);
      } else {
        setError(await getResponseMessage(response, "Failed to update user role."));
      }
    } catch (err) {
      setError("Error updating user role.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    clearAlerts();
    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setSuccess("User deleted successfully.");
        await refreshData();
        setModal(null);
      } else {
        setError(await getResponseMessage(response, "Failed to delete user."));
      }
    } catch (err) {
      setError("Error deleting user.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <AdminHeader />
        <div style={styles.content}>
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#FF385C" }}>
              Access Denied
            </h1>
            <p style={{ color: "#717171", fontSize: 16 }}>
              Please login with admin credentials to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <AdminHeader />
      <div style={styles.content}>
        {/* Title Section */}
        <div style={styles.titleSection}>
          <h1 style={styles.pageTitle}>User Management</h1>
          <p style={styles.pageSubtitle}>
            Manage user accounts, applications, and permissions
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: 16, color: "#c62828", fontWeight: 600 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginBottom: 16, color: "#2e7d32", fontWeight: 600 }}>
            {success}
          </div>
        )}

        {loading && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⟳</div>
            <p style={styles.emptyText}>Loading users and applications...</p>
          </div>
        )}

        {/* Tabs */}
        {!loading && <div style={styles.tabsContainer}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "accounts" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("accounts")}
          >
            All Accounts ({users.length})
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "applications" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("applications")}
          >
            Landlord Applications ({applications.length})
          </button>
        </div>}

        {/* Accounts Tab */}
        {!loading && activeTab === "accounts" && (
          <div style={styles.tableContainer}>
            {users.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>👥</div>
                <p style={styles.emptyText}>No users found</p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Name</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCell}>Role</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Joined</th>
                    <th style={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      style={styles.tableRow}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          styles.tableRowHover.background)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={styles.tableCell}>{user.name}</td>
                      <td style={styles.tableCell}>{user.email}</td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.badge,
                            ...(user.role === "tenant"
                              ? styles.badgeTenant
                              : user.role === "landlord"
                              ? styles.badgeLandlord
                              : styles.badgeAdmin),
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.badge,
                            ...(user.active
                              ? styles.badgeActive
                              : styles.badgeInactive),
                          }}
                        >
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          <button
                            style={styles.actionButton}
                            disabled={actionLoading}
                            onMouseEnter={(e) =>
                              (e.target.style.background =
                                styles.editBtnHover.background)
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "#fff")
                            }
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setModal("role");
                            }}
                          >
                            Edit Role
                          </button>
                          <button
                            style={styles.actionButton}
                            disabled={actionLoading || currentUser?.email === user.email}
                            onMouseEnter={(e) =>
                              (e.target.style.background =
                                styles.rejectBtnHover.background)
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "#fff")
                            }
                            onClick={() => {
                              setSelectedUser(user);
                              setModal("deactivate");
                            }}
                          >
                            {user.active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            style={styles.actionButton}
                            disabled={actionLoading || currentUser?.email === user.email}
                            onMouseEnter={(e) =>
                              (e.target.style.background =
                                styles.deleteBtnHover.background)
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "#fff")
                            }
                            onClick={() => {
                              setSelectedUser(user);
                              setModal("delete");
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {!loading && activeTab === "applications" && (
          <div style={styles.tableContainer}>
            {applications.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📋</div>
                <p style={styles.emptyText}>No landlord applications</p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Name</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Applied Date</th>
                    <th style={styles.tableHeaderCell}>ID Document</th>
                    <th style={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr
                      key={app._id}
                      style={styles.tableRow}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          styles.tableRowHover.background)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={styles.tableCell}>
                        {app.landlordApplication?.name || app.name}
                      </td>
                      <td style={styles.tableCell}>
                        {app.landlordApplication?.email || app.email}
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.badge,
                            ...(app.landlordApplication?.status === "pending"
                              ? styles.badgePending
                              : app.landlordApplication?.status === "approved"
                              ? styles.badgeApproved
                              : styles.badgeRejected),
                          }}
                        >
                          {app.landlordApplication?.status || "pending"}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {app.landlordApplication?.appliedAt
                          ? new Date(
                              app.landlordApplication.appliedAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td style={styles.tableCell}>
                        {app.landlordApplication?.idDocumentURL ? (
                          <a
                            href={resolveDocumentUrl(app.landlordApplication.idDocumentURL)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#FF385C",
                              textDecoration: "underline",
                            }}
                          >
                            {getDocumentType(app) === "pdf"
                              ? "View PDF"
                              : getDocumentType(app) === "image"
                              ? "View Image"
                              : "View Document"}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {app.landlordApplication?.status === "pending" && (
                          <div style={styles.actionButtons}>
                            <button
                              style={styles.actionButton}
                              disabled={actionLoading}
                              onMouseEnter={(e) =>
                                (e.target.style.background =
                                  styles.approveBtnHover.background)
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.background = "#fff")
                              }
                              onClick={() => handleApprove(app._id)}
                            >
                              Approve
                            </button>
                            <button
                              style={styles.actionButton}
                              disabled={actionLoading}
                              onMouseEnter={(e) =>
                                (e.target.style.background =
                                  styles.rejectBtnHover.background)
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.background = "#fff")
                              }
                              onClick={() => handleReject(app._id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      {modal === "role" && selectedUser && (
        <div style={styles.modal} onClick={() => setModal(null)}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={styles.modalTitle}>Change User Role</h2>
            <p style={styles.modalText}>
              Change the role for <strong>{selectedUser.name}</strong>
            </p>
            <div style={{ marginBottom: 24 }}>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: 14,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.modalButton, ...styles.cancelButton }}
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.confirmButton }}
                disabled={actionLoading}
                onClick={handleChangeRole}
              >
                {actionLoading ? "Updating..." : "Change Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {modal === "deactivate" && selectedUser && (
        <div style={styles.modal} onClick={() => setModal(null)}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={styles.modalTitle}>
              {selectedUser.active ? "Deactivate Account" : "Activate Account"}
            </h2>
            <p style={styles.modalText}>
              Are you sure you want to{" "}
              {selectedUser.active ? "deactivate" : "activate"} the account for{" "}
              <strong>{selectedUser.name}</strong>? This action can be reversed.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.modalButton, ...styles.cancelButton }}
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.confirmButton }}
                disabled={actionLoading}
                onClick={() =>
                  handleDeactivate(selectedUser._id, selectedUser.active)
                }
              >
                {actionLoading
                  ? "Updating..."
                  : selectedUser.active
                  ? "Deactivate"
                  : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && selectedUser && (
        <div style={styles.modal} onClick={() => setModal(null)}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ ...styles.modalTitle, color: "#c62828" }}>
              Delete User
            </h2>
            <p style={styles.modalText}>
              Are you sure you want to permanently delete{" "}
              <strong>{selectedUser.name}</strong>'s account? This action cannot
              be undone.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.modalButton, ...styles.cancelButton }}
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.modalButton,
                  background: "#c62828",
                  color: "#fff",
                }}
                disabled={actionLoading}
                onClick={() => handleDelete(selectedUser._id)}
              >
                {actionLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
