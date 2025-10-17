import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  
  const { signUp, checkUsernameExists } = useAuth();
  const navigate = useNavigate();

  // Verificar disponibilidade do username em tempo real
  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 3) {
        setUsernameError('');
        setUsernameAvailable(null);
        return;
      }

      try {
        setCheckingUsername(true);
        const exists = await checkUsernameExists(username);
        setUsernameAvailable(!exists);
        setUsernameError(exists ? 'Este nome de usuário já está em uso' : '');
      } catch (error) {
        console.error('Erro ao verificar username:', error);
        setUsernameError('');
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameExists]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validação básica
    if (!username || !email || !password || !confirmPassword) {
      return setError('Por favor, preencha todos os campos');
    }
    
    if (username.length < 3) {
      return setError('O nome de usuário deve ter pelo menos 3 caracteres');
    }
    
    if (usernameAvailable === false) {
      return setError('Este nome de usuário já está em uso. Por favor, escolha outro.');
    }
    
    if (password.length < 6) {
      return setError('A senha deve ter pelo menos 6 caracteres');
    }
    
    if (password !== confirmPassword) {
      return setError('As senhas não coincidem');
    }
    
    try {
      setError('');
      setLoading(true);
      await signUp(email, password, username);
      navigate('/');
    } catch (error) {
      setError('Falha ao criar conta: ' + error.message);
    }
    
    setLoading(false);
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>BibliRead</h1>
          <p>Crie sua conta para organizar sua biblioteca</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Nome de Usuário</label>
            <div className="username-input-container">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Escolha um nome de usuário"
                className={usernameAvailable === false ? 'error' : usernameAvailable === true ? 'success' : ''}
              />
              {checkingUsername && <div className="username-checking">Verificando...</div>}
              {usernameAvailable === true && <div className="username-available">✓ Disponível</div>}
              {usernameAvailable === false && <div className="username-unavailable">✗ Indisponível</div>}
            </div>
            {usernameError && <div className="field-error">{usernameError}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirme sua senha"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          
          <button disabled={loading} type="submit" className="login-button">
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Já tem uma conta? <a href="/login">Faça login</a></p>
        </div>
      </div>
    </div>
  );
}