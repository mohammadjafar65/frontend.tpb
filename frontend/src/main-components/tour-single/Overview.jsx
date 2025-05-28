const Overview = ({ tour }) => {
  // Safely parse stringified arrays
  const highlights = tour.highlights ? JSON.parse(tour.highlights) : [];
  const included = tour.included ? JSON.parse(tour.included) : [];
  return (
    <>
      <div className="row x-gap-40 y-gap-40 text-left">
        <div className="col-12">
          <h3 className="text-22 fw-500">Overview</h3>

          <div
            className="text-dark-1 text-15 mt-20"
            dangerouslySetInnerHTML={{ __html: tour.packageDescription }}
          />

          {/* <a
            href="#"
            className="d-block text-14 text-blue-1 fw-500 underline mt-10"
          >
            Show More
          </a> */}
        </div>

        <div className="col-12">
          <h5 className="text-16 fw-500">Highlights</h5>
          <ul className="list-disc text-15 mt-10">
            {highlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-40 border-top-light text-left">
          <div className="row x-gap-40 y-gap-40 pt-40">
            <div className="col-12">
              <h3 className="text-22 fw-500">What&lsquo;s Included</h3>

              <div className="row x-gap-40 y-gap-40 pt-20">
                <div className="col-md-12">
                  <ul>
                    {included.map((item, index) => (
                      <li key={index}>
                        <div className="text-dark-1 text-15">
                          <i className="icon-check text-10 mr-10"></i> {item}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
