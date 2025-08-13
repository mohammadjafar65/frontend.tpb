import CallToActions from "../../main-components/common/CallToActions";
import Header from "../../main-components/header/header";
import DefaultFooter from "../../main-components/footer";
import StepperBooking from "../../main-components/booking-page/stepper-booking";

import MetaComponent from "../../main-components/common/MetaComponent";

const metadata = {
  title: "Hotel Booking Page || GoTrip - Travel & Tour ReactJs Template",
  description: "GoTrip - Travel & Tour ReactJs Template",
};

const BookingPage = () => {
  return (
    <>
      <MetaComponent meta={metadata} />
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <Header />
      {/* End Header 1 */}

      <section className="pt-40 layout-pb-md bg-white">
        <div className="container">
          <StepperBooking />
        </div>
        {/* End container */}
      </section>
      {/* End stepper */}

      <CallToActions />
      {/* End Call To Actions Section */}

      <DefaultFooter />
    </>
  );
};

export default BookingPage;
