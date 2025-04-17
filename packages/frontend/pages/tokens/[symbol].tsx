import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Image from 'next/image';
import TokenExchangeRates from '../../components/TokenExchangeRates';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTokenDetails } from '../../hooks/useTokenDetails';

// Демо-данные для примера
const tokenData = {
  'AVAMO': {
    name: 'Avamo Network',
    symbol: 'AVAMO',
    logo: '/images/tokens/avamo.svg',
    price: 12.85,
    marketCap: 18000000,
    totalSupply: 1400000,
    circulationSupply: 850000,
    holders: 347,
    description: 'Avamo Network - платформа для децентрализованного кредитования малого бизнеса с фокусом на сельскохозяйственный сектор.',
    priceHistory: [
      { date: '01.01.2023', price: 8.2 },
      { date: '01.02.2023', price: 9.4 },
      { date: '01.03.2023', price: 10.1 },
      { date: '01.04.2023', price: 9.8 },
      { date: '01.05.2023', price: 10.5 },
      { date: '01.06.2023', price: 11.3 },
      { date: '01.07.2023', price: 11.8 },
      { date: '01.08.2023', price: 12.2 },
      { date: '01.09.2023', price: 11.7 },
      { date: '01.10.2023', price: 12.4 },
      { date: '01.11.2023', price: 12.9 },
      { date: '01.12.2023', price: 12.85 },
    ],
    tokenomics: {
      distribution: [
        { name: 'Команда', value: 15 },
        { name: 'Инвесторы', value: 25 },
        { name: 'Резерв', value: 10 },
        { name: 'Стейкинг', value: 20 },
        { name: 'Экосистема', value: 30 }
      ],
      unlockSchedule: [
        { date: 'Янв 2023', amount: 280000 },
        { date: 'Апр 2023', amount: 210000 },
        { date: 'Июл 2023', amount: 210000 },
        { date: 'Окт 2023', amount: 150000 },
        { date: 'Янв 2024', amount: 150000 },
        { date: 'Апр 2024', amount: 120000 },
        { date: 'Июл 2024', amount: 120000 },
        { date: 'Окт 2024', amount: 90000 },
        { date: 'Янв 2025', amount: 70000 },
      ]
    },
    topHolders: [
      { address: '0x1a2b...3c4d', amount: 140000, percentage: 10 },
      { address: '0x5e6f...7g8h', amount: 98000, percentage: 7 },
      { address: '0x9i10...11j12', amount: 70000, percentage: 5 },
      { address: '0x13k14...15l16', amount: 56000, percentage: 4 },
      { address: '0x17m18...19n20', amount: 42000, percentage: 3 },
    ]
  },
  'COFTA': {
    name: 'Coffee Trading Alliance',
    symbol: 'COFTA',
    logo: '/images/tokens/cofta.svg',
    price: 8.45,
    marketCap: 12500000,
    totalSupply: 1800000,
    circulationSupply: 950000,
    holders: 283,
    description: 'Coffee Trading Alliance - объединение производителей кофе, использующих блокчейн для прозрачности поставок и справедливой торговли.',
    priceHistory: [
      { date: '01.01.2023', price: 5.1 },
      { date: '01.02.2023', price: 5.8 },
      { date: '01.03.2023', price: 6.2 },
      { date: '01.04.2023', price: 6.5 },
      { date: '01.05.2023', price: 7.1 },
      { date: '01.06.2023', price: 7.4 },
      { date: '01.07.2023', price: 7.8 },
      { date: '01.08.2023', price: 8.2 },
      { date: '01.09.2023', price: 8.0 },
      { date: '01.10.2023', price: 8.3 },
      { date: '01.11.2023', price: 8.5 },
      { date: '01.12.2023', price: 8.45 },
    ],
    tokenomics: {
      distribution: [
        { name: 'Команда', value: 12 },
        { name: 'Инвесторы', value: 20 },
        { name: 'Резерв', value: 13 },
        { name: 'Фермеры', value: 35 },
        { name: 'Экосистема', value: 20 }
      ],
      unlockSchedule: [
        { date: 'Янв 2023', amount: 360000 },
        { date: 'Апр 2023', amount: 270000 },
        { date: 'Июл 2023', amount: 270000 },
        { date: 'Окт 2023', amount: 180000 },
        { date: 'Янв 2024', amount: 180000 },
        { date: 'Апр 2024', amount: 180000 },
        { date: 'Июл 2024', amount: 180000 },
        { date: 'Окт 2024', amount: 180000 },
      ]
    },
    topHolders: [
      { address: '0x2a3b...4c5d', amount: 180000, percentage: 10 },
      { address: '0x6e7f...8g9h', amount: 126000, percentage: 7 },
      { address: '0x10i11...12j13', amount: 90000, percentage: 5 },
      { address: '0x14k15...16l17', amount: 72000, percentage: 4 },
      { address: '0x18m19...20n21', amount: 54000, percentage: 3 },
    ]
  },
  'BELCAP': {
    name: 'Belgrade Capital',
    symbol: 'BELCAP',
    logo: '/images/tokens/belcap.svg',
    price: 6.75,
    marketCap: 9800000,
    totalSupply: 1500000,
    circulationSupply: 720000,
    holders: 156,
    description: 'Belgrade Capital - фонд для инвестиций в стартапы региона Балкан, с фокусом на технологические и финтех компании.',
    priceHistory: [
      { date: '01.01.2023', price: 4.2 },
      { date: '01.02.2023', price: 4.8 },
      { date: '01.03.2023', price: 5.1 },
      { date: '01.04.2023', price: 5.3 },
      { date: '01.05.2023', price: 5.7 },
      { date: '01.06.2023', price: 6.0 },
      { date: '01.07.2023', price: 6.2 },
      { date: '01.08.2023', price: 6.4 },
      { date: '01.09.2023', price: 6.5 },
      { date: '01.10.2023', price: 6.6 },
      { date: '01.11.2023', price: 6.8 },
      { date: '01.12.2023', price: 6.75 },
    ],
    tokenomics: {
      distribution: [
        { name: 'Команда', value: 18 },
        { name: 'Инвесторы', value: 30 },
        { name: 'Резерв', value: 15 },
        { name: 'Стейкинг', value: 12 },
        { name: 'Экосистема', value: 25 }
      ],
      unlockSchedule: [
        { date: 'Янв 2023', amount: 300000 },
        { date: 'Апр 2023', amount: 225000 },
        { date: 'Июл 2023', amount: 225000 },
        { date: 'Окт 2023', amount: 150000 },
        { date: 'Янв 2024', amount: 150000 },
        { date: 'Апр 2024', amount: 150000 },
        { date: 'Июл 2024', amount: 150000 },
        { date: 'Окт 2024', amount: 150000 },
      ]
    },
    topHolders: [
      { address: '0x3a4b...5c6d', amount: 150000, percentage: 10 },
      { address: '0x7e8f...9g0h', amount: 105000, percentage: 7 },
      { address: '0x1i2j...3k4l', amount: 75000, percentage: 5 },
      { address: '0x5m6n...7o8p', amount: 60000, percentage: 4 },
      { address: '0x9q0r...1s2t', amount: 45000, percentage: 3 },
    ]
  }
};

// Цвета для графиков токеномики
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9370DB'];

const TokenDetail: NextPage = () => {
  const router = useRouter();
  const { symbol } = router.query;
  const [timeFrame, setTimeFrame] = useState('1y'); // 1w, 1m, 3m, 6m, 1y
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const { tokenDetails, loading, error } = useTokenDetails(undefined, symbol as string);
  
  // Список основных валют для отображения
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'RUB', 'CNY', 'AVAX'];
  
  // Преобразование цены в выбранную валюту
  const convertPrice = (price: number, currency: string) => {
    if (!tokenDetails?.exchangeRates || currency === 'USD') return price;
    
    const rate = tokenDetails.exchangeRates[currency];
    if (!rate) return price;
    
    return price * rate;
  };
  
  // Форматирование цены с символом валюты
  const formatPriceWithCurrency = (price: number, currency: string) => {
    const convertedPrice = convertPrice(price, currency);
    
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'RUB': '₽',
      'CNY': '¥',
      'AVAX': 'AVAX'
    };
    
    const symbol = currencySymbols[currency] || currency;
    
    // Для JPY не используем десятичные знаки
    if (currency === 'JPY') {
      return `${symbol}${Math.round(convertedPrice).toLocaleString()}`;
    }
    
    // Для AVAX показываем до 6 десятичных знаков
    if (currency === 'AVAX') {
      return `${convertedPrice.toFixed(6)} ${symbol}`;
    }
    
    return `${symbol}${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  if (loading || !tokenDetails) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h2 className="text-xl font-bold text-red-700 mb-2">Ошибка загрузки данных</h2>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={`${tokenDetails.name} (${tokenDetails.symbol}) - Chihuahua Capital`}>
      <div className="container mx-auto px-4 py-8">
        {/* Шапка с основной информацией о токене */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
            <div className="flex items-center mb-4 md:mb-0 md:mr-6">
              <div className="relative w-12 h-12 mr-4 bg-gray-100 rounded-full flex items-center justify-center">
                {tokenDetails.logo ? (
                  <Image 
                    src={tokenDetails.logo} 
                    alt={tokenDetails.symbol} 
                    width={36} 
                    height={36} 
                    className="rounded-full"
                  />
                ) : (
                  <div className="text-xl font-bold text-gray-400">{tokenDetails.symbol.charAt(0)}</div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{tokenDetails.name}</h1>
                <p className="text-gray-500">{tokenDetails.symbol}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 md:ml-auto">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">Цена</p>
                  <select 
                    className="text-xs border border-gray-300 rounded px-1 bg-gray-50"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    {popularCurrencies.map(currency => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xl font-bold">{formatPriceWithCurrency(tokenDetails.price, selectedCurrency)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Капитализация</p>
                <p className="text-xl font-bold">{formatPriceWithCurrency(tokenDetails.marketCap, selectedCurrency)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Держатели</p>
                <p className="text-xl font-bold">{tokenDetails.holders.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700">{tokenDetails.description}</p>
          
          {/* Блок с курсами в разных валютах */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <TokenExchangeRates 
              tokenId={tokenDetails.id || tokenDetails.symbol}
              tokenSymbol={tokenDetails.symbol} 
              tokenPrice={tokenDetails.price} 
            />
          </div>
        </div>
        
        {/* График цены */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">История цены</h2>
            <div className="flex space-x-2">
              {['1w', '1m', '3m', '6m', '1y'].map((frame) => (
                <button
                  key={frame}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeFrame === frame
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setTimeFrame(frame)}
                >
                  {frame}
                </button>
              ))}
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={tokenDetails.priceHistory}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                domain={['auto', 'auto']} 
                tickFormatter={(value) => formatPriceWithCurrency(value, selectedCurrency).replace(tokenDetails.price.toString(), '')} 
              />
              <Tooltip 
                formatter={(value) => [formatPriceWithCurrency(Number(value), selectedCurrency), 'Цена']} 
                labelFormatter={(label) => `Дата: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Токеномика */}
        <h2 className="text-2xl font-bold mb-6">Токеномика</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Распределение токенов */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Распределение токенов</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tokenDetails.tokenomics.distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tokenDetails.tokenomics.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Доля']} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* График разблокировки токенов */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">График разблокировки токенов</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={tokenDetails.tokenomics.unlockSchedule}
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
                <Tooltip formatter={(value) => [`${value.toLocaleString()} ${tokenDetails.symbol}`, 'Количество']} />
                <Bar 
                  dataKey="amount" 
                  fill="#4CAF50" 
                  name={`Разблокировка ${tokenDetails.symbol}`} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Основная информация о токене */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Информация о предложении */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Информация о предложении</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Общее предложение:</span>
                <span className="font-semibold">{Number(tokenDetails.totalSupply).toLocaleString()} {tokenDetails.symbol}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">В обращении:</span>
                <span className="font-semibold">{Number(tokenDetails.circulationSupply).toLocaleString()} {tokenDetails.symbol}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Заблокировано:</span>
                <span className="font-semibold">{(Number(tokenDetails.totalSupply) - Number(tokenDetails.circulationSupply)).toLocaleString()} {tokenDetails.symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Процент в обращении:</span>
                <span className="font-semibold">{Math.round((Number(tokenDetails.circulationSupply) / Number(tokenDetails.totalSupply)) * 100)}%</span>
              </div>
            </div>
          </div>
          
          {/* Топ держателей */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Топ держателей</h3>
            <div className="space-y-4">
              {tokenDetails.topHolders.map((holder, index) => (
                <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600 truncate w-40 md:w-auto">{holder.address}</span>
                  <div className="text-right">
                    <span className="font-semibold block">{holder.amount.toLocaleString()} {tokenDetails.symbol}</span>
                    <span className="text-gray-500 text-sm">{holder.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-md">
            Купить {tokenDetails.symbol}
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md">
            Стейкинг {tokenDetails.symbol}
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-md">
            Посмотреть контракт
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default TokenDetail; 