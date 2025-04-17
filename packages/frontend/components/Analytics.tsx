import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, Tab, Box, Paper, Grid, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import TradingVolumeChart from './analytics/TradingVolumeChart';
import StakingAPRChart from './analytics/StakingAPRChart';
import PopularTokensChart from './analytics/PopularTokensChart';
import MarketCapChart from './analytics/MarketCapChart';
import StatisticsSummary from './analytics/StatisticsSummary';
import ExchangeRatesDashboard from './ExchangeRatesDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Analytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('30д');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Аналитика платформы</h1>
          
          <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
            <InputLabel>Период</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Период"
            >
              <MenuItem value="7д">7 дней</MenuItem>
              <MenuItem value="30д">30 дней</MenuItem>
              <MenuItem value="90д">90 дней</MenuItem>
              <MenuItem value="1г">1 год</MenuItem>
              <MenuItem value="все">Всё время</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Суммарная статистика */}
        <div className="mb-8">
          <StatisticsSummary />
        </div>

        <Paper elevation={0} sx={{ mb: 5, borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 3,
                },
              }}
            >
              <Tab label="Обзор" />
              <Tab label="Торги" />
              <Tab label="Стейкинг" />
              <Tab label="Токены" />
              <Tab label="Рыночная капитализация" />
              <Tab label="Курсы валют" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TradingVolumeChart />
              </Grid>
              <Grid item xs={12} md={6}>
                <StakingAPRChart />
              </Grid>
              <Grid item xs={12} md={6}>
                <PopularTokensChart />
              </Grid>
              <Grid item xs={12} md={6}>
                <MarketCapChart />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                Детальный анализ торгов
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Анализ объема торгов и активности по всем токенам на платформе за выбранный период
              </Typography>
            </Box>
            <TradingVolumeChart />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                Показатели стейкинга
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Анализ показателей APR и общего объема стейкинга по токенам
              </Typography>
            </Box>
            <StakingAPRChart />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                Популярные токены
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Анализ наиболее популярных токенов на платформе по объему торгов
              </Typography>
            </Box>
            <PopularTokensChart />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                Рыночная капитализация
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Аналитика рыночной капитализации токенов на платформе
              </Typography>
            </Box>
            <MarketCapChart />
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Box mb={4}>
              <Typography variant="h6" gutterBottom>
                Курсы валют и криптовалют
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Актуальные курсы фиатных валют и криптовалют
              </Typography>
            </Box>
            <ExchangeRatesDashboard />
          </TabPanel>
        </Paper>
      </motion.div>
    </div>
  );
};

export default Analytics; 