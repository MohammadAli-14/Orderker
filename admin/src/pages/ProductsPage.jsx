import { useState } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../lib/api";
import { getStockStatusBadge, formatCurrency } from "../lib/utils";

function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    isFlashSale: false,
    discountPercent: 0,
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const queryClient = useQueryClient();

  // fetch some data
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAll,
  });

  // creating, update, deleting
  const createProductMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const closeModal = () => {
    // reset the state
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      isFlashSale: false,
      discountPercent: 0,
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
      isFlashSale: product.isFlashSale || false,
      discountPercent: product.discountPercent || 0,
    });
    setImagePreviews(product.images);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) return alert("Maximum 3 images allowed");

    // revoke previous blob URLs to free memory
    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // for new products, require images
    if (!editingProduct && imagePreviews.length === 0) {
      return alert("Please upload at least one image");
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("isFlashSale", formData.isFlashSale);
    formDataToSend.append("discountPercent", formData.discountPercent);

    // only append new images if they were selected
    if (images.length > 0) images.forEach((image) => formDataToSend.append("images", image));

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, formData: formDataToSend });
    } else {
      createProductMutation.mutate(formDataToSend);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-base-content/70 mt-1">Manage your product inventory</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {products?.map((product) => {
          const status = getStockStatusBadge(product.stock);

          return (
            <div key={product._id} className="glass-card rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="avatar">
                  <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                  <div className="flex flex-row justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="card-title text-lg sm:text-xl truncate justify-center sm:justify-start">{product.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-base-content/70 text-sm">{product.category}</p>
                        {product.isFlashSale && (
                          <div className="badge badge-error border-none font-black text-[9px] px-1.5 py-0 h-4">⚡ FLASH SALE</div>
                        )}
                      </div>
                    </div>
                    <div className={`badge ${status.class} shrink-0 whitespace-nowrap`}>{status.text}</div>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-8 mt-4 bg-base-200/50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                    <div>
                      <p className="text-xs text-base-content/70 uppercase tracking-wide">Price</p>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-xl text-primary">
                          {formatCurrency(product.isFlashSale ? Math.round(product.price * (1 - (product.discountPercent || 0) / 100)) : product.price)}
                        </p>
                        {product.isFlashSale && (
                          <p className="text-xs text-base-content/50 line-through">
                            {formatCurrency(product.price)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-base-300 sm:hidden"></div>
                    <div>
                      <p className="text-xs text-base-content/70 uppercase tracking-wide">Stock</p>
                      <p className="font-bold text-lg">{product.stock} units</p>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-square btn-ghost"
                    onClick={() => handleEdit(product)}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="btn btn-square btn-ghost text-error"
                    onClick={() => deleteProductMutation.mutate(product._id)}
                  >
                    {deleteProductMutation.isPending ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <Trash2Icon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD/EDIT PRODUCT MODAL */}

      <input type="checkbox" className="modal-toggle" checked={showModal} readOnly />

      <div className="modal">
        <div className="modal-box max-w-2xl p-8 rounded-3xl backdrop-blur-3xl bg-white/90 border border-white/40 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>

            <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span>Product Name</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter product name"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Category</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Sabzi">Sabzi (Vegetables)</option>
                  <option value="Phal">Phal (Fruits)</option>
                  <option value="Staples">Staples</option>
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Masalay">Masalay (Spices)</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Household">Household</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span>Price (Rs.)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="0"
                  className="input input-bordered"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Stock</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* FLASH SALE SECTION */}
            <div className="p-4 bg-error/5 rounded-xl border border-error/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-error/20 flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Flash Sale</p>
                    <p className="text-[10px] text-base-content/60">Apply discount to this product</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-error"
                  checked={formData.isFlashSale}
                  onChange={(e) => setFormData({ ...formData, isFlashSale: e.target.checked })}
                />
              </div>

              {formData.isFlashSale && (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                  <div className="form-control">
                    <label className="label">
                      <span className="text-xs font-semibold">Discount Percent (%)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="50"
                      className="input input-sm input-bordered border-error/20 focus:border-error"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="text-xs font-semibold">Sale Price Preview</span>
                    </label>
                    <div className="h-10 px-3 flex items-center bg-error/10 rounded-lg border border-error/20">
                      <span className="font-black text-error">
                        {formatCurrency(Math.round(Number(formData.price) * (1 - (formData.discountPercent || 0) / 100)))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span>Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Product Images
                </span>
                <span className="label-text-alt text-xs opacity-60">Max 3 images</span>
              </label>

              <div className="bg-base-200 rounded-xl p-4 border-2 border-dashed border-base-300 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input file-input-bordered file-input-primary w-full"
                  required={!editingProduct}
                />

                {editingProduct && (
                  <p className="text-xs text-base-content/60 mt-2 text-center">
                    Leave empty to keep current images
                  </p>
                )}
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="avatar">
                      <div className="w-20 rounded-lg">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={closeModal}
                className="btn"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {createProductMutation.isPending || updateProductMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
