import { QuestionCircleTwoTone } from "@ant-design/icons";
import { Popover } from "antd";
import { useTranslation } from "react-i18next";
import { BITCOIN_COLOR } from "../../constants";

const AnnualSavingsExplanation = () => {
    const [t] = useTranslation();
    return (
        <Popover
            zIndex={2000}
            content={
                <div className="explanatory-overlay">
                    <div>{t("annual-savings-explanation.text")}</div>
                </div>
            }
            title={t("annual-savings-explanation.title")}
            trigger="click"
        >
            <QuestionCircleTwoTone style={{ marginLeft: 8, cursor: "pointer" }} twoToneColor={BITCOIN_COLOR} />
        </Popover>
    );
};

export default AnnualSavingsExplanation;
