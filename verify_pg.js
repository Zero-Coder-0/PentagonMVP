const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:supabasedatabase@db.dppkjuhytfzcfzcoxrpo.supabase.co:5432/postgres' });
client.connect().then(() => {
    return client.query('SELECT COUNT(*) FROM projects');
}).then(res => {
    console.log('Project Count:', res.rows[0].count);
    return client.query('SELECT id, project_name, city_zone, lat, lng FROM projects LIMIT 3');
}).then(res => {
    console.log(res.rows);
    client.end();
}).catch(e => {
    console.error(e);
    client.end();
});
