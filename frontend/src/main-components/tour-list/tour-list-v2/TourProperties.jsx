import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import isTextMatched from "../../../utils/isTextMatched";

const TourProperties = ({ selectedCategory, selectedCountry }) => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
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

        setPackages(filtered);
      } catch (err) {
        console.error("Failed to fetch packages", err);
      }
    };

    fetchPackages();
  }, [selectedCategory, selectedCountry]);

  if (!packages.length)
    return <p className="text-center">No packages found.</p>;

  return (
    <>
      {packages.map((item) => (
        <div
          className="col-lg-4 col-sm-6 text-left"
          key={item?.packageId}
          data-aos="fade"
          data-aos-delay={item?.delayAnimation}
        >
          <Link
            to={`/tour-single/${item.packageId}`}
            className="tourCard -type-1 rounded-4 position-relative"
          >
            <div className="tourCard__image">
              <div className="cardImage ratio ratio-1:1">
                <div className="cardImage__content">
                  <div className="cardImage-slider rounded-4 overflow-hidden custom_inside-slider">
                    <Swiper
                      className="mySwiper"
                      modules={[Pagination, Navigation]}
                      pagination={{ clickable: true }}
                      navigation
                    >
                      <SwiperSlide>
                        <img
                          className="rounded-4 col-12 js-lazy"
                          src={`${process.env.REACT_APP_UPLOAD_API_URL}${item.avatarImage}`}
                          alt="tour"
                        />
                      </SwiperSlide>
                    </Swiper>
                  </div>
                </div>
              </div>

              <div className="cardImage__wishlist">
                <button className="button -blue-1 bg-white size-30 rounded-full shadow-2">
                  <i className="icon-heart text-12" />
                </button>
              </div>

              <div className="cardImage__leftBadge">
                <div
                  className={`py-5 px-15 rounded-right-4 text-12 lh-16 fw-500 uppercase ${
                    isTextMatched(item?.tag, "likely to sell out*")
                      ? "bg-dark-1 text-white"
                      : isTextMatched(item?.tag, "best seller")
                      ? "bg-blue-1 text-white"
                      : isTextMatched(item?.tag, "top rated")
                      ? "bg-yellow-1 text-dark-1"
                      : ""
                  }`}
                >
                  {item.tag}
                </div>
              </div>
            </div>

            <div className="tourCard__content mt-10 text-left">
              <div className="d-flex items-center lh-14 mb-5">
                {/* <div className="text-14 text-light-1">
                      {item.packageDurationDate}
                    </div> */}
                {/* <div className="size-3 bg-light-1 rounded-full ml-10 mr-10" /> */}
                <div className="text-14 text-light-1">{item.tourType}</div>
              </div>
              <h4 className="tourCard__title text-dark-1 text-18 lh-16 fw-500">
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
      ))}
    </>
  );
};

export default TourProperties;
