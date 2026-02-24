import { MonthlyBitcoinPrice } from "../models/AnnualBitcoinPrice";
import { InputData } from "../models/InputData";
import { CalculationResult } from "../models/CalculationResult";
import {
  calculateBitcoinPriceHistory,
} from "./calculationUtils";
import { BitcoinPrices } from "../hooks/useBitcoinPrice";

export const calculateOptimal = (
  input: InputData,
  prices: BitcoinPrices,
): CalculationResult => {
  const bitcoinPriceHistory = calculateBitcoinPriceHistory(input, prices);
  const result = buildRetirementPrediction(
    input,
    prices.thb,
    bitcoinPriceHistory,
  );

  return result;
};

const buildRetirementPrediction = (
  input: InputData,
  startingBitcoinPrice: number,
  bitcoinPriceHistory: MonthlyBitcoinPrice[],
) => {
  const calculationResult: CalculationResult = {
    startingBitcoinPrice: startingBitcoinPrice,
    dataSet: [],
    retirementAge: input.lifeExpectancy,
    savingsBitcoin: 0,
    savingsFiat: 0,
    bitcoinPriceAtRetirementAge: 0,
    monthlyRetirementBudget: 0,
    monthlyRetirementBudgetAtRetirementAge: 0,
    optimized: true,
    canRetire: false,
  };

  let accumulatedSavingsBitcoin = input.currentSavingsInBitcoin;
  let indexedMonthlyBuyInFiat = input.monthlyBuyInFiat;

  const formatMonth = (m: number) => m.toString().padStart(2, "0");

  // iterate to find retirement values (age, savings, etc)
  for (let i = 0; i < bitcoinPriceHistory.length; i++) {
    const dataSetItem = bitcoinPriceHistory[i];

    // Apply annual increases if it's January (but not for the very first month of simulation)
    if (dataSetItem.month === 1 && i > 0) {
      // 1. Follow inflation annually
      indexedMonthlyBuyInFiat *= (1 + input.inflationRate / 100);

      // 2. Apply additional savings increase if enabled
      if (input.increaseSavingsEveryYear) {
        indexedMonthlyBuyInFiat *= (1 + input.savingsAnnualIncreaseRate / 100);
      }
    }

    // accumulate amount of btc you hodl
    const bitcoinToBuy = indexedMonthlyBuyInFiat / dataSetItem.bitcoinPriceIndexed;
    accumulatedSavingsBitcoin += bitcoinToBuy;

    const totalBitcoinWillNeedInLifetime = calculateBitcoinWillNeedOverLife(
      dataSetItem.year,
      dataSetItem.month,
      bitcoinPriceHistory,
    );
    // add current month to dataset
    calculationResult.dataSet.push({
      key: `${formatMonth(dataSetItem.month)}/${dataSetItem.year}`,
      year: dataSetItem.year,
      month: dataSetItem.month,
      age: dataSetItem.age,
      savingsBitcoin: accumulatedSavingsBitcoin,
      savingsFiat: accumulatedSavingsBitcoin * dataSetItem.bitcoinPriceIndexed,
      bitcoinFlow: bitcoinToBuy,
      bitcoinPrice: dataSetItem.bitcoinPriceIndexed,
      monthlyRetirementBudget: dataSetItem.desiredMonthlyBudgetIndexed,
      monthlyBuyFiat: indexedMonthlyBuyInFiat,
    });

    if (totalBitcoinWillNeedInLifetime < accumulatedSavingsBitcoin) {
      calculationResult.canRetire = true;
      calculationResult.retirementAge = dataSetItem.age;
      calculationResult.retirementMonth = dataSetItem.month;
      calculationResult.retirementYear = dataSetItem.year;

      const currentIdx = bitcoinPriceHistory.indexOf(dataSetItem);
      const remainingMonths = bitcoinPriceHistory.length - currentIdx;

      calculationResult.monthlyRetirementBudget =
        (accumulatedSavingsBitcoin * dataSetItem.bitcoinPriceIndexed) / remainingMonths;
      calculationResult.monthlyRetirementBudgetAtRetirementAge =
        dataSetItem.desiredMonthlyBudgetIndexed;
      calculationResult.bitcoinPriceAtRetirementAge = dataSetItem.bitcoinPriceIndexed;
      calculationResult.savingsBitcoin = accumulatedSavingsBitcoin;
      calculationResult.savingsFiat = accumulatedSavingsBitcoin * dataSetItem.bitcoinPriceIndexed;

      break;
    }

    // NOTE: indexedMonthlyBuyInFiat is now only adjusted annually in the block above.
  }

  // didn't find a retirement age skip pos retirement calculations
  if (!calculationResult.canRetire) {
    return calculationResult;
  }
  // pos-retirement calculations
  const lastPreRetirementEntry = calculationResult.dataSet[calculationResult.dataSet.length - 1];
  const posRetirementPriceHistory = bitcoinPriceHistory.filter(
    (x) =>
      x.year > (lastPreRetirementEntry?.year ?? 0) ||
      (x.year === (lastPreRetirementEntry?.year ?? 0) &&
        x.month >= (lastPreRetirementEntry?.month ?? 0)),
  );
  let remainingSavingsBitcoin = calculationResult.savingsBitcoin;
  for (const dataSetItem of posRetirementPriceHistory) {
    const bitcoinToSell =
      dataSetItem.desiredMonthlyBudgetIndexed / dataSetItem.bitcoinPriceIndexed;
    remainingSavingsBitcoin -= bitcoinToSell;

    // Cap at 0 to prevent negative display
    const currentSavingsBtc = Math.max(0, remainingSavingsBitcoin);

    calculationResult.dataSet.push({
      key: `${formatMonth(dataSetItem.month)}/${dataSetItem.year}`,
      year: dataSetItem.year,
      month: dataSetItem.month,
      age: dataSetItem.age,
      savingsBitcoin: currentSavingsBtc,
      savingsFiat: currentSavingsBtc * dataSetItem.bitcoinPriceIndexed,
      bitcoinFlow: -Math.min(bitcoinToSell, remainingSavingsBitcoin + bitcoinToSell),
      bitcoinPrice: dataSetItem.bitcoinPriceIndexed,
      monthlyRetirementBudget: dataSetItem.desiredMonthlyBudgetIndexed,
      monthlyBuyFiat: 0,
    });

    if (currentSavingsBtc <= 0) break;
  }

  // Find the last monthly budget in the dataset for end-of-life visualization
  if (calculationResult.dataSet.length > 0) {
    calculationResult.monthlyRetirementBudgetAtEnd =
      calculationResult.dataSet[calculationResult.dataSet.length - 1].monthlyRetirementBudget;
  }

  return calculationResult;
};

const calculateBitcoinWillNeedOverLife = (
  fromYear: number,
  fromMonth: number,
  dataset: MonthlyBitcoinPrice[],
): number => {
  return dataset
    .filter((x) => x.year > fromYear || (x.year === fromYear && x.month >= fromMonth))
    .reduce((sum, item) => {
      const btcNeededForTheMonth =
        item.desiredMonthlyBudgetIndexed / item.bitcoinPriceIndexed;
      return sum + btcNeededForTheMonth;
    }, 0);
};
