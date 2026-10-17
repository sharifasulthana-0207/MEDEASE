import { Prescription, Medication, MedicationField, Reminder, AdherenceReport, MedicineReference } from '../types';

export interface ServerState {
  prescriptions: Record<string, Prescription>;
  reminders: Reminder[];
}

export const MEDICINE_REFERENCES: Record<string, MedicineReference> = {
  'paracetamol': {
    id: 'ref-paracetamol',
    canonical_name: 'Paracetamol',
    generic_name: 'Paracetamol',
    active_ingredients: ['Paracetamol'],
    strength: '650 mg',
    dosage_form: 'Tablet',
    route: 'oral',
    release_type: 'immediate',
    common_purpose_en: 'Used to reduce fever and relieve mild to moderate pain (such as headache, toothache, or body aches).',
    common_purpose_hi: 'बुखार कम करने और हल्के से मध्यम दर्द (जैसे सिरदर्द, दांत दर्द या शरीर दर्द) से राहत पाने के लिए उपयोग किया जाता है।',
    common_purpose_te: 'జ్వరాన్ని తగ్గించడానికి మరియు తేలికపాటి నుండి మితమైన నొప్పిని (తలనొప్పి, పంటి నొప్పి లేదా శరీర నొప్పులు వంటివి) తగ్గించడానికి ఉపయోగిస్తారు.',
    source_label: 'Standard Reference Formulary',
    is_demo_reference: true,
    generic_vs_brand: 'Generic active pharmaceutical ingredient. Marketed under brand names like Calpol, Dolo 650, Crocin.',
    medical_disclaimer: 'This reference information is for educational purposes and does not replace medical advice from your physician.'
  },
  'pantoprazole': {
    id: 'ref-pantoprazole',
    canonical_name: 'Pantoprazole',
    generic_name: 'Pantoprazole',
    active_ingredients: ['Pantoprazole sodium'],
    strength: '40 mg',
    dosage_form: 'Tablet',
    route: 'oral',
    release_type: 'delayed-release',
    common_purpose_en: 'Reduces stomach acid production. Commonly used for acidity, heartburn, and gastroesophageal reflux disease (GERD).',
    common_purpose_hi: 'पेट के एसिड के उत्पादन को कम करता है। एसिडिटी, सीने में जलन और गैस की समस्या के लिए उपयोग किया जाता है।',
    common_purpose_te: 'కడుపులో యాసిడ్ ఉత్పత్తిని తగ్గిస్తుంది. ఎసిడిటీ, గుండెల్లో మంట మరియు గ్యాస్ సమస్యల నివారణకు ఉపయోగిస్తారు.',
    source_label: 'Standard Reference Formulary',
    is_demo_reference: true,
    generic_vs_brand: 'Proton pump inhibitor (PPI). Common brand names include Pantocid, Pantodac, Pan 40.',
    medical_disclaimer: 'Best taken 30-60 minutes before morning breakfast with a full glass of water.'
  },
  'pan-d': {
    id: 'ref-pan-d',
    canonical_name: 'Pan-D',
    generic_name: 'Pantoprazole + Domperidone',
    active_ingredients: ['Pantoprazole sodium (40mg)', 'Domperidone (30mg)'],
    strength: '40 mg',
    dosage_form: 'Capsule',
    route: 'oral',
    release_type: 'sustained-release',
    common_purpose_en: 'Reduces gastric acid and prevents nausea, bloating, and acid reflux. Usually taken in the morning before breakfast.',
    common_purpose_hi: 'पेट में गैस और एसिड को कम करता है तथा मतली और सीने में जलन से राहत देता है। आमतौर पर सुबह नाश्ते से पहले लिया जाता है।',
    common_purpose_te: 'కడుపులో గ్యాస్ మరియు యాసిడ్‌ను తగ్గిస్తుంది, వికారం మరియు గుండెల్లో మంటను నివారిస్తుంది. సాధారణంగా ఉదయం అల్పాహారానికి ముందు తీసుకుంటారు.',
    source_label: 'Standard Reference Formulary',
    is_demo_reference: true,
    generic_vs_brand: 'Fixed-dose combination of Pantoprazole (PPI) and Domperidone (prokinetic).',
    medical_disclaimer: 'Do not crush or chew capsule beads; swallow whole before food.'
  },
  'opox-cv': {
    id: 'ref-opox-cv',
    canonical_name: 'Opox-CV',
    generic_name: 'Cefpodoxime Proxetil + Potassium Clavulanate',
    active_ingredients: ['Cefpodoxime Proxetil (200mg)', 'Potassium Clavulanate (125mg)'],
    strength: '200 mg',
    dosage_form: 'Tablet',
    route: 'oral',
    release_type: 'immediate',
    common_purpose_en: 'Broad-spectrum antibacterial medication used for respiratory tract infections, acute tonsillitis, pharyngitis, and ear/throat infections.',
    common_purpose_hi: 'श्वसन तंत्र के संक्रमण, टॉन्सिल, गले के गंभीर संक्रमण और ब्रोंकाइटिस के इलाज के लिए उपयोग की जाने वाली शक्तिशाली एंटीबायोटिक दवा।',
    common_purpose_te: 'శ్వాసకోశ ఇన్ఫెక్షన్లు, తీవ్రమైన గొంతు ఇన్ఫెక్షన్లు, టాన్సిల్స్ మరియు బ్రోన్కైటిస్ చికిత్సకు ఉపయోగించే శక్తివంతమైన యాంటీబయాటిక్ ఔషధం.',
    source_label: 'Standard Reference Formulary',
    is_demo_reference: true,
    generic_vs_brand: 'Third-generation cephalosporin antibiotic combined with beta-lactamase inhibitor.',
    medical_disclaimer: 'Complete the entire course prescribed even if symptoms improve early.'
  },
  'aldigesic-sp': {
    id: 'ref-aldigesic-sp',
    canonical_name: 'Aldigesic-SP',
    generic_name: 'Aceclofenac + Paracetamol + Serratiopeptidase',
    active_ingredients: ['Aceclofenac (100mg)', 'Paracetamol (325mg)', 'Serratiopeptidase (15mg)'],
    strength: 'Standard Combination',
    dosage_form: 'Tablet',
    route: 'oral',
    release_type: 'immediate',
    common_purpose_en: 'Anti-inflammatory and analgesic combination that relieves pain, reduces high fever, and decreases tissue swelling in throat and body.',
    common_purpose_hi: 'दर्द निवारक और सूजन-रोधी दवा जो बुखार को कम करती है और गले व शरीर में दर्द और सूजन से राहत दिलाती है।',
    common_purpose_te: 'నొప్పి, జ్వరం మరియు శరీరంలో లేదా గొంతులో వాపును తగ్గించడానికి ఉపయోగించే శక్తివంతమైన అనాల్జేసిక్ మరియు యాంటీ ఇన్‌ఫ్లమేటరీ ఔషధం.',
    source_label: 'Standard Reference Formulary',
    is_demo_reference: true,
    generic_vs_brand: 'Triple combination of NSAID, antipyretic, and proteolytic enzyme.',
    medical_disclaimer: 'Take after meals to avoid gastrointestinal discomfort.'
  },
  'breezy': {
    id: 'ref-breezy',
    canonical_name: 'Breezy',
    generic_name: 'Levocetirizine + Montelukast',
    active_ingredients: ['Levocetirizine (5mg)', 'Montelukast (10mg)'],
    strength: '5mg/10mg',
    dosage_form: 'Tablet',
    route: 'oral',
    release_type: 'immediate',
    common_purpose_en: 'Dual-action antiallergic medication for treating cold, runny nose, sneezing, allergic rhinitis, and night-time coughing or airway irritation.',
    common_purpose_hi: 'सर्दी, बहती नाक, छींक, एलर्जी और रात में होने वाली गले की जलन या खांसी से राहत दिलाने वाली एंटी-एलर्जिक दवा।',
    common_purpose_te: 'జలుబు, ముక్కు కారటం, తుమ్ములు, అలెర్జీలు మరియు రాత్రిపూట గొంతు మంట లేదా దగ్గు నుండి ఉపశమనం కలిగించే యాంటీ అలెర్జీ ఔషధం.',
    source_label: 'Standard Reference Formulary',
    is_demo_reference: true,
    generic_vs_brand: 'Second-generation antihistamine combined with leukotriene receptor antagonist.',
    medical_disclaimer: 'May cause mild drowsiness; recommended to take at bedtime.'
  },
  'skipon-d': {
    id: 'ref-skipon-d',
    canonical_name: 'Skipon-D',
    generic_name: 'Pantoprazole + Domperidone',
    active_ingredients: ['Pantoprazole sodium (40mg)', 'Domperidone (10mg)'],
    strength: '40 mg',
    dosage_form: 'Capsule',
    route: 'oral',
    release_type: 'sustained-release',
    common_purpose_en: 'Reduces gastric acid and prevents nausea, bloating, and acid reflux. Usually taken in the morning before breakfast.',
    common_purpose_hi: 'पेट में गैस और एसिड को कम करता है तथा मतली और सीने में जलन से राहत देता है। आमतौर पर सुबह नाश्ते से पहले लिया जाता है।',
    common_purpose_te: 'కడుపులో గ్యాస్ మరియు యాసిడ్‌ను తగ్గిస్తుంది, వికారం మరియు గుండెల్లో మంటను నివారిస్తుంది. సాధారణంగా ఉదయం అల్పాహారానికి ముందు తీసుకుంటారు.',
    source_label: 'Standard Reference Formulary',
    is_demo_reference: true,
    generic_vs_brand: 'Brand formulation equivalent to Pan-D / Pantoprazole-Domperidone combination.',
    medical_disclaimer: 'Take on an empty stomach 30 minutes before morning breakfast.'
  },
  'amoxicillin': {
    id: 'ref-amoxicillin',
    canonical_name: 'Amoxicillin',
    generic_name: 'Amoxicillin',
    active_ingredients: ['Amoxicillin trihydrate'],
    strength: '500 mg',
    dosage_form: 'Capsule',
    route: 'oral',
    release_type: 'immediate',
    common_purpose_en: 'Broad-spectrum antibiotic used to treat bacterial infections in the chest, throat, ear, and urinary tract.',
    common_purpose_hi: 'एक एंटीबायोटिक जिसका उपयोग फेफड़ों, गले, कान और मूत्र मार्ग के जीवाणु संक्रमण के इलाज के लिए किया जाता है।',
    common_purpose_te: 'ఛాతీ, గొంతు, చెవి మరియు మూత్ర మార్గాలలో బ్యాక్టీరియా ఇన్ఫెక్షన్ల చికిత్సకు ఉపయోగించే యాంటీబయాటిక్.',
    source_label: 'Standard Reference Formulary',
    is_demo_reference: true,
    generic_vs_brand: 'Aminopenicillin antibiotic.',
    medical_disclaimer: 'Take as directed by doctor. Finish full treatment course.'
  }
};

const globalStore: ServerState = {
  prescriptions: {},
  reminders: []
};

export function getTimesForFrequency(freq: string): string[] {
  const f = (freq || '').trim().toLowerCase();
  if (f === '1-0-1' || f === 'bd' || f === 'bid') return ['08:00', '20:00'];
  if (f === '1-0-0' || f === 'od' || f === 'qd' || f === 'once daily') return ['08:00'];
  if (f === '0-0-1' || f === 'hs' || f === 'bedtime' || f === 'at night') return ['21:30'];
  if (f === '1-1-1' || f === 'tds' || f === 'tid' || f === 'three times daily') return ['08:00', '14:00', '20:00'];
  return ['08:00', '20:00'];
}

export function generateRemindersForMedication(med: Medication): Reminder[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const reminders: Reminder[] = [];
  
  const times = (med.frequency_times && med.frequency_times.length > 0)
    ? med.frequency_times
    : getTimesForFrequency(med.frequency || '');

  for (const timeStr of times) {
    const reminderId = `rem-${med.id}-${timeStr.replace(':', '')}`;
    const existing = globalStore.reminders.find(r => r.id === reminderId);
    if (existing) {
      reminders.push(existing);
      continue;
    }
    
    const newReminder: Reminder = {
      id: reminderId,
      schedule_id: `sched-${med.id}`,
      medicine_name: med.medicine_name_raw,
      medicine_name_normalized: med.medicine_name_normalized || med.medicine_name_raw,
      strength: med.strength,
      dosage_form: med.dosage_form,
      scheduled_for: `${todayStr}T${timeStr}:00`,
      status: 'upcoming'
    };
    globalStore.reminders.push(newReminder);
    reminders.push(newReminder);
  }
  return reminders;
}

export function buildDemoFixture(fixtureType: 'success' | 'controlled_failure' | 'actual_prescription'): Prescription {
  const today = new Date().toISOString();
  
  if (fixtureType === 'actual_prescription') {
    const rxId = 'rx-demo-actual-prescription';
    const med1: Medication = {
      id: 'med-opox-cv',
      prescription_id: rxId,
      medicine_name_raw: 'Opox-CV',
      medicine_name_normalized: 'Opox-CV',
      active_ingredient: 'Cefpodoxime Proxetil (200mg) + Clavulanate (125mg)',
      strength: '200 mg',
      dosage_form: 'Tablet',
      frequency: '1-0-1',
      frequency_times: ['08:00', '20:00'],
      duration_days: 3,
      route: 'oral',
      critical_fields_complete: true,
      safety_gate_status: 'VERIFIED',
      safety_gate_reasons: ['All critical fields confirmed with 90%+ extraction confidence'],
      has_schedule: true,
      fields: [
        { id: 'f-opox-1', field_name: 'medicine_name', value: 'Opox-CV', confidence: 0.94, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Matched formulary: Opox-CV (Cefpodoxime Proxetil + Clavulanate)' },
        { id: 'f-opox-2', field_name: 'strength', value: '200 mg', confidence: 0.97, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-opox-3', field_name: 'dosage_form', value: 'Tablet', confidence: 0.95, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-opox-4', field_name: 'frequency', value: '1-0-1', confidence: 0.92, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Twice daily (Morning & Night after meals)' },
        { id: 'f-opox-5', field_name: 'duration', value: '3 days', confidence: 0.90, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Circled quantity: 6 tablets (3 days course)' },
        { id: 'f-opox-6', field_name: 'route', value: 'oral', confidence: 0.95, status: 'VERIFIED', source: 'demo_provider' }
      ]
    };

    const med2: Medication = {
      id: 'med-aldigesic-sp',
      prescription_id: rxId,
      medicine_name_raw: 'Aldigesic-SP',
      medicine_name_normalized: 'Aldigesic-SP',
      active_ingredient: 'Aceclofenac + Paracetamol + Serratiopeptidase',
      strength: 'Standard Combination',
      dosage_form: 'Tablet',
      frequency: '1-0-1',
      frequency_times: ['08:00', '20:00'],
      duration_days: 4,
      route: 'oral',
      critical_fields_complete: true,
      safety_gate_status: 'VERIFIED',
      safety_gate_reasons: ['All critical fields confirmed with 89%+ extraction confidence'],
      has_schedule: true,
      fields: [
        { id: 'f-aldi-1', field_name: 'medicine_name', value: 'Aldigesic-SP', confidence: 0.89, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Matched formulary: Aceclofenac + Paracetamol + Serratiopeptidase' },
        { id: 'f-aldi-2', field_name: 'strength', value: 'Standard Combination', confidence: 0.91, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-aldi-3', field_name: 'dosage_form', value: 'Tablet', confidence: 0.96, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-aldi-4', field_name: 'frequency', value: '1-0-1', confidence: 0.93, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Twice daily after meals' },
        { id: 'f-aldi-5', field_name: 'duration', value: '4 days', confidence: 0.88, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Circled quantity: 8 tablets (4 days course)' },
        { id: 'f-aldi-6', field_name: 'route', value: 'oral', confidence: 0.96, status: 'VERIFIED', source: 'demo_provider' }
      ]
    };

    const med3: Medication = {
      id: 'med-breezy',
      prescription_id: rxId,
      medicine_name_raw: 'Breezy',
      medicine_name_normalized: 'Breezy',
      active_ingredient: 'Levocetirizine (5mg) + Montelukast (10mg)',
      strength: '5mg/10mg',
      dosage_form: 'Tablet',
      frequency: '0-0-1',
      frequency_times: ['21:30'],
      duration_days: 5,
      route: 'oral',
      critical_fields_complete: true,
      safety_gate_status: 'VERIFIED',
      safety_gate_reasons: ['All critical fields confirmed with 91%+ extraction confidence'],
      has_schedule: true,
      fields: [
        { id: 'f-breezy-1', field_name: 'medicine_name', value: 'Breezy', confidence: 0.93, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Matched formulary: Levocetirizine + Montelukast' },
        { id: 'f-breezy-2', field_name: 'strength', value: '5mg/10mg', confidence: 0.91, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-breezy-3', field_name: 'dosage_form', value: 'Tablet', confidence: 0.97, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-breezy-4', field_name: 'frequency', value: '0-0-1', confidence: 0.94, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Once daily at night before bed' },
        { id: 'f-breezy-5', field_name: 'duration', value: '5 days', confidence: 0.90, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Circled quantity: 5 tablets (5 days course)' },
        { id: 'f-breezy-6', field_name: 'route', value: 'oral', confidence: 0.96, status: 'VERIFIED', source: 'demo_provider' }
      ]
    };

    const med4: Medication = {
      id: 'med-skipon-d',
      prescription_id: rxId,
      medicine_name_raw: 'Skipon-D',
      medicine_name_normalized: 'Skipon-D',
      active_ingredient: 'Pantoprazole (40mg) + Domperidone (10mg)',
      strength: '40 mg',
      dosage_form: 'Capsule',
      frequency: '1-0-0',
      frequency_times: ['08:00'],
      duration_days: 10,
      route: 'oral',
      critical_fields_complete: true,
      safety_gate_status: 'VERIFIED',
      safety_gate_reasons: ['All critical fields confirmed with 92%+ extraction confidence'],
      has_schedule: true,
      fields: [
        { id: 'f-skipon-1', field_name: 'medicine_name', value: 'Skipon-D', confidence: 0.92, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Matched formulary: Pantoprazole + Domperidone' },
        { id: 'f-skipon-2', field_name: 'strength', value: '40 mg', confidence: 0.95, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-skipon-3', field_name: 'dosage_form', value: 'Capsule', confidence: 0.94, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-skipon-4', field_name: 'frequency', value: '1-0-0', confidence: 0.96, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Once daily morning before breakfast (B/F)' },
        { id: 'f-skipon-5', field_name: 'duration', value: '10 days', confidence: 0.91, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Circled quantity: 10 capsules (10 days course)' },
        { id: 'f-skipon-6', field_name: 'route', value: 'oral', confidence: 0.95, status: 'VERIFIED', source: 'demo_provider' }
      ]
    };

    const prescription: Prescription = {
      id: rxId,
      original_filename: 'actual_prescription.png',
      processing_status: 'completed',
      image_quality_status: 'good',
      image_quality_details: {
        laplacian_variance: 1163.7,
        mean_brightness: 182.4,
        is_blurry: false,
        is_too_dark: false,
        is_overexposed: false,
        issues: []
      },
      is_demo_fixture: true,
      created_at: today,
      medications: [med1, med2, med3, med4]
    };

    globalStore.reminders = [];
    generateRemindersForMedication(med1);
    generateRemindersForMedication(med2);
    generateRemindersForMedication(med3);
    generateRemindersForMedication(med4);

    globalStore.prescriptions[rxId] = prescription;
    return prescription;
  }

  if (fixtureType === 'controlled_failure') {
    const rxId = 'rx-demo-controlled-failure';
    const med: Medication = {
      id: 'med-pantoprazole-fail',
      prescription_id: rxId,
      medicine_name_raw: 'Pantoprazole',
      medicine_name_normalized: 'Pantoprazole',
      active_ingredient: 'Pantoprazole sodium',
      strength: '40 mg',
      dosage_form: 'Tablet',
      frequency: '~BD~ (?)',
      frequency_times: ['08:00', '20:00'],
      duration_days: 14,
      route: 'oral',
      critical_fields_complete: false,
      safety_gate_status: 'NEEDS_VERIFICATION',
      safety_gate_reasons: [
        'Frequency extraction confidence is 55% (threshold is 85%). Ambiguous handwriting detected (~BD~ ?). Human verification required before schedule generation.'
      ],
      has_schedule: false,
      fields: [
        { id: 'f-cf-1', field_name: 'medicine_name', value: 'Pantoprazole', confidence: 0.94, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Matched reference formulary: Pantoprazole 40mg' },
        { id: 'f-cf-2', field_name: 'strength', value: '40 mg', confidence: 0.91, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-cf-3', field_name: 'dosage_form', value: 'Tablet', confidence: 0.95, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-cf-4', field_name: 'frequency', value: '~BD~ (?)', confidence: 0.55, status: 'NEEDS_VERIFICATION', source: 'demo_provider', validation_message: 'Ambiguous frequency symbol detected. Please confirm whether doctor intended Once Daily (OD) or Twice Daily (BD).' },
        { id: 'f-cf-5', field_name: 'duration', value: '14 days', confidence: 0.88, status: 'VERIFIED', source: 'demo_provider' },
        { id: 'f-cf-6', field_name: 'route', value: 'oral', confidence: 0.96, status: 'VERIFIED', source: 'demo_provider' }
      ]
    };

    const prescription: Prescription = {
      id: rxId,
      original_filename: 'prescription_controlled_failure.jpg',
      processing_status: 'completed',
      image_quality_status: 'good',
      image_quality_details: {
        laplacian_variance: 640.2,
        mean_brightness: 165.1,
        is_blurry: false,
        is_too_dark: false,
        is_overexposed: false,
        issues: []
      },
      is_demo_fixture: true,
      created_at: today,
      medications: [med]
    };

    globalStore.reminders = [];
    globalStore.prescriptions[rxId] = prescription;
    return prescription;
  }

  const rxId = 'rx-demo-success';
  const med: Medication = {
    id: 'med-paracetamol-succ',
    prescription_id: rxId,
    medicine_name_raw: 'Paracetamol',
    medicine_name_normalized: 'Paracetamol',
    active_ingredient: 'Paracetamol',
    strength: '650 mg',
    dosage_form: 'Tablet',
    frequency: 'BD',
    frequency_times: ['08:00', '20:00'],
    duration_days: 5,
    route: 'oral',
    critical_fields_complete: true,
    safety_gate_status: 'VERIFIED',
    safety_gate_reasons: ['All critical fields verified with high confidence'],
    has_schedule: true,
    fields: [
      { id: 'f-s-1', field_name: 'medicine_name', value: 'Paracetamol', confidence: 0.96, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Matched reference formulary: Paracetamol 650mg' },
      { id: 'f-s-2', field_name: 'strength', value: '650 mg', confidence: 0.97, status: 'VERIFIED', source: 'demo_provider' },
      { id: 'f-s-3', field_name: 'dosage_form', value: 'Tablet', confidence: 0.98, status: 'VERIFIED', source: 'demo_provider' },
      { id: 'f-s-4', field_name: 'frequency', value: 'BD', confidence: 0.94, status: 'VERIFIED', source: 'demo_provider', validation_message: 'Twice daily after food' },
      { id: 'f-s-5', field_name: 'duration', value: '5 days', confidence: 0.93, status: 'VERIFIED', source: 'demo_provider' },
      { id: 'f-s-6', field_name: 'route', value: 'oral', confidence: 0.99, status: 'VERIFIED', source: 'demo_provider' }
    ]
  };

  const prescription: Prescription = {
    id: rxId,
    original_filename: 'prescription_success.jpg',
    processing_status: 'completed',
    image_quality_status: 'good',
    image_quality_details: {
      laplacian_variance: 980.5,
      mean_brightness: 175.0,
      is_blurry: false,
      is_too_dark: false,
      is_overexposed: false,
      issues: []
    },
    is_demo_fixture: true,
    created_at: today,
    medications: [med]
  };

  globalStore.reminders = [];
  generateRemindersForMedication(med);
  globalStore.prescriptions[rxId] = prescription;
  return prescription;
}

if (Object.keys(globalStore.prescriptions).length === 0) {
  buildDemoFixture('actual_prescription');
}

export { globalStore };
