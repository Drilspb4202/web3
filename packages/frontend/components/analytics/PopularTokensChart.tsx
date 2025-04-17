import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Временные демо-данные для графика
const demoData = [
  { name: 'AVAMO', transactions: 128 },
  { name: 'COFTA', transactions: 102 },
  { name: 'BELCAP', transactions: 87 },
  { name: 'ARIDO', transactions: 76 },
  { name: 'PLEXO', transactions: 65 },
  { name: 'FENIX', transactions: 53 },
  { name: 'TERRA', transactions: 48 },
  { name: 'SOLTEC', transactions: 39 },
];

interface PopularTokensChartProps {
  data?: Array<{name: string, transactions: number}>;
  title?: string;
}

const PopularTokensChart: React.FC<PopularTokensChartProps> = ({ 
  data = demoData, 
  title = "Рейтинг популярных токенов" 
}) => {
  // Сортируем токены по количеству транзакций (по убыванию)
  const sortedData = [...data].sort((a, b) => b.transactions - a.transactions);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 40,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip />
          <Bar dataKey="transactions" fill="#4CAF50" name="Количество транзакций" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PopularTokensChart; 