import DateSearch from "./DateSearch";
import GuestSearch from "./GuestSearch";

export default function FilterBox({
  basePrice = 0,
  startDate,
  endDate,
  setStartDate,
  durationDays,
  guestCount,
  setGuestCount,
}) {
  return (
    <div className="card-block">
      <div className="field">
        <DateSearch
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          durationDays={durationDays}
        />
      </div>

      <div className="divider" />

      <div className="field">
        <div className="booking-card__section-title">
          <i className="icon-user mr-10" /> Number of Guests
        </div>
        <GuestSearch guestCount={guestCount} setGuestCount={setGuestCount} />
      </div>
    </div>
  );
}
