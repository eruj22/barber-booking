import { Barbers, Services, Appointments } from "../utils/types";
import moment from "moment";

const TenMinutesInMs = 600000;

export const getBarberWorkHours = (
  allBarbers: Barbers[],
  selectBarber: Barbers,
  selectDate: Date
) => {
  let barberWorkHours = allBarbers
    .filter((barber: { id: number }) => barber.id === Number(selectBarber))[0]
    ?.workHours.filter((hours) => hours.day === moment(selectDate).day())[0];

  const start = barberWorkHours?.startHour;
  const startDay = selectDate?.setHours(start ? start : 0, 0, 0);

  const end = barberWorkHours?.endHour;
  const endDay = selectDate?.setHours(end ? end : 0, 0, 0);

  const lunch = barberWorkHours?.lunchTime.startHour;
  const lunchTime = selectDate?.setHours(lunch ? lunch : 0, 0, 0);

  return { startDay, endDay, lunchTime };
};

export const getAllAvailableTimes = (
  workTimes: {
    startDay: number;
    endDay: number;
    lunchTime: number;
  },
  barberAppointments: Appointments[],
  allServices: Services[]
) => {
  const { startDay, endDay, lunchTime } = workTimes;

  let availableTimes: number[] = [];

  // get array of available times in whole day
  let startOfTheDay = startDay;
  while (startOfTheDay < endDay) {
    availableTimes.push(startOfTheDay);
    startOfTheDay += TenMinutesInMs;
  }

  // remove lunch time from available times
  availableTimes.splice(availableTimes.indexOf(lunchTime), 3);

  // remove time outside work from available times
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

  return availableTimes;
};

export const getAllUnavailableTimes = (
  availableTimes: number[],
  allServices: Services[],
  selectService: string
) => {
  // selected service duration
  const getServiceDuration = allServices.filter(
    (service) => service.id === Number(selectService)
  )[0]?.durationMinutes;

  // get time from available times where there is gap bigger than 10 minutes
  let timeAvailableBeforeAppointment: number[] = [];
  for (let i = 1; i < availableTimes.length; i++) {
    if (availableTimes[i - 1] + TenMinutesInMs < availableTimes[i]) {
      timeAvailableBeforeAppointment.push(availableTimes[i - 1]);
    }
  }

  // push time from the end of work day
  timeAvailableBeforeAppointment.push(
    availableTimes[availableTimes.length - 1]
  );

  let unavailableTimes: number[] = [];

  // populate array of all unavailable times
  for (let item of timeAvailableBeforeAppointment) {
    let index = availableTimes.indexOf(item);

    for (let i = 0; i < getServiceDuration / 10 - 1; i++) {
      const time = availableTimes[index - i];

      if (time + TenMinutesInMs === availableTimes[index - i + 1] || i === 0) {
        unavailableTimes.push(time);
      }
    }
  }

  return unavailableTimes;
};
