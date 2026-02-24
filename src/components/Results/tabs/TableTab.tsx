import {
  Button,
  Checkbox,
  CheckboxOptionType,
  ConfigProvider,
  Popover,
  Table,
  TableProps,
} from "antd";
import { useTranslation } from "react-i18next";
import { MonthlyTrackingData, CalculationResult } from "../../../models/CalculationResult";
import { BITCOIN_COLOR, toThb } from "../../../constants";
import { useState } from "react";
import { SettingOutlined } from "@ant-design/icons";
import "./TableTab.scss";

const TableTab = ({ dataSet }: CalculationResult) => {
  const [t] = useTranslation();

  const columns: TableProps<MonthlyTrackingData>["columns"] = [
    {
      title: t("table.period"),
      dataIndex: "key",
      width: "7rem",
      key: "key",
    },
    {
      title: t("table.age"),
      dataIndex: "age",
      width: "4rem",
      key: "age",
    },
    {
      title: t("table.bitcoin-price"),
      dataIndex: "bitcoinPrice",
      key: "bitcoinPrice",
      width: "10rem",
      render: (n: number) => <span>{toThb(n)}</span>,
    },
    {
      title: t("table.monthly-buy-fiat"),
      dataIndex: "monthlyBuyFiat",
      key: "monthlyBuyFiat",
      width: "10rem",
      render: (n: number) => <span>{toThb(n)}</span>,
    },
    {
      title: t("table.accumulated-savings"),
      dataIndex: "savingsFiat",
      key: "savingsFiat",
      width: "9rem",
      render: (n: number) => (n === 0 ? <>{t("table.not-relevant")}</> : <span>{toThb(n)}</span>),
    },
    {
      title: t("table.accumulated-savings-btc"),
      dataIndex: "savingsBitcoin",
      key: "savingsBtc",
      width: "8rem",
      render: (n: number) => <>{n.toFixed(8)}</>,
    },
    {
      title: t("table.you-bought"),
      dataIndex: "bitcoinFlow",
      width: "8rem",
      key: "bitcoinBought",
      render: (n: number) => <span>{n.toFixed(8)}</span>,
    },
    {
      title: t("table.indexed-budget"),
      dataIndex: "monthlyRetirementBudget",
      width: "9rem",
      key: "monthlyRetirementBudget",
      render: (n: number) => <span>{toThb(n)}</span>,
    },
  ];

  const defaultCheckedList = columns!.map((item) => item.key as string);
  const [checkedList, setCheckedList] = useState(defaultCheckedList);

  const options = columns!.map(({ key, title }) => ({
    label: title,
    value: key,
  }));

  const newColumns = columns!.map((item) => ({
    ...item,
    hidden: !checkedList.includes(item.key as string),
  }));

  return (
    <div>
      <Table
        style={{ padding: "1rem" }}
        dataSource={dataSet}
        columns={newColumns}
        pagination={false}
        bordered
        scroll={{ y: 250 }}
        footer={() => (
          <div className="table-tab__config">
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: BITCOIN_COLOR,
                },
              }}
            >
              <Popover
                content={
                  <Checkbox.Group
                    className="table-tab__config options"
                    value={checkedList}
                    options={options as CheckboxOptionType[]}
                    onChange={(value) => {
                      setCheckedList(value as string[]);
                    }}
                  />
                }
                placement="topRight"
                title={t("table.config.title")}
                trigger="click"
              >
                <Button icon={<SettingOutlined></SettingOutlined>}></Button>
              </Popover>
            </ConfigProvider>
          </div>
        )}
      ></Table>
    </div>
  );
};

export default TableTab;
