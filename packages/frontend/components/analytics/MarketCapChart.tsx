import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Временные демо-данные для графика
const demoData = [
  { name: 'AVAMO', value: 18000 },
  { name: 'COFTA', value: 12500 },
  { name: 'BELCAP', value: 9800 },
  { name: 'ARIDO', value: 8200 },
  { name: 'PLEXO', value: 7400 },
  { name: 'Другие', value: 23000 },
];

// Цвета для секторов диаграммы
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9370DB', '#A0A0A0'];

interface MarketCapChartProps {
  data?: Array<{name: string, value: number}>;
  title?: string;
}

const MarketCapChart: React.FC<MarketCapChartProps> = ({ 
  data = demoData, 
  title = "Капитализация токенов (AVAX)" 
}) => {
  // Рассчитываем общую капитализацию
  const totalMarketCap = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-xl font-bold text-gray-800 mb-4">
        {totalMarketCap.toLocaleString()} AVAX
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value.toLocaleString()} AVAX`, 'Капитализация']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketCapChart; 