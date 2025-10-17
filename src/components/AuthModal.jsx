import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, BookOpen, UserPlus, LogIn, User } from 'lucide-react';
import './AuthModal.css';

const AuthModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting login...');
        await login(email, password);
        console.log('Login successful, closing modal...');
      } else {
        // Validation for signup
        if (!username.trim()) {
          setError('Por favor, digite um nome de usuário');
          setLoading(false);
          return;
        }
        
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }
        
        console.log('Attempting signup...');
        await signup(email, password);
        console.log('Signup successful, closing modal...');
      }
      // Close modal immediately after successful auth
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-modal-logo">
            <BookOpen size={32} />
            <h2>BibliRead</h2>
          </div>
          <button className="auth-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="auth-modal-content">
          <h3>{isLogin ? 'Bem-vindo de volta!' : 'Criar conta'}</h3>
          <p>{isLogin ? 'Faça login para acessar sua biblioteca' : 'Cadastre-se para organizar seus livros'}</p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="auth-form-group">
                <label htmlFor="username">Nome de usuário</label>
                <div className="auth-input-container">
                  <User size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Seu nome de usuário"
                  />
                </div>
              </div>
            )}
            
            <div className="auth-form-group">
              <label htmlFor="email">Email</label>
              <div className="auth-input-container">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            
            <div className="auth-form-group">
              <label htmlFor="password">Senha</label>
              <div className="auth-input-container">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={isLogin ? 'Digite sua senha' : 'Crie uma senha'}
                  minLength="6"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {!isLogin && (
              <div className="auth-form-group">
                <label htmlFor="confirmPassword">Confirmar senha</label>
                <div className="auth-input-container">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirme sua senha"
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-button"
            >
              {loading ? (
                'Carregando...'
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? 'Entrar' : 'Cadastrar'}
                </>
              )}
            </button>
          </form>
          
          <div className="auth-toggle">
            <p>
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button type="button" onClick={toggleMode}>
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;