import { z } from "zod";

export const initializeZod = () => {
  z.setErrorMap(zodFrenchErrorMap);
};

const zodFrenchErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === "string") {
        return { message: "Ce champ doit être du texte" };
      }
      if (issue.expected === "number") {
        return { message: "Ce champ doit être un nombre" };
      }
      if (issue.expected === "integer") {
        return { message: "Ce champ doit être un nombre entier" };
      }
      if (issue.expected === "float") {
        return { message: "Ce champ doit être un nombre décimal" };
      }
      if (issue.expected === "boolean") {
        return { message: "Ce champ doit être vrai ou faux" };
      }
      if (issue.expected === "date") {
        return { message: "Ce champ doit être une date valide" };
      }
      if (issue.expected === "bigint") {
        return { message: "Ce champ doit être un très grand nombre" };
      }
      if (issue.expected === "undefined") {
        return { message: "Ce champ ne doit pas être défini" };
      }
      if (issue.expected === "null") {
        return { message: "Ce champ doit être vide" };
      }
      if (issue.expected === "array") {
        return { message: "Ce champ doit être une liste" };
      }
      if (issue.expected === "object") {
        return { message: "Ce champ doit être un objet" };
      }
      if (issue.expected === "function") {
        return { message: "Ce champ doit être une fonction" };
      }
      return {
        message: `Type attendu : ${issue.expected}, type reçu : ${issue.received}`,
      };

    case z.ZodIssueCode.invalid_literal:
      return {
        message: `La valeur doit être exactement : ${JSON.stringify(
          issue.expected
        )}`,
      };

    case z.ZodIssueCode.unrecognized_keys: {
      const keys = issue.keys.map((k) => `"${k}"`).join(", ");
      return {
        message: `Propriété${issue.keys.length > 1 ? "s" : ""} non autorisée${
          issue.keys.length > 1 ? "s" : ""
        } : ${keys}`,
      };
    }

    case z.ZodIssueCode.invalid_union:
      return {
        message: "Les données fournies ne correspondent à aucun format attendu",
      };

    case z.ZodIssueCode.invalid_union_discriminator: {
      const options = issue.options.map((opt) => `"${opt}"`).join(" ou ");
      return {
        message: `La valeur du discriminateur doit être : ${options}`,
      };
    }

    case z.ZodIssueCode.invalid_enum_value: {
      const enumOptions = issue.options.map((opt) => `"${opt}"`).join(", ");
      return {
        message: `Valeur non autorisée. Valeurs possibles : ${enumOptions}. Valeur reçue : "${issue.received}"`,
      };
    }

    case z.ZodIssueCode.invalid_arguments:
      return { message: "Les arguments de la fonction ne sont pas valides" };

    case z.ZodIssueCode.invalid_return_type:
      return { message: "Le type de retour de la fonction n'est pas valide" };

    case z.ZodIssueCode.invalid_date:
      return { message: "La date fournie n'est pas valide" };

    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        return { message: "L'adresse e-mail n'est pas valide" };
      }
      if (issue.validation === "url") {
        return { message: "L'adresse web (URL) n'est pas valide" };
      }
      if (issue.validation === "emoji") {
        return { message: "Ce champ doit contenir un emoji valide" };
      }
      if (issue.validation === "uuid") {
        return { message: "L'identifiant unique (UUID) n'est pas valide" };
      }
      if (issue.validation === "nanoid") {
        return { message: "L'identifiant NanoID n'est pas valide" };
      }
      if (issue.validation === "cuid") {
        return { message: "L'identifiant CUID n'est pas valide" };
      }
      if (issue.validation === "cuid2") {
        return { message: "L'identifiant CUID2 n'est pas valide" };
      }
      if (issue.validation === "ulid") {
        return { message: "L'identifiant ULID n'est pas valide" };
      }
      if (issue.validation === "datetime") {
        return { message: "Le format de date et heure n'est pas valide" };
      }
      if (issue.validation === "date") {
        return { message: "Le format de date n'est pas valide" };
      }
      if (issue.validation === "time") {
        return { message: "Le format d'heure n'est pas valide" };
      }
      if (issue.validation === "duration") {
        return { message: "Le format de durée n'est pas valide" };
      }
      if (issue.validation === "ip") {
        return { message: "L'adresse IP n'est pas valide" };
      }
      if (issue.validation === "base64") {
        return { message: "Le format Base64 n'est pas valide" };
      }
      if (issue.validation === "startsWith") {
        return { message: `Le texte doit commencer par "${issue.startsWith}"` };
      }
      if (issue.validation === "endsWith") {
        return { message: `Le texte doit se terminer par "${issue.endsWith}"` };
      }
      if (issue.validation === "regex") {
        return {
          message: "Le format du texte n'est pas conforme aux règles attendues",
        };
      }
      if (issue.validation === "includes") {
        return { message: `Le texte doit contenir "${issue.includes}"` };
      }
      return { message: "Le format du texte n'est pas valide" };

    case z.ZodIssueCode.too_small:
      if (issue.type === "array") {
        if (issue.exact) {
          return {
            message: `La liste doit contenir exactement ${
              issue.minimum
            } élément${issue.minimum > 1 ? "s" : ""}`,
          };
        }
        return {
          message: `La liste doit contenir au moins ${issue.minimum} élément${
            issue.minimum > 1 ? "s" : ""
          }`,
        };
      }
      if (issue.type === "string") {
        if (issue.exact) {
          return {
            message: `Le texte doit contenir exactement ${
              issue.minimum
            } caractère${issue.minimum > 1 ? "s" : ""}`,
          };
        }
        return {
          message: `Le texte doit contenir au moins ${issue.minimum} caractère${
            issue.minimum > 1 ? "s" : ""
          }`,
        };
      }
      if (issue.type === "number") {
        if (issue.exact) {
          return {
            message: `Le nombre doit être exactement ${issue.minimum}`,
          };
        }
        return {
          message: `Le nombre doit être supérieur ou égal à ${issue.minimum}`,
        };
      }
      if (issue.type === "date") {
        return {
          message: `La date doit être postérieure ou égale au ${new Date(
            issue.minimum
          ).toLocaleDateString("fr-FR")}`,
        };
      }
      if (issue.type === "bigint") {
        if (issue.exact) {
          return {
            message: `Le grand nombre doit être exactement ${issue.minimum}`,
          };
        }
        return {
          message: `Le grand nombre doit être supérieur ou égal à ${issue.minimum}`,
        };
      }
      return { message: "La valeur est trop petite" };

    case z.ZodIssueCode.too_big:
      if (issue.type === "array") {
        if (issue.exact) {
          return {
            message: `La liste doit contenir exactement ${
              issue.maximum
            } élément${issue.maximum > 1 ? "s" : ""}`,
          };
        }
        return {
          message: `La liste doit contenir au maximum ${issue.maximum} élément${
            issue.maximum > 1 ? "s" : ""
          }`,
        };
      }
      if (issue.type === "string") {
        if (issue.exact) {
          return {
            message: `Le texte doit contenir exactement ${
              issue.maximum
            } caractère${issue.maximum > 1 ? "s" : ""}`,
          };
        }
        return {
          message: `Le texte doit contenir au maximum ${
            issue.maximum
          } caractère${issue.maximum > 1 ? "s" : ""}`,
        };
      }
      if (issue.type === "number") {
        if (issue.exact) {
          return {
            message: `Le nombre doit être exactement ${issue.maximum}`,
          };
        }
        return {
          message: `Le nombre doit être inférieur ou égal à ${issue.maximum}`,
        };
      }
      if (issue.type === "date") {
        return {
          message: `La date doit être antérieure ou égale au ${new Date(
            issue.maximum
          ).toLocaleDateString("fr-FR")}`,
        };
      }
      if (issue.type === "bigint") {
        if (issue.exact) {
          return {
            message: `Le grand nombre doit être exactement ${issue.maximum}`,
          };
        }
        return {
          message: `Le grand nombre doit être inférieur ou égal à ${issue.maximum}`,
        };
      }
      return { message: "La valeur est trop grande" };

    case z.ZodIssueCode.invalid_intersection_types:
      return {
        message: "Impossible de combiner les types de données requis",
      };

    case z.ZodIssueCode.not_multiple_of:
      return {
        message: `Le nombre doit être un multiple de ${issue.multipleOf}`,
      };

    case z.ZodIssueCode.not_finite:
      return { message: "Le nombre doit être fini (pas infini)" };

    case z.ZodIssueCode.custom:
      if (issue.message) {
        return { message: issue.message };
      }
      return { message: "Les données fournies ne sont pas valides" };

    default:
      return { message: ctx.defaultError };
  }
};
