import { InputData } from "../models/InputData";
import { CalculationResult } from "../models/CalculationResult";
import {
  calculateBitcoinPriceHistory,
} from "./calculationUtils";
import { MonthlyBitcoinPrice } from "../models/AnnualBitcoinPrice";
import { BitcoinPrices } from "../hooks/useBitcoinPrice";

export const calculate = (input: InputData, prices: BitcoinPrices): CalculationResult => {
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
    retirementAge: 0,
    savingsBitcoin: 0,
    savingsFiat: 0,
    bitcoinPriceAtRetirementAge: 0,
    monthlyRetirementBudget: 0,
    monthlyRetirementBudgetAtRetirementAge: 0,
    optimized: false,
    canRetire: false,
  };

  let accumulatedSavingsBitcoin = input.currentSavingsInBitcoin;
  let indexedMonthlyBuyInFiat = input.monthlyBuyInFiat;
  let accumulatedSavingsFiat = input.currentSavingsInBitcoin * startingBitcoinPrice;

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
    accumulatedSavingsFiat = accumulatedSavingsBitcoin * dataSetItem.bitcoinPriceIndexed;

    const pendingSavingsFiat = calculateFiatWillNeedOverLife(
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
      savingsFiat: accumulatedSavingsFiat,
      bitcoinFlow: bitcoinToBuy,
      bitcoinPrice: dataSetItem.bitcoinPriceIndexed,
      monthlyRetirementBudget: dataSetItem.desiredMonthlyBudgetIndexed,
      monthlyBuyFiat: indexedMonthlyBuyInFiat,
    });

    if (pendingSavingsFiat <= accumulatedSavingsFiat) {
      calculationResult.canRetire = true;
      const currentIdx = bitcoinPriceHistory.indexOf(dataSetItem);
      const remainingMonths = bitcoinPriceHistory.length - currentIdx;
      calculationResult.monthlyRetirementBudget = accumulatedSavingsFiat / remainingMonths;
      calculationResult.monthlyRetirementBudgetAtRetirementAge =
        dataSetItem.desiredMonthlyBudgetIndexed;
      calculationResult.retirementAge = dataSetItem.age;
      calculationResult.retirementMonth = dataSetItem.month;
      calculationResult.retirementYear = dataSetItem.year;
      calculationResult.bitcoinPriceAtRetirementAge = dataSetItem.bitcoinPriceIndexed;
      calculationResult.savingsBitcoin = accumulatedSavingsBitcoin;
      calculationResult.savingsFiat = accumulatedSavingsFiat;
      break;
    }

    // NOTE: indexedMonthlyBuyInFiat is now only adjusted annually in the block above.
  }

  // didn't find a retirement age skip pos retirement calculations
  if (!calculationResult.canRetire) {
    return calculationResult;
  }
  // pos-retirement calculations
  let remainingSavingsFiat = calculationResult.savingsFiat;
  const posRetirementPriceHistory = bitcoinPriceHistory.filter(
    (x) =>
      x.year > calculationResult.dataSet[calculationResult.dataSet.length - 1]?.year ||
      (x.year === calculationResult.dataSet[calculationResult.dataSet.length - 1]?.year &&
        x.month >= calculationResult.dataSet[calculationResult.dataSet.length - 1]?.month),
  );
  let isFirstMonth = true;
  for (const dataSetItem of posRetirementPriceHistory) {
    remainingSavingsFiat -= dataSetItem.desiredMonthlyBudgetIndexed;
    const currentSavingsFiat = Math.max(0, remainingSavingsFiat);

    calculationResult.dataSet.push({
      key: `${formatMonth(dataSetItem.month)}/${dataSetItem.year}`,
      year: dataSetItem.year,
      month: dataSetItem.month,
      age: dataSetItem.age,
      savingsBitcoin: 0,
      savingsFiat: currentSavingsFiat,
      bitcoinFlow: isFirstMonth ? -calculationResult.savingsBitcoin : 0,
      bitcoinPrice: dataSetItem.bitcoinPriceIndexed,
      monthlyRetirementBudget: dataSetItem.desiredMonthlyBudgetIndexed,
      monthlyBuyFiat: 0,
    });
    if (currentSavingsFiat <= 0) break;
  }

  // Find the last monthly budget in the dataset for end-of-life visualization
  if (calculationResult.dataSet.length > 0) {
    calculationResult.monthlyRetirementBudgetAtEnd =
      calculationResult.dataSet[calculationResult.dataSet.length - 1].monthlyRetirementBudget;
  }

  return calculationResult;
};

const calculateFiatWillNeedOverLife = (
  fromYear: number,
  fromMonth: number,
  dataset: MonthlyBitcoinPrice[],
): number => {
  return dataset
    .filter((x) => x.year > fromYear || (x.year === fromYear && x.month >= fromMonth))
    .reduce((sum, item) => {
      return sum + item.desiredMonthlyBudgetIndexed;
    }, 0);
};
