import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import moment from "moment";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const schema = yup.object().shape({
  firstName: yup.string().required("Please enter your full name"),
  lastName: yup.string().required("Please enter your full name"),
  email: yup.string().email().required("Please enter a valid email"),
  phoneNumber: yup
    .string()
    .matches(
      /0[3-7][0,1,8][.\- ]?[0-9]{3}[.\- ]?[0-9]{3}/,
      "Please enter valid slovenian phone number"
    )
    .max(9)
    .required("Please enter phone number"),
  barber: yup.string().required("Please select a barber"),
  service: yup.string().required("Please select a service"),
  date: yup.string(),
  // time: yup.string().required("Please pick a time"),
});

const AppointmentForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [allBarbers, setAllBarbers] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [selectDate, setSelectDate] = useState<any>(new Date());

  let selectService = watch("service");

  let currentPriceForServices =
    selectService &&
    allServices.filter((service) => service?.name === selectService)[0].price;

  const onSubmit = (data: {}) => {
    console.log(data);
  };

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const validateDate = (date: Date) => {
    if (!date) {
      return "Please pick a date";
    }

    return null;
  };

  console.log(errors);

  useEffect(() => {
    const requestOne = axios.get("http://localhost:3000/barbers");
    const requestTwo = axios.get("http://localhost:3000/services");
    axios.all([requestOne, requestTwo]).then(
      axios.spread((...responses) => {
        setAllBarbers(responses[0].data);
        setAllServices(responses[1].data);
      })
    );
  }, []);

  return (
    <div className="appointment">
      <h2 className="appointment__title">book your appointment</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="appointment__form">
        <input
          type="text"
          placeholder="First Name"
          {...register("firstName")}
        />
        <p>{errors.firstName?.message}</p>

        <input type="text" placeholder="Last Name" {...register("lastName")} />
        <p>{errors.lastName?.message}</p>

        <input type="email" placeholder="Email" {...register("email")} />
        <p>{errors.email?.message}</p>

        <input
          type="tel"
          placeholder="Contact Number"
          {...register("phoneNumber")}
        />
        <p>{errors.phoneNumber?.message}</p>

        <select placeholder="Select Barber" {...register("barber")}>
          <option value="" hidden>
            Select Barber
          </option>
          {allBarbers.map((barber) => {
            const { firstName, lastName, id } = barber;
            return (
              <option
                value={`${firstName} ${lastName}`}
                key={id}
              >{`${firstName} ${lastName}`}</option>
            );
          })}
        </select>
        <p>{errors.barber?.message}</p>

        <select placeholder="Select Service" {...register("service")}>
          <option value="" hidden>
            Select Service
          </option>
          {allServices.map((service) => {
            const { name, id } = service;
            return (
              <option value={name} key={id}>
                {name}
              </option>
            );
          })}
        </select>
        <p>{errors.service?.message}</p>

        <ReactDatePicker
          onChange={(date) => {
            setSelectDate(date);
          }}
          selected={selectDate}
          filterDate={isWeekday}
          minDate={new Date()}
        />
        <p>{validateDate(selectDate)}</p>

        <input
          type="text"
          disabled
          placeholder="Service Price"
          value={selectService ? `${currentPriceForServices} €` : ""}
        />

        <button type="submit">submit</button>
      </form>
    </div>
  );
};

export default AppointmentForm;
