import React from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";

function toDateObject(v) {
  if (!v) return null;
  return v instanceof DateObject ? v : new DateObject(v);
}

export default function DateSearch({ startDate, endDate, onStartDateChange, durationDays }) {
  const startVal = toDateObject(startDate) || new DateObject();
  const endVal = toDateObject(endDate) || new DateObject();

  return (
    <div className="date-grid">
      <div className="date-col">
        <label className="label">Start Date</label>
        <DatePicker
          inputClass="custom_input-picker"
          containerClassName="custom_container-picker"
          value={startVal}
          onChange={(d) => onStartDateChange(d?.toDate?.() || d)}
          numberOfMonths={1}
          offsetY={10}
          format="MMMM DD"
          minDate={new DateObject().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })}
          arrow={false}
          editable={false}
        />
      </div>

      <div className="date-col">
        <label className="label">
          End Date{" "}
          {durationDays ? <span className="chip chip--muted">({durationDays} days)</span> : null}
        </label>
        <DatePicker
          inputClass="custom_input-picker is-readonly"
          containerClassName="custom_container-picker"
          value={endVal}
          readOnly
          disabled
          numberOfMonths={1}
          offsetY={10}
          format="MMMM DD"
        />
        {/* <div className="help">End date is auto-calculated from duration.</div> */}
      </div>
    </div>
  );
}
