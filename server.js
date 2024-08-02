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

// Rutas para operaciones específicas de admin-cosecha
app.post('/admin-cosecha/add-fish', (req, res) => {
    const { fishName, fishInfo } = req.body;
    const client = new Client({
        host: '4.203.136.126',
        port: 5432,
        user: 'user_admin_cosecha',
        password: '123',
        database: 'ProyectoG6'
    });

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.send('Database connection error');
        } else {
            client.query('INSERT INTO Cosecha.Peces (nombre, informacion) VALUES ($1, $2)', [fishName, fishInfo], (err, result) => {
                if (err) {
                    console.error('Query error', err.stack);
                    res.send('Error adding fish');
                } else {
                    res.send('Fish added successfully');
                }
                client.end();
            });
        }
    });
});

// Rutas para operaciones específicas de admin-comercializacion
app.post('/admin-comercializacion/add-client', (req, res) => {
    const { clientName, clientAddress, clientEmail, clientPhone } = req.body;
    const client = new Client({
        host: '4.203.136.126',
        port: 5432,
        user: 'user_admin_comercializacion',
        password: '123',
        database: 'ProyectoG6'
    });

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.send('Database connection error');
        } else {
            client.query('INSERT INTO Comercializacion.Cliente (nombre, direccion, email, telefono) VALUES ($1, $2, $3, $4)', [clientName, clientAddress, clientEmail, clientPhone], (err, result) => {
                if (err) {
                    console.error('Query error', err.stack);
                    res.send('Error adding client');
                } else {
                    res.send('Client added successfully');
                }
                client.end();
            });
        }
    });
});

// Rutas para operaciones de lectura del usuario general
app.get('/general/fish', (req, res) => {
    const client = new Client({
        host: '4.203.136.126',
        port: 5432,
        user: 'user_rol_general',
        password: '123',
        database: 'ProyectoG6'
    });

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.send('Database connection error');
        } else {
            client.query('SELECT * FROM Cosecha.Peces', (err, result) => {
                if (err) {
                    console.error('Query error', err.stack);
                    res.send('Error fetching fish data');
                } else {
                    res.json(result.rows);
                }
                client.end();
            });
        }
    });
});

app.get('/general/clients', (req, res) => {
    const client = new Client({
        host: '4.203.136.126',
        port: 5432,
        user: 'user_rol_general',
        password: '123',
        database: 'ProyectoG6'
    });

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.send('Database connection error');
        } else {
            client.query('SELECT * FROM Comercializacion.Cliente', (err, result) => {
                if (err) {
                    console.error('Query error', err.stack);
                    res.send('Error fetching client data');
                } else {
                    res.json(result.rows);
                }
                client.end();
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
