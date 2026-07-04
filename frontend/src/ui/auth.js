import { login, register } from '../api.js';
import { toast } from './toast.js';

export function initAuth(onSuccess) {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');

  showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('auth-form-login').style.display = 'none';
    document.getElementById('auth-form-register').style.display = 'block';
  });

  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('auth-form-register').style.display = 'none';
    document.getElementById('auth-form-login').style.display = 'block';
  });

  loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) {
      toast('Bitte alle Felder ausf\u00FCllen');
      return;
    }
    try {
      await login(username, password);
      onSuccess();
    } catch (err) {
      toast('Login fehlgeschlagen: ' + err.message);
    }
  });

  registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim();
    const displayName = document.getElementById('reg-displayname').value.trim();
    const password = document.getElementById('reg-password').value;
    if (!username || !password || !displayName) {
      toast('Bitte alle Felder ausf\u00FCllen');
      return;
    }
    try {
      await register(username, password, displayName);
      onSuccess();
    } catch (err) {
      toast('Registrierung fehlgeschlagen: ' + err.message);
    }
  });

  // Allow Enter key to submit
  document.getElementById('login-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });
  document.getElementById('reg-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') registerBtn.click();
  });
}
