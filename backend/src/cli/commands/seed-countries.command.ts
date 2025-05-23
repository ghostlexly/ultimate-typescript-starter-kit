import { Command } from "commander";
import { Logger } from "@/common/utils/logger";
import papaparse from "papaparse";
import { wolfios } from "@/common/utils/wolfios";
import { prisma } from "@/common/database/prisma";

const LOGGER = new Logger("seed-countries-command");

const setupCommand = (program: Command): void => {
  program
    .command("seed:countries")
    .description("Seed countries list into the database.")
    .action(runCommand);
};

type InseeRow = {
  COG: string;
  ACTUAL: string;
  CRPAY: string;
  ANI: string;
  LIBCOG: string;
  LIBENR: string;
  CODEISO2: string;
  CODEISO3: string;
  CODENUM3: string;
};

const runCommand = async (): Promise<void> => {
  try {
    const inseeService = await createInseeService();
    const geonames = await getGeonames();

    for (const country of geonames) {
      // -------------------------------------
      // find the insee data to get insee country code
      // -------------------------------------
      const insee = inseeService.getInseeByIso2Code({
        iso2Code: country.countryCode,
      });

      if (!insee) {
        LOGGER.warn(`No insee data found for ${country.countryCode}`);
      }

      // -------------------------------------
      // insert country into database
      // -------------------------------------
      await prisma.country.create({
        data: {
          countryName: country.countryName,
          inseeCode: insee?.COG || null,
          iso2Code: country.countryCode,
          iso3Code: country.isoAlpha3,
          num3Code: country.isoNumeric,
          population: Number(country.population),
          continent: country.continent,
          continentName: country.continentName,
          currencyCode: country.currencyCode,
        },
      });

      LOGGER.debug(`Seed [${country.countryName}] successfully.`);
    }

    LOGGER.info(`Seeding finished successfully.`);
  } catch (error) {
    LOGGER.error("Error occured on seeding countries.", {
      error: error?.message,
      stack: error?.stack,
    });
  }

  process.exit(0);
};

const getGeonames = async () => {
  LOGGER.info("Downloading geonames.org data...");
  const countries = await wolfios("http://api.geonames.org/countryInfoJSON", {
    method: "GET",
    params: {
      username: "ghostlexly",
      formatted: "true",
      style: "full",
      lang: "FR", // 👈 set your country language code here for country name translation
    },
  })
    .then(async (res) => await res.json())
    .then((data) => data.geonames);

  return countries;
};

const createInseeService = async () => {
  LOGGER.info("Downloading insee data...");
  const response = await wolfios(
    "https://www.insee.fr/fr/statistiques/fichier/7766585/v_pays_territoire_2024.csv"
  ).then(async (res) => await res.text());

  // -- parse csv data
  const { data: inseeData } = papaparse.parse<InseeRow>(response, {
    header: true,
    skipEmptyLines: true,
  });

  const getInseeByIso2Code = ({ iso2Code }: { iso2Code: string }) =>
    inseeData.find((item) => item.CODEISO2 === iso2Code);

  return {
    getInseeData: () => inseeData,
    getInseeByIso2Code,
  };
};

export default setupCommand;
