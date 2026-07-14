import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import ProductForm from '../components/ProductForm';
import {
  fetchProductById,
  updateProduct,
  deleteProduct,
  clearCurrentProduct,
  clearMutationStatus,
} from '../store/productSlice';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    current,
    detailStatus,
    detailError,
    mutationStatus,
    mutationError,
  } = useSelector((state) => state.products);

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearCurrentProduct());
  }, [dispatch, id]);

  const handleUpdate = async (payload) => {
    const result = await dispatch(updateProduct({ id, payload }));
    if (updateProduct.fulfilled.match(result)) {
      setIsEditing(false);
      dispatch(clearMutationStatus());
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="detail-page">
      <Topbar />

      <main className="detail-main">
        <Link to="/" className="back-link">
          ← Kembali ke Beranda
        </Link>

        {detailStatus === 'loading' && (
          <div className="state-message">Memuat detail produk…</div>
        )}

        {detailStatus === 'failed' && (
          <div className="alert alert-danger">{detailError}</div>
        )}

        {current && !isEditing && (
          <div className="detail-card card">
            <div className="detail-thumb">
              <img src={current.thumbnail} alt="" />
            </div>
            <div className="detail-body">
              <span className="detail-category">{current.category}</span>
              <h1>{current.title}</h1>
              <p className="detail-desc">{current.description}</p>

              <div className="detail-stats">
                <div>
                  <span className="stat-label">Harga</span>
                  <span className="stat-value mono">
                    ${Number(current.price).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="stat-label">Stok</span>
                  <span className="stat-value mono">{current.stock}</span>
                </div>
                <div>
                  <span className="stat-label">Merek</span>
                  <span className="stat-value">{current.brand || '—'}</span>
                </div>
              </div>

              {mutationStatus === 'failed' && (
                <div className="alert alert-danger">{mutationError}</div>
              )}

              <div className="detail-actions">
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  Ubah Produk
                </button>
                {!confirmDelete ? (
                  <button
                    className="btn btn-danger"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Hapus Produk
                  </button>
                ) : (
                  <div className="confirm-row">
                    <span>Yakin ingin menghapus?</span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleDelete}
                      disabled={mutationStatus === 'loading'}
                    >
                      {mutationStatus === 'loading' ? 'Menghapus…' : 'Ya, hapus'}
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {current && isEditing && (
          <div className="detail-card card edit-card">
            <div className="edit-header">
              <h2>Ubah Produk</h2>
              <button className="btn btn-sm" onClick={() => setIsEditing(false)}>
                Batal
              </button>
            </div>
            {mutationStatus === 'failed' && (
              <div className="alert alert-danger">{mutationError}</div>
            )}
            <ProductForm
              initialValues={{
                title: current.title,
                category: current.category,
                price: current.price,
                stock: current.stock,
                brand: current.brand,
                description: current.description,
              }}
              submitLabel="Simpan perubahan"
              isSubmitting={mutationStatus === 'loading'}
              onSubmit={handleUpdate}
            />
          </div>
        )}
      </main>

      <style>{`
        .detail-main {
          max-width: 820px;
          margin: 0 auto;
          padding: 32px 32px 80px;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 20px;
          font-size: 13px;
          color: var(--color-muted);
          text-decoration: none;
        }
        .back-link:hover { color: var(--color-ink); }

        .detail-card {
          display: grid;
          grid-template-columns: 260px 1fr;
          overflow: hidden;
        }
        .detail-thumb {
          background: var(--color-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .detail-thumb img { max-width: 100%; max-height: 220px; object-fit: contain; }
        .detail-body { padding: 28px 32px; }
        .detail-category {
          font-family: var(--font-mono);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-accent-ink);
          background: color-mix(in srgb, var(--color-accent) 25%, transparent);
          padding: 3px 8px;
          border-radius: 4px;
        }
        .detail-body h1 { font-size: 26px; margin: 12px 0 10px; }
        .detail-desc { color: var(--color-ink-soft); line-height: 1.6; font-size: 14px; margin-bottom: 20px; }

        .detail-stats {
          display: flex;
          gap: 28px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--color-border);
        }
        .detail-stats > div { display: flex; flex-direction: column; gap: 4px; }
        .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted); }
        .stat-value { font-size: 16px; font-weight: 600; }
        .mono { font-family: var(--font-mono); }

        .detail-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .confirm-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--color-ink-soft); }

        .edit-card { grid-template-columns: 1fr; padding: 28px 32px; }
        .edit-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }

        @media (max-width: 680px) {
          .detail-card { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
