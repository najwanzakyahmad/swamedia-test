import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import {
  fetchProducts,
  addProduct,
  clearMutationStatus,
} from '../store/productSlice';

const LIMIT = 20;

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const {
    items,
    total,
    skip,
    listStatus,
    listError,
    mutationStatus,
    mutationError,
  } = useSelector((state) => state.products);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const visibleItems = items;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    dispatch(fetchProducts({ skip: 0, q: debouncedSearch }));
  }, [dispatch, debouncedSearch]);

  const page = Math.floor(skip / LIMIT) + 1;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const goToPage = (nextPage) => {
    const nextSkip = (nextPage - 1) * LIMIT;
    dispatch(fetchProducts({ skip: nextSkip, q: debouncedSearch }));
  };

  const handleAddProduct = async (payload) => {
    const result = await dispatch(addProduct(payload));
    if (addProduct.fulfilled.match(result)) {
      setShowAddModal(false);
      dispatch(clearMutationStatus());
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    dispatch(clearMutationStatus());
  };

  const isEmpty = useMemo(
    () => listStatus === 'idle' && visibleItems.length === 0,
    [listStatus, visibleItems.length]
  );

  return (
    <div className="home-page">
      <Topbar />

      <main className="home-main">
        <div className="home-header">
          <div>
            <h1>Hi, {user?.firstName || 'there'}</h1>
            <p className="home-sub">
              {total} produk tersedia di katalog Anda.
            </p>
          </div>
          <button className="btn btn-accent" onClick={() => setShowAddModal(true)}>
            + Tambah Produk
          </button>
        </div>

        <div className="home-toolbar">
          <input
            type="search"
            className="search-input"
            placeholder="Cari produk…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {listStatus === 'failed' && (
          <div className="alert alert-danger">{listError}</div>
        )}

        {listStatus === 'loading' && (
          <div className="state-message">Memuat produk…</div>
        )}

        {isEmpty && (
          <div className="state-message">
            Tidak ada produk yang cocok. Coba kata kunci lain atau tambahkan
            produk baru.
          </div>
        )}

        <div className="product-grid">
          {visibleItems.map((product) => (
            <button
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <span className="product-card-notch" />

              <div className="product-thumb">
                <img src={product.thumbnail} alt="" loading="lazy" />
              </div>

              <div className="product-body">
                <h3>{product.title}</h3>

                <span className="product-brand">
                  {product.brand || product.category}
                </span>

                <div className="product-meta">
                  <span className="product-price">
                    ${Number(product.price).toFixed(2)}
                  </span>

                  <span className="product-stock">
                    Stok {product.stock}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              ← Sebelumnya
            </button>
            <span>
              Halaman {page} dari {totalPages}
            </span>
            <button
              className="btn btn-sm"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Berikutnya →
            </button>
          </div>
        )}
      </main>

      {showAddModal && (
        <Modal title="Tambah produk baru" onClose={closeAddModal}>
          {mutationStatus === 'failed' && (
            <div className="alert alert-danger">{mutationError}</div>
          )}
          <ProductForm
            submitLabel="Tambah produk"
            isSubmitting={mutationStatus === 'loading'}
            onSubmit={handleAddProduct}
          />
        </Modal>
      )}

      <style>{`
        .home-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 32px 80px;
        }
        .home-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .home-header h1 { font-size: 32px; }
        .home-sub { color: var(--color-muted); margin: 6px 0 0; font-size: 14px; }

        .home-toolbar { margin-bottom: 24px; }
        .search-input {
          width: 100%;
          max-width: 360px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          font-size: 14px;
        }
        .search-input:focus { border-color: var(--color-accent); outline: none; }

        .state-message {
          padding: 40px 0;
          text-align: center;
          color: var(--color-muted);
          font-size: 14px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
        }

        .product-card {
          position: relative;
          text-align: left;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card);
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.12s ease, border-color 0.12s ease;
        }
        .product-card:hover {
          transform: translateY(-3px);
          border-color: var(--color-accent);
        }
        .product-card-notch {
          position: absolute;
          top: 14px;
          left: 14px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          z-index: 2;
        }
        .product-thumb {
          background: var(--color-bg);
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-thumb img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        .product-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 4px; }
        .product-body h3 {
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font-body);
          line-height: 1.3;
        }
        .product-brand {
          font-size: 12px;
          color: var(--color-muted);
          text-transform: capitalize;
        }
        .product-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          font-family: var(--font-mono);
        }
        .product-price { font-weight: 600; color: var(--color-accent-ink); }
        .product-stock { font-size: 12px; color: var(--color-muted); }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 36px;
          font-size: 13px;
          color: var(--color-muted);
        }
      `}</style>
    </div>
  );
}
