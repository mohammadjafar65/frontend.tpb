import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import api from "../api";
import { fmtDate, fmtDateTime } from "../utils/dates";

export default function Bookings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const load = async ({ p = page, q = search } = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/bookings", {
        params: { search: q, page: Number(p), pageSize: Number(pageSize) },
      });
      setRows(data.bookings || []);
      setTotal(data.total || 0);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({});
  }, [search, page]);

  if (loading) return <div className="p-6">Loading bookings…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto ml-64">
        <Header />
        <main className="flex-1 p-8 bg-gray-50 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
            <input
              className="border rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              placeholder="Search customer, email, package"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <div className="bg-white rounded-md shadow overflow-hidden border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Package</th>
                  <th className="px-6 py-3">Guests</th>
                  <th className="px-6 py-3">Start Date</th>
                  <th className="px-6 py-3">End Date</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b, i) => (
                  <tr
                    key={b.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-6 py-3 font-medium">{b.customer_name}</td>
                    <td className="px-6 py-3">{b.email}</td>
                    <td className="px-6 py-3">{b.package_name}</td>
                    <td className="px-6 py-3">{b.guests}</td>
                    <td className="px-6 py-3">{fmtDate(b.start_date)}</td>
                    <td className="px-6 py-3">{fmtDate(b.end_date)}</td>
                    <td className="px-6 py-3">
                      {b.currency || "INR"} {Number(b.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-semibold ${
                          b.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : b.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {b.created_at
                        ? fmtDateTime(b.created_at)
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Link
                        to={`/bookings/${b.id}`}
                        className="inline-block px-4 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td
                      className="px-6 py-6 text-gray-500 text-center"
                      colSpan={10}
                    >
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-4 mt-6">
            <button
              className="px-4 py-2 border rounded-md bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} / {pages}
            </span>
            <button
              className="px-4 py-2 border rounded-md bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50"
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
