import React, { useState, useEffect } from "react";
import { getDateFromUnix, isWeekday, getTimeFromMs } from "../utils/helpers";
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
  service: yup.string().required("Please select a service"),
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

  let selectService = watch("service");
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

  // when barber has available time
  const availableTimes: number[] = [];
  let startOfTheDay = startDay;
  while (startOfTheDay < endDay) {
    availableTimes.push(startOfTheDay);
    startOfTheDay += TenMinutesInMs;
  }

  // remove lunch time
  availableTimes.splice(availableTimes.indexOf(lunchTime), 3);

  // delete time from time array for appointments
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
    allServices.filter((service) => service?.name === selectService)[0].price;

  const getServiceDuration = allServices.filter(
    (service) => service.name === selectService
  )[0]?.durationMinutes;

  // get time from available times where there is gap bigger than 10 minutes
  let arr = [];
  for (let i = 1; i < availableTimes.length; i++) {
    if (availableTimes[i - 1] + TenMinutesInMs < availableTimes[i]) {
      arr.push(availableTimes[i - 1]);
    }
  }

  const onSubmit = (data: {}) => {
    console.log(data);
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

        <select placeholder="Select Barber" {...register("barberId")}>
          <option value="" hidden>
            Select Barber
          </option>
          {allBarbers.map((barber) => {
            const { firstName, lastName, id } = barber;
            return (
              <option value={id} key={id}>{`${firstName} ${lastName}`}</option>
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
        <p>{selectDate ? "" : "Please pick a date"}</p>

        <select placeholder="Select Time" {...register("time")}>
          <option value="" hidden>
            Select Service
          </option>
          {availableTimes.map((time: any, index: number) => {
            const convertTime = getTimeFromMs(time);

            return (
              <option value={convertTime} key={index}>
                {convertTime}
              </option>
            );
          })}
        </select>
        <p>{errors.time?.message}</p>

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
