import React, { useState } from "react";
import Header from "../main-components/header/header";
import Footer from "../main-components/footer";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Form submitted successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        alert("Failed to submit form. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again later.");
    }
  };
  return (
    <>
      <Header />
      <section id="banner" className="about">
        <div className="css-zixqbe e7svxqc1"></div>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12  col-12">
              <div className="inner_banner">
                <h1>Contact Us</h1>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="contact-form bg-white">
        <div className="container">
          <div className="row bg-form">
            <div className="col-lg-6 pr-5 col-md-6 col-12">
              <h2 className="mb-3">
                Get in touch
                <br />
                with us
              </h2>
              <p>
                Fill the form or <a href="#">Send us an email</a>
              </p>
              <hr />
              <div className="media">
                <img src="/img/calling.png" className="mr-4" alt="..." />
                <div className="media-body">
                  <h5 className="mt-0 mb-0">Phone</h5>
                  <p>
                    <a href="tel:9904441844">+91 9904441844</a>
                  </p>
                </div>
              </div>
              <div className="media">
                <img src="/img/mail.png" className="mr-4" alt="..." />
                <div className="media-body">
                  <h5 className="mt-0 mb-0">Email</h5>
                  <p>
                    <a href="mailto:hey@willburner.com">
                      info@thepilgrimbeez.com
                    </a>
                  </p>
                </div>
              </div>
              <div className="media">
                <img src="/img/placeholder.png" className="mr-4" alt="..." />
                <div className="media-body">
                  <h5 className="mt-0 mb-0">Dholka Office</h5>
                  <p className="text-white">
                    D98, Aman Complex, near Balas Lake, Kalikund, Dholka,
                    Gujarat 382225
                  </p>
                </div>
              </div>
              <div className="media">
                <img src="/img/placeholder.png" className="mr-4" alt="..." />
                <div className="media-body">
                  <h5 className="mt-0 mb-0">Mehsana Office</h5>
                  <p className="text-white">
                    218-220 2nd FLOOR, A3-A4 BLOCK JOYOSH HUB-TOWN DHARAM
                    (PRASHANT) CINEMA ROAD
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <form onSubmit={handleSubmit}>
                <h3>Send us a message</h3>
                <div className="form-row">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <input
                    className="form-control"
                    type="email"
                    placeholder="Email address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <textarea
                    className="form-control"
                    placeholder="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="form-row">
                  <button type="submit">Get in touch</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ContactPage;
