import { useEffect, useState } from "react";
import API from "../../../services/api";
import "../../../styles/verifyAuditor.css";

export default function VerifyAuditors() {
  const [auditors, setAuditors] = useState([]);
  const [credentials, setCredentials] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("submitted");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  const ITEMS_PER_PAGE = 6;

  // 🔥 Convert buffer → string path
  const bufferToString = (bufferObj) => {
    if (!bufferObj?.data) return null;
    return new TextDecoder().decode(new Uint8Array(bufferObj.data));
  };

  // ✅ FETCH
  const fetchAuditors = async () => {
    try {
      const res = await API.get("/admin/auditors/pending");
      setAuditors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuditors();
  }, []);

  // 🍞 TOAST
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ✅ VERIFY
  const handleVerify = async (id) => {
    try {
      const res = await API.post(`/admin/auditors/verify/${id}`);
      setCredentials(res.data.credentials);
      showToast("Auditor verified ✅");
      fetchAuditors();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ REJECT
  const handleReject = async (id) => {
    try {
      await API.post(`/admin/auditors/reject/${id}`);
      showToast("Auditor rejected ❌");
      fetchAuditors();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔍 FILTER
  const filteredAuditors = auditors.filter((a) => {
    const matchSearch =
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());

   const matchStatus =
  statusFilter === "all" ||
  (a.status || "SUBMITTED").toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  // 📄 PAGINATION
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filteredAuditors.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAuditors.length / ITEMS_PER_PAGE);

  // 📋 COPY
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied!");
  };

  return (
    <div className="verify-container">
      <h1 className="page-title">Verify Auditors</h1>

      {/* 🍞 TOAST */}
      {toast && <div className="toast">{toast}</div>}

      {/* 🔍 TOP BAR */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search auditors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="submitted">Submitted</option>
  <option value="verified">Verified</option>
  <option value="all">All</option>
</select>
      </div>

      {/* 🔥 MODAL */}
      {credentials && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Credentials Generated</h2>

            <div className="cred-box">
              <p><span>Email:</span> {credentials.email}</p>
              <p><span>Password:</span> {credentials.password}</p>
            </div>

            <div className="modal-actions">
              <button onClick={() => copyToClipboard(credentials.email)}>
                Copy Email
              </button>
              <button onClick={() => copyToClipboard(credentials.password)}>
                Copy Password
              </button>
            </div>

            <button
              className="close-btn"
              onClick={() => setCredentials(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* LIST */}
      {paginated.length === 0 ? (
        <p className="empty-text">No auditors found</p>
      ) : (
        <div className="auditor-grid">
          {paginated.map((a) => {
            const resumePath = bufferToString(a.resume);
            const companyPath = bufferToString(a.company_profile);

            return (
              <div key={a.id} className="auditor-card">
                <div className="card-header">
                  <h3>{a.full_name}</h3>
                  <span className={`badge ${(a.status || "SUBMITTED").toLowerCase()}`}>
  {(a.status || "SUBMITTED").toLowerCase()}
</span>
                </div>

                <div className="card-body">
                  <p><b>Email:</b> {a.email}</p>
                  <p><b>Phone:</b> {a.phone}</p>
                  <p><b>Specialization:</b> {a.specialization}</p>
                </div>

                <div className="card-links">
                  {resumePath && (
                    <a
                      href={`http://localhost:5000/${resumePath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Resume
                    </a>
                  )}

                  {companyPath && (
                    <a
                      href={`http://localhost:5000/${companyPath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Company Profile
                    </a>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    className="verify-btn"
                    onClick={() => handleVerify(a.id)}
                  >
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() => handleReject(a.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span>Page {page} of {totalPages}</span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}