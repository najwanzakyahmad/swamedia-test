import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearAuthError } from '../store/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isLoading = status === 'loading';

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(login({ username, password }));
    if (login.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-tag">
          <span className="login-tag-hole" />
          Swamedia
        </div>
        <h1>Katalog Produk</h1>
        <p>
          Kelola daftar produk perusahaan — tambah, ubah, dan hapus data
          langsung dari satu tempat.
        </p>
      </div>

      <div className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Masuk</h2>
          <p className="login-sub">Gunakan akun staf Anda untuk melanjutkan.</p>

          <label className="field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="emilys"
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Memeriksa…' : 'Masuk'}
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
        }
        .login-brand {
          background: var(--color-ink);
          color: #f2f4ee;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 18px;
          padding: 64px;
        }
        .login-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          background: var(--color-accent);
          color: var(--color-accent-ink);
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 6px 14px 6px 10px;
          border-radius: 3px;
          clip-path: polygon(0 50%, 12px 0, 100% 0, 100% 100%, 12px 100%);
        }
        .login-tag-hole {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--color-ink);
        }
        .login-brand h1 {
          font-size: 44px;
          max-width: 9ch;
          color: #f7f8f3;
        }
        .login-brand p {
          max-width: 34ch;
          color: #c4cabb;
          line-height: 1.6;
          font-size: 15px;
        }
        .login-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          background: var(--color-bg);
        }
        .login-form {
          width: 100%;
          max-width: 360px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card);
          padding: 36px 32px;
        }
        .login-form h2 { font-size: 26px; }
        .login-sub {
          color: var(--color-muted);
          font-size: 14px;
          margin: 6px 0 24px;
        }
        @media (max-width: 860px) {
          .login-page { grid-template-columns: 1fr; }
          .login-brand { padding: 40px 28px; }
          .login-brand h1 { font-size: 32px; }
        }
      `}</style>
    </div>
  );
}
