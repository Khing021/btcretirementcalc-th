import { MonthlyBitcoinPrice } from "../models/AnnualBitcoinPrice";
import { InputData } from "../models/InputData";
import { ProjectionModel, SaylorCase, PowerLawCase } from "../models/ProjectionModel";
import { BitcoinPrices } from "../hooks/useBitcoinPrice";

export const getMonthlyGrowthFactor = (annualPriceGrowth: number) => {
  const annualRate = annualPriceGrowth / 100;
  // Convert annual growth to monthly compound rate: (1 + r)^(1/12)
  return Math.pow(1 + annualRate, 1 / 12);
};

export const getMonthlyInflationFactor = (annualInflation: number) => {
  const annualRate = annualInflation / 100;
  // Convert annual inflation to monthly compound rate: (1 + r)^(1/12)
  return Math.pow(1 + annualRate, 1 / 12);
};

const GENESIS_DATE = new Date("2009-01-03");

export const calculateBitcoinPriceHistory = (input: InputData, prices: BitcoinPrices) => {
  const bitcoinPriceAtStart = prices.thb;
  const startYear = new Date().getFullYear();
  const startMonth = new Date().getMonth() + 1; // 1-12
  const priceHistory: MonthlyBitcoinPrice[] = [];
  let currentMonthlyBudget = input.desiredRetirementMonthlyBudget;

  const totalMonths = (input.lifeExpectancy - input.currentAge) * 12;
  const monthlyInflationFactor = getMonthlyInflationFactor(input.inflationRate);
  const monthlyGrowthFactorDefault = getMonthlyGrowthFactor(input.annualPriceGrowth);

  // For USD-based models, we need a THB/USD rate. 
  // We derive it from live spot prices to ensure mathematical consistency.
  const THB_USD_RATE = prices.thb / prices.usd;

  let currentYear = startYear;
  let currentMonth = startMonth;
  let currentProjectedPrice = bitcoinPriceAtStart;

  for (let m = 1; m <= totalMonths; m++) {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }

    currentMonthlyBudget = currentMonthlyBudget * monthlyInflationFactor;

    let projectedPrice = 0;
    const currentDate = new Date(currentYear, currentMonth - 1, 15);

    switch (input.projectionModel) {
      case ProjectionModel.S2F: {
        // PlanB's continuous S2F Model
        // Formula: ln(MarketValue) = 3.3 × ln(SF) + 14.6
        // Price = MarketValue / Stock
        // Source: PlanV "Modeling Bitcoin Value with Scarcity" (2019)

        const BLOCKS_PER_DAY = 144; // 10 min average
        const BLOCKS_PER_HALVING = 210_000;
        const BLOCKS_PER_YEAR = 52_560;
        const INITIAL_REWARD = 50;
        const MAX_SUPPLY = 21_000_000;

        const diffTimeS2F = Math.abs(currentDate.getTime() - GENESIS_DATE.getTime());
        const daysSinceGenesis = Math.ceil(diffTimeS2F / (1000 * 60 * 60 * 24));
        const totalBlocks = daysSinceGenesis * BLOCKS_PER_DAY;
        const epoch = Math.floor(totalBlocks / BLOCKS_PER_HALVING);
        const currentReward = INITIAL_REWARD / Math.pow(2, epoch);

        // Calculate total stock (cumulative BTC mined)
        let stock = 0;
        for (let i = 0; i < epoch; i++) {
          stock += BLOCKS_PER_HALVING * (INITIAL_REWARD / Math.pow(2, i));
        }
        const blocksInCurrentEpoch = totalBlocks - epoch * BLOCKS_PER_HALVING;
        stock += blocksInCurrentEpoch * currentReward;
        stock = Math.min(stock, MAX_SUPPLY);

        // Annual flow (BTC produced per year at current reward)
        const annualFlow = currentReward * BLOCKS_PER_YEAR;

        // Stock-to-Flow ratio
        const sf = annualFlow > 0 ? stock / annualFlow : 1000;

        // PlanB's Original S2F Price Model (matching popular charts like Bitbo)
        // Formula: Price = 0.21 * SF^3
        // This version results in ~$400k USD for the 2024-2028 cycle (SF ~120)
        const projectedPriceUsd = 0.21 * Math.pow(sf, 3);

        projectedPrice = projectedPriceUsd * THB_USD_RATE;
        break;
      }
      case ProjectionModel.POWER_LAW: {
        // Published Santostasi formula: Price = 10^(-16.493) * days^5.68 (USD)
        // Source: https://bitcoinpower.law
        // Support/Resistance bands: ±0.3 offset on the constant
        let aConstantValue = -16.493;
        if (input.powerLawCase === PowerLawCase.WORST) {
          aConstantValue = -16.793;
        } else if (input.powerLawCase === PowerLawCase.BEST) {
          aConstantValue = -16.193;
        }

        const diffTime = Math.abs(currentDate.getTime() - GENESIS_DATE.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        projectedPrice = Math.pow(10, aConstantValue) * Math.pow(diffDays, 5.68) * THB_USD_RATE;
        break;
      }
      case ProjectionModel.SAYLOR_24: {
        // Michael Saylor 21-year model variations:
        // Bull: 75% -> 25%, Base: 50% -> 20%, Bear: 25% -> 18%
        let startRate = 0.50;
        let endRate = 0.20;

        if (input.saylorCase === SaylorCase.BULL) {
          startRate = 0.75;
          endRate = 0.25;
        } else if (input.saylorCase === SaylorCase.BEAR) {
          startRate = 0.25;
          endRate = 0.18;
        }

        const startYearSaylor = 2024;
        const endYearSaylor = 2045;
        const totalDecayYears = endYearSaylor - startYearSaylor;

        const currentSimulationYear = currentYear + (currentMonth - 1) / 12;
        const yearsPassed = Math.max(0, currentSimulationYear - startYearSaylor);
        const currentAnnualRate = Math.max(endRate, startRate - (yearsPassed * (startRate - endRate) / totalDecayYears));

        const monthlyGrowthFactor = Math.pow(1 + currentAnnualRate, 1 / 12);
        currentProjectedPrice *= monthlyGrowthFactor;
        projectedPrice = currentProjectedPrice;
        break;
      }
      case ProjectionModel.CAGR:
      default: {
        projectedPrice = bitcoinPriceAtStart * Math.pow(monthlyGrowthFactorDefault, m);
        break;
      }
    }

    const age = input.currentAge + Math.floor(m / 12);

    priceHistory.push({
      year: currentYear,
      month: currentMonth,
      age,
      bitcoinPriceIndexed: projectedPrice,
      desiredMonthlyBudgetIndexed: currentMonthlyBudget,
    });
  }
  return priceHistory;
};
