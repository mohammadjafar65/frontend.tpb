import GuestSearch from "./GuestSearch";
import DateSearch from "./DateSearch";
import { Link } from "react-router-dom";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(n || 0));

const index = ({ basePrice = 0 }) => {
  return (
    <>
      <div className="text-14 text-light-1">
        Starting From <br />
        <span className="text-24 fw-600 text-dark-1">
          ₹ {formatINR(basePrice)}/-{" "}
          <span className="text-14 fw-500 text-light-1">per person</span>
        </span>
      </div>

      <div className="col-12 flush mt-20">
        <div className="searchMenu-date px-20 py-10 border-light rounded-4 -right js-form-dd js-calendar">
          <div>
            <h4 className="text-15 fw-500 ls-2 lh-16">Date</h4>
            <DateSearch />
          </div>
        </div>
      </div>

      <div className="col-12 flush mt-20 mb-20">
        <GuestSearch />
      </div>

      <div className="col-12 flush">
        <Link
          to="/booking-page"
          className="button -dark-1 py-15 px-35 h-60 col-12 rounded-4 bg-blue-1 text-white"
        >
          Book Now
        </Link>
      </div>
    </>
  );
};

export default index;
