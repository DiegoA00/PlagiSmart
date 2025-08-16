import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { FumigationDetailResponse, ApiUser } from '@/types/request';
import { usersService } from '@/services/usersService';
import { reportsService } from '@/services/reportsService';
import { signatureService } from '@/services/signatureService';
import { FumigationForm } from './FumigationForm';
import { UncoveringForm } from './UncoveringForm';
import { SignatureConfirmationModal } from '../SignatureConfirmationModal';
import { useFumigationEvidence } from '@/hooks/useFumigationEvidence';
import { useUncoveringEvidence } from '@/hooks/useUncoveringEvidence';

interface TechnicianEvidenceOverlayProps {
  visible: boolean;
  fumigationDetails: FumigationDetailResponse | null;
  isEditable?: boolean;
  fumigationStatus?: string | null;
  onClose?: () => void;
  onSave?: (data: any) => void;
  loading?: boolean;
}

export const TechnicianEvidenceOverlay: React.FC<TechnicianEvidenceOverlayProps> = ({
  visible,
  fumigationDetails,
  isEditable = true,
  fumigationStatus,
  onClose,
  onSave,
  loading = false
}) => {
  const [availableTechnicians, setAvailableTechnicians] = useState<ApiUser[]>([]);
  const [showSignatureConfirmation, setShowSignatureConfirmation] = useState(false);
  const [fumigationReportSubmitted, setFumigationReportSubmitted] = useState(false);
  const [cleanupReportSubmitted, setCleanupReportSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportId, setReportId] = useState<number | null>(null);
  
  const {
    fumigationData,
    setFumigationData,
    validateFumigationForm,
    validationErrors: fumigationValidationErrors,
    clearValidationErrors: clearFumigationValidationErrors,
    updateField: updateFumigationField,
    addToArray: addToFumigationArray,
    removeFromArray: removeFromFumigationArray,
    resetForm: resetFumigationForm
  } = useFumigationEvidence(fumigationDetails);

  const {
    cleanupData,
    setCleanupData,
    validateForm: validateCleanupForm,
    validationErrors: cleanupValidationErrors,
    clearValidationErrors: clearCleanupValidationErrors,
    updateField: updateCleanupField,
    updateLotDescription,
    updateSafetyConditions,
    addTechnician: addCleanupTechnician,
    removeTechnician: removeCleanupTechnician,
    resetForm: resetCleanupForm
  } = useUncoveringEvidence(fumigationDetails);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        console.log('=== LOADING TECHNICIANS ===');
        const response = await usersService.getUsersByRole('TECHNICIAN');
        console.log('Technicians response:', response);
        console.log('Response data:', response.data);
        console.log('Response success:', response.success);
        
        if (response.success && response.data) {
          console.log('Setting available technicians:', response.data.length, 'technicians');
          setAvailableTechnicians(response.data);
        } else {
          console.log('No technicians data received or request failed');
          setAvailableTechnicians([]);
        }
        console.log('==========================');
      } catch (error) {
        console.error("Error loading technicians:", error);
        setAvailableTechnicians([]);
      }
    };

    if (isEditable && visible) {
      loadTechnicians();
    }
  }, [isEditable, visible]);

  const handleSubmitClick = () => {
    console.log('=== HANDLE SUBMIT CLICK ===');
    console.log('Fumigation status:', fumigationStatus);
    
    if (fumigationStatus === "APPROVED") {
      console.log('Validating fumigation form...');
      if (!validateFumigationForm()) {
        console.log('Fumigation form validation failed');
        return;
      }
      console.log('Fumigation form validation passed');
    } else if (fumigationStatus === "FUMIGATED") {
      console.log('Validating cleanup form...');
      if (!validateCleanupForm()) {
        console.log('Cleanup form validation failed');
        return;
      }
      console.log('Cleanup form validation passed');
    }
    
    console.log('Setting show signature confirmation to true');
    setShowSignatureConfirmation(true);
  };

  const createReport = async () => {
    const formatDateForBackend = (dateString: string) => {
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    };

    console.log("=== CREATING REPORT ===");
    console.log("Fumigation Details:", fumigationDetails);
    console.log("Lot ID being sent:", fumigationDetails?.lot.id);

    if (fumigationStatus === "APPROVED") {
      const reportData = {
        id: fumigationDetails?.lot?.id || 0,
        location: fumigationData.location.trim(),
        date: formatDateForBackend(fumigationData.date),
        startTime: fumigationData.startTime,
        endTime: fumigationData.endTime,
        supervisor: fumigationData.supervisor.trim(),
        technicians: fumigationData.technicians.map(t => ({ id: t.id })),
        supplies: fumigationData.supplies.map(supply => ({
          name: supply.name.trim(),
          quantity: parseFloat(supply.quantity),
          dosage: supply.dosage.trim(),
          kindOfSupply: supply.kindOfSupply.trim(),
          numberOfStrips: supply.numberOfStrips.trim() || "0"
        })),
        dimensions: {
          height: parseFloat(fumigationData.dimensions.height),
          width: parseFloat(fumigationData.dimensions.width),
          length: parseFloat(fumigationData.dimensions.length)
        },
        environmentalConditions: {
          temperature: parseFloat(fumigationData.environmentalConditions.temperature),
          humidity: parseFloat(fumigationData.environmentalConditions.humidity)
        },
        industrialSafetyConditions: {
          electricDanger: fumigationData.hazards.electricDanger,
          fallingDanger: fumigationData.hazards.fallingDanger,
          hitDanger: fumigationData.hazards.hitDanger
        },
        observations: fumigationData.observations.trim() || ""
      };

      console.log("Report data being sent:", reportData);
      await reportsService.createFumigationReport(reportData);
      return reportData;
    } else {
      const reportData = {
        id: fumigationDetails?.lot?.id || 0,
        date: formatDateForBackend(cleanupData.date),
        startTime: cleanupData.startTime,
        endTime: cleanupData.endTime,
        supervisor: cleanupData.supervisor.trim(),
        technicians: cleanupData.technicians.map(t => ({ id: t.id })),
        lotDescription: {
          stripsState: cleanupData.lotDescription.stripsState.trim(),
          fumigationTime: cleanupData.lotDescription.fumigationTime,
          ppmFosfina: cleanupData.lotDescription.ppmFosfina
        },
        industrialSafetyConditions: {
          electricDanger: cleanupData.industrialSafetyConditions.electricDanger,
          fallingDanger: cleanupData.industrialSafetyConditions.fallingDanger,
          hitDanger: cleanupData.industrialSafetyConditions.hitDanger,
          otherDanger: cleanupData.industrialSafetyConditions.otherDanger
        }
      };

      await reportsService.createCleanupReport(reportData);
      return reportData;
    }
  };

  const handleSignatureConfirmation = async (technicianSignature: string, clientSignature: string) => {
    setIsSubmitting(true);
    
    try {
      console.log("🔄 Iniciando proceso completo...");
      
      const reportData = await createReport();
      console.log("✅ Reporte creado exitosamente");

      const createdReport = fumigationStatus === "APPROVED" 
        ? await reportsService.getFumigationReport(fumigationDetails?.lot.id || 0)
        : await reportsService.getCleanupReport(fumigationDetails?.lot.id || 0);
      
      console.log("📝 Subiendo firmas para reporte ID:", createdReport.id);

      await signatureService.uploadSignature({
        fumigationId: fumigationStatus === "APPROVED" ? createdReport.id : null,
        cleanupId: fumigationStatus === "FUMIGATED" ? createdReport.id : null,
        signatureType: 'technician',
        signatureData: technicianSignature
      });
      console.log("✅ Firma del técnico subida");

      await signatureService.uploadSignature({
        fumigationId: fumigationStatus === "APPROVED" ? createdReport.id : null,
        cleanupId: fumigationStatus === "FUMIGATED" ? createdReport.id : null,
        signatureType: 'client',
        signatureData: clientSignature
      });
      console.log("✅ Firma del cliente subida");

      if (fumigationStatus === "APPROVED") {
        setFumigationReportSubmitted(true);
      } else {
        setCleanupReportSubmitted(true);
      }

      setShowSignatureConfirmation(false);
      onSave?.({});
      
      Alert.alert(
        'Éxito',
        fumigationStatus === "APPROVED" 
          ? 'El registro de fumigación ha sido enviado correctamente.'
          : 'El registro de descarpe ha sido enviado correctamente.',
        [
          {
            text: 'OK',
            onPress: () => {
              onClose?.();
            }
          }
        ]
      );
    } catch (error) {
      console.error("❌ Error en el proceso:", error);
      Alert.alert('Error', `Error al procesar el registro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (fumigationStatus === "APPROVED") {
      return `Registro de Fumigación - Lote ${fumigationDetails?.lot?.lotNumber || ''}`;
    } else if (fumigationStatus === "FUMIGATED") {
      return `Registro de Descarpe - Lote ${fumigationDetails?.lot?.lotNumber || ''}`;
    }
    return `Evidencias - Lote ${fumigationDetails?.lot?.lotNumber || ''}`;
  };

  const getButtonText = () => {
    if (fumigationStatus === "APPROVED") {
      return "Subir Registro de Fumigación";
    } else if (fumigationStatus === "FUMIGATED") {
      return "Subir Registro de Descarpe";
    }
    return "Subir Registro";
  };

  const isFormSubmitted = () => {
    if (fumigationStatus === "APPROVED") {
      return fumigationReportSubmitted;
    } else if (fumigationStatus === "FUMIGATED") {
      return cleanupReportSubmitted;
    }
    return false;
  };

  const getButtonColor = () => {
    if (fumigationStatus === "APPROVED") {
      return "#003595";
    } else if (fumigationStatus === "FUMIGATED") {
      return "#16a34a";
    }
    return "#003595";
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#003595" />
              <Text style={styles.loadingText}>Cargando evidencias...</Text>
            </View>
          ) : !fumigationDetails ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No se pudieron cargar los detalles</Text>
            </View>
          ) : (
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {fumigationStatus === "APPROVED" && (
                <FumigationForm
                  fumigationData={fumigationData}
                  setFumigationData={setFumigationData}
                  availableTechnicians={availableTechnicians}
                  isEditable={isEditable}
                  fumigationReportSubmitted={fumigationReportSubmitted}
                  validationErrors={fumigationValidationErrors}
                  updateField={updateFumigationField}
                  addToArray={addToFumigationArray}
                  removeFromArray={removeFromFumigationArray}
                />
              )}

              {fumigationStatus === "FUMIGATED" && (
                <UncoveringForm
                  fumigationDetails={fumigationDetails}
                  cleanupData={cleanupData}
                  setCleanupData={setCleanupData}
                  availableTechnicians={availableTechnicians}
                  isEditable={isEditable}
                  cleanupReportSubmitted={cleanupReportSubmitted}
                  validationErrors={cleanupValidationErrors}
                  updateField={updateCleanupField}
                  updateLotDescription={updateLotDescription}
                  updateSafetyConditions={updateSafetyConditions}
                  addTechnician={addCleanupTechnician}
                  removeTechnician={removeCleanupTechnician}
                />
              )}
            </ScrollView>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {isEditable && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              {!isFormSubmitted() && (
                <TouchableOpacity
                  style={[styles.button, styles.submitButton, { backgroundColor: getButtonColor() }]}
                  onPress={handleSubmitClick}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>{getButtonText()}</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {!isEditable && (
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          )}
        </View>

        <SignatureConfirmationModal
          isOpen={showSignatureConfirmation}
          onClose={() => {
            if (!isSubmitting) {
              setShowSignatureConfirmation(false);
            }
          }}
          onConfirm={handleSignatureConfirmation}
          isSubmitting={isSubmitting}
          reportType={fumigationStatus === "APPROVED" ? 'fumigation' : 'cleanup'}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#003595',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#003595',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#003595',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

});
