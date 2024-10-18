/**
 * Calcule le prix total d'une prestation
 *
 * @param priceRate prix de base de l'heure en euros (float)
 * @param commissionRate taux de commission en pourcentage (float)
 * @param vatRate taux de TVA en pourcentage (float)
 * @param duration durée en minutes (int)
 * @returns
 */
const calculatePrice = ({
  priceRate,
  commissionRate,
  vatRate,
  duration = 1,
}: {
  priceRate: number;
  commissionRate: number;
  vatRate: number;
  duration?: number;
}) => {
  const commissionMultiplier = commissionRate / 100 + 1;
  const vatMultiplier = vatRate / 100 + 1;

  return priceRate * vatMultiplier * commissionMultiplier * duration;
};

/**
 * Ajoute des espaces tous les 4 caractères dans un IBAN
 * @param IBAN
 */
const formatIBAN = (IBAN) => {
  return IBAN.replace(/(.{4})/g, "$1 ").trim();
};

export const helper = { calculatePrice, formatIBAN };
