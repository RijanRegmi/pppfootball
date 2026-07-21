import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'ProScore',
  description: 'Design and Development of a Machine Learning System for Forecasting Player Performance in the English Premier League Using Historical and Match-Context Data.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-carbon-50 dark:bg-carbon-950 text-carbon-900 dark:text-carbon-100 transition-colors duration-300">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>
            <footer className="border-t border-carbon-200 dark:border-carbon-800/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-carbon-400 dark:text-carbon-500">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-pitch-500 to-pitch-700 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <span>ProScore</span>
                  <span className="text-carbon-300 dark:text-carbon-700">·</span>
                  <span>EPL Forecasting System</span>
                </div>
                <p className="text-[11px] text-carbon-400 dark:text-carbon-600">
                  © {new Date().getFullYear()} ProScore. Built for Premier League intelligence.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
