import {
  add,
  sub,
  set,
  format,
  isBefore,
  isAfter,
  isSameHour,
  isSameMinute,
  roundToNearestMinutes,
  parse,
  parseISO,
  startOfDay,
  formatISO,
  isValid,
} from "date-fns";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
setDefaultOptions({ locale: fr });

type ParseDateOnlyProps = {
  date: string;
  format?: string;
};

type ParseTimeOnlyProps = {
  time: string;
  format?: string;
};

/**
 * Convert minutes to hours as human readable (ex: 143 minutes => 2h23)
 *
 * @param minutes
 * @returns
 */
const minutesToHoursHr = (minutes) => {
  // convert minutes to hours
  const hours = Math.floor(minutes / 60);
  // get remaining time
  const minRemaining = minutes % 60;

  return `${hours}h${minRemaining ? minRemaining : ""}`;
};

/**
 * Transform French date to ISO date before sending it to the server.
 * This sets the hours and minutes to 00:00 and adjusts the timezone offset to prevent the date from being off by one day
 * due to the fact that we don't save the hours and minutes on the server.
 *
 * @param param0
 * @returns
 */
const parseDateOnly = ({ date, format = "dd/MM/yyyy" }: ParseDateOnlyProps) => {
  const transformed = dateFns.parse(date, format, new Date());

  if (dateFns.isValid(transformed)) {
    // -- Adjust the date to account for the timezone offset
    const offset = transformed.getTimezoneOffset();
    const adjustedDate = new Date(transformed.getTime() - offset * 60000); // offset in minutes, converted to ms

    return adjustedDate.toISOString();
  } else {
    return date;
  }
};

/**
 * We set the date to 1970/1/1 to prevent daylight saving changes,
 * these conversions align with Paris's daylight saving schedule,
 * which generally begins on the last Sunday in March and ends on the last Sunday in October.
 * During this period, Paris time is 2 hours ahead of UTC instead of 1.
 *
 * @param param0
 * @returns
 */
const parseTimeOnly = ({ time, format = "HH:mm" }: ParseTimeOnlyProps) => {
  const transformed = dateFns.parse(time, format, new Date(1970, 0, 1));

  if (dateFns.isValid(transformed)) {
    return transformed.toISOString();
  } else {
    return time;
  }
};

export const dateFns = {
  add,
  sub,
  set,
  format,
  isBefore,
  isAfter,
  isSameHour,
  isSameMinute,
  roundToNearestMinutes,
  parse,
  parseISO,
  startOfDay,
  formatISO,
  isValid,
  parseDateOnly,
  parseTimeOnly,

  // custom functions
  minutesToHoursHr,
};
