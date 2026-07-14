import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/authSlice';

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <header className="topbar">
      <Link to="/" className="topbar-brand">
        <span className="topbar-tag" />
        Swamedia Katalog
      </Link>

      <div className="topbar-right">
        {user && (
          <div className="topbar-user">
            {user.image && <img src={user.image} alt="" />}
            <span>
              Hi, <strong>{user.firstName}</strong>
            </span>
          </div>
        )}
        <button className="btn btn-sm" onClick={handleLogout}>
          Keluar
        </button>
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 18px;
          color: var(--color-ink);
        }
        .topbar-tag {
          width: 12px;
          height: 12px;
          background: var(--color-accent);
          border-radius: 2px 2px 2px 8px;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .topbar-user {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--color-ink-soft);
        }
        .topbar-user img {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--color-border);
        }
      `}</style>
    </header>
  );
}
