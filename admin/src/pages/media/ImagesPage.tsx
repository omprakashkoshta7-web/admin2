import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, Edit2, Search, Filter, X } from 'lucide-react';

interface ImageItem {
  _id: string;
  url: string;
  name: string;
  category: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  alt?: string;
  tags?: string[];
}

const ImagesPage: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadData, setUploadData] = useState({
    name: '',
    category: 'banner',
    alt: '',
    tags: '',
  });

  const categories = [
    { value: 'all', label: 'All Images' },
    { value: 'banner', label: 'Banners' },
    { value: 'product', label: 'Products' },
    { value: 'frame', label: 'Frames' },
    { value: 'template', label: 'Templates' },
    { value: 'icon', label: 'Icons' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockImages: ImageItem[] = [
        {
          _id: '1',
          url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
          name: 'Hero Banner 1',
          category: 'banner',
          size: 245000,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Admin',
          alt: 'Hero banner showing printing services',
          tags: ['hero', 'banner', 'main'],
        },
        {
          _id: '2',
          url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
          name: 'Product Image 1',
          category: 'product',
          size: 180000,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Admin',
          alt: 'Business cards product',
          tags: ['product', 'business-cards'],
        },
        {
          _id: '3',
          url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400',
          name: 'Frame Design 1',
          category: 'frame',
          size: 320000,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Admin',
          alt: 'Decorative frame design',
          tags: ['frame', 'design', 'decorative'],
        },
      ];
      setImages(mockImages);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadData({ ...uploadData, name: file.name.split('.')[0] });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      // Mock upload - replace with actual API call
      const newImage: ImageItem = {
        _id: Date.now().toString(),
        url: uploadPreview,
        name: uploadData.name,
        category: uploadData.category,
        size: uploadFile.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Admin',
        alt: uploadData.alt,
        tags: uploadData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      setImages([newImage, ...images]);
      setShowUploadModal(false);
      resetUploadForm();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    }
  };

  const handleEdit = (image: ImageItem) => {
    setEditingImage(image);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingImage) return;

    try {
      // Mock update - replace with actual API call
      setImages(images.map(img => 
        img._id === editingImage._id ? editingImage : img
      ));
      setShowEditModal(false);
      setEditingImage(null);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update image');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      // Mock delete - replace with actual API call
      setImages(images.filter(img => img._id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete image');
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadPreview('');
    setUploadData({
      name: '',
      category: 'banner',
      alt: '',
      tags: '',
    });
  };

  const filteredImages = images.filter(img => {
    const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         img.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || img.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Image Management</h1>
        <p className="text-gray-600">Upload and manage images used across the platform</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search images by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Upload className="w-5 h-5" />
            Upload Image
          </button>
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600 mb-4">Upload your first image to get started</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Upload Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map(image => (
            <div key={image._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
              {/* Image Preview */}
              <div className="aspect-video bg-gray-100 relative group">
                <img
                  src={image.url}
                  alt={image.alt || image.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(image)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(image._id)}
                    className="p-2 bg-white rounded-lg hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{image.name}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {image.category}
                  </span>
                  <span>{formatFileSize(image.size)}</span>
                </div>
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {image.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upload Image</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                {uploadPreview ? (
                  <div className="relative">
                    <img
                      src={uploadPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setUploadFile(null);
                        setUploadPreview('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Name *
                  </label>
                  <input
                    type="text"
                    value={uploadData.name}
                    onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter image name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={uploadData.alt}
                    onChange={(e) => setUploadData({ ...uploadData, alt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the image for accessibility"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., banner, hero, main"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || !uploadData.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Image</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingImage(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image Preview */}
              <div className="mb-6">
                <img
                  src={editingImage.url}
                  alt={editingImage.alt || editingImage.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Name *
                  </label>
                  <input
                    type="text"
                    value={editingImage.name}
                    onChange={(e) => setEditingImage({ ...editingImage, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingImage.category}
                    onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={editingImage.alt || ''}
                    onChange={(e) => setEditingImage({ ...editingImage, alt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editingImage.tags?.join(', ') || ''}
                    onChange={(e) => setEditingImage({ 
                      ...editingImage, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingImage(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesPage;
