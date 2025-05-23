import { Link } from "react-router-dom";
import footerDataContent from "../data/footerContent";

const FooterContent = () => {
  return (
    <>
      {footerDataContent.map((item) => (
        <div className="col-lg-4 col-sm-6 text-left" key={item.id}>
          <h5 className="text-16 fw-500 mb-30">{item.title}</h5>
          <div className="d-flex y-gap-10 flex-column">
            {item.menuList.map((menu, i) => (
              <Link to={menu.routerPath} key={i}>
                {menu.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default FooterContent;
