import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

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
    items,
    addedProducts,
    updatedProducts,
    deletedIds,
    current,
    detailStatus,
    detailError,
    mutationStatus,
    mutationError,
  } = useSelector((state) => state.products);

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /*
   * Mencari produk dari state Redux.
   *
   * Produk dapat berasal dari:
   * 1. items: produk hasil GET /products
   * 2. addedProducts: produk yang baru ditambahkan secara lokal
   */
  const productFromLocal = useMemo(() => {
    const productId = String(id);

    const productFromItems = items.find(
      (item) => String(item.id) === productId
    );

    const productFromAddedProducts = addedProducts.find(
      (item) => String(item.id) === productId
    );

    return productFromItems || productFromAddedProducts || null;
  }, [id, items, addedProducts]);

  /*
   * Pastikan current memang merupakan produk yang sedang dibuka.
   *
   * Ini mencegah detail produk sebelumnya tampil sesaat ketika
   * parameter URL berubah.
   */
  const currentProduct = useMemo(() => {
    if (!current) {
      return null;
    }

    return String(current.id) === String(id)
      ? current
      : null;
  }, [current, id]);

  /*
   * Mengambil perubahan lokal produk.
   *
   * Contoh:
   * updatedProducts = {
   *   "4": {
   *     title: "Judul baru",
   *     price: 100
   *   }
   * }
   */
  const localUpdate =
    updatedProducts[String(id)] || null;

  /*
   * Membentuk data akhir yang akan ditampilkan.
   *
   * Prioritas data dasar:
   * 1. Produk dari state lokal
   * 2. Produk dari GET /products/:id
   *
   * Setelah itu digabungkan dengan hasil update lokal.
   */
  const product = useMemo(() => {
    const baseProduct =
      productFromLocal || currentProduct;

    if (!baseProduct) {
      return null;
    }

    return {
      ...baseProduct,
      ...(localUpdate || {}),
    };
  }, [
    productFromLocal,
    currentProduct,
    localUpdate,
  ]);

  /*
   * Memeriksa apakah produk telah dihapus secara lokal.
   */
  const isDeleted = useMemo(() => {
    return deletedIds.some(
      (deletedId) =>
        String(deletedId) === String(id)
    );
  }, [deletedIds, id]);

  /*
   * Hanya ambil detail dari DummyJSON jika:
   * - Produk tidak ada di items
   * - Produk tidak ada di addedProducts
   * - Produk belum dihapus
   *
   * Produk baru tidak perlu di-fetch karena tidak benar-benar
   * tersimpan di DummyJSON.
   */
  useEffect(() => {
    if (!productFromLocal && !isDeleted) {
      dispatch(fetchProductById(id));
    }
  }, [
    dispatch,
    id,
    productFromLocal,
    isDeleted,
  ]);

  /*
   * Bersihkan state detail ketika meninggalkan halaman.
   */
  useEffect(() => {
    return () => {
      dispatch(clearCurrentProduct());
      dispatch(clearMutationStatus());
    };
  }, [dispatch]);

  /*
   * Menyimpan perubahan produk.
   */
  const handleUpdate = async (payload) => {
    const result = await dispatch(
      updateProduct({
        id,
        payload,
      })
    );

    if (updateProduct.fulfilled.match(result)) {
      setIsEditing(false);
      setConfirmDelete(false);

      dispatch(clearMutationStatus());
    }
  };

  /*
   * Menghapus produk.
   */
  const handleDelete = async () => {
    const result = await dispatch(
      deleteProduct(id)
    );

    if (deleteProduct.fulfilled.match(result)) {
      dispatch(clearMutationStatus());

      navigate('/', {
        replace: true,
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    dispatch(clearMutationStatus());
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    dispatch(clearMutationStatus());
  };

  const productImage =
    product?.thumbnail ||
    product?.images?.[0] ||
    null;

  return (
    <div className="detail-page">
      <Topbar />

      <main className="detail-main">
        <Link to="/" className="back-link">
          ← Kembali ke Beranda
        </Link>

        {detailStatus === 'loading' &&
          !product &&
          !isDeleted && (
            <div className="state-message">
              Memuat detail produk…
            </div>
          )}

        {detailStatus === 'failed' &&
          !product &&
          !isDeleted && (
            <div className="alert alert-danger">
              {detailError}
            </div>
          )}

        {isDeleted && (
          <div className="state-message">
            <h2>Produk telah dihapus</h2>

            <p>
              Produk ini sudah tidak tersedia di katalog.
            </p>

            <Link to="/" className="btn btn-primary">
              Kembali ke Beranda
            </Link>
          </div>
        )}

        {!isDeleted &&
          product &&
          !isEditing && (
            <div className="detail-card card">
              <div className="detail-thumb">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={product.title || 'Produk'}
                  />
                ) : (
                  <div className="image-placeholder">
                    Gambar tidak tersedia
                  </div>
                )}
              </div>

              <div className="detail-body">
                <span className="detail-category">
                  {product.category ||
                    'Tanpa kategori'}
                </span>

                <h1>
                  {product.title ||
                    'Produk tanpa nama'}
                </h1>

                <p className="detail-desc">
                  {product.description ||
                    'Tidak ada deskripsi produk.'}
                </p>

                <div className="detail-stats">
                  <div>
                    <span className="stat-label">
                      Harga
                    </span>

                    <span className="stat-value mono">
                      $
                      {Number(
                        product.price ?? 0
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="stat-label">
                      Stok
                    </span>

                    <span className="stat-value mono">
                      {product.stock ?? 0}
                    </span>
                  </div>

                  <div>
                    <span className="stat-label">
                      Merek
                    </span>

                    <span className="stat-value">
                      {product.brand || '—'}
                    </span>
                  </div>
                </div>

                {mutationStatus === 'failed' && (
                  <div className="alert alert-danger">
                    {mutationError}
                  </div>
                )}

                <div className="detail-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setIsEditing(true);
                      setConfirmDelete(false);
                      dispatch(
                        clearMutationStatus()
                      );
                    }}
                  >
                    Ubah Produk
                  </button>

                  {!confirmDelete ? (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        setConfirmDelete(true);
                        dispatch(
                          clearMutationStatus()
                        );
                      }}
                    >
                      Hapus Produk
                    </button>
                  ) : (
                    <div className="confirm-row">
                      <span>
                        Yakin ingin menghapus?
                      </span>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={handleDelete}
                        disabled={
                          mutationStatus ===
                          'loading'
                        }
                      >
                        {mutationStatus ===
                        'loading'
                          ? 'Menghapus…'
                          : 'Ya, hapus'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={
                          handleCancelDelete
                        }
                        disabled={
                          mutationStatus ===
                          'loading'
                        }
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        {!isDeleted &&
          product &&
          isEditing && (
            <div className="detail-card card edit-card">
              <div className="edit-header">
                <h2>Ubah Produk</h2>

                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={handleCancelEdit}
                  disabled={
                    mutationStatus === 'loading'
                  }
                >
                  Batal
                </button>
              </div>

              {mutationStatus === 'failed' && (
                <div className="alert alert-danger">
                  {mutationError}
                </div>
              )}

              <ProductForm
                initialValues={{
                  title: product.title ?? '',
                  category: product.category ?? '',
                  price: product.price ?? '',
                  stock: product.stock ?? '',
                  brand: product.brand ?? '',
                  description: product.description ?? '',
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

        .back-link:hover {
          color: var(--color-ink);
        }

        .detail-card {
          display: grid;
          grid-template-columns: 260px 1fr;
          overflow: hidden;
        }

        .detail-thumb {
          min-height: 280px;
          background: var(--color-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .detail-thumb img {
          max-width: 100%;
          max-height: 220px;
          object-fit: contain;
        }

        .image-placeholder {
          color: var(--color-muted);
          font-size: 13px;
          text-align: center;
        }

        .detail-body {
          padding: 28px 32px;
        }

        .detail-category {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-accent-ink);
          background: color-mix(
            in srgb,
            var(--color-accent) 25%,
            transparent
          );
          padding: 3px 8px;
          border-radius: 4px;
        }

        .detail-body h1 {
          font-size: 26px;
          margin: 12px 0 10px;
        }

        .detail-desc {
          color: var(--color-ink-soft);
          line-height: 1.6;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .detail-stats {
          display: flex;
          gap: 28px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid
            var(--color-border);
          flex-wrap: wrap;
        }

        .detail-stats > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted);
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
        }

        .mono {
          font-family: var(--font-mono);
        }

        .detail-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .confirm-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--color-ink-soft);
          flex-wrap: wrap;
        }

        .edit-card {
          grid-template-columns: 1fr;
          padding: 28px 32px;
        }

        .edit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .state-message {
          padding: 48px 20px;
          text-align: center;
          color: var(--color-muted);
        }

        .state-message h2 {
          color: var(--color-ink);
          margin-bottom: 8px;
        }

        .state-message p {
          margin-bottom: 20px;
        }

        @media (max-width: 680px) {
          .detail-main {
            padding: 24px 18px 60px;
          }

          .detail-card {
            grid-template-columns: 1fr;
          }

          .detail-thumb {
            min-height: 220px;
          }

          .detail-body,
          .edit-card {
            padding: 24px 20px;
          }

          .detail-stats {
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}