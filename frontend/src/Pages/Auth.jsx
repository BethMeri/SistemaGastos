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

  // Función para evaluar la seguridad de la contraseña en tiempo real
  const evaluarSeguridadPassword = (pass) => {
    if (!pass) return { nivel: '', texto: '', porcentaje: '0%' };
    
    let puntuacion = 0;
    if (pass.length >= 8) puntuacion++;
    if (/[0-9]/.test(pass)) puntuacion++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) puntuacion++;

    if (puntuacion === 1) return { nivel: 'debil', texto: 'Contraseña débil', porcentaje: '33%' };
    if (puntuacion === 2) return { nivel: 'media', texto: 'Contraseña media', porcentaje: '66%' };
    if (puntuacion === 3) return { nivel: 'fuerte', texto: 'Contraseña segura 🔒', porcentaje: '100%' };

    return { nivel: 'debil', texto: 'Muy corta', porcentaje: '20%' };
  };

  const seguridad = evaluarSeguridadPassword(password);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!correo || !password || (!esLogin && !nombre)) {
      setError("Por favor, completa todos los campos obligatorios.");
      setSuccessMessage('');
      return;
    }

    // Si es registro, aplicamos la regla estricta de seguridad
    if (!esLogin) {
      const tieneNumero = /[0-9]/.test(password);
      const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const esLargaSuficiente = password.length >= 8;

      if (!esLargaSuficiente || !tieneNumero || !tieneEspecial) {
        setError("La contraseña debe tener al menos 8 caracteres, incluir números y caracteres especiales (ej. @, $, !).");
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
              type="email" 
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
            
            {/* Barra de seguridad visual (solo aparece al registrarse o escribir) */}
            {!esLogin && password && (
              <div className="auth-strength-container">
                <div className="auth-strength-bar-bg">
                  <div 
                    className={`auth-strength-bar-fill ${seguridad.nivel}`} 
                    style={{ width: seguridad.porcentaje }}
                  ></div>
                </div>
                <span className={`auth-strength-text ${seguridad.nivel}`}>
                  {seguridad.texto}
                </span>
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