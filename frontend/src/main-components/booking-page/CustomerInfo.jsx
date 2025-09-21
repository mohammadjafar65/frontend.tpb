import React, { useEffect, useState } from "react";
import API from "../../api";
import { CircleUser, Mail, Phone, MapPin, Info } from 'lucide-react';


export default function CustomerInfo({ user, userLoaded, booking, setBooking, pkg, onNext, selection }) {
  const on = (k) => (e) => setBooking((b) => ({ ...b, [k]: e.target.value }));
  const [saving, setSaving] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);

  // ✅ Load last booking
  useEffect(() => {
    const fetchLastBooking = async () => {
      if (user) {
        try {
          const { data } = await API.get("/booking/my-latest");
          if (data.booking) {
            const cleanBooking = Object.fromEntries(
              Object.entries(data.booking).filter(([_, v]) => v != null && v !== "")
            );
            setLastBooking(data.booking);
            setBooking((b) => ({ ...b, ...cleanBooking }));
          }
        } catch (err) {
          console.error("Failed to fetch last booking", err);
        }
      }
    };
    fetchLastBooking();
  }, [user]);

  // ✅ Load selection
  const [sel, setSel] = useState(() => {
    if (selection) return selection;
    try {
      return JSON.parse(sessionStorage.getItem("prebooking") || "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    if (selection) setSel(selection);
  }, [selection]);

  const title = pkg?.packageName || sel?.title || "Package";
  const img =
    pkg?.featuredImage && pkg.featuredImage !== "null"
      ? pkg.featuredImage
      : "/img/backgrounds/1.png";

  const guests = Number(sel?.guests || 1);
  const perPerson = Number(pkg?.basePrice || sel?.pricePerPerson || 0);
  const total = sel?.total != null ? Number(sel.total) : perPerson * guests;

  const fmtINR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  const fmtLong = (ymd) => {
    if (!ymd) return "—";
    const d = new Date(`${ymd}T00:00:00`);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ✅ Booking save
  const saveAndNext = async () => {
    try {
      setSaving(true);

      const guests = Number(sel?.guests || 1);
      const pricePerPerson = Number(pkg?.basePrice || sel?.pricePerPerson || 0);
      const total = sel?.total != null ? Number(sel.total) : pricePerPerson * guests;

      // 🔑 Fix fallback order: prefer user → booking → lastBooking
      const normalizedBooking = {
        customer_name: (user?.name || booking.customer_name || lastBooking?.customer_name || "").trim(),
        email: (user?.email || booking.email || lastBooking?.email || "").trim(),
        phone: (user?.phone || booking.phone || lastBooking?.phone || "").trim(),
        address1: (booking.address1 || lastBooking?.address1 || "").trim(),
        address2: (booking.address2 || lastBooking?.address2 || "").trim(),
        state: (booking.state || lastBooking?.state || "").trim(),
        zip: (booking.zip || lastBooking?.zip || "").trim(),
        special_requests: (booking.special_requests || lastBooking?.special_requests || "").trim(),
      };

      const payload = {
        packageId: pkg?.packageId || sel?.packageId || pkg?.id || "",
        packageName: pkg?.packageName || sel?.title || "Package",
        packageSnapshot: pkg || {},
        selection: {
          startDate: sel?.startDate || null,
          endDate: sel?.endDate || null,
          guests,
          pricePerPerson,
          total,
        },
        customer: normalizedBooking,
      };

      const { data } = await API.post("/booking/create", payload);
      if (!data?.bookingId) throw new Error("No bookingId returned");

      sessionStorage.setItem("bookingId", data.bookingId);

      try {
        const me = await API.get("/auth/me");
        console.log("User after booking:", me.data);
      } catch { }

      onNext?.(data.bookingId);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Failed to save booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="col-xl-7 col-lg-8 mt-30 text-left">
        <h2 className="text-22 fw-500 mt-20 md:mt-24">
          {user ? "" : "Let us know who you are"}
        </h2>

        {user && lastBooking ? (
          <div className="mt-20 p-4 w-100 border rounded-4 bg-white">
            <div className="text-20 mb-20">Your details</div>
            <div className="">
              <div className="d-flex items-start gap-3 mb-10">
                <CircleUser className="text-blue-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-md font-medium text-blue-1">
                    {lastBooking.customer_name || user.name}
                  </p>
                </div>
              </div>

              <div className="d-flex items-start gap-3 mb-10">
                <Mail className="text-blue-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-blue-1">
                    {lastBooking.email || user.email}
                  </p>
                </div>
              </div>

              <div className="d-flex items-start gap-3 mb-10">
                <Phone className="text-blue-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-blue-1">
                    {lastBooking.phone || user.phone}
                  </p>
                </div>
              </div>

              <div className="d-flex items-start gap-3 mb-10">
                <MapPin className="text-blue-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-blue-1">
                    {lastBooking.address1 || "—"} {lastBooking.address2 || ""},{" "}
                    {lastBooking.state || "—"}, {lastBooking.zip || "—"}
                  </p>
                </div>
              </div>

              {lastBooking.special_requests && (
                <div className="d-flex items-start gap-3 mb-10">
                  <Info className="text-blue-500 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Special Requests</p>
                    <p className="text-sm font-medium text-blue-1">
                      {lastBooking.special_requests}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              className="button h-60 px-24 mt-20 -dark-1 bg-blue-1 text-white mt-25 rounded-4 shadow-md hover:bg-blue-2 transition"
              onClick={saveAndNext}
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? "Saving..." : "Continue to Payment"}{" "}
              <div className="icon-arrow-top-right ml-15" />
            </button>
          </div>
        ) : (
          // ✅ Guest OR logged-in without lastBooking → form
          <div className="row x-gap-20 y-gap-20 pt-20">
            <div className="col-12">
              <div className="form-input">
                <input
                  type="text"
                  value={booking.customer_name || user?.name || ""}
                  onChange={on("customer_name")}
                />
                <label className="lh-1 text-16 text-light-1">Full Name</label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-input">
                <input
                  type="email"
                  value={booking.email || user?.email || ""}
                  onChange={on("email")}
                />
                <label className="lh-1 text-16 text-light-1">Email</label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-input">
                <input
                  type="text"
                  value={booking.phone || user?.phone || ""}
                  onChange={on("phone")}
                />
                <label className="lh-1 text-16 text-light-1">Phone Number</label>
              </div>
            </div>

            <div className="col-12">
              <div className="form-input">
                <input type="text" value={booking.address1 || ""} onChange={on("address1")} />
                <label className="lh-1 text-16 text-light-1">Address line 1</label>
              </div>
            </div>

            <div className="col-12">
              <div className="form-input">
                <input type="text" value={booking.address2 || ""} onChange={on("address2")} />
                <label className="lh-1 text-16 text-light-1">Address line 2</label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-input">
                <input type="text" value={booking.state || ""} onChange={on("state")} />
                <label className="lh-1 text-16 text-light-1">State/Province/Region</label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-input">
                <input type="text" value={booking.zip || ""} onChange={on("zip")} />
                <label className="lh-1 text-16 text-light-1">ZIP code/Postal code</label>
              </div>
            </div>

            <div className="col-12">
              <div className="form-input">
                <textarea rows={6} value={booking.special_requests || ""} onChange={on("special_requests")} />
                <label className="lh-1 text-16 text-light-1">Special Requests</label>
              </div>
            </div>

            <div className="col-12">
              <button
                className="button h-60 px-24 -dark-1 bg-blue-1 text-white"
                onClick={saveAndNext}
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? "Saving..." : "Continue to Payment"} <div className="icon-arrow-top-right ml-15" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Sidebar */}
      <div className="col-xl-5 col-lg-4 mt-30">
        <div className="mt-20">
          <div className="px-30 py-30 border-light rounded-4 text-left">
            <div className="text-20 fw-500 mb-30">Your booking details</div>

            <div className="row x-gap-15 y-gap-20">
              <div className="col-auto">
                <img src={img} alt="image" className="size-140 rounded-4 object-cover" />
              </div>
              <div className="col">
                <div className="lh-17 fw-500">{title}</div>
                <div className="text-14 lh-15 mt-5">
                  {pkg?.stateNames?.map((s) => s.name).join(", ") || "—"}
                </div>
              </div>
            </div>

            <div className="border-top-light mt-30 mb-20" />
            <div className="row y-gap-20 justify-between">
              <div className="col-auto">
                <div className="text-15">Start Date</div>
                <div className="fw-500">{fmtLong(sel?.startDate)}</div>
              </div>
              <div className="col-auto md:d-none">
                <div className="h-full w-1 bg-border" />
              </div>
              <div className="col-auto text-right md:text-left">
                <div className="text-15">End Date</div>
                <div className="fw-500">{fmtLong(sel?.endDate)}</div>
              </div>
            </div>

            <div className="border-top-light mt-30 mb-20" />
            <div className="row y-gap-20 justify-between">
              <div className="col-auto">
                <div className="text-15">Number of Guests</div>
                <div className="fw-500">
                  {guests} {guests === 1 ? "Guest" : "Guests"}
                </div>
              </div>
              <div className="col-auto md:d-none">
                <div className="h-full w-1 bg-border" />
              </div>
              <div className="col-auto text-right md:text-left">
                <div className="text-15 text-blue-1">Total Amount</div>
                <div className="fw-600 text-blue-1">{fmtINR(total)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
