import React, { useState } from "react";

function App() {
  // Overall budget inputs
  const [income, setIncome] = useState(4000);

  // Transactions as a normal JS array (not JSON text)
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: "2025-11-01",
      merchant: "Rent payment",
      amount: 1500,
      category: "Needs"
    },
    {
      id: 2,
      date: "2025-11-02",
      merchant: "Target groceries",
      amount: 250,
      category: "Needs"
    },
    {
      id: 3,
      date: "2025-11-03",
      merchant: "Netflix",
      amount: 16,
      category: "Wants"
    },
    {
      id: 4,
      date: "2025-11-04",
      merchant: "Roth IRA contribution",
      amount: 200,
      category: "Future You"
    }
  ]);

  // Form state for adding a single new transaction
  const today = new Date().toISOString().slice(0, 10);
  const [newDate, setNewDate] = useState(today);
  const [newMerchant, setNewMerchant] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Needs");

  // Results from backend
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);

  // Add a transaction to the list
  const handleAddTransaction = () => {
    if (!newMerchant || !newAmount) {
      alert("Please enter a merchant and amount.");
      return;
    }

    const amountNumber = Number(newAmount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      alert("Amount must be a positive number.");
      return;
    }

    const nextId =
      transactions.length > 0
        ? Math.max(...transactions.map((t) => t.id)) + 1
        : 1;

    const newTx = {
      id: nextId,
      date: newDate,
      merchant: newMerchant,
      amount: amountNumber,
      category: newCategory
    };

    setTransactions([...transactions, newTx]);

    // reset form fields a bit
    setNewMerchant("");
    setNewAmount("");
  };

  // Remove a transaction
  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Call backend /insights
  const handleAnalyze = async () => {
    if (transactions.length === 0) {
      alert("Add at least one transaction first.");
      return;
    }

    setLoading(true);
    setSummary(null);
    setInsights([]);

    try {
      const res = await fetch("http://127.0.0.1:8000/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          income: Number(income),
          transactions: transactions,
          budget_needs_pct: 0.5,
          budget_wants_pct: 0.3,
          budget_future_pct: 0.2
        })
      });

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();
      setSummary(data.summary);
      setInsights(data.insights || []);
    } catch (err) {
      console.error(err);
      alert("Error contacting backend.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- STYLES (Rhoyal black & white) ----------
  const pageStyle = {
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
    backgroundColor: "#0b0b0b",
    color: "#111",
    display: "flex",
    flexDirection: "column"
  };

  const headerStyle = {
    backgroundColor: "#000",
    color: "#fff",
    padding: "14px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #222"
  };

  const brandStyle = {
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: 14
  };

  const shellStyle = {
    flex: 1,
    padding: 32,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    background:
      "radial-gradient(circle at top, #222 0, #0b0b0b 45%, #000 100%)"
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 1200,
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
    padding: 24,
    border: "1px solid #e0e0e0"
  };

  const sectionTitle = {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8
  };

  const labelStyle = {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#777",
    marginBottom: 4,
    display: "block"
  };

  const inputStyle = {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "1px solid #d0d0d0",
    backgroundColor: "#ffffff",
    fontSize: 14
  };

  const primaryButton = {
    padding: "10px 20px",
    fontSize: 15,
    borderRadius: 999,
    border: "none",
    backgroundColor: "#000",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
    opacity: loading ? 0.7 : 1
  };

  const subtleButton = {
    padding: "8px 16px",
    borderRadius: 999,
    border: "none",
    backgroundColor: "#0b8457",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500
  };

  const deleteButton = {
    border: "none",
    background: "none",
    color: "#c00",
    cursor: "pointer",
    fontSize: 12
  };

  return (
    <div style={pageStyle}>
      {/* Top black header */}
      <header style={headerStyle}>
        <div style={brandStyle}>RHOYAL BUDGETING</div>
        <div style={{ fontSize: 12, color: "#aaa" }}>
          Prototype • Localhost • v0.1
        </div>
      </header>

      {/* Main content shell */}
      <main style={shellStyle}>
        <div style={cardStyle}>
          {/* Title row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "baseline",
              marginBottom: 16
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  letterSpacing: "-0.02em"
                }}
              >
                AI Budgeting Dashboard
              </h1>
              <p style={{ marginTop: 6, marginBottom: 0, color: "#666" }}>
                Track Needs / Wants / Future You in one clean view.
              </p>
            </div>

            <div style={{ textAlign: "right", minWidth: 220 }}>
              <span style={labelStyle}>Monthly Income ($)</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Analyze button row */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 24
            }}
          >
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={primaryButton}
            >
              <span>{loading ? "Analyzing…" : "Analyze Budget"}</span>
            </button>
          </div>

          {/* Main grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 2fr",
              gap: 24
            }}
          >
            {/* LEFT SIDE: Transactions */}
            <div>
              <h2 style={sectionTitle}>Transactions</h2>

              {/* Add Transaction Form */}
              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid #e0e0e0",
                  padding: 16,
                  marginBottom: 16,
                  backgroundColor: "#fff"
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: 12,
                    fontSize: 14,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#555"
                  }}
                >
                  Add Transaction
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr 1fr 1fr",
                    gap: 10,
                    marginBottom: 12
                  }}
                >
                  <div>
                    <span style={labelStyle}>Date</span>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <span style={labelStyle}>Merchant</span>
                    <input
                      type="text"
                      value={newMerchant}
                      onChange={(e) => setNewMerchant(e.target.value)}
                      placeholder="Starbucks, Rent, etc."
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <span style={labelStyle}>Amount</span>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <span style={labelStyle}>Category</span>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="Needs">Needs</option>
                      <option value="Wants">Wants</option>
                      <option value="Future You">Future You</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleAddTransaction} style={subtleButton}>
                  Add transaction
                </button>
              </div>

              {/* Transactions Table */}
              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid #e0e0e0",
                  padding: 16,
                  backgroundColor: "#fff",
                  maxHeight: 300,
                  overflowY: "auto"
                }}
              >
                {transactions.length === 0 ? (
                  <p style={{ margin: 0, color: "#777" }}>
                    No transactions yet. Add a few to get started.
                  </p>
                ) : (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            borderBottom: "1px solid #eee",
                            paddingBottom: 8
                          }}
                        >
                          Date
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            borderBottom: "1px solid #eee",
                            paddingBottom: 8
                          }}
                        >
                          Merchant
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            borderBottom: "1px solid #eee",
                            paddingBottom: 8
                          }}
                        >
                          Amount
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            borderBottom: "1px solid #eee",
                            paddingBottom: 8
                          }}
                        >
                          Category
                        </th>
                        <th
                          style={{
                            borderBottom: "1px solid #eee"
                          }}
                        ></th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td style={{ padding: "6px 0" }}>{t.date}</td>
                          <td>{t.merchant}</td>
                          <td style={{ textAlign: "right" }}>
                            ${t.amount.toFixed(2)}
                          </td>
                          <td>{t.category}</td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              style={deleteButton}
                            >
                              delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Summary + Insights */}
            <div>
              <h2 style={sectionTitle}>Results</h2>

              {!summary && (
                <p style={{ color: "#777" }}>
                  Run an analysis to see your monthly breakdown and coaching
                  notes here.
                </p>
              )}

              {summary && (
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid #e0e0e0",
                    padding: 16,
                    backgroundColor: "#fff",
                    marginBottom: 16
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: 8,
                      fontSize: 14,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#555"
                    }}
                  >
                    {summary.month}
                  </h3>
                  <p style={{ margin: 0 }}>Income: ${summary.income.toFixed(2)}</p>
                  <p style={{ margin: 0 }}>Needs: ${summary.needs_spent.toFixed(2)}</p>
                  <p style={{ margin: 0 }}>Wants: ${summary.wants_spent.toFixed(2)}</p>
                  <p style={{ margin: 0 }}>
                    Future You: ${summary.future_spent.toFixed(2)}
                  </p>
                </div>
              )}

              {insights.length > 0 && (
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid #e0e0e0",
                    padding: 16,
                    backgroundColor: "#fff"
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: 8,
                      fontSize: 14,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#555"
                    }}
                  >
                    AI Insights
                  </h3>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {insights.map((text, idx) => (
                      <li key={idx} style={{ marginBottom: 6, color: "#333" }}>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
