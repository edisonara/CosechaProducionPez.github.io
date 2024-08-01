const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const client = new Client({
        host: '4.203.136.126',
        port: 5432,
        user: username,
        password: password,
        database: 'ProyectoG6'
    });

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.send('Invalid credentials');
        } else {
            client.query('SELECT rolname FROM pg_user JOIN pg_auth_members ON (pg_user.usesysid=pg_auth_members.member) JOIN pg_roles ON (pg_roles.oid=pg_auth_members.roleid) WHERE pg_user.usename=$1', [username], (err, result) => {
                if (err) {
                    console.error('Query error', err.stack);
                    res.send('Error fetching user roles');
                } else {
                    const roles = result.rows.map(row => row.rolname);

                    if (roles.includes('admin_cosecha')) {
                        res.redirect('/admin-cosecha');
                    } else if (roles.includes('admin_comercializacion')) {
                        res.redirect('/admin-comercializacion');
                    } else {
                        res.redirect('/general');
                    }
                }
                client.end();
            });
        }
    });
});

app.get('/admin-cosecha', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-cosecha.html'));
});

app.get('/admin-comercializacion', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-comercializacion.html'));
});

app.get('/general', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'general.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
