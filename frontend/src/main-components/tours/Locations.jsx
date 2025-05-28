import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Locations = () => {
  const [country, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/country`
        );
        setLocations(res.data);
      } catch (error) {
        console.error("Failed to fetch country:", error);
      }
    };

    fetchLocations();
  }, []);

  if (!country.length) {
    return <div>No Country Available</div>;
  }

  return (
    <>
      {country.map((item) => (
        <div
          className="col-xl-4 col-lg-4 col-md-6"
          key={item.country}
          data-aos="fade"
          data-aos-delay={item.delayAnim}
        >
          <Link
            to={`/tour-list-v2?country=${encodeURIComponent(item.country)}`}
            className="destCard -type-1 d-block"
          >
            <div className="row x-gap-20 y-gap-20 items-center text-left">
              <div className="col-auto">
                <div className="destCard__image rounded-4">
                  <img
                    className="size-100 rounded-4"
                    src={`${process.env.REACT_APP_API_URL}/uploads/${item.img}`}
                    alt={item.country}
                  />
                </div>
              </div>
              <div className="col-auto">
                <div className="text-18 fw-500 text-left">{item.country}</div>
                <div className="text-14 lh-14 text-light-1">
                  {item.packages} Packages
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
};

export default Locations;
