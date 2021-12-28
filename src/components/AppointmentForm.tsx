import React, { useState, useEffect } from "react";
import {
  getAllUnavailableTimes,
  getAllAvailableTimes,
  getBarberWorkHours,
} from "../utils/appointment-functions";
import {
  getDateFromUnix,
  isWeekdayOrToday,
  getTimeFromMs,
} from "../utils/helpers";
import { Barbers, Services, Appointments } from "../utils/types";
import { schema } from "../utils/appointment-schema";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import moment from "moment";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function AppointmentForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [allBarbers, setAllBarbers] = useState<Barbers[]>([]);
  const [allServices, setAllServices] = useState<Services[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointments[]>([]);
  const [selectDate, setSelectDate] = useState<any>(new Date());
  const navigate = useNavigate();

  let selectService = watch("serviceId");
  let selectBarber = watch("barberId");

  const barberAppointments = allAppointments
    .filter(
      (date: any) =>
        moment(selectDate).format("DD.MM.YYYY") ===
        getDateFromUnix(date.startDate)
    )
    ?.filter((date: any) => date.barberId === Number(selectBarber));

  const workTimes = getBarberWorkHours(allBarbers, selectBarber, selectDate);

  let availableTimes = getAllAvailableTimes(
    workTimes,
    barberAppointments,
    allServices
  );

  const unavailableTimes = getAllUnavailableTimes(
    availableTimes,
    allServices,
    selectService
  );

  // remove all times that barber isn't available
  availableTimes = availableTimes.filter(
    (item) =>
      unavailableTimes.findIndex((secondItem) => secondItem === item) === -1
  );

  const currentPriceForServices =
    selectService &&
    allServices.filter((service) => service.id === Number(selectService))[0]
      .price;

  const onSubmit = (data: any = {}) => {
    const sendData = {
      startDate: Number(data.time / 1000),
      barberId: Number(data.barberId),
      serviceId: Number(data.serviceId),
    };

    axios
      .post("http://localhost:3000/appointments", sendData)
      .catch((error) => console.log(error));

    setTimeout(() => {
      navigate("/success");
    }, 500);
  };

  useEffect(() => {
    const requestOne = axios.get("http://localhost:3000/barbers");
    const requestTwo = axios.get("http://localhost:3000/services");
    const requestThree = axios.get("http://localhost:3000/appointments");
    axios.all([requestOne, requestTwo, requestThree]).then(
      axios.spread((...responses) => {
        setAllBarbers(responses[0].data);
        setAllServices(responses[1].data);
        setAllAppointments(responses[2].data);
      })
    );
  }, []);

  return (
    <div className="appointment">
      <h2 className="appointment__title">book your appointment</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="appointment__form">
        <div className="appointment__row">
          <div className="appointment__column">
            <input
              type="text"
              placeholder="First Name"
              {...register("firstName")}
            />
            <p className="appointment__error">
              {errors.firstName?.message || errors.lastName?.message}
            </p>
          </div>

          <div className="appointment__column">
            <input
              type="text"
              placeholder="Last Name"
              {...register("lastName")}
            />
          </div>
        </div>

        <div className="appointment__row">
          <div className="appointment__column">
            <input type="email" placeholder="Email" {...register("email")} />
            <p className="appointment__error">{errors.email?.message}</p>
          </div>

          <div className="appointment__column">
            <input
              type="tel"
              placeholder="Contact Number"
              {...register("phoneNumber")}
            />
            <p className="appointment__error">{errors.phoneNumber?.message}</p>
          </div>
        </div>

        <div className="appointment__row">
          <div className="appointment__column">
            <select {...register("barberId")}>
              <option value="" hidden>
                Select Barber
              </option>
              {allBarbers.map((barber) => {
                const { firstName, lastName, id } = barber;
                return (
                  <option
                    value={id}
                    key={id}
                  >{`${firstName} ${lastName}`}</option>
                );
              })}
            </select>
            <p className="appointment__error">{errors.barberId?.message}</p>
          </div>

          <div className="appointment__column">
            <select {...register("serviceId")}>
              <option value="" hidden>
                Select Service
              </option>
              {allServices.map((service) => {
                const { name, id } = service;
                return (
                  <option value={id} key={id}>
                    {name}
                  </option>
                );
              })}
            </select>

            <p className="appointment__error">{errors.serviceId?.message}</p>
          </div>
        </div>

        <div className="appointment__row">
          <div className="appointment__column">
            <div>
              <ReactDatePicker
                onChange={(date) => {
                  setSelectDate(date);
                }}
                selected={selectDate}
                filterDate={isWeekdayOrToday}
                minDate={new Date()}
              />
            </div>
            <p className="appointment__error">
              {selectDate ? "" : "Please pick a date"}
            </p>
          </div>

          <div className="appointment__column">
            <select {...register("time")}>
              <option value="" hidden>
                Select Time
              </option>
              {availableTimes.map((time: any, index: number) => {
                const convertTime = getTimeFromMs(time);

                return (
                  <option value={time} key={index}>
                    {convertTime}
                  </option>
                );
              })}
            </select>
            <p className="appointment__error">{errors.time?.message}</p>
          </div>
        </div>

        <div className="appointment__row">
          <input
            className="appointment__price"
            type="text"
            disabled
            placeholder="Service Price"
            value={selectService ? `Price is ${currentPriceForServices} €` : ""}
          />
        </div>

        <div className="appointment__row">
          <button type="submit" className="appointment__button showOnDesktop">
            book appointment
          </button>
          <button type="submit" className="appointment__button showOnMobile">
            book
          </button>
        </div>
      </form>
    </div>
  );
}

export default AppointmentForm;
