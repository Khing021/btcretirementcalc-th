import { ProjectionModel, SaylorCase, PowerLawCase } from "./ProjectionModel";

export interface InputData {
  currentAge: number;
  currentSavingsInBitcoin: number;
  monthlyBuyInFiat: number;
  annualPriceGrowth: number;
  lifeExpectancy: number;
  desiredRetirementMonthlyBudget: number;
  inflationRate: number;
  optimized: boolean;
  projectionModel: ProjectionModel;
  saylorCase?: SaylorCase;
  powerLawCase?: PowerLawCase;
  increaseSavingsEveryYear: boolean;
  savingsAnnualIncreaseRate: number;
}
