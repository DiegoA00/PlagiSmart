import { apiService } from "./api/apiService";

export interface SignatureUploadRequest {
  fumigationId?: number | null;
  cleanupId?: number | null;
  signatureType: 'technician' | 'client';
  signatureData: string;
}

export const signatureService = {
  uploadSignature: async (request: SignatureUploadRequest) => {
    try {
      console.log('=== UPLOADING SIGNATURE ===');
      console.log('Request:', JSON.stringify(request, null, 2));
      
      const response = await apiService.post('/signatures', request);
      console.log('Signature upload response:', response);
      
      if (response.success) {
        console.log('Signature uploaded successfully:', response.data);
        return response.data;
      } else {
        console.error('API returned error:', response.message);
        throw new Error(response.message || "Error al subir la firma");
      }
    } catch (error: any) {
      console.error('Exception in uploadSignature:', error);
      throw new Error(error.message || "Error al subir la firma");
    }
  }
};
