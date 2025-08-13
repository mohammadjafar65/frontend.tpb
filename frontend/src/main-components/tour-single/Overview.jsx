const Overview = ({ tour }) => {
  // Safely parse stringified arrays
  const highlights = tour.highlights ? JSON.parse(tour.highlights) : [];
  const included = tour.included ? JSON.parse(tour.included) : [];
  const itinerary = tour.itinerary ? JSON.parse(tour.itinerary) : [];
  return (
    <>
      <div className="row x-gap-20 y-gap-40 text-left">
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

        {/* <div className="col-12">
          <h5 className="text-16 fw-500">Highlights</h5>
          <ul className="list-disc text-15 mt-10">
            {highlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div> */}

        <div className="mt-0 mb-0 text-left">
          <div className="row x-gap-40 y-gap-40 pt-0">
            <div className="col-12">
              <div className="border-top-light mt-0 mb-40"></div>
              <h3 className="text-22 fw-500">What&lsquo;s Included</h3>

              <div className="row x-gap-40 y-gap-40 pt-20">
                <div className="col-md-12">
                  <ul className="horizontal">
                    {included.map((item, index) => (
                      <li key={index}>
                        <div className="text-dark-1 text-15">
                          <i className="icon-check text-green-2 text-10 mr-10"></i> {item}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Itinerary Section */}
        {Array.isArray(itinerary) && itinerary.length > 0 && (
          <div className="mt-0 mb-0 text-left itinerary">
            <div className="row x-gap-0 y-gap-0 pt-0">
              <div className="col-12">
                <div className="border-top-light mt-0 mb-40"></div>
                <h3 className="text-22 fw-500 mb-20">Itinerary</h3>
                <div className="accordion" id="itineraryAccordion">
                  {itinerary.map((day, idx) => {
                    const accordionId = `accordion-item-${idx}`;
                    const headingId = `heading-${idx}`;
                    const collapseId = `collapse-${idx}`;
                    const isFirst = idx === 0;

                    return (
                      <div key={idx} className="accordion-item border border-light mb-10 overflow-hidden">
                        <h2 className="accordion-header" id={headingId}>
                          <button
                            className={`accordion-button text-dark fw-600 ${!isFirst ? 'collapsed' : ''}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${collapseId}`}
                            aria-expanded={isFirst ? "true" : "false"}
                            aria-controls={collapseId}
                          >
                            <span className="badge bg-blue-1 me-2">Day {idx + 1}</span>
                            {day.dayTitle || `Day ${idx + 1}`}
                          </button>
                        </h2>
                        <div
                          id={collapseId}
                          className={`accordion-collapse collapse ${isFirst ? 'show' : ''}`}
                          aria-labelledby={headingId}
                          data-bs-parent="#itineraryAccordion"
                        >
                          <div className="accordion-body bg-white text-dark">
                            <div className="text-15 mb-3" dangerouslySetInnerHTML={{ __html: day.dayDetails }} />
                            {Array.isArray(day.photos) && day.photos.length > 0 && (
                              <div className="row x-gap-10 y-gap-10">
                                {day.photos.map((photo, pidx) => (
                                  <div key={pidx} className="col-6 col-md-4 col-lg-3">
                                    <img
                                      src={photo}
                                      alt={`Day ${idx + 1} Photo ${pidx + 1}`}
                                      className="rounded-8 w-100"
                                      style={{
                                        height: 120,
                                        objectFit: "cover",
                                        border: "1px solid #eee",
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Overview;
