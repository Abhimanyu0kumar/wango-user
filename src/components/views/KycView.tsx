'use client';

import { useState, useEffect } from 'react';
import { kycService } from '@/src/services';

export function KycView() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [kycStatus, setKycStatus] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    document_type: 'aadhaar' as 'passport' | 'drivers_license' | 'national_id' | 'aadhaar' | 'pan_card',
    document_number: '',
    front_image: null as File | null,
    back_image: null as File | null,
    selfie_image: null as File | null,
  });

  const handleFileChange = (field: 'front_image' | 'back_image' | 'selfie_image', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!formData.front_image || !formData.selfie_image) {
        setError('Front image and selfie are required');
        setIsLoading(false);
        return;
      }

      await kycService.submitKyc({
        document_type: formData.document_type,
        document_number: formData.document_number,
        front_image: formData.front_image,
        back_image: formData.back_image || undefined,
        selfie_image: formData.selfie_image,
      });
      setSuccess('KYC documents submitted successfully!');
      setFormData({
        document_type: 'aadhaar',
        document_number: '',
        front_image: null,
        back_image: null,
        selfie_image: null,
      });
      // Refresh KYC status
      const status = await kycService.getKycStatus();
      setKycStatus(status.data);
    } catch (err: any) {
      setError(err.message || 'Failed to submit KYC documents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadKycStatus = async () => {
    try {
      const status = await kycService.getKycStatus();
      setKycStatus(status.data);
    } catch (err) {
      console.error('Failed to load KYC status:', err);
    }
  };

  useEffect(() => {
    loadKycStatus();
  }, []);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-gray-500';
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-green-500';
      case 3: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Not Submitted';
      case 1: return 'Pending Review';
      case 2: return 'Verified';
      case 3: return 'Rejected';
      default: return 'Unknown';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">KYC Verification</h2>

      {/* KYC Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={`w-4 h-4 rounded-full ${getStatusColor(kycStatus?.kyc_status || 0)}`}></span>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Status: {getStatusLabel(kycStatus?.kyc_status || 0)}
          </h3>
        </div>

        {kycStatus?.documents && kycStatus.documents.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Submitted Documents</h4>
            {kycStatus.documents.map((doc: any) => (
              <div key={doc.id} className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium">{doc.document_type}</span> - {doc.status}
                {doc.rejection_reason && (
                  <p className="text-red-500 mt-1">Reason: {doc.rejection_reason}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KYC Submission Form */}
      {(kycStatus?.kyc_status === 0 || kycStatus?.kyc_status === 3) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {kycStatus?.kyc_status === 3 ? 'Resubmit KYC Documents' : 'Submit KYC Documents'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Type *
              </label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="national_id">National ID</option>
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan_card">PAN Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Number *
              </label>
              <input
                type="text"
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter document number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Front Image *
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange('front_image', e)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              {formData.front_image && (
                <p className="text-sm text-gray-500 mt-1">{formData.front_image.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Back Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange('back_image', e)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {formData.back_image && (
                <p className="text-sm text-gray-500 mt-1">{formData.back_image.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Selfie Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('selfie_image', e)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              {formData.selfie_image && (
                <p className="text-sm text-gray-500 mt-1">{formData.selfie_image.name}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
            >
              {isLoading ? 'Submitting...' : 'Submit KYC Documents'}
            </button>
          </form>
        </div>
      )}

      {kycStatus?.kyc_status === 1 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            Your KYC documents are under review. We will notify you once verification is complete.
          </p>
        </div>
      )}

      {kycStatus?.kyc_status === 2 && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <p className="text-green-800 dark:text-green-200">
            ✓ Your KYC has been verified successfully!
          </p>
        </div>
      )}
    </div>
  );
}
