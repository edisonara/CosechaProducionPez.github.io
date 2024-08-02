$(document).ready(function() {
    // Cargar datos iniciales
    loadClientData();
    loadDetailData();
    loadFacturaData();
    loadStatistics();

    // Manejar el inicio de sesión
    $('#login-form').on('submit', function(event) {
        event.preventDefault();

        $.ajax({
            url: '/login',
            type: 'post',
            data: $('#login-form').serialize(),
            success: function(response) {
                $('#message').removeClass().addClass('alert alert-success').text('Login successful! Redirecting...').show();
                setTimeout(function() {
                    window.location.href = response.redirect;
                }, 1000);
            },
            error: function(error) {
                $('#message').removeClass().addClass('alert alert-danger').text('Login failed. Please try again.').show();
            }
        });
    });
});

// Cargar datos de clientes
function loadClientData() {
    $.ajax({
        url: '/api/clientes',
        method: 'GET',
        success: function(data) {
            $('#clientTable').empty();
            data.forEach(cliente => {
                $('#clientTable').append(`
                    <tr>
                        <td>${cliente.id_cliente}</td>
                        <td>${cliente.nombre}</td>
                        <td>${cliente.direccion}</td>
                        <td>${cliente.email}</td>
                        <td>${cliente.telefono}</td>
                        <td>
                            <button class="btn btn-warning edit-client" data-id="${cliente.id_cliente}">Editar</button>
                            <button class="btn btn-danger delete-client" data-id="${cliente.id_cliente}">Eliminar</button>
                        </td>
                    </tr>
                `);
            });

            $('.edit-client').click(function() {
                showEditClientForm($(this).data('id'));
            });
            $('.delete-client').click(deleteClient);
        }
    });
}

// Mostrar el formulario para añadir un cliente
function showAddClientForm() {
    $('#clientForm').data('id', null).show(); // No tiene ID asignado para nueva adición
    $('#formTitle').text('Añadir Cliente');
    $('#saveClientBtn').off('click').on('click', addClient); // Configura el botón para añadir
    $('#overlay').show();
}

// Enviar los datos del nuevo cliente al servidor
// Función para insertar un cliente
function addClient(client) {
    fetch('/api/clientes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(client)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error adding client');
        }
        return response.json();
    })
    .then(data => {
        console.log('Client added successfully:', data);
        // Aquí puedes actualizar la UI o hacer cualquier otra cosa que necesites
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Función para actualizar un cliente
function updateClient(id, client) {
    fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(client)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error updating client');
        }
        return response.json();
    })
    .then(data => {
        console.log('Client updated successfully:', data);
        // Aquí puedes actualizar la UI o hacer cualquier otra cosa que necesites
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Mostrar el formulario con datos del cliente a editar
function showEditClientForm(id) {
    $.ajax({
        url: `/api/clientes/${id}`,
        method: 'GET',
        success: function(cliente) {
            $('#clientName').val(cliente.nombre);
            $('#clientAddress').val(cliente.direccion);
            $('#clientEmail').val(cliente.email);
            $('#clientPhone').val(cliente.telefono);
            $('#clientForm').data('id', id).show(); // Guardar el ID para actualizar
            $('#formTitle').text('Editar Cliente');
            $('#saveClientBtn').off('click').on('click', updateClient); // Configura el botón para actualizar
            $('#overlay').show();
        }
    });
}

// Enviar los datos modificados del cliente al servidor
function updateClient() {
    const id = $('#clientForm').data('id');
    const clientData = {
        nombre: $('#clientName').val(),
        direccion: $('#clientAddress').val(),
        email: $('#clientEmail').val(),
        telefono: $('#clientPhone').val()
    };

    $.ajax({
        url: `/api/clientes/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(clientData),
        success: function() {
            loadClientData();
            $('#clientForm').hide(); // Ocultar el formulario después de actualizar
            $('#overlay').hide();
        }
    });
}

// Cargar datos de detalles de venta
function loadDetailData() {
    $.ajax({
        url: '/api/detalle-venta',
        method: 'GET',
        success: function(data) {
            $('#detailTable').empty();
            data.forEach(detalle => {
                $('#detailTable').append(`
                    <tr>
                        <td>${detalle.id_detalle_venta}</td>
                        <td>${detalle.cliente_id}</td>
                        <td>${detalle.estanque_id}</td>
                        <td>${detalle.fecha_pedido}</td>
                        <td>${detalle.fecha_entrega}</td>
                        <td>${detalle.cantidad}</td>
                        <td>${detalle.precio}</td>
                        <td>
                            <button class="btn btn-warning edit-detail" data-id="${detalle.id_detalle_venta}">Editar</button>
                            <button class="btn btn-danger delete-detail" data-id="${detalle.id_detalle_venta}">Eliminar</button>
                        </td>
                    </tr>
                `);
            });

            $('.edit-detail').click(function() {
                showEditDetailForm($(this).data('id'));
            });
            $('.delete-detail').click(deleteDetail);
        }
    });
}

// Mostrar el formulario para añadir un detalle de venta
function showAddDetailForm() {
    $('#detailForm').data('id', null).show(); // No tiene ID asignado para nueva adición
    $('#formTitle').text('Añadir Detalle de Venta');
    $('#saveDetailBtn').off('click').on('click', addDetail); // Configura el botón para añadir
    $('#overlay').show();
}

// Enviar los datos del nuevo detalle de venta al servidor
function addDetail() {
    const detailData = {
        cliente_id: $('#clientId').val(),
        estanque_id: $('#estanqueId').val(),
        fecha_pedido: $('#orderDate').val(),
        fecha_entrega: $('#deliveryDate').val(),
        cantidad: $('#quantity').val(),
        precio: $('#price').val()
    };

    $.ajax({
        url: '/api/detalle-venta',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(detailData),
        success: function() {
            loadDetailData();
            $('#detailForm').hide(); // Ocultar el formulario después de añadir
            $('#overlay').hide();
        }
    });
}

// Mostrar el formulario con datos del detalle de venta a editar
function showEditDetailForm(id) {
    $.ajax({
        url: `/api/detalle-venta/${id}`,
        method: 'GET',
        success: function(detalle) {
            $('#clientId').val(detalle.cliente_id);
            $('#estanqueId').val(detalle.estanque_id);
            $('#orderDate').val(detalle.fecha_pedido);
            $('#deliveryDate').val(detalle.fecha_entrega);
            $('#quantity').val(detalle.cantidad);
            $('#price').val(detalle.precio);
            $('#detailForm').data('id', id).show(); // Guardar el ID para actualizar
            $('#formTitle').text('Editar Detalle de Venta');
            $('#saveDetailBtn').off('click').on('click', updateDetail); // Configura el botón para actualizar
            $('#overlay').show();
        }
    });
}

// Enviar los datos modificados del detalle de venta al servidor
function updateDetail() {
    const id = $('#detailForm').data('id');
    const detailData = {
        cliente_id: $('#clientId').val(),
        estanque_id: $('#estanqueId').val(),
        fecha_pedido: $('#orderDate').val(),
        fecha_entrega: $('#deliveryDate').val(),
        cantidad: $('#quantity').val(),
        precio: $('#price').val()
    };

    $.ajax({
        url: `/api/detalle-venta/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(detailData),
        success: function() {
            loadDetailData();
            $('#detailForm').hide(); // Ocultar el formulario después de actualizar
            $('#overlay').hide();
        }
    });
}

// Eliminar un cliente
function deleteClient() {
    const id = $(this).data('id');
    $.ajax({
        url: `/api/clientes/${id}`,
        method: 'DELETE',
        success: function() {
            loadClientData();
        }
    });
}

// Eliminar un detalle de venta
function deleteDetail() {
    const id = $(this).data('id');
    $.ajax({
        url: `/api/detalle-venta/${id}`,
        method: 'DELETE',
        success: function() {
            loadDetailData();
        }
    });
}

// Eventos para añadir cliente y detalle de venta
$('#addClientBtn').click(showAddClientForm);
$('#addDetailBtn').click(showAddDetailForm);

// Ocultar el formulario al hacer clic en cancelar
$('#cancelClientBtn').click(function() {
    $('#clientForm').hide();
    $('#overlay').hide();
});

$('#cancelDetailBtn').click(function() {
    $('#detailForm').hide();
    $('#overlay').hide();
});

// Función para cargar datos de facturas
function loadFacturaData() {
    $.ajax({
        url: '/api/factura',
        method: 'GET',
        success: function(data) {
            $('#facturaTable').empty();
            data.forEach(factura => {
                $('#facturaTable').append(`
                    <tr>
                        <td>${factura.id_factura}</td>
                        <td>${factura.pedidos_id}</td>
                        <td>${factura.encargado_id}</td>
                        <td>${factura.fecha_factura}</td>
                    </tr>
                `);
            });
        }
    });
}

// Función para cargar estadísticas
function loadStatistics() {
    const chartData1 = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [{
            label: 'Ventas',
            data: [120, 150, 180, 220, 300, 400],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const chartData2 = {
        labels: ['Producto A', 'Producto B', 'Producto C'],
        datasets: [{
            label: 'Cantidad Vendida',
            data: [300, 450, 120],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
            borderWidth: 1
        }]
    };

    const ctx1 = document.getElementById('chart1').getContext('2d');
    const chart1 = new Chart(ctx1, {
        type: 'line',
        data: chartData1
    });

    const ctx2 = document.getElementById('chart2').getContext('2d');
    const chart2 = new Chart(ctx2, {
        type: 'bar',
        data: chartData2
    });
}
