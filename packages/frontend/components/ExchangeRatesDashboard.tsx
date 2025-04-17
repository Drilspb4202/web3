import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grid, CircularProgress, Alert, Divider, Tabs, Tab, Chip, IconButton, Button } from '@mui/material';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchExchangeRates } from '../lib/exchange-rates';

// Основные валюты для отображения на дашборде
const MAIN_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'RUB', 'CNY'];

// Все доступные криптовалюты
const ALL_CRYPTO_CURRENCIES = [
  'BTC', 'ETH', 'AVAX', 
  'BNB', 'SOL', 'XRP', 
  'ADA', 'DOT', 'MATIC', 
  'LINK', 'LTC', 'DOGE'
];

// Словарь символов валют
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  CNY: '¥',
  RUB: '₽',
  BTC: '₿',
  ETH: 'Ξ',
  AVAX: 'AVAX',
  BNB: 'BNB',
  SOL: 'SOL',
  XRP: 'XRP',
  ADA: 'ADA',
  DOT: 'DOT',
  MATIC: 'MATIC',
  LINK: 'LINK',
  LTC: 'LTC',
  DOGE: 'DOGE'
};

// Форматирование валюты в зависимости от её размера
const formatCurrency = (price: number, currency: string): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || '';
  
  if (price < 0.0001) {
    return `${symbol}${price.toExponential(2)}`;
  } else if (price < 0.01) {
    return `${symbol}${price.toFixed(6)}`;
  } else if (price < 1) {
    return `${symbol}${price.toFixed(4)}`;
  } else if (price < 10000) {
    return `${symbol}${price.toFixed(2)}`;
  } else {
    return `${symbol}${Math.round(price).toLocaleString()}`;
  }
};

// Тип для вкладок дашборда
type TabType = 'fiat' | 'crypto';

/**
 * Компонент для отображения курсов валют на главной странице
 */
export default function ExchangeRatesDashboard() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<TabType>('fiat');
  const [selectedCryptos, setSelectedCryptos] = useState<string[]>(['BTC', 'ETH', 'AVAX']);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Загрузка курсов валют при монтировании компонента
  useEffect(() => {
    loadExchangeRates();
    
    // Обновление курсов каждые 5 минут
    const interval = setInterval(() => {
      loadExchangeRates();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Функция для загрузки обменных курсов
  const loadExchangeRates = async () => {
    try {
      setLoading(true);
      const exchangeRates = await fetchExchangeRates('USD');
      
      // Добавляем USD с курсом 1, так как это базовая валюта
      setRates({ ...exchangeRates, USD: 1 });
      
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке курсов валют:', err);
      setError('Не удалось загрузить курсы валют. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  // Обработчик изменения вкладки
  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabType) => {
    setCurrentTab(newValue);
  };

  // Переключение настроек
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Выбор криптовалюты
  const toggleCrypto = (crypto: string) => {
    setSelectedCryptos(prev => {
      if (prev.includes(crypto)) {
        return prev.filter(item => item !== crypto);
      } else {
        if (prev.length < 8) { // Ограничиваем максимальное количество выбранных криптовалют
          return [...prev, crypto];
        }
        return prev;
      }
    });
  };

  // Если данные загружаются (первый раз), показываем индикатор загрузки
  if (loading && Object.keys(rates).length === 0) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Загрузка курсов валют...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Если возникла ошибка, показываем сообщение об ошибке
  if (error) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <CurrencyExchangeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Текущие курсы валют
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              {lastUpdated && (
                <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                  Обновлено: {lastUpdated} {loading && '(обновляется...)'}
                </Typography>
              )}
              <IconButton size="small" onClick={toggleSettings} color={showSettings ? "primary" : "default"}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />
          
          {/* Настройки для криптовалют */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box mb={2} p={2} bgcolor="rgba(0,0,0,0.02)" borderRadius={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Выберите криптовалюты для отображения:
                    </Typography>
                    <IconButton size="small" onClick={toggleSettings}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {ALL_CRYPTO_CURRENCIES.map((crypto) => (
                      <Chip
                        key={crypto}
                        label={crypto}
                        onClick={() => toggleCrypto(crypto)}
                        color={selectedCryptos.includes(crypto) ? "primary" : "default"}
                        variant={selectedCryptos.includes(crypto) ? "filled" : "outlined"}
                        size="small"
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Можно выбрать до 8 криптовалют
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Вкладки для переключения между фиатными и криптовалютами */}
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            sx={{ mb: 2 }}
            variant="fullWidth"
          >
            <Tab label="Фиатные валюты" value="fiat" />
            <Tab label="Криптовалюты" value="crypto" />
          </Tabs>
          
          {/* Фиатные валюты */}
          {currentTab === 'fiat' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Grid container spacing={2}>
                {MAIN_CURRENCIES.map((currency) => {
                  const rate = rates[currency] || 0;
                  
                  return (
                    <Grid item xs={6} sm={4} md={2.4} key={currency}>
                      <motion.div
                        whileHover={{ translateY: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Box sx={{ 
                          p: 2, 
                          border: '1px solid', 
                          borderColor: 'divider', 
                          borderRadius: 1,
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            borderColor: 'primary.main'
                          }
                        }}>
                          <Typography variant="h6" color="text.primary">
                            {formatCurrency(rate, currency)}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            {currency}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            </motion.div>
          )}
          
          {/* Криптовалюты */}
          {currentTab === 'crypto' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Grid container spacing={2}>
                {selectedCryptos.map((currency) => {
                  // Нам нужна обратная конвертация для крипты (сколько USD в криптовалюте, а не наоборот)
                  const rate = rates[currency] ? 1 / rates[currency] : 0;
                  
                  return (
                    <Grid item xs={6} sm={4} md={3} key={currency}>
                      <motion.div
                        whileHover={{ translateY: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Box sx={{ 
                          p: 2, 
                          border: '1px solid', 
                          borderColor: 'divider', 
                          borderRadius: 1,
                          bgcolor: 'rgba(0, 0, 0, 0.02)',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            borderColor: 'primary.main'
                          }
                        }}>
                          <Typography variant="h6" color="text.primary">
                            {formatCurrency(rate, currency)}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            {currency}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            1 {currency} = {formatCurrency(rates[currency] || 0, 'USD')}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  );
                })}
                
                {selectedCryptos.length === 0 && (
                  <Grid item xs={12}>
                    <Box 
                      p={4} 
                      textAlign="center" 
                      bgcolor="rgba(0,0,0,0.02)" 
                      borderRadius={1}
                    >
                      <Typography color="text.secondary">
                        Выберите криптовалюты в настройках для отображения
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ mt: 2 }}
                        onClick={toggleSettings}
                      >
                        Открыть настройки
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 