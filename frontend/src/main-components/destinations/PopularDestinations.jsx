import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";

const PopularDestinations = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({}); // { stateId: packageCount }

  // Refs for custom navigation
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const scrollbarRef = useRef(null);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/states`);
        const statesData = res.data || [];
        setStates(statesData);

        // fetch counts for each state
        const countMap = {};
        await Promise.all(
          statesData.map(async (st) => {
            try {
              const pkgRes = await axios.get(
                `${process.env.REACT_APP_API_URL}/packages/by-state/${encodeURIComponent(st.id)}`
              );
              countMap[st.id] = Array.isArray(pkgRes.data) ? pkgRes.data.length : 0;
            } catch {
              countMap[st.id] = 0;
            }
          })
        );
        setCounts(countMap);
      } catch (error) {
        setStates([]);
        console.error("Failed to fetch states:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, []);

  if (loading) return <div className="text-center py-40">Loading destinations…</div>;
  if (!states.length) return <div className="text-center py-40">No Destinations Available</div>;

  return (
    <div className="position-relative">
      <Swiper
        spaceBetween={30}
        modules={[Scrollbar, Navigation]}
        navigation={{
          nextEl: nextRef.current,
          prevEl: prevRef.current,
        }}
        scrollbar={{
          draggable: true,
          el: scrollbarRef.current,
        }}
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.params.scrollbar.el = scrollbarRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
          swiper.scrollbar.init();
          swiper.scrollbar.updateSize();
        }}
        breakpoints={{
          500: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 22 },
          1024: { slidesPerView: 3 },
          1200: { slidesPerView: 4 },
        }}
      >
        {states.map((item) => {
          const pkgCount = counts[item.id] ?? 0;
          return (
            <SwiperSlide key={item.id}>
              <Link
                to={`/tour-list-v2?state=${encodeURIComponent(item.name)}`}
                className="citiesCard -type-1 d-block rounded-4"
              >
                <div className="citiesCard__image ratio ratio-3:4">
                  <img
                    src={item.photo_url || "/img/no-image.jpg"}
                    alt={item.name}
                    className="js-lazy"
                    loading="lazy"
                  />
                </div>
                <div className="citiesCard__content d-flex flex-column justify-between text-center pt-30 pb-20 px-20">
                  <div className="citiesCard__bg" />
                  <div className="citiesCard__top">
                    <div className="text-14 text-white">
                      {pkgCount} Packages
                    </div>
                  </div>
                  <div className="citiesCard__bottom">
                    <h4 className="text-26 md:text-20 lh-13 text-white mb-20">
                      {item.name}
                    </h4>
                    <button className="button col-12 h-60 -blue-1 bg-white text-dark-1">
                      Discover
                    </button>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation buttons */}
      <div>
        <button
          ref={prevRef}
          className="section-slider-nav -prev flex-center button -blue-1 bg-white shadow-1 size-40 rounded-full sm:d-none js-destination-prev"
        >
          <i className="icon icon-chevron-left text-12" />
        </button>
        <button
          ref={nextRef}
          className="section-slider-nav -next flex-center button -blue-1 bg-white shadow-1 size-40 rounded-full sm:d-none js-destination-next"
        >
          <i className="icon icon-chevron-right text-12" />
        </button>
        <div
          ref={scrollbarRef}
          className="slider-scrollbar bg-light-2 mt-40 js-popular-destination-scrollbar"
        />
      </div>
    </div>
  );
};

export default PopularDestinations;
