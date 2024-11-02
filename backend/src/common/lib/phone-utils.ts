import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { HttpError } from "./errors";

const parse = (params: { phoneNumber: string; countryCode?: CountryCode }) => {
  const { phoneNumber, countryCode = "FR" } = params;

  const parsed = parsePhoneNumberFromString(phoneNumber, countryCode);

  if (!parsed || !parsed.isValid()) {
    throw new HttpError({
      status: 400,
      body: "Invalid phone number.",
    });
  }

  return parsed;
};

const isValid = (params: {
  phoneNumber: string;
  countryCode?: CountryCode;
}) => {
  const { phoneNumber, countryCode = "FR" } = params;

  const parsed = parsePhoneNumberFromString(phoneNumber, countryCode);

  if (!parsed || !parsed.isValid()) {
    return false;
  }

  return true;
};

export const phoneUtils = {
  parse,
  isValid,
};
