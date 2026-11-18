/* frontend/src/Pages/Profile.jsx */
import React, { useState, useRef } from 'react';
import '../Styles/Profile.css';

export default function Profile() {
  const [nombre, setNombre] = useState(() => {
    return localStorage.getItem('userName') || 'Bethmeriugu';
  });
  
  const correo = localStorage.getItem('userEmail') || 'beth@gmail.com';

  const [avatarFoto, setAvatarFoto] = useState(() => {
    return localStorage.getItem('userAvatar') || '';
  });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const fileInputRef = useRef(null);

  const handleGuardarNombre = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombre.trim()) {
      setErrorMsg('El nombre completo no puede estar vacío.');
      return;
    }

    if (nombre.trim().length < 3) {
      setErrorMsg('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    
    localStorage.setItem('userName', nombre);
    setModoEdicion(false);
    setMensajeExito('¡Perfil actualizado con éxito!');
    setTimeout(() => setMensajeExito(''), 3000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatarFoto(base64String);
        localStorage.setItem('userAvatar', base64String);
        setMensajeExito('¡Foto de perfil actualizada!');
        setTimeout(() => setMensajeExito(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-content-header">
        <h1>Configuración de la Cuenta</h1>
        <p>Administra tu identidad y preferencias en SistemaGastos.</p>
      </div>

      {mensajeExito && <div className="profile-toast success">{mensajeExito}</div>}
      {errorMsg && <div className="profile-toast error">{errorMsg}</div>}

      {/* Tarjeta Única y Limpia (Sin scroll) */}
      <div className="profile-single-card">
        <div className="profile-avatar-section">
          <div 
            className="profile-avatar-container" 
            onClick={() => fileInputRef.current.click()}
            title="Haz clic para cambiar tu foto"
          >
            {avatarFoto ? (
              <img src={avatarFoto} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-initial">
                {nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="avatar-overlay">
              <span>📷 Cambiar</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <span className="avatar-hint">Haz clic sobre tu avatar para cambiar tu foto</span>
        </div>

        <form onSubmit={handleGuardarNombre} className="profile-edit-form">
          <div className="form-field">
            <label>Nombre completo</label>
            <input 
              type="text" 
              value={nombre} 
              readOnly={!modoEdicion}
              className={modoEdicion ? 'input-editable' : 'input-locked'}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
            />
          </div>

          <div className="form-field">
            <label>Correo electrónico</label>
            <input 
              type="email" 
              value={correo} 
              readOnly
              className="input-locked"
            />
            <span className="field-hint">El correo está vinculado a tu acceso y no se puede modificar.</span>
          </div>

          <div className="form-actions">
            {modoEdicion ? (
              <div className="actions-group">
                <button type="submit" className="btn-primary-custom">Guardar cambios</button>
                <button 
                  type="button" 
                  className="btn-secondary-custom" 
                  onClick={() => {
                    setModoEdicion(false);
                    setErrorMsg('');
                    setNombre(localStorage.getItem('userName') || 'Bethmeriugu');
                  }}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                className="btn-outline-custom" 
                onClick={() => setModoEdicion(true)}
              >
                Modificar nombre
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}