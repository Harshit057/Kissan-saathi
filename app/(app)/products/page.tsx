'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CROPS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

interface AgroProduct {
  id: string;
  productName: string;
  productDesc: string;
  price: number;
  quantity?: number;
  createdAt: string;
}

interface AgroProductFormData {
  productName: string;
  productDesc: string;
  price: number;
  quantity?: number;
}

export function AgroProductsPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [products, setProducts] = useState<AgroProduct[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AgroProductFormData>();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const onSubmit = async (data: AgroProductFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(editingId ? 'Failed to update product' : 'Failed to add product');
      }

      setSuccess(true);
      reset();
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      fetchProducts();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const handleEdit = (product: AgroProduct) => {
    setEditingId(product.id);
    setIsEditing(true);
    setShowForm(true);
    // Populate form with product data
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">My Agroproducts</h1>
            <p className="text-muted-text mt-2">Manage and list your farm products for sale</p>
          </div>
          <Button 
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              setEditingId(null);
              reset();
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Product {editingId ? 'updated' : 'added'} successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <Select onValueChange={(value) => register('productName').onChange({ target: { value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select or type product" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROPS.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.productName && <p className="text-xs text-red-600 mt-1">Product name is required</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    placeholder="Describe your product quality, variety, origin..."
                    {...register('productDesc', { required: 'Description is required' })}
                    rows={4}
                  />
                  {errors.productDesc && <p className="text-xs text-red-600 mt-1">{errors.productDesc.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price per kg (₹) *</label>
                    <Input
                      type="number"
                      placeholder="100"
                      {...register('price', { required: 'Price is required', min: 1 })}
                    />
                    {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity (kg)</label>
                    <Input
                      type="number"
                      placeholder="1000"
                      {...register('quantity')}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {loading ? 'Saving...' : 'Save Product'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-muted-text mb-4">No products added yet</p>
              <Button onClick={() => setShowForm(true)}>Add Your First Product</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="shadow-md hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">{product.productName}</h3>
                  <p className="text-sm text-muted-text mb-4 line-clamp-3">{product.productDesc}</p>
                  
                  <div className="bg-primary/10 rounded-lg p-4 mb-4">
                    <p className="text-2xl font-bold text-primary">₹{product.price}/kg</p>
                    {product.quantity && (
                      <p className="text-xs text-muted-text mt-1">Available: {product.quantity} kg</p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
