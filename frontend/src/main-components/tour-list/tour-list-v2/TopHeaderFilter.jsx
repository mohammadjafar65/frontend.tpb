import { useEffect, useState } from "react";
import axios from "axios";

const TopHeaderFilter = ({ selectedState }) => {
  const [packageCount, setPackageCount] = useState(0);
  const [stateLabel, setStateLabel] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // 1) Count
        let count = 0;
        if (selectedState) {
          // filtered by state (name or id)
          const url = `${process.env.REACT_APP_API_URL}/packages/by-state/${encodeURIComponent(
            selectedState
          )}`;
          const res = await axios.get(url);
          count = Array.isArray(res.data) ? res.data.length : 0;
        } else {
          // no state filter → get total count
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/packages`);
          count = Array.isArray(res.data) ? res.data.length : 0;
        }
        if (!cancelled) setPackageCount(count);

        // 2) Label
        if (!selectedState) {
          if (!cancelled) setStateLabel(""); // show "All Tours Packages" header, no suffix
        } else if (isNaN(selectedState)) {
          if (!cancelled) setStateLabel(selectedState); // already a name
        } else {
          // numeric id → fetch name
          const stateRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/states/id/${selectedState}`
          );
          if (!cancelled) setStateLabel(stateRes.data?.name || "");
        }
      } catch (e) {
        if (!cancelled) {
          setPackageCount(0);
          setStateLabel(selectedState && isNaN(selectedState) ? selectedState : "");
        }
        console.error("TopHeaderFilter load error:", e);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedState]);

  return (
    <div className="row y-gap-10 items-center justify-between">
      <div className="col-auto">
        <div className="text-18">
          <span className="fw-500">{packageCount} packages</span>
          {stateLabel ? ` in ${stateLabel}` : ""}
        </div>
      </div>
    </div>
  );
};

export default TopHeaderFilter;
