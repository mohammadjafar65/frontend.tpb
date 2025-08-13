import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import isTextMatched from "../../../utils/isTextMatched";

// Helper to get first avatar image (or placeholder)
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

const TourProperties = ({ selectedState, category }) => {
  const [packages, setPackages] = useState([]);
  const [categoryPackages, setCategoryPackages] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allCountries, setAllCountries] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        let url = "";
        // If both state and category, use /by-state-category
        if (selectedState && category) {
          url = `${process.env.REACT_APP_API_URL}/packages/by-state-category/${encodeURIComponent(selectedState)}/${encodeURIComponent(category)}`;
        }
        // If only state, use /by-state (smart backend handles name or ID)
        else if (selectedState) {
          url = `${process.env.REACT_APP_API_URL}/packages/by-state/${encodeURIComponent(selectedState)}`;
        }
        // If only category, use /by-category
        else if (category) {
          url = `${process.env.REACT_APP_API_URL}/packages/by-category/${encodeURIComponent(category)}`;
        } else {
          setPackages([]);
          return;
        }
        const res = await axios.get(url);
        setPackages(res.data || []);

        // 2. Fetch all states
        const statesRes = await axios.get(`${process.env.REACT_APP_API_URL}/states`);
        setAllStates(statesRes.data);

        // 3. Fetch all countries
        const countriesRes = await axios.get(`${process.env.REACT_APP_API_URL}/countries`);
        setAllCountries(countriesRes.data);
      } catch (e) {
        setPackages([]);
      }
    };
    fetchPackages();
  }, [selectedState, category]);

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

  if (!packages.length) return <p className="text-center">No packages found.</p>;

  return (
    <div className="row y-gap-30 mx-1">
      {packages.map((item) => (
        <div key={item.packageId} className="col-lg-3 col-md-6 bg-gray rounded-4">
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
                      {getImageArray(item.avatarImage).map((img, i) => (
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

              <div className="cardImage__wishlist">
                <button className="button -blue-1 bg-white size-30 rounded-full shadow-2 mt-2 mr-2">
                  <i className="icon-heart text-12" />
                </button>
              </div>

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
                <span className="text-13 text-light-1">
                  {getLocationString(item)}
                </span>
              </div>
              <div className="d-flex items-center lh-14 mb-5">
                <div className="text-14 text-light-1">{item.tourType || ""}</div>
              </div>
              <h4 className="tourCard__title text-dark-1 text-18 lh-15 fw-600 h-text">
                <span>{item.packageName}</span>
              </h4>

              <div className="row justify-between items-center pt-10">
                <div className="col-auto">
                  <div className="text-16 text-light-1">
                    {item.packageDuration || ""}
                  </div>
                </div>
                <div className="col-auto">
                  <div className="text-14 text-light-1">
                    From
                    <span className="text-16 fw-600 text-dark-1">
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
      ))}
    </div>
  );
};

export default TourProperties;
