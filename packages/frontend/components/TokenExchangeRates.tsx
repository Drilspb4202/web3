import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grid, CircularProgress, Alert, Divider, IconButton, Collapse } from '@mui/material';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { fetchExchangeRates } from '../lib/exchange-rates';

// Интерфейс для ответа API с курсами валют
interface ExchangeRatesResponse {
  rates: Record<string, number>;
  timestamp: number;
}

interface TokenExchangeRatesProps {
  tokenId?: string;
  tokenSymbol: string;
  tokenPrice: number;
}

// Константа со списком валют для отображения
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'RUB', 'BTC', 'ETH'];

// Словарь с символами валют
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
};

/**
 * Компонент для отображения курсов обмена токена на разные валюты
 */
export default function TokenExchangeRates({ tokenId = '', tokenSymbol, tokenPrice }: TokenExchangeRatesProps) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  
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

  // Загрузка курсов валют при монтировании компонента
  useEffect(() => {
    loadExchangeRates();
  }, [tokenId, tokenSymbol]);

  // Функция для загрузки обменных курсов
  const loadExchangeRates = async () => {
    if (!tokenSymbol) {
      setError('Требуется символ токена');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const exchangeRates = await fetchExchangeRates('USD');
      setRates(exchangeRates);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке курсов валют:', err);
      setError('Не удалось загрузить курсы валют. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  // Переключение видимости компонента
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={2}>
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
      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 3, mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <CurrencyExchangeIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Курсы валют для {tokenSymbol}
            </Typography>
          </Box>
          <IconButton onClick={toggleVisibility} size="small">
            {isVisible ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Collapse in={isVisible}>
          <Grid container spacing={2}>
            {CURRENCIES.map((currency) => {
              // Пропускаем базовую валюту токена
              if (currency === tokenSymbol) return null;
              
              // Вычисляем обменный курс
              const exchangeRate = rates[currency] || 1;
              const tokenValue = tokenPrice * exchangeRate;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={currency}>
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    '&:hover': {
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      borderColor: 'primary.main'
                    }
                  }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      1 {tokenSymbol} =
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(tokenValue, currency)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {currency}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
} 