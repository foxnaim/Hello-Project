"use client";
import React from 'react';
import { Container, Typography, Button, TextField, Box, Paper, IconButton, useTheme as useMuiTheme, Snackbar, Alert, Fade, ThemeProvider, createTheme, CircularProgress, Tooltip, Zoom, Badge, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useState, useEffect, useCallback, useMemo, memo, useRef, KeyboardEvent, Suspense, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import AnimatedBackground from '../components/AnimatedBackground';
import useSound from 'use-sound';
import { Settings as SettingsIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';

// Динамический импорт компонентов с отключенным SSR
const DynamicAnimatedBackground = dynamic(() => import('../components/AnimatedBackground'), {
  ssr: false,
});

// Компонент для обработки ошибок
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 4,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Что-то пошло не так 😕
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {this.state.error?.message || 'Произошла непредвиденная ошибка'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Перезагрузить страницу
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Мемоизированные компоненты с React.memo
const LoadingSpinner = memo(() => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CircularProgress size={20} thickness={4} />
    <Typography>Отправка...</Typography>
  </Box>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Оптимизированный компонент формы
const FormContent = memo(({ 
  name, 
  setName, 
  error, 
  isLoading, 
  handleSubmit 
}: { 
  name: string;
  setName: (name: string) => void;
  error: string;
  isLoading: boolean;
  handleSubmit: () => void;
}) => {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, [setName]);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  }, [handleSubmit, isLoading]);

  const animationProps = useMemo(() => ({
    initial: prefersReducedMotion ? undefined : { opacity: 0, x: -20 },
    animate: prefersReducedMotion ? undefined : { opacity: 1, x: 0 },
    exit: prefersReducedMotion ? undefined : { opacity: 0, x: 20 },
    transition: { duration: 0.3 }
  }), [prefersReducedMotion]);

  // Фокус на поле ввода при монтировании
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <motion.div {...animationProps}>
      <Box 
        component="form" 
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        sx={{
          '& .MuiTextField-root': {
            mb: 3,
          },
        }}
      >
        <TextField
          inputRef={inputRef}
          fullWidth
          label="Введите ваше имя"
          variant="outlined"
          value={name}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          error={!!error}
          helperText={error}
          disabled={isLoading}
          autoComplete="name"
          aria-label="Введите ваше имя"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s ease',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              '&:hover': {
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-focused': {
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
              transition: 'all 0.3s ease',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              borderWidth: '2px',
            },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
              boxShadow: '0 0 0 4px rgba(144, 202, 249, 0.1)',
            },
            '& .MuiInputLabel-root': {
              transition: 'all 0.3s ease',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'primary.main',
              fontWeight: 'bold',
            },
          }}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          disabled={isLoading}
          aria-label="Отправить форму"
          sx={{ 
            height: 56,
            borderRadius: 2,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            textTransform: 'none',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            background: theme === 'dark' 
              ? 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)'
              : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
              '&::after': {
                transform: 'translateX(100%)',
              },
            },
            '&:active': {
              transform: 'translateY(1px)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transform: 'translateX(-100%)',
              transition: 'transform 0.5s ease',
            },
            '&.Mui-disabled': {
              background: theme === 'dark' 
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {isLoading ? <LoadingSpinner /> : 'Отправить'}
        </Button>
      </Box>
    </motion.div>
  );
});

FormContent.displayName = 'FormContent';

// Оптимизированный компонент успешного состояния
const SuccessContent = memo(({ 
  name, 
  handleReset 
}: { 
  name: string;
  handleReset: () => void;
}) => {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  
  const animationProps = useMemo(() => ({
    initial: prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 },
    animate: prefersReducedMotion ? undefined : { opacity: 1, scale: 1 },
    exit: prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3 }
  }), [prefersReducedMotion]);

  return (
    <motion.div {...animationProps}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          color="primary"
          sx={{
            textShadow: theme === 'dark' ? '0 0 10px rgba(144, 202, 249, 0.3)' : 'none',
            fontWeight: 'bold',
          }}
        >
          Привет, {name}! 👋
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Добро пожаловать в наше приложение!
        </Typography>
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{ 
            mt: 2,
            borderRadius: 2,
            height: 48,
            fontSize: '1rem',
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 2,
              backgroundColor: 'rgba(144, 202, 249, 0.1)',
            },
          }}
        >
          Начать заново
        </Button>
      </Box>
    </motion.div>
  );
});

SuccessContent.displayName = 'SuccessContent';

// Оптимизированный компонент уведомления
const Notification = memo(({ 
  open, 
  message, 
  severity, 
  onClose 
}: { 
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
  onClose: () => void;
}) => (
  <Snackbar
    open={open}
    autoHideDuration={3000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    TransitionComponent={Fade}
  >
    <Alert 
      onClose={onClose} 
      severity={severity} 
      variant="filled"
      sx={{ 
        width: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        '& .MuiAlert-icon': {
          animation: 'pulse 1s infinite',
        },
        '@keyframes pulse': {
          '0%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.1)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
      }}
    >
      {message}
    </Alert>
  </Snackbar>
));

Notification.displayName = 'Notification';

// Компонент для отображения подсказок по клавиатурным сокращениям
const KeyboardShortcuts = memo(() => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { theme } = useTheme();

  const shortcuts = [
    { key: 'Enter', description: 'Отправить форму' },
    { key: 'Esc', description: 'Сбросить форму' },
    { key: '⌘ + /', description: 'Показать/скрыть подсказки' },
    { key: '⌘ + D', description: 'Переключить тему' },
  ];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Здесь будет переключение темы
      }
    };

    window.addEventListener('keydown', handleKeyPress as any);
    return () => window.removeEventListener('keydown', handleKeyPress as any);
  }, []);

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <Tooltip 
        title="Клавиатурные сокращения" 
        placement="left"
        TransitionComponent={Zoom}
      >
        <IconButton
          onClick={() => setShowShortcuts(prev => !prev)}
          sx={{
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            '&:hover': {
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <KeyboardIcon />
        </IconButton>
      </Tooltip>

      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                bottom: 60,
                right: 0,
                p: 2,
                minWidth: 200,
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Клавиатурные сокращения
              </Typography>
              {shortcuts.map((shortcut, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {shortcut.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                    }}
                  >
                    {shortcut.key}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
});

KeyboardShortcuts.displayName = 'KeyboardShortcuts';

// Компонент приветственной анимации
const WelcomeAnimation = memo(() => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: theme === 'dark' ? 'primary.light' : 'primary.main',
            textShadow: theme === 'dark' ? '0 0 20px rgba(144, 202, 249, 0.5)' : 'none',
          }}
        >
          Добро пожаловать! 👋
        </Typography>
      </motion.div>
    </motion.div>
  );
});

WelcomeAnimation.displayName = 'WelcomeAnimation';

// Компонент загрузки
const LoadingScreen = memo(() => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: theme === 'dark' ? '#121212' : '#f5f5f5',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{
            color: theme === 'dark' ? 'primary.light' : 'primary.main',
          }}
        />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            opacity: 0.7,
          }}
        >
          Загрузка...
        </Typography>
      </Box>
    </Box>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

// Компонент для отображения истории действий
const ActionHistory = memo(({ 
  actions, 
  onClear 
}: { 
  actions: Array<{ type: string; timestamp: number }>;
  onClear: () => void;
}) => {
  const { theme } = useTheme();
  
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        p: 2,
        minWidth: 250,
        maxHeight: 300,
        overflowY: 'auto',
        background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2">История действий</Typography>
        <Button size="small" onClick={onClear}>Очистить</Button>
      </Box>
      {actions.map((action, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
            p: 1,
            borderRadius: 1,
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <Typography variant="body2">{action.type}</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(action.timestamp).toLocaleTimeString()}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
});

ActionHistory.displayName = 'ActionHistory';

// Компонент таблицы сохраненных имен
const SavedNamesTable = memo(({ 
  names, 
  onDelete 
}: { 
  names: string[];
  onDelete: (name: string) => void;
}) => {
  const { theme } = useTheme();
  
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mt: 4,
        background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Имя</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {names.map((name, index) => (
            <TableRow key={index}>
              <TableCell>{name}</TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={() => onDelete(name)}
                  color="error"
                  size="small"
                  sx={{
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

SavedNamesTable.displayName = 'SavedNamesTable';

// Компонент-обертка для провайдеров
const Providers = memo(({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: 'light',
    },
  }), []);

  if (!mounted) {
    return (
      <ThemeProvider theme={muiTheme}>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeProvider theme={muiTheme}>
        {children}
      </ThemeProvider>
    </NextThemeProvider>
  );
});

Providers.displayName = 'Providers';

// Safe sound hook with error handling
const useSafeSound = (url: string) => {
  const [play, { sound }] = useSound(url, { 
    volume: 0.5,
    onplayerror: () => {
      console.warn('Sound playback failed');
    }
  });

  return () => {
    if (sound) {
      play();
    }
  };
};

export default function HomePages() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const { theme, setTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [actionHistory, setActionHistory] = useState<Array<{ type: string; timestamp: number }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: string }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationId = useRef(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [savedNames, setSavedNames] = useState<string[]>([]);

  // Мемоизированная тема
  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
    },
  }), [theme]);

  // Инициализация состояния
  useLayoutEffect(() => {
    const initializeApp = async () => {
      try {
        const savedName = localStorage.getItem('userName');
        const savedNamesList = JSON.parse(localStorage.getItem('savedNames') || '[]');
        
        if (savedName) {
          setName(savedName);
          setSnackbarMessage('Добро пожаловать обратно!');
          setSnackbarSeverity('info');
          setShowSnackbar(true);
        }
        
        setSavedNames(savedNamesList);

        // Имитация загрузки данных
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsInitialLoad(false);

        // Скрываем приветственную анимацию
        await new Promise(resolve => setTimeout(resolve, 2000));
        setShowWelcome(false);

        setMounted(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsInitialLoad(false);
        setMounted(true);
      }
    };

    initializeApp();
  }, []);

  // Sound effects
  const playClick = useSafeSound('/sounds/click.mp3');
  const playSuccess = useSafeSound('/sounds/success.mp3');
  const playError = useSafeSound('/sounds/error.mp3');

  // Функция для добавления действия в историю
  const addAction = useCallback((type: string) => {
    setActionHistory(prev => [...prev, { type, timestamp: Date.now() }].slice(-10));
  }, []);

  // Функция для добавления уведомления
  const addNotification = useCallback((message: string, type: string = 'info') => {
    const id = notificationId.current++;
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Обработчик клавиатурных сокращений
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowHistory(prev => !prev);
      }
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowNotifications(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress as any);
    return () => window.removeEventListener('keydown', handleKeyPress as any);
  }, []);

  // Обработчик удаления имени
  const handleDeleteName = useCallback((nameToDelete: string) => {
    setSavedNames(prev => {
      const newNames = prev.filter(name => name !== nameToDelete);
      localStorage.setItem('savedNames', JSON.stringify(newNames));
      return newNames;
    });
    
    setSnackbarMessage('Имя удалено');
    setSnackbarSeverity('info');
    setShowSnackbar(true);
    addAction('Удаление имени из списка');
    addNotification('Имя удалено из списка', 'info');
  }, [addAction, addNotification]);

  // Модифицированный handleSubmit
  const handleSubmit = useCallback(() => {
    setError('');
    if (!name.trim()) {
      setError('Пожалуйста, введите ваше имя');
      setSnackbarMessage('Ошибка: имя не может быть пустым');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      try {
        playError();
      } catch (error) {
        console.warn('Failed to play error sound:', error);
      }
      addAction('Попытка отправки пустого имени');
      addNotification('Ошибка: имя не может быть пустым', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      playClick();
    } catch (error) {
      console.warn('Failed to play click sound:', error);
    }
    addAction('Отправка имени');
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        setSubmitted(true);
        setIsLoading(false);
        try {
          playSuccess();
        } catch (error) {
          console.warn('Failed to play success sound:', error);
        }
        setSnackbarMessage('Имя успешно сохранено! 🎉');
        setSnackbarSeverity('success');
        setShowSnackbar(true);
        setShowConfetti(true);
        
        // Сохраняем имя в список с проверкой на дубликаты
        setSavedNames(prev => {
          // Проверяем, нет ли уже такого имени в списке
          if (prev.includes(name)) {
            setSnackbarMessage('Такое имя уже есть в списке');
            setSnackbarSeverity('info');
            setShowSnackbar(true);
            return prev;
          }
          const newNames = [...prev, name];
          localStorage.setItem('savedNames', JSON.stringify(newNames));
          return newNames;
        });
        
        localStorage.setItem('userName', name);
        addNotification('Имя успешно сохранено! 🎉', 'success');
        
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
      }, 1000);
    });
  }, [name, playClick, playSuccess, playError, addAction, addNotification]);

  const handleReset = useCallback(() => {
    setName('');
    setSubmitted(false);
    setError('');
    try {
      playClick();
    } catch (error) {
      console.warn('Failed to play click sound:', error);
    }
    localStorage.removeItem('userName');
    setSnackbarMessage('Данные сброшены');
    setSnackbarSeverity('info');
    setShowSnackbar(true);
  }, [playClick]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    try {
      playClick();
    } catch (error) {
      console.warn('Failed to play click sound:', error);
    }
    setSnackbarMessage(`Переключено на ${theme === 'dark' ? 'светлую' : 'темную'} тему`);
    setSnackbarSeverity('info');
    setShowSnackbar(true);
  }, [theme, setTheme, playClick]);

  const mainAnimationProps = useMemo(() => ({
    initial: prefersReducedMotion ? undefined : { opacity: 0, y: 20 },
    animate: prefersReducedMotion ? undefined : { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }), [prefersReducedMotion]);

  if (!mounted || isInitialLoad) {
    return <LoadingScreen />;
  }

  return (
    <Providers>
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <DynamicAnimatedBackground />
          {showWelcome && <WelcomeAnimation />}
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            >
              {/* Здесь можно добавить компонент конфетти */}
            </motion.div>
          )}
    <Container maxWidth="sm" sx={{ mt: 10 }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
              <Tooltip title="Уведомления (⌘ + N)">
                <IconButton 
                  onClick={() => setShowNotifications(prev => !prev)}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <Badge badgeContent={notifications.length} color="primary">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <IconButton 
                onClick={toggleTheme} 
                color="inherit"
                aria-label="Переключить тему"
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(180deg) scale(1.1)',
                    boxShadow: '0 0 15px rgba(144, 202, 249, 0.5)',
                  },
                }}
              >
                {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>

            <motion.div {...mainAnimationProps}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  borderRadius: 4,
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  align="center" 
                  color="primary"
                  component="h1"
                  sx={{
                    textShadow: theme === 'dark' ? '0 0 10px rgba(144, 202, 249, 0.3)' : 'none',
                    mb: 4,
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                  }}
                >
        Приветственное приложение
      </Typography>

                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <FormContent
                      name={name}
                      setName={setName}
                      error={error}
                      isLoading={isLoading}
                      handleSubmit={handleSubmit}
                    />
                  ) : (
                    <SuccessContent
                      name={name}
                      handleReset={handleReset}
                    />
                  )}
                </AnimatePresence>

                {savedNames.length > 0 && (
                  <SavedNamesTable
                    names={savedNames}
                    onDelete={handleDeleteName}
                  />
                )}
              </Paper>
            </motion.div>
          </Container>

          <KeyboardShortcuts />
          <Notification
            open={showSnackbar}
            message={snackbarMessage}
            severity={snackbarSeverity}
            onClose={() => setShowSnackbar(false)}
          />
          
          {showHistory && (
            <ActionHistory
              actions={actionHistory}
              onClear={() => setActionHistory([])}
            />
          )}
          
          {showNotifications && (
            <Paper
              elevation={3}
              sx={{
                position: 'fixed',
                top: 80,
                right: 16,
                p: 2,
                minWidth: 300,
                maxHeight: 400,
                overflowY: 'auto',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Уведомления
              </Typography>
              <AnimatePresence>
                {notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Alert
                      severity={notification.type as any}
                      sx={{ mb: 1 }}
                      onClose={() => {
                        setNotifications(prev => prev.filter(n => n.id !== notification.id));
                      }}
                    >
                      {notification.message}
                    </Alert>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Paper>
          )}

          {/* Sound Toggle Button */}
          <Tooltip title={`${soundEnabled ? 'Disable' : 'Enable'} sound effects`}>
            <IconButton
              onClick={() => setSoundEnabled(!soundEnabled)}
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Suspense>
      </ErrorBoundary>
    </Providers>
  );
}
