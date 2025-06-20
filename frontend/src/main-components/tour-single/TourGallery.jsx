import React, { useState } from "react";
import SidebarRight from "./SidebarRight";
import Overview from "./Overview";
import TourSnapShot from "./TourSnapShot";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ModalVideo from "react-modal-video";

export default function TourGallery({ tour }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <ModalVideo
        channel="youtube"
        autoplay
        isOpen={isOpen}
        videoId="oqNZOOWF8qM"
        onClose={() => setOpen(false)}
      />

      <section className="pt-40 js-pin-container bg-white">
        <div className="container">
          <div className="row y-gap-30">
            <div className="col-xl-8">
              <div className="relative d-flex justify-center overflow-hidden js-section-slider">
                <Swiper
                  modules={[Navigation]}
                  loop={
                    (tour.gallery ? JSON.parse(tour.gallery).length : 0) > 1
                  }
                  navigation={{
                    nextEl: ".js-img-next",
                    prevEl: ".js-img-prev",
                  }}
                >
                  {(tour.gallery ? JSON.parse(tour.gallery) : []).map(
                    (slide, i) => (
                      <SwiperSlide key={i}>
                        <img
                          src={`${process.env.REACT_APP_UPLOAD_API_URL}${slide}`}
                          alt="image"
                          style={{ height: "501px" }}
                          className="rounded-4 col-12 cover object-cover"
                        />
                      </SwiperSlide>
                    )
                  )}
                </Swiper>

                <Gallery>
                  {(tour.gallery ? JSON.parse(tour.gallery) : []).map(
                    (slide, i) => (
                      <div
                        className="absolute px-10 py-10 col-12 h-full d-flex justify-end items-end z-2 bottom-0 end-0"
                        key={i}
                      >
                        <Item
                          original={`${process.env.REACT_APP_UPLOAD_API_URL}${slide}`}
                          thumbnail={`${process.env.REACT_APP_UPLOAD_API_URL}${slide}`}
                          width={451}
                          height={450}
                        >
                          {({ ref, open }) => (
                            <div
                              className="button -blue-1 px-24 py-15 bg-white text-dark-1 js-gallery"
                              ref={ref}
                              onClick={open}
                              role="button"
                            >
                              See All Photos
                            </div>
                          )}
                        </Item>
                      </div>
                    )
                  )}
                </Gallery>

                <div className="absolute h-full col-11">
                  <button className="section-slider-nav -prev flex-center button -blue-1 bg-white shadow-1 size-40 rounded-full sm:d-none js-img-prev">
                    <i className="icon icon-chevron-left text-12" />
                  </button>
                  <button className="section-slider-nav -next flex-center button -blue-1 bg-white shadow-1 size-40 rounded-full sm:d-none js-img-next">
                    <i className="icon icon-chevron-right text-12" />
                  </button>
                </div>
                {/* End prev nav button wrapper */}
              </div>
              {/* End relative */}

              {/* slider gallery */}

              <h3 className="text-22 fw-500 mt-40 text-left">Tour snapshot</h3>
              <TourSnapShot tour={tour} />
              {/* End toursnapshot */}
              <div className="border-top-light mt-40 mb-40"></div>

              <Overview tour={tour} />
              {/* End  Overview */}
            </div>
            {/* End .col-xl-8 */}

            <div className="col-xl-4 relative">
              <SidebarRight tour={tour} />
            </div>
            {/* End .col-xl-4 */}
          </div>
          {/* End .row */}
        </div>
        {/* End container */}
      </section>
    </>
  );
}
