import Header from "../../../main-components/header/header";
import DropdownSelelctBar from "../../../main-components/tour-list/common/DropdownSelelctBar";
import MapPropertyFinder from "../../../main-components/tour-list/common/MapPropertyFinder";
import Pagination from "../../../main-components/tour-list/common/Pagination";
import MainFilterSearchBox from "../../../main-components/tour-list/tour-list-v3/MainFilterSearchBox";
import TopHeaderFilter from "../../../main-components/tour-list/tour-list-v3/TopHeaderFilter";
import TourProperties from "../../../main-components/tour-list/tour-list-v3/TourProperties";

import MetaComponent from "../../../main-components/common/MetaComponent";

const metadata = {
  title: "Tour List v3 || GoTrip - Travel & Tour ReactJs Template",
  description: "GoTrip - Travel & Tour ReactJs Template",
};

const TourListPage3 = () => {
  return (
    <>
      <MetaComponent meta={metadata} />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header />
      {/* End Header 1 */}

      <section className="halfMap">
        <div className="halfMap__content">
          <MainFilterSearchBox />

          <div className="row x-gap-10 y-gap-10 pt-20">
            <DropdownSelelctBar />
          </div>
          {/* End .row */}

          <div className="row y-gap-10 justify-between items-center pt-20">
            <TopHeaderFilter />
          </div>
          {/* End .row */}

          <div className="row y-gap-20 pt-20">
            <TourProperties />
          </div>
          {/* End .row */}

          <Pagination />
          {/* End Pagination */}
        </div>
        {/* End .halfMap__content */}

        <div className="halfMap__map">
          <div className="map">
            <MapPropertyFinder />
          </div>
        </div>
        {/* End halfMap__map */}
      </section>
      {/* End halfMap content */}
    </>
  );
};

export default TourListPage3;
