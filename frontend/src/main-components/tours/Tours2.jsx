import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import toursData from "../data/tours";
import isTextMatched from "../../utils/isTextMatched";

const Tours2 = ({ category, indexColor }) => {
  const [categoryPackages, setCategoryPackages] = useState([]);

  useEffect(() => {
    const fetchCategoryTours = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/packages`
        );
        const filtered = res.data.filter((pkg) => {
          try {
            const cats = JSON.parse(pkg.packageCategory || "[]");
            return cats.includes(category);
          } catch {
            return false;
          }
        });
        setCategoryPackages(filtered.slice(0, 6));
      } catch (err) {
        console.error("Error fetching category tours:", err);
      }
    };

    if (category) fetchCategoryTours();
  }, [category]);

  if (!categoryPackages.length)
    return <p>No packages found for this category.</p>;

  return (
    <>
      <Swiper
        spaceBetween={30}
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".js-populars-tour-next",
          prevEl: ".js-populars-tour-prev",
        }}
        pagination={{
          el: ".js-tour-pag_active",
          clickable: true,
        }}
        breakpoints={{
          500: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 22,
          },
          1024: {
            slidesPerView: 3,
          },
          1200: {
            slidesPerView: 4,
          },
        }}
      >
        {categoryPackages.map((item) => (
          <SwiperSlide key={item.packageId}>
            <div
              key={item.packageId}
              data-aos="fade"
              className={`p-3 rounded-8 h-full ${
                indexColor % 2 === 0 ? "bg-gray" : "bg-white"
              }`}
              data-aos-delay={item?.delayAnimation}
            >
              <Link
                to={`/tour-single/${item.packageId}`}
                className="tourCard -type-1 rounded-4"
              >
                <div className="tourCard__image">
                  <div className="cardImage ratio ratio-1:1">
                    <div className="cardImage__content">
                      <div className="cardImage-slider rounded-4 overflow-hidden custom_inside-slider">
                        <Swiper
                          className="mySwiper"
                          modules={[Pagination, Navigation]}
                          navigation
                          pagination={{ clickable: true }}
                        >
                          <SwiperSlide>
                            <img
                              className="rounded-4 col-12 js-lazy h-full object-cover"
                              src={`${process.env.REACT_APP_UPLOAD_API_URL}${item.avatarImage}`}
                              alt="Tour"
                            />
                          </SwiperSlide>
                        </Swiper>
                      </div>
                    </div>
                  </div>

                  <div className="cardImage__wishlist">
                    <button className="button -blue-1 bg-white size-30 rounded-full shadow-2 mt-2 mr-2">
                      <i className="icon-heart text-12" />
                    </button>
                  </div>

                  <div className="cardImage__leftBadge">
                    <div
                      className={`py-5 px-15 rounded-right-4 text-12 lh-16 fw-500 uppercase ${
                        isTextMatched(item?.tag, "likely to sell out*")
                          ? "bg-dark-1 text-white"
                          : ""
                      } ${
                        isTextMatched(item?.tag, "best seller")
                          ? "bg-blue-1 text-white"
                          : ""
                      }  ${
                        isTextMatched(item?.tag, "top rated")
                          ? "bg-yellow-1 text-dark-1"
                          : ""
                      }`}
                    >
                      {item.tag}
                    </div>
                  </div>
                </div>
                {/* End .tourCard__image */}

                <div className="tourCard__content mt-10 text-left">
                  <div className="d-flex items-center lh-14 mb-5">
                    {/* <div className="text-14 text-light-1">
                      {item.packageDurationDate}
                    </div> */}
                    {/* <div className="size-3 bg-light-1 rounded-full ml-10 mr-10" /> */}
                    <div className="text-14 text-light-1">{item.tourType}</div>
                  </div>
                  <h4 className="tourCard__title text-dark-1 text-18 lh-16 fw-500 h-text">
                    <span>{item.packageName}</span>
                  </h4>
                  <p className="text-light-1 lh-14 text-14 mt-5">
                    {item.packageLocation}
                  </p>

                  <div className="row justify-between items-center pt-15">
                    <div className="col-auto">
                      <div className="text-14 text-light-1">
                        {item.packageDurationDate}
                      </div>
                      {/* <div className="d-flex items-center"> */}
                      {/* <div className="d-flex items-center x-gap-5">
                          <div className="icon-star text-yellow-1 text-10" />
                          <div className="icon-star text-yellow-1 text-10" />
                          <div className="icon-star text-yellow-1 text-10" />
                          <div className="icon-star text-yellow-1 text-10" />
                          <div className="icon-star text-yellow-1 text-10" />
                        </div> */}
                      {/* End ratings */}

                      {/* <div className="text-14 text-light-1 ml-10">
                          {item.numberOfReviews} reviews
                        </div> */}
                      {/* </div> */}
                    </div>
                    <div className="col-auto">
                      <div className="text-14 text-light-1">
                        From
                        <span className="text-16 fw-500 text-dark-1">
                          {" "}
                          ₹{item.packagePrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="d-flex x-gap-15 items-center justify-center pt-40 sm:pt-20">
        <div className="col-auto">
          <button className="d-flex items-center text-24 arrow-left-hover js-populars-tour-prev cursor-pointer">
            <i className="icon icon-arrow-left" />
          </button>
        </div>
        {/* End arrow prev */}

        <div className="col-auto">
          <div className="pagination -dots text-border js-tour-pag_active" />
        </div>
        {/* End arrow pagination */}

        <div className="col-auto">
          <button className="d-flex items-center text-24 arrow-right-hover js-populars-tour-next cursor-pointer">
            <i className="icon icon-arrow-right" />
          </button>
        </div>
        {/* End arrow next */}
      </div>
    </>
  );
};

export default Tours2;
