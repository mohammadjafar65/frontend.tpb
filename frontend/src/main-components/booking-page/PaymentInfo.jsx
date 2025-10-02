import { useMemo, useState, useEffect } from "react";
import API from "../../api";

const ensureCheckoutLoaded = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });

export default function PaymentInfo({
  packageId,
  pkg,
  booking,
  promo,
  setPromo,
  onPaid,
  selection
}) {
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [promoInput, setPromoInput] = useState(promo?.code ?? "");
  const [bookingRec, setBookingRec] = useState(null);

  useEffect(() => {
    const id = booking?.booking_id || sessionStorage.getItem("bookingId") || null;
    if (!id) return;
    let isMounted = true;
    API.get(`/booking/${id}`)
      .then(({ data }) => {
        if (!isMounted) return;
        setBookingRec(data);
        if (data?.selection) setSel((old) => ({ ...old, ...data.selection }));
      })
      .catch((e) => console.error("fetch booking failed", e));
    return () => { isMounted = false; };
  }, []);

  const effBooking = bookingRec || booking || {};

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

  const title =
    pkg?.packageName || sel?.title || "Package";
  const img =
    (pkg?.featuredImage && pkg.featuredImage !== "null"
      ? pkg.featuredImage
      : "/img/backgrounds/1.png");

  const perPerson = Number(
    bookingRec?.price_per_person ??
    pkg?.basePrice ??
    sel?.pricePerPerson ??
    0
  );
  const guests = Number(bookingRec?.guests ?? sel?.guests ?? 1);
  const subtotal = Number(
    bookingRec?.total_amount ??
    (perPerson * guests)
  );

  const fmtINR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  const fmtLong = (v) => {
    if (!v) return "—";
    const d = typeof v === "string" && v.includes("T") ? new Date(v) : new Date(`${v}T00:00:00`);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  // amounts
  const discountAmount = (promo?.discountPaise || 0) / 100;
  const finalPayable = Math.max(0, subtotal - discountAmount);

  // promo endpoint (note the /api prefix)
  const applyPromo = async () => {
    if (!promoInput) return;
    try {
      const { data } = await API.post("/api/promos/preview", {
        packageId,
        code: promoInput,
      });
      setPromo({
        code: promoInput,
        discountPaise: data.discount_paise || 0,
        message: data.message || "Promo applied",
      });
      alert("Promo applied!");
    } catch (e) {
      setPromo(null);
      alert(e?.response?.data?.error || "Invalid promo code");
    }
  };

  const handlePayment = async () => {
    try {
      if (!packageId) return alert("Package not selected");
      setLoading(true);
      await ensureCheckoutLoaded();

      const bookingId = (bookingRec?.booking_id || sessionStorage.getItem("bookingId")) ?? null;

      const { data } = await API.post("/api/orders", {
        packageId,
        booking: bookingRec || booking || {},   // ok either way
        booking_id: bookingId,                  // link order to booking
        promo_code: promo?.code || null,
      });

      const { order } = data;
      const rzp = new window.Razorpay({
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,        // paise (server now sends subtotal * 100)
        currency: order.currency,
        name: "The Pilgrim Beez",
        description: `Booking: ${data?.package?.name || "Package"}`,
        order_id: order.id,
        handler: async (response) => {
          setFinalizing(true); // show loader until final screen
          const verify = await API.post("/api/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verify.data?.success) {
            onPaid?.(verify.data.summary);
          } else {
            alert("Payment verification failed");
            setFinalizing(false);
          }
        },
        prefill: {
          name: (bookingRec || booking)?.customer_name,
          email: (bookingRec || booking)?.email,
          contact: (bookingRec || booking)?.phone,
        },
        theme: { color: "#1d4ed8" },
      });

      rzp.on("payment.failed", () => alert("Payment failed, please try again."));
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="col-xl-8 col-lg-8 text-left">
        <div className="mt-40 px-30 py-30 border-light rounded-4 text-left">
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
          <div className="row y-gap-40 justify-left">
            <div className="col-auto">
              <div className="text-15">Start Date</div>
              <div className="fw-500">{fmtLong(sel?.startDate)}</div>
            </div>
            <div className="col-auto md:d-none">
              <div className="h-full w-1 bg-border" />
            </div>
            <div className="col-auto text-left md:text-left">
              <div className="text-15">End Date</div>
              <div className="fw-500">{fmtLong(sel?.endDate)}</div>
            </div>
            <div className="col-auto md:d-none">
              <div className="h-full w-1 bg-border" />
            </div>
            <div className="col-auto text-left md:text-left">
              <div className="text-15">Number of Guests</div>
              <div className="fw-500">
                {guests} {guests === 1 ? "Guest" : "Guests"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-4 col-lg-4 text-left">
        <div className="mt-40">
          {/* Promo code (optional) */}
          {/* <div className="row x-gap-20 y-gap-20 pt-10">
            <div className="col-md-6">
              <div className="form-input">
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                />
                <label className="lh-1 text-16 text-light-1">
                  Enter promo code
                </label>
              </div>
            </div>
            <div className="col-md-3">
              <button
                className="button h-52 px-20 -blue-1 bg-light-2"
                onClick={applyPromo}
              >
                Apply
              </button>
            </div>
            {!!promo?.message && (
              <div className="col-12 text-14 mt-5">{promo.message}</div>
            )}
          </div> */}

          {/* Price summary */}
          <div className="px-30 py-30 border-light rounded-4 mt-30 text-left">
            <div className="text-20 fw-500 mb-20">Your price summary</div>

            <div className="row y-gap-5 justify-between">
              <div className="col-auto">
                <div className="text-15">Price per person</div>
              </div>
              <div className="col-auto">
                <div className="text-15">₹{perPerson.toFixed(2)}</div>
              </div>
            </div>

            <div className="row y-gap-5 justify-between pt-5">
              <div className="col-auto">
                <div className="text-15">Guests</div>
              </div>
              <div className="col-auto">
                <div className="text-15">{guests}</div>
              </div>
            </div>

            <div className="row y-gap-5 justify-between pt-5">
              <div className="col-auto">
                <div className="text-15">Subtotal</div>
              </div>
              <div className="col-auto">
                <div className="text-15">₹{subtotal.toFixed(2)}</div>
              </div>
            </div>

            {!!discountAmount && (
              <div className="row y-gap-5 justify-between pt-5">
                <div className="col-auto">
                  <div className="text-15">Promo discount</div>
                </div>
                <div className="col-auto">
                  <div className="text-15">- ₹{discountAmount.toFixed(2)}</div>
                </div>
              </div>
            )}

            <div className="px-20 py-20 bg-gray rounded-4 mt-20">
              <div className="row y-gap-5 justify-between">
                <div className="col-auto">
                  <div className="text-18 lh-13 fw-500">Payable</div>
                </div>
                <div className="col-auto">
                  <div className="text-18 lh-13 fw-500">₹{finalPayable.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="col-12 mt-20 p-0">
              <button onClick={handlePayment} disabled={loading || finalizing}
                aria-busy={loading || finalizing}
                className="button button-play h-60 px-30 -dark-1 bg-blue-1 text-white" style={{ borderRadius: 10, fontWeight: 600 }}>
                {loading
                  ? "Processing..."
                  : finalizing
                    ? "Finalizing payment..."
                    : `Pay ₹${finalPayable.toFixed(2)} Now`}
                <div className="icon-arrow-top-right ml-15" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
