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

app.get('/clientes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'clientes.html'));
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

// Rutas para operaciones específicas de admin-comercializacion

app.post('/admin-comercializacion/add-client', (req, res) => {
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

// Helper function to fetch data from the database
const fetchData = (res, client, query, params = []) => {
    client.query(query, params, (err, result) => {
        if (err) {
            console.error('Query error', err.stack);
            res.status(500).send('Error fetching data');
        } else {
            res.json(result.rows);
        }
        client.end();
    });
};

// Rutas para operaciones de lectura del usuario general
app.get('/general/fish', (req, res) => {
    const client = createDbClient('user_rol_general', '123');
    
    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            fetchData(res, client, 'SELECT * FROM Cosecha.Peces');
        }
    });
});

app.get('/general/clients', (req, res) => {
    const client = createDbClient('user_rol_general', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            fetchData(res, client, 'SELECT * FROM Comercializacion.Cliente');
        }
    });
});

// Endpoints para clientes
app.get('/api/clientes', (req, res) => {
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            fetchData(res, client, 'SELECT * FROM Comercializacion.Cliente');
        }
    });
});

app.post('/api/clientes', (req, res) => {
    const { nombre, direccion, email, telefono } = req.body;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'INSERT INTO Comercializacion.Cliente (nombre, direccion, email, telefono) VALUES ($1, $2, $3, $4) RETURNING *',
                [nombre, direccion, email, telefono],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error adding client');
                    } else {
                        res.status(201).json(result.rows[0]);
                    }
                    client.end();
                }
            );
        }
    });
});


app.get('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'SELECT * FROM Comercializacion.Cliente WHERE id_cliente = $1',
                [id],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error fetching client');
                    } else if (result.rows.length === 0) {
                        res.status(404).send('Cliente no encontrado');
                    } else {
                        res.json(result.rows[0]);
                    }
                    client.end();
                }
            );
        }
    });
});

app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, direccion, email, telefono } = req.body;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'UPDATE Comercializacion.Cliente SET nombre = $1, direccion = $2, email = $3, telefono = $4 WHERE id_cliente = $5 RETURNING *',
                [nombre, direccion, email, telefono, id],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error updating client');
                    } else if (result.rows.length === 0) {
                        res.status(404).send('Cliente no encontrado');
                    } else {
                        res.json(result.rows[0]);
                    }
                    client.end();
                }
            );
        }
    });
});

app.delete('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'DELETE FROM Comercializacion.Cliente WHERE id_cliente = $1 RETURNING *',
                [id],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error deleting client');
                    } else if (result.rows.length === 0) {
                        res.status(404).send('Cliente no encontrado');
                    } else {
                        res.json(result.rows[0]);
                    }
                    client.end();
                }
            );
        }
    });
});



// Endpoints para detalle_venta
app.get('/api/detalle_venta', (req, res) => {
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            fetchData(res, client, 'SELECT * FROM Comercializacion.Detalle_venta');
        }
    });
});

app.post('/api/detalle_venta', (req, res) => {
    const { cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio } = req.body;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'INSERT INTO Comercializacion.Detalle_venta (cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error adding detalle_venta');
                    } else {
                        res.status(201).json(result.rows[0]);
                    }
                    client.end();
                }
            );
        }
    });
});

app.get('/api/detalle_venta/:id', (req, res) => {
    const { id } = req.params;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'SELECT * FROM Comercializacion.Detalle_venta WHERE id_detalle_venta = $1',
                [id],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error fetching detalle_venta');
                    } else if (result.rows.length === 0) {
                        res.status(404).send('Detalle_venta no encontrado');
                    } else {
                        res.json(result.rows[0]);
                    }
                    client.end();
                }
            );
        }
    });
});

app.put('/api/detalle_venta/:id', (req, res) => {
    const { id } = req.params;
    const { cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio } = req.body;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'UPDATE Comercializacion.Detalle_venta SET cliente_id = $1, estanque_id = $2, fecha_pedido = $3, fecha_entrega = $4, cantidad = $5, precio = $6 WHERE id_detalle_venta = $7 RETURNING *',
                [cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio, id],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error updating detalle_venta');
                    } else if (result.rows.length === 0) {
                        res.status(404).send('Detalle_venta no encontrado');
                    } else {
                        res.json(result.rows[0]);
                    }
                    client.end();
                }
            );
        }
    });
});

app.delete('/api/detalle_venta/:id', (req, res) => {
    const { id } = req.params;
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                'DELETE FROM Comercializacion.Detalle_venta WHERE id_detalle_venta = $1 RETURNING *',
                [id],
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error deleting detalle_venta');
                    } else if (result.rows.length === 0) {
                        res.status(404).send('Detalle_venta no encontrado');
                    } else {
                        res.json(result.rows[0]);
                    }
                    client.end();
                }
            );
        }
    });
});



// Endpoints para factura
app.get('/api/factura', (req, res) => {
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            fetchData(res, client, 'SELECT * FROM Comercializacion.Factura');
        }
    });
});


// Endpoint para obtener ventas mensuales
app.get('/api/ventas-mensuales', (req, res) => {
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                `SELECT EXTRACT(MONTH FROM fecha_pedido) AS mes, SUM(cantidad) AS total_ventas
                 FROM Comercializacion.Detalle_venta
                 GROUP BY mes
                 ORDER BY mes`,
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error fetching sales data');
                    } else {
                        // Transformar los datos para la gráfica
                        const data = result.rows.map(row => row.total_ventas);
                        const labels = result.rows.map(row => ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][row.mes - 1]);

                        res.json({ labels, data });
                    }
                    client.end();
                }
            );
        }
    });
});

// Endpoint para obtener ventas por producto
app.get('/api/ventas-por-producto', (req, res) => {
    const client = createDbClient('user_admin_comercializacion', '123');

    client.connect(err => {
        if (err) {
            console.error('Connection error', err.stack);
            res.status(500).send('Database connection error');
        } else {
            client.query(
                `SELECT p.nombre AS producto, SUM(d.cantidad) AS total_vendida
                 FROM Comercializacion.Detalle_venta d
                 JOIN Comercializacion.Producto p ON d.producto_id = p.id_producto
                 GROUP BY p.nombre`,
                (err, result) => {
                    if (err) {
                        console.error('Query error', err.stack);
                        res.status(500).send('Error fetching product sales data');
                    } else {
                        // Transformar los datos para la gráfica
                        const data = result.rows.map(row => row.total_vendida);
                        const labels = result.rows.map(row => row.producto);

                        res.json({ labels, data });
                    }
                    client.end();
                }
            );
        }
    });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
