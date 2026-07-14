import { useState } from 'react';

const emptyForm = {
  title: '',
  category: '',
  price: '',
  stock: '',
  brand: '',
  description: '',
};

export default function ProductForm({
  initialValues,
  submitLabel = 'Simpan',
  isSubmitting = false,
  onSubmit,
}) {
  const [values, setValues] = useState({ ...emptyForm, ...initialValues });

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...values,
      price: values.price === '' ? undefined : Number(values.price),
      stock: values.stock === '' ? undefined : Number(values.stock),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="field">
        <span>Nama produk</span>
        <input
          type="text"
          value={values.title}
          onChange={handleChange('title')}
          placeholder="BMW Pencil"
          required
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Kategori</span>
          <input
            type="text"
            value={values.category}
            onChange={handleChange('category')}
            placeholder="stationery"
          />
        </label>
        <label className="field">
          <span>Merek</span>
          <input
            type="text"
            value={values.brand}
            onChange={handleChange('brand')}
            placeholder="BMW"
          />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Harga (USD)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={handleChange('price')}
            placeholder="10"
          />
        </label>
        <label className="field">
          <span>Stok</span>
          <input
            type="number"
            min="0"
            value={values.stock}
            onChange={handleChange('stock')}
            placeholder="50"
          />
        </label>
      </div>

      <label className="field">
        <span>Deskripsi</span>
        <textarea
          value={values.description}
          onChange={handleChange('description')}
          placeholder="Deskripsi singkat produk"
        />
      </label>

      <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan…' : submitLabel}
      </button>

      <style>{`
        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
      `}</style>
    </form>
  );
}
