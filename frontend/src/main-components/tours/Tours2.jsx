import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import isTextMatched from "../../utils/isTextMatched";

const getImageArray = (avatarImage) => {
  // Try parse avatarImage as JSON array, or fallback
  try {
    const arr = JSON.parse(avatarImage);
    if (Array.isArray(arr) && arr.length > 0) return arr;
    return ["https://thepilgrimbeez.com/img/tpb-logo.png"];
  } catch {
    // single string, fallback
    return avatarImage
      ? [avatarImage]
      : ["https://thepilgrimbeez.com/img/tpb-logo.png"];
  }
};

const Tours2 = ({ category, indexColor }) => {
  const [categoryPackages, setCategoryPackages] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allCountries, setAllCountries] = useState([]);

  useEffect(() => {
    const fetchCategoryTours = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/packages/with-state`);
        const filtered = res.data.filter((pkg) => {
          try {
            const cats = JSON.parse(pkg.packageCategory || "[]");
            return cats.some(
              (c) => String(c).trim().toLowerCase() === String(category).trim().toLowerCase()
            );
          } catch {
            return false;
          }
        });
        setCategoryPackages(filtered.slice(0, 6));

        // 2. Fetch all states
        const statesRes = await axios.get(`${process.env.REACT_APP_API_URL}/states`);
        setAllStates(statesRes.data);

        // 3. Fetch all countries
        const countriesRes = await axios.get(`${process.env.REACT_APP_API_URL}/countries`);
        setAllCountries(countriesRes.data);

      } catch (err) {
        console.error("Error fetching category tours:", err);
      }
    };

    if (category) fetchCategoryTours();
  }, [category]);

  const getLocationString = (pkg) => {
    // Find state by packageId
    const state = allStates.find(state =>
      Array.isArray(JSON.parse(state.package_ids || "[]")) &&
      JSON.parse(state.package_ids).includes(pkg.packageId)
    );
    if (!state) return "-";
    // Find country by state name in its states array
    const country = allCountries.find(country =>
      Array.isArray(JSON.parse(country.states || "[]")) &&
      JSON.parse(country.states).includes(state.name)
    );
    return country
      ? `${state.name}`
      : state.name;
  };

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
        {categoryPackages.map((item) => {
          const avatarArr = getImageArray(item.avatarImage);
          return (
            <SwiperSlide key={item.packageId}>
              <div
                data-aos="fade"
                className={`p-3 rounded-8 h-full ${indexColor % 2 === 0 ? "bg-gray" : "bg-white"}`}
                data-aos-delay={item?.delayAnimation}
              >
                <Link
                  to={`/tour-single/${item.packageId}`}
                  className="tourCard -type-1 rounded-4"
                >
                  <div className="tourCard__image">
                    <div className="cardImage ratio ratio-1:1">
                      <div className="cardImage__content">
                        {/* Avatar Image Swiper */}
                        <div className="cardImage-slider rounded-4 overflow-hidden custom_inside-slider">
                          <Swiper
                            className="mySwiper"
                            modules={[Pagination, Navigation]}
                            pagination={{ clickable: true }}
                            navigation={true}
                          >
                            {avatarArr.map((img, i) => (
                              <SwiperSlide key={i}>
                                <img
                                  className="rounded-4 col-12 js-lazy h-full object-cover"
                                  src={img}
                                  alt="Avatar"
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      </div>
                    </div>

                    {/* <div className="cardImage__wishlist">
                      <button className="button -blue-1 bg-white size-30 rounded-full shadow-2 mt-2 mr-2">
                        <i className="icon-heart text-12" />
                      </button>
                    </div> */}

                    <div className="cardImage__leftBadge">
                      <div
                        className={`py-5 px-15 rounded-right-4 text-12 lh-16 fw-500 uppercase ${isTextMatched(item?.tag, "likely to sell out*")
                          ? "bg-dark-1 text-white"
                          : ""
                          } ${isTextMatched(item?.tag, "best seller")
                            ? "bg-blue-1 text-white"
                            : ""
                          }  ${isTextMatched(item?.tag, "top rated")
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
                      <i className="icon-placeholder text-16 text-light-1 mr-5"></i>
                      <span className="text-13 text-light-1 fw-500">
                        {getLocationString(item)}
                      </span>
                    </div>
                    <div className="d-flex items-center lh-14 mb-5">
                      <div className="text-14 text-light-1">{item.tourType || ""}</div>
                    </div>
                    <h4 className="tourCard__title text-dark-1 text-18 lh-15 fw-600 h-text">
                      <span>{item.packageName}</span>
                    </h4>
                    <div className="text-16 text-light-1 fw-500">
                      {item.packageDuration || ""}
                    </div>

                    <div className="row justify-between items-center pt-10">
                      <div className="col-auto">
                        <div className="text-14 text-light-1">
                          From
                          <span className="text-18 fw-600 text-dark-1">
                            {" "}
                            ₹{item.basePrice || 0}/-
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 text-center">
                      <Link
                        to={`/tour-single/${item.packageId}`}
                        className="button -md -blue-1 bg-blue-1 text-white"
                        style={{ minWidth: 120 }}
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          );
        })}
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