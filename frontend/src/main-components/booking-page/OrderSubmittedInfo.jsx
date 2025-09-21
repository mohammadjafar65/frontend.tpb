// OrderSubmittedInfo.jsx
const OrderSubmittedInfo = ({ summary }) => {
  const s = summary || {};
  return (
    <>
      <div className="col-xl-8 col-lg-8 text-left">
        <div className="order-completed-wrapper">
          <div className="d-flex flex-column items-center mt-40">
            <div className="size-80 flex-center rounded-full bg-dark-3">
              <i className="icon-check text-30 text-white" />
            </div>
            <div className="text-30 lh-1 fw-600 mt-20">
              {s.packageName ? `${s.packageName}` : "Your order"} was purchased successfully!
            </div>
            <div className="text-15 text-light-1 mt-10">
              A confirmation has been sent to your email.
            </div>
          </div>

          <div className="border-type-1 rounded-8 px-50 py-35 mt-40">
            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div className="text-15 lh-12">Order ID</div>
                <div className="text-15 lh-12 fw-500 text-blue-1 mt-10">{s.orderId || "-"}</div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="text-15 lh-12">Date</div>
                <div className="text-15 lh-12 fw-500 text-blue-1 mt-10">
                  {s.purchasedAt ? new Date(s.purchasedAt).toLocaleString() : "-"}
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="text-15 lh-12">Total</div>
                <div className="text-15 lh-12 fw-500 text-blue-1 mt-10">
                  {s.currency || "INR"} {s.amount || "-"}
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="text-15 lh-12">Payment Method</div>
                <div className="text-15 lh-12 fw-500 text-blue-1 mt-10">{s.method || "Razorpay"}</div>
              </div>
            </div>
            <div className="row mt-30">
              <div className="col-lg-6">
                <div className="text-15 lh-12">User Name</div>
                <div className="text-15 fw-500 mt-5">{s.customerName || "-"}</div>
              </div>
              <div className="col-lg-6">
                <div className="text-15 lh-12">Email</div>
                <div className="text-15 fw-500 mt-5">{s.email || "-"}</div>
              </div>
              <div className="col-lg-6 mt-20">
                <div className="text-15 lh-12">Guests</div>
                <div className="text-15 fw-500 mt-5">{s.guests || "-"}</div>
              </div>
              <div className="col-lg-6 mt-20">
                <div className="text-15 lh-12">Dates</div>
                <div className="text-15 fw-500 mt-5">
                  {s.startDate} → {s.endDate}
                </div>
              </div>
            </div>
          </div>

          {/* You can render user/address block here if you collect it */}
        </div>
      </div>
    </>
  );
};

export default OrderSubmittedInfo;
