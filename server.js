const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    host: '4.203.136.126',
    port: 5432,
    database: 'ProyectoG6'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const client = await pool.connect();
        await client.query('SET SESSION AUTHORIZATION $1', [username]);
        const result = await client.query(
            `SELECT rolname FROM pg_user 
            JOIN pg_auth_members ON (pg_user.usesysid=pg_auth_members.member) 
            JOIN pg_roles ON (pg_roles.oid=pg_auth_members.roleid) 
            WHERE pg_user.usename=$1`,
            [username]
        );
        const roles = result.rows.map(row => row.rolname);
        client.release();

        if (roles.includes('admin_cosecha')) {
            res.redirect('/admin-cosecha');
        } else if (roles.includes('admin_comercializacion')) {
            res.redirect('/admin-comercializacion');
        } else {
            res.redirect('/general');
        }
    } catch (err) {
        console.error('Login error', err.stack);
        res.status(401).send('Invalid credentials');
    }
});

const sendFile = (res, fileName) => {
    res.sendFile(path.join(__dirname, 'public', fileName));
};

app.get('/admin-cosecha', (req, res) => sendFile(res, 'admin-cosecha.html'));
app.get('/admin-comercializacion', (req, res) => sendFile(res, 'admin-comercializacion.html'));
app.get('/general', (req, res) => sendFile(res, 'general.html'));

const executeQuery = async (res, query, params = []) => {
    try {
        const client = await pool.connect();
        const result = await client.query(query, params);
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error('Query error', err.stack);
        res.status(500).send('Database query error');
    }
};

// Rutas para operaciones específicas de admin-cosecha
app.post('/admin-cosecha/add-fish', (req, res) => {
    const { fishName, fishInfo } = req.body;
    const query = 'INSERT INTO Cosecha.Peces (nombre, informacion) VALUES ($1, $2)';
    executeQuery(res, query, [fishName, fishInfo]);
});

app.get('/admin-cosecha/control-salud', (req, res) => {
    const query = 'SELECT * FROM Cosecha.Control_Salud';
    executeQuery(res, query);
});

// Rutas para clientes
app.route('/api/clientes')
    .get((req, res) => executeQuery(res, 'SELECT * FROM Comercializacion.Cliente'))
    .post((req, res) => {
        const { nombre, direccion, email, telefono } = req.body;
        const query = 'INSERT INTO Comercializacion.Cliente (nombre, direccion, email, telefono) VALUES ($1, $2, $3, $4) RETURNING *';
        executeQuery(res, query, [nombre, direccion, email, telefono]);
    });

app.route('/api/clientes/:id')
    .get((req, res) => {
        const query = 'SELECT * FROM Comercializacion.Cliente WHERE id_cliente = $1';
        executeQuery(res, query, [req.params.id]);
    })
    .put((req, res) => {
        const { nombre, direccion, email, telefono } = req.body;
        const query = 'UPDATE Comercializacion.Cliente SET nombre = $1, direccion = $2, email = $3, telefono = $4 WHERE id_cliente = $5 RETURNING *';
        executeQuery(res, query, [nombre, direccion, email, telefono, req.params.id]);
    })
    .delete((req, res) => {
        const query = 'DELETE FROM Comercializacion.Cliente WHERE id_cliente = $1 RETURNING *';
        executeQuery(res, query, [req.params.id]);
    });

// Rutas para detalle-venta
app.route('/api/detalle-venta')
    .get((req, res) => executeQuery(res, 'SELECT * FROM Comercializacion.Detalle_venta'))
    .post((req, res) => {
        const { cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio } = req.body;
        const query = 'INSERT INTO Comercializacion.Detalle_venta (cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        executeQuery(res, query, [cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio]);
    });

app.route('/api/detalle-venta/:id')
    .get((req, res) => {
        const query = 'SELECT * FROM Comercializacion.Detalle_venta WHERE id_detalle_venta = $1';
        executeQuery(res, query, [req.params.id]);
    })
    .put((req, res) => {
        const { cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio } = req.body;
        const query = 'UPDATE Comercializacion.Detalle_venta SET cliente_id = $1, estanque_id = $2, fecha_pedido = $3, fecha_entrega = $4, cantidad = $5, precio = $6 WHERE id_detalle_venta = $7 RETURNING *';
        executeQuery(res, query, [cliente_id, estanque_id, fecha_pedido, fecha_entrega, cantidad, precio, req.params.id]);
    })
    .delete((req, res) => {
        const query = 'DELETE FROM Comercializacion.Detalle_venta WHERE id_detalle_venta = $1 RETURNING *';
        executeQuery(res, query, [req.params.id]);
    });

// Rutas para facturas
app.route('/api/factura')
    .get((req, res) => executeQuery(res, 'SELECT * FROM Comercializacion.Factura'))
    .post((req, res) => {
        const { pedidos_id, encargado_id, fecha_factura } = req.body;
        const query = 'INSERT INTO Comercializacion.Factura (pedidos_id, encargado_id, fecha_factura) VALUES ($1, $2, $3) RETURNING *';
        executeQuery(res, query, [pedidos_id, encargado_id, fecha_factura]);
    });

app.route('/api/factura/:id')
    .get((req, res) => {
        const query = 'SELECT * FROM Comercializacion.Factura WHERE id_factura = $1';
        executeQuery(res, query, [req.params.id]);
    })
    .put((req, res) => {
        const { pedidos_id, encargado_id, fecha_factura } = req.body;
        const query = 'UPDATE Comercializacion.Factura SET pedidos_id = $1, encargado_id = $2, fecha_factura = $3 WHERE id_factura = $4 RETURNING *';
        executeQuery(res, query, [pedidos_id, encargado_id, fecha_factura, req.params.id]);
    })
    .delete((req, res) => {
        const query = 'DELETE FROM Comercializacion.Factura WHERE id_factura = $1 RETURNING *';
        executeQuery(res, query, [req.params.id]);
    });

// Rutas para operaciones de lectura del usuario general
app.get('/general/fish', (req, res) => {
    const query = 'SELECT * FROM Cosecha.Peces';
    executeQuery(res, query);
});

app.get('/general/clients', (req, res) => {
    const query = 'SELECT * FROM Comercializacion.Cliente';
    executeQuery(res, query);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
