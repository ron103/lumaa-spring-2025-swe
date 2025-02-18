import React, { useState } from 'react';
import AuthForm from './components/AuthForm';
import Tasks from './components/Tasks';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleAuthSuccess = (token: string) => {
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="container">
      <header>
        <h1>Task Manager</h1>
        {token && <button onClick={handleLogout}>Logout</button>}
      </header>
      <main>
        {token ? (
          <Tasks token={token} />
        ) : (
          <AuthForm
            mode={authMode}
            onAuthSuccess={handleAuthSuccess}
            switchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          />
        )}
      </main>
    </div>
  );
};

export default App;