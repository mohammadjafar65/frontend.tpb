import React, { useEffect, useRef, useState } from "react";

const Counter = ({ value, setValue }) => {
  const inc = () => setValue((v) => Math.max(1, (Number(v) || 1) + 1));
  const dec = () => setValue((v) => Math.max(1, (Number(v) || 1) - 1));

  return (
    <div className="counter" role="group" aria-label="Guest counter">
      <button type="button" className="counter__btn" onClick={dec} aria-label="Decrease guests">
        <i className="icon-minus" />
      </button>
      <div className="counter__val" aria-live="polite">{value}</div>
      <button type="button" className="counter__btn" onClick={inc} aria-label="Increase guests">
        <i className="icon-plus" />
      </button>
    </div>
  );
};

export default function GuestSearch({ guestCount = 1, setGuestCount }) {
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="guests" ref={popRef}>
      <button
        type="button"
        className="guests__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="guests__label">Guests</div>
        <div className="guests__summary">
          {guestCount} {guestCount > 1 ? "Guests" : "Guest"}
        </div>
      </button>

      {open && (
        <div className="dropdown-card">
          <div className="counter-box">
            <div className="row y-gap-10 justify-between items-center">
              <div className="col-auto">
                <div className="text-15 lh-12 fw-500">Guests</div>
              </div>
              <div className="col-auto">
                <Counter value={guestCount} setValue={setGuestCount} />
              </div>
            </div>
            {/* <button type="button" className="dropdown-card__apply" onClick={() => setOpen(false)}>
              Done
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
}
