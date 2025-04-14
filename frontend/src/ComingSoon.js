import React from "react";
import "./ComingSoon.css";

const ComingSoon = () => {
  return (
    <div className="container">
      <h1>Coming soon.</h1>
      <p className="description">
        We are working hard on it!!!
      </p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: "25%" }}>
          25%
        </div>
      </div>

      {/* <div className="socials">
        <button className="social-btn fb">👍 Like</button>
        <button className="social-btn tw">🐦 Tweet</button>
        <button className="social-btn gp">🔗 +1</button>
      </div> */}
    </div>
  );
};

export default ComingSoon;