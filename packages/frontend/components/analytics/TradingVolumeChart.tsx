import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

// Временные демо-данные для графика
const demoData = [
  { date: '1 Мая', volume: 4000, avgVolume: 3200 },
  { date: '2 Мая', volume: 3000, avgVolume: 3250 },
  { date: '3 Мая', volume: 5000, avgVolume: 3300 },
  { date: '4 Мая', volume: 2780, avgVolume: 3200 },
  { date: '5 Мая', volume: 1890, avgVolume: 3100 },
  { date: '6 Мая', volume: 2390, avgVolume: 2950 },
  { date: '7 Мая', volume: 3490, avgVolume: 3000 },
  { date: '8 Мая', volume: 2000, avgVolume: 3050 },
  { date: '9 Мая', volume: 2780, avgVolume: 3100 },
  { date: '10 Мая', volume: 3908, avgVolume: 3200 },
  { date: '11 Мая', volume: 4800, avgVolume: 3300 },
  { date: '12 Мая', volume: 3800, avgVolume: 3350 },
  { date: '13 Мая', volume: 4300, avgVolume: 3400 },
  { date: '14 Мая', volume: 5300, avgVolume: 3500 },
];

// Периоды для выбора
const PERIODS = ['1Д', '7Д', '30Д', '90Д', '1Г', 'Всё время'];

interface TradingVolumeChartProps {
  data?: Array<{date: string, volume: number, avgVolume?: number}>;
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary-600">
          <span className="font-medium">Объем:</span> {payload[0].value.toLocaleString()} AVAX
        </p>
        {payload[1] && (
          <p className="text-sm text-gray-500">
            <span className="font-medium">Средний объем:</span> {payload[1].value.toLocaleString()} AVAX
          </p>
        )}
      </div>
    );
  }

  return null;
};

const TradingVolumeChart: React.FC<TradingVolumeChartProps> = ({ 
  data = demoData, 
  title = "Объем торгов" 
}) => {
  const [activePeriod, setActivePeriod] = useState('30Д');

  // Вычисление текущего объема и процента изменения
  const currentVolume = data[data.length - 1]?.volume || 0;
  const previousVolume = data[data.length - 2]?.volume || 0;
  const changePercent = previousVolume ? ((currentVolume - previousVolume) / previousVolume) * 100 : 0;
  const isPositiveChange = changePercent >= 0;
  
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <div className="flex items-center mt-2">
            <span className="text-2xl font-bold mr-2">{currentVolume.toLocaleString()} AVAX</span>
            <span className={`text-sm px-2 py-1 rounded-full ${isPositiveChange ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {isPositiveChange ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {PERIODS.map(period => (
            <button
              key={period}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                activePeriod === period 
                  ? 'bg-white shadow text-primary-600' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              onClick={() => setActivePeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAvgVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            type="monotone" 
            name="Объем торгов"
            dataKey="volume" 
            stroke="#6366F1" 
            fillOpacity={1}
            fill="url(#colorVolume)" 
            activeDot={{ r: 6 }}
          />
          <Area 
            type="monotone" 
            name="Средний объем"
            dataKey="avgVolume" 
            stroke="#9CA3AF" 
            fillOpacity={0.3}
            fill="url(#colorAvgVolume)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default TradingVolumeChart; 