import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SignatureModal } from './SignatureModal';

interface SignatureConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (technicianSignature: string, clientSignature: string) => void;
  isSubmitting?: boolean;
  reportType: 'fumigation' | 'cleanup';
}

export const SignatureConfirmationModal: React.FC<SignatureConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  reportType
}) => {
  const [technicianSignature, setTechnicianSignature] = useState<string>('');
  const [clientSignature, setClientSignature] = useState<string>('');
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  const handleConfirm = () => {
    if (technicianSignature && clientSignature) {
      onConfirm(technicianSignature, clientSignature);
    } else {
      Alert.alert('Error', 'Ambas firmas son requeridas para continuar.');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTechnicianSignature('');
      setClientSignature('');
      onClose();
    }
  };

  const canConfirm = technicianSignature && clientSignature && !isSubmitting;

  if (!isOpen) return null;

  return (
    <>
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>
              Confirmar {reportType === 'fumigation' ? 'Registro de Fumigación' : 'Registro de Descarpe'}
            </Text>
            <Text style={styles.message}>
              Para validar este reporte, necesitamos las firmas del técnico y del cliente.
            </Text>

            <View style={styles.signaturesContainer}>
              <View style={styles.signatureSection}>
                <Text style={styles.signatureLabel}>Firma del Técnico</Text>
                <TouchableOpacity
                  style={[styles.signatureButton, technicianSignature ? styles.signedButton : styles.unsignedButton]}
                  onPress={() => setShowTechnicianModal(true)}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.signatureButtonText, technicianSignature ? styles.signedButtonText : styles.unsignedButtonText]}>
                    {technicianSignature ? 'Modificar Firma' : 'Capturar Firma'}
                  </Text>
                </TouchableOpacity>
                {technicianSignature && (
                  <Text style={styles.signedText}>✓ Firmado</Text>
                )}
              </View>

              <View style={styles.signatureSection}>
                <Text style={styles.signatureLabel}>Firma del Cliente</Text>
                <TouchableOpacity
                  style={[styles.signatureButton, clientSignature ? styles.signedButton : styles.unsignedButton]}
                  onPress={() => setShowClientModal(true)}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.signatureButtonText, clientSignature ? styles.signedButtonText : styles.unsignedButtonText]}>
                    {clientSignature ? 'Modificar Firma' : 'Capturar Firma'}
                  </Text>
                </TouchableOpacity>
                {clientSignature && (
                  <Text style={styles.signedText}>✓ Firmado</Text>
                )}
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.confirmButton, 
                  { backgroundColor: reportType === 'fumigation' ? '#003595' : '#16a34a' },
                  !canConfirm && styles.disabledButton
                ]}
                onPress={handleConfirm}
                disabled={!canConfirm}
              >
                <Text style={styles.confirmButtonText}>
                  {isSubmitting ? "Procesando..." : "Confirmar y Subir"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SignatureModal
        isOpen={showTechnicianModal}
        title="Firma del Técnico"
        onClose={() => setShowTechnicianModal(false)}
        onSave={(signature) => {
          setTechnicianSignature(signature);
          setShowTechnicianModal(false);
        }}
        existingSignature={technicianSignature}
      />

      <SignatureModal
        isOpen={showClientModal}
        title="Firma del Cliente"
        onClose={() => setShowClientModal(false)}
        onSave={(signature) => {
          setClientSignature(signature);
          setShowClientModal(false);
        }}
        existingSignature={clientSignature}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  signaturesContainer: {
    gap: 20,
    marginBottom: 24,
  },
  signatureSection: {
    gap: 8,
  },
  signatureLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  signatureButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  unsignedButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  signedButton: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  signatureButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  unsignedButtonText: {
    color: '#374151',
  },
  signedButtonText: {
    color: '#0ea5e9',
  },
  signedText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  confirmButton: {
    backgroundColor: '#003595',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
});
