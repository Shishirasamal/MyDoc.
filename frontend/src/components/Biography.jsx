import React from "react";

const Biography = ({ imageUrl }) => {
  return (
    <>
      <div className="container biography">
        <div className="banner">
          <img src={imageUrl} alt="whoweare" />
        </div>
        <div className="banner">
          <h3 style={{ fontWeight: "bold", fontSize: "32px" }}>Biography</h3>
          <p style={{ fontWeight: "bold", fontSize: "20px" }}>Who We Are</p>
          <p>
            We are a team of developers committed to transforming healthcare
            management with technology. Our Hospital Management System (HMS)
            simplifies healthcare operations, improves patient care, and
            enhances staff efficiency through a unified platform that covers
            appointments, patient records, billing, and more.
          </p>
          <p style={{ fontWeight: "bold" }}>We are all in 2025!</p>
          <p style={{ fontWeight: "bold" }}>
            We are working on a MERN STACK PROJECT.
          </p>
          <p>
            Currently, we are building a MERN stack-based hospital management
            system focused on modernizing healthcare workflows. Our goal is to
            provide a seamless, secure, and user-friendly solution that
            addresses the dynamic needs of healthcare providers and their
            patients.
          </p>
          <p style={{ fontWeight: "bold" }}>Our Vision!</p>
          <p>
            We aim to reduce administrative burden, improve patient outcomes,
            and streamline operations—empowering healthcare providers to focus
            on delivering quality care.
          </p>
        </div>
      </div>
    </>
  );
};

export default Biography;
