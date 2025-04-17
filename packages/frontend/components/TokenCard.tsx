import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Grid, 
  Tooltip, 
  LinearProgress,
  IconButton
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { Token } from '../types';

interface TokenCardProps {
  token: Token;
}

const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/tokens/${token.symbol.toLowerCase()}`);
  };
  
  // Форматирование цены с учетом размера числа
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      })}`;
    } else {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6
      })}`;
    }
  };
  
  // Форматирование процентного изменения
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };
  
  // Определение цвета для процентного изменения
  const getChangeColor = (change: number) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };

  // Расчет процента заполнения на основе объема торгов
  const getVolumePercentage = (volume: number) => {
    const max = 10000000; // предполагаемый максимум объема
    const percentage = Math.min((volume / max) * 100, 100);
    return percentage;
  };

  // Определение цвета для объема торгов
  const getVolumeColor = (volume: number) => {
    if (volume > 1000000) return 'success';
    if (volume > 500000) return 'info';
    return 'warning';
  };

  // Форматирование капитализации
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(2)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(2)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    } else {
      return `$${marketCap}`;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 30px rgba(0, 0, 0, 0.1)'
        }
      }}
      onClick={handleClick}
      className="token-card"
    >
      {/* Градиентная полоса сверху карточки */}
      <Box 
        sx={{ 
          height: '6px',
          background: token.priceChange24h >= 0 
            ? 'linear-gradient(90deg, #38b2ac, #4fd1c5)' 
            : 'linear-gradient(90deg, #f56565, #fc8181)' 
        }}
      />
      
      <CardContent>
        {/* Шапка карточки с логотипом и основной информацией */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              position: 'relative',
              width: 50, 
              height: 50, 
              borderRadius: '50%',
              overflow: 'hidden',
              mr: 1.5,
              boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
            }}
          >
            {token.logoURI ? (
              <Image
                src={token.logoURI}
                alt={token.name}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
                  color: 'white'
                }}
              >
                {token.symbol.substring(0, 2)}
              </Box>
            )}
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                {token.name}
              </Typography>
              <IconButton size="small" sx={{ ml: 1 }}>
                <StarOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={token.symbol} 
                size="small" 
                sx={{ 
                  mr: 1,
                  background: 'rgba(0, 149, 255, 0.1)',
                  color: 'primary.main',
                  fontWeight: 'bold'
                }} 
              />
              {token.chain && (
                <Chip 
                  label={token.chain} 
                  size="small" 
                  sx={{ 
                    fontSize: '0.7rem',
                    background: 'rgba(0, 0, 0, 0.05)',
                    color: 'text.secondary'
                  }} 
                />
              )}
            </Box>
          </Box>
        </Box>
        
        {/* Блок с ценой и изменениями */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between',
            mb: 2,
            pb: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Цена
            </Typography>
            <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>
              {formatPrice(token.price)}
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              p: 0.75,
              borderRadius: '8px', 
              backgroundColor: token.priceChange24h >= 0 
                ? 'rgba(56, 178, 172, 0.1)' 
                : 'rgba(245, 101, 101, 0.1)',
              color: getChangeColor(token.priceChange24h)
            }}
          >
            {token.priceChange24h >= 0 ? (
              <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
            ) : (
              <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
            )}
            <Typography 
              variant="body2" 
              component="span" 
              sx={{ fontWeight: 'bold' }}
            >
              {formatChange(token.priceChange24h)}
            </Typography>
          </Box>
        </Box>
        
        {/* Сетка с дополнительной информацией */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Tooltip title="Рыночная капитализация токена" arrow>
              <Box>
                <Typography 
                  variant="caption" 
                  component="div" 
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  Капитализация
                  <InfoOutlinedIcon sx={{ ml: 0.5, fontSize: '0.875rem' }} />
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatMarketCap(token.marketCap)}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          
          <Grid item xs={6}>
            <Tooltip title="Объем торгов за последние 24 часа" arrow>
              <Box>
                <Typography 
                  variant="caption" 
                  component="div" 
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  Объем (24ч)
                  <InfoOutlinedIcon sx={{ ml: 0.5, fontSize: '0.875rem' }} />
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatMarketCap(token.volume24h)}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
        
        {/* Индикатор активности торгов */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Активность торгов
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getVolumePercentage(token.volume24h).toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getVolumePercentage(token.volume24h)} 
            color={getVolumeColor(token.volume24h)}
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.04)'
            }}
          />
        </Box>
        
        {/* Краткое описание */}
        {token.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              height: '40px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {token.description}
          </Typography>
        )}
        
        {/* Кнопка действия */}
        <Box 
          sx={{ 
            mt: 1,
            p: 1.5,
            backgroundColor: 'rgba(0, 149, 255, 0.05)',
            borderRadius: '8px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(0, 149, 255, 0.1)',
            }
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Подробности о токене {token.symbol}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenCard; 