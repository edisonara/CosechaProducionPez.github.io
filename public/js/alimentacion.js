$(document).ready(function() {
    // Función para cargar los alimentos desde la base de datos
    function cargarAlimentos() {
        // Hacer una petición AJAX al backend para obtener los alimentos
        $.ajax({
            url: '/api/alimentos', // Endpoint del backend para obtener alimentos
            method: 'GET',
            success: function(data) {
                // Limpiar la tabla
                $('#alimentosTableBody').empty();
                // Iterar sobre los datos y agregar cada alimento a la tabla
                data.forEach(function(alimento) {
                    $('#alimentosTableBody').append(`
                        <tr>
                            <td>${alimento.id_alimentacion}</td>
                            <td>${alimento.tipo_alimento}</td>
                            <td>
                                
                                <button class="btn btn-sm btn-danger eliminarBtn" data-id="${alimento.id_alimentacion}">Eliminar</button>
                            </td>
                        </tr>
                    `);
                });
            },
            error: function(err) {
                console.error('Error al cargar alimentos:', err);
            }
        });
    }

    // Cargar los alimentos al cargar la página
    cargarAlimentos();

    // Manejar el envío del formulario para agregar un nuevo alimento
    $('#alimentacionForm').submit(function(event) {
        event.preventDefault();
        // Obtener el tipo de alimento del formulario
        const tipoAlimento = $('#tipoAlimento').val();
        // Hacer una petición AJAX para agregar el alimento
        $.ajax({
            url: '/api/alimentos', // Endpoint del backend para agregar alimentos
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ tipo_alimento: tipoAlimento }),
            success: function(data) {
                // Limpiar el formulario
                $('#tipoAlimento').val('');
                // Volver a cargar los alimentos
                cargarAlimentos();
            },
            error: function(err) {
                console.error('Error al agregar alimento:', err);
            }
        });
    });

    // Evento delegado para botones de editar y eliminar
    $('#alimentosTableBody').on('click', '.editarBtn', function() {
        const idAlimento = $(this).data('id');
        // Implementar lógica para editar un alimento (opcional)
        // Puedes abrir un modal con el formulario de edición
        // y manejar la actualización haciendo otra petición AJAX
        console.log('Editar alimento con ID:', idAlimento);
    });

    $('#alimentosTableBody').on('click', '.eliminarBtn', function() {
        const idAlimento = $(this).data('id');
        $.ajax({
            url: `/api/alimentos/${idAlimento}`, // Endpoint del backend para eliminar alimentos
            method: 'DELETE',
            success: function(data) {
                // Volver a cargar los alimentos después de eliminar
                cargarAlimentos();
            },
            error: function(err) {
                console.error('Error al eliminar alimento:', err);
            }
        });
    });
});
