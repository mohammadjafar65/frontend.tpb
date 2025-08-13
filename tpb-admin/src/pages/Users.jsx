import React, { useEffect, useState } from "react";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import api from "../api";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busyId, setBusyId] = useState(null); // per-row loading
  const pageSize = 20;

  const load = async ({ p = page, q = search } = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", {
        params: { search: q, page: p, pageSize },
      });
      setRows(data.users || []);
      setTotal(data.total || 0);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load({}); }, [search, page]);

  const updateRole = async (id, role) => {
    setBusyId(id);
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setRows((r) => r.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to update role");
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Remove this user? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setRows((r) => r.filter((u) => u.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to remove user");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="p-6">Loading users…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto ml-64">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-primary">Users</h1>
            <input
              className="border rounded px-2 py-1"
              placeholder="Search name or email"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </div>

          <div className="bg-white rounded-md shadow border overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  {/* <th className="px-4 py-3">Verified</th> */}
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    {/* <td className="px-4 py-3">{u.email_verified ? "Yes" : "No"}</td> */}
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={busyId === u.id}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="px-3 py-1 border rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
                        onClick={() => removeUser(u.id)}
                        disabled={busyId === u.id}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td className="px-4 py-6 text-gray-500" colSpan={6}>
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span className="text-sm">Page {page} / {pages}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
