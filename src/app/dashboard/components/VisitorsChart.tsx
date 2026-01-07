"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { MdFullscreen } from "react-icons/md";

// Define types for your data
interface ChartData {
  date: string;
  newVisitor: number;
  oldVisitor: number;
  lastMonth: number;
  avg: number;
  total?: number;
  avgScaled?: number;
}

interface ActiveIndicators {
  oldVisitor: boolean;
  newVisitor: boolean;
  lastMonth: boolean;
  avg: boolean;
}

interface IndicatorConfig {
  key: keyof ActiveIndicators;
  label: string;
  color: string;
  barColor?: string;
  lineColor?: string;
  value: string;
  change: string;
}

interface CustomLegendProps {
  activeIndicators: ActiveIndicators;
  toggleIndicator: (key: keyof ActiveIndicators) => void;
}

// Recharts dot props interface
interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
  [key: string]: any;
}

const data: ChartData[] = [
  { date: "Jan 16", newVisitor: 70, oldVisitor: 90, lastMonth: 20, avg: 10 },
  { date: "", newVisitor: 85, oldVisitor: 68, lastMonth: 78, avg: 82 },
  { date: "", newVisitor: 75, oldVisitor: 80, lastMonth: 72, avg: 75 },
  { date: "Jan 25", newVisitor: 82, oldVisitor: 65, lastMonth: 79, avg: 80 },
  { date: "", newVisitor: 88, oldVisitor: 70, lastMonth: 83, avg: 86 },
  { date: "", newVisitor: 92, oldVisitor: 74, lastMonth: 85, avg: 89 },
  { date: "Jan 16", newVisitor: 90, oldVisitor: 70, lastMonth: 80, avg: 85 },
  { date: "", newVisitor: 85, oldVisitor: 68, lastMonth: 78, avg: 82 },
  { date: "", newVisitor: 75, oldVisitor: 60, lastMonth: 72, avg: 75 },
  { date: "Jan 25", newVisitor: 82, oldVisitor: 65, lastMonth: 79, avg: 80 },
  { date: "", newVisitor: 88, oldVisitor: 200, lastMonth: 83, avg: 86 },
  { date: "Jan 31", newVisitor: 92, oldVisitor: 84, lastMonth: 85, avg: 89 },
];

// compute total directly so LabelList can use it
const chartData: ChartData[] = data.map((d) => ({
  ...d,
  total: d.newVisitor + d.oldVisitor,
  avgScaled: d.avg - 70, // subtract min tick value
}));

const CustomLegend: React.FC<CustomLegendProps> = ({
  activeIndicators,
  toggleIndicator,
}) => {
  const indicators: IndicatorConfig[] = [
    {
      key: "oldVisitor",
      label: "Old Visitor",
      color: "#fecaca",
      barColor: "#fecaca",
      value: "12.4K",
      change: "+12%",
    },
    {
      key: "newVisitor",
      label: "New Visitor",
      color: "#dc2626",
      barColor: "#dc2626",
      value: "8.2K",
      change: "+8%",
    },
    {
      key: "lastMonth",
      label: "Last Month Visitor",
      color: "#22c55e",
      lineColor: "#22c55e",
      value: "15.7K",
      change: "+15%",
    },
    {
      key: "avg",
      label: "Avg Visitor",
      color: "#f59e0b",
      lineColor: "#f59e0b",
      value: "10.2K",
      change: "+5%",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6 mb-4 px-4 sm:px-8">
      {indicators.map((indicator) => (
        <div
          key={indicator.key}
          className={`flex items-center gap-2 text-sm font-semibold cursor-pointer p-2 rounded-lg transition-all duration-200 ${activeIndicators[indicator.key]
              ? "bg-blue-50  border-blue-200 shadow-sm"
              : "opacity-60 hover:opacity-100"
            }`}
          onClick={() => toggleIndicator(indicator.key)}
        >
          <span
            className="w-6 h-3 sm:w-8 sm:h-4"
            style={{
              backgroundColor: indicator.barColor || indicator.lineColor,
              border: indicator.lineColor
                ? `2px solid ${indicator.lineColor}`
                : "none",
            }}
          />
          {indicator.label}
          <span
            className={`text-xs ${activeIndicators[indicator.key]
                ? "text-green-600"
                : "text-gray-400"
              }`}
          >
            {activeIndicators[indicator.key] ? "✓" : "○"}
          </span>
        </div>
      ))}
    </div>
  );
};

// Custom dot component for Line charts
const CustomDot: React.FC<DotProps> = (props) => {
  const { cx, cy, stroke, strokeWidth = 2 } = props;

  if (cx == null || cy == null) {
    return null;
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#fff"
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

export default function VisitorsChart() {
  const [activeIndicators, setActiveIndicators] = useState<ActiveIndicators>({
    oldVisitor: true,
    newVisitor: true,
    lastMonth: true,
    avg: true,
  });

  // Toggle indicator visibility
  const toggleIndicator = (indicatorKey: keyof ActiveIndicators) => {
    setActiveIndicators((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;

      // If trying to deactivate the last active indicator, prevent it
      if (activeCount === 1 && prev[indicatorKey]) {
        return prev; // No change - keep the last one active
      }
      return {
        ...prev,
        [indicatorKey]: !prev[indicatorKey],
      };
    });
  };

  // Check if any indicator is active
  const hasActiveIndicators = Object.values(activeIndicators).some(Boolean);

  return (
    <>
      <div className="w-full bg-white p-4 max-w-4xl shadow-md">
        {/* top div */}
        <div className="flex justify-end mb-9">
          <div>
            <h2 className="font-semibold">
              <button
                onClick={() =>
                  setActiveIndicators({
                    oldVisitor: true,
                    newVisitor: true,
                    lastMonth: true,
                    avg: true,
                  })
                }
                className="flex items-center float-right gap-2 bg-gradient-to-r cursor-pointer 
        from-[var(--color-primary)] to-[var(--color-secondary-darker)] 
        hover:from-[var(--color-primary-darker)] hover:to-[var(--color-secondary-dark)] 
        text-white px-4 py-2 rounded-md "
              >
                All Visitors
              </button>
            </h2>
          </div>
        </div>

        {/* Interactive Legend */}
        <CustomLegend
          activeIndicators={activeIndicators}
          toggleIndicator={toggleIndicator}
        />

        <div className="flex relative items-center mx-6">
          <h2 className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[60%] sm:text-xs lg:text-sm font-semibold mr-2 rotate-270 whitespace-nowrap">
            All Visitors
          </h2>

          <div className="flex-1 h-[250px] mt-3">
            {hasActiveIndicators ? (
              <ResponsiveContainer width="100%" height={270}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
                  barGap={-19} // overlap bars
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={true}
                    tick={{ fontSize: 16, fill: "#555" }}
                  />
                  <YAxis
                    domain={[0, 180]}
                    tickFormatter={(v) => `$${(v / 20).toFixed(1)}M`}
                  />
                  <Tooltip cursor={false} />

                  {/* Bars - Conditionally Render */}
                  {activeIndicators.oldVisitor && (
                    <Bar
                      dataKey="oldVisitor"
                      fill="#f87171"
                      barSize={24}
                      name="Old Visitor"
                    />
                  )}

                  {activeIndicators.newVisitor && (
                    <Bar
                      dataKey="newVisitor"
                      fill="#dc2626"
                      barSize={16}
                      name="New Visitor"
                    />
                  )}

                  {/* Lines - Conditionally Render */}
                  {activeIndicators.lastMonth && (
                    <Line
                      type="monotone"
                      dataKey="lastMonth"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={<CustomDot stroke="#22c55e" />}
                      activeDot={{ r: 6 }}
                      name="Last Month Visitor"
                    />
                  )}

                  {activeIndicators.avg && (
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={<CustomDot stroke="#f59e0b" />}
                      activeDot={{ r: 6 }}
                      name="Avg Visitor"
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">No indicators selected</p>
                  <p className="text-sm">
                    Click on indicators above to show data
                  </p>
                </div>
              </div>
            )}
          </div>

          <h2 className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[60%]  sm:text-xs lg:text-sm font-semibold mr-2 rotate-270 whitespace-nowrap">
            New Visitors
          </h2>
        </div>

        {/* Quick Actions */}
        {/* <div className="flex gap-2 mt-4 justify-center">
          <button
            onClick={() => setActiveIndicators({
              oldVisitor: true,
              newVisitor: true,
              lastMonth: true,
              avg: true
            })}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Show All
          </button>
          <button
            onClick={() => setActiveIndicators({
              oldVisitor: false,
              newVisitor: false,
              lastMonth: false,
              avg: false
            })}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Hide All
          </button>
        </div> */}
      </div>
    </>
  );
}
