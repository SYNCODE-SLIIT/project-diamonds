import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const WaterfallChart = ({ data }) => {
  // Compute cumulative total and assign offset for each entry
  let cumulative = 0;
  const formattedData = data.map((item) => {
    const offset = cumulative;
    cumulative += item.change;
    return {
      name: item.name,
      offset,        // The base from which the change will start
      change: item.change,
      total: cumulative, // Cumulative total (for reference, not directly used)
    };
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => {
            // Do not show offset in tooltip; only display the change
            if (name === "offset") return ["", ""];
            return [value, "Change"];
          }}
        />
        {/* Invisible bar for offset */}
        <Bar dataKey="offset" stackId="1" fill="transparent" />
        
        {/* Actual change bar */}
        <Bar dataKey="change" stackId="1">
          {formattedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.change >= 0 ? "#4caf50" : "#f44336"} // Green if positive, red if negative
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WaterfallChart;