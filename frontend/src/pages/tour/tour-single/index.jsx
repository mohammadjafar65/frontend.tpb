import "photoswipe/dist/photoswipe.css";
import toursData from "../../../main-components/data/tours";
import Header from "../../../main-components/header/header";
import TopBreadCrumb from "../../../main-components/tour-single/TopBreadCrumb";
import ReviewProgress2 from "../../../main-components/tour-single/guest-reviews/ReviewProgress2";
import DetailsReview2 from "../../../main-components/tour-single/guest-reviews/DetailsReview2";
import ReplyForm from "../../../main-components/tour-single/ReplyForm";
import ReplyFormReview2 from "../../../main-components/tour-single/ReplyFormReview2";
import CallToActions from "../../../main-components/common/CallToActions";
import DefaultFooter from "../../../main-components/footer";
import Tours from "../../../main-components/tours/Tours2";
import Faq from "../../../main-components/faq/Faq";
import { Link, useParams } from "react-router-dom";
import Itinerary from "../../../main-components/tour-single/itinerary";
import ImportantInfo from "../../../main-components/tour-single/ImportantInfo";
import TourGallery from "../../../main-components/tour-single/TourGallery";
import { useEffect, useState } from "react";
import axios from "axios";

import MetaComponent from "../../../main-components/common/MetaComponent";

const metadata = {
  title: "Tour Single || GoTrip - Travel & Tour ReactJs Template",
  description: "GoTrip - Travel & Tour ReactJs Template",
};

const TourSingleV1Dynamic = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/packages/id/${id}`)
      .then((res) => setTour(res.data))
      .catch((err) => console.error("Error loading tour:", err));
  }, [id]);

  if (!tour) return <div>Loading...</div>;

  return (
    <>
      <MetaComponent meta={metadata} />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header />
      {/* End Header 1 */}

      <TopBreadCrumb tour={tour} />
      {/* End top breadcrumb */}

      <section className="pt-40 bg-white">
        <div className="container">
          <div className="row y-gap-20 justify-between items-end">
            <div className="col-auto">
              <h1 className="text-30 fw-600">{tour.packageName}</h1>
              <div className="row x-gap-20 y-gap-20 items-center pt-10">
                {/* <div className="col-auto">
                  <div className="d-flex items-center">
                    <div className="d-flex x-gap-5 items-center">
                      <i className="icon-star text-10 text-yellow-1"></i>

                      <i className="icon-star text-10 text-yellow-1"></i>

                      <i className="icon-star text-10 text-yellow-1"></i>

                      <i className="icon-star text-10 text-yellow-1"></i>

                      <i className="icon-star text-10 text-yellow-1"></i>
                    </div>

                    <div className="text-14 text-light-1 ml-10">
                      {tour?.numberOfReviews} reviews
                    </div>
                  </div>
                </div> */}

                <div className="col-auto">
                  <div className="row x-gap-10 items-center">
                    <div className="col-auto">
                      <div className="d-flex x-gap-5 items-center">
                        <i className="icon-placeholder text-16 text-light-1"></i>
                        <div className="text-15 text-light-1">
                          {tour.packageLocation}
                        </div>
                      </div>
                    </div>

                    {/* <div className="col-auto">
                      <button
                        data-x-click="mapFilter"
                        className="text-blue-1 text-15 underline"
                      >
                        Show on map
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
            {/* End .col */}

            {/* <div className="col-auto">
              <div className="row x-gap-10 y-gap-10">
                <div className="col-auto">
                  <button className="button px-15 py-10 -blue-1">
                    <i className="icon-share mr-10"></i>
                    Share
                  </button>
                </div>

                <div className="col-auto">
                  <button className="button px-15 py-10 -blue-1 bg-light-2">
                    <i className="icon-heart mr-10"></i>
                    Save
                  </button>
                </div>
              </div>
            </div> */}
            {/* End .col */}
          </div>
          {/* End .row */}
        </div>
        {/* End .container */}
      </section>
      {/* End gallery grid wrapper */}

      <TourGallery tour={tour} />

      {/* End single page content */}

      <section className="pt-40 pb-40 bg-white">
        <div className="container">
          <div className="pt-40 border-top-light">
            <div className="row x-gap-40 y-gap-40">
              <div className="col-auto">
                <h3 className="text-22 fw-500">Important information</h3>
              </div>
            </div>
            {/* End row */}
            <ImportantInfo tour={tour} />
          </div>
          {/* End pt-40 */}
        </div>
        {/* End .container */}
      </section>
      {/* End important info */}

      {/* <section className="border-top-light pt-40 pb-40 bg-white">
        <div className="container">
          <h3 className="text-22 fw-500 mb-20">Itinerary</h3>
          <Itinerary />
        </div>
      </section> */}
      {/* End Itinerary */}

      <section className="bg-white pb-40 text-left">
        <div className="container ">
          <div className="pt-40 border-top-light">
            <div className="row y-gap-20">
              <div className="col-lg-4">
                <h2 className="text-22 fw-500">
                  FAQs about
                  <br /> The Crown Hotel
                </h2>
              </div>
              {/* End .row */}

              <div className="col-lg-8">
                <div
                  className="accordion -simple row y-gap-20 js-accordion"
                  id="Faq1"
                >
                  <Faq />
                </div>
              </div>
              {/* End .col */}
            </div>
            {/* End .row */}
          </div>
          {/* End .pt-40 */}
        </div>
        {/* End .container */}
      </section>
      {/* End Faq about sections */}

      {/* <section className="bg-white border-top-light pt-40 pb-40">
        <div className="container">
          <div className="row y-gap-40 justify-between">
            <div className="col-xl-3">
              <h3 className="text-22 fw-500">Guest reviews</h3>
              <ReviewProgress2 />
            </div>

            <div className="col-xl-8">
              <DetailsReview2 />
            </div>
          </div>
        </div>
      </section> */}
      {/* End Review section */}

      {/* <section className="bg-white border-top-light pt-40 pb-50">
        <div className="container">
          <div className="row y-gap-30 justify-between">
            <div className="col-xl-3">
              <div className="row">
                <div className="col-auto">
                  <h3 className="text-22 fw-500">Leave a Reply</h3>
                  <p className="text-15 text-dark-1 mt-5">
                    Your email address will not be published.
                  </p>
                </div>
              </div>

              <ReplyFormReview2 />
            </div>

            <div className="col-xl-8">
              <ReplyForm />
            </div>
          </div>
        </div>
      </section> */}
      {/* End Reply Comment box section */}

      <section className="pt-50 pb-50 bg-white border-top-light text-left">
        <div className="container">
          <div className="row y-gap-20 justify-between items-end">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">Most Popular Tours</h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  Interdum et malesuada fames ac ante ipsum
                </p>
              </div>
            </div>
            {/* End .col */}

            <div className="col-auto">
              <Link
                to="#"
                className="button -md -blue-1 bg-blue-1-05 text-blue-1"
              >
                More <div className="icon-arrow-top-right ml-15" />
              </Link>
            </div>
            {/* End .col */}
          </div>
          {/* End .row */}

          <div className="row y-gap-30 pt-40 sm:pt-20 item_gap-x30">
            <Tours />
          </div>
          {/* End .row */}
        </div>
        {/* End .container */}
      </section>
      {/* End Tours Sections */}

      <CallToActions />
      {/* End Call To Actions Section */}

      <DefaultFooter />
    </>
  );
};

export default TourSingleV1Dynamic;
