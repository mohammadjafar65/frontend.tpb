import { Link, useParams } from "react-router-dom";
import toursData from "../../main-components/data/tours";

const TopBreadCrumb = () => {
  let params = useParams();
  const id = params.id;
  const tour = toursData.find((item) => item.id == id) || toursData[0];
  return (
    <section className="py-10 d-flex items-center bg-light-2">
      <div className="container">
        <div className="row y-gap-10 items-center justify-between">
          <div className="col-auto">
            <div className="row x-gap-10 y-gap-5 items-center text-14 text-light-1">
              <div className="col-auto">Home</div>
              {/* End .col-auto */}
              <div className="col-auto">&gt;</div>
              {/* End .col-auto */}
              <div className="col-auto">{tour?.location}</div>
              {/* End .col-auto */}
              <div className="col-auto">&gt;</div>
              {/* End .col-auto */}
              <div className="col-auto">
                <div className="text-dark-1">{tour?.title}</div>
              </div>
              {/* End .col-auto */}
            </div>
            {/* End .row */}
          </div>
          {/* End .col-auto */}

          <div className="col-auto">
            {/* <a href="#" className="text-14 text-blue-1 underline">
              All Hotel in London
            </a> */}
          </div>
          {/* End col-auto */}
        </div>
        {/* End .row */}
      </div>
      {/* End .container */}
    </section>
  );
};

export default TopBreadCrumb;
