import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ApiUser, FumigationDetailResponse } from '@/types/request';
import { GeneralInfoSection } from './sections/GeneralInfoSection';
import { PersonnelSection } from './sections/PersonnelSection';
import { LotDetailsSection } from './sections/LotDetailsSection';
import { SafetySection } from './sections/SafetySection';
import { SignaturesSection } from './sections/SignaturesSection';
import { CleanupData, CleanupValidationErrors } from '@/hooks/useUncoveringEvidence';

interface UncoveringFormProps {
  fumigationDetails: FumigationDetailResponse | null;
  cleanupData: CleanupData;
  setCleanupData: React.Dispatch<React.SetStateAction<CleanupData>>;
  availableTechnicians: ApiUser[];
  isEditable: boolean;
  cleanupReportSubmitted: boolean;
  validationErrors: CleanupValidationErrors;
  updateField: (field: keyof CleanupData, value: any) => void;
  updateLotDescription: (field: string, value: any) => void;
  updateSafetyConditions: (field: string, value: boolean) => void;
  addTechnician: (technician: any) => void;
  removeTechnician: (index: number) => void;
}

export const UncoveringForm: React.FC<UncoveringFormProps> = ({
  fumigationDetails,
  cleanupData,
  setCleanupData,
  availableTechnicians,
  isEditable,
  cleanupReportSubmitted,
  validationErrors,
  updateField,
  updateLotDescription,
  updateSafetyConditions,
  addTechnician,
  removeTechnician
}) => {
  // Adaptamos los datos del cleanup para el formato de fumigación que esperan los componentes
  const fumigationData = {
    fumigationId: fumigationDetails?.lot?.id?.toString() || "",
    registrationNumber: fumigationDetails?.lot?.lotNumber || "",
    company: fumigationDetails?.company?.businessName || "",
    location: fumigationDetails?.company?.address || "",
    date: cleanupData.date,
    startTime: cleanupData.startTime,
    endTime: cleanupData.endTime,
    supervisor: cleanupData.supervisor || "",
    lotDetails: {
      lotNumber: fumigationDetails?.lot?.lotNumber || "",
      tons: fumigationDetails?.lot?.tons?.toString() || "",
      quality: fumigationDetails?.lot?.quality || "",
      sacks: fumigationDetails?.lot?.sacks?.toString() || "",
      destination: fumigationDetails?.lot?.portDestination || "",
      stripsState: cleanupData.lotDescription.stripsState,
      fumigationTime: cleanupData.lotDescription.fumigationTime.toString(),
      ppmFosfina: cleanupData.lotDescription.ppmFosfina.toString()
    },
    dimensions: { height: "", width: "", length: "" },
    technicians: cleanupData.technicians.map(t => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      role: "Técnico"
    })),
    selectedTechnician: "",
    supplies: [],
    environmentalConditions: { temperature: "", humidity: "" },
    hazards: {
      electricDanger: cleanupData.industrialSafetyConditions.electricDanger,
      fallingDanger: cleanupData.industrialSafetyConditions.fallingDanger,
      hitDanger: cleanupData.industrialSafetyConditions.hitDanger,
      otherDanger: cleanupData.industrialSafetyConditions.otherDanger
    },
    observations: ""
  };

  const updateFumigationField = (field: any, value: any) => {
    if (field === 'date') {
      updateField('date', value);
    } else if (field === 'startTime') {
      updateField('startTime', value);
    } else if (field === 'endTime') {
      updateField('endTime', value);
    } else if (field === 'supervisor') {
      updateField('supervisor', value);
    } else if (field === 'lotDetails') {
      if (value.stripsState !== undefined) {
        updateLotDescription('stripsState', value.stripsState);
      }
      if (value.fumigationTime !== undefined) {
        updateLotDescription('fumigationTime', parseInt(value.fumigationTime) || 0);
      }
      if (value.ppmFosfina !== undefined) {
        updateLotDescription('ppmFosfina', parseInt(value.ppmFosfina) || 0);
      }
    }
  };

  const setFumigationData = (updateFn: any) => {
    if (typeof updateFn === 'function') {
      const currentData = fumigationData;
      const newData = updateFn(currentData);
      
      // Sincronizar cambios en técnicos
      if (JSON.stringify(newData.technicians) !== JSON.stringify(currentData.technicians)) {
        const newTechnicians = newData.technicians.map((t: any) => ({
          id: t.id,
          firstName: t.name.split(' ')[0] || '',
          lastName: t.name.split(' ').slice(1).join(' ') || ''
        }));
        
        setCleanupData(prev => ({
          ...prev,
          technicians: newTechnicians
        }));
      }

      // Sincronizar otros campos
      if (newData.date !== currentData.date) {
        updateField('date', newData.date);
      }
      if (newData.startTime !== currentData.startTime) {
        updateField('startTime', newData.startTime);
      }
      if (newData.endTime !== currentData.endTime) {
        updateField('endTime', newData.endTime);
      }
      if (newData.supervisor !== currentData.supervisor) {
        updateField('supervisor', newData.supervisor);
      }
      if (JSON.stringify(newData.lotDetails) !== JSON.stringify(currentData.lotDetails)) {
        updateFumigationField('lotDetails', newData.lotDetails);
      }
      if (JSON.stringify(newData.hazards) !== JSON.stringify(currentData.hazards)) {
        if (newData.hazards.electricDanger !== currentData.hazards.electricDanger) {
          updateSafetyConditions('electricDanger', newData.hazards.electricDanger);
        }
        if (newData.hazards.fallingDanger !== currentData.hazards.fallingDanger) {
          updateSafetyConditions('fallingDanger', newData.hazards.fallingDanger);
        }
        if (newData.hazards.hitDanger !== currentData.hazards.hitDanger) {
          updateSafetyConditions('hitDanger', newData.hazards.hitDanger);
        }
        if (newData.hazards.otherDanger !== currentData.hazards.otherDanger) {
          updateSafetyConditions('otherDanger', newData.hazards.otherDanger);
        }
      }
    }
  };



  const ValidationErrorList = ({ errors }: { errors: CleanupValidationErrors }) => {
    const errorMessages = Object.values(errors).filter(Boolean);
    
    if (errorMessages.length === 0) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Errores de validación:</Text>
        {errorMessages.map((error, index) => (
          <Text key={index} style={styles.errorItem}>• {error}</Text>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ValidationErrorList errors={validationErrors} />
      
      <GeneralInfoSection
        fumigationData={fumigationData}
        setFumigationData={setFumigationData}
        isEditable={isEditable}
        fumigationReportSubmitted={cleanupReportSubmitted}
        validationErrors={validationErrors}
        updateField={updateFumigationField}
      />

      <PersonnelSection
        fumigationData={fumigationData}
        setFumigationData={setFumigationData}
        availableTechnicians={availableTechnicians}
        isEditable={isEditable}
        fumigationReportSubmitted={cleanupReportSubmitted}
      />

      <LotDetailsSection
        fumigationData={fumigationData}
        setFumigationData={setFumigationData}
        isEditable={isEditable}
        fumigationReportSubmitted={cleanupReportSubmitted}
        validationErrors={validationErrors}
        updateField={updateFumigationField}
        mode="cleanup"
      />

      <SafetySection
        fumigationData={fumigationData}
        setFumigationData={setFumigationData}
        isEditable={isEditable}
        fumigationReportSubmitted={cleanupReportSubmitted}
        mode="cleanup"
      />


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorItem: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 4,
  },
});
