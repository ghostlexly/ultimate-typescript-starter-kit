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
  differenceInDays,
  parse,
  parseISO,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  formatISO,
  isValid,
} from "date-fns";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { enUS } from "date-fns/locale/en-US";
import { de } from "date-fns/locale/de";
import { es } from "date-fns/locale/es";
import { it } from "date-fns/locale/it";

// Create a locale map for supported languages
const localeMap = {
  fr,
  en: enUS,
  de,
  es,
  it,
};

// IMPORTANT: Use a consistent default locale for initial render
// to prevent hydration errors between server and client
const DEFAULT_LOCALE = fr;

// Initialize with default locale
let locale = DEFAULT_LOCALE;

// Set the default locale for all date-fns operations
setDefaultOptions({ locale: DEFAULT_LOCALE });

// Client-side locale detection (runs after initial hydration)
if (typeof window !== "undefined") {
  // This code only runs in the browser, after hydration
  setTimeout(() => {
    const browserLang = navigator.language.split("-")[0].toLowerCase();

    if (browserLang in localeMap) {
      locale = localeMap[browserLang as keyof typeof localeMap];
    }

    // Update the locale after hydration is complete
    setDefaultOptions({ locale });
  }, 0);
}

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
const minutesToHoursHr = (minutes: number) => {
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
  const transformed = parse(date, format, new Date());

  if (isValid(transformed)) {
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
  const transformed = parse(time, format, new Date(1970, 0, 1));

  if (isValid(transformed)) {
    return transformed.toISOString();
  } else {
    return time;
  }
};

export const dateUtils = {
  add,
  sub,
  set,
  format,
  isBefore,
  isAfter,
  isSameHour,
  isSameMinute,
  roundToNearestMinutes,
  differenceInDays,
  parse,
  parseISO,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  formatISO,
  isValid,

  // custom functions
  parseDateOnly,
  parseTimeOnly,
  minutesToHoursHr,
};
