
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const projectsData = [
    {
        "id": "35e9b586-2b82-4275-8341-59426685a509",
        "project_name": "Project Orange",
        "latitude": 12.8399,
        "longitude": 77.6770,
        "unit_templates": [
            {
                "id": "f9117885-45ff-4672-9f6f-0a397754c4be",
                "wc_count": 2,
                "config_type": "2 BHK",
                "description": "Smart 2 BHK with efficient layout and balcony.",
                "std_uds_area": 250,
                "balcony_count": 2,
                "template_name": "2 BHK Comfort",
                "specifications": {
                    "bedrooms": 2,
                    "bathrooms": 2
                },
                "std_base_price": 8500000,
                "unit_drawbacks": "View options limited in some stacks.",
                "unit_strengths": "Good natural light, compact layout, lower ticket size.",
                "room_dimensions": {
                    "living": "12x18 ft",
                    "master_bedroom": "11x14 ft"
                },
                "std_carpet_area": 780,
                "std_garden_area": 0,
                "std_balcony_area": 90,
                "std_terrace_area": 0,
                "vastu_compliance": "East/West facing options available.",
                "std_price_per_sqft": 10800,
                "ventilation_quality": "Good",
                "std_super_built_up_area": 1200
            },
            {
                "id": "81eb6d48-cbdd-43f8-8b5b-2e06b2132d1a",
                "wc_count": 3,
                "config_type": "3 BHK Premium",
                "description": "Premium 3 BHK with large living space and balcony.",
                "std_uds_area": 320,
                "balcony_count": 2,
                "template_name": "3 BHK Premium",
                "specifications": {
                    "bedrooms": 3,
                    "bathrooms": 3
                },
                "std_base_price": 11500000,
                "unit_drawbacks": "Higher overall ticket size than 2 BHK units.",
                "unit_strengths": "Better views, corner-unit options, good cross-ventilation.",
                "room_dimensions": {
                    "living": "13x20 ft",
                    "master_bedroom": "12x15 ft"
                },
                "std_carpet_area": 1020,
                "std_garden_area": 0,
                "std_balcony_area": 120,
                "std_terrace_area": 0,
                "vastu_compliance": "65–80% units Vastu friendly.",
                "std_price_per_sqft": 11500,
                "ventilation_quality": "Excellent",
                "std_super_built_up_area": 1550
            },
            {
                "id": "49ce6d6b-0d90-4f16-a67b-bffab4bc42eb",
                "wc_count": 3,
                "config_type": "3 BHK Luxe",
                "description": "Larger 3 BHK with premium location and corner-unit layout.",
                "std_uds_area": 350,
                "balcony_count": 2,
                "template_name": "3 BHK Luxe Corner",
                "specifications": {
                    "study": 1,
                    "bedrooms": 3,
                    "bathrooms": 3
                },
                "std_base_price": 13500000,
                "unit_drawbacks": "Higher price point compared to 3 BHK Premium.",
                "unit_strengths": "Corner unit with better cross ventilation and views.",
                "room_dimensions": {
                    "living": "13x22 ft",
                    "master_bedroom": "12x16 ft"
                },
                "std_carpet_area": 1180,
                "std_garden_area": 0,
                "std_balcony_area": 130,
                "std_terrace_area": 0,
                "vastu_compliance": "Mostly East/West facing options with corner layouts.",
                "std_price_per_sqft": 12200,
                "ventilation_quality": "Excellent",
                "std_super_built_up_area": 1750
            }
        ],
        "unit_configs": [
            {
                "id": "a40638ce-2a1e-4559-b475-47b31349a241",
                "size_sba": "600 Sq.ft",
                "view_types": "Garden View",
                "size_carpet": "450 Sq.ft",
                "configuration": "1 BHK",
                "unit_drawbacks": "No balcony",
                "unit_strengths": "Compact and efficient",
                "available_units": 10,
                "vastu_compliance": "East Facing",
                "ventilation_quality": "Good",
                "premium_facing_options": "Pool View"
            },
            {
                "id": "426ecd56-debe-4cb6-9e5c-9753f121d727",
                "size_sba": "950 Sq.ft",
                "view_types": "City View",
                "size_carpet": "700 Sq.ft",
                "configuration": "2 BHK",
                "unit_drawbacks": "Common wall",
                "unit_strengths": "Spacious master bedroom",
                "available_units": 15,
                "vastu_compliance": "North Facing",
                "ventilation_quality": "Excellent",
                "premium_facing_options": "Park View"
            },
            {
                "id": "0a0b7768-2172-41e3-9560-90c5118c168f",
                "size_sba": "1200 Sq.ft",
                "view_types": "Garden, Clubhouse",
                "size_carpet": "780 Sq.ft",
                "configuration": "2 BHK",
                "unit_drawbacks": null,
                "unit_strengths": "Compact luxury with efficient layout",
                "available_units": 6,
                "vastu_compliance": "East / West",
                "ventilation_quality": "Good",
                "premium_facing_options": "Garden Facing"
            },
            {
                "id": "3ee5ecf3-2db3-493a-ac81-702efb34210d",
                "size_sba": "1550 Sq.ft",
                "view_types": "Forest View",
                "size_carpet": "1020 Sq.ft",
                "configuration": "3 BHK Premium",
                "unit_drawbacks": null,
                "unit_strengths": "Spacious balconies with forest view",
                "available_units": 6,
                "vastu_compliance": "East / West",
                "ventilation_quality": "Excellent",
                "premium_facing_options": "Central Greens"
            },
            {
                "id": "b4e0412d-ebee-4f0a-b334-b1e09c7b7149",
                "size_sba": "1750 Sq.ft",
                "view_types": "Panoramic City View",
                "size_carpet": "1180 Sq.ft",
                "configuration": "3 BHK Luxe",
                "unit_drawbacks": null,
                "unit_strengths": "Corner unit privacy with dual views",
                "available_units": 2,
                "vastu_compliance": "East / North",
                "ventilation_quality": "Superior",
                "premium_facing_options": "Corner Unit"
            }
        ],
        "unit_count": 14,
        "location_data": {
            "address": {
                "id": "3f76dc9d-ee82-485d-b0f3-93653fb61ecb",
                "key_road_access": "Off Begur - Koppa Road, with access to Bannerghatta Road and Electronic City.",
                "nearby_landmark": "Near BVM Global School, Koppa Road",
                "detailed_address": "Sy. No. 41/4 & 43/1, Hullahalli Village, Jigani Hobli, Anekal Taluk, Bengaluru Urban, Karnataka - 560083",
                "general_location": "Hullahalli, South Bengaluru"
            },
            "schools": [
                {
                    "id": "1cb50b5c-e4fc-4bb2-9c5c-78093dfff6a6",
                    "distance_km": "~1 – 2 km",
                    "school_name": "Candor International School",
                    "travel_time": "5 – 10 mins"
                },
                {
                    "id": "eef63522-afa0-425e-b131-60500e05051c",
                    "distance_km": "~3 – 5 km",
                    "school_name": "Christ Academy",
                    "travel_time": "10 – 15 mins"
                },
                {
                    "id": "9b6e0997-8af4-41f3-b882-691adf80f9bd",
                    "distance_km": "~8 – 10 km",
                    "school_name": "Delhi Public School",
                    "travel_time": "25 – 35 mins"
                }
            ],
            "it_parks": [
                {
                    "id": "c606a980-d448-4e43-aa90-3fd78a3746db",
                    "distance_km": "10–12 km",
                    "travel_time": "25–35 mins",
                    "it_park_name": "Electronic City Phase 1"
                },
                {
                    "id": "25a72b0f-27b8-41d4-9238-d5a65f9aeb49",
                    "distance_km": "12–14 km",
                    "travel_time": "30–40 mins",
                    "it_park_name": "RMZ Ecoworld / Ecospace (ORR)"
                }
            ],
            "hospitals": [
                {
                    "id": "ac0a2598-4346-40e2-bc42-832b8314fdf9",
                    "distance_km": "~10 – 12 km",
                    "travel_time": "25 – 40 mins",
                    "hospital_name": "Cloudnine Hospital, Bannerghatta Road"
                },
                {
                    "id": "8080630e-daa6-4385-9436-b51e6e9e50b0",
                    "distance_km": "~12 – 14 km",
                    "travel_time": "30 – 40 mins",
                    "hospital_name": "Sakra World Hospital"
                }
            ],
            "landmarks": [
                {
                    "id": "b5e1f4d1-c777-4a3a-8d28-7eaf7d302d7d",
                    "name": "Candor International School",
                    "category": "Education",
                    "distance_km": 1.5,
                    "travel_time_mins": 7
                },
                {
                    "id": "3823118a-7d40-400d-869d-b65f0933e497",
                    "name": "Electronic City Phase 1",
                    "category": "IT Park",
                    "distance_km": 3.5,
                    "travel_time_mins": 15
                }
            ],
            "future_govt": [
                {
                    "id": "fb76a9be-78cb-4bf8-9a4f-e0c7056035bd",
                    "description": "Planned Yellow Line improving connectivity to Bommasandra–RV Road corridor.",
                    "development_name": "Namma Metro Yellow Line Completion"
                }
            ],
            "connectivity": {
                "id": "a8c26b23-4496-4f60-96d9-e74efa8c9168",
                "airport_distance": "45–60 km to Kempegowda International Airport (BLR)",
                "distance_to_main_road": "0.8 km to Begur-Koppa Main Road",
                "metro_station_distance": "10–12 km to upcoming Yellow Line (Bommasandra) Metro",
                "railway_station_distance": "15–20 mins to Heelalige Railway Station"
            }
        },
        "amenities_data": {
            "pool": {
                "id": "5d47adec-8cdb-4ffd-95ee-06b54358c335",
                "features": "Deck seating, separate kids pool, poolside showers.",
                "pool_type": "Adult & Kids Pool",
                "dimensions": "Adult: 25m x 10m, Kids: 10m x 6m"
            },
            "indoor": [
                {
                    "id": "b1a53b0e-72f6-41f4-b18a-61b9104c1cdf",
                    "description": "Fully equipped gym with cardio and strength training equipment.",
                    "amenity_name": "Gym"
                }
            ],
            "sports": [
                {
                    "id": "4e2c5be5-eb30-48b8-8b36-f20a3f9a50d5",
                    "description": "Outdoor half court with night lighting.",
                    "facility_name": "Basketball Half Court"
                }
            ],
            "unique": [
                {
                    "id": "d0044b7b-4c7b-4357-aeee-87ec615cd0db",
                    "description": "Elevated wooden deck overlooking central green forest zone.",
                    "amenity_name": "Forest Deck"
                }
            ],
            "general": [
                {
                    "id": "138a1c0f-e8a8-4fff-9537-4423a5a992a7",
                    "name": "Clubhouse",
                    "category": "Leisure",
                    "size_specs": "5000 sq ft Multi-level"
                }
            ],
            "clubhouse": [
                {
                    "id": "96fd436e-c201-4c43-8b58-6c6999888d7e",
                    "clubhouse_size": "25,000 sq.ft.",
                    "total_clubhouses": 1
                }
            ]
        },
        "technical_specs": {
            "master": {
                "id": "f4b81ab2-a75f-4fb5-8df4-c3a8bfdd8c20",
                "no_of_towers": 7,
                "units_per_floor": "4–6 units per typical floor",
                "floors_per_tower": "2B + G + 19 Floors",
                "construction_type": "RCC framed structure with shear walls",
                "elevators_per_tower": "2 Passenger + 1 Service Lift per tower"
            },
            "kitchen": {
                "id": "ba3670a4-b63e-4400-8dc3-e49d4f961ad9",
                "fittings": "Granite counter with stainless steel sink; dado up to 2 ft above counter.",
                "provisions": "Provision for water purifier, hob & chimney, refrigerator, washing machine and dishwasher in utility.",
                "kitchen_design": "Open kitchen with attached utility."
            },
            "bathroom": [
                {
                    "id": "2fa63a04-3918-48ad-889f-0eca833252dc",
                    "fixtures": "Premium sanitaryware (Jaquar/Kohler or equivalent) with wall-hung EWC and countertop basins.",
                    "flooring": "Anti-skid vitrified tiles with full-height dado.",
                    "water_heater": "Provision for geyser and solar water heater line to master toilet.",
                    "additional_features": "Glass partition in master bath, health faucet in all toilets."
                }
            ],
            "flooring": [
                {
                    "id": "464fa92b-1f1b-496c-b3c1-8e8ca4ec0e8d",
                    "maids_room": "Vitrified tiles in maid’s room and utility.",
                    "master_suite": "Laminated wooden flooring or premium vitrified tiles.",
                    "other_bedrooms": "Vitrified tiles in all secondary bedrooms.",
                    "balconies_terraces": "Anti-skid ceramic tiles in balconies and terraces.",
                    "living_dining_kitchen": "Premium vitrified tiles in living, dining and kitchen areas."
                }
            ],
            "electrical": {
                "id": "80060df1-a8b2-4643-a490-69b8ed9e5fb9",
                "switches": "Modular switches (Schneider/Anchor or equivalent).",
                "power_supply": "2 BHK: 6 kW, 3 BHK: 7 kW; 100% DG backup for common areas.",
                "ac_provisions": "AC points in living and all bedrooms.",
                "wiring_details": "Fire-retardant copper wiring with adequate points in all rooms.",
                "tv_telephone_points": "TV & data points in living and master bedroom."
            }
        },
        "commercial_data": {
            "cost_extras": [
                {
                    "id": "0e83b9ad-1242-43bd-89e9-5da7b8d7e1b1",
                    "name": "Clubhouse Access Upgrade",
                    "amount": 100000,
                    "cost_type": "Optional Add-on",
                    "payment_milestone": "Payable at fit-out stage."
                }
            ],
            "base_pricing": {
                "id": "6af14cad-6607-499a-a8b9-419bcc810895",
                "plc_charges": "₹1–2 Lakh depending on view and facing.",
                "sinking_fund": "₹1,50,000 corpus fund at handover.",
                "car_parking_cost": 450000,
                "clubhouse_charges": 250000,
                "floor_rise_charges": "₹25/sq.ft. for floors 11 and above.",
                "base_price_per_sqft": 10500,
                "maintenance_charges": "₹4.5/sq.ft./month, payable yearly.",
                "infrastructure_charges": "Includes BWSSB, BESCOM and infra charges bundled in agreement."
            },
            "other_charges": [
                {
                    "id": "985e2f1c-d4f2-4dc1-bede-d68da3e602f7",
                    "charge_type": "Legal & Documentation Charges",
                    "description": "Covers documentation, agreement drafting and registration support.",
                    "charge_value": "₹35,000 + GST"
                }
            ],
            "payment_plans": [
                {
                    "id": "84e8c319-82a3-4c92-be40-da483c4a33f3",
                    "plan_name": "Construction Linked Plan",
                    "plan_description": "Standard construction linked plan with booking, agreement, slab-wise and possession-linked payments."
                }
            ]
        },
        "market_analysis": {
            "analysis": [
                {
                    "id": "7d797b87-1f98-4d3c-a201-527ac717e526",
                    "usp": "Forest-themed high-rise project with 72% open space and practical ticket sizes.",
                    "cons": ["Distance from CBD areas.", "Metro connectivity still in progress."],
                    "pros": ["Strong connectivity to Electronic City and ORR IT corridor.", "Forest-themed master plan with high open space."],
                    "closing_pitch": "Project Orange gives your family a green, well-connected home in South Bengaluru at a sensible price point.",
                    "overall_rating": 8.6,
                    "competitor_names": ["Rainbow Mayfair", "Assetz Canvas & Cove"],
                    "objection_handling": "Highlight connectivity, brand, forest theme and long-term appreciation.",
                    "target_customer_profile": "IT professionals and families working in Electronic City, Bellandur and ORR."
                }
            ],
            "strategy": {
                "id": "234250ca-c729-4506-b721-ac84828d2f62",
                "closing_strategy": "Shortlist 2–3 units, show view and plan, then close with time-bound offer.",
                "key_selling_points": "Forest-themed layout, IT connectivity.",
                "objection_handling": "Compare travel times with competitor projects.",
                "customer_objections": "Distance from workplace or metro.",
                "ideal_customer_persona": "Mid to upper-mid income IT families with 80 L – 1.5 Cr budget."
            },
            "developer": {
                "id": "ae64b508-e9b0-4d7b-beeb-0104c1ba6df0",
                "years_in_market": 16,
                "customer_feedback": "Positive feedback on finishing and after-sales support.",
                "financial_strength": "Comfortable leverage, strong cashflows.",
                "construction_quality": "Consistent RCC framed structures.",
                "developer_reputation": "Tier-1 regional developer.",
                "past_completed_projects": "Orange Meadows, Orange Heights."
            },
            "competitors": [
                {
                    "id": "7497e25d-241c-410a-a6be-c2eeaf36ff45",
                    "competitor_name": "Trendsquares Akino",
                    "approx_price_range": "₹1.64 Cr Onwards"
                }
            ]
        }
    },
    {
        "id": "038b1d29-c698-49a9-803c-acc3fb501ac7",
        "project_name": "Godrej Woods",
        "latitude": 13.0645,
        "longitude": 77.6418,
        "unit_count": 5,
        "location_data": {
            "schools": [
                {
                    "id": "ef0facda-d61c-4b6c-a94f-9c8002bc54ea",
                    "distance_km": "2.5 km",
                    "school_name": "Delhi Public School",
                    "travel_time": "10 mins"
                },
                {
                    "id": "3ca6994a-1cd2-4864-99dc-59c7df0a1bc0",
                    "distance_km": "3.0 km",
                    "school_name": "Ryan International School",
                    "travel_time": "12 mins"
                },
                {
                    "id": "3c191ca8-17d8-49a0-b357-9582e8429d7f",
                    "distance_km": "4.5 km",
                    "school_name": "National Public School",
                    "travel_time": "15 mins"
                }
            ],
            "it_parks": [
                {
                    "id": "3e91622c-dfed-4a45-ac8c-756ee0d9111b",
                    "distance_km": "8.0 km",
                    "travel_time": "25 mins",
                    "it_park_name": "Manyata Tech Park"
                },
                {
                    "id": "1ae0416e-ac60-4945-8106-9ee654f57a8f",
                    "distance_km": "6.5 km",
                    "travel_time": "20 mins",
                    "it_park_name": "Embassy Tech Village"
                }
            ],
            "hospitals": [
                {
                    "id": "42d774ff-077d-4a31-9454-e6265b19f492",
                    "distance_km": "3.5 km",
                    "travel_time": "12 mins",
                    "hospital_name": "Columbia Asia Hospital"
                },
                {
                    "id": "474572ae-5a52-40b3-a77a-3f218f734088",
                    "distance_km": "5.0 km",
                    "travel_time": "18 mins",
                    "hospital_name": "Manipal Hospital"
                }
            ],
            "landmarks": [
                {
                    "id": "a02c1db5-3a9b-452e-8c59-b99299d44345",
                    "name": "Manyata Tech Park",
                    "category": "IT Park",
                    "distance_km": 5,
                    "travel_time_mins": 10
                },
                {
                    "id": "bd31de00-583f-4e58-bf7e-e7aec9b025fe",
                    "name": "Kirloskar Business Park",
                    "category": "IT Park",
                    "distance_km": 7,
                    "travel_time_mins": 18
                },
                {
                    "id": "48029cfd-0ebd-4262-ba18-7f944b12fcd4",
                    "name": "KIADB Aerospace Park",
                    "category": "Industrial",
                    "distance_km": 6,
                    "travel_time_mins": 15
                },
                {
                    "id": "38e93fbf-be58-43c6-b682-074fa546fb9e",
                    "name": "REVA University",
                    "category": "Education",
                    "distance_km": 1,
                    "travel_time_mins": 2
                },
                {
                    "id": "4df89b59-0c4b-4717-b756-df2e4eb8392d",
                    "name": "DPS North",
                    "category": "School",
                    "distance_km": 3,
                    "travel_time_mins": 7
                },
                {
                    "id": "75f7c2c0-9506-4afa-aa7e-a3f427b68b9b",
                    "name": "Vidyashilp Academy",
                    "category": "School",
                    "distance_km": 4,
                    "travel_time_mins": 10
                },
                {
                    "id": "75f06709-cf15-44c0-af46-8787236b27d4",
                    "name": "Cytecare Cancer Hospital",
                    "category": "Hospital",
                    "distance_km": 3.5,
                    "travel_time_mins": 7
                },
                {
                    "id": "0b3e80bf-e92d-424f-905d-df221d3f50b5",
                    "name": "Aster CMI Hospital",
                    "category": "Hospital",
                    "distance_km": 6,
                    "travel_time_mins": 15
                },
                {
                    "id": "90ba82c6-1838-449f-80b4-e2532a1fe231",
                    "name": "Bhartiya Mall of Bengaluru",
                    "category": "Shopping",
                    "distance_km": 2.5,
                    "travel_time_mins": 5
                },
                {
                    "id": "8ce91734-ddeb-4c8c-ac4c-6b47f63ec491",
                    "name": "Phoenix Mall of Asia",
                    "category": "Shopping",
                    "distance_km": 6,
                    "travel_time_mins": 15
                },
                {
                    "id": "41765bf2-7559-484a-b8d3-2711ff3ec5c3",
                    "name": "Kempegowda International Airport",
                    "category": "Airport",
                    "distance_km": 20,
                    "travel_time_mins": 25
                },
                {
                    "id": "d5d5c31c-fb22-482e-b9de-2e7271cc36ce",
                    "name": "Nearest Metro Station",
                    "category": "Metro Station",
                    "distance_km": 5.5,
                    "travel_time_mins": 18
                },
                {
                    "id": "f4ebae6b-fdba-4820-a47b-fe9356e15ccc",
                    "name": "Kempegowda International Airport",
                    "category": "Airport",
                    "distance_km": 35,
                    "travel_time_mins": 60
                },
                {
                    "id": "8835c503-5fd7-405b-b20e-c5c7b9897927",
                    "name": "Bangalore City Railway Station",
                    "category": "Railway Station",
                    "distance_km": 15,
                    "travel_time_mins": 35
                }
            ]
        },
        "amenities_data": {
            "general": [
                {
                    "id": "9674ac3d-de65-4e26-a1a0-99714b179685",
                    "name": "Gymnasium",
                    "category": "Fitness",
                    "size_specs": "Fully equipped"
                },
                {
                    "id": "e3afdfe0-1706-45e9-bf83-b950da7a8f8e",
                    "name": "Yoga Hall",
                    "category": "Wellness"
                },
                {
                    "id": "4f2b7279-e1b3-4cfd-807e-b34c2d3096e9",
                    "name": "Meditation Space",
                    "category": "Wellness"
                },
                {
                    "id": "57c08789-49cb-43e4-b22b-d3b8a447783a",
                    "name": "Squash Court",
                    "category": "Sports"
                },
                {
                    "id": "d049a6f4-59de-4f4d-88b6-d6b109c3c68e",
                    "name": "Badminton Court",
                    "category": "Sports",
                    "size_specs": "Indoor"
                },
                {
                    "id": "3264fb7e-f2a3-4e87-a5e3-e65fcb65d3d1",
                    "name": "Table Tennis",
                    "category": "Indoor Games"
                },
                {
                    "id": "f9f6ccfd-c188-458a-891e-992e0c895e20",
                    "name": "Multi-purpose Hall",
                    "category": "Community"
                },
                {
                    "id": "c36e75e0-3c89-4bdf-bab7-3c43f118897e",
                    "name": "Creche",
                    "category": "Children"
                },
                {
                    "id": "1ccf38d4-6684-4d9b-9c61-ae2ba29bad23",
                    "name": "Indoor Games Room",
                    "category": "Indoor Games"
                },
                {
                    "id": "e1c7d55d-9ab8-4afe-b211-176199ccb6a9",
                    "name": "Library / Co-working Space",
                    "category": "Work"
                },
                {
                    "id": "43ead2dc-154a-401d-92fc-114a3c7ae146",
                    "name": "Large Lap Pool",
                    "category": "Recreation"
                },
                {
                    "id": "5c232219-8d24-4d05-826c-da33bd8d5db3",
                    "name": "Kids Play Pond",
                    "category": "Children"
                },
                {
                    "id": "55f561b0-12e3-488a-b850-435868454cdb",
                    "name": "Tree House",
                    "category": "Children",
                    "size_specs": "Unique feature"
                },
                {
                    "id": "ce53308d-adaa-40d6-89b3-44adab181881",
                    "name": "Jungle Gym",
                    "category": "Children"
                },
                {
                    "id": "db8bd012-9003-4adc-b7ea-4f060ef252c1",
                    "name": "Pet Park",
                    "category": "Recreation"
                },
                {
                    "id": "2ff4f2e7-77e4-47fa-918c-7126a3b92fc0",
                    "name": "Pickleball Court",
                    "category": "Sports"
                },
                {
                    "id": "cd142f1b-5e06-476f-b695-6844b2dca7eb",
                    "name": "Futsal Court",
                    "category": "Sports"
                },
                {
                    "id": "f8b40478-5d18-4bac-8ad6-7583fde75b47",
                    "name": "Basketball Half Court",
                    "category": "Sports"
                },
                {
                    "id": "d16f3713-3c75-4dd7-ba80-1b6f493c341c",
                    "name": "Skating Rink",
                    "category": "Sports"
                },
                {
                    "id": "95ef5946-d465-41cf-b4aa-f923c1a57ea2",
                    "name": "Jogging Track",
                    "category": "Fitness"
                },
                {
                    "id": "2ff96bcd-9fcd-429c-9a84-c790139ae373",
                    "name": "BBQ Pavilion",
                    "category": "Recreation"
                },
                {
                    "id": "aa2332de-ffb9-4cff-b60c-c69502452618",
                    "name": "Amphitheatre",
                    "category": "Entertainment"
                },
                {
                    "id": "68cc716b-230b-4ffe-9f0d-460daebacefa",
                    "name": "Forest Walkway",
                    "category": "Landscape",
                    "size_specs": "Themed"
                },
                {
                    "id": "492b19fa-d068-4a09-aa84-72443aaf88ff",
                    "name": "Camping Deck",
                    "category": "Recreation",
                    "size_specs": "Unique feature"
                },
                {
                    "id": "d4e328c3-3339-44e9-9cd5-853403c6c10e",
                    "name": "Central Greens",
                    "category": "Landscape",
                    "size_specs": "2040+ Sq. Mt"
                }
            ]
        },
        "commercial_data": {
            "cost_extras": [
                {
                    "id": "150fbf86-0fcc-46c6-8894-29249290f1a8",
                    "name": "Floor Rise Charges",
                    "amount": 32.5,
                    "cost_type": "Per SqFt",
                    "payment_milestone": "Per floor basis"
                },
                {
                    "id": "d8835c38-3bdb-4328-acd3-3f84a6167fe3",
                    "name": "PLC - Garden/Pool/Forest Facing",
                    "amount": 200,
                    "cost_type": "Per SqFt",
                    "payment_milestone": "At booking"
                },
                {
                    "id": "5d960860-0a3b-4434-bdd1-ce0ab3ad7290",
                    "name": "Car Parking",
                    "amount": 0,
                    "cost_type": "Fixed",
                    "payment_milestone": "Included in base price"
                },
                {
                    "id": "e3359e93-e274-43d7-a823-ce49818e2c4f",
                    "name": "Maintenance Deposit",
                    "amount": 4.5,
                    "cost_type": "Per SqFt",
                    "payment_milestone": "Monthly after possession"
                },
                {
                    "id": "64cc91d9-89b8-4f48-adb2-bed81492e249",
                    "name": "GST",
                    "amount": 5,
                    "cost_type": "Percentage",
                    "payment_milestone": "As per payment schedule"
                },
                {
                    "id": "1f5bbbde-2300-4730-9f08-d09cb1519e99",
                    "name": "Stamp Duty & Registration",
                    "amount": 5.6,
                    "cost_type": "Percentage",
                    "payment_milestone": "At registration"
                },
                {
                    "id": "b999bcd0-cd3c-4909-944d-e2529cff5160",
                    "name": "BESCOM Charges",
                    "amount": 40000,
                    "cost_type": "Fixed",
                    "payment_milestone": "At possession"
                }
            ]
        },
        "market_analysis": {
            "analysis": [
                {
                    "id": "2ef7dd45-6ab9-446f-a5cc-092dea7b5a99",
                    "usp": "Unique Forest Theme 'Sanctuary in the City' (1600+ trees), Godrej Brand Trust (125+ years legacy), Low Density (Only 558 units on 7 acres), Right on Main Road location, Near Airport & Manyata Tech Park, Peripheral Ring Road proximity, 65-85% Vastu Compliant units",
                    "cons": [
                        "Premium pricing vs competitors like Provident",
                        "Possession 4-5 years away",
                        "Heavy supply in Thanisandra/Bagalur corridor",
                        "Distance from ORR IT corridor",
                        "2 BHK size might feel small for some buyers",
                        "Godrej CRM response can be slow"
                    ],
                    "pros": [
                        "Godrej Properties - 125+ years group legacy",
                        "Unique Forest Theme with 1600+ trees",
                        "Low density - only 558 units on 7 acres",
                        "76% open space - massive green cover",
                        "Direct Main Road location (Thanisandra Road)",
                        "Manyata Tech Park - 10 mins",
                        "Airport connectivity - 25 mins via New Airport Road",
                        "Upcoming Blue Line Metro nearby",
                        "Tree House, Camping Deck, Forest Walkway",
                        "3-sides open corner units available"
                    ],
                    "closing_pitch": "Experience 'Sanctuary in the City' with 1600+ trees, forest-themed living in North Bangalore's prime location. Godrej brand trust + 76% open space + upcoming Metro connectivity. Pre-launch advantage with limited inventory of 558 units.",
                    "overall_rating": 8.5,
                    "competitor_names": [
                        "Nandi Meraki",
                        "TVS Aurelia",
                        "Assetz Zen and Sato",
                        "Concorde Neo",
                        "Brigade/Prestige nearby projects"
                    ],
                    "objection_handling": "Price vs Provident: Premium specs, forest theme, Godrej quality, and low density justify 15-20% premium. Metro: Upcoming Blue Line Airport Link within 2 km. Possession timing: 4-5 years allows comfortable payment + ensures 30-40% appreciation. Inventory: Create urgency - only 558 units, limited Garden/Pool facing available.",
                    "target_customer_profile": "IT Professionals working in Manyata Tech Park (VP/Director level, 35+ years), Doctors from Aster CMI/Cytecare, Investors, Families upgrading from 2 BHK in Manyata area. Upper middle-class with household income > ₹2.5L/month."
                }
            ]
        }
    }
];

async function main() {
    for (const projectData of projectsData) {
        console.log(`Processing project: ${projectData.project_name}`);

        // Upsert Project
        const project = await prisma.project.upsert({
            where: { id: projectData.id },
            update: {
                project_name: projectData.project_name,
                latitude: projectData.latitude || 0,
                longitude: projectData.longitude || 0,
            },
            create: {
                id: projectData.id,
                project_name: projectData.project_name,
                latitude: projectData.latitude || 0,
                longitude: projectData.longitude || 0,
            }
        });

        // 1. Unit Templates
        if (projectData.unit_templates) {
            for (const t of projectData.unit_templates) {
                await prisma.unitTemplate.upsert({
                    where: { id: t.id },
                    update: { ...t, project_id: project.id },
                    create: { ...t, project_id: project.id }
                });
            }
        }

        // 2. Unit Configs
        if (projectData.unit_configs) {
            for (const c of projectData.unit_configs) {
                await prisma.unitConfiguration.upsert({
                    where: { id: c.id },
                    update: { ...c, project_id: project.id },
                    create: { ...c, project_id: project.id }
                });
            }
        }

        // 3. Location Data
        if (projectData.location_data) {
            const ld = projectData.location_data;
            if (ld.address) {
                await prisma.projectAddress.upsert({
                    where: { id: ld.address.id },
                    update: { ...ld.address, project_id: project.id },
                    create: { ...ld.address, project_id: project.id }
                });
            }
            if (ld.schools) {
                for (const s of ld.schools) {
                    await prisma.schoolNearby.upsert({
                        where: { id: s.id },
                        update: { ...s, project_id: project.id },
                        create: { ...s, project_id: project.id }
                    });
                }
            }
            if (ld.it_parks) {
                for (const i of ld.it_parks) {
                    await prisma.itParkProximity.upsert({
                        where: { id: i.id },
                        update: { ...i, project_id: project.id },
                        create: { ...i, project_id: project.id }
                    });
                }
            }
            if (ld.hospitals) {
                for (const h of ld.hospitals) {
                    await prisma.hospitalNearby.upsert({
                        where: { id: h.id },
                        update: { ...h, project_id: project.id },
                        create: { ...h, project_id: project.id }
                    });
                }
            }
            if (ld.landmarks) {
                for (const l of ld.landmarks) {
                    await prisma.projectLandmark.upsert({
                        where: { id: l.id },
                        update: { ...l, project_id: project.id },
                        create: { ...l, project_id: project.id }
                    });
                }
            }
            if (ld.future_govt) {
                for (const f of ld.future_govt) {
                    await prisma.futureGovtDevelopment.upsert({
                        where: { id: f.id },
                        update: { ...f, project_id: project.id },
                        create: { ...f, project_id: project.id }
                    });
                }
            }
            if (ld.connectivity) {
                await prisma.locationConnectivity.upsert({
                    where: { id: ld.connectivity.id },
                    update: { ...ld.connectivity, project_id: project.id },
                    create: { ...ld.connectivity, project_id: project.id }
                });
            }
        }

        // 4. Amenities Data
        if (projectData.amenities_data) {
            const ad = projectData.amenities_data;
            if (ad.pool) {
                await prisma.swimmingPoolDetail.upsert({
                    where: { id: ad.pool.id },
                    update: { ...ad.pool, project_id: project.id },
                    create: { ...ad.pool, project_id: project.id }
                });
            }
            if (ad.indoor) {
                for (const i of ad.indoor) {
                    await prisma.indoorAmenity.upsert({
                        where: { id: i.id },
                        update: { ...i, project_id: project.id },
                        create: { ...i, project_id: project.id }
                    })
                }
            }
            if (ad.sports) {
                for (const s of ad.sports) {
                    await prisma.sportsFacility.upsert({
                        where: { id: s.id },
                        update: { ...s, project_id: project.id },
                        create: { ...s, project_id: project.id }
                    })
                }
            }
            if (ad.unique) {
                for (const u of ad.unique) {
                    await prisma.uniqueAmenity.upsert({
                        where: { id: u.id },
                        update: { ...u, project_id: project.id },
                        create: { ...u, project_id: project.id }
                    })
                }
            }
            if (ad.general) {
                for (const g of ad.general) {
                    await prisma.projectAmenity.upsert({
                        where: { id: g.id },
                        update: { ...g, project_id: project.id },
                        create: { ...g, project_id: project.id }
                    })
                }
            }
            if (ad.clubhouse) {
                for (const c of ad.clubhouse) {
                    await prisma.clubhouseAmenity.upsert({
                        where: { id: c.id },
                        update: { ...c, project_id: project.id },
                        create: { ...c, project_id: project.id }
                    })
                }
            }
        }

        // 5. Technical Specs
        if (projectData.technical_specs) {
            const ts = projectData.technical_specs;
            if (ts.master) {
                await prisma.projectSpecification.upsert({
                    where: { id: ts.master.id },
                    update: { ...ts.master, project_id: project.id },
                    create: { ...ts.master, project_id: project.id }
                });
            }
            if (ts.kitchen) {
                await prisma.kitchenSpecification.upsert({
                    where: { id: ts.kitchen.id },
                    update: { ...ts.kitchen, project_id: project.id },
                    create: { ...ts.kitchen, project_id: project.id }
                });
            }
            if (ts.bathroom) {
                for (const b of ts.bathroom) {
                    await prisma.bathroomFitting.upsert({
                        where: { id: b.id },
                        update: { ...b, project_id: project.id },
                        create: { ...b, project_id: project.id }
                    })
                }
            }
            if (ts.flooring) {
                for (const f of ts.flooring) {
                    await prisma.flooringDetail.upsert({
                        where: { id: f.id },
                        update: { ...f, project_id: project.id },
                        create: { ...f, project_id: project.id }
                    })
                }
            }
            if (ts.electrical) {
                await prisma.electricalFitting.upsert({
                    where: { id: ts.electrical.id },
                    update: { ...ts.electrical, project_id: project.id },
                    create: { ...ts.electrical, project_id: project.id }
                });
            }
        }

        // 6. Commercial Data
        if (projectData.commercial_data) {
            const cd = projectData.commercial_data;
            if (cd.cost_extras) {
                for (const ce of cd.cost_extras) {
                    await prisma.projectCostExtra.upsert({
                        where: { id: ce.id },
                        update: { ...ce, project_id: project.id },
                        create: { ...ce, project_id: project.id }
                    })
                }
            }
            if (cd.base_pricing) {
                await prisma.pricingDetail.upsert({
                    where: { id: cd.base_pricing.id },
                    update: { ...cd.base_pricing, project_id: project.id },
                    create: { ...cd.base_pricing, project_id: project.id }
                });
            }
            if (cd.other_charges) {
                for (const oc of cd.other_charges) {
                    await prisma.otherCharge.upsert({
                        where: { id: oc.id },
                        update: { ...oc, project_id: project.id },
                        create: { ...oc, project_id: project.id }
                    })
                }
            }
            if (cd.payment_plans) {
                for (const pp of cd.payment_plans) {
                    await prisma.paymentPlan.upsert({
                        where: { id: pp.id },
                        update: { ...pp, project_id: project.id },
                        create: { ...pp, project_id: project.id }
                    })
                }
            }
        }

        // 7. Market Analysis
        if (projectData.market_analysis) {
            const ma = projectData.market_analysis;
            if (ma.analysis) {
                for (const a of ma.analysis) {
                    await prisma.projectAnalysis.upsert({
                        where: { id: a.id },
                        update: { ...a, project_id: project.id },
                        create: { ...a, project_id: project.id }
                    })
                }
            }
            if (ma.strategy) {
                await prisma.salesStrategy.upsert({
                    where: { id: ma.strategy.id },
                    update: { ...ma.strategy, project_id: project.id },
                    create: { ...ma.strategy, project_id: project.id }
                });
            }
            if (ma.developer) {
                await prisma.developerInfo.upsert({
                    where: { id: ma.developer.id },
                    update: { ...ma.developer, project_id: project.id },
                    create: { ...ma.developer, project_id: project.id }
                });
            }
            if (ma.competitors) {
                for (const c of ma.competitors) {
                    await prisma.projectCompetitor.upsert({
                        where: { id: c.id },
                        update: { ...c, project_id: project.id },
                        create: { ...c, project_id: project.id }
                    })
                }
            }
        }
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
