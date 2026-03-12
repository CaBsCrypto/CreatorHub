const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', 'AdminDashboard.tsx');
let txt = fs.readFileSync(file, 'utf8');

// Replace camelCase to snake_case for Supabase schema
txt = txt.replace(/creatorId/g, 'creator_id');
txt = txt.replace(/campaignId/g, 'campaign_id');
txt = txt.replace(/uploadedAt/g, 'uploaded_at');
txt = txt.replace(/createdAt/g, 'created_at');
txt = txt.replace(/createdBy/g, 'created_by');
txt = txt.replace(/\.uid/g, '.id');
txt = txt.replace(/displayName/g, 'display_name');

fs.writeFileSync(file, txt);
console.log('Fixed AdminDashboard.tsx properties');
