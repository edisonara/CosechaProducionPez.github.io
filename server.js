const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Añadido para parsear JSON en las solicitudes

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
            res.status(401).send('Invalid credentials');
        } else {
            client.query(
                `SELECT rolname FROM pg_user 
                JOIN pg_auth_members ON (pg_user.usesysid=pg_auth_members.member) 
                JOIN pg_roles ON (pg_roles.oid=pg_auth_members.roleid) 
                WHERE pg_user.usename=$1`, 
                [username], 
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error fetching user roles');
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
                }
            );
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
app.post('/general/query', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    const client = new Client({
        host: '4.203.136.126',
        port: 5432,
        user: 'user_rol_general',
        password: '123',
        database: 'ProyectoG6'
    });

    try {
        await client.connect();
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Query error', err.stack);
        res.status(500).send('Error executing query');
    } finally {
        await client.end();
    }
});
// Helper function to create a new client and connect to the database
const createDbClient = (user, password) => {
    return new Client({
        host: '4.203.136.126',
        port: 5432,
        user: user,
        password: password,
        database: 'ProyectoG6'
    });
};

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
   

   // const client = createDbClient('user_admin_cosecha', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'INSERT INTO Cosecha.Peces (nombre, informacion) VALUES ($1, $2)', 
                [fishName, fishInfo], 
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error adding fish');
                    } else {
                        res.send('Fish added successfully');
                    }
                    client.end();
                }
            );
        }
    });

    // Ruta para obtener los datos de Control_Salud
app.get('/admin-cosecha/control-salud', async (req, res) => {
    const client = new Client({
        host: '4.203.136.126',
        port: 5432,
        user: 'user_admin_cosecha',
        password: '123',
        database: 'ProyectoG6'
    });

    try {
        await client.connect();
        const result = await client.query('SELECT * FROM Cosecha.Control_Salud');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching control salud data:', error);
        res.status(500).send('Error fetching control salud data');
    } finally {
        client.end();
    }
});


    app.use(bodyParser.json());
    app.use(express.static('public'));

    // Endpoints para clientes
    app.get('/api/clientes', (req, res) => {
        client.query('SELECT * FROM Comercializacion.Cliente', (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(result.rows);
            }
        });
    });

    app.delete('/api/clientes/:id', (req, res) => {
        const id = req.params.id;
        client.query('DELETE FROM Comercializacion.Cliente WHERE id_cliente = $1', [id], (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.sendStatus(204);
            }
        });
    });

    // Endpoints para detalle-venta
    app.get('/api/detalle-venta', (req, res) => {
        client.query('SELECT * FROM Comercializacion.Detalle_venta', (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(result.rows);
            }
        });
    });

    app.delete('/api/detalle-venta/:id', (req, res) => {
        const id = req.params.id;
        client.query('DELETE FROM Comercializacion.Detalle_venta WHERE id_detalle_venta = $1', [id], (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.sendStatus(204);
            }
        });
    });

    // Endpoints para factura
    app.get('/api/factura', (req, res) => {
        client.query('SELECT * FROM Comercializacion.Factura', (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(result.rows);
            }
        });
    });

});

// Rutas para operaciones específicas de admin-comercializacion

// Obtener todos los clientes
app.get('/api/clientes', (req, res) => {
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query('SELECT * FROM Comercializacion.Cliente', (err, result) => {
                if (err) {
                    console.error('Query error', err.stack);
                    res.status(500).send('Error fetching clients');
                } else {
                    res.json(result.rows);
                }
                client.end();
            });
        }
    });
});

// Crear un nuevo cliente
app.post('/api/clientes', (req, res) => {
    const { clientName, clientAddress, clientEmail, clientPhone } = req.body;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'INSERT INTO Comercializacion.Cliente (nombre, direccion, email, telefono) VALUES ($1, $2, $3, $4)', 
                [clientName, clientAddress, clientEmail, clientPhone], 
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error adding client');
                    } else {
                        res.send('Client added successfully');
                    }
                    client.end();
                }
            );
        }
    });
});

// Actualizar un cliente existente
app.put('/api/clientes/:id', (req, res) => {
    const id = req.params.id;
    const { clientName, clientAddress, clientEmail, clientPhone } = req.body;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'UPDATE Comercializacion.Cliente SET nombre = $1, direccion = $2, email = $3, telefono = $4 WHERE id_cliente = $5',
                [clientName, clientAddress, clientEmail, clientPhone, id],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error updating client');
                    } else {
                        res.send('Client updated successfully');
                    }
                    client.end();
                }
            );
        }
    });
});

// Eliminar un cliente
app.delete('/api/clientes/:id', (req, res) => {
    const id = req.params.id;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query('DELETE FROM Comercializacion.Cliente WHERE id_cliente = $1', [id], (err, result) => {
                if (err) {
                    console.error('Query error', err.stack);
                    res.status(500).send('Error deleting client');
                } else {
                    res.sendStatus(204);
                }
                client.end();
            });
        }
    });
});

// Obtener todos los detalles de venta
app.get('/api/detalle-venta', (req, res) => {
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query('SELECT * FROM Comercializacion.Detalle_venta', (err, result) => {
                if (err) {
                    console.error('Query error', err.stack);
                    res.status(500).send('Error fetching detalle-venta');
                } else {
                    res.json(result.rows);
                }
                client.end();
            });
        }
    });
});

// Crear un nuevo detalle de venta
app.post('/api/detalle-venta', (req, res) => {
    const { cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio } = req.body;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'INSERT INTO Comercializacion.Detalle_venta (cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio) VALUES ($1, $2, $3, $4, $5, $6)',
                [cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error adding detalle-venta');
                    } else {
                        res.send('Detalle de venta added successfully');
                    }
                    client.end();
                }
            );
        }
    });
});

// Actualizar un detalle de venta existente
app.put('/api/detalle-venta/:id', (req, res) => {
    const id = req.params.id;
    const { cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio } = req.body;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'UPDATE Comercializacion.Detalle_venta SET cliente_id = $1, estanque_id = $2, fecha_pedido = $3, fecha_entrega = $4, cantidad = $5, precio = $6 WHERE id_detalle_venta = $7',
                [cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio, id],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error updating detalle-venta');
                    } else {
                        res.send('Detalle de venta updated successfully');
                    }
                    client.end();
                }
            );
        }
    });
});

// Eliminar un detalle de venta
app.delete('/api/detalle-venta/:id', (req, res) => {
    const id = req.params.id;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query('DELETE FROM Comercializacion.Detalle_venta WHERE id_detalle_venta = $1', [id], (err, result) => {
                if (err) {
                    console.error('Query error', err.stack);
                    res.status(500).send('Error deleting detalle-venta');
                } else {
                    res.sendStatus(204);
                }
                client.end();
            });
        }
    });
});

// Obtener todas las facturas
app.get('/api/factura', (req, res) => {
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query('SELECT * FROM Comercializacion.Factura', (err, result) => {
                if (err) {
                    console.error('Query error', err.stack);
                    res.status(500).send('Error fetching facturas');
                } else {
                    res.json(result.rows);
                }
                client.end();
            });
        }
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
