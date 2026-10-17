import { Prescription, Medication, Reminder, AdherenceReport, MedicineReference } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export async function uploadPrescription(file: File): Promise<{
  prescription_id: string;
  filename: string;
  processing_status: string;
  image_quality_status: 'good' | 'poor' | 'unreadable';
  image_quality_details: any;
  warning?: string[];
}> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/prescriptions/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to upload prescription');
  }

  return res.json();
}

export async function processPrescription(
  prescriptionId: string,
  fixtureMode?: string
): Promise<{
  prescription_id: string;
  processing_status: string;
  medications: any[];
  overall_notes: string[];
}> {
  const url = fixtureMode
    ? `${API_BASE_URL}/prescriptions/${prescriptionId}/process?fixture_mode=${fixtureMode}`
    : `${API_BASE_URL}/prescriptions/${prescriptionId}/process`;

  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to process prescription');
  }
  return res.json();
}

export async function getPrescription(prescriptionId: string): Promise<Prescription> {
  const res = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to fetch prescription');
  }
  return res.json();
}

export function getPrescriptionImageUrl(prescriptionId: string): string {
  return `${API_BASE_URL}/prescriptions/${prescriptionId}/image-url`;
}

export async function verifyMedicationField(
  medicationId: string,
  fieldName: string,
  action: 'confirmed' | 'edited' | 'rejected',
  newValue?: any
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/medications/${medicationId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field_name: fieldName, action, new_value: newValue }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to verify field');
  }
  return res.json();
}

export async function scheduleMedication(medicationId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/medications/${medicationId}/schedule`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err = new Error(errorData?.error?.message || 'Safety Gate blocked schedule creation');
    (err as any).code = errorData?.error?.code;
    (err as any).details = errorData?.error?.details;
    throw err;
  }
  return res.json();
}

export async function getTodaySchedule(): Promise<Reminder[]> {
  const res = await fetch(`${API_BASE_URL}/schedule/today`);
  if (!res.ok) {
    throw new Error('Failed to load today schedule');
  }
  return res.json();
}

export async function updateReminderStatus(reminderId: string, status: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/reminders/${reminderId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error('Failed to update reminder status');
  }
  return res.json();
}

export async function getAdherenceReport(): Promise<AdherenceReport> {
  const res = await fetch(`${API_BASE_URL}/adherence`);
  if (!res.ok) {
    throw new Error('Failed to fetch adherence');
  }
  return res.json();
}

export async function getMedicineInfo(canonicalName: string): Promise<MedicineReference> {
  const res = await fetch(`${API_BASE_URL}/medicine/${encodeURIComponent(canonicalName)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch medicine information');
  }
  return res.json();
}

export async function loadDemoFixture(fixtureType: 'success' | 'controlled_failure' | 'actual_prescription'): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/demo/load-fixture/${fixtureType}`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to load demo fixture');
  }
  return res.json();
}

export async function cleanupScheduleDuplicates(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/schedule/cleanup`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to cleanup schedules');
  }
  return res.json();
}

export async function resetAllSchedules(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/schedule/reset`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to reset schedules');
  }
  return res.json();
}

export function getAudioReminderUrl(text: string, lang: string): string {
  const params = new URLSearchParams({ text, lang });
  return `${API_BASE_URL}/audio/reminder?${params.toString()}`;
}

export async function getMedicationPharmacyOptions(medicationId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/medications/${medicationId}/pharmacy-options`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to fetch pharmacy options');
  }
  return res.json();
}

export async function searchPharmacies(query: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/pharmacy/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to search pharmacies');
  }
  return res.json();
}


