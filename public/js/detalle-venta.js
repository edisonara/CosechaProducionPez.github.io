$(document).ready(function() {
    // Función para cargar detalles de ventas
    function loadDetails() {
        $.ajax({
            url: '/api/detalle-venta',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                $('#detail-table-body').empty();
                data.forEach(function(detail) {
                    $('#detail-table-body').append(`
                        <tr>
                            <td>${detail.id_detalle_venta}</td>
                            <td>${detail.cliente_id}</td>
                            <td>${detail.estanque_id}</td>
                            <td>${detail.fecha_pedido}</td>
                            <td>${detail.fecha_entrega || 'N/A'}</td>
                            <td>${detail.cantidad}</td>
                            <td>${detail.precio}</td>
                            <td>
                                <button class="btn btn-warning btn-sm edit-btn" data-id="${detail.id_detalle_venta}">Editar</button>
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${detail.id_detalle_venta}">Eliminar</button>
                            </td>
                        </tr>
                    `);
                });
            },
            error: function() {
                alert('Hubo un error al cargar los detalles de venta');
            }
        });
    }

    // Cargar los detalles al iniciar
    loadDetails();

    // Manejar el formulario de agregar detalle de venta
    $('#add-detail-form').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            url: '/api/detalle-venta',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                cliente_id: $('#clienteId').val(),
                estanque_id: $('#estanqueId').val(),
                fecha_pedido: $('#fechaPedido').val(),
                fecha_entrega: $('#fechaEntrega').val(),
                cantidad: $('#cantidad').val(),
                precio: $('#precio').val()
            }),
            success: function() {
                loadDetails();
                $('#add-detail-form')[0].reset();
            },
            error: function() {
                alert('Hubo un error al agregar el detalle de venta');
            }
        });
    });

    // Manejar el clic en el botón de eliminar
    $('#detail-table-body').on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        $.ajax({
            url: `/api/detalle-venta/${id}`,
            method: 'DELETE',
            success: function() {
                loadDetails();
            },
            error: function() {
                alert('Hubo un error al eliminar el detalle de venta');
            }
        });
    });

    // Manejar el clic en el botón de editar (puedes implementar esta funcionalidad según tus necesidades)
    $('#detail-table-body').on('click', '.edit-btn', function() {
        const id = $(this).data('id');
        // Implementar la funcionalidad de edición si es necesario
        alert('Funcionalidad de edición no implementada');
    });
});
