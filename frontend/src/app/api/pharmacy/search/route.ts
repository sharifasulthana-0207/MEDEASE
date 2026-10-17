import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'Paracetamol';
  const encoded = encodeURIComponent(query);

  const providers = [
    { name: 'Tata 1mg', slug: '1mg', searchUrl: `https://www.1mg.com/search/all?name=${encoded}`, color: '#FF6F61' },
    { name: 'Apollo Pharmacy', slug: 'apollo', searchUrl: `https://www.apollopharmacy.in/search-medicines/${encoded}`, color: '#02475B' },
    { name: 'PharmEasy', slug: 'pharmeasy', searchUrl: `https://pharmeasy.in/search/all?name=${encoded}`, color: '#10847E' },
    { name: 'Netmeds', slug: 'netmeds', searchUrl: `https://www.netmeds.com/catalogsearch/result?q=${encoded}`, color: '#24AEB1' },
  ];

  const options = providers.map((p) => ({
    provider_name: p.name,
    provider_slug: p.slug,
    logo_color: p.color,
    has_verified_pricing: false,
    product_title: `${query} (Search Catalog)`,
    strength: 'Standard',
    dosage_form: 'Tablet / Capsule',
    pack_size: 'Standard Pack',
    units_per_pack: 10,
    mrp: null,
    current_price: null,
    discount_percentage: null,
    unit_price: null,
    in_stock: true,
    product_url: p.searchUrl,
    last_updated: null,
    price_status_label: 'Live platform search',
  }));

  return NextResponse.json({
    medicine_name: query,
    is_prescription_verified: true,
    comparable_pack_size: 'Direct Pharmacy Catalog Search',
    pharmacy_options: options,
    disclaimer:
      'Search links direct to authorized online pharmacies. Always check that the brand and formulation match your doctor\'s prescription.',
  });
}
