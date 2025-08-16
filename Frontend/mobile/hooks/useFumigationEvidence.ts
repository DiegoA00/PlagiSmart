import { useState, useEffect } from "react";
import { FumigationDetailResponse } from "@/types/request";

export interface LotDetails {
  ppmFosfina: string;
  fumigationTime: string;
  stripsState: string;
  lotNumber: string;
  tons: string;
  quality: string;
  sacks: string;
  destination: string;
}

export interface Dimensions {
  height: string;
  width: string;
  length: string;
}

export interface EnvironmentalConditions {
  temperature: string;
  humidity: string;
}

export interface Hazards {
  electricDanger: boolean;
  fallingDanger: boolean;
  hitDanger: boolean;
  otherDanger?: boolean;
}

export interface Supply {
  name: string;
  quantity: string;
  dosage: string;
  kindOfSupply: string;
  numberOfStrips: string;
}

export interface FumigationData {
  fumigationId: string;
  registrationNumber: string;
  company: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  supervisor: string;
  
  lotDetails: LotDetails;
  
  dimensions: Dimensions;
  
  environmentalConditions: EnvironmentalConditions;
  
  selectedTechnician: string;
  technicians: Array<{
    id: number;
    name: string;
    role: string;
  }>;
  
  hazards: Hazards;
  
  supplies: Supply[];
  
  observations: string;
}

export interface ValidationErrors {
  fumigationTime?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
  supervisor?: string;
  technicians?: string;
  supplies?: string;
  height?: string;
  width?: string;
  length?: string;
  temperature?: string;
  humidity?: string;
  observations?: string;
  ppmFosfina?: string;
  dimensions?: string;
}

const getCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useFumigationEvidence = (fumigationDetails: FumigationDetailResponse | null) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [fumigationData, setFumigationData] = useState<FumigationData>({
    fumigationId: "",
    registrationNumber: "",
    company: "",
    location: "",
    date: getCurrentDate(),
    startTime: "",
    endTime: "",
    supervisor: "",
    lotDetails: {
      lotNumber: "",
      tons: "",
      quality: "",
      sacks: "",
      destination: "",
      ppmFosfina: "",
      fumigationTime: "",
      stripsState: ""
    },
    dimensions: {
      height: "",
      width: "",
      length: ""
    },
    environmentalConditions: {
      temperature: "",
      humidity: ""
    },
    selectedTechnician: "",
    technicians: [],
    hazards: {
      electricDanger: false,
      fallingDanger: false,
      hitDanger: false
    },
    supplies: [],
    observations: ""
  });

  useEffect(() => {
    console.log('=== USE FUMIGATION EVIDENCE EFFECT ===');
    console.log('Fumigation details:', fumigationDetails);
    
    if (fumigationDetails) {
      // Handle the actual API response structure
      const lotData = fumigationDetails.lot || fumigationDetails;
      const companyData = fumigationDetails.company;
      
      console.log('Lot data:', lotData);
      console.log('Company data:', companyData);
      
      setFumigationData(prev => ({
        ...prev,
        fumigationId: lotData.id?.toString() || "",
        registrationNumber: lotData.lotNumber || "",
        company: companyData?.businessName || "Empresa no disponible",
        location: companyData?.address || "Ubicación no disponible",
        supervisor: "",
        lotDetails: {
          lotNumber: lotData.lotNumber || "",
          tons: lotData.tons?.toString() || (lotData as any).ton?.toString() || "",
          quality: lotData.quality || "",
          sacks: lotData.sacks?.toString() || "",
          destination: lotData.portDestination || "",
          ppmFosfina: "",
          fumigationTime: "",
          stripsState: ""
        }
      }));
    }
  }, [fumigationDetails]);

  const validateFumigationForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!fumigationData.startTime || fumigationData.startTime.trim() === "") {
      errors.startTime = "La hora de inicio es requerida";
    }
    
    if (!fumigationData.endTime || fumigationData.endTime.trim() === "") {
      errors.endTime = "La hora de finalización es requerida";
    }
    
    if (fumigationData.startTime && fumigationData.endTime) {
      const startTime = new Date(`2000-01-01T${fumigationData.startTime}`);
      const endTime = new Date(`2000-01-01T${fumigationData.endTime}`);
      
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
    
    if (!fumigationData.supervisor || fumigationData.supervisor.trim() === "") {
      errors.supervisor = "El supervisor es requerido";
    }
    
    if (fumigationData.technicians.length === 0) {
      errors.technicians = "Se requiere al menos un técnico";
    }
    
    if (fumigationData.supplies.length === 0) {
      errors.supplies = "Se requiere al menos un insumo";
    }
    
    if (!fumigationData.dimensions.height || fumigationData.dimensions.height.trim() === "") {
      errors.height = "La altura es requerida";
    }
    
    if (!fumigationData.dimensions.width || fumigationData.dimensions.width.trim() === "") {
      errors.width = "El ancho es requerido";
    }
    
    if (!fumigationData.dimensions.length || fumigationData.dimensions.length.trim() === "") {
      errors.length = "La longitud es requerida";
    }
    
    if (!fumigationData.environmentalConditions.temperature || fumigationData.environmentalConditions.temperature.trim() === "") {
      errors.temperature = "La temperatura es requerida";
    }
    
    if (!fumigationData.environmentalConditions.humidity || fumigationData.environmentalConditions.humidity.trim() === "") {
      errors.humidity = "La humedad es requerida";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  const updateField = (field: keyof FumigationData, value: any) => {
    setFumigationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addToArray = (field: keyof FumigationData, item: any) => {
    setFumigationData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), item]
    }));
  };

  const removeFromArray = (field: keyof FumigationData, index: number) => {
    setFumigationData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    const initialData = {
      fumigationId: "",
      registrationNumber: "",
      company: "",
      location: "",
      date: getCurrentDate(),
      startTime: "",
      endTime: "",
      supervisor: "",
      lotDetails: {
        lotNumber: "",
        tons: "",
        quality: "",
        sacks: "",
        destination: "",
        ppmFosfina: "",
        fumigationTime: "",
        stripsState: ""
      },
      dimensions: {
        height: "",
        width: "",
        length: ""
      },
      environmentalConditions: {
        temperature: "",
        humidity: ""
      },
      selectedTechnician: "",
      technicians: [],
      hazards: {
        electricDanger: false,
        fallingDanger: false,
        hitDanger: false
      },
      supplies: [],
          observations: ""
    };

    if (fumigationDetails) {
      const lotData = fumigationDetails.lot || fumigationDetails;
      const companyData = fumigationDetails.company;
      
      initialData.fumigationId = lotData.id?.toString() || "";
      initialData.registrationNumber = lotData.lotNumber || "";
      initialData.company = companyData?.businessName || "Empresa no disponible";
      initialData.location = companyData?.address || "Ubicación no disponible";
      initialData.lotDetails = {
        lotNumber: lotData.lotNumber || "",
        tons: lotData.tons?.toString() || (lotData as any).ton?.toString() || "",
        quality: lotData.quality || "",
        sacks: lotData.sacks?.toString() || "",
        destination: lotData.portDestination || "",
        ppmFosfina: "",
        fumigationTime: "",
        stripsState: ""
      };
    }

    setFumigationData(initialData);
    setValidationErrors({});
  };

  return {
    fumigationData,
    setFumigationData,
    validateFumigationForm,
    validationErrors,
    clearValidationErrors,
    updateField,
    addToArray,
    removeFromArray,
    resetForm
  };
};
