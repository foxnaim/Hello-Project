'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Geist } from "next/font/google";
import { useMemo } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useTheme } from 'next-themes';

const geistSans = Geist({
  subsets: ["latin"],
});

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedTheme as 'light' | 'dark',
          primary: {
            main: resolvedTheme === 'dark' ? '#90caf9' : '#1976d2',
          },
          secondary: {
            main: resolvedTheme === 'dark' ? '#f48fb1' : '#dc004e',
          },
          background: {
            default: resolvedTheme === 'dark' ? '#121212' : '#f5f5f5',
            paper: resolvedTheme === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: geistSans.style.fontFamily,
          h4: {
            fontWeight: 600,
            letterSpacing: '-0.5px',
          },
          h5: {
            fontWeight: 500,
            letterSpacing: '-0.3px',
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
                padding: '8px 24px',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [resolvedTheme],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeWrapper>{children}</ThemeWrapper>
    </NextThemesProvider>
  );
} 
