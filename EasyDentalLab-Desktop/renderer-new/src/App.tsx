import { useState } from 'react';
import { useData } from './hooks/useData';
import { useDarkMode } from './hooks/useDarkMode';
import { useElectron } from './hooks/useElectron';
import { NAV, APP_VERSION } from './constants/initialData';
import {
  Dashboard,
  Invoices,
  Estimates,
  DirectClaimed,
  Clients,
  Tariffs,
  Macros,
  Settings
} from './components/pages';
import './App.css';

function App() {
  const { data, setData, loaded } = useData();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { isElectron, updateAvailable, updateDownloaded, installUpdate } = useElectron();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!loaded) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--c-bg)',
        color: 'var(--c-text1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard data={data} setData={setData} />;
      case 'invoices':
        return <Invoices data={data} setData={setData} />;
      case 'estimates':
        return <Estimates data={data} setData={setData} />;
      case 'directclaimed':
        return <DirectClaimed data={data} setData={setData} />;
      case 'clients':
        return <Clients data={data} setData={setData} />;
      case 'tariffs':
        return <Tariffs data={data} setData={setData} />;
      case 'macros':
        return <Macros data={data} setData={setData} />;
      case 'settings':
        return <Settings
          data={data}
          onSave={(profile) => setData({ ...data, profile })}
        />;
      default:
        return <Dashboard data={data} setData={setData} />;
    }
  };

  return (
    <div className="app" style={{ display: 'flex', height: '100vh', background: 'var(--c-bg)' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarCollapsed ? 60 : 240,
        background: 'var(--c-sidebar)',
        borderRight: '1px solid var(--c-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s'
      }}>
        {/* Logo */}
        <div 
          style={{
            padding: 20,
            borderBottom: '1px solid var(--c-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <div style={{ fontSize: 24 }}>🦷</div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--c-text1)' }}>
                EasyDentalLab
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>
                v{APP_VERSION}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                padding: '12px 20px',
                border: 'none',
                background: currentPage === item.id ? 'var(--c-sel)' : 'transparent',
                color: 'var(--c-text1)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 14,
                fontWeight: currentPage === item.id ? 600 : 400,
                transition: 'background 0.2s'
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <div style={{
          height: 60,
          borderBottom: '1px solid var(--c-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 24px',
          gap: 12,
          background: 'var(--c-surface)'
        }}>
          {/* Update Notification (Electron only) */}
          {isElectron && updateDownloaded && (
            <button
              onClick={() => installUpdate?.()}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              🔄 Restart to Update
            </button>
          )}

          {isElectron && updateAvailable && !updateDownloaded && (
            <div style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: '#fff',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500
            }}>
              ⬇️ Downloading update...
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: '1px solid var(--c-border)',
              background: 'var(--c-surface2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              transition: 'all 0.2s'
            }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--c-bg)' }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
