import Header from "../main-components/header/header";
import Footer from "../main-components/footer";
import Hero from "../main-components/hero";
import Tours2 from "../main-components/tours/Tours2";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import React, { useEffect, useState } from "react";
import ImageSlider from "../components/ImageSlider";
import { Link } from "react-router-dom";
import axios from "axios";
import Locations from "../main-components/tours/Locations";
import PopularDestinations from "../main-components/destinations/PopularDestinations";
import TestimonialLeftCol from "../main-components/TestimonialLeftCol";
import Counter3 from "../main-components/counter/Counter3";
import WhyChooseUs from "../main-components/common/WhyChooseUs";
import Testimonial from "../main-components/common/Testimonial";
import Brand2 from "../main-components/common/Brand2";
import CallToActions from "../main-components/common/CallToActions";
import AuthModal from "../main-components/header/AuthModal";

function HomePage() {
  const [packages, setPackages] = useState([]);
  const [packagesByCategory, setPackagesByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [categories, setCategories] = useState([]);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesRes, categoriesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/packages`),
          axios.get(`${process.env.REACT_APP_API_URL}/packages/categories`),
        ]);

        const packagesData = packagesRes.data;
        setPackages(packagesData);
        setCategories(categoriesRes.data);
        categorizePackages(packagesData, categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Date(dateString).toLocaleDateString(
      "en-IN",
      options
    );
    return formattedDate;
  };

  // Function to categorize packages
  const categorizePackages = (packagesArray, categoryList) => {
    const categorized = categoryList.reduce((acc, category) => {
      acc[category] = packagesArray.filter((pkg) =>
        JSON.parse(pkg.packageCategory || "[]").includes(category)
      );
      return acc;
    }, {});
    setPackagesByCategory(categorized);
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  return (
    <>
      <Header setShowAuth={setShowAuth} />
      <Hero />

      <div className="authModal">
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </div>

      {/* ✅ Top: Hard-coded 'Most Popular Tours' Section */}
      <section className="pt-50 pb-50 bg-gray">
        <div className="container">
          <div className="row y-gap-20 justify-between items-end">
            <div className="col-auto">
              <div className="sectionTitle -md text-left">
                <h2 className="sectionTitle__title">Most Popular Tours</h2>
                <p className="sectionTitle__text mt-5 sm:mt-0">
                  Discover world's most popular travel experiences.
                </p>
              </div>
            </div>
            <div className="col-auto">
              <Link
                to={`/tour-list-v2?category=${encodeURIComponent(
                  "Most Popular Tours"
                )}`}
                className="button -md -blue-1 bg-blue-1-05 text-blue-1"
              >
                More <div className="icon-arrow-top-right ml-15" />
              </Link>
            </div>
          </div>
          <div className="row y-gap-30 pt-20 sm:pt-20 item_gap-x30">
            <Tours2 category="Most Popular Tours" />
          </div>
        </div>
      </section>

      {/* ✅ Bottom: Other categories except 'Most Popular Tours' */}
      {/* {categories
        .filter((cat) => cat !== "Most Popular Tours")
        .map((category, index) => (
          <section
            className={`pt-50 pb-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
              }`}
            key={category}
          >
            <div className="container">
              <div className="row y-gap-20 justify-between items-end">
                <div className="col-auto">
                  <div className="sectionTitle -md text-left">
                    <h2 className="sectionTitle__title">{category}</h2>
                    <p className="sectionTitle__text mt-5 sm:mt-0">
                      Discover packages in {category}.
                    </p>
                  </div>
                </div>
                <div className="col-auto">
                  <Link
                    to={`/tour-list-v2?category=${encodeURIComponent(
                      category
                    )}`}
                    className="button -md -blue-1 bg-blue-1-05 text-blue-1"
                  >
                    More <div className="icon-arrow-top-right ml-15" />
                  </Link>
                </div>
              </div>
              <div className="row y-gap-30 pt-40 sm:pt-20 item_gap-x30">
                <Tours2 category={category} indexColor={index} />
              </div>
            </div>
          </section>
        ))} */}

      <section className="layout-pt-md layout-pb-md bg-white overflow-hidden" data-aos="fade-up">
        <div className="container">
          <div className="row y-gap-20 justify-between items-end">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title text-left">Trending Destinations</h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0 text-left">
                  Explore new places and create unforgettable memories.
                </p>
              </div>
            </div>
            {/* End col-auto */}

            <div className="col-auto md:d-none">
              <Link
                to="/destinations"
                className="button -md -blue-1 bg-blue-1-05 text-blue-1"
              >
                View All Destinations
                <div className="icon-arrow-top-right ml-15" />
              </Link>
            </div>
            {/* End col-auto */}
          </div>
          {/* End .row */}

          <div className="relative pt-40 sm:pt-20">
            <PopularDestinations />
          </div>
        </div>
        {/* End .container */}
      </section>
      {/* End Popular Destinations */}

      <section className="section-bg bg-gray layout-pt-lg md:pt-0 md:pb-60 sm:pb-40 layout-pb-lg bg-blue-1-05">
        <WhyChooseUs />
      </section>
      {/* End whycosse Section */}

      <section className="layout-pt-lg layout-pb-lg bg-white">
        <div className="container">
          <div className="row y-gap-40 justify-between">
            <div className="col-xl-5 col-lg-6" data-aos="fade-up">
              <TestimonialLeftCol />
            </div>
            {/* End col */}

            <div className="col-lg-6">
              <div
                className="overflow-hidden js-testimonials-slider-3"
                data-aos="fade-up"
                data-aos-delay="50"
              >
                <Testimonial />
              </div>
            </div>
          </div>
          {/* End .row */}
        </div>
        {/* End container */}
      </section>
      {/* End testimonial Section */}

      {/* <section className="layout-pt-lg layout-pb-lg bg-white">
        <div className="container">
          <div className="row justify-center text-center">
            <Counter3 />
          </div>
        </div>
      </section> */}
      {/* End counter up Section */}

      {/* <section id="banner">
                <ImageSlider images={images} />
                <div className="css-zixqbe e7svxqc1"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12  col-12">
                            <div className="inner_banner">
                                <h1>
                                    Affortability, Comfortability 
                                    now comes <br/>in budget with
                                    <span>The Pilgrim Beez</span>
                                </h1>
                                <a href="#our-packages">
                                    <button className="button button--surtur">
                                        <svg className="textcircle" viewBox="0 0 500 500">
                                            <title>Scroll Down &amp; OUR PACKAGES </title>
                                            <defs>
                                                <path id="textcircle" d="M250,400 a150,150 0 0,1 0,-300a150,150 0 0,1 0,300Z"></path>
                                            </defs>
                                            <text>
                                                <textPath xlinkHref="#textcircle" aria-label="Scroll Down &amp; OUR PACKAGES" textLength="900">
                                                    Scroll Down & OUR PACKAGES
                                                </textPath>
                                            </text>
                                        </svg>
                                        <svg aria-hidden="true" className="eye" width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
                                            <path className="eye__outer" d="M10.5 35.308c5.227-7.98 14.248-13.252 24.5-13.252s19.273 5.271 24.5 13.252c-5.227 7.98-14.248 13.253-24.5 13.253s-19.273-5.272-24.5-13.253z"></path>
                                            <path className="eye__lashes-up" d="M35 8.802v8.836M49.537 11.383l-3.31 8.192M20.522 11.684l3.31 8.192"></path>
                                            <path className="eye__lashes-down" d="M35 61.818v-8.836 8.836zM49.537 59.237l-3.31-8.193 3.31 8.193zM20.522 58.936l3.31-8.193-3.31 8.193z"></path>
                                            <circle className="eye__iris" cx="35" cy="35.31" r="5.221"></circle>
                                            <circle className="eye__inner" cx="35" cy="35.31" r="10.041"></circle>
                                        </svg>
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}
      {/* Packages by Category */}
      {/* {categories.map((category, index) => (
                <section id="our-packages" key={category} className={index % 2 === 0 ? "alternate-class" : "gray_bg"}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-12">
                                <div className="title_head">
                                    <h2>{category || "Default Category"}</h2>
                                    <Link to={`/package/${encodeURIComponent(category)}`} className="btn">
                                        View All &nbsp;<iconify-icon icon="cil:arrow-right"></iconify-icon>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-12">
                                <OwlCarousel
                                    className="owl-carousel owl-theme projects"
                                    margin={30}
                                    nav
                                    responsive={{
                                        0: {
                                            items: 1,
                                        },
                                        600: {
                                            items: 3,
                                        },
                                        1000: {
                                            items: 4,
                                        },
                                    }}
                                >
                                    {packagesByCategory[category] && packagesByCategory[category].length > 0 ? (
                                        packagesByCategory[category].map((pkg) => (
                                            <div className="item" key={pkg.id}>
                                                <Link to={`/package/id/${pkg.id}`}>
                                                    <div className="card"
                                                    style={{ 
                                                        backgroundImage: `url(${process.env.REACT_APP_API_URL}/uploads/${pkg.imageUrl})`,
                                                        backgroundSize: 'cover',
                                                        transition: 'transform 0.2s ease-in-out'
                                                    }}>
                                                        <div className="card_content">
                                                            <h2>{pkg.packageName || "No Name"}</h2>
                                                            <p>{pkg.packagePrice ? `₹${pkg.packagePrice}` : "Not available"}</p>
                                                            <div className="ft">
                                                                <span>
                                                                    <label>Duration</label>
                                                                    <h3>
                                                                        <iconify-icon icon="carbon:time"></iconify-icon> {pkg.packageDurationDate || "Not available"}
                                                                    </h3>
                                                                </span>
                                                                <span>
                                                                    <label>Start Date</label>
                                                                    <h3>
                                                                        <iconify-icon icon="uiw:date"></iconify-icon> {pkg.packageDate ? formatDate(pkg.packageDate) : "Not available"}
                                                                    </h3>
                                                                </span>
                                                            </div>
                                                            <div className="btn_yellow">View Package Details</div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No packages available.</p>
                                    )}
                                </OwlCarousel>
                            </div>
                        </div>
                    </div>
                </section>
            ))} */}
      {/* <section id="about_us">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <h2>About Us</h2>
                            <h5>
                                We are backed by a team of highly qualified,
                                <br />
                                sincere and passionate professionals, who strive <br />
                                to offer commandable range of packages specially <br />
                                for Umrah and Visa service.
                            </h5>
                        </div>
                    </div>
                </div>
            </section>
            <section id="services">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <h2>OUR SERVICES</h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-12">
                            <div className="services_card">
                                <img src="/img/icon.png" alt="" />
                                <h3>Counselling</h3>
                                <p>
                                    Before your took off from your origin, our experienced staff will guide you briefly about your destination. Get a free counselling season for any place you are visiting, from preparation of documents to
                                    the packing of your luggage
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                            <div className="services_card">
                                <img src="/img/icon.png" alt="" />
                                <h3>Umrah Training</h3>
                                <p>
                                    Your visit to the two holy city should be lessen in errors, and thats the reason we are conducting free umrah training season in a guidance of religious scholars, so you get through assistance before your
                                    visit to the holy cities
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}

      <CallToActions />
      {/* End Call To Actions Section */}

      <Footer />
    </>
  );
}

export default HomePage;
