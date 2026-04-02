import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/assessorApplications.css";

function ReviewerApplications() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/reviewer/checklists",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Failed to fetch review queue");
          return;
        }

        setChecklists(data);
      } catch (err) {
        console.error("Fetch reviewer checklists error:", err);
        alert("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
  }, []);

  const startReview = (checklistId) => {
    navigate(`/assessor/review/${checklistId}`);
  };

  if (loading) {
    return (
      <div className="application-loading">
        Loading review queue...
      </div>
    );
  }

  if (!checklists.length) {
    return (
      <div className="application-empty">
        No checklists assigned for review.
      </div>
    );
  }

  return (
    <div className="application-container">
      <h2>Checklists Assigned to You (Reviewer)</h2>

      <table className="application-table">
        <thead>
          <tr>
            <th>Checklist ID</th>
            <th>Company Name</th>
            <th>Entity Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Score %</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {checklists.map((item) => (
            <tr key={item.checklist_id}>
              <td>{item.checklist_id}</td>
              <td>{item.company_name}</td>
              <td>{item.entity_name}</td>
              <td>{item.category}</td>
              <td>{item.status}</td>
              <td>{item.percentage_score ?? "-"}</td>

              <td>
                <button
                  onClick={() => startReview(item.checklist_id)}
                >
                  Start Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReviewerApplications;