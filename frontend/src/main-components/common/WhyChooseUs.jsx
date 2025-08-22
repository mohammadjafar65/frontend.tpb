const WhyChooseUs = () => {
  const expertContent = [
    {
      id: 1,
      icon: "/img/featureIcons/1/1.svg",
      title: "Best Price Guarantee",
      text: `Get the real local rate no middle layers. If you find a lower price for the same itinerary, we’ll match it. Simple.`,
    },
    {
      id: 2,
      icon: "/img/featureIcons/1/2.svg",
      title: "Easy & Quick Booking",
      text: `Plan in minutes: transparent itineraries, instant confirmations, secure payments. Everything just… works.`,
    },
    {
      id: 3,
      icon: "/img/featureIcons/1/3.svg",
      title: "Customer Care 24/7",
      text: `Travel changes. We respond. Real humans on chat, call, or WhatsApp before, during, and after your trip.`,
    },
  ];

  return (
    <>
      <div className="section-bg__item -right -image col-5 md:mb-60 sm:mb-40">
        <img src="/img/slider_1.jpeg" alt="image" />
      </div>
      {/* End right video popup icon with image */}

      <div className="container">
        <div className="row">
          <div className="col-xl-5 col-md-7 text-left">
            <h2 className="text-30 fw-600">Why book with expert</h2>
            <p className="mt-5">
              Handled by people who live there.
            </p>
            <div className="row y-gap-30 pt-60 md:pt-40">
              {expertContent.map((item) => (
                <div className="col-12" key={item.id}>
                  <div className="d-flex pr-30">
                    <img className="size-50" src={item.icon} alt="image" />
                    <div className="ml-15 text-left">
                      <h4 className="text-18 fw-500">{item.title}</h4>
                      <p className="text-15 mt-10">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* End left local expert content */}
    </>
  );
};

export default WhyChooseUs;
