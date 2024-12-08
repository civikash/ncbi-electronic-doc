function initFileUpload(fileInputSelector, fileListSelector) {
    const fileInput = document.querySelector(fileInputSelector);
    const fileList = document.querySelector(fileListSelector);

    if (!fileInput.dataset.initialized) {
        fileInput.addEventListener('change', () => handleFileChange(fileInput, fileList));
        fileInput.dataset.initialized = "true";
    }
}

function updateInputFiles(input, filesArray) {
    const dataTransfer = new DataTransfer();
    filesArray.forEach(file => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
  }

function handleFileChange(fileInput, fileList) {
    const files = Array.from(fileInput.files);
    updateFileList(files, fileList, fileInput);
}

function updateFileList(files, fileList, fileInput) {
    fileList.innerHTML = '';

    files.forEach(file => {
        const listItem = createFileListItem(file.name, () => removeFile(file.name, fileInput, fileList));
        fileList.appendChild(listItem);
    });
}

function createFileListItem(fileName, onRemove) {
    const listItem = document.createElement('li');
    listItem.textContent = fileName;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Удалить';
    removeButton.type = 'button';
    removeButton.addEventListener('click', onRemove);

    listItem.appendChild(removeButton);
    return listItem;
}

function removeFile(fileName, fileInput, fileList) {
    const files = Array.from(fileInput.files);
    const filteredFiles = files.filter(file => file.name !== fileName);

    const dataTransfer = new DataTransfer();
    filteredFiles.forEach(file => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;

    handleFileChange(fileInput, fileList);
}

document.body.addEventListener('htmx:afterSwap', (event) => {
    const fileInput = event.target.querySelector('#upload-files');
    const fileList = event.target.querySelector('#file-list');

    if (fileInput && fileList) {
        initFileUpload('#upload-files', '#file-list');
    }
});