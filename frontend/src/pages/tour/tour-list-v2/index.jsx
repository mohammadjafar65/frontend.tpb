import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import CallToActions from "../../../main-components/common/CallToActions";
import Header from "../../../main-components/header/header";
import DefaultFooter from "../../../main-components/footer";
import TopHeaderFilter from "../../../main-components/tour-list/tour-list-v2/TopHeaderFilter";
import TourProperties from "../../../main-components/tour-list/tour-list-v2/TourProperties";
// import Pagination from "../../../main-components/tour-list/common/Pagination";
import Sidebar from "../../../main-components/tour-list/tour-list-v2/Sidebar";
import MetaComponent from "../../../main-components/common/MetaComponent";
import PageLoader from "../../../main-components/PageLoader";

const metadata = {
  title: "The Pilgrim Beez",
  description: "The Pilgrim Beez",
};

const TourListPage2 = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const queryState = queryParams.get("state");
  const queryCategory = queryParams.get("category");

  // For label display
  const [stateName, setStateName] = useState(queryState || "");
  const [selectedState, setSelectedState] = useState(""); // Only numeric
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      try {
        if (!queryState) {
          setStateName("");
          setSelectedState("");
          return;
        }

        if (isNaN(queryState)) {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/states/name/${encodeURIComponent(queryState)}`
          );
          setStateName(res.data.name || queryState);
          setSelectedState(res.data.id ? String(res.data.id) : "");
        } else {
          setStateName("");
          setSelectedState(queryState);
        }
      } catch (err) {
        setStateName(queryState);
        setSelectedState("");
      } finally {
        setLoading(false); 
      }
    };

    fetchState();
  }, [queryState]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  if (loading) return <PageLoader />;

  return (
    <>
      <MetaComponent meta={metadata} />

      <div className="header-margin"></div>
      <Header />

      <section className="pt-40 pb-40 bg-light-2">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h1 className="text-30 fw-600">
                  {stateName || queryCategory || "All Tours Packages"}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-pt-md layout-pb-lg bg-white">
        <div className="container">
          <div className="row y-gap-30">
            {/* <div className="col-xl-3">
              <aside className="sidebar y-gap-40 xl:d-none">
                <Sidebar />
              </aside>
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
                <div className="offcanvas-body">
                  <aside className="sidebar y-gap-40 xl:d-block">
                    <Sidebar />
                  </aside>
                </div>
              </div>
            </div> */}
            <div className="col-xl-12">
              <TopHeaderFilter selectedState={selectedState} category={queryCategory || ""} />
              <div className="mt-30" />
              {/* Cards */}
              <TourProperties selectedState={selectedState} category={queryCategory || ""} />
              {/* <Pagination /> */}
            </div>
          </div>
        </div>
      </section>

      <CallToActions />
      {/* <DefaultFooter /> */}
    </>
  );
};

export default TourListPage2;