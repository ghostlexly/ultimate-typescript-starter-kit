import { format, parse, isValid } from "date-fns";

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
function minutesToHoursHr(minutes: number) {
  // convert minutes to hours
  const hours = Math.floor(minutes / 60);
  // get remaining time
  const minRemaining = minutes % 60;

  return `${hours}h${minRemaining ? minRemaining : ""}`;
}

/**
 * Transform French date to ISO date before sending it to the server.
 * This sets the hours and minutes to 00:00 and adjusts the timezone offset to prevent the date from being off by one day
 * due to the fact that we don't save the hours and minutes on the server.
 *
 * @param param0
 * @returns
 */
function parseDateOnly({ date, format = "dd/MM/yyyy" }: ParseDateOnlyProps) {
  const transformed = parse(date, format, new Date());

  if (isValid(transformed)) {
    // -- Adjust the date to account for the timezone offset
    const offset = transformed.getTimezoneOffset();
    const adjustedDate = new Date(transformed.getTime() - offset * 60000); // offset in minutes, converted to ms

    return adjustedDate.toISOString();
  } else {
    return date;
  }
}

/**
 * We set the date to 1970/1/1 to prevent daylight saving changes,
 * these conversions align with Paris's daylight saving schedule,
 * which generally begins on the last Sunday in March and ends on the last Sunday in October.
 * During this period, Paris time is 2 hours ahead of UTC instead of 1.
 *
 * @param param0
 * @returns
 */
function parseTimeOnly({ time, format = "HH:mm" }: ParseTimeOnlyProps) {
  const transformed = parse(time, format, new Date(1970, 0, 1));

  if (isValid(transformed)) {
    return transformed.toISOString();
  } else {
    return time;
  }
}

/**
 * To check the available formats, see https://date-fns.org/v4.1.0/docs/format
 */
export const dateUtils = {
  format,
  parse,
  isValid,

  // Custom functions
  parseDateOnly,
  parseTimeOnly,
  minutesToHoursHr,
};
