import CallToActions from "../../../main-components/common/CallToActions";
import Header from "../../../main-components/header/header";
import DefaultFooter from "../../../main-components/footer";
import TopHeaderFilter from "../../../main-components/tour-list/tour-list-v2/TopHeaderFilter";
import TourProperties from "../../../main-components/tour-list/tour-list-v2/TourProperties";
import Pagination from "../../../main-components/tour-list/common/Pagination";
import Sidebar from "../../../main-components/tour-list/tour-list-v2/Sidebar";
import queryString from "query-string";
import { useEffect } from "react";

import MetaComponent from "../../../main-components/common/MetaComponent";
import { useLocation } from "react-router-dom";

const metadata = {
  title: "Tour List v2 || GoTrip - Travel & Tour ReactJs Template",
  description: "GoTrip - Travel & Tour ReactJs Template",
};

const TourListPage2 = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category");
  const selectedCountry = queryParams.get("country");

  // Inside the component
  useEffect(() => {
    // Use 'auto' to instantly jump without smooth animation
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <>
      <MetaComponent meta={metadata} />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header />
      {/* End Header 1 */}

      <section class="pt-40 pb-40 bg-light-2">
        <div class="container">
          <div class="row">
            <div class="col-12">
              <div class="text-center">
                <h1 className="text-30 fw-600">
                  {selectedCategory || selectedCountry || "All Tours Packages"}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-pt-md layout-pb-lg bg-white">
        <div className="container">
          <div className="row y-gap-30">
            <div className="col-xl-3">
              <aside className="sidebar y-gap-40 xl:d-none">
                <Sidebar />
              </aside>
              {/* End sidebar for desktop */}

              <div
                className="offcanvas offcanvas-start"
                tabIndex="-1"
                id="listingSidebar"
              >
                <div className="offcanvas-header">
                  <h5 className="offcanvas-title" id="offcanvasLabel">
                    Filter Tours
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  ></button>
                </div>
                {/* End offcanvas header */}

                <div className="offcanvas-body">
                  <aside className="sidebar y-gap-40  xl:d-block">
                    <Sidebar />
                  </aside>
                </div>
                {/* End offcanvas body */}
              </div>
              {/* End mobile menu sidebar */}
            </div>
            {/* End col */}

            <div className="col-xl-9 ">
              <TopHeaderFilter
                selectedCategory={selectedCategory}
                selectedCountry={selectedCountry}
              />
              <div className="mt-30"></div>
              {/* End mt--30 */}
              <div className="row y-gap-30 pl-5 pr-5">
                <TourProperties
                  selectedCategory={selectedCategory}
                  selectedCountry={selectedCountry}
                />
              </div>
              {/* End .row */}
              {/* <Pagination /> */}
            </div>
            {/* End .col for right content */}
          </div>
          {/* End .row */}
        </div>
        {/* End .container */}
      </section>
      {/* End layout for listing sidebar and content */}

      <CallToActions />
      {/* End Call To Actions Section */}

      <DefaultFooter />
    </>
  );
};

export default TourListPage2;
