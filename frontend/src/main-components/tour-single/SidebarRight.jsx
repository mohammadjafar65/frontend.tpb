import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FilterBox from "./filter-box";
import { Link } from "react-router-dom";

const SidebarRight = ({ tour }) => {
  const [pricingOptions, setPricingOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [extraPerson, setExtraPerson] = useState(false);
  const [childWithoutBed, setChildWithoutBed] = useState(false);

  const [basePrice, setBasePrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Trip details
  const [startDate, setStartDate] = useState(new Date("2025-07-05"));
  const [endDate, setEndDate] = useState(new Date("2025-08-14"));
  const [guestCount, setGuestCount] = useState(2);
  const [editMode, setEditMode] = useState(false);

  const handleSave = () => setEditMode(false);
  const handleCancel = () => setEditMode(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(tour?.pricingOptions || "[]");
      setPricingOptions(parsed);
      if (parsed.length > 0) setSelectedOption(parsed[0]);
    } catch (err) {
      console.error("Invalid pricingOptions JSON:", err);
      setPricingOptions([]);
    }
  }, [tour]);

  useEffect(() => {
    if (selectedOption) {
      const base = parseFloat(selectedOption.basePrice || "0") * 2;

      setBasePrice(base);
      setTotalPrice(base);
    }
  }, [selectedOption, extraPerson, childWithoutBed]);

  return (
    <div className="d-flex justify-end js-pin-content text-left position-sticky top-20">
      <div className="w-full lg:w-full d-flex flex-column items-center">
        <div className="px-30 py-30 rounded-4 border-light bg-white shadow-4">

          <FilterBox
            startDate={startDate}
            endDate={endDate}
            guestCount={guestCount}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setGuestCount={setGuestCount}
            basePrice={Number(tour?.basePrice ?? 0)}
          />

          {/* Recommendation */}
          <div className="d-flex items-center pt-20">
            <div className="size-40 flex-center bg-light-2 rounded-full">
              <i className="icon-heart text-16 text-green-2" />
            </div>
            <div className="text-14 lh-16 ml-10">
              94% of travelers recommend this experience
            </div>
          </div>
        </div>

        <div className="px-30">
          <div className="text-14 text-light-1 mt-30">
            Not sure? You can cancel this reservation up to 24 hours in advance for a full refund.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarRight;
