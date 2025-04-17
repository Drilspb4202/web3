import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  UsersIcon, 
  CubeIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon 
} from '@heroicons/react/outline';

interface StatisticItem {
  label: string;
  value: string;
  description?: string;
  icon?: 'users' | 'tokens' | 'staking' | 'trades';
  change?: {
    value: string;
    isPositive: boolean;
  };
}

interface StatisticsSummaryProps {
  statistics?: StatisticItem[];
}

// Получение иконки по типу
const getIconComponent = (iconType?: string) => {
  switch (iconType) {
    case 'users':
      return <UsersIcon className="h-6 w-6 text-blue-500" />;
    case 'tokens':
      return <CubeIcon className="h-6 w-6 text-purple-500" />;
    case 'staking':
      return <CurrencyDollarIcon className="h-6 w-6 text-green-500" />;
    case 'trades':
      return <ChartBarIcon className="h-6 w-6 text-yellow-500" />;
    default:
      return <ChartBarIcon className="h-6 w-6 text-gray-500" />;
  }
};

const StatisticsSummary: React.FC<StatisticsSummaryProps> = ({ 
  statistics = [
    {
      label: 'Всего токенов',
      value: '120',
      description: 'Количество токенов на платформе',
      icon: 'tokens',
      change: {
        value: '+8% за 30 дней',
        isPositive: true
      }
    },
    {
      label: 'Всего пользователей',
      value: '28,347',
      description: 'Количество кошельков',
      icon: 'users',
      change: {
        value: '+12% за 30 дней',
        isPositive: true
      }
    },
    {
      label: 'Объем стейкинга',
      value: '1,432,891 CHIH',
      description: 'Размер заблокированных токенов',
      icon: 'staking',
      change: {
        value: '+5% за 30 дней',
        isPositive: true
      }
    },
    {
      label: 'Активных сделок',
      value: '243',
      description: 'Количество активных сделок',
      icon: 'trades',
      change: {
        value: '-3% за 7 дней',
        isPositive: false
      }
    }
  ]
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statistics.map((stat, index) => (
        <motion.div 
          key={index} 
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                {getIconComponent(stat.icon)}
              </div>
              
              {stat.change && (
                <motion.div 
                  className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    stat.change.isPositive 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {stat.change.isPositive 
                    ? <TrendingUpIcon className="h-3 w-3 mr-1" /> 
                    : <TrendingDownIcon className="h-3 w-3 mr-1" />
                  }
                  {stat.change.value}
                </motion.div>
              )}
            </div>
            
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-gray-700 mb-1">{stat.label}</p>
            
            {stat.description && (
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatisticsSummary; 