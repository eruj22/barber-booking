import React from "react";
import image from "../assets/image.jpg";
import AppointmentForm from "../components/AppointmentForm";

function Contact() {
  return (
    <section className="contact">
      <h1 className="contact__title">book your barber</h1>
      <p className="contact__subtitle">
        Great hair doesn't happen by chance. It happens by appointment!
      </p>

      <img
        src={image}
        className="contact__image"
        alt="barber styling man's beard"
      />

      <AppointmentForm />
    </section>
  );
}

export default Contact;
