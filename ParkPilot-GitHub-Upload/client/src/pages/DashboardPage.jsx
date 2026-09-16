import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const userTabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "bookings", label: "My Bookings" },
  { id: "payments", label: "Payments" },
  { id: "locations", label: "Saved Locations" },
  { id: "profile", label: "Profile" },
];

const adminTabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "history", label: "Booking History" },
  { id: "profile", label: "Profile" },
];

const statusOrder = ["all", "active", "pending", "completed", "cancelled"];
const vehicleTypes = ["all", "Bike", "Car", "SUV", "Truck"];
const parkingLocations = [
  "Main Building Parking",
  "North Wing Parking",
  "Visitor Basement Parking",
  "Tower A Ground Parking",
  "Tower B Covered Parking",
  "Accessible Entrance Parking",
];

const formatCurrency = (value) => `INR ${Number(value || 0).toFixed(2)}`;
const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatInputDateTime = (value = new Date()) => {
  const date = new Date(value);
  date.setSeconds(0, 0);
  const timezoneOffset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - timezoneOffset * 60000);
  return local.toISOString().slice(0, 16);
};

const toSafeIso = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
};

const getBookingStart = (booking) => booking.startTime || booking.date || booking.createdAt;

const LineChart = ({ points }) => {
  const width = 560;
  const height = 200;
  const padding = 20;
  const maxValue = Math.max(...points.map((item) => item.value), 1);
  const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const toY = (value) => height - padding - (value / maxValue) * (height - padding * 2);
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${padding + stepX * index} ${toY(point.value)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="park-chart-svg" role="img" aria-label="line chart">
      <path d={path} fill="none" stroke="#f3d76b" strokeWidth="3" strokeLinecap="round" />
      {points.map((point, index) => (
        <circle key={point.label} cx={padding + stepX * index} cy={toY(point.value)} r="4" fill="#f3d76b" />
      ))}
    </svg>
  );
};

const BarChart = ({ points }) => {
  const maxValue = Math.max(...points.map((item) => item.value), 1);
  return (
    <div className="park-bars">
      {points.map((point) => (
        <div key={point.label} className="park-bar-col">
          <div className="park-bar-value">{point.value}</div>
          <div className="park-bar-track">
            <div className="park-bar-fill" style={{ height: `${(point.value / maxValue) * 100}%` }} />
          </div>
          <span>{point.label}</span>
        </div>
      ))}
    </div>
  );
};

export const DashboardPage = () => {
  const { token, user, logout, syncUser } = useAuth();
  const isUser = user.role === "user";
  const tabs = isUser ? userTabs : adminTabs;
  const bookingsEndpoint = isUser ? "/bookings/my" : "/bookings/all";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [analytics, setAnalytics] = useState(null);
  const [layout, setLayout] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [layoutAt, setLayoutAt] = useState(formatInputDateTime());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [historyFilters, setHistoryFilters] = useState({
    search: "",
    status: "all",
    vehicleType: "all",
  });
  const [bookingForm, setBookingForm] = useState({
    locationName: "",
    vehicleNumber: user?.defaultVehicleNumber || "",
    vehicleType: "Car",
    durationHours: 2,
    startTime: formatInputDateTime(),
    notes: "",
  });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    defaultVehicleNumber: user?.defaultVehicleNumber || "",
  });

  const refreshAll = async () => {
    try {
      setLoading(true);
      setError("");
      const requests = [
        apiClient.get(`/bookings/layout?at=${encodeURIComponent(toSafeIso(layoutAt))}`, token),
        apiClient.get(bookingsEndpoint, token),
      ];

      if (!isUser) {
        requests.push(apiClient.get("/bookings/analytics", token));
      }

      const [layoutData, bookingsData, analyticsData] = await Promise.all(requests);
      setLayout(layoutData);
      setBookings(bookingsData);
      setAnalytics(isUser ? null : analyticsData);
    } catch (requestError) {
      setError(requestError.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab("dashboard");
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user.role]);

  useEffect(() => {
    setBookingForm((current) => ({ ...current, startTime: layoutAt }));
  }, [layoutAt]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const search = historyFilters.search.trim().toLowerCase();
      const matchesSearch =
        !search ||
        booking.bookingId?.toLowerCase().includes(search) ||
        `${booking.slotNumber || ""}`.includes(search) ||
        (booking.vehicleNumber || "").toLowerCase().includes(search) ||
        (booking.userId?.name || "").toLowerCase().includes(search);
      const matchesStatus = historyFilters.status === "all" || booking.status === historyFilters.status;
      const matchesVehicleType =
        historyFilters.vehicleType === "all" || booking.vehicleType === historyFilters.vehicleType;
      return matchesSearch && matchesStatus && matchesVehicleType;
    });
  }, [bookings, historyFilters]);

  const selectedSlotMeta = useMemo(() => {
    if (!selectedSlot || !layout?.zones) {
      return null;
    }
    for (const zone of layout.zones) {
      const found = zone.slots.find((slot) => slot.number === selectedSlot);
      if (found) {
        return found;
      }
    }
    return null;
  }, [layout, selectedSlot]);

  const userTotals = useMemo(() => {
    const totalSpend = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    return {
      totalSpend,
      totalBookings: bookings.length,
      pendingPayments: bookings.filter((booking) => booking.paymentStatus === "pending").length,
      activeBookings: bookings.filter((booking) => booking.status === "active").length,
    };
  }, [bookings]);

  const savedLocations = useMemo(() => {
    const ordered = [...bookings].sort((left, right) => new Date(getBookingStart(right)) - new Date(getBookingStart(left)));
    const unique = new Set();
    const rows = [];

    for (const booking of ordered) {
      const locationName = booking.locationName || "Main Building Parking";
      const key = locationName.toLowerCase();
      if (unique.has(key)) {
        continue;
      }
      unique.add(key);
      rows.push({
        key,
        locationName,
        zone: booking.zone || "N/A",
        slotNumber: booking.slotNumber || "-",
        lastParkedAt: getBookingStart(booking),
        vehicleNumber: booking.vehicleNumber || "-",
      });
    }
    return rows;
  }, [bookings]);

  const accessibleNearBuildingSlots = useMemo(() => {
    if (!layout?.zones) {
      return [];
    }
    return layout.zones
      .flatMap((zone) => zone.slots)
      .filter((slot) => slot.type === "accessible" && slot.nearBuilding && slot.status === "available");
  }, [layout]);

  const paymentRows = useMemo(
    () => [...bookings].sort((left, right) => new Date(getBookingStart(right)) - new Date(getBookingStart(left))),
    [bookings]
  );

  const handleSelectSlot = (slotNumber) => {
    if (!bookingForm.locationName) {
      setFeedback({ type: "error", message: "Select parking location first, then choose slot." });
      return;
    }
    setSelectedSlot(slotNumber);
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    if (!selectedSlot) {
      setFeedback({ type: "error", message: "Please select an available slot from the layout." });
      return;
    }
    if (!bookingForm.locationName) {
      setFeedback({ type: "error", message: "Please choose a location before confirming booking." });
      return;
    }

    try {
      const payload = {
        slotNumber: selectedSlot,
        locationName: bookingForm.locationName,
        vehicleNumber: bookingForm.vehicleNumber,
        vehicleType: bookingForm.vehicleType,
        durationHours: Number(bookingForm.durationHours),
        startTime: new Date(bookingForm.startTime).toISOString(),
        notes: bookingForm.notes,
      };
      const response = await apiClient.post("/bookings", payload, token);
      setFeedback({
        type: "success",
        message: `Booking confirmed successfully. ID: ${response.booking.bookingId}`,
      });
      setSelectedSlot(null);
      setBookingForm((current) => ({ ...current, notes: "" }));
      await refreshAll();
    } catch (submitError) {
      setFeedback({ type: "error", message: submitError.message });
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await apiClient.patch(`/bookings/${bookingId}/status`, { status }, token);
      setBookings((current) => current.map((booking) => (booking._id === bookingId ? { ...booking, status } : booking)));
      setFeedback({ type: "success", message: "Booking status updated." });
    } catch (updateError) {
      setFeedback({ type: "error", message: updateError.message });
    }
  };

  const exportCsv = () => {
    const lines = [
      [
        "Booking ID",
        "Location",
        "Slot",
        "Vehicle Number",
        "Vehicle Type",
        "Duration",
        "Date/Time",
        "Amount",
        "Payment",
        "Status",
      ].join(","),
      ...filteredBookings.map((booking) =>
        [
          booking.bookingId || "",
          booking.locationName || "Main Building Parking",
          booking.slotNumber || "",
          booking.vehicleNumber || "",
          booking.vehicleType || "",
          booking.durationHours || "",
          formatDateTime(getBookingStart(booking)),
          booking.amount || 0,
          booking.paymentStatus || "paid",
          booking.status || "",
        ]
          .map((item) => `"${String(item).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "parking-bookings.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const response = await apiClient.patch("/users/me", profileForm, token);
      syncUser(response.user);
      setFeedback({ type: "success", message: "Profile updated successfully." });
    } catch (profileError) {
      setFeedback({ type: "error", message: profileError.message });
    }
  };

  if (loading) {
    return <div className="park-loading">Loading parking dashboard...</div>;
  }

  return (
    <main className="park-shell">
      <aside className="park-sidebar">
        <div className="park-brand">
          <span>P</span>
          <div>
            <strong>ParkPilot</strong>
            <small>Smart Parking</small>
          </div>
        </div>
        <nav className="park-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "park-nav-btn active" : "park-nav-btn"}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="park-user-card">
          <h4>{user.name}</h4>
          <p>{user.role}</p>
          <button type="button" className="park-secondary-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <section className="park-main" key={activeTab}>
        <header className="park-header">
          <div>
            <h1>
              {activeTab === "dashboard" && (isUser ? "My Parking Dashboard" : "Parking Dashboard")}
              {activeTab === "analytics" && "Analytics"}
              {(activeTab === "history" || activeTab === "bookings") && "Booking History"}
              {activeTab === "payments" && "Payment Center"}
              {activeTab === "locations" && "Saved Parking Locations"}
              {activeTab === "profile" && "My Profile"}
            </h1>
            <p>
              {isUser
                ? "Track your parking activity, payments, bookings, and profile in one place."
                : "Manage slots, bookings, and operations in one professional workspace."}
            </p>
          </div>
          <div className="park-header-actions">
            <button type="button" className="park-secondary-btn" onClick={refreshAll}>
              Refresh Data
            </button>
            <input type="datetime-local" value={layoutAt} onChange={(event) => setLayoutAt(event.target.value)} />
          </div>
        </header>

        {feedback.message && <div className={`park-alert ${feedback.type}`}>{feedback.message}</div>}
        {error && <div className="park-alert error">{error}</div>}

        {activeTab === "dashboard" && (
          <>
            {isUser ? (
              <section className="park-stats-grid">
                <article className="park-stat-card accent">
                  <p>Total Spend</p>
                  <h3>{formatCurrency(userTotals.totalSpend)}</h3>
                </article>
                <article className="park-stat-card">
                  <p>Total Bookings</p>
                  <h3>{userTotals.totalBookings}</h3>
                </article>
                <article className="park-stat-card">
                  <p>Pending Payments</p>
                  <h3>{userTotals.pendingPayments}</h3>
                </article>
                <article className="park-stat-card">
                  <p>Active Bookings</p>
                  <h3>{userTotals.activeBookings}</h3>
                </article>
              </section>
            ) : (
              analytics && (
                <section className="park-stats-grid">
                  <article className="park-stat-card">
                    <p>Total Revenue</p>
                    <h3>{formatCurrency(analytics.totals.totalRevenue)}</h3>
                  </article>
                  <article className="park-stat-card">
                    <p>Total Bookings</p>
                    <h3>{analytics.totals.totalBookings}</h3>
                  </article>
                  <article className="park-stat-card">
                    <p>Avg Booking Value</p>
                    <h3>{formatCurrency(analytics.totals.avgBookingValue)}</h3>
                  </article>
                  <article className="park-stat-card accent">
                    <p>Total Slots</p>
                    <h3>{analytics.totals.totalSlots}</h3>
                  </article>
                </section>
              )
            )}

            <section className="park-quick-actions">
              {isUser ? (
                <>
                  <button type="button" className="qa-blue" onClick={() => setActiveTab("bookings")}>
                    My Bookings
                  </button>
                  <button type="button" className="qa-magenta" onClick={() => setActiveTab("payments")}>
                    Payments
                  </button>
                  <button type="button" className="qa-green" onClick={() => setActiveTab("locations")}>
                    Saved Locations ({savedLocations.length})
                  </button>
                  <button type="button" className="qa-orange">
                    Total Spend: {formatCurrency(userTotals.totalSpend)}
                  </button>
                  <button type="button" className="qa-cyan" onClick={refreshAll}>
                    Refresh Data
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="qa-blue" onClick={() => setActiveTab("analytics")}>
                    View Analytics
                  </button>
                  <button type="button" className="qa-magenta" onClick={() => setActiveTab("history")}>
                    Booking History
                  </button>
                  <button type="button" className="qa-green">Available Slots: {layout?.counts?.available || 0}</button>
                  <button type="button" className="qa-orange" onClick={exportCsv}>
                    Export Report
                  </button>
                  <button type="button" className="qa-cyan" onClick={refreshAll}>
                    Refresh Data
                  </button>
                </>
              )}
            </section>

            {isUser && (
              <section className="park-special-card">
                <h3>Handicap Special Parking (Near Building)</h3>
                <p>These accessible slots are closest to the building entrance and currently available.</p>
                <div className="park-chip-list">
                  {accessibleNearBuildingSlots.map((slot) => (
                    <button
                      key={slot.number}
                      type="button"
                      className="park-chip"
                      onClick={() => setSelectedSlot(slot.number)}
                    >
                      Slot #{slot.number} (Zone {slot.zone})
                    </button>
                  ))}
                  {accessibleNearBuildingSlots.length === 0 && (
                    <span className="park-empty">No near-building accessible slots available right now.</span>
                  )}
                </div>
              </section>
            )}

            <section className="park-layout-card">
              <div className="park-layout-head">
                <h3>Parking Layout</h3>
                <div className="park-legend">
                  <span className="dot available"></span>Available
                  <span className="dot occupied"></span>Occupied
                  <span className="dot booked"></span>Booked
                  <span className="dot disabled"></span>Disabled
                </div>
              </div>
              {layout?.zones?.map((zone) => (
                <div key={zone.zone} className="park-zone">
                  <h4>
                    Zone {zone.zone} <span>{zone.available} / {zone.total} available</span>
                  </h4>
                  <div className="park-slot-grid">
                    {zone.slots.map((slot) => (
                      <button
                        key={slot.number}
                        type="button"
                        className={`park-slot ${slot.status} ${selectedSlot === slot.number ? "selected" : ""}`}
                        disabled={slot.status !== "available"}
                        onClick={() => handleSelectSlot(slot.number)}
                      >
                        <span>#{slot.number}</span>
                        <small>
                          {slot.type === "accessible" ? "Accessible" : "Standard"}
                          {slot.nearBuilding ? " • Near building" : ""}
                        </small>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <form className="park-book-form" onSubmit={handleCreateBooking}>
              <div className="park-book-head">
                <h3>{isUser ? "Book a Parking Slot" : "Quick Booking"}</h3>
                <p>
                  Selected Slot:{" "}
                  <strong>
                    {selectedSlotMeta
                      ? `#${selectedSlotMeta.number} (Zone ${selectedSlotMeta.zone})`
                      : "None"}
                  </strong>
                </p>
              </div>
              <div className="park-book-grid">
                <label>
                  Parking Location
                  <select
                    value={bookingForm.locationName}
                    onChange={(event) =>
                      setBookingForm((current) => ({ ...current, locationName: event.target.value }))
                    }
                  >
                    <option value="">Select location first</option>
                    {parkingLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Vehicle Number
                  <input
                    value={bookingForm.vehicleNumber}
                    onChange={(event) =>
                      setBookingForm((current) => ({ ...current, vehicleNumber: event.target.value.toUpperCase() }))
                    }
                    placeholder="DL01AB1234"
                  />
                </label>
                <label>
                  Vehicle Type
                  <select
                    value={bookingForm.vehicleType}
                    onChange={(event) => setBookingForm((current) => ({ ...current, vehicleType: event.target.value }))}
                  >
                    {vehicleTypes.filter((type) => type !== "all").map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Duration (hours)
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={bookingForm.durationHours}
                    onChange={(event) =>
                      setBookingForm((current) => ({ ...current, durationHours: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Start Time
                  <input
                    type="datetime-local"
                    value={bookingForm.startTime}
                    onChange={(event) => setBookingForm((current) => ({ ...current, startTime: event.target.value }))}
                  />
                </label>
                <label className="full-span">
                  Notes
                  <textarea
                    rows="3"
                    value={bookingForm.notes}
                    onChange={(event) => setBookingForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Optional notes..."
                  />
                </label>
              </div>
              <button type="submit" className="park-primary-btn">
                Confirm Slot Booking
              </button>
            </form>
          </>
        )}

        {!isUser && activeTab === "analytics" && analytics && (
          <section className="park-analytics-grid">
            <article className="park-chart-card">
              <h3>Revenue Trend (7 Days)</h3>
              <LineChart points={analytics.trends.map((item) => ({ label: item.label, value: item.revenue }))} />
            </article>
            <article className="park-chart-card">
              <h3>Bookings Trend (7 Days)</h3>
              <BarChart points={analytics.trends.map((item) => ({ label: item.label, value: item.bookings }))} />
            </article>
            <article className="park-chart-card">
              <h3>Vehicle Type Distribution</h3>
              <div className="park-pie-list">
                {analytics.vehicleDistribution.map((item) => (
                  <p key={item.type}>
                    <strong>{item.type}</strong> <span>{item.count}</span>
                  </p>
                ))}
              </div>
            </article>
            <article className="park-chart-card">
              <h3>Current Occupancy</h3>
              <div className="park-occupancy-ring">
                <div
                  className="ring"
                  style={{
                    background: `conic-gradient(#f3d76b ${analytics.occupancyRate}%, rgba(255,255,255,0.08) 0)`,
                  }}
                />
                <p>{analytics.occupancyRate}% occupied</p>
              </div>
            </article>
          </section>
        )}

        {(activeTab === "history" || activeTab === "bookings") && (
          <section className="park-history-card">
            <div className="park-history-head">
              <div className="park-filter-grid">
                <input
                  placeholder="Search by booking ID, slot, vehicle..."
                  value={historyFilters.search}
                  onChange={(event) => setHistoryFilters((current) => ({ ...current, search: event.target.value }))}
                />
                <select
                  value={historyFilters.status}
                  onChange={(event) => setHistoryFilters((current) => ({ ...current, status: event.target.value }))}
                >
                  {statusOrder.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All statuses" : status}
                    </option>
                  ))}
                </select>
                <select
                  value={historyFilters.vehicleType}
                  onChange={(event) =>
                    setHistoryFilters((current) => ({ ...current, vehicleType: event.target.value }))
                  }
                >
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All vehicles" : type}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" className="park-primary-btn" onClick={exportCsv}>
                Export to CSV
              </button>
            </div>

            <div className="park-table-wrap">
              <table className="park-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    {!isUser && <th>User</th>}
                    <th>Slot</th>
                    <th>Vehicle</th>
                    <th>Location</th>
                    <th>Duration</th>
                    <th>Date & Time</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.bookingId}</td>
                      {!isUser && <td>{booking.userId?.name || "N/A"}</td>}
                      <td>#{booking.slotNumber || "-"}</td>
                      <td>
                        <strong>{booking.vehicleNumber || "-"}</strong>
                        <small>{booking.vehicleType || "-"}</small>
                      </td>
                      <td>{booking.locationName || "Main Building Parking"}</td>
                      <td>{booking.durationHours || "-"}h</td>
                      <td>{formatDateTime(getBookingStart(booking))}</td>
                      <td>{formatCurrency(booking.amount)}</td>
                      <td>
                        <span className={`park-status-pill ${booking.paymentStatus || "paid"}`}>
                          {booking.paymentStatus || "paid"}
                        </span>
                      </td>
                      <td>
                        {!isUser ? (
                          <select
                            className="park-status-select"
                            value={booking.status}
                            onChange={(event) => handleStatusUpdate(booking._id, event.target.value)}
                          >
                            {statusOrder.filter((item) => item !== "all").map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`park-status-pill ${booking.status}`}>{booking.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={isUser ? 9 : 10}>No bookings found for selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {isUser && activeTab === "payments" && (
          <section className="park-history-card">
            <div className="park-mini-cards">
              <article className="park-mini-card">
                <p>Total Spend</p>
                <h4>{formatCurrency(userTotals.totalSpend)}</h4>
              </article>
              <article className="park-mini-card">
                <p>Total Bookings</p>
                <h4>{userTotals.totalBookings}</h4>
              </article>
              <article className="park-mini-card">
                <p>Pending Payments</p>
                <h4>{userTotals.pendingPayments}</h4>
              </article>
            </div>
            <div className="park-table-wrap">
              <table className="park-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Slot</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.bookingId}</td>
                      <td>{formatDateTime(getBookingStart(booking))}</td>
                      <td>{booking.locationName || "Main Building Parking"}</td>
                      <td>Zone {booking.zone} / #{booking.slotNumber}</td>
                      <td>{formatCurrency(booking.amount)}</td>
                      <td>
                        <span className={`park-status-pill ${booking.paymentStatus || "paid"}`}>
                          {booking.paymentStatus || "paid"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paymentRows.length === 0 && (
                    <tr>
                      <td colSpan={6}>No payment records yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {isUser && activeTab === "locations" && (
          <section className="park-location-grid">
            {savedLocations.map((location) => (
              <article key={location.key} className="park-location-card">
                <h4>{location.locationName}</h4>
                <p>Last parked: {formatDateTime(location.lastParkedAt)}</p>
                <p>Last slot: Zone {location.zone} / #{location.slotNumber}</p>
                <p>Vehicle: {location.vehicleNumber}</p>
              </article>
            ))}
            {savedLocations.length === 0 && <p className="park-empty">No saved parking locations yet.</p>}
          </section>
        )}

        {activeTab === "profile" && (
          <section className="park-profile-grid">
            <form className="park-profile-card" onSubmit={saveProfile}>
              <h3>Personal Information</h3>
              <label>
                Full Name
                <input
                  value={profileForm.name}
                  onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label>
                Phone Number
                <input
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>
              <label>
                Default Vehicle Number
                <input
                  value={profileForm.defaultVehicleNumber}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      defaultVehicleNumber: event.target.value.toUpperCase(),
                    }))
                  }
                />
              </label>
              <button type="submit" className="park-primary-btn">
                Save Profile
              </button>
            </form>
            <article className="park-profile-card">
              <h3>Account Summary</h3>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>Total Spend:</strong> {formatCurrency(userTotals.totalSpend)}
              </p>
              <p>
                <strong>Total Bookings:</strong> {userTotals.totalBookings}
              </p>
              <p>
                <strong>Saved Locations:</strong> {savedLocations.length}
              </p>
            </article>
          </section>
        )}
      </section>
    </main>
  );
};
