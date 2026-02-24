import { useState } from "react";
import "chart.js/auto";
import "./Calculator.scss";
import { useBitcoinPrice } from "../hooks/useBitcoinPrice";
import InputPanel from "./Input/InputPanel";
import { InputData } from "../models/InputData";
import { Spin } from "antd";
import { LineChartProps, LineChartData } from "../models/LineChartProps";
import { MonthlyTrackingData, CalculationResult } from "../models/CalculationResult";
import { calculateOptimal } from "../services/bitcoinRetirementOptimizedCalculator";
import { calculate } from "../services/bitcoinRetirementCalculator";
import { BITCOIN_COLOR } from "../constants";
import Result from "./Results/tabs/Result";

const Calculator = () => {
  const [savingsBitcoin, setSavingsBitcoin] = useState<number>(0);
  const [savingsFiat, setSavingsFiat] = useState<number>(0);
  const [retirementAge, setRetirementAge] = useState<number>(0);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [bitcoinPriceAtRetirement, setBitcoinPriceAtRetirement] = useState<number>(0);
  const [retirementMonth, setRetirementMonth] = useState<number>(0);
  const [retirementYear, setRetirementYear] = useState<number>(0);
  const [monthlyBudgetAtEnd, setMonthlyBudgetAtEnd] = useState<number>(0);
  const [chartData, setChartData] = useState<LineChartProps>();
  const [priceChartData, setPriceChartData] = useState<LineChartProps>();
  const [tableData, setTableData] = useState<MonthlyTrackingData[]>([]);
  const [optimized, setOptimized] = useState<boolean>(false);
  const [canRetire, setCanRetire] = useState<boolean>(false);

  const interval = 1000 * 60 * 10;
  const prices = useBitcoinPrice(interval);

  const clearChart = () => {
    setChartData(undefined);
    setPriceChartData(undefined);
  };

  const setChartProps = (fiatDataSet: number[], btcDataSet: number[], labels: string[]) => {
    const dataSets: LineChartData[] = [];
    if (fiatDataSet.length) {
      dataSets.push({
        label: "THB (฿)",
        fill: undefined,
        borderColor: "#22c55e",
        backgroundColor: "#16a34a",
        data: fiatDataSet,
      });
    }
    if (btcDataSet.length) {
      dataSets.push({
        label: "BTC (₿)",
        fill: undefined,
        borderColor: BITCOIN_COLOR,
        backgroundColor: "orange",
        data: btcDataSet,
      });
    }

    setChartData({ labels, datasets: dataSets });
  };

  const setPriceChartProps = (priceDataSet: number[], labels: string[]) => {
    const dataSets: LineChartData[] = [
      {
        label: "BTC Price (฿)",
        fill: undefined,
        borderColor: BITCOIN_COLOR,
        backgroundColor: "orange",
        data: priceDataSet,
      },
    ];

    setPriceChartData({ labels, datasets: dataSets });
  };

  const refreshCalculations = (data: InputData) => {
    if (!prices) return;
    const calculationResult = data.optimized
      ? calculateOptimal(data, prices)
      : calculate(data, prices);

    setRetirementAge(calculationResult.retirementAge);
    setRetirementMonth(calculationResult.retirementMonth ?? 0);
    setRetirementYear(calculationResult.retirementYear ?? 0);
    setSavingsFiat(calculationResult.savingsFiat);
    setSavingsBitcoin(calculationResult.savingsBitcoin);
    setBitcoinPriceAtRetirement(calculationResult.bitcoinPriceAtRetirementAge);
    // Show the desired indexed monthly budget at retirement age
    setMonthlyBudget(
      calculationResult.monthlyRetirementBudgetAtRetirementAge ??
      calculationResult.monthlyRetirementBudget
    );
    setMonthlyBudgetAtEnd(calculationResult.monthlyRetirementBudgetAtEnd ?? 0);
    setOptimized(data.optimized);
    setCanRetire(calculationResult.canRetire);

    setTableData(calculationResult.dataSet);

    updateChartWithAfterRetirementData(calculationResult);
  };

  function updateChartWithAfterRetirementData(
    calculationResult: CalculationResult,
  ) {
    // Use composite labels (MM/YYYY (Age)) for tooltips and data extraction
    const labels = calculationResult.dataSet.map((item) => `${item.key} (${item.age})`);
    const btcDataSet = calculationResult.optimized
      ? calculationResult.dataSet.map((item) => item.savingsBitcoin)
      : [];
    const fiatDataSet = calculationResult.optimized
      ? []
      : calculationResult.dataSet.map((item) => item.savingsFiat);

    setChartProps(fiatDataSet, btcDataSet, labels);

    // Populate Price Chart Data
    const priceDataSet = calculationResult.dataSet.map((item) => item.bitcoinPrice);
    setPriceChartProps(priceDataSet, labels);
  }

  return (
    <>
      {prices && prices.thb > 0 ? (
        <div className="calculator">
          <InputPanel
            onCalculate={(data: InputData) => refreshCalculations(data)}
            clearChart={clearChart}
          ></InputPanel>
          <div className="calculator__result">
            {chartData && tableData && (
              <Result
                btcPrice={prices.thb}
                retirementAge={retirementAge}
                retirementMonth={retirementMonth}
                retirementYear={retirementYear}
                monthlyBudget={monthlyBudget}
                monthlyBudgetAtEnd={monthlyBudgetAtEnd}
                bitcoinPriceAtRetirement={bitcoinPriceAtRetirement}
                savingsBitcoin={savingsBitcoin}
                savingsFiat={savingsFiat}
                chartData={chartData}
                priceChartData={priceChartData}
                tableData={tableData}
                optimized={optimized}
                canRetire={canRetire}
              />
            )}
          </div>
        </div>
      ) : (
        <Spin fullscreen />
      )}
    </>
  );
};

export default Calculator;
