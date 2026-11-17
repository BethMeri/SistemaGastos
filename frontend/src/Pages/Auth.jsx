/* frontend/src/Pages/Auth.jsx */
import React, { useState } from 'react';
import '../Styles/Auth.css';

export default function Auth({ onLoginSuccess }) {
  const [esLogin, setEsLogin] = useState(true);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Validaciones en tiempo real para el registro
  const tieneLongitud = password.length >= 8;
  const tieneNumero = /[0-9]/.test(password);
  const tieneMayuscula = /[A-Z]/.test(password);
  const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!correo || !password || (!esLogin && !nombre)) {
      setError("Por favor, completa todos los campos obligatorios.");
      setSuccessMessage('');
      return;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      setError("Por favor, ingresa un correo electrónico válido (ej. tu.correo@gmail.com).");
      setSuccessMessage('');
      return;
    }

    if (!esLogin) {
      if (!tieneLongitud || !tieneNumero || !tieneMayuscula || !tieneEspecial) {
        setError("La contraseña no cumple con todos los requisitos de seguridad obligatorios.");
        setSuccessMessage('');
        return;
      }
    }

    setError('');

    if (esLogin) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setSuccessMessage("¡Cuenta creada con éxito! Por favor, inicia sesión.");
      setEsLogin(true);
      setPassword('');
      setNombre('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>SistemaGastos 💸</h2>
          <p>{esLogin ? 'Inicia sesión en tu cuenta' : 'Crea una cuenta nueva'}</p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}
        {successMessage && <div className="auth-success-alert">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!esLogin && (
            <div className="auth-input-group">
              <label>Nombre completo</label>
              <input 
                type="text" 
                placeholder="Ej. Betzabeth Merino" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          )}

          <div className="auth-input-group">
            <label>Correo electrónico</label>
            <input 
              type="text" 
              placeholder="tu.correo@email.com" 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="auth-input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {/* Checklist de requisitos de contraseña (solo aparece en modo Registro) */}
            {!esLogin && (
              <div className="auth-password-requirements">
                <p className="requirements-title">La contraseña debe contener:</p>
                <ul>
                  <li className={tieneLongitud ? 'valid' : 'invalid'}>
                    {tieneLongitud ? '✓' : '•'} Mínimo 8 caracteres
                  </li>
                  <li className={tieneMayuscula ? 'valid' : 'invalid'}>
                    {tieneMayuscula ? '✓' : '•'} Al menos una letra mayúscula
                  </li>
                  <li className={tieneNumero ? 'valid' : 'invalid'}>
                    {tieneNumero ? '✓' : '•'} Al menos un número
                  </li>
                  <li className={tieneEspecial ? 'valid' : 'invalid'}>
                    {tieneEspecial ? '✓' : '•'} Al menos un carácter especial (ej. @, $, !)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button type="submit" className="auth-submit-btn">
            {esLogin ? 'Entrar al Sistema' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer-link">
          <p>
            {esLogin ? '¿Aún no tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <button 
              type="button" 
              onClick={() => { setEsLogin(!esLogin); setError(''); setSuccessMessage(''); }}
              className="auth-switch-btn"
            >
              {esLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}