export type Language = 'en' | 'hi' | 'te';

export type FieldStatus = 'VERIFIED' | 'NEEDS_VERIFICATION' | 'MISSING' | 'CONFLICTING';

export interface MedicationField {
  id: string;
  field_name: string;
  value: any;
  confidence: number; // 0.0 to 1.0 technical extraction signal
  status: FieldStatus;
  source: string;
  validation_message?: string;
  updated_at?: string;
}

export interface Medication {
  id: string;
  prescription_id: string;
  medicine_name_raw: string;
  medicine_name_normalized?: string;
  active_ingredient?: string;
  strength?: string;
  dosage_form?: string;
  frequency?: string;
  frequency_times: string[];
  duration_days?: number;
  route?: string;
  critical_fields_complete: boolean;
  safety_gate_status: FieldStatus | string;
  safety_gate_reasons: string[];
  fields: MedicationField[];
  has_schedule: boolean;
}

export interface Prescription {
  id: string;
  original_filename: string;
  processing_status: string;
  image_quality_status: 'good' | 'poor' | 'unreadable';
  image_quality_details: {
    laplacian_variance?: number;
    mean_brightness?: number;
    is_blurry?: boolean;
    is_too_dark?: boolean;
    is_overexposed?: boolean;
    issues?: string[];
  };
  is_demo_fixture: boolean;
  created_at: string;
  medications: Medication[];
}

export interface Reminder {
  id: string;
  schedule_id: string;
  medicine_name: string;
  medicine_name_normalized?: string;
  strength?: string;
  dosage_form?: string;
  scheduled_for: string;
  status: 'upcoming' | 'taken' | 'skipped' | 'snoozed';
  acted_at?: string;
}

export interface AdherenceReport {
  total_reminders: number;
  taken_count: number;
  skipped_count: number;
  snoozed_count: number;
  upcoming_count: number;
  adherence_percentage: number;
  date_from?: string;
  date_to?: string;
}

export interface MedicineReference {
  id: string;
  canonical_name: string;
  generic_name: string;
  active_ingredients: string[];
  strength?: string;
  dosage_form?: string;
  route: string;
  release_type: string;
  common_purpose_en?: string;
  common_purpose_hi?: string;
  common_purpose_te?: string;
  source_label: string;
  is_demo_reference: boolean;
  generic_vs_brand: string;
  medical_disclaimer: string;
}

export interface PharmacyOption {
  provider_name: string;
  provider_slug: string;
  logo_color: string;
  has_verified_pricing: boolean;
  product_title: string;
  strength?: string;
  dosage_form?: string;
  pack_size?: string;
  units_per_pack: number;
  mrp?: number | null;
  current_price?: number | null;
  discount_percentage?: number | null;
  unit_price?: number | null;
  in_stock: boolean;
  product_url: string;
  last_updated?: string | null;
  price_status_label: string;
}

export interface PharmacyComparisonData {
  medication_id?: string;
  medicine_name: string;
  normalized_name?: string;
  active_ingredient?: string;
  strength?: string;
  dosage_form?: string;
  is_prescription_verified: boolean;
  safety_gate_status?: string;
  safety_notice?: string | null;
  lowest_price_provider?: string | null;
  comparable_pack_size: string;
  pharmacy_options: PharmacyOption[];
  disclaimer: string;
}
