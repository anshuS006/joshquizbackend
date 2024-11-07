document.getElementById('upload-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById('response-message').textContent = 'Please select a file.';
        return;
    }

    const formData = new FormData();
    formData.append('file', file); // Append the file to FormData

    try {
        const response = await fetch('http://localhost:3000/questions/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('response-message').textContent = 'Upload successful: ' + result.message;
        } else {
            document.getElementById('response-message').textContent = 'Upload failed: ' + result.error;
        }
    } catch (error) {
        document.getElementById('response-message').textContent = 'Error: ' + error.message;
    }
});
