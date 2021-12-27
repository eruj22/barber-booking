import React, { useState, useEffect } from "react";
import { getDateFromUnix, isWeekday, getTimeFromMs } from "../utils/helpers";
import { useNavigate } from "react-router-dom";
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
  barberId: yup.string().required("Please select a barber"),
  serviceId: yup.string().required("Please select a service"),
  date: yup.string(),
  time: yup.string().required("Please pick a time"),
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
  const [allAppointments, setAllAppointments] = useState<any>([]);
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

  let barberWorkHours = allBarbers
    .filter((barber) => barber.id === Number(selectBarber))[0]
    ?.workHours.filter(
      (hours: any) => hours.day === moment(selectDate).day()
    )[0];

  const start = barberWorkHours?.startHour;
  const end = barberWorkHours?.endHour;
  const lunch = barberWorkHours?.lunchTime.startHour;
  const startDay = selectDate?.setHours(start ? start : 0, 0, 0);
  const endDay = selectDate?.setHours(end ? end : 0, 0, 0);
  const lunchTime = selectDate?.setHours(lunch ? lunch : 0, 0, 0);

  const TenMinutesInMs = 600000;

  let unavailableTimes: number[] = [];
  let availableTimes: number[] = [];

  // get array of available times in whole day
  let startOfTheDay = startDay;
  while (startOfTheDay < endDay) {
    availableTimes.push(startOfTheDay);
    startOfTheDay += TenMinutesInMs;
  }

  // remove lunch time
  availableTimes.splice(availableTimes.indexOf(lunchTime), 3);

  // remove time from time array for work hours
  barberAppointments.map((appointment: any) => {
    const startTime = appointment?.startDate * 1000;
    const duration =
      allServices.filter((service) => service.id === appointment.serviceId)[0]
        .durationMinutes / 10;

    return availableTimes.splice(
      availableTimes.indexOf(Number(startTime)),
      duration
    );
  });

  const currentPriceForServices =
    selectService &&
    allServices.filter((service) => service.id === Number(selectService))[0]
      .price;

  // service duration divided by 10
  const getServiceDuration =
    allServices.filter((service) => service.id === Number(selectService))[0]
      ?.durationMinutes / 10;

  // get time from available times where there is gap bigger than 10 minutes
  let timeAvailableBeforeAppointment = [];
  for (let i = 1; i < availableTimes.length; i++) {
    if (availableTimes[i - 1] + TenMinutesInMs < availableTimes[i]) {
      timeAvailableBeforeAppointment.push(availableTimes[i - 1]);
    }
  }

  // push time from the end of work day
  timeAvailableBeforeAppointment.push(
    availableTimes[availableTimes.length - 1]
  );

  // populate array of all unavailable times
  for (let item of timeAvailableBeforeAppointment) {
    let index = availableTimes.indexOf(item);

    for (let i = 0; i < getServiceDuration - 1; i++) {
      const time = availableTimes[index - i];

      if (time + TenMinutesInMs === availableTimes[index - i + 1] || i === 0) {
        unavailableTimes.push(time);
      }
    }
  }

  // remove all times that barber isn't available
  availableTimes = availableTimes.filter(
    (item) =>
      unavailableTimes.findIndex((secondItem: any) => secondItem === item) ===
      -1
  );

  const onSubmit = (data: any = {}) => {
    const sendData = {
      startDate: Number(data.time / 1000),
      barberId: Number(data.barberId),
      serviceId: Number(data.serviceId),
    };

    console.log(data);

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
                filterDate={isWeekday}
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
            value={selectService ? `${currentPriceForServices} €` : ""}
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
};

export default AppointmentForm;
