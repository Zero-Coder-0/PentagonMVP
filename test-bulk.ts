import { uploadBulkProjects } from './src/modules/admin/actions-bulk';

async function run() {
    console.log('Testing uploadBulkProjects with mock data...');
    const mockPayload = [
        {
            project_name: 'Test Project ' + Date.now(),
            developer: 'Test Developer',
            total_units: 50,
            city_zone: 'North',
            price_display: '₹ 2.5 CR',
            units: [
                {
                    unitnumber: 'A-101',
                    config: '3BHK',
                    actualsba: 1500,
                    pricetotal: 15000000,
                },
                {
                    unitnumber: 'A-102',
                    config: '2BHK',
                    actualsba: 1000,
                    pricetotal: 10000000,
                }
            ],
            amenities: [
                {
                    category: 'Fitness',
                    name: 'Gym',
                    size_specs: '2000sqft'
                }
            ],
            commercials: [
                {
                    name: 'Clubhouse Fee',
                    amount: 500000,
                    cost_type: 'Fixed'
                }
            ]
        }
    ];

    try {
        const result = await uploadBulkProjects(mockPayload);
        console.log('Result:', result);
    } catch (err) {
        console.error('Test script encountered an error:', err);
    }
}

run();
