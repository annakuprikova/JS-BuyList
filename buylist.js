//  Чекаємо, поки сторінка повністю завантажиться, щоб всі елементи були доступні для роботи
document.addEventListener('DOMContentLoaded', () => {
    //  Зберігаємо посилання на HTML-елементи
    const productInput = document.getElementById('productInput');
    const addBtn = document.getElementById('add-btn');
    const productsList = document.getElementById('productsList');
    const remainingProducts = document.getElementById('remainingProducts');
    const boughtProducts = document.getElementById('boughtProducts');

    //  Початкові товари (збережений список товарів з localStorage)
    let products = JSON.parse(localStorage.getItem('products')) || [
        { name: 'Помідори', qty: 2, bought: false },
        { name: 'Печиво', qty: 1, bought: false },
        { name: 'Сир', qty: 2, bought: false },
    ];

    //  Зберігає поточний список товарів у localStorage у вигляді рядка JSON (викликається щоразу після змін)
    function saveProductsToStorage() {
        localStorage.setItem('products', JSON.stringify(products));
    }

    // Функція оновлення списку товарів у лівій панелі
    function renderProducts() {
        productsList.innerHTML = '';

        //  Перебирає кожен товар з масиву products і створює HTML-структуру для відображення
        products.forEach((product, index) => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            if (product.bought) productDiv.classList.add('highlighted');

            const productRow = document.createElement('div');
            productRow.classList.add('product-row');

            //  Назва товару: якщо куплений - текст закреслений, якщо ні - input для редагування
            const nameDiv = document.createElement('div');
            nameDiv.classList.add('product-name');

            //  Якщо товар куплений (bought == true) - назва товару перекреслена
            if (product.bought) {
                nameDiv.classList.add('line-through');
                nameDiv.textContent = product.name;
            } else {    //  якщо товар не куплений, тоді назва - це поле вводу, де можна її редагувати
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.classList.add('editable-name');
                nameInput.value = product.name;

                //  Зберігаємо старе значення, щоб у разі проблем можна було відкотити назад
                let oldValue = product.name;

                //  При зміні назви (втраті фокусу або Enter) оновлюємо товар
                function saveName() {
                    const newName = nameInput.value.trim();
                    if (newName === '') {   //  пуста назва товару
                        nameInput.value = oldValue;
                        return;
                    }
                    // Перевірка на дублікати
                    const duplicate = products.find((p, i) => i !== index && !p.bought && p.name.toLowerCase() === newName.toLowerCase());
                    if (duplicate) {    //  знайшли товар з такою самою назвою
                        nameInput.value = oldValue;
                        return;
                    }
                    product.name = newName;
                    oldValue = newName;
                    renderSummary();
                    saveProductsToStorage();
                }

                nameInput.addEventListener('blur', saveName);   //  'blur' - коли поле вводу втратить фокус
                nameInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {    //  вручну знімаємо фокус, коли після введеня нової назви товару натискаємо 'Enter'
                        e.preventDefault();
                        nameInput.blur();
                    }
                });

                nameDiv.appendChild(nameInput);
            }

            //  Створюємо елементи керування товаром у лівій панельці
            //  Контейнер для кнопок керування кількістю
            const controlsContainer = document.createElement('div');
            controlsContainer.classList.add('controls-container');
            if (!product.bought) {  //  якщо товар ще не куплено, створюємо кнопки збільшення/зменшення кількості
                const controls = document.createElement('div');
                controls.classList.add('controls');

                //  Кнопка для зменшення кількості товару
                const decreaseBtn = document.createElement('button');
                decreaseBtn.classList.add('circle-btn', 'decrease');
                decreaseBtn.textContent = '−';
                decreaseBtn.setAttribute('data-tooltip', 'Зменшити кількість');
                decreaseBtn.disabled = product.qty <= 1;    //  забороняє зменшення, якщо кількість = 1
                decreaseBtn.addEventListener('click', () => {
                    if (product.qty > 1) {
                        product.qty--;
                        // renderProducts();    //або перемальвовувати повністю ліву панельку при зміні кількості товарів (кнопки +/-), або краще так (див. наступний рядок коду)
                        qtyDiv.textContent = product.qty;
                        renderSummary();
                        saveProductsToStorage();
                    }
                });

                //  Контейнер, що показує кількість товару
                const qtyDiv = document.createElement('div');
                qtyDiv.classList.add('qty');
                qtyDiv.textContent = product.qty;

                //  Кнопка для збільшення кількості товару
                const increaseBtn = document.createElement('button');
                increaseBtn.classList.add('circle-btn', 'increase');
                increaseBtn.textContent = '+';
                increaseBtn.setAttribute('data-tooltip', 'Збільшити кількість');
                increaseBtn.addEventListener('click', () => {
                    product.qty++;
                    // renderProducts();
                    qtyDiv.textContent = product.qty;
                    renderSummary();
                    saveProductsToStorage();
                });

                controls.appendChild(decreaseBtn);
                controls.appendChild(qtyDiv);
                controls.appendChild(increaseBtn);
                controlsContainer.appendChild(controls);
            } else {
                //  Якщо товар куплений, то просто показуємо кількість без кнопок
                const qtyOnly = document.createElement('div');
                qtyOnly.classList.add('qty-only');
                qtyOnly.textContent = product.qty;
                controlsContainer.appendChild(qtyOnly);
            }

            //  Контейнер з кнопками "Куплено / Не куплено" та "Видалити" (якщо не куплено)
            const buyBox = document.createElement('div');
            buyBox.classList.add('buy-box');

            const buyBtn = document.createElement('button');
            buyBtn.classList.add('buy-btn');
            //  Змінює статус товару (змінює значення product.bought, переписує список, зберігає в localStorage)
            buyBtn.textContent = product.bought ? 'Не куплено' : 'Куплено';
            buyBtn.setAttribute('data-tooltip', product.bought ? 'Позначити як не куплено' : 'Позначити як куплено');
            if (!product.bought) buyBtn.classList.remove('not-bought');
            else buyBtn.classList.add('not-bought');
            buyBtn.addEventListener('click', () => {
                product.bought = !product.bought;
                renderProducts();
                renderSummary();
                saveProductsToStorage();
            });
            buyBox.appendChild(buyBtn);

            //  Кнопка видалення тільки якщо не куплено
            if (!product.bought) {
                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                deleteBtn.textContent = '×';
                deleteBtn.setAttribute('data-tooltip', 'Видалити товар зі списку');
                deleteBtn.addEventListener('click', () => {
                    products.splice(index, 1);
                    renderProducts();
                    renderSummary();
                    saveProductsToStorage();
                });
                buyBox.appendChild(deleteBtn);
            }

            //  Додавання всіх елементів до інтерфейсу
            productRow.appendChild(nameDiv);
            productRow.appendChild(controlsContainer);
            productRow.appendChild(buyBox);
            productDiv.appendChild(productRow);
            productsList.appendChild(productDiv);
        });
    }


    // Функція оновлення правої панелі
    function renderSummary() {
        //  очищає обидві секції, щоб заново заповнити актуальним вмістом
        remainingProducts.innerHTML = '';
        boughtProducts.innerHTML = '';

        products.forEach(product => {
            const summaryDiv = document.createElement('div');
            summaryDiv.classList.add('product-summary');
            if (product.bought) summaryDiv.classList.add('bought');

            // Якщо куплений, то товар закреслений, інакше - просто назва
            if (product.bought) {
                const span = document.createElement('span');
                span.classList.add('line-through');
                span.textContent = product.name;
                summaryDiv.appendChild(span);
            } else {
                summaryDiv.textContent = product.name;
            }

            //  Додається блок із кількістю товару
            const qtyDiv = document.createElement('div');
            qtyDiv.classList.add('product-summary-qty');
            qtyDiv.textContent = product.qty;
            summaryDiv.appendChild(qtyDiv);

            //  В залежності від статусу товару додає summaryDiv або в секцію "куплено", або "залишилося"
            if (product.bought) {
                boughtProducts.appendChild(summaryDiv);
            } else {
                remainingProducts.appendChild(summaryDiv);
            }
        });
    }

    // Додавання нового товару
    function addProduct() {
        const name = productInput.value.trim();
        if (name === '') return;

        // Якщо товар з такою назвою вже є, просто збільшуємо кількість, інакше - створюємо новий товар
        const existing = products.find(p => p.name.toLowerCase() === name.toLowerCase() && !p.bought);
        if (existing) {
            existing.qty++;
        } else {
            products.push({ name, qty: 1, bought: false });
        }
        productInput.value = '';
        productInput.focus();

        renderProducts();
        renderSummary();
        saveProductsToStorage();
    }

    // Обробка натискання кнопки "Додати"
    addBtn.addEventListener('click', addProduct);

    // Обробка Enter в полі вводу
    productInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addProduct();
        }
    });

    // Ініціалізація списку при завантаженні
    renderProducts();
    renderSummary();
});