const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Configuración de PostgreSQL
const client = new Client({
    host: '4.203.136.126', //  aqui nos conetamos al contenedor de azure
    port: 5432,
    user: 'postgres',
    password: 'Edison23.',
    database: 'ProyectoG6' /// es tomar en cuenta. 
});

client.connect().then(() => {
    console.log("Connected to PostgreSQL database");
}).catch(err => {
    console.error('Connection error', err.stack);
});

// Middleware para parsear JSON
app.use(bodyParser.json());

// Servir archivos estáticos desde el directorio "public"
app.use(express.static(path.join(__dirname, 'public')));

// Añadir encabezado CSP
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self';");
    next();
});

app.get('/', (req, res) => {
 res.sendFile(path.join(__dirname,'public', 'index.html'));
});

app.get('/about', (req, res) => {
 res.sendFile(__dirname + '/public/form.html');
});

app.get('/nuevo', (req, res) => {
 res.sendFile(__dirname + '/public/alimentacion.html');
});

app.get('/nuevo', (req, res) => {
 res.sendFile(__dirname + '/public/asignacion.html');
});

app.get('/nuevo', (req, res) => {
 res.sendFile(__dirname + '/public/nosotros.html');
});

app.get('/nuevo', (req, res) => {
 res.sendFile(__dirname + '/public/crud-control_salud.html');
});

app.get('/nuevo', (req, res) => {
 res.sendFile(__dirname + '/public/crud-detalle-venta.html');
});

app.get('/nuevo', (req, res) => {
 res.sendFile(__dirname + '/public/crud-estanques.html');
});

app.get('/nuevo', (req, res) => {
 res.sendFile(__dirname + '/public/crud-factura.html');
});

// Ruta para manejar el formulario de envío
app.post('/submit', async (req, res) => {
    const { name, email } = req.body;

    try {
        const query = 'INSERT INTO users (name, email) VALUES ($1, $2)';
        await client.query(query, [name, email]);
        res.json({ message: 'Datos ingresados exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al ingresar los datos' });
    }
});



// Ruta para obtener todos los datos
app.get('/users', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener los datos' });
    }
});

// Endpoint para obtener alimentos
app.get('/api/alimentos', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Cosecha.Alimentacion');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener alimentos:', err);
        res.status(500).json({ message: 'Error al obtener alimentos' });
    }
});

// Endpoint para agregar un nuevo alimento
app.post('/api/alimentos', async (req, res) => {
    const { tipo_alimento } = req.body;
    try {
        const query = 'INSERT INTO Cosecha.Alimentacion (tipo_alimento) VALUES ($1)';
        await client.query(query, [tipo_alimento]);
        res.json({ message: 'Alimento agregado exitosamente' });
    } catch (err) {
        console.error('Error al agregar alimento:', err);
        res.status(500).json({ message: 'Error al agregar alimento' });
    }
});

// Endpoint para eliminar un alimento
app.delete('/api/alimentos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM Cosecha.Alimentacion WHERE id_alimentacion = $1';
        await client.query(query, [id]);
        res.json({ message: 'Alimento eliminado exitosamente' });
    } catch (err) {
        console.error('Error al eliminar alimento:', err);
        res.status(500).json({ message: 'Error al eliminar alimento' });
    }
});

// Rutas para manejar las operaciones CRUD de clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM Comercializacion.Cliente');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener clientes', err);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

app.post('/api/clientes', async (req, res) => {
    const { nombre, direccion, email, telefono } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO Comercializacion.Cliente (nombre, direccion, email, telefono) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, direccion, email, telefono]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al agregar cliente', err);
        res.status(500).json({ error: 'Error al agregar cliente' });
    }
});

app.delete('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await client.query('DELETE FROM Comercializacion.Cliente WHERE id_cliente = $1', [id]);
        res.json({ message: 'Cliente eliminado' });
    } catch (err) {
        console.error('Error al eliminar cliente', err);
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
});

app.put('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, direccion, email, telefono } = req.body;
    try {
        const result = await client.query(
            'UPDATE Comercializacion.Cliente SET nombre = $1, direccion = $2, email = $3, telefono = $4 WHERE id_cliente = $5 RETURNING *',
            [nombre, direccion, email, telefono, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar cliente', err);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});



// Endpoint para obtener todas las asignaciones con detalles de trabajador y trabajo (INNER JOIN)
app.get('/api/asignaciones', async (req, res) => {
    try {
        const query = `
            SELECT a.id_asignacion, t.nombre AS trabajador, trab.nombre AS trabajo, a.fecha_asignacion
            FROM cosecha.Asignacion a
            INNER JOIN cosecha.Trabajador t ON a.trabajador_id = t.id_trabajador
            INNER JOIN cosecha.Trabajo trab ON a.trabajo_id = trab.id_trabajo
        `;
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener asignaciones con detalles:', err);
        res.status(500).json({ error: 'Error al obtener asignaciones con detalles' });
    }
});

// Endpoint para agregar una nueva asignación
app.post('/api/asignaciones', async (req, res) => {
    const { trabajador_id, trabajo_id, fecha_asignacion } = req.body;
    try {
        const query = 'INSERT INTO cosecha.Asignacion (trabajador_id, trabajo_id, fecha_asignacion) VALUES ($1, $2, $3) RETURNING *';
        const result = await client.query(query, [trabajador_id, trabajo_id, fecha_asignacion]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al agregar asignación:', err);
        res.status(500).json({ error: 'Error al agregar asignación' });
    }
});

// Endpoint para eliminar una asignación por su ID
app.delete('/api/asignaciones/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM cosecha.Asignacion WHERE id_asignacion = $1';
        await client.query(query, [id]);
        res.json({ message: 'Asignación eliminada exitosamente' });
    } catch (err) {
        console.error('Error al eliminar asignación:', err);
        res.status(500).json({ error: 'Error al eliminar asignación' });
    }
});

// Endpoint para actualizar una asignación por su ID
app.put('/api/asignaciones/:id', async (req, res) => {
    const { id } = req.params;
    const { id_trabajador, id_trabajo, fecha_asignacion } = req.body;
    try {
        const query = 'UPDATE cosecha.Asignacion SET trabajador_id = $1, trabajo_id = $2, fecha_asignacion = $3 WHERE id_asignacion = $4 RETURNING *';
        const result = await client.query(query, [id_trabajador, id_trabajo, fecha_asignacion, id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar asignación:', err);
        res.status(500).json({ error: 'Error al actualizar asignación' });
    }
});


app.get('/api/trabajadores', async (req, res) => {
    try {
        const result = await client.query('SELECT id_trabajador AS id, nombre FROM cosecha.Trabajador');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener trabajadores:', err);
        res.status(500).json({ error: 'Error al obtener trabajadores' });
    }
});





app.get('/api/trabajos', async (req, res) => {
    try {
        const result = await client.query('SELECT id_trabajo AS id, nombre FROM cosecha.Trabajo');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener trabajos:', err);
        res.status(500).json({ error: 'Error al obtener trabajos' });
    }
});



app.post('/estanques', async (req, res) => {
    const { pez_id, ubicacion, capacidad, alimentacion_id, empleado_id, cantidad, fecha_cosecha } = req.body;

    try {
        const result = await client.query(
            'INSERT INTO cosecha.estanques (pez_id, ubicacion, capacidad, alimentacion_id, empleado_id, cantidad, fecha_cosecha) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [pez_id, ubicacion, capacidad, alimentacion_id, empleado_id, cantidad, fecha_cosecha]
        );
        res.status(201).json({ message: 'Estanque agregado exitosamente', estanque: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar estanque', error });
    }
});

app.get('/estanques', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM estanques');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estanques', error });
    }
});

app.get('/estanques/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await client.query('SELECT * FROM estanques WHERE id_estanque = $1', [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Estanque no encontrado' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar estanque', error });
    }
});



// Obtener todos los peces para el select
app.get('/api/peces', async (req, res) => {
    try {
        const result = await client.query('SELECT id_pez, nombre FROM Cosecha.Peces');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener peces', err);
        res.status(500).json({ error: 'Error al obtener peces' });
    }
});

// Obtener todos los tipos de alimentación para el select
app.get('/api/alimentacion', async (req, res) => {
    try {
        const result = await client.query('SELECT id_alimentacion, tipo_alimento FROM Cosecha.Alimentacion');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener alimentaciones', err);
        res.status(500).json({ error: 'Error al obtener alimentaciones' });
    }
});

// Obtener todos los empleados para el select
app.get('/api/empleados', async (req, res) => {
    try {
        const query = `
            SELECT asign.id_asignacion, t.nombre, t.apellido 
            FROM Cosecha.Asignacion asign
            INNER JOIN Cosecha.Trabajador t ON asign.trabajador_id = t.id_trabajador
        `;
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener empleados', err);
        res.status(500).json({ error: 'Error al obtener empleados' });
    }
});



app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});


