import { useState, useEffect } from "react";
import { FumigationDetailResponse } from "@/types/request";

export interface CleanupLotDescription {
  stripsState: string;
  fumigationTime: number;
  ppmFosfina: number;
}

export interface CleanupIndustrialSafetyConditions {
  electricDanger: boolean;
  fallingDanger: boolean;
  hitDanger: boolean;
  otherDanger: boolean;
}

export interface CleanupTechnician {
  id: number;
  firstName: string;
  lastName: string;
}

export interface CleanupData {
  date: string;
  startTime: string;
  endTime: string;
  supervisor: string;
  technicians: CleanupTechnician[];
  lotDescription: CleanupLotDescription;
  industrialSafetyConditions: CleanupIndustrialSafetyConditions;
}

export interface CleanupValidationErrors {
  date?: string;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
  supervisor?: string;
  technicians?: string;
  stripsState?: string;
  fumigationTime?: string;
  ppmFosfina?: string;
}

const getCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useUncoveringEvidence = (fumigationDetails: FumigationDetailResponse | null) => {
  const [validationErrors, setValidationErrors] = useState<CleanupValidationErrors>({});
  const [cleanupData, setCleanupData] = useState<CleanupData>({
    date: getCurrentDate(),
    startTime: "",
    endTime: "",
    supervisor: "",
    technicians: [],
    lotDescription: {
      stripsState: "",
      fumigationTime: 0,
      ppmFosfina: 0
    },
    industrialSafetyConditions: {
      electricDanger: false,
      fallingDanger: false,
      hitDanger: false,
      otherDanger: false
    },

  });

  useEffect(() => {
    if (fumigationDetails?.lot?.id && fumigationDetails?.company) {
      setCleanupData(prev => ({
        ...prev,
        supervisor: ""
      }));
    }
  }, [fumigationDetails]);

  const validateForm = (): boolean => {
    const errors: CleanupValidationErrors = {};
    
    if (!cleanupData.startTime || cleanupData.startTime.trim() === "") {
      errors.startTime = "La hora de inicio es requerida";
    }
    
    if (!cleanupData.endTime || cleanupData.endTime.trim() === "") {
      errors.endTime = "La hora de finalización es requerida";
    }
    
    if (cleanupData.startTime && cleanupData.endTime) {
      const startTime = new Date(`2000-01-01T${cleanupData.startTime}`);
      const endTime = new Date(`2000-01-01T${cleanupData.endTime}`);
      
      if (endTime <= startTime) {
        errors.timeRange = "La hora de finalización debe ser posterior a la hora de inicio";
      }
      
      // Validar que la diferencia sea al menos de 1 minuto
      const timeDiff = endTime.getTime() - startTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      if (minutesDiff < 1) {
        errors.timeRange = "La hora de finalización debe ser al menos 1 minuto después de la hora de inicio";
      }
    }
    
    if (!cleanupData.supervisor || cleanupData.supervisor.trim() === "") {
      errors.supervisor = "El supervisor es requerido";
    }
    
    if (cleanupData.technicians.length === 0) {
      errors.technicians = "Se requiere al menos un técnico";
    }
    
    if (!cleanupData.lotDescription.stripsState || cleanupData.lotDescription.stripsState.trim() === "") {
      errors.stripsState = "El estado de las cintas es requerido";
    }
    
    if (!cleanupData.lotDescription.fumigationTime || cleanupData.lotDescription.fumigationTime <= 0) {
      errors.fumigationTime = "El tiempo de fumigación es requerido y debe ser mayor a 0";
    }
    
    if (!cleanupData.lotDescription.ppmFosfina || cleanupData.lotDescription.ppmFosfina <= 0) {
      errors.ppmFosfina = "PPM Fosfina es requerido y debe ser mayor a 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  const updateField = (field: keyof CleanupData, value: any) => {
    setCleanupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateLotDescription = (field: string, value: any) => {
    setCleanupData(prev => ({
      ...prev,
      lotDescription: {
        ...prev.lotDescription,
        [field]: value
      }
    }));
  };

  const updateSafetyConditions = (field: string, value: boolean) => {
    setCleanupData(prev => ({
      ...prev,
      industrialSafetyConditions: {
        ...prev.industrialSafetyConditions,
        [field]: value
      }
    }));
  };

  const addTechnician = (technician: CleanupTechnician) => {
    setCleanupData(prev => ({
      ...prev,
      technicians: [...prev.technicians, technician]
    }));
  };

  const removeTechnician = (index: number) => {
    setCleanupData(prev => ({
      ...prev,
      technicians: prev.technicians.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    const initialData = {
      date: getCurrentDate(),
      startTime: "",
      endTime: "",
      supervisor: "",
      technicians: [],
      lotDescription: {
        stripsState: "",
        fumigationTime: 0,
        ppmFosfina: 0
      },
      industrialSafetyConditions: {
        electricDanger: false,
        fallingDanger: false,
        hitDanger: false,
        otherDanger: false
      },

    };

    setCleanupData(initialData);
    setValidationErrors({});
  };

  return {
    cleanupData,
    setCleanupData,
    validateForm,
    validationErrors,
    clearValidationErrors,
    updateField,
    updateLotDescription,
    updateSafetyConditions,
    addTechnician,
    removeTechnician,
    resetForm
  };
};
