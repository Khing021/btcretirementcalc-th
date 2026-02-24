import { useEffect, useState } from "react";

export interface BitcoinPrices {
  thb: number;
  usd: number;
}

export const useBitcoinPrice = (delay: number) => {
  const [prices, setPrices] = useState<BitcoinPrices>();

  useEffect(() => {
    refreshBtcPrice();
  }, []);

  const refreshBtcPrice = async () => {
    try {
      // Fetch both THB and USD from CoinGecko in one call
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=thb,usd",
      );
      const data = await res.json();
      const thb = data?.bitcoin?.thb;
      const usd = data?.bitcoin?.usd;

      if (thb && usd) {
        setPrices({ thb, usd });
      } else {
        await fetchFallback();
      }
    } catch {
      await fetchFallback();
    }
  };

  const fetchFallback = async () => {
    try {
      // Fetch USD from Coinbase
      const resUsd = await fetch("https://api.coinbase.com/v2/prices/spot?currency=USD");
      const dataUsd = await resUsd.json();
      const usd = parseFloat(dataUsd?.data?.amount ?? "0");

      // Fetch THB from Coinbase
      const resThb = await fetch("https://api.coinbase.com/v2/prices/spot?currency=THB");
      const dataThb = await resThb.json();
      const thb = parseFloat(dataThb?.data?.amount ?? "0");

      if (thb > 0 && usd > 0) {
        setPrices({ thb, usd });
      } else if (usd > 0) {
        // Final fallback: use a fixed rate if THB fetch fails
        setPrices({ thb: usd * 35, usd });
      }
    } catch (err) {
      console.error("Failed to fetch BTC prices:", err);
    }
  };

  // Set up the refresh interval.
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(refreshBtcPrice, delay);
      return () => clearInterval(id);
    }
  }, [delay]);

  return prices;
};
