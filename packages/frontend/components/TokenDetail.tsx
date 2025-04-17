import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Stack, Chip, Paper, Divider, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TokenExchangeRates from './TokenExchangeRates';
import { useRouter } from 'next/router';
import { Token } from '../types';
import { tokens } from '../data/mockData';
import TokenChart from './TokenChart';
import TokenPrice from './TokenPrice';

// Тип для курсов валют
interface ExchangeRates {
  [key: string]: number;
}

// Набор символов валют для отображения
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  RUB: '₽',
  CNY: '¥',
  BTC: '₿',
  ETH: 'Ξ'
};

const TokenDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [rates, setRates] = useState<ExchangeRates>({});
  const [ratesLoading, setRatesLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (id) {
      // В реальном приложении здесь был бы API-запрос
      const foundToken = tokens.find(t => t.id === id);
      
      if (foundToken) {
        setToken(foundToken);
        
        // Проверяем, добавлен ли токен в избранное
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorite(favorites.includes(foundToken.id));
        
        // Загрузка курсов валют
        fetchExchangeRates(foundToken.symbol, foundToken.price);
      }
      
      setLoading(false);
    }
  }, [id]);
  
  // Функция для загрузки курсов валют
  const fetchExchangeRates = async (symbol: string, price: number) => {
    try {
      setRatesLoading(true);
      const response = await fetch(`/api/exchange-rates?base=${symbol}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      
      if (data.rates) {
        setRates(data.rates);
      } else {
        // Используем запасные данные
        setRates({
          USD: price,
          EUR: price * 0.92,
          RUB: price * 90.5,
          JPY: price * 150.2,
          CNY: price * 7.1,
          GBP: price * 0.79,
          BTC: price * 0.000016,
          ETH: price * 0.00031
        });
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Используем запасные данные
      setRates({
        USD: price,
        EUR: price * 0.92,
        RUB: price * 90.5,
        JPY: price * 150.2,
        CNY: price * 7.1,
        GBP: price * 0.79,
        BTC: price * 0.000016,
        ETH: price * 0.00031
      });
    } finally {
      setRatesLoading(false);
    }
  };
  
  const handleBack = () => {
    router.push('/');
  };
  
  const handleShare = () => {
    if (navigator.share && token) {
      navigator.share({
        title: `${token.name} (${token.symbol})`,
        text: `Взгляните на информацию о токене ${token.name}`,
        url: window.location.href,
      }).catch(error => {
        console.log('Ошибка при попытке поделиться:', error);
      });
    } else {
      // Копирование URL в буфер обмена, если Web Share API недоступен
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };
  
  const toggleFavorite = () => {
    if (!token) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favorite) {
      const newFavorites = favorites.filter((id: string) => id !== token.id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } else {
      favorites.push(token.id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    setFavorite(!favorite);
  };
  
  // Форматирование цены с символом валюты
  const formatPrice = (price: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency] || '';
    
    if (currency === 'BTC' || currency === 'ETH') {
      return `${price.toFixed(8)} ${symbol}`;
    }
    
    if (currency === 'JPY' || currency === 'RUB') {
      return `${Math.round(price)} ${symbol}`;
    }
    
    if (price >= 1000) {
      return `${symbol}${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    
    return `${symbol}${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (!token) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h5" color="error">Токен не найден</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Верхняя панель с кнопками навигации */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={handleBack}
        >
          Назад
        </Button>
        
        <Stack direction="row" spacing={2}>
          <Button 
            startIcon={<ShareIcon />}
            variant="outlined"
            onClick={handleShare}
          >
            Поделиться
          </Button>
          
          <Button 
            startIcon={favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            variant={favorite ? "contained" : "outlined"}
            color={favorite ? "error" : "primary"}
            onClick={toggleFavorite}
          >
            {favorite ? 'В избранном' : 'В избранное'}
          </Button>
        </Stack>
      </Box>
      
      {/* Информация о токене */}
      <Grid container spacing={3}>
        {/* Левая колонка - Основная информация */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  component="img"
                  src={token.logo} 
                  alt={token.name}
                  sx={{ width: 48, height: 48, mr: 2, borderRadius: '50%' }}
                />
                
                <Box>
                  <Typography variant="h4" component="h1">
                    {token.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label={token.symbol} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    
                    <TokenPrice 
                      price={token.price} 
                      change={token.priceChange24h} 
                    />
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Рыночная капитализация
                    </Typography>
                    <Typography variant="h6">
                      ${(token.price * token.totalSupply).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Объем (24ч)
                    </Typography>
                    <Typography variant="h6">
                      ${token.volume24h.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Общее предложение
                    </Typography>
                    <Typography variant="h6">
                      {token.totalSupply.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Доходность (годовая)
                    </Typography>
                    <Typography variant="h6" color={token.apy > 0 ? 'success.main' : 'text.primary'}>
                      {token.apy}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* График */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                История цены
              </Typography>
              <TokenChart tokenId={token.id} />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Правая колонка - Курсы обмена и другая информация */}
        <Grid item xs={12} md={4}>
          {/* Курсы обмена */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Курсы обмена
                </Typography>
              </Box>
              
              {ratesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    1 {token.symbol} =
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {Object.keys(rates).map(currency => {
                      if (currency === token.symbol) return null;
                      
                      return (
                        <Grid item xs={6} key={currency}>
                          <Box 
                            sx={{ 
                              p: 1.5, 
                              textAlign: 'center',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              bgcolor: 'background.paper',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <Typography variant="body1" noWrap>
                              {formatPrice(rates[currency], currency)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {currency}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Описание */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                О токене
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {token.description}
              </Typography>
              
              {token.website && (
                <Button 
                  variant="outlined" 
                  size="small"
                  href={token.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mr: 1, mt: 1 }}
                >
                  Веб-сайт
                </Button>
              )}
              
              {token.whitepaper && (
                <Button 
                  variant="outlined" 
                  size="small"
                  href={token.whitepaper}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 1 }}
                >
                  Whitepaper
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TokenDetail; 