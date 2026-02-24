import { useRef } from "react";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { LineChartProps } from "../../../models/LineChartProps";

const LineChart = (chartData: LineChartProps) => {
  const chartRef = useRef<Chart<"line">>();
  const [t] = useTranslation();

  // Check if we have both THB and BTC datasets
  const hasDualAxes = chartData.datasets.length === 2;

  return (
    <Line
      redraw
      ref={chartRef}
      datasetIdKey="id"
      data={{
        ...chartData,
        datasets: chartData.datasets.map((ds, i) => ({
          ...ds,
          yAxisID: hasDualAxes ? (i === 0 ? "yTHB" : "yBTC") : "y",
        })),
      }}
      options={{
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          x: {
            ticks: {
              callback: function (val, index) {
                const labelsCount = this.chart.data.labels?.length || 0;
                // Dynamic skip based on total duration:
                // > 40 years: every 5 years (60 months)
                // > 20 years: every 2 years (24 months)
                // Else: every year (12 months)
                const skipFactor = labelsCount > 480 ? 60 : labelsCount > 240 ? 24 : 12;

                if (index % skipFactor === 0) {
                  const fullLabel = this.getLabelForValue(Number(val));
                  const ageMatch = fullLabel.match(/\((\d+)\)/);
                  return ageMatch ? ageMatch[1] : "";
                }
                return "";
              },
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
            },
          },
          ...(hasDualAxes
            ? {
              yTHB: {
                type: "linear" as const,
                display: true,
                position: "left" as const,
                title: {
                  display: true,
                  text: "THB (฿)",
                },
                ticks: {
                  callback: (value: any) => {
                    const num = Number(value);
                    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
                    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
                    return num.toString();
                  },
                },
              },
              yBTC: {
                type: "linear" as const,
                display: true,
                position: "right" as const,
                title: {
                  display: true,
                  text: "BTC (₿)",
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            }
            : {}),
        },
        plugins: {
          title: {
            display: true,
            text: t("chart.title"),
          },
          legend: {
            display: true,
          },
        },
      }}
    />
  );
};

export default LineChart;
