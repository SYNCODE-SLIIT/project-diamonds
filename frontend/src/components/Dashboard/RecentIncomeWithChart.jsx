import React, { useEffect, useState } from 'react';
import CustomPieChart from '../Charts/CustomPieChart';

// Define COLORS 
const COLORS = ["#875CF5", "#FA2C37", "#FF6900"];

const RecentIncomeWithChart = ({ data, totalIncome }) => {
  const [chartData, setChartData] = useState([]);

  const prepareChartData = () => {
    const dataArr = data?.map((item) => ({
      name: item?.source,
      amount: item?.amount,
    }));
    setChartData(dataArr);
  };

  useEffect(() => {
    prepareChartData();
  }, [data]);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Last 60 Days Income</h5>
      </div>

      <div className="mt-10" style={{ transform: "translateY(-10px)" }}>
        <CustomPieChart
          data={chartData}
          label="Total Income"
          totalAmount={`RS.${totalIncome}`}
          showTextAnchor={true}
          colors={COLORS}
        />
      </div>
    </div>
  );
};

export default RecentIncomeWithChart;
