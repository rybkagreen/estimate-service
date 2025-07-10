import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import DocumentsContainer from './components/documents/DocumentsContainer';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { ThemeProvider } from './contexts/ThemeContext';
import AIAssistant from './pages/AIAssistant';
import Dashboard from './pages/Dashboard';
import Estimates from './pages/Estimates';
import Projects from './pages/Projects';
import Settings from './pages/Settings';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Проверяем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <ThemeProvider value={{ darkMode, toggleDarkMode }}>
      <div className='flex h-screen bg-gray-50 dark:bg-dark-900'>
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: sidebarOpen ? 280 : 80,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className='sidebar flex-shrink-0'
        >
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        </motion.div>

        {/* Main content */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          <Header />

          <main className='flex-1 overflow-auto bg-gray-50 dark:bg-dark-900'>
            <div className='container mx-auto px-6 py-8'>
              <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='/estimates' element={<Estimates />} />
                <Route path='/projects' element={<Projects />} />
                <Route path='/ai-assistant' element={<AIAssistant />} />
                <Route path='/settings' element={<Settings />} />
                <Route path='/documents' element={<DocumentsContainer />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
