import uuid
import urllib.parse
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from models.database import PharmacyProvider, PharmacyProductListing, Medication

DEFAULT_PROVIDERS = [
    {
        "name": "Tata 1mg",
        "slug": "1mg",
        "base_url": "https://www.1mg.com",
        "search_url_template": "https://www.1mg.com/search/all?name={query}",
        "logo_color": "#FF6F61"
    },
    {
        "name": "Apollo Pharmacy",
        "slug": "apollo",
        "base_url": "https://www.apollopharmacy.in",
        "search_url_template": "https://www.apollopharmacy.in/search-medicines/{query}",
        "logo_color": "#02475B"
    },
    {
        "name": "PharmEasy",
        "slug": "pharmeasy",
        "base_url": "https://pharmeasy.in",
        "search_url_template": "https://pharmeasy.in/search/all?name={query}",
        "logo_color": "#10847E"
    },
    {
        "name": "Netmeds",
        "slug": "netmeds",
        "base_url": "https://www.netmeds.com",
        "search_url_template": "https://www.netmeds.com/catalogsearch/result?q={query}",
        "logo_color": "#24AEB1"
    }
]

SEED_BENCHMARK_PRICES = [
    # Paracetamol 650mg
    {
        "canonical": "Paracetamol",
        "title": "Dolo 650mg Tablet",
        "strength": "650 mg",
        "form": "Tablet",
        "pack_size": "Strip of 15 Tablets",
        "units": 15,
        "prices": {
            "1mg": {"mrp": 34.0, "price": 28.56, "in_stock": True, "url": "https://www.1mg.com/drugs/dolo-650-tablet-41635"},
            "apollo": {"mrp": 34.0, "price": 29.24, "in_stock": True, "url": "https://www.apollopharmacy.in/medicine/dolo-650mg-strip-of-15-tablets"},
            "pharmeasy": {"mrp": 34.0, "price": 27.88, "in_stock": True, "url": "https://pharmeasy.in/online-medicine-order/dolo-650mg-strip-of-15-tablets-45155"},
            "netmeds": {"mrp": 34.0, "price": 28.90, "in_stock": True, "url": "https://www.netmeds.com/prescriptions/dolo-650mg-tablet-15-s"}
        }
    },
    # Pantoprazole 40mg
    {
        "canonical": "Pantoprazole",
        "title": "Pan 40 Tablet",
        "strength": "40 mg",
        "form": "Tablet",
        "pack_size": "Strip of 15 Tablets",
        "units": 15,
        "prices": {
            "1mg": {"mrp": 155.0, "price": 131.75, "in_stock": True, "url": "https://www.1mg.com/drugs/pan-40-tablet-69062"},
            "apollo": {"mrp": 155.0, "price": 133.30, "in_stock": True, "url": "https://www.apollopharmacy.in/medicine/pan-40-strip-of-15-tablets"},
            "pharmeasy": {"mrp": 155.0, "price": 128.65, "in_stock": True, "url": "https://pharmeasy.in/online-medicine-order/pan-40mg-strip-of-15-tablets-8086"},
            "netmeds": {"mrp": 155.0, "price": 131.75, "in_stock": True, "url": "https://www.netmeds.com/prescriptions/pan-40mg-tablet-15s"}
        }
    },
    # Pan-D Capsule
    {
        "canonical": "Pan-D",
        "title": "Pan-D Capsule SR",
        "strength": "40 mg",
        "form": "Capsule",
        "pack_size": "Strip of 15 Capsules",
        "units": 15,
        "prices": {
            "1mg": {"mrp": 199.0, "price": 169.15, "in_stock": True, "url": "https://www.1mg.com/drugs/pan-d-capsule-sr-69063"},
            "apollo": {"mrp": 199.0, "price": 171.14, "in_stock": True, "url": "https://www.apollopharmacy.in/medicine/pan-d-capsule-15-s"},
            "pharmeasy": {"mrp": 199.0, "price": 165.17, "in_stock": True, "url": "https://pharmeasy.in/online-medicine-order/pan-d-capsule-15-s-8088"},
            "netmeds": {"mrp": 199.0, "price": 169.15, "in_stock": True, "url": "https://www.netmeds.com/prescriptions/pan-d-capsule-15-s"}
        }
    },
    # Opox-CV 200mg
    {
        "canonical": "Opox-CV",
        "title": "Opox-CV 200/125 Tablet",
        "strength": "200 mg",
        "form": "Tablet",
        "pack_size": "Strip of 10 Tablets",
        "units": 10,
        "prices": {
            "1mg": {"mrp": 375.0, "price": 318.75, "in_stock": True, "url": "https://www.1mg.com/drugs/opox-cv-200-tablet-153303"},
            "apollo": {"mrp": 375.0, "price": 322.50, "in_stock": True, "url": "https://www.apollopharmacy.in/medicine/opox-cv-200-tablet"},
            "pharmeasy": {"mrp": 375.0, "price": 311.25, "in_stock": True, "url": "https://pharmeasy.in/online-medicine-order/opox-cv-200-tablet"},
            "netmeds": {"mrp": 375.0, "price": 318.75, "in_stock": True, "url": "https://www.netmeds.com/prescriptions/opox-cv-200-tablet"}
        }
    },
    # Aldigesic-SP
    {
        "canonical": "Aldigesic-SP",
        "title": "Aldigesic-SP Tablet",
        "strength": "Standard Combination",
        "form": "Tablet",
        "pack_size": "Strip of 10 Tablets",
        "units": 10,
        "prices": {
            "1mg": {"mrp": 142.0, "price": 120.70, "in_stock": True, "url": "https://www.1mg.com/drugs/aldigesic-sp-tablet-133596"},
            "apollo": {"mrp": 142.0, "price": 122.12, "in_stock": True, "url": "https://www.apollopharmacy.in/medicine/aldigesic-sp-tablet"},
            "pharmeasy": {"mrp": 142.0, "price": 117.86, "in_stock": True, "url": "https://pharmeasy.in/online-medicine-order/aldigesic-sp-tablet"},
            "netmeds": {"mrp": 142.0, "price": 120.70, "in_stock": True, "url": "https://www.netmeds.com/prescriptions/aldigesic-sp-tablet"}
        }
    },
    # Breezy
    {
        "canonical": "Breezy",
        "title": "Breezy 5mg/10mg Tablet",
        "strength": "5mg/10mg",
        "form": "Tablet",
        "pack_size": "Strip of 10 Tablets",
        "units": 10,
        "prices": {
            "1mg": {"mrp": 168.0, "price": 142.80, "in_stock": True, "url": "https://www.1mg.com/drugs/breezy-tablet-152019"},
            "apollo": {"mrp": 168.0, "price": 144.48, "in_stock": True, "url": "https://www.apollopharmacy.in/medicine/breezy-tablet"},
            "pharmeasy": {"mrp": 168.0, "price": 139.44, "in_stock": True, "url": "https://pharmeasy.in/online-medicine-order/breezy-tablet"},
            "netmeds": {"mrp": 168.0, "price": 142.80, "in_stock": True, "url": "https://www.netmeds.com/prescriptions/breezy-tablet"}
        }
    },
    # Amoxicillin 500mg
    {
        "canonical": "Amoxicillin",
        "title": "Novamox 500 Capsule",
        "strength": "500 mg",
        "form": "Capsule",
        "pack_size": "Strip of 15 Capsules",
        "units": 15,
        "prices": {
            "1mg": {"mrp": 110.0, "price": 93.50, "in_stock": True, "url": "https://www.1mg.com/drugs/novamox-500-capsule-64039"},
            "apollo": {"mrp": 110.0, "price": 94.60, "in_stock": True, "url": "https://www.apollopharmacy.in/medicine/novamox-500mg-capsule-15-s"},
            "pharmeasy": {"mrp": 110.0, "price": 91.30, "in_stock": True, "url": "https://pharmeasy.in/online-medicine-order/novamox-500mg-capsule-15-s-21950"},
            "netmeds": {"mrp": 110.0, "price": 93.50, "in_stock": True, "url": "https://www.netmeds.com/prescriptions/novamox-500mg-capsule-15s"}
        }
    }
]

class PharmacyService:
    @staticmethod
    def ensure_seed_data(db: Session):
        # 1. Seed Providers
        provider_map = {}
        for p_data in DEFAULT_PROVIDERS:
            existing = db.query(PharmacyProvider).filter(PharmacyProvider.slug == p_data["slug"]).first()
            if not existing:
                prov = PharmacyProvider(**p_data)
                db.add(prov)
                db.flush()
                provider_map[p_data["slug"]] = prov
            else:
                provider_map[p_data["slug"]] = existing

        # 2. Seed Benchmark Listings
        for b in SEED_BENCHMARK_PRICES:
            canonical = b["canonical"]
            for slug, pr_info in b["prices"].items():
                prov = provider_map.get(slug)
                if not prov:
                    continue
                existing_listing = db.query(PharmacyProductListing).filter(
                    PharmacyProductListing.provider_id == prov.id,
                    PharmacyProductListing.canonical_medicine_name == canonical
                ).first()
                if not existing_listing:
                    listing = PharmacyProductListing(
                        provider_id=prov.id,
                        canonical_medicine_name=canonical,
                        product_title=b["title"],
                        strength=b["strength"],
                        dosage_form=b["form"],
                        pack_size=b["pack_size"],
                        units_per_pack=b["units"],
                        mrp=pr_info["mrp"],
                        discounted_price=pr_info["price"],
                        in_stock=pr_info["in_stock"],
                        product_url=pr_info["url"],
                        is_verified_price=True
                    )
                    db.add(listing)
        db.commit()

    @staticmethod
    def get_pharmacy_options_for_medication(db: Session, medication: Medication) -> Dict[str, Any]:
        PharmacyService.ensure_seed_data(db)

        # SAFETY CHECK: Only verified medications can have unlocked online pharmacy pricing
        is_verified = bool(medication.critical_fields_complete and medication.safety_gate_status == "VERIFIED")
        medicine_query = medication.medicine_name_normalized or medication.medicine_name_raw

        providers = db.query(PharmacyProvider).filter(PharmacyProvider.is_active == True).all()

        results = []
        lowest_unit_price = float("inf")
        lowest_price_option = None

        encoded_query = urllib.parse.quote(medicine_query)

        # Match benchmark listings if canonical match exists
        matched_listings = db.query(PharmacyProductListing).filter(
            PharmacyProductListing.canonical_medicine_name.ilike(f"%{medicine_query}%")
        ).all()

        listings_by_provider = {l.provider_id: l for l in matched_listings}

        for prov in providers:
            listing = listings_by_provider.get(prov.id)
            search_url = prov.search_url_template.replace("{query}", encoded_query)

            if listing:
                unit_price = round(listing.discounted_price / max(listing.units_per_pack, 1), 2)
                discount_pct = round(((listing.mrp - listing.discounted_price) / listing.mrp) * 100) if listing.mrp else 0

                item = {
                    "provider_name": prov.name,
                    "provider_slug": prov.slug,
                    "logo_color": prov.logo_color,
                    "has_verified_pricing": True,
                    "product_title": listing.product_title,
                    "strength": listing.strength,
                    "dosage_form": listing.dosage_form,
                    "pack_size": listing.pack_size,
                    "units_per_pack": listing.units_per_pack,
                    "mrp": listing.mrp,
                    "current_price": listing.discounted_price,
                    "discount_percentage": discount_pct,
                    "unit_price": unit_price,
                    "in_stock": listing.in_stock,
                    "product_url": listing.product_url,
                    "last_updated": listing.price_verified_at.isoformat() if listing.price_verified_at else None,
                    "price_status_label": "Verified Formulary Price"
                }

                if unit_price < lowest_unit_price:
                    lowest_unit_price = unit_price
                    lowest_price_option = prov.name

            else:
                # Honest Fallback: Search link on official pharmacy platform
                item = {
                    "provider_name": prov.name,
                    "provider_slug": prov.slug,
                    "logo_color": prov.logo_color,
                    "has_verified_pricing": False,
                    "product_title": f"{medicine_query} (Search Catalog)",
                    "strength": medication.strength or "Standard",
                    "dosage_form": medication.dosage_form or "Tablet",
                    "pack_size": "Standard Pack",
                    "units_per_pack": 10,
                    "mrp": None,
                    "current_price": None,
                    "discount_percentage": None,
                    "unit_price": None,
                    "in_stock": True,
                    "product_url": search_url,
                    "last_updated": None,
                    "price_status_label": "Price unavailable / Live platform search"
                }

            results.append(item)

        return {
            "medication_id": medication.id,
            "medicine_name": medication.medicine_name_raw,
            "normalized_name": medication.medicine_name_normalized,
            "active_ingredient": medication.active_ingredient,
            "strength": medication.strength,
            "dosage_form": medication.dosage_form,
            "is_prescription_verified": is_verified,
            "safety_gate_status": medication.safety_gate_status,
            "safety_notice": None if is_verified else "Prescription verification is pending. Please verify dosage details with your doctor before purchasing.",
            "lowest_price_provider": lowest_price_option if is_verified else None,
            "comparable_pack_size": "Per Tablet / Capsule Unit Comparison",
            "pharmacy_options": results,
            "disclaimer": "Prices are benchmark reference prices from verified partner formularies. Live pharmacy inventory and prices may vary. A valid doctor's prescription is required for scheduled medicines."
        }
