import { apiClient } from './api';
import type { ApiResponse } from '@/src/types';

interface KycStatusResponse {
  data: {
    kyc_status: number;
    kyc_status_label: string;
    documents: any[];
  };
}

interface KycDocument {
  id: number;
  user_id: number;
  document_type: string;
  document_number: string;
  front_image_url: string;
  back_image_url: string | null;
  selfie_image_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  expires_at: string | null;
}

export const kycService = {
  async getKycStatus(): Promise<KycStatusResponse> {
    return apiClient.get<KycStatusResponse>('/kyc');
  },

  async submitKyc(data: {
    document_type: 'passport' | 'drivers_license' | 'national_id' | 'aadhaar' | 'pan_card';
    document_number: string;
    front_image: File;
    back_image?: File;
    selfie_image: File;
  }): Promise<ApiResponse<KycDocument>> {
    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('document_number', data.document_number);
    formData.append('front_image', data.front_image);
    if (data.back_image) {
      formData.append('back_image', data.back_image);
    }
    formData.append('selfie_image', data.selfie_image);

    return apiClient.post<ApiResponse<KycDocument>>('/kyc', formData);
  },

  async updateKyc(data: {
    document_type: 'passport' | 'drivers_license' | 'national_id' | 'aadhaar' | 'pan_card';
    document_number: string;
    front_image: File;
    back_image?: File;
    selfie_image: File;
  }): Promise<ApiResponse<KycDocument>> {
    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('document_number', data.document_number);
    formData.append('front_image', data.front_image);
    if (data.back_image) {
      formData.append('back_image', data.back_image);
    }
    formData.append('selfie_image', data.selfie_image);

    return apiClient.put<ApiResponse<KycDocument>>('/kyc', formData);
  },
};
