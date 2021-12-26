import moment from "moment";

export const getTimeFromMs = (date: number) => {
  const newDate = new Date(date);
  return moment(newDate).format("HH:mm");
};

export const getDateFromUnix = (date: number) => {
  return moment.unix(date).format("DD.MM.YYYY");
};

export const isWeekday = (date: Date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};
