import { AreaChartOutlined, TableOutlined } from "@ant-design/icons";
import { Tabs, TabsProps } from "antd";
import ChartTab from "./ChartTab";
import { LineChartProps } from "../../../models/LineChartProps";
import { useTranslation } from "react-i18next";
import TableTab from "./TableTab";
import { MonthlyTrackingData } from "../../../models/CalculationResult";
import Summary from "./Summary";
import OptimizedSummary from "./OptimizedSummary";
import CannotRetire from "./CannotRetire";

type Props = {
  btcPrice: number;
  retirementAge: number;
  retirementMonth: number;
  retirementYear: number;
  monthlyBudget: number;
  monthlyBudgetAtEnd: number;
  bitcoinPriceAtRetirement: number;
  savingsBitcoin: number;
  savingsFiat: number;
  chartData: LineChartProps;
  priceChartData: LineChartProps | undefined;
  tableData: MonthlyTrackingData[];
  optimized: boolean;
  canRetire: boolean;
};

const Result = ({
  btcPrice,
  retirementAge,
  retirementMonth,
  retirementYear,
  monthlyBudget,
  monthlyBudgetAtEnd,
  bitcoinPriceAtRetirement,
  savingsBitcoin,
  savingsFiat,
  chartData,
  priceChartData,
  tableData,
  optimized,
  canRetire,
}: Props) => {
  const [t] = useTranslation();

  const tabs: TabsProps["items"] = [
    {
      key: "1",
      label: t("calculator.chart-view"),
      icon: <AreaChartOutlined />,
      children: (
        <ChartTab
          bitcoinPrice={btcPrice!}
          retirementAge={retirementAge}
          monthlyBudget={monthlyBudget}
          bitcoinPriceAtRetirement={bitcoinPriceAtRetirement}
          totalSavings={savingsBitcoin}
          chartProps={chartData!}
        />
      ),
    },
    {
      key: "2",
      label: t("calculator.table-view"),
      icon: <TableOutlined />,
      children: (
        <TableTab
          startingBitcoinPrice={btcPrice!}
          retirementAge={retirementAge}
          monthlyRetirementBudget={monthlyBudget}
          bitcoinPriceAtRetirementAge={bitcoinPriceAtRetirement}
          savingsFiat={savingsFiat}
          dataSet={tableData!}
          savingsBitcoin={savingsBitcoin}
          optimized={optimized}
          canRetire={canRetire}
        />
      ),
    },
    {
      key: "3",
      label: t("calculator.price-chart-view"),
      icon: <AreaChartOutlined />,
      children: priceChartData ? (
        <ChartTab
          bitcoinPrice={btcPrice!}
          retirementAge={retirementAge}
          monthlyBudget={monthlyBudget}
          bitcoinPriceAtRetirement={bitcoinPriceAtRetirement}
          totalSavings={savingsBitcoin}
          chartProps={priceChartData}
        />
      ) : null,
    },
  ];
  if (!canRetire) {
    return <CannotRetire></CannotRetire>;
  }
  return (
    <>
      {optimized ? (
        <OptimizedSummary
          retirementAge={retirementAge}
          retirementMonth={retirementMonth}
          retirementYear={retirementYear}
          totalSavings={savingsBitcoin}
          bitcoinPriceAtRetirement={bitcoinPriceAtRetirement}
          monthlyBudget={monthlyBudget}
          monthlyBudgetAtEnd={monthlyBudgetAtEnd}
          bitcoinPrice={btcPrice}
        ></OptimizedSummary>
      ) : (
        <Summary
          retirementAge={retirementAge}
          retirementMonth={retirementMonth}
          retirementYear={retirementYear}
          totalSavings={savingsBitcoin}
          bitcoinPriceAtRetirement={bitcoinPriceAtRetirement}
          monthlyBudget={monthlyBudget}
          monthlyBudgetAtEnd={monthlyBudgetAtEnd}
          bitcoinPrice={btcPrice}
        ></Summary>
      )}

      <Tabs defaultActiveKey="1" items={tabs} />
    </>
  );
};

export default Result;
