import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Locations = () => {
  const [states, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/states`);
        setLocations(res.data);
      } catch (error) {
        console.error("Failed to fetch states:", error);
      }
    };

    fetchLocations();
  }, []);

  if (!states.length) {
    return <div>No Destinations Available</div>;
  }

  return (
    <>
      {states.map((item, index) => (
        <div
          className="col-xl-4 col-lg-4 col-md-6"
          key={item.id}
          data-aos="fade"
          data-aos-delay={(index + 1) * 100}
        >
          <Link
            to={`/tour-list-v2?states=${encodeURIComponent(item.name)}`}
            className="destCard -type-1 d-block"
          >
            <div className="row x-gap-20 y-gap-20 items-center text-left">
              <div className="col-auto">
                <div className="destCard__image rounded-4">
                  <img
                    className="size-100 rounded-4"
                    src={`${item.photo_url}`}
                    alt={item.name}
                  />
                </div>
              </div>
              <div className="col-auto">
                <div className="text-18 fw-500 text-left">{item.name}</div>
                <div className="text-14 lh-14 text-light-1">
                  {JSON.parse(item.package_ids || "[]").length} Packages
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