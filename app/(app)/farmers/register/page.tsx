'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { STATES, DISTRICTS, CROPS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

interface FarmerFormData {
  name: string;
  aadharNumber: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: string;
  state: string;
  district: string;
  farming_type: string;
  crops: string[];
}

export function FarmerRegistrationPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FarmerFormData>({
    defaultValues: {
      gender: 'male',
      crops: [],
    },
  });

  const state = watch('state');

  const onSubmit = async (data: FarmerFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Submit farmer registration
      const response = await fetch('/api/farmers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          crops: selectedCrops,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register farmer');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Registration Successful!</h2>
            <p className="text-muted-text">Your farmer profile has been created successfully. Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Register Your Farmer Profile</CardTitle>
            <CardDescription>Complete information about your farming details and land</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    placeholder="Your full name"
                    {...register('name', { required: 'Name is required' })}
                    error={!!errors.name}
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Aadhar Number *</label>
                    <Input
                      placeholder="12345678901234"
                      {...register('aadharNumber', { required: 'Aadhar is required' })}
                      maxLength={12}
                    />
                    {errors.aadharNumber && <p className="text-xs text-red-600 mt-1">{errors.aadharNumber.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Age *</label>
                    <Input
                      type="number"
                      placeholder="30"
                      {...register('age', { required: 'Age is required', min: 18 })}
                    />
                    {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Gender *</label>
                    <Select defaultValue="male" onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <Input
                      placeholder="10-digit number"
                      {...register('phoneNumber', { required: 'Phone is required' })}
                      maxLength={10}
                    />
                    {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber.message}</p>}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Location Information</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Address *</label>
                  <Textarea
                    placeholder="Enter your full address"
                    {...register('address', { required: 'Address is required' })}
                    rows={3}
                  />
                  {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <Select 
                      onValueChange={(value) => {
                        setValue('state', value);
                        setSelectedState(value);
                        setValue('district', '');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">District *</label>
                    <Select onValueChange={(value) => setValue('district', value)}>
                      <SelectTrigger disabled={!selectedState}>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedState && DISTRICTS[selectedState] ? (
                          DISTRICTS[selectedState].map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>Select a state first</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.district && <p className="text-xs text-red-600 mt-1">{errors.district.message}</p>}
                  </div>
                </div>
              </div>

              {/* Farming Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Farming Information</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Type of Farming *</label>
                  <Input
                    placeholder="e.g., Organic, Traditional, Modern"
                    {...register('farming_type', { required: 'Farming type is required' })}
                  />
                  {errors.farming_type && <p className="text-xs text-red-600 mt-1">{errors.farming_type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Crops Grown</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                    {CROPS.map((crop) => (
                      <label key={crop} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCrops.includes(crop)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCrops([...selectedCrops, crop]);
                            } else {
                              setSelectedCrops(selectedCrops.filter(c => c !== crop));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{crop}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Registering...' : 'Register Farmer Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
