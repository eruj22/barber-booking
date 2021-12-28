import * as yup from "yup";

export const schema = yup.object().shape({
  firstName: yup.string().required("Please enter your full name"),
  lastName: yup.string().required("Please enter your full name"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .matches(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      "Please enter a valid email"
    )
    .required("Please enter a valid email"),
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
