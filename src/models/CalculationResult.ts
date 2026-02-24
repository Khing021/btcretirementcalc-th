export interface CalculationResult {
  monthlyRetirementBudgetAtRetirementAge?: number;
  startingBitcoinPrice: number;
  dataSet: MonthlyTrackingData[];
  retirementAge: number;
  savingsBitcoin: number;
  savingsFiat: number;
  bitcoinPriceAtRetirementAge: number;
  retirementMonth?: number;
  retirementYear?: number;
  monthlyRetirementBudget: number;
  monthlyRetirementBudgetAtEnd?: number;
  optimized: boolean;
  canRetire: boolean;
}

export interface MonthlyTrackingData {
  key: string;
  year: number;
  month: number;
  age: number;
  savingsBitcoin: number;
  savingsFiat: number;
  bitcoinFlow: number;
  bitcoinPrice: number;
  monthlyRetirementBudget: number;
  monthlyBuyFiat: number;
}
