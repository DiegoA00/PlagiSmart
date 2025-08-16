import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ApiUser } from '@/types/request';
import { GeneralInfoSection } from './sections/GeneralInfoSection';
import { PersonnelSection } from './sections/PersonnelSection';
import { LotDetailsSection } from './sections/LotDetailsSection';
import { EnvironmentalSection } from './sections/EnvironmentalSection';
import { SafetySection } from './sections/SafetySection';
import { SuppliesSection } from './sections/SuppliesSection';
import { ObservationsSection } from './sections/ObservationsSection';
import { SignaturesSection } from './sections/SignaturesSection';
import { FumigationData, ValidationErrors } from '@/hooks/useFumigationEvidence';

interface FumigationFormProps {
  fumigationData: FumigationData;
  setFumigationData: React.Dispatch<React.SetStateAction<FumigationData>>;
  availableTechnicians: ApiUser[];
  isEditable: boolean;
  fumigationReportSubmitted: boolean;
  validationErrors: ValidationErrors;
  updateField: (field: keyof FumigationData, value: any) => void;
  addToArray: (field: keyof FumigationData, item: any) => void;
  removeFromArray: (field: keyof FumigationData, index: number) => void;
}

export const FumigationForm: React.FC<FumigationFormProps> = ({
  fumigationData,
  setFumigationData,
  availableTechnicians,
  isEditable,
  fumigationReportSubmitted,
  validationErrors,
  updateField,
  addToArray,
  removeFromArray
}) => {


  const ValidationErrorList = ({ errors }: { errors: ValidationErrors }) => {
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
        fumigationReportSubmitted={fumigationReportSubmitted}
        validationErrors={validationErrors}
        updateField={updateField}
      />

      <PersonnelSection
        fumigationData={fumigationData}
        setFumigationData={setFumigationData}
        availableTechnicians={availableTechnicians}
        isEditable={isEditable}
        fumigationReportSubmitted={fumigationReportSubmitted}
      />

      <LotDetailsSection
        fumigationData={fumigationData}
        setFumigationData={setFumigationData}
        isEditable={isEditable}
        fumigationReportSubmitted={fumigationReportSubmitted}
        validationErrors={validationErrors}
        updateField={updateField}
        mode="fumigation"
      />

      <EnvironmentalSection
        fumigationData={fumigationData}
        setFumigationData={setFumigationData}
        isEditable={isEditable}
        fumigationReportSubmitted={fumigationReportSubmitted}
        validationErrors={validationErrors}
        updateField={updateField}
      />

      <SafetySection
        fumigationData={fumigationData}
        setFumigationData={setFumigationData}
        isEditable={isEditable}
        fumigationReportSubmitted={fumigationReportSubmitted}
        mode="fumigation"
      />

      <SuppliesSection
        fumigationData={fumigationData}
        setFumigationData={setFumigationData}
        isEditable={isEditable}
        fumigationReportSubmitted={fumigationReportSubmitted}
        validationErrors={validationErrors}
        updateField={updateField}
        addToArray={addToArray}
        removeFromArray={removeFromArray}
      />

      <ObservationsSection
        fumigationData={fumigationData}
        setFumigationData={setFumigationData}
        isEditable={isEditable}
        fumigationReportSubmitted={fumigationReportSubmitted}
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
