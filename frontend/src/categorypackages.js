import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from "./main-components/header/header";
import Footer from "./main-components/footer";
import { Link } from 'react-router-dom';

const CategoryPackages = () => {
  const { category } = useParams();
  const [packages, setPackages] = useState([]);
  console.log('Category:', category);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/category/${category}`)
      .then(response => {
        console.log('Packages data:', response.data); 
        setPackages(response.data);
      })
      .catch(error => {
        console.error('Error fetching category packages:', error);
      });
  }, [category]);

  return (
    <div>
        <Header />
        <section id="banner" className="package">
            <div className="css-zixqbe e7svxqc1"></div>
            <div className="container">
                <div className="row">
                    <div className="col-lg-12 col-md-12  col-12">
                        <div className="inner_banner">
                            <h1>{category}</h1>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="our-packages" className="package">
            <div className="container-fluid">
                <div className="row">
                    {packages.map((pkg, index) => ( 
                        <div className="col-lg-3 col-md-3 col-12" key={index}>
                            <div className="item">
                                <Link to={`/package/id/${pkg.id}`}>
                                    <div className="card">
                                        <span className="over_hover">
                                            <img src={`${process.env.REACT_APP_UPLOAD_API_URL}/${pkg.imageUrl}`} alt={pkg.packageName || 'Package Image'} className="card-img" /></span>
                                        <div className="card_content">
                                            <h2>{pkg.packageName || 'No Name'}</h2>
                                            <p>{pkg.packagePrice ? `₹${pkg.packagePrice}` : 'Not available'}</p>
                                            <div className="ft">
                                                <span>
                                                    <label>Duration</label>
                                                    <h3><iconify-icon icon="carbon:time"></iconify-icon> {pkg.packageDurationDate || 'Not available'}</h3>
                                                </span>
                                                <span>
                                                    <label>Start Date</label>
                                                    <h3><iconify-icon icon="uiw:date"></iconify-icon> {pkg.packageDate || 'Not available'}</h3>
                                                </span>
                                            </div>
                                            <div className="btn_yellow">View Package Details</div>
                                        </div>
                                    </div>
                                </Link>
                            </div> 
                        </div>
                    ))}
                </div>
            </div>  
        </section>
        <Footer/>
    </div>
  );
};

export default CategoryPackages;
