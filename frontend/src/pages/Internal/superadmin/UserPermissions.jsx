import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import "../../../styles/superadmin.css";

export default function UserPermissions() {
  const { id } = useParams();

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await API.get(`/admin/user-permissions/${id}`);
      setPermissions(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [id]); // ✅ FIXED

  const togglePermission = async (perm) => {
    try {
      await API.post("/admin/update-permission", {
        userId: id,
        permissionId: perm.id,
        is_revoked: !perm.is_revoked,
      });

      // ✅ instant UI update (no reload feel)
      setPermissions((prev) =>
        prev.map((p) =>
          p.id === perm.id ? { ...p, is_revoked: !p.is_revoked } : p
        )
      );

    } catch (err) {
      console.error(err);
      alert("Failed to update permission");
    }
  };

  if (loading) return <p>Loading permissions...</p>;

  return (
    <div className="sa-container">
      <h2>User Permissions (User ID: {id})</h2>

      <div className="permissions-box">
        {permissions.length === 0 ? (
          <p>No permissions found</p>
        ) : (
          permissions.map((p) => (
            <div key={p.id} className="perm-row">
              <input
                type="checkbox"
                checked={!p.is_revoked}
                onChange={() => togglePermission(p)}
              />
              <span className="perm-name">{p.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}