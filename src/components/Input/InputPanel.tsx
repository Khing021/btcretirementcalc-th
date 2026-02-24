import { useEffect, useState } from "react";
import { InputData } from "../../models/InputData";
import { Slider, InputNumber, Switch, Popover, Radio, Tooltip, Space, Segmented } from "antd";
import "./InputPanel.scss";
import { useTranslation } from "react-i18next";
import { InfoCircleOutlined, QuestionCircleTwoTone } from "@ant-design/icons";
import ExplanatoryOverlay from "./ExplanatoryOverlay";
import { BITCOIN_COLOR, BITCOIN_SIGN } from "../../constants";
import { useSearchParams } from "react-router-dom";
import { ProjectionModel, SaylorCase, PowerLawCase } from "../../models/ProjectionModel";

interface InputPanelProps {
  onCalculate: (data: InputData) => void;
  clearChart: () => void;
}

const InputPanel = ({ onCalculate, clearChart }: InputPanelProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentAge, setCurrentAge] = useState<number>(
    parseInt(searchParams.get("currentAge") || "30"),
  );
  const [currentSavings, setCurrentSavings] = useState<number>(
    parseFloat(searchParams.get("currentSavings") ?? "0.5"),
  );
  const [monthlyBuy, setMonthlyBuy] = useState<number>(
    parseInt(searchParams.get("monthlyBuy") ?? "0"),
  );
  const [bitcoinCagr, setBitcoinPriceAnnualGrowth] = useState<number>(
    parseInt(searchParams.get("bitcoinCagr") ?? "20"),
  );
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(
    parseInt(searchParams.get("lifeExpectancy") ?? "86"),
  );
  const [desiredRetirementIncome, setDesiredRetirementIncome] = useState<number>(
    parseInt(searchParams.get("desiredRetirementIncome") ?? "25000"),
  );
  const [inflationRate, setInflationRate] = useState<number>(
    parseFloat(searchParams.get("inflationRate") ?? "2.0"),
  );
  const [optimized, setOptimized] = useState<boolean>(
    searchParams.get("optimized") == "false" ? false : true,
  );
  const [projectionModel, setProjectionModel] = useState<ProjectionModel>(
    (searchParams.get("projectionModel") as ProjectionModel) || ProjectionModel.CAGR,
  );
  const [saylorCase, setSaylorCase] = useState<SaylorCase>(
    (searchParams.get("saylorCase") as SaylorCase) || SaylorCase.BASE,
  );
  const [powerLawCase, setPowerLawCase] = useState<PowerLawCase>(
    (searchParams.get("powerLawCase") as PowerLawCase) || PowerLawCase.BASE,
  );
  const [increaseSavingsEveryYear, setIncreaseSavingsEveryYear] = useState<boolean>(
    searchParams.get("increaseSavingsEveryYear") === "true",
  );
  const [savingsAnnualIncreaseRate, setSavingsAnnualIncreaseRate] = useState<number>(
    parseInt(searchParams.get("savingsAnnualIncreaseRate") ?? "5"),
  );
  const [t] = useTranslation();
  const monthlyBuyMin: number = 0;
  const monthlyBuyMax: number = 1000000;
  const monthlyBuyStep: number = 100;

  useEffect(() => {
    initQueryString();
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentAge,
    currentSavings,
    monthlyBuy,
    bitcoinCagr,
    lifeExpectancy,
    desiredRetirementIncome,
    inflationRate,
    optimized,
    projectionModel,
    saylorCase,
    powerLawCase,
    increaseSavingsEveryYear,
    savingsAnnualIncreaseRate,
  ]);

  const initQueryString = () => {
    setSearchParams({
      currentAge: currentAge.toString(),
      lifeExpectancy: lifeExpectancy.toString(),
      currentSavings: currentSavings.toString(),
      monthlyBuy: monthlyBuy.toString(),
      bitcoinCagr: bitcoinCagr.toString(),
      desiredRetirementIncome: desiredRetirementIncome.toString(),
      inflationRate: inflationRate.toString(),
      optimized: optimized.toString(),
      projectionModel: projectionModel,
      saylorCase: saylorCase,
      powerLawCase: powerLawCase,
      increaseSavingsEveryYear: increaseSavingsEveryYear.toString(),
      savingsAnnualIncreaseRate: savingsAnnualIncreaseRate.toString(),
    });
  };

  const handleCurrentSavingsChange = (newValue: number | null | undefined) => {
    if (newValue === undefined || newValue == null) {
      return;
    }
    clearChart();
    setCurrentSavings(newValue);
  };

  const handleMonthlyBuyChange = (newValue: number | null | undefined) => {
    if (newValue === undefined || newValue == null) {
      return;
    }
    clearChart();
    setMonthlyBuy(newValue);
  };

  const handleBitcoinPriceGrowthChange = (newValue: number | null | undefined) => {
    if (newValue === undefined || newValue == null) {
      return;
    }
    clearChart();
    setBitcoinPriceAnnualGrowth(newValue);
  };

  const handleInflationRateChange = (newValue: number | null | undefined) => {
    if (newValue === undefined || newValue == null) {
      return;
    }
    clearChart();
    setInflationRate(newValue);
  };

  const handleDesiredRetirementIncomeChange = (newValue: number | null | undefined) => {
    if (newValue === undefined || newValue == null) {
      return;
    }
    clearChart();
    setDesiredRetirementIncome(newValue);
  };

  const handleCurrentAgeChange = (newValue: number | null | undefined) => {
    if (newValue === undefined || newValue == null) {
      return;
    }
    clearChart();
    if (newValue <= lifeExpectancy) {
      setCurrentAge(newValue);
    }
  };
  const handleLifeExpectancyChange = (newValue: number | null | undefined) => {
    if (newValue === undefined || newValue == null) {
      return;
    }
    clearChart();
    if (newValue > currentAge) {
      setLifeExpectancy(newValue);
    }
  };
  const handleOptimizedSwitchChange = (checked: boolean) => {
    setOptimized(checked);
  };
  const handleProjectionModelChange = (value: ProjectionModel) => {
    setProjectionModel(value);
    clearChart();
  };
  const handleSaylorCaseChange = (value: SaylorCase) => {
    setSaylorCase(value);
    clearChart();
  };
  const handlePowerLawCaseChange = (value: PowerLawCase) => {
    setPowerLawCase(value);
    clearChart();
  };
  const handleIncreaseSavingsYearlyChange = (checked: boolean) => {
    setIncreaseSavingsEveryYear(checked);
    clearChart();
  };
  const handleSavingsAnnualIncreaseRateChange = (newValue: number | null | undefined) => {
    if (newValue === undefined || newValue == null) {
      return;
    }
    clearChart();
    setSavingsAnnualIncreaseRate(newValue);
  };
  const calculate = () => {
    onCalculate({
      currentAge,
      currentSavingsInBitcoin: currentSavings,
      monthlyBuyInFiat: monthlyBuy,
      annualPriceGrowth: bitcoinCagr,
      lifeExpectancy: lifeExpectancy,
      desiredRetirementMonthlyBudget: desiredRetirementIncome,
      optimized: optimized,
      inflationRate: inflationRate,
      projectionModel,
      saylorCase,
      powerLawCase,
      increaseSavingsEveryYear,
      savingsAnnualIncreaseRate,
    });
  };

  const fromSliderValue = (v: number) => {
    if (v <= 0) return 0;
    let val = 0;
    let step = 10;

    if (v <= 25) {
      val = Math.pow(10, 1 + (v / 25) * 2);
      step = 10;
    } else if (v <= 50) {
      val = Math.pow(10, 3 + (v - 25) / 25);
      step = 100;
    } else if (v <= 75) {
      val = Math.pow(10, 4 + (v - 50) / 25);
      step = 1000;
    } else {
      val = Math.pow(10, 5 + (v - 75) / 25);
      step = 10000;
    }

    return Math.round(val / step) * step;
  };

  const toSliderValue = (v: number) => {
    if (v <= 0) return 0;
    if (v <= 1000) {
      return ((Math.log10(Math.max(10, v)) - 1) / 2) * 25;
    } else if (v <= 10000) {
      return 25 + (Math.log10(v) - 3) * 25;
    } else if (v <= 100000) {
      return 50 + (Math.log10(v) - 4) * 25;
    } else {
      return 75 + (Math.log10(Math.min(1000000, v)) - 5) * 25;
    }
  };

  return (
    <div className="input-panel">
      <div className="input-panel__zone-top">
        <div className="control">
          <label htmlFor="currentAge">{t("input.current-age")}</label>
          <InputNumber
            className="input"
            min={0}
            max={lifeExpectancy}
            name="currentAge"
            value={currentAge}
            onChange={handleCurrentAgeChange}
          />
        </div>
        <div className="control">
          <label htmlFor="lifeExpectancy">{t("input.life-expectancy")}</label>
          <InputNumber
            className="input"
            min={currentAge}
            max={100}
            name="lifeExpectancy"
            value={lifeExpectancy}
            onChange={handleLifeExpectancyChange}
          />
        </div>
        <div className="control">
          <label htmlFor="currentSavings">{t("input.savings-btc")}</label>
          <InputNumber
            className="input"
            min={0}
            step={0.01}
            addonAfter={BITCOIN_SIGN}
            name="currentSavings"
            value={currentSavings}
            onChange={handleCurrentSavingsChange}
          />
        </div>
        <div className="control">
          <label htmlFor="monthlyBuy">{t("input.monthly-buy")}</label>
          <InputNumber
            name="monthlyBuy"
            className="input"
            step={monthlyBuyStep}
            min={monthlyBuyMin}
            max={monthlyBuyMax}
            value={monthlyBuy}
            addonAfter="THB"
            onChange={handleMonthlyBuyChange}
          />
          <div className="slider-wrapper">
            <Slider
              marks={{
                0: "฿0",
                25: "฿1K",
                50: "฿10K",
                75: "฿100K",
                100: "฿1M",
              }}
              step={0.01}
              tooltip={{
                color: BITCOIN_COLOR,
                open: false,
                formatter: (v) => `฿${fromSliderValue(v ?? 0).toLocaleString()}`,
              }}
              max={100}
              min={0}
              onChange={(v) => handleMonthlyBuyChange(fromSliderValue(v))}
              value={toSliderValue(monthlyBuy)}
            />
          </div>
          <div className="sub-control">
            <Switch
              size="small"
              checked={increaseSavingsEveryYear}
              onChange={handleIncreaseSavingsYearlyChange}
            />
            <span style={{ marginLeft: 8, fontSize: "0.85rem" }}>
              {t("input.increase-savings-yearly")}
            </span>
          </div>
          {increaseSavingsEveryYear && (
            <div className="sub-control-input">
              <label style={{ fontSize: "0.8rem", color: "#666" }}>
                {t("input.annual-increase-rate")}
              </label>
              <InputNumber
                size="small"
                min={0}
                max={100}
                step={1}
                value={savingsAnnualIncreaseRate}
                addonAfter="%"
                onChange={handleSavingsAnnualIncreaseRateChange}
                style={{ width: "100px", marginTop: "4px" }}
              />
            </div>
          )}
        </div>
        <div className="control">
          <label htmlFor="desiredRetirementIncome">
            {t("input.desired-monthly-income")}
            <Tooltip title={t("input.desired-monthly-income-tooltip")}>
              <QuestionCircleTwoTone
                twoToneColor={BITCOIN_COLOR}
                style={{ marginLeft: 8, cursor: "help" }}
              />
            </Tooltip>
          </label>
          <InputNumber
            className="input"
            type="number"
            addonAfter="THB"
            min={0}
            name="desiredRetirementIncome"
            value={desiredRetirementIncome}
            onChange={handleDesiredRetirementIncomeChange}
          />
        </div>
        <div className="control">
          <label htmlFor="inflationRate">
            {t("input.inflation-rate")}
            <Tooltip title={t("input.inflation-rate-tooltip")}>
              <QuestionCircleTwoTone
                twoToneColor={BITCOIN_COLOR}
                style={{ marginLeft: 8, cursor: "help" }}
              />
            </Tooltip>
          </label>
          <InputNumber
            type="number"
            className="input"
            name="inflationRate"
            parser={(value) => parseFloat(value ?? "0").toFixed(1) as unknown as number}
            addonAfter={"%"}
            step={0.1}
            min={0}
            max={projectionModel === ProjectionModel.CAGR ? bitcoinCagr : 100}
            value={inflationRate}
            onChange={handleInflationRateChange}
          />
        </div>
      </div>

      <hr className="divider" />

      <div className="input-panel__zone-bottom">
        <div className="model-selection">
          <label className="section-title">{t("input.model.title")}</label>
          <Radio.Group
            onChange={(e) => handleProjectionModelChange(e.target.value)}
            value={projectionModel}
            className="model-radio-group"
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Radio value={ProjectionModel.CAGR}>
                {t("input.model.cagr")}
                <Tooltip title={t(`mode-explanation.model.cagr`)}>
                  <InfoCircleOutlined style={{ marginLeft: 8, cursor: "help" }} />
                </Tooltip>
              </Radio>
              <Radio value={ProjectionModel.S2F}>
                {t("input.model.s2f")}
                <Tooltip title={t(`mode-explanation.model.s2f`)}>
                  <InfoCircleOutlined style={{ marginLeft: 8, cursor: "help" }} />
                </Tooltip>
              </Radio>
              <Radio value={ProjectionModel.POWER_LAW}>
                {t("input.model.power-law")}
                <Tooltip title={t(`mode-explanation.model.power-law`)}>
                  <InfoCircleOutlined style={{ marginLeft: 8, cursor: "help" }} />
                </Tooltip>
              </Radio>
              <Radio value={ProjectionModel.SAYLOR_24}>
                {t("input.model.saylor-24")}
                <Tooltip title={t(`mode-explanation.model.saylor-24`)}>
                  <InfoCircleOutlined style={{ marginLeft: 8, cursor: "help" }} />
                </Tooltip>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {projectionModel === ProjectionModel.SAYLOR_24 && (
          <div className="model-sub-selection">
            <Segmented
              block
              value={saylorCase}
              onChange={(v) => handleSaylorCaseChange(v as SaylorCase)}
              options={[
                { label: t("input.model.saylor.bear"), value: SaylorCase.BEAR },
                { label: t("input.model.saylor.base"), value: SaylorCase.BASE },
                { label: t("input.model.saylor.bull"), value: SaylorCase.BULL },
              ]}
            />
          </div>
        )}

        {projectionModel === ProjectionModel.POWER_LAW && (
          <div className="model-sub-selection">
            <Segmented
              block
              value={powerLawCase}
              onChange={(v) => handlePowerLawCaseChange(v as PowerLawCase)}
              options={[
                { label: t("input.model.power-law-cases.worst"), value: PowerLawCase.WORST },
                { label: t("input.model.power-law-cases.base"), value: PowerLawCase.BASE },
                { label: t("input.model.power-law-cases.best"), value: PowerLawCase.BEST },
              ]}
            />
          </div>
        )}

        {projectionModel === ProjectionModel.CAGR && (
          <div className="control model-setting">
            <label htmlFor="growthRate">{t("input.growth-rate")}</label>
            <InputNumber
              type="number"
              className="input"
              name="growthRate"
              addonAfter={"%"}
              min={0}
              max={100}
              value={bitcoinCagr}
              onChange={handleBitcoinPriceGrowthChange}
            />
            <div className="slider-wrapper">
              <Slider
                marks={{
                  0: "0%",
                  50: t("slider.growth-rate"),
                  100: "100%",
                }}
                tooltip={{ color: BITCOIN_COLOR, open: false }}
                min={0}
                max={100}
                onChange={handleBitcoinPriceGrowthChange}
                value={typeof bitcoinCagr === "number" ? bitcoinCagr : 0}
              />
            </div>
          </div>
        )}

        <div className="switch-wrapper">
          <span>{t("input.conservative")}</span>
          <Switch checked={optimized} onChange={handleOptimizedSwitchChange} />
          <span> {t("input.optimized")}</span>
          <Popover
            zIndex={2000}
            content={<ExplanatoryOverlay />}
            title={t("mode-explanation.title")}
            trigger="click"
          >
            <QuestionCircleTwoTone
              data-tooltip-id="my-tooltip-multiline"
              twoToneColor={BITCOIN_COLOR}
              style={{ cursor: "pointer" }}
            />
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
