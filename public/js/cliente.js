$(document).ready(function() {
    // Función para agregar un cliente
    $('#addClientForm').on('submit', function(event) {
        event.preventDefault();
        
        const clientName = $('#clientName').val();
        const clientAddress = $('#clientAddress').val();
        const clientEmail = $('#clientEmail').val();
        const clientPhone = $('#clientPhone').val();

        const data = {
            nombre: clientName,
            direccion: clientAddress,
            email: clientEmail,
            telefono: clientPhone
        };

        fetch('/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            alert('Cliente agregado exitosamente');
            $('#addClientForm')[0].reset();
            loadClients();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Hubo un error al agregar el cliente');
        });
    });

    // Función para cargar los clientes
    function loadClients() {
        fetch('/api/clientes')
        .then(response => response.json())
        .then(data => {
            const clientsTable = $('#clientsTable tbody');
            clientsTable.empty();
            data.forEach(client => {
                clientsTable.append(`
                    <tr>
                        <td>${client.id_cliente}</td>
                        <td>${client.nombre}</td>
                        <td>${client.direccion}</td>
                        <td>${client.email}</td>
                        <td>${client.telefono}</td>
                        <td>
                            <button class="btn btn-info btn-sm edit-btn" data-id="${client.id_cliente}">Editar</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${client.id_cliente}">Eliminar</button>
                        </td>
                    </tr>
                `);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Hubo un error al cargar los clientes');
        });
    }

    // Llamar a la función para cargar los clientes cuando la página cargue
    loadClients();
});
