/**
 * Employee Document Management & Validation Helpers
 */

export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface DocumentUploadMeta {
  employeeId: string;
  category: 'ID_PROOF' | 'OFFER_LETTER' | 'PAYSLIP' | 'TAX_DECLARATION' | 'OTHER';
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
}

export function validateDocumentUpload(meta: DocumentUploadMeta): { isValid: boolean; error?: string } {
  if (!meta.fileName || meta.fileName.length > 255) {
    return { isValid: false, error: 'Invalid document file name' };
  }

  if (meta.fileSizeBytes > MAX_DOCUMENT_SIZE_BYTES) {
    return { isValid: false, error: 'Document file size exceeds 5MB limit' };
  }

  if (!ALLOWED_DOCUMENT_TYPES.includes(meta.mimeType)) {
    return { isValid: false, error: 'Only PDF, PNG, and JPEG files are supported' };
  }

  return { isValid: true };
}
