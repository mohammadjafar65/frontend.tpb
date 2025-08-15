import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import isTextMatched from "../../../utils/isTextMatched";

// Helpers
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

const TourProperties = ({ selectedState, category }) => {
  const [packages, setPackages] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allCountries, setAllCountries] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        let url = "";
        if (selectedState && category) {
          url = `${process.env.REACT_APP_API_URL}/packages/by-state-category/${encodeURIComponent(
            selectedState
          )}/${encodeURIComponent(category)}`;
        } else if (selectedState) {
          url = `${process.env.REACT_APP_API_URL}/packages/by-state/${encodeURIComponent(
            selectedState
          )}`;
        } else if (category) {
          url = `${process.env.REACT_APP_API_URL}/packages/by-category/${encodeURIComponent(
            category
          )}`;
        } else {
          setPackages([]);
          return;
        }

        const res = await axios.get(url);
        setPackages(res.data || []);

        const statesRes = await axios.get(`${process.env.REACT_APP_API_URL}/states`);
        setAllStates(statesRes.data);

        const countriesRes = await axios.get(`${process.env.REACT_APP_API_URL}/countries`);
        setAllCountries(countriesRes.data);
      } catch (e) {
        console.error("Fetch packages failed:", e);
        setPackages([]);
      }
    };
    fetchPackages();
  }, [selectedState, category]);

  const getLocationString = (pkg) => {
    const state = allStates.find(
      (s) =>
        Array.isArray(JSON.parse(s.package_ids || "[]")) &&
        JSON.parse(s.package_ids).includes(pkg.packageId)
    );
    if (!state) return "-";
    const country = allCountries.find(
      (c) =>
        Array.isArray(JSON.parse(c.states || "[]")) &&
        JSON.parse(c.states).includes(state.name)
    );
    return country ? `${state.name}` : state.name;
  };

  if (!packages.length) return <p className="text-center">No packages found.</p>;

  return (
    <div className="row y-gap-30">
      {packages.map((item, idx) => {
        const images = getImageArray(item.avatarImage);
        const to = `/tour-single/${item.packageId}`;

        return (
          <div key={item.packageId} className="col-xl-3 col-lg-4 col-md-6">
            <article
              data-aos="fade"
              className={`tpb-card ${idx % 2 === 0 ? "tpb-card--alt" : ""}`}
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
          </div>
        );
      })}
    </div>
  );
};

export default TourProperties;
