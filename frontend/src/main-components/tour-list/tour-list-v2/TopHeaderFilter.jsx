import { useEffect, useState } from "react";
import axios from "axios";

const TopHeaderFilter = ({ selectedState, category }) => {
  const [packageCount, setPackageCount] = useState(0);
  const [label, setLabel] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        let url = "";

        if (selectedState && category) {
          url = `${process.env.REACT_APP_API_URL}/packages/by-state-category/${encodeURIComponent(
            selectedState
          )}/${encodeURIComponent(category)}`;
        } else if (selectedState) {
          url = `${process.env.REACT_APP_API_URL}/packages/by-state/${encodeURIComponent(
            selectedState,
          )}`;
        } else if (category) {
          url = `${process.env.REACT_APP_API_URL}/packages/by-category/${encodeURIComponent(
            category
          )}`;
        } else {
          url = `${process.env.REACT_APP_API_URL}/packages`;
        }

        const res = await axios.get(url);
        const count = Array.isArray(res.data) ? res.data.length : 0;
        if (!cancelled) setPackageCount(count);

        // set label
        let lbl = "";
        if (selectedState) lbl = selectedState; // can resolve to name via API
        if (category) lbl = category;
        if (!cancelled) setLabel(lbl);
      } catch (e) {
        if (!cancelled) {
          setPackageCount(0);
          setLabel("");
        }
        console.error("TopHeaderFilter load error:", e);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [selectedState, category]);

  return (
    <div className="row y-gap-10 items-center justify-between">
      <div className="col-auto">
        <div className="text-18">
          <span className="fw-500">{packageCount} packages</span>
          {label ? ` in ${label}` : ""}
        </div>
      </div>
    </div>
  );
};

export default TopHeaderFilter;
