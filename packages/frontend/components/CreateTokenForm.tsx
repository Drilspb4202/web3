import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

interface CreateTokenFormProps {
  onSubmit: (data: TokenFormData) => void;
  loading?: boolean;
}

export interface TokenFormData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  description: string;
  website: string;
  logoUrl: string;
  tokenType: 'standard' | 'governance' | 'asset-backed';
}

const CreateTokenForm = ({ onSubmit, loading = false }: CreateTokenFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<TokenFormData>({
    defaultValues: {
      name: '',
      symbol: '',
      decimals: 18,
      totalSupply: 100000,
      description: '',
      website: '',
      logoUrl: '',
      tokenType: 'standard'
    }
  });
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const logoUrlValue = watch('logoUrl');
  
  // Обработчик отправки формы
  const onFormSubmit = (data: TokenFormData) => {
    setIsSubmitting(true);
    onSubmit(data);
  };
  
  // Переходы между шагами
  const nextStep = () => setCurrentStep(prev => prev < 3 ? prev + 1 : prev);
  const prevStep = () => setCurrentStep(prev => prev > 1 ? prev - 1 : prev);
  
  // Обработка предпросмотра изображения
  useEffect(() => {
    if (logoUrlValue && logoUrlValue.match(/^(https?:\/\/)/)) {
      setPreviewImage(logoUrlValue);
    } else {
      setPreviewImage(null);
    }
  }, [logoUrlValue]);
  
  // Анимация для шагов формы
  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, 
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };
  
  // Компонент индикатора прогресса
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        {[1, 2, 3].map((step) => (
          <motion.div 
            key={step}
            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors
              ${currentStep === step 
                ? 'bg-primary-500 text-white shadow-lg' 
                : currentStep > step 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-500'}`}
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: currentStep === step ? 1 : 0.8,
              y: currentStep === step ? -5 : 0
            }}
            transition={{ duration: 0.3 }}
          >
            {currentStep > step ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              step
            )}
          </motion.div>
        ))}
      </div>
      <div className="relative w-full bg-gray-200 h-2 rounded-full">
        <motion.div 
          className="absolute top-0 left-0 h-2 rounded-full bg-primary-500"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span className={currentStep >= 1 ? 'text-primary-600 font-medium' : ''}>Основная информация</span>
        <span className={currentStep >= 2 ? 'text-primary-600 font-medium' : ''}>Дополнительные данные</span>
        <span className={currentStep >= 3 ? 'text-primary-600 font-medium' : ''}>Проверка</span>
      </div>
    </div>
  );

  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Создать новый токен</h2>
      <p className="text-gray-600 mb-6">
        Заполните форму ниже, чтобы создать свой собственный токен на блокчейне Avalanche
      </p>
      
      <ProgressIndicator />
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Шаг 1: Основная информация */}
        {currentStep === 1 && (
          <motion.div 
            key="step1"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Название токена*
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="Например: Chihuahua Coin"
                    {...register('name', { required: 'Название обязательно' })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-red-500 text-xs">{errors.name.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
                  Символ токена*
                </label>
                <div className="relative">
                  <input
                    id="symbol"
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.symbol ? 'border-red-500' : 'border-gray-300'} 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all uppercase`}
                    placeholder="Например: CHI"
                    maxLength={6}
                    {...register('symbol', { 
                      required: 'Символ обязателен',
                      maxLength: { value: 6, message: 'Максимальная длина - 6 символов' }
                    })}
                  />
                  {errors.symbol && (
                    <p className="mt-1 text-red-500 text-xs">{errors.symbol.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="decimals" className="block text-sm font-medium text-gray-700 mb-1">
                  Количество десятичных знаков*
                </label>
                <div className="relative">
                  <input
                    id="decimals"
                    type="number"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.decimals ? 'border-red-500' : 'border-gray-300'} 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    min={0}
                    max={18}
                    {...register('decimals', { 
                      required: 'Количество десятичных знаков обязательно',
                      min: { value: 0, message: 'Минимум 0' },
                      max: { value: 18, message: 'Максимум 18' }
                    })}
                  />
                  {errors.decimals && (
                    <p className="mt-1 text-red-500 text-xs">{errors.decimals.message}</p>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Стандартное значение - 18 (как у большинства токенов)</p>
              </div>
              
              <div>
                <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-700 mb-1">
                  Общее предложение*
                </label>
                <div className="relative">
                  <input
                    id="totalSupply"
                    type="number"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.totalSupply ? 'border-red-500' : 'border-gray-300'} 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    min={1}
                    {...register('totalSupply', { 
                      required: 'Общее предложение обязательно',
                      min: { value: 1, message: 'Минимум 1' }
                    })}
                  />
                  {errors.totalSupply && (
                    <p className="mt-1 text-red-500 text-xs">{errors.totalSupply.message}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Шаг 2: Дополнительная информация */}
        {currentStep === 2 && (
          <motion.div 
            key="step2"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Описание токена
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300'} 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    rows={4}
                    placeholder="Расскажите о своем токене..."
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-red-500 text-xs">{errors.description.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Веб-сайт
                </label>
                <div className="relative">
                  <input
                    id="website"
                    type="url"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.website ? 'border-red-500' : 'border-gray-300'} 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="https://example.com"
                    {...register('website', { 
                      pattern: { 
                        value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 
                        message: 'Некорректный URL' 
                      }
                    })}
                  />
                  {errors.website && (
                    <p className="mt-1 text-red-500 text-xs">{errors.website.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  URL логотипа
                </label>
                <div className="relative">
                  <input
                    id="logoUrl"
                    type="url"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.logoUrl ? 'border-red-500' : 'border-gray-300'} 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    placeholder="https://example.com/logo.png"
                    {...register('logoUrl', { 
                      pattern: { 
                        value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\.(png|jpg|jpeg|svg|webp))?$/, 
                        message: 'Некорректный URL изображения' 
                      }
                    })}
                  />
                  {errors.logoUrl && (
                    <p className="mt-1 text-red-500 text-xs">{errors.logoUrl.message}</p>
                  )}
                </div>
                
                {previewImage && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Предпросмотр логотипа:</p>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                      <Image
                        src={previewImage}
                        alt="Предпросмотр логотипа"
                        layout="fill"
                        objectFit="cover"
                        onError={() => setPreviewImage(null)}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="tokenType" className="block text-sm font-medium text-gray-700 mb-1">
                  Тип токена*
                </label>
                <div className="relative">
                  <select
                    id="tokenType"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.tokenType ? 'border-red-500' : 'border-gray-300'} 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    {...register('tokenType', { required: 'Тип токена обязателен' })}
                  >
                    <option value="standard">Стандартный</option>
                    <option value="governance">Управленческий</option>
                    <option value="asset-backed">Обеспеченный активами</option>
                  </select>
                  {errors.tokenType && (
                    <p className="mt-1 text-red-500 text-xs">{errors.tokenType.message}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Шаг 3: Проверка и отправка */}
        {currentStep === 3 && (
          <motion.div 
            key="step3"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Проверьте информацию о токене</h3>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Название токена</p>
                  <p className="font-medium">{watch('name') || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Символ токена</p>
                  <p className="font-medium uppercase">{watch('symbol') || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Десятичные знаки</p>
                  <p className="font-medium">{watch('decimals') || '18'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Общее предложение</p>
                  <p className="font-medium">{watch('totalSupply') || '0'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Тип токена</p>
                  <p className="font-medium">
                    {watch('tokenType') === 'standard' ? 'Стандартный' : 
                     watch('tokenType') === 'governance' ? 'Управленческий' : 
                     watch('tokenType') === 'asset-backed' ? 'Обеспеченный активами' : '-'}
                  </p>
                </div>
                
                {watch('description') && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Описание</p>
                    <p className="font-medium">{watch('description')}</p>
                  </div>
                )}
                
                {watch('website') && (
                  <div>
                    <p className="text-sm text-gray-500">Веб-сайт</p>
                    <p className="font-medium">{watch('website')}</p>
                  </div>
                )}
                
                {previewImage && (
                  <div>
                    <p className="text-sm text-gray-500">Логотип</p>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 mt-1">
                      <Image
                        src={previewImage}
                        alt="Логотип токена"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-gray-700">
                      Я согласен с <a href="#" className="text-primary-600 underline">условиями обслуживания</a> и подтверждаю, что информация верна
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Навигация по шагам */}
        <div className="flex justify-between pt-4 border-t border-gray-100 mt-6">
          <motion.button
            type="button"
            className={`px-5 py-2.5 rounded-lg text-gray-700 font-medium focus:outline-none 
              ${currentStep > 1 ? 'bg-gray-100 hover:bg-gray-200' : 'opacity-50 cursor-not-allowed bg-gray-100'}`}
            onClick={prevStep}
            disabled={currentStep === 1}
            whileHover={currentStep > 1 ? { scale: 1.02 } : {}}
            whileTap={currentStep > 1 ? { scale: 0.98 } : {}}
          >
            Назад
          </motion.button>
          
          {currentStep < 3 ? (
            <motion.button
              type="button"
              className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none"
              onClick={nextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Продолжить
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none flex items-center"
              disabled={loading || isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {(loading || isSubmitting) && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Создать токен
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default CreateTokenForm; 