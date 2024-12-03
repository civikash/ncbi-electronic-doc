function addNewField() {
    const visaContainer = document.getElementById('visa-container');
    
    // Создаем новый элемент input
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.name = 'visas';
    newInput.setAttribute('hx-trigger', 'input delay:500ms');
    newInput.setAttribute('hx-target', '#staff-list');
    newInput.setAttribute('hx-swap', 'innerHTML');
    
    // Добавляем обработчик события input
    newInput.addEventListener('input', handleInput);
    
    // Добавляем новое поле в контейнер
    visaContainer.appendChild(newInput);
}

// Функция обработки ввода
function handleInput(event) {
    const inputValue = event.target.value;
    console.log('Input value:', inputValue);
}