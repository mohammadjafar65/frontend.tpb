import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CustomerInfo from "../CustomerInfo";
import PaymentInfo from "../PaymentInfo";
import OrderSubmittedInfo from "../OrderSubmittedInfo";
import API from "../../../api";

export default function Index() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedStep, setCompletedStep] = useState(-1);
  const [summary, setSummary] = useState(null);

  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [pkg, setPkg] = useState(null);
  const [booking, setBooking] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    state: "",
    zip: "",
    special_requests: "",
    start_date: null,
    end_date: null,
  });
  const [promo, setPromo] = useState(null);

  const [sp] = useSearchParams();
  const packageId = useMemo(() => sp.get("packageId") || "", [sp]);

  // ✅ Fetch logged-in user
  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/auth/me");
        const u = data?.user || null;
        setUser(u);

        if (u) {
          setBooking((b) => ({
            ...b,
            customer_name: u.name || b.customer_name,
            email: u.email || b.email,
            phone: u.phone || b.phone, // may be undefined if API doesn’t return phone
          }));
        }
      } catch {
        setUser(null);
      } finally {
        setUserLoaded(true);
      }
    })();
  }, []);

  // ✅ Fetch package details
  useEffect(() => {
    if (!packageId) return;
    (async () => {
      try {
        const { data } = await API.get(`/packages/id/${packageId}`);
        setPkg(data);
      } catch {
        setPkg(null);
      }
    })();
  }, [packageId]);

  const gotoStep = (idx) => {
    if (idx <= completedStep + 1) setCurrentStep(idx);
  };

  const nextStep = () => {
    setCompletedStep((c) => Math.max(c, currentStep));
    setCurrentStep((s) => Math.min(s + 1, 2));
  };

  const previousStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const StepHeader = ({ index, title }) => {
    const isActive = currentStep === index;
    const isClickable = index <= completedStep + 1;
    return (
      <div className="col-auto">
        <div
          className={`d-flex items-center transition ${
            isClickable ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          onClick={() => isClickable && gotoStep(index)}
          role="button"
        >
          <div
            className={
              isActive
                ? "active size-40 rounded-full flex-center bg-blue-1"
                : "size-40 rounded-full flex-center bg-blue-1-05 text-blue-1 fw-500"
            }
          >
            {isActive ? (
              <i className="icon-check text-16 text-white" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <div className="text-18 fw-500 ml-10">{title}</div>
        </div>
      </div>
    );
  };

  const steps = [
    {
      title: "Personal Details",
      content: (
        <CustomerInfo
          user={user}
          userLoaded={userLoaded}
          booking={booking}
          setBooking={setBooking}
          pkg={pkg}
          onNext={() => {
            if (!booking.customer_name?.trim()) {
              alert("Full Name is required.");
              return;
            }
            if (!booking.email?.trim()) {
              alert("Email is required.");
              return;
            }
            if (!booking.phone?.trim()) {
              alert("Phone number is required.");
              return;
            }
            nextStep();
          }}
        />
      ),
    },
    {
      title: "Payment Details",
      content: (
        <PaymentInfo
          packageId={packageId}
          pkg={pkg}
          booking={booking}
          promo={promo}
          setPromo={setPromo}
          onPaid={(s) => {
            setSummary(s);
            setCompletedStep(1);
            setCurrentStep(2);
          }}
        />
      ),
    },
    {
      title: "Final Step",
      content: <OrderSubmittedInfo summary={summary} />,
    },
  ];

  return (
    <>
      <div className="row x-gap-40 y-gap-30 items-center bg-white text-left">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <StepHeader index={i} title={s.title} />
            {i < steps.length - 1 && (
              <div className="col d-none d-sm-block">
                <div className="w-full h-1 bg-border" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="row">{steps[currentStep].content}</div>
    </>
  );
}
