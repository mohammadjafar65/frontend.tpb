import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import api from "../api";
import { fmtDate, fmtDateTime } from "../utils/dates";

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .get(`/admin/bookings/${id}`)
      .then(({ data }) => setBooking(data.booking))
      .catch((e) => setErr(e?.response?.data?.error || "Failed to load booking"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading booking…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!booking) return <div className="p-6">Not found.</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto ml-64">
        <Header />
        <main className="flex-1 p-8 bg-gray-50 min-h-screen">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Booking Details</h1>
            <Link
              to="/bookings"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to bookings
            </Link>
          </div>

          <div className="bg-white shadow-lg rounded-md p-8">
            {/* Package Name */}
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">
              {booking.package_name}
            </h2>

            {/* 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10 text-sm text-gray-700">
              <Info label="Customer" value={booking.customer_name} />
              <Info label="Email" value={booking.email} />
              <Info label="Phone" value={booking.phone || "—"} />
              <Info label="Guests" value={booking.guests} />
              <Info label="Start Date" value={fmtDate(booking.start_date)} />
              <Info label="End Date" value={fmtDate(booking.end_date)} />
              <Info
                label="Total Amount"
                value={`${booking.currency} ${Number(booking.total_amount).toFixed(
                  2
                )}`}
              />
              <Info
                label="Price per person"
                value={`${booking.currency} ${Number(
                  booking.price_per_person
                ).toFixed(2)}`}
              />

              {/* Status with badge */}
              <div>
                <div className="text-gray-500 font-medium">Status</div>
                <span
                  className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-semibold ${
                    booking.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <Info
                label="Special Requests"
                value={booking.special_requests || "—"}
              />
              <Info
                label="Address"
                value={`${booking.address1 || ""} ${
                  booking.address2 || ""
                }, ${booking.state || ""} ${booking.zip || ""}`}
              />
              <Info
                label="Created"
                value={fmtDateTime(booking.created_at)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Small helper component for cleaner JSX
function Info({ label, value }) {
  return (
    <div>
      <div className="text-gray-500 font-medium">{label}</div>
      <div className="mt-1 text-gray-800 font-semibold">{value}</div>
    </div>
  );
}
