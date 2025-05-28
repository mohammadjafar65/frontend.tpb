import { useEffect, useState } from "react";
import axios from "axios";
const TopHeaderFilter = ({ selectedCategory, selectedCountry }) => {
  const [packageCount, setPackageCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/packages`
        );
        const filtered = res.data.filter((pkg) => {
          let matchCategory = true;
          let matchCountry = true;

          if (selectedCategory) {
            try {
              const cats = JSON.parse(pkg.packageCategory || "[]");
              matchCategory = cats.includes(selectedCategory);
            } catch {
              matchCategory = false;
            }
          }

          if (selectedCountry) {
            matchCountry =
              pkg.country?.toLowerCase() === selectedCountry.toLowerCase();
          }

          return matchCategory && matchCountry;
        });

        setPackageCount(filtered.length);
      } catch (err) {
        console.error("Error fetching package count:", err);
      }
    };

    fetchCount();
  }, [selectedCategory, selectedCountry]);

  return (
    <>
      <div className="row y-gap-10 items-center justify-between">
        <div className="col-auto">
          <div className="text-18">
            <span className="fw-500">{packageCount} packages</span>
            {selectedCategory && ` in ${selectedCategory}`}
            {selectedCountry && ` from ${selectedCountry}`}
          </div>
        </div>
        {/* End .col */}

        {/* <div className="col-auto">
          <div className="row x-gap-20 y-gap-20">
            <div className="col-auto">
              <button className="button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1">
                <i className="icon-up-down text-14 mr-10" />
                Sort
              </button>
            </div> */}
        {/* End .col */}

        {/* <div className="col-auto d-none xl:d-block">
              <button
                data-bs-toggle="offcanvas"
                data-bs-target="#listingSidebar"
                className="button -blue-1 h-40 px-20 rounded-100 bg-blue-1-05 text-15 text-blue-1"
              >
                <i className="icon-up-down text-14 mr-10" />
                Filter
              </button>
            </div> */}
        {/* End .col */}
        {/* </div> */}
        {/* End .row */}
        {/* </div> */}
        {/* End .col */}
      </div>
      {/* End .row */}
    </>
  );
};

export default TopHeaderFilter;
