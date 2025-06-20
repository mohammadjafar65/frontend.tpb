import MainFilterSearchBox from "./MainFilterSearchBox";

const Index = () => {
  return (
    <section className="masthead -type-5">
      <div className="masthead__bg">
        <img alt="image" src="/img/masthead/5/bg.svg" className="js-lazy" />
      </div>
      {/* End bg image */}

      <div className="container">
        <div className="row">
          <div className="col-xl-9">
            <h1
              className="text-60 lg:text-40 md:text-30 text-left"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              Your Best Travel{" "}
              <span className="text-blue-1 relative">
                <br />
                Experience Awaits{" "}
                {/* <span className="-line">
                  <img src="/img/general/line.png" alt="image" />
                </span> */}
              </span>
            </h1>
            <p
              className="mt-20 text-left"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              Discover thrilling tours, exclusive travel packages.
              <br className="lg:d-none" /> Find your perfect getaway and create unforgettable memories.
            </p>

            <MainFilterSearchBox />
            {/* End filter content */}
          </div>
        </div>
      </div>
      {/* End .container */}

      <div className="masthead__image" data-aos="fade">
        <img src="/img/masthead/5/12.png" alt="image" />
      </div>
      {/* End .masthead__image */}
    </section>
  );
};

export default Index;
