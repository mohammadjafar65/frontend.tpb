import React, { useEffect, useMemo, useRef, useState } from "react";
import FilterBox from "./filter-box";
import { useNavigate } from "react-router-dom";
import "../tour-single/filter-box/booking-card.css";

/* ------------ helpers (unchanged logic) ------------ */
function parseDurationDays(raw) {
  if (!raw) return 1;
  const s = String(raw).trim().toLowerCase();

  const mDays = s.match(/(\d+)\s*d(?:ay)?s?/) || s.match(/(\d+)\s*days?/);
  if (mDays) return Math.max(1, Number(mDays[1]));

  const mComboDN = s.match(/(?:(\d+))d(?:\D+)?(\d+)n/) || s.match(/(?:(\d+)\s*d)[^\d]*(\d+)\s*n/);
  if (mComboDN) return Math.max(1, Number(mComboDN[1]));
  const mComboND = s.match(/(?:(\d+))n(?:\D+)?(\d+)d/) || s.match(/(?:(\d+)\s*n)[^\d]*(\d+)\s*d/);
  if (mComboND) return Math.max(1, Number(mComboND[2]));

  const mNights = s.match(/(\d+)\s*n(?:ight)?s?/);
  if (mNights) return Math.max(1, Number(mNights[1]) + 1);

  const mPlain = s.match(/^\s*(\d+)\s*$/);
  if (mPlain) return Math.max(1, Number(mPlain[1]));

  return 1;
}

const addDays = (d, n) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() + n);
  return x;
};

// tiny animated number hook
function useAnimatedNumber(value, { duration = 350 } = {}) {
  const [display, setDisplay] = useState(Number(value) || 0);
  const rafRef = useRef();
  const startRef = useRef(0);
  const fromRef = useRef(0);
  const toRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    toRef.current = Number(value) || 0;
    startRef.current = 0;
    cancelAnimationFrame(rafRef.current);

    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplay(fromRef.current + (toRef.current - fromRef.current) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
}

export default function SidebarRight({ tour }) {
  const navigate = useNavigate();
  // dates
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });
  const [endDate, setEndDate] = useState(() => new Date());
  const durationDays = parseDurationDays(tour?.packageDuration || 1);

  useEffect(() => {
    const d = Math.max(1, durationDays);
    setEndDate(addDays(startDate, d - 1)); // inclusive end
  }, [startDate, durationDays]);

  // guests
  const [guestCount, setGuestCount] = useState(1);

  // pricing
  const perPerson = useMemo(() => Math.max(0, Number(tour?.basePrice || 0)), [tour]);
  const total = perPerson * guestCount;
  const animatedTotal = useAnimatedNumber(total);

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
      .format(Number(n || 0));

  const canBook = perPerson > 0;

  const handleBookNow = () => {
    if (!canBook) return;
    const toYMD = (d) => new Date(d).toISOString().slice(0, 10);
    navigate("/booking-page", {
      state: {
        tourId: tour?.packageId || tour?.id,
        startDate: toYMD(startDate),
        endDate: toYMD(endDate),
        guests: guestCount,
        pricePerPerson: perPerson,
        total
      }
    });
  };

  return (
    <div className="d-flex justify-end js-pin-content text-left position-sticky top-20">
      <div className="w-full lg:w-full d-flex flex-column items-center">
        <aside className="booking-card position-sticky top-20" aria-label="Booking panel">
          {/* Header price */}
          <header className="booking-card__header">
            <div className="booking-card__kicker">Starting from</div>
            <div className="booking-card__price">
              {formatINR(perPerson)}
              <span className="booking-card__per"> / person</span>
            </div>
          </header>

          {/* Inputs */}
          <section className="booking-card__section">
            <div className="booking-card__section-title">
              <i className="icon-calendar mr-10" /> Date
              {durationDays ? (
                <span className="chip chip--muted ml-10">{durationDays} days</span>
              ) : null}
            </div>

            <FilterBox
              basePrice={perPerson}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              durationDays={durationDays}
              guestCount={guestCount}
              setGuestCount={setGuestCount}
            />
          </section>

          {/* CTA */}
          <section className="booking-card__section">
            <button
              type="button"
              className="booking-card__cta"
              disabled={!canBook}
              aria-disabled={!canBook}
              onClick={handleBookNow}
            >
              {canBook ? "Book Now" : "Contact for Pricing"}
            </button>
            <div className="booking-card__hint">
              Free cancellation up to 24 hours before start.
            </div>
          </section>

          {/* Total */}
          <section className="booking-card__section">
            <div className="total-card" aria-live="polite">
              <div className="total-card__top">
                <div className="total-card__label">
                  Total for <strong>{guestCount}</strong> {guestCount > 1 ? "guests" : "guest"}
                  <span className="badge badge--soft text-black">No hidden fees</span>
                </div>

                <div className="total-card__amount" key={total}>
                  {formatINR(Math.round(animatedTotal))}
                </div>
              </div>

              <div className="total-card__meta">
                {perPerson ? `${formatINR(perPerson)} × ${guestCount}` : "Pricing to be confirmed"}
                {/* Optional savings pill if you pass a strike/original price */}
                {Number(tour?.strikePrice || 0) > total && (
                  <span className="save">
                    You save {formatINR(Number(tour.strikePrice) - total)}
                  </span>
                )}
              </div>
            </div>
          </section>
        </aside>

        {/* Trust */}
        {/* <footer className="booking-card__footer">
          <div className="trust">
            <span className="trust__icon">
              <i className="icon-check" />
            </span>
            <span className="trust__text">
              94% of travelers recommend this experience
            </span>
          </div>
        </footer> */}
      </div>
    </div>
  );
}
