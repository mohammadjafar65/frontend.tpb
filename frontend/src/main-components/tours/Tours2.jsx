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
  try {
    const arr = JSON.parse(avatarImage);
    if (Array.isArray(arr) && arr.length > 0) return arr;
    return ["https://thepilgrimbeez.com/img/tpb-logo.png"];
  } catch {
    return avatarImage ? [avatarImage] : ["https://thepilgrimbeez.com/img/tpb-logo.png"];
  }
};

const formatINR = (n) => {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);
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

        const statesRes = await axios.get(`${process.env.REACT_APP_API_URL}/states`);
        setAllStates(statesRes.data);

        const countriesRes = await axios.get(`${process.env.REACT_APP_API_URL}/countries`);
        setAllCountries(countriesRes.data);
      } catch (err) {
        console.error("Error fetching category tours:", err);
      }
    };
    if (category) fetchCategoryTours();
  }, [category]);

  const getLocationString = (pkg) => {
    const state = allStates.find(
      (s) =>
        Array.isArray(JSON.parse(s.package_ids || "[]")) &&
        JSON.parse(s.package_ids).includes(pkg.packageId)
    );
    if (!state) return "-";
    const country = allCountries.find(
      (c) => Array.isArray(JSON.parse(c.states || "[]")) && JSON.parse(c.states).includes(state.name)
    );
    return country ? `${state.name}` : state.name;
  };

  if (!categoryPackages.length) return <p>No packages found for this category.</p>;

  return (
    <>
      <Swiper
        spaceBetween={30}
        modules={[Navigation, Pagination]}
        navigation={{ nextEl: ".js-populars-tour-next", prevEl: ".js-populars-tour-prev" }}
        pagination={{ el: ".js-tour-pag_active", clickable: true }}
        breakpoints={{
          500: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 22 },
          1024: { slidesPerView: 3 },
          1200: { slidesPerView: 4 },
        }}
      >
        {categoryPackages.map((item) => {
          const images = getImageArray(item.avatarImage);
          const to = `/tour-single/${item.packageId}`;

          return (
            <SwiperSlide key={item.packageId}>
              <article
                data-aos="fade"
                data-aos-delay={item?.delayAnimation}
                className={`tpb-card ${indexColor % 2 === 0 ? "tpb-card--alt" : ""}`}
              >
                {/* IMAGE */}
                <div className="tpb-card__image">
                  <Link to={to} className="tpb-card__mediaLink" aria-label={item.packageName}>
                    <Swiper
                      className="tpb-card__mediaSwiper"
                      modules={[Pagination, Navigation]}
                      pagination={{ clickable: true }}
                      navigation
                    >
                      {images.map((src, i) => (
                        <SwiperSlide key={i}>
                          <img src={src} alt={item.packageName} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </Link>

                  {item.tag && (
                    <div className="tpb-card__badge">
                      <span
                        className={[
                          "tpb-badge",
                          isTextMatched(item?.tag, "likely to sell out*") && "tpb-badge--dark",
                          isTextMatched(item?.tag, "best seller") && "tpb-badge--blue",
                          isTextMatched(item?.tag, "top rated") && "tpb-badge--yellow",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {item.tag}
                      </span>
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="tpb-card__content">
                  <div className="tpb-card__meta">
                    <i className="icon-placeholder" />
                    <span>{getLocationString(item)}</span>
                  </div>

                  {item.tourType && <div className="tpb-card__type">{item.tourType}</div>}

                  <h3 className="tpb-card__title">
                    <Link to={to}>{item.packageName}</Link>
                  </h3>

                  {item.packageDuration && (
                    <div className="tpb-card__duration">{item.packageDuration}</div>
                  )}

                  <div className="tpb-card__bottom">
                    <div className="tpb-card__price">
                      From <strong>₹{formatINR(item.basePrice)}/-</strong>
                    </div>

                    <Link to={to} className="tpb-card__cta">
                      Book Now
                    </Link>
                  </div>
                </div>
              </article>
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
        <div className="col-auto">
          <div className="pagination -dots text-border js-tour-pag_active" />
        </div>
        <div className="col-auto">
          <button className="d-flex items-center text-24 arrow-right-hover js-populars-tour-next cursor-pointer">
            <i className="icon icon-arrow-right" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Tours2;
