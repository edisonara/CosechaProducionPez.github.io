$(document).ready(function() {

       // Load data and initialize charts
       loadClientData();
       loadDetailData();
       loadFacturaData();
       loadStatistics();

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

// Función para cargar datos de los clientes
function loadClientData() {
    $.ajax({
        url: '/api/clientes',
        method: 'GET',
        success: function(data) {
            $('#clientTable').empty();
            data.forEach(cliente => {
                $('#clientTable').append(`
                    <tr>
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

            $('.edit-client').click(editClient);
            $('.delete-client').click(deleteClient);
        }
    });
}

// Función para editar un cliente (implementación requerida)
function editClient() {
    const id = $(this).data('id');
    // Aquí puedes abrir un modal o una nueva página para editar los detalles del cliente
}

// Función para eliminar un cliente
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

// Función para cargar datos de detalle de ventas
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

            $('.edit-detail').click(editDetail);
            $('.delete-detail').click(deleteDetail);
        }
    });
}

// Función para editar un detalle de venta (implementación requerida)
function editDetail() {
    const id = $(this).data('id');
    // Aquí puedes abrir un modal o una nueva página para editar los detalles del detalle de venta
}

// Función para eliminar un detalle de venta
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

// Cargar datos de clientes cuando el documento esté listo
$(document).ready(function() {
    loadClientData();
    // Puedes agregar otras funciones de carga de datos aquí
});
