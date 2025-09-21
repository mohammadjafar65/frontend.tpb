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

      <section className="padding_top layout-pb-md bg-white">
        <div className="container">
          <StepperBooking />
        </div>
        {/* End container */}
      </section>
      {/* End stepper */}

      <CallToActions />
      {/* End Call To Actions Section */}
    </>
  );
};

export default BookingPage;
