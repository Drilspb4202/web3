import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Временные демо-данные для графика
const demoData = [
  { date: 'Янв', apr: 6.2 },
  { date: 'Фев', apr: 6.5 },
  { date: 'Март', apr: 7.1 },
  { date: 'Апр', apr: 6.8 },
  { date: 'Май', apr: 7.2 },
  { date: 'Июнь', apr: 7.5 },
  { date: 'Июль', apr: 7.4 },
  { date: 'Авг', apr: 7.6 },
  { date: 'Сент', apr: 7.8 },
  { date: 'Окт', apr: 8.0 },
  { date: 'Нояб', apr: 8.2 },
  { date: 'Дек', apr: 8.5 },
];

interface StakingAPRChartProps {
  data?: Array<{date: string, apr: number}>;
  title?: string;
}

const StakingAPRChart: React.FC<StakingAPRChartProps> = ({ 
  data = demoData, 
  title = "История APR по стейкингу (%)" 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="apr" 
            stroke="#FF6B6B" 
            activeDot={{ r: 8 }} 
            name="APR (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StakingAPRChart; 