import InfoBox from "../InfoBox";
import { toBtc, toThb } from "../../../constants";
import { useTranslation } from "react-i18next";
import AnnualBudgetExplanation from "./AnnualBudgetExplanation";
import FirstMonthBudgetExplanation from "./FirstMonthBudgetExplanation";

type Props = {
  bitcoinPrice: number;
  retirementAge: number;
  retirementMonth: number;
  retirementYear: number;
  totalSavings: number;
  bitcoinPriceAtRetirement: number;
  monthlyBudget: number;
  monthlyBudgetAtEnd: number;
};

const Summary = ({
  retirementAge,
  retirementMonth,
  retirementYear,
  totalSavings,
  bitcoinPriceAtRetirement,
  monthlyBudget,
  monthlyBudgetAtEnd,
  bitcoinPrice,
}: Props) => {
  const [t] = useTranslation();
  return (
    <div className="input-panel__summary">
      <div className="column">
        {retirementMonth > 0 && retirementYear > 0 && (
          <InfoBox
            label={t("summary.retirement-date")}
            value={`${t(`month.${retirementMonth}`)} ${retirementYear}`}
            type="info"
          />
        )}
        <InfoBox label={t("summary.retirement-age")} value={retirementAge} type="info" />
        <InfoBox label={t("summary.total-savings")} value={toBtc(totalSavings)} type="info" />
        <InfoBox
          label={t("summary.total-savings-thb")}
          value={toThb(totalSavings * bitcoinPriceAtRetirement)}
          type="info"
        />
      </div>
      <div className="column">
        <InfoBox label={t("summary.bitcoin-price")} value={toThb(bitcoinPrice)} type="info" />
        <InfoBox
          label={t("summary.btc-price-at-retirement")}
          value={toThb(bitcoinPriceAtRetirement)}
          type="info"
        />
        <div className="inline">
          <InfoBox
            label={t("summary.monthly-retirement-budget")}
            value={toThb(monthlyBudget)}
            type="info"
          />
          <FirstMonthBudgetExplanation />
        </div>
        <div className="inline">
          <InfoBox
            label={t("summary.monthly-retirement-budget-at-end")}
            value={toThb(monthlyBudgetAtEnd)}
            type="info"
          />
          <AnnualBudgetExplanation />
        </div>
      </div>
    </div>
  );
};

export default Summary;
