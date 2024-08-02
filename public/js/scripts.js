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
function addClient() {
    const clientData = {
        nombre: $('#clientName').val(),
        direccion: $('#clientAddress').val(),
        email: $('#clientEmail').val(),
        telefono: $('#clientPhone').val()
    };

    $.ajax({
        url: '/api/clientes',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(clientData),
        success: function() {
            loadClientData();
            $('#clientForm').hide(); // Ocultar el formulario después de añadir
            $('#overlay').hide();
        }
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

// Cargar datos de facturas
function loadFacturaData() {
    $.ajax({
        url: '/api/facturas',
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
                        <td>
                            <button class="btn btn-warning edit-factura" data-id="${factura.id_factura}">Editar</button>
                            <button class="btn btn-danger delete-factura" data-id="${factura.id_factura}">Eliminar</button>
                        </td>
                    </tr>
                `);
            });

            $('.edit-factura').click(function() {
                showEditFacturaForm($(this).data('id'));
            });
            $('.delete-factura').click(deleteFactura);
        }
    });
}

// Mostrar el formulario para añadir una factura
function showAddFacturaForm() {
    $('#facturaForm').data('id', null).show(); // No tiene ID asignado para nueva adición
    $('#formTitle').text('Añadir Factura');
    $('#saveFacturaBtn').off('click').on('click', addFactura); // Configura el botón para añadir
    $('#overlay').show();
}

// Enviar los datos de la nueva factura al servidor
function addFactura() {
    const facturaData = {
        pedidos_id: $('#pedidoId').val(),
        encargado_id: $('#encargadoId').val(),
        fecha_factura: $('#facturaDate').val()
    };

    $.ajax({
        url: '/api/facturas',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(facturaData),
        success: function() {
            loadFacturaData();
            $('#facturaForm').hide(); // Ocultar el formulario después de añadir
            $('#overlay').hide();
        }
    });
}

// Mostrar el formulario con datos de la factura a editar
function showEditFacturaForm(id) {
    $.ajax({
        url: `/api/facturas/${id}`,
        method: 'GET',
        success: function(factura) {
            $('#pedidoId').val(factura.pedidos_id);
            $('#encargadoId').val(factura.encargado_id);
            $('#facturaDate').val(factura.fecha_factura);
            $('#facturaForm').data('id', id).show(); // Guardar el ID para actualizar
            $('#formTitle').text('Editar Factura');
            $('#saveFacturaBtn').off('click').on('click', updateFactura); // Configura el botón para actualizar
            $('#overlay').show();
        }
    });
}

// Enviar los datos modificados de la factura al servidor
function updateFactura() {
    const id = $('#facturaForm').data('id');
    const facturaData = {
        pedidos_id: $('#pedidoId').val(),
        encargado_id: $('#encargadoId').val(),
        fecha_factura: $('#facturaDate').val()
    };

    $.ajax({
        url: `/api/facturas/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(facturaData),
        success: function() {
            loadFacturaData();
            $('#facturaForm').hide(); // Ocultar el formulario después de actualizar
            $('#overlay').hide();
        }
    });
}

// Eliminar una factura
function deleteFactura() {
    const id = $(this).data('id');
    $.ajax({
        url: `/api/facturas/${id}`,
        method: 'DELETE',
        success: function() {
            loadFacturaData();
        }
    });
}

// Cargar estadísticas
function loadStatistics() {
    $.ajax({
        url: '/api/estadisticas',
        method: 'GET',
        success: function(data) {
            // Renderizar las estadísticas
            $('#totalClientes').text(data.totalClientes);
            $('#totalVentas').text(data.totalVentas);
            $('#totalFacturas').text(data.totalFacturas);
        }
    });
}
