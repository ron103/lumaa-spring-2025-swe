import React, { useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onAuthSuccess: (token: string) => void;
  switchMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onAuthSuccess, switchMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      if (mode === 'login' && data.token) {
        onAuthSuccess(data.token);
      } else if (mode === 'register') {
        alert('Registration successful! Please log in.');
        switchMode();
      }
    } else {
      alert(data.message || 'Error occurred');
    }
  };

  return (
    <div>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      <p style={{ marginTop: '10px' }}>
        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={switchMode}
          style={{
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            color: '#007aff',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {mode === 'login' ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;