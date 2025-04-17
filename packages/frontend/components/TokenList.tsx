import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTokenList } from '../hooks/useTokenList';
import { TokenBasicInfo } from '../hooks/useTokenDetails';
import TokenExchangeRates from './TokenExchangeRates';
import { Token } from '../types';
import { tokens as mockTokens } from '../data/mockData';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import { formatUsd } from '../utils/format';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import RefreshIcon from '@mui/icons-material/Refresh';

// Компонент для отображения карточки токена
const TokenCard = ({ token }: { token: TokenBasicInfo }) => {
  const [showRates, setShowRates] = useState(false);
  
  return (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <Link href={`/tokens/${token.symbol}`}>
        <div className="flex items-start">
          <div className="relative w-10 h-10 mr-4 bg-gray-100 rounded-full flex items-center justify-center">
            {token.logo ? (
              <Image 
                src={token.logo} 
                alt={token.symbol} 
                width={30} 
                height={30} 
                className="rounded-full"
              />
            ) : (
              <div className="text-lg font-bold text-gray-400">{token.symbol.charAt(0)}</div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{token.name} ({token.symbol})</h3>
                <p className="text-sm text-gray-500 mt-1 mb-2">
                  {token.description && token.description.length > 120 
                    ? `${token.description.substring(0, 120)}...` 
                    : token.description}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500 mr-1">Капитализация:</span>
                <span className="font-medium">{
                  Number(token.circulationSupply) >= 1000000 
                    ? `${(Number(token.circulationSupply) / 1000000).toFixed(2)}M ${token.symbol}`
                    : `${(Number(token.circulationSupply) / 1000).toFixed(2)}K ${token.symbol}`
                }</span>
              </div>
              
              <div>
                <span className="text-gray-500 mr-1">Создан:</span>
                <span className="font-medium">{token.createdAt.toLocaleDateString('ru-RU')}</span>
              </div>
              
              <div className="ml-auto flex items-center">
                <Link href={`/tokens/${token.symbol}`}>
                  <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                    Подробнее
                  </span>
                </Link>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                setShowRates(!showRates);
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {showRates ? 'Скрыть курсы' : 'Показать курсы валют'}
            </button>
            
            {showRates && (
              <div onClick={(e) => e.preventDefault()} className="mt-2">
                <TokenExchangeRates 
                  tokenSymbol={token.symbol} 
                  tokenPrice={10} // Примерная цена для демонстрации
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

// Набор валютных символов
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  RUB: '₽',
  CNY: '¥',
};

const FALLBACK_RATES = {
  "usd": 1,
  "eur": 0.93,
  "gbp": 0.79,
  "jpy": 154.45,
  "cny": 7.25,
  "rub": 92.50
};

const CURRENCY_NAMES = {
  "usd": "US Dollar",
  "eur": "Euro",
  "gbp": "British Pound",
  "jpy": "Japanese Yen", 
  "cny": "Chinese Yuan",
  "rub": "Russian Ruble"
};

const TokenList: React.FC = () => {
  const { tokens, loading, error } = useTokenList();
  const [page, setPage] = useState(1);
  const tokensPerPage = 5;
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [showRates, setShowRates] = useState<boolean>(true);
  
  // Расчет страниц для пагинации
  const totalPages = Math.ceil(tokens.length / tokensPerPage);
  const startIndex = (page - 1) * tokensPerPage;
  const endIndex = startIndex + tokensPerPage;
  const currentTokens = tokens.slice(startIndex, endIndex);
  
  const fetchExchangeRates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      console.log('Exchange rates data:', data);
      
      // Filter only the currencies we're interested in
      const filteredRates: Record<string, number> = {
        usd: 1, // Base currency
        eur: data.rates.EUR || FALLBACK_RATES.eur,
        gbp: data.rates.GBP || FALLBACK_RATES.gbp,
        jpy: data.rates.JPY || FALLBACK_RATES.jpy,
        cny: data.rates.CNY || FALLBACK_RATES.cny,
        rub: data.rates.RUB || FALLBACK_RATES.rub
      };
      
      setExchangeRates(filteredRates);
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      setError('Failed to fetch exchange rates. Using fallback values.');
      // Keep using fallback rates
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchExchangeRates();
  }, []);
  
  const formatCurrency = (usdValue: number, currencyCode: string): string => {
    const rate = exchangeRates[currencyCode] || 1;
    const value = usdValue * rate;
    
    // Format based on currency
    switch(currencyCode) {
      case 'jpy':
        return `¥${Math.round(value)}`;
      case 'eur':
        return `€${value.toFixed(2)}`;
      case 'gbp':
        return `£${value.toFixed(2)}`;
      case 'cny':
        return `¥${value.toFixed(2)}`;
      case 'rub':
        return `₽${value.toFixed(2)}`;
      default:
        return `$${value.toFixed(2)}`;
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Токены МСП</h2>
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse p-4 border-b border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Токены МСП</h2>
          <p className="text-sm text-red-500">Ошибка загрузки данных: {error.message}</p>
        </div>
      </div>
    );
  }
  
  if (tokens.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Токены МСП</h2>
          <p className="text-sm text-gray-500">Пока нет созданных токенов</p>
        </div>
        <div className="p-4">
          <p className="text-center text-gray-500">
            Создайте свой первый токен, используя форму "Создать токен"
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Currency Exchange Rates Section */}
      <Card className="bg-gradient-card mb-8 animated-gradient">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2" color="white" fontWeight="bold">
              <CurrencyExchangeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Exchange Rates
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="small" 
              onClick={() => fetchExchangeRates()}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Refresh Rates'}
            </Button>
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress color="inherit" />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {Object.entries(exchangeRates).map(([currency, rate]) => (
                <Grid item xs={6} sm={4} md={2} key={currency}>
                  <Card className="currency-card">
                    <Typography className="currency-symbol" gutterBottom>
                      {currency.toUpperCase()}
                    </Typography>
                    <Typography className="currency-value">
                      {currency === 'usd' ? '1.00' : rate.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {CURRENCY_NAMES[currency as keyof typeof CURRENCY_NAMES]}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Tokens List */}
      <Typography variant="h4" component="h1" className="section-title" sx={{ mt: 4, mb: 3 }}>
        Available Tokens
      </Typography>
      
      <Grid container spacing={3}>
        {tokens.map((token) => (
          <Grid item xs={12} sm={6} md={4} key={token.id}>
            <Card sx={{ height: '100%' }} className="MuiCard-root">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {token.logoURI && (
                    <Box mr={2}>
                      <Image
                        src={token.logoURI}
                        alt={token.name}
                        width={40}
                        height={40}
                        loading="lazy"
                        fetchPriority="low"
                        style={{
                          borderRadius: '50%',
                        }}
                      />
                    </Box>
                  )}
                  <Box>
                    <Typography variant="h6" component="div">
                      {token.name}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {token.symbol}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Price
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatUsd(token.price)}
                  </Typography>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={1}>
                  {Object.keys(exchangeRates).slice(1).map((currency) => (
                    <Chip 
                      key={currency}
                      label={`${formatCurrency(token.price, currency)}`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>

                <Box mt={2}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    className="btn-primary"
                  >
                    Trade {token.symbol}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="warning" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex justify-center mt-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded ${
                page === 1 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              Назад
            </button>
            
            <div className="px-3 py-1 bg-gray-100 rounded">
              {page} из {totalPages}
            </div>
            
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded ${
                page === totalPages 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TokenList;