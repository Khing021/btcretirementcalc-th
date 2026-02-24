export const BITCOIN_SIGN: string = "BTC";
export const BITCOIN_COLOR: string = "#F6931A";
export const toThb = (number: number) => {
  return number.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    currencyDisplay: "code",
  });
};

export const toBtc = (number: number) => {
  return `${number.toFixed(8)} ${BITCOIN_SIGN}`;
};
