import { CalculationResult } from "../src/models/CalculationResult";
import { expect, test } from "vitest";
import { calculateOptimal } from "../src/services/bitcoinRetirementOptimizedCalculator.ts";
import { InputData } from "../src/models/InputData.ts";
import { ProjectionModel } from "../src/models/ProjectionModel";

test("should process input correctly", () => {
  const prices = { thb: 70000, usd: 2000 };
  const expectedCalculation: CalculationResult = {
    startingBitcoinPrice: 70000,
    retirementAge: 56,
    savingsBitcoin: 1.259344,
    savingsFiat: 1050635.89,
    bitcoinPriceAtRetirementAge: 834272.358,
    monthlyRetirementBudget: 0.05,
    dataSet: [],
    optimized: true,
    canRetire: true,
  };

  const testInput: InputData = {
    currentAge: 30,
    currentSavingsInBitcoin: 1,
    monthlyBuyInFiat: 2000 / 12,
    annualPriceGrowth: 10,
    lifeExpectancy: 83,
    desiredRetirementMonthlyBudget: 100000 / 12,
    optimized: false,
    inflationRate: 0,
    projectionModel: ProjectionModel.CAGR,
    increaseSavingsEveryYear: false,
    savingsAnnualIncreaseRate: 0,
  };

  const output = calculateOptimal(testInput, prices);
  expect(output.canRetire).toBe(expectedCalculation.canRetire);
  expect(output.retirementAge).toBe(expectedCalculation.retirementAge);
});

test("Calculation with 2 percent inflation should give expected results", () => {
  const prices = { thb: 70000, usd: 2000 };
  const expectedCalculation: CalculationResult = {
    startingBitcoinPrice: 70000,
    dataSet: [],
    retirementAge: 63,
    savingsBitcoin: 1.33177087,
    savingsFiat: 2165140.88,
    bitcoinPriceAtRetirementAge: 1625760.809,
    monthlyRetirementBudget: 0.07,
    monthlyRetirementBudgetAtRetirementAge: 100000.0 / 12,
    optimized: true,
    canRetire: true,
  };
  const testInputWithInflation: InputData = {
    currentAge: 30,
    currentSavingsInBitcoin: 1,
    monthlyBuyInFiat: 2000 / 12,
    annualPriceGrowth: 10,
    lifeExpectancy: 83,
    desiredRetirementMonthlyBudget: 100000 / 12,
    optimized: false,
    inflationRate: 2,
    projectionModel: ProjectionModel.CAGR,
    increaseSavingsEveryYear: false,
    savingsAnnualIncreaseRate: 0,
  };
  const output = calculateOptimal(testInputWithInflation, prices);
  expect(output.canRetire).toBe(expectedCalculation.canRetire);
  expect(output.retirementAge).toBe(expectedCalculation.retirementAge);
});
