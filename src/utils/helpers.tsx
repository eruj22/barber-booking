import moment from "moment";

export const getTimeFromMs = (date: number) => {
  const newDate = new Date(date);
  return moment(newDate).format("HH:mm");
};

export const getDateFromUnix = (date: number) => {
  return moment.unix(date).format("DD.MM.YYYY");
};

export const isWeekdayOrToday = (date: Date) => {
  const day = date.getDay();
  const showToday = date.getDate();
  const today = new Date().getDate();

  return day !== 0 && day !== 6 && showToday !== today;
};
