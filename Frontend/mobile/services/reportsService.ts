import { apiService } from "./api/apiService";
import { FumigationReportResponse, CleanupReportResponse } from "@/types/request";

interface FumigationReportRequest {
  id: number;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  technicians: { id: number }[];
  supplies: {
    name: string;
    quantity: number;
    dosage: string;
    kindOfSupply: string;
    numberOfStrips: string;
  }[];
  dimensions: {
    height: number;
    width: number;
    length: number;
  };
  environmentalConditions: {
    temperature: number;
    humidity: number;
  };
  industrialSafetyConditions: {
    electricDanger: boolean;
    fallingDanger: boolean;
    hitDanger: boolean;
  };
  observations: string;
  supervisor: string;
}

interface CleanupReportRequest {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  technicians: { id: number }[];
  lotDescription: {
    stripsState: string;
    fumigationTime: number;
    ppmFosfina: number;
  };
  industrialSafetyConditions: {
    electricDanger: boolean;
    fallingDanger: boolean;
    hitDanger: boolean;
    otherDanger: boolean;
  };
  supervisor: string;
}

interface ApiResponse {
  message: string;
}

const isReportNotFoundError = (error: any, reportType?: string): boolean => {
  const errorMessage = error.message || "";
  
  const fumigationNotFound = (
    errorMessage.includes("FumigationReportNotFoundException") ||
    errorMessage.includes("No report found for fumigation ID")
  );
  
  const cleanupNotFound = (
    errorMessage.includes("CleanupReportNotFoundException") ||
    errorMessage.includes("No cleanup report found") ||
    errorMessage.includes("cleanup report not found")
  );
  
  const generalNotFound = (
    errorMessage.includes("NotFoundException") ||
    errorMessage.includes("not found") ||
    errorMessage.includes("Not found")
  );

  if (reportType === 'fumigation') {
    return fumigationNotFound || generalNotFound;
  } else if (reportType === 'cleanup') {
    return cleanupNotFound || generalNotFound;
  }
  
  return fumigationNotFound || cleanupNotFound || generalNotFound;
};

export const reportsService = {
  createFumigationReport: async (data: FumigationReportRequest): Promise<ApiResponse> => {
    try {
      console.log('=== CREATING FUMIGATION REPORT ===');
      console.log('Request data:', JSON.stringify(data, null, 2));
      console.log('Request endpoint:', '/reports/fumigations');
      
      const response = await apiService.post('/reports/fumigations', data);
      console.log('API Response:', response);
      console.log('API Response success:', response.success);
      console.log('API Response data:', response.data);
      console.log('API Response message:', response.message);
      
      if (response.success) {
        console.log('Report created successfully:', response.data);
        return response.data;
      } else {
        console.error('API returned error:', response.message);
        throw new Error(response.message || "Error al crear el reporte de fumigación");
      }
    } catch (error: any) {
      console.error('Exception in createFumigationReport:', error);
      throw new Error(error.message || "Error al crear el reporte de fumigación");
    }
  },

  createCleanupReport: async (data: CleanupReportRequest): Promise<ApiResponse> => {
    try {
      console.log('=== CREATING CLEANUP REPORT ===');
      console.log('Request data:', JSON.stringify(data, null, 2));
      console.log('Request endpoint:', '/reports/cleanup');
      
      const response = await apiService.post('/reports/cleanup', data);
      console.log('API Response:', response);
      console.log('API Response success:', response.success);
      console.log('API Response data:', response.data);
      console.log('API Response message:', response.message);
      
      if (response.success) {
        console.log('Report created successfully:', response.data);
        return response.data;
      } else {
        console.error('API returned error:', response.message);
        throw new Error(response.message || "Error al crear el reporte de descarpe");
      }
    } catch (error: any) {
      console.error('Exception in createCleanupReport:', error);
      throw new Error(error.message || "Error al crear el reporte de descarpe");
    }
  },

  getFumigationReport: async (fumigationId: number): Promise<FumigationReportResponse> => {
    try {
      const response = await apiService.get(`/reports/fumigations/by-fumigation/${fumigationId}`);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Error al obtener el reporte");
      }
    } catch (error: any) {
      console.log(`Error getting fumigation report for ID ${fumigationId}:`, error);

      if (isReportNotFoundError(error, 'fumigation')) {
        const notFoundError = new Error("REPORT_NOT_FOUND");
        (notFoundError as any).status = 404;
        (notFoundError as any).originalMessage = error.message;
        throw notFoundError;
      }
      
      const genericError = new Error("UNKNOWN_ERROR");
      (genericError as any).status = 0;
      (genericError as any).originalMessage = error.message;
      throw genericError;
    }
  },

  getCleanupReport: async (fumigationId: number): Promise<CleanupReportResponse> => {
    try {
      console.log(`Requesting cleanup report for fumigation ID: ${fumigationId}`);
      const response = await apiService.get(`/reports/cleanup/by-fumigation/${fumigationId}`);
      if (response.success) {
        console.log(`Cleanup report response:`, response.data);
        return response.data;
      } else {
        throw new Error(response.message || "Error al obtener el reporte");
      }
    } catch (error: any) {
      console.log(`Error getting cleanup report for ID ${fumigationId}:`, error);

      if (isReportNotFoundError(error, 'cleanup')) {
        const notFoundError = new Error("REPORT_NOT_FOUND");
        (notFoundError as any).status = 404;
        (notFoundError as any).originalMessage = error.message;
        throw notFoundError;
      }
      
      const genericError = new Error("UNKNOWN_ERROR");
      (genericError as any).status = 0;
      (genericError as any).originalMessage = error.message;
      throw genericError;
    }
  }
};
