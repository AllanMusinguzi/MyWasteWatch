// public/js/admin.js

function deleteDriver(driverId) {
    const csrfToken = document.querySelector('input[name="_csrf"]').value; // Get the CSRF token

    fetch(`/admin/delete-driver/${driverId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken // Include CSRF token in the headers
        }
    })
    .then(response => {
        if (response.ok) {
            alert("Driver deleted successfully");
            location.reload(); 
        } else {
            alert("Failed to delete driver");
        }
    })
    .catch(error => console.error('Error:', error));
}


function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        fetch(`/admin/deleteUser/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value // CSRF token if needed
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            return response.text(); 
        })
        .then(message => {
            alert(message);
            location.reload();
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to delete user.");
        });
    }
}

