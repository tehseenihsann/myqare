'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Tag, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { TableLoader } from '@/components/ui/Loader';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive: boolean;
  providerCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const toast = useToast();
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
  });
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    minPrice: '',
    maxPrice: '',
    isActive: true,
  });
  const [iconMethod, setIconMethod] = useState<'url' | 'upload'>('url');
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [uploadedIcon, setUploadedIcon] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        toast.showError('Error', 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.showError('Error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.showError('Error', 'Image size should be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.showError('Error', 'Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedIcon(base64String);
        setIconPreview(base64String);
        setFormData({ ...formData, icon: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconMethodChange = (method: 'url' | 'upload') => {
    setIconMethod(method);
    if (method === 'url') {
      setUploadedIcon(null);
      setIconPreview(null);
      setFormData({ ...formData, icon: '' });
    } else {
      setFormData({ ...formData, icon: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const payload = {
        ...formData,
        icon: iconMethod === 'upload' && uploadedIcon ? uploadedIcon : formData.icon,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
      };

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.showSuccess(
          editingCategory ? 'Category updated' : 'Category created',
          `Category has been ${editingCategory ? 'updated' : 'created'} successfully.`
        );
        setShowForm(false);
        setEditingCategory(null);
        resetForm();
        fetchCategories();
      } else {
        const error = await response.json();
        toast.showError('Error', error.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.showError('Error', 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    const iconValue = category.icon || '';
    const isBase64 = iconValue.startsWith('data:image');
    setIconMethod(isBase64 ? 'upload' : 'url');
    setIconPreview(isBase64 ? iconValue : null);
    setUploadedIcon(isBase64 ? iconValue : null);
    setFormData({
      name: category.name,
      icon: iconValue,
      description: category.description || '',
      minPrice: category.minPrice?.toString() || '',
      maxPrice: category.maxPrice?.toString() || '',
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.category) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/categories/${deleteDialog.category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.showSuccess('Category deleted', 'Category has been deleted successfully.');
        setDeleteDialog({ isOpen: false, category: null });
        fetchCategories();
      } else {
        const error = await response.json();
        toast.showError('Error', error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.showError('Error', 'Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (response.ok) {
        toast.showSuccess(
          `Category ${!category.isActive ? 'activated' : 'deactivated'}`,
          `Category has been ${!category.isActive ? 'activated' : 'deactivated'} successfully.`
        );
        fetchCategories();
      } else {
        const error = await response.json();
        toast.showError('Error', error.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.showError('Error', 'Failed to update category');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      description: '',
      minPrice: '',
      maxPrice: '',
      isActive: true,
    });
    setIconMethod('url');
    setIconPreview(null);
    setUploadedIcon(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    resetForm();
  };

  if (loading) {
    return <TableLoader rows={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: theme.text }}>Service Categories</h2>
          <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>Manage service categories for providers</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
            setEditingCategory(null);
          }}
          className="px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors"
          style={{ backgroundColor: theme.primary }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary}
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: '1px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button
              onClick={handleCancel}
              style={{ color: theme.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.text}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.textSecondary}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                  style={{ 
                    borderColor: theme.border, 
                    borderWidth: '1px',
                    '--tw-ring-color': theme.primary
                  } as React.CSSProperties}
                  placeholder="e.g., Home Care, Medical Care"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Icon
                </label>
                <div className="space-y-3">
                  {/* Method Selection */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleIconMethodChange('url')}
                      className="flex-1 px-4 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2"
                      style={{
                        borderColor: iconMethod === 'url' ? theme.primary : theme.border,
                        backgroundColor: iconMethod === 'url' ? theme.primaryLight : theme.card,
                        color: iconMethod === 'url' ? theme.primaryDark : theme.text,
                      }}
                      onMouseEnter={(e) => {
                        if (iconMethod !== 'url') {
                          e.currentTarget.style.backgroundColor = theme.primaryLight;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (iconMethod !== 'url') {
                          e.currentTarget.style.backgroundColor = theme.card;
                        }
                      }}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Icon URL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIconMethodChange('upload')}
                      className="flex-1 px-4 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2"
                      style={{
                        borderColor: iconMethod === 'upload' ? theme.primary : theme.border,
                        backgroundColor: iconMethod === 'upload' ? theme.primaryLight : theme.card,
                        color: iconMethod === 'upload' ? theme.primaryDark : theme.text,
                      }}
                      onMouseEnter={(e) => {
                        if (iconMethod !== 'upload') {
                          e.currentTarget.style.backgroundColor = theme.primaryLight;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (iconMethod !== 'upload') {
                          e.currentTarget.style.backgroundColor = theme.card;
                        }
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Icon
                    </button>
                  </div>

                  {/* URL Input */}
                  {iconMethod === 'url' && (
                    <div>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => {
                          setFormData({ ...formData, icon: e.target.value });
                          setIconPreview(e.target.value || null);
                        }}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                        style={{ 
                          borderColor: theme.border, 
                          borderWidth: '1px',
                          '--tw-ring-color': theme.primary
                        } as React.CSSProperties}
                        placeholder="Enter icon URL or icon name (e.g., home, medical-bag, heart)"
                      />
                      {formData.icon && (
                        <div className="mt-2 p-2 rounded-lg" style={{ borderColor: theme.border, borderWidth: '1px', backgroundColor: theme.primaryLight }}>
                          <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Preview:</p>
                          {formData.icon.startsWith('http') || formData.icon.startsWith('data:') ? (
                            <div className="w-16 h-16 relative">
                              <Image
                                src={formData.icon}
                                alt="Icon preview"
                                fill
                                className="object-contain"
                                sizes="64px"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
                              <Tag className="w-8 h-8" style={{ color: theme.primary }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* File Upload */}
                  {iconMethod === 'upload' && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2"
                        style={{
                          borderColor: theme.border,
                          color: theme.textSecondary,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = theme.primary;
                          e.currentTarget.style.color = theme.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = theme.border;
                          e.currentTarget.style.color = theme.textSecondary;
                        }}
                      >
                        <ImageIcon className="w-5 h-5" />
                        <span>Choose Icon Image</span>
                      </button>
                      {iconPreview && (
                        <div className="mt-2 p-2 rounded-lg" style={{ borderColor: theme.border, borderWidth: '1px', backgroundColor: theme.primaryLight }}>
                          <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Preview:</p>
                          <div className="w-16 h-16 relative">
                            <Image
                              src={iconPreview}
                              alt="Icon preview"
                              fill
                              className="object-contain"
                              sizes="64px"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIconPreview(null);
                              setUploadedIcon(null);
                              setFormData({ ...formData, icon: '' });
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="mt-2 text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                  style={{ 
                    borderColor: theme.border, 
                    borderWidth: '1px',
                    '--tw-ring-color': theme.primary
                  } as React.CSSProperties}
                  placeholder="Describe this category..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Minimum Price (RM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                  style={{ 
                    borderColor: theme.border, 
                    borderWidth: '1px',
                    '--tw-ring-color': theme.primary
                  } as React.CSSProperties}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Maximum Price (RM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-gray-900"
                  style={{ 
                    borderColor: theme.border, 
                    borderWidth: '1px',
                    '--tw-ring-color': theme.primary
                  } as React.CSSProperties}
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded focus:ring-2"
                    style={{ 
                      accentColor: theme.primary,
                      borderColor: theme.border,
                      '--tw-ring-color': theme.primary
                    } as React.CSSProperties}
                  />
                  <span className="text-sm font-medium" style={{ color: theme.text }}>Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ 
                  borderColor: theme.border, 
                  borderWidth: '1px',
                  color: theme.text,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = theme.primaryHover)}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = theme.primary)}
              >
                <Save className="w-4 h-4" />
                {actionLoading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: '1px' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: theme.primaryLight, borderBottomColor: theme.border, borderBottomWidth: '1px' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Price Range
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Providers
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: theme.card, borderColor: theme.border }} className="divide-y">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center" style={{ color: theme.textSecondary }}>
                    No categories found. Create your first category to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} style={{ borderBottomColor: theme.border, borderBottomWidth: '1px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryLight}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.card}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {category.icon ? (
                          category.icon.startsWith('http') || category.icon.startsWith('data:') ? (
                            <div className="w-10 h-10 relative">
                              <Image
                                src={category.icon}
                                alt={category.name}
                                fill
                                className="object-contain rounded-lg"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
                              <Tag className="w-5 h-5" style={{ color: theme.primary }} />
                            </div>
                          )
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
                            <Tag className="w-5 h-5" style={{ color: theme.textSecondary }} />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.text }}>{category.name}</div>
                          {category.description && (
                            <div className="text-xs mt-1 line-clamp-1" style={{ color: theme.textSecondary }}>
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {category.minPrice || category.maxPrice ? (
                        <div className="text-sm" style={{ color: theme.text }}>
                          {category.minPrice && category.maxPrice
                            ? `RM ${category.minPrice.toFixed(2)} - RM ${category.maxPrice.toFixed(2)}`
                            : category.minPrice
                            ? `From RM ${category.minPrice.toFixed(2)}`
                            : category.maxPrice
                            ? `Up to RM ${category.maxPrice.toFixed(2)}`
                            : 'Not set'}
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: theme.textSecondary }}>Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm" style={{ color: theme.text }}>{category.providerCount || 0}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: category.isActive ? '#D1FAE5' : theme.primaryLight,
                          color: category.isActive ? '#059669' : theme.text,
                        }}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(category)}
                          disabled={actionLoading}
                          className="p-2 transition-colors disabled:opacity-50"
                          style={{ color: theme.textSecondary }}
                          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = theme.primary)}
                          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = theme.textSecondary)}
                          title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {category.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          disabled={actionLoading}
                          className="p-2 transition-colors disabled:opacity-50"
                          style={{ color: theme.primary }}
                          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = theme.primaryDark)}
                          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = theme.primary)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, category })}
                          disabled={actionLoading || (category.providerCount || 0) > 0}
                          className="p-2 text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            (category.providerCount || 0) > 0
                              ? 'Cannot delete category with providers'
                              : 'Delete'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, category: null })}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteDialog.category?.name}"? This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
        isLoading={actionLoading}
      />
    </div>
  );
}

