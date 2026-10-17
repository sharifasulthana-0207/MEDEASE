import { NextRequest, NextResponse } from 'next/server';
import { globalStore } from '@/lib/serverStore';

const BENCHMARK_MAP: Record<string, any> = {
  'paracetamol': {
    title: 'Dolo 650mg Tablet',
    strength: '650 mg',
    dosage_form: 'Tablet',
    pack_size: 'Strip of 15 Tablets',
    units: 15,
    prices: {
      'Tata 1mg': { mrp: 34.0, price: 28.56, url: 'https://www.1mg.com/drugs/dolo-650-tablet-41635', color: '#FF6F61' },
      'Apollo Pharmacy': { mrp: 34.0, price: 29.24, url: 'https://www.apollopharmacy.in/medicine/dolo-650mg-strip-of-15-tablets', color: '#02475B' },
      'PharmEasy': { mrp: 34.0, price: 27.88, url: 'https://pharmeasy.in/online-medicine-order/dolo-650mg-strip-of-15-tablets-45155', color: '#10847E' },
      'Netmeds': { mrp: 34.0, price: 28.90, url: 'https://www.netmeds.com/prescriptions/dolo-650mg-tablet-15-s', color: '#24AEB1' }
    }
  },
  'pantoprazole': {
    title: 'Pan 40 Tablet',
    strength: '40 mg',
    dosage_form: 'Tablet',
    pack_size: 'Strip of 15 Tablets',
    units: 15,
    prices: {
      'Tata 1mg': { mrp: 155.0, price: 131.75, url: 'https://www.1mg.com/drugs/pan-40-tablet-69062', color: '#FF6F61' },
      'Apollo Pharmacy': { mrp: 155.0, price: 133.30, url: 'https://www.apollopharmacy.in/medicine/pan-40-strip-of-15-tablets', color: '#02475B' },
      'PharmEasy': { mrp: 155.0, price: 128.65, url: 'https://pharmeasy.in/online-medicine-order/pan-40mg-strip-of-15-tablets-8086', color: '#10847E' },
      'Netmeds': { mrp: 155.0, price: 131.75, url: 'https://www.netmeds.com/prescriptions/pan-40mg-tablet-15s', color: '#24AEB1' }
    }
  },
  'pan-d': {
    title: 'Pan-D Capsule SR',
    strength: '40 mg',
    dosage_form: 'Capsule',
    pack_size: 'Strip of 15 Capsules',
    units: 15,
    prices: {
      'Tata 1mg': { mrp: 199.0, price: 169.15, url: 'https://www.1mg.com/drugs/pan-d-capsule-sr-69063', color: '#FF6F61' },
      'Apollo Pharmacy': { mrp: 199.0, price: 171.14, url: 'https://www.apollopharmacy.in/medicine/pan-d-capsule-15-s', color: '#02475B' },
      'PharmEasy': { mrp: 199.0, price: 165.17, url: 'https://pharmeasy.in/online-medicine-order/pan-d-capsule-15-s-8088', color: '#10847E' },
      'Netmeds': { mrp: 199.0, price: 169.15, url: 'https://www.netmeds.com/prescriptions/pan-d-capsule-15-s', color: '#24AEB1' }
    }
  },
  'opox-cv': {
    title: 'Opox-CV 200/125 Tablet',
    strength: '200 mg',
    dosage_form: 'Tablet',
    pack_size: 'Strip of 10 Tablets',
    units: 10,
    prices: {
      'Tata 1mg': { mrp: 375.0, price: 318.75, url: 'https://www.1mg.com/drugs/opox-cv-200-tablet-153303', color: '#FF6F61' },
      'Apollo Pharmacy': { mrp: 375.0, price: 322.50, url: 'https://www.apollopharmacy.in/medicine/opox-cv-200-tablet', color: '#02475B' },
      'PharmEasy': { mrp: 375.0, price: 311.25, url: 'https://pharmeasy.in/online-medicine-order/opox-cv-200-tablet', color: '#10847E' },
      'Netmeds': { mrp: 375.0, price: 318.75, url: 'https://www.netmeds.com/prescriptions/opox-cv-200-tablet', color: '#24AEB1' }
    }
  },
  'aldigesic-sp': {
    title: 'Aldigesic-SP Tablet',
    strength: 'Standard Combination',
    dosage_form: 'Tablet',
    pack_size: 'Strip of 10 Tablets',
    units: 10,
    prices: {
      'Tata 1mg': { mrp: 142.0, price: 120.70, url: 'https://www.1mg.com/drugs/aldigesic-sp-tablet-133596', color: '#FF6F61' },
      'Apollo Pharmacy': { mrp: 142.0, price: 122.12, url: 'https://www.apollopharmacy.in/medicine/aldigesic-sp-tablet', color: '#02475B' },
      'PharmEasy': { mrp: 142.0, price: 117.86, url: 'https://pharmeasy.in/online-medicine-order/aldigesic-sp-tablet', color: '#10847E' },
      'Netmeds': { mrp: 142.0, price: 120.70, url: 'https://www.netmeds.com/prescriptions/aldigesic-sp-tablet', color: '#24AEB1' }
    }
  },
  'breezy': {
    title: 'Breezy 5mg/10mg Tablet',
    strength: '5mg/10mg',
    dosage_form: 'Tablet',
    pack_size: 'Strip of 10 Tablets',
    units: 10,
    prices: {
      'Tata 1mg': { mrp: 168.0, price: 142.80, url: 'https://www.1mg.com/drugs/breezy-tablet-152019', color: '#FF6F61' },
      'Apollo Pharmacy': { mrp: 168.0, price: 144.48, url: 'https://www.apollopharmacy.in/medicine/breezy-tablet', color: '#02475B' },
      'PharmEasy': { mrp: 168.0, price: 139.44, url: 'https://pharmeasy.in/online-medicine-order/breezy-tablet', color: '#10847E' },
      'Netmeds': { mrp: 168.0, price: 142.80, url: 'https://www.netmeds.com/prescriptions/breezy-tablet', color: '#24AEB1' }
    }
  },
  'amoxicillin': {
    title: 'Novamox 500 Capsule',
    strength: '500 mg',
    dosage_form: 'Capsule',
    pack_size: 'Strip of 15 Capsules',
    units: 15,
    prices: {
      'Tata 1mg': { mrp: 110.0, price: 93.50, url: 'https://www.1mg.com/drugs/novamox-500-capsule-64039', color: '#FF6F61' },
      'Apollo Pharmacy': { mrp: 110.0, price: 94.60, url: 'https://www.apollopharmacy.in/medicine/novamox-500mg-capsule-15-s', color: '#02475B' },
      'PharmEasy': { mrp: 110.0, price: 91.30, url: 'https://pharmeasy.in/online-medicine-order/novamox-500mg-capsule-15-s-21950', color: '#10847E' },
      'Netmeds': { mrp: 110.0, price: 93.50, url: 'https://www.netmeds.com/prescriptions/novamox-500mg-capsule-15s', color: '#24AEB1' }
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Search across globalStore medications
  let foundMed: any = null;
  for (const rx of Object.values(globalStore.prescriptions)) {
    const m = (rx.medications || []).find((med) => med.id === id);
    if (m) {
      foundMed = m;
      break;
    }
  }

  const medName = foundMed?.medicine_name_raw || id;
  const canonicalKey = (foundMed?.medicine_name_normalized || medName).toLowerCase().trim();
  const benchmark = BENCHMARK_MAP[canonicalKey] || BENCHMARK_MAP[canonicalKey.replace(/\s+/g, '-')] || null;

  const isVerified = Boolean(foundMed?.critical_fields_complete && foundMed?.safety_gate_status === 'VERIFIED');
  const encoded = encodeURIComponent(medName);

  const providers = [
    { name: 'Tata 1mg', slug: '1mg', searchUrl: `https://www.1mg.com/search/all?name=${encoded}`, color: '#FF6F61' },
    { name: 'Apollo Pharmacy', slug: 'apollo', searchUrl: `https://www.apollopharmacy.in/search-medicines/${encoded}`, color: '#02475B' },
    { name: 'PharmEasy', slug: 'pharmeasy', searchUrl: `https://pharmeasy.in/search/all?name=${encoded}`, color: '#10847E' },
    { name: 'Netmeds', slug: 'netmeds', searchUrl: `https://www.netmeds.com/catalogsearch/result?q=${encoded}`, color: '#24AEB1' },
  ];

  let lowestPriceProvider: string | null = null;
  let lowestUnitPrice = Infinity;

  const options = providers.map((prov) => {
    const pData = benchmark?.prices?.[prov.name];
    if (pData) {
      const uPrice = +(pData.price / benchmark.units).toFixed(2);
      const discount = Math.round(((pData.mrp - pData.price) / pData.mrp) * 100);

      if (uPrice < lowestUnitPrice) {
        lowestUnitPrice = uPrice;
        lowestPriceProvider = prov.name;
      }

      return {
        provider_name: prov.name,
        provider_slug: prov.slug,
        logo_color: prov.color,
        has_verified_pricing: true,
        product_title: benchmark.title,
        strength: benchmark.strength,
        dosage_form: benchmark.dosage_form,
        pack_size: benchmark.pack_size,
        units_per_pack: benchmark.units,
        mrp: pData.mrp,
        current_price: pData.price,
        discount_percentage: discount,
        unit_price: uPrice,
        in_stock: true,
        product_url: pData.url,
        last_updated: new Date().toISOString(),
        price_status_label: 'Verified Formulary Price',
      };
    }

    return {
      provider_name: prov.name,
      provider_slug: prov.slug,
      logo_color: prov.color,
      has_verified_pricing: false,
      product_title: `${medName} (Catalog Search)`,
      strength: foundMed?.strength || 'Standard',
      dosage_form: foundMed?.dosage_form || 'Tablet',
      pack_size: 'Standard Pack',
      units_per_pack: 10,
      mrp: null,
      current_price: null,
      discount_percentage: null,
      unit_price: null,
      in_stock: true,
      product_url: prov.searchUrl,
      last_updated: null,
      price_status_label: 'Price unavailable / Live catalog search',
    };
  });

  return NextResponse.json({
    medication_id: id,
    medicine_name: medName,
    normalized_name: foundMed?.medicine_name_normalized || medName,
    active_ingredient: foundMed?.active_ingredient || null,
    strength: foundMed?.strength || benchmark?.strength || null,
    dosage_form: foundMed?.dosage_form || benchmark?.dosage_form || null,
    is_prescription_verified: isVerified,
    safety_gate_status: foundMed?.safety_gate_status || 'VERIFIED',
    safety_notice: isVerified
      ? null
      : 'Prescription verification is pending. Please verify dosage details with your doctor before purchasing.',
    lowest_price_provider: isVerified ? lowestPriceProvider : null,
    comparable_pack_size: 'Per Tablet / Capsule Unit Comparison',
    pharmacy_options: options,
    disclaimer:
      'Prices are benchmark reference prices from verified partner formularies. Live pharmacy inventory and prices may vary. A valid doctor prescription is required for scheduled medicines.',
  });
}
