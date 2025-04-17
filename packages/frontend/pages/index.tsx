import { useAccount } from 'wagmi';
import Layout from '@/components/Layout';
import WalletConnector from '@/components/WalletConnector';
import TokenList from '@/components/TokenList';
import ExchangeRatesDashboard from '@/components/ExchangeRatesDashboard';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Главная страница приложения
export default function Home() {
  const { isConnected } = useAccount();
  const [scrollY, setScrollY] = useState(0);

  // Эффект для отслеживания прокрутки
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Варианты анимации
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <Layout>
      <Head>
        <title>Chihuahua Capital</title>
        <meta name="description" content="Децентрализованная платформа для токенизации активов малого и среднего бизнеса на блокчейне Avalanche" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Главный баннер */}
      <motion.section 
        className="mb-12 relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Image 
            src="/images/avalanche-avax-logo.svg" 
            alt="Background" 
            layout="fill" 
            objectFit="contain"
          />
        </div>
        
        <div className="bg-gradient-to-r from-primary-700 to-secondary-600 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 sm:py-20 lg:py-24 max-w-4xl relative z-10">
            <motion.h2 
              className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="block mb-2">Откройте мир <span className="text-yellow-300">токенизации</span></span>
              <span className="block">активов для бизнеса</span>
            </motion.h2>
            
            <motion.p 
              className="mt-6 text-xl text-white text-opacity-90 max-w-3xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Chihuahua Capital позволяет малому и среднему бизнесу создавать, управлять и торговать токенами на блокчейне Avalanche быстро, безопасно и с минимальными затратами.
            </motion.p>
            
            <motion.div 
              className="mt-10 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/create-token" className="btn-primary px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Создать свой токен
              </Link>
              <Link href="/marketplace" className="btn-outline bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:border-white px-8 py-4 text-lg font-medium">
                Маркетплейс токенов
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Дашборд курсов валют */}
      <ExchangeRatesDashboard />

      {/* Статистика платформы */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-md">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-1">150+</div>
            <div className="text-sm text-gray-600">Активных токенов</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-1">₽12M+</div>
            <div className="text-sm text-gray-600">Токенизировано</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-1">2,500+</div>
            <div className="text-sm text-gray-600">Пользователей</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-1">5,000+</div>
            <div className="text-sm text-gray-600">Транзакций</div>
          </div>
        </div>
      </motion.section>

      {/* Подключение кошелька */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 section-title">Подключите кошелек</h2>
            <WalletConnector />
          </div>
        </div>
      </motion.section>

      {/* Список токенов для авторизованных пользователей */}
      {isConnected && (
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 section-title">Ваши токены</h2>
              <TokenList />
            </div>
          </div>
        </motion.section>
      )}

      {/* Преимущества платформы */}
      <motion.section 
        className="mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 section-title">Преимущества платформы</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Быстрый деплой</h3>
            <p className="text-gray-600">Создавайте собственные токены МСП за считанные минуты без знания программирования.</p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Низкие комиссии</h3>
            <p className="text-gray-600">Благодаря использованию Avalanche, комиссии за транзакции минимальны и доступны для бизнеса любого размера.</p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Безопасность</h3>
            <p className="text-gray-600">Смарт-контракты проходят аудит безопасности и используют проверенные стандарты токенизации.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Как это работает */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 section-title">Как это работает</h2>
        <div className="bg-white p-8 rounded-xl shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-50 rounded-full -ml-32 -mb-32 opacity-30"></div>
          
          <div className="relative z-10">
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { step: 1, title: "Подключите кошелек", desc: "Используйте MetaMask настроенный на сеть Avalanche Fuji Testnet." },
                { step: 2, title: "Создайте токен", desc: "Заполните форму с параметрами вашего бизнес-токена." },
                { step: 3, title: "Оплатите комиссию", desc: "Отправьте транзакцию создания токена." },
                { step: 4, title: "Получите адрес", desc: "После подтверждения вы получите адрес токена." },
                { step: 5, title: "Используйте токен", desc: "Представляйте доли в бизнесе или программы лояльности." }
              ].map((item) => (
                <motion.div 
                  key={item.step}
                  className="flex flex-col items-center text-center p-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: item.step * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 shadow-md">
                    {item.step}
                  </div>
                  <div className="h-px w-full bg-gray-200 absolute top-1/2 left-0 -z-10 hidden md:block"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Призыв к действию */}
      <motion.section 
        className="mt-16 mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="bg-gradient-to-r from-primary-700 to-secondary-600 rounded-xl p-10 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">Готовы начать?</h2>
            <p className="text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к Chihuahua Capital уже сегодня и откройте новые возможности для развития вашего бизнеса через токенизацию.
            </p>
            <Link href="/create-token" className="btn-secondary bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Создать токен
            </Link>
          </div>
          <div className="absolute top-0 right-0 opacity-10">
            <svg width="320" height="320" viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg">
              <path d="M175 0L350 175L175 350L0 175L175 0Z" fill="#FFFFFF"/>
            </svg>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
} 