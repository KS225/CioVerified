import { useNavigate } from "react-router-dom";
import "../../../styles/operations.css";

function OperationsDashboard() {
  const navigate = useNavigate();

  return (
    <div className="operations-wrapper">
      <h2>Operations Panel</h2>

      <div className="operations-grid">
        <div
          className="operations-card"
          onClick={() => navigate("/internal/operations/applications")}
        >
          <div className="operations-icon">📄</div>
          <h3>Applications</h3>
          <p>Review and manage applications</p>
        </div>

        <div className="operations-card">
          <div className="operations-icon">💰</div>
          <h3>Invoices</h3>
          <p>Manage pricing & invoices</p>
        </div>

        <div className="operations-card">
          <div className="operations-icon">🔁</div>
          <h3>Negotiations</h3>
          <p>Handle pricing discussions</p>
        </div>

        <div className="operations-card">
          <div className="operations-icon">📊</div>
          <h3>Reports</h3>
          <p>Track system performance</p>
        </div>
      </div>
    </div>
  );
}

export default OperationsDashboard;