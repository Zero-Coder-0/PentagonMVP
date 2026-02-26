import { ProjectFullV7 } from '@/modules/inventory/types-v7';

interface SalesUser {
    name: string;
    mobile: string;
}

/**
 * WhatsApp Message Template
 * 
 * Developers can easily edit this function to change what gets copied to the clipboard.
 * It takes the full property data and the sales user's contact details.
 */
export const generateWhatsAppTemplate = (property: ProjectFullV7, user: SalesUser): string => {
    // Extract key ranges
    const priceRange = property.pricemin && property.pricemax
        ? `₹${(property.pricemin / 10000000).toFixed(2)}Cr - ₹${(property.pricemax / 10000000).toFixed(2)}Cr`
        : property.pricedisplay || 'Price on Request';

    const configs = property.configurations?.join(', ') || property.units?.map(u => u.config).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'Various';

    const possessionText = property.possession_year
        ? `${property.possession_month || ''} ${property.possession_year}`.trim()
        : 'Surprise give a call';

    return `🌟 *${property.project_name || property.project_name}* 🌟
📍 *Location:* ${property.general_location || property.city_zone || 'Bangalore'}
🏢 *Developer:* ${property.developer_name || property.developer_buildergrade || 'Premium Developer'}

*Key Details:*
💰 *Price:* ${priceRange}
📐 *Configurations:* ${configs}
⏱ *Possession:* ${possessionText}
🏗 *Status:* ${property.projectstatus?.replace(/([A-Z])/g, ' $1').trim() || ''}

*Why this project?*
✅ ${property.usp || 'Premium lifestyle amenities and great connectivity.'}

---
*Interested? Let's connect!*
👤 ${user.name}
📱 ${user.mobile}
`;
};
