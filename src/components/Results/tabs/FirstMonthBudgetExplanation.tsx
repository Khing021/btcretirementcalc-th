import { QuestionCircleTwoTone } from "@ant-design/icons";
import { Popover } from "antd";
import { useTranslation } from "react-i18next";
import { BITCOIN_COLOR } from "../../../constants";

const FirstMonthBudgetExplanation = () => {
    const [t] = useTranslation();
    return (
        <Popover
            zIndex={2000}
            content={
                <div className="explanatory-overlay">
                    <div>{t("first-month-budget-explanation.text")}</div>
                </div>
            }
            title={t("first-month-budget-explanation.title")}
            trigger="click"
        >
            <QuestionCircleTwoTone data-tooltip-id="first-month-budget-tooltip" twoToneColor={BITCOIN_COLOR} />
        </Popover>
    );
};

export default FirstMonthBudgetExplanation;
