function deleteOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const updatedOrders = orders.filter(order => order.orderId !== orderId);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    displayOrders();
}

function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No orders found</p>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order ID: ${order.orderId}</h3>
                    <p class="order-date">${new Date(parseInt(order.orderId.slice(3))).toLocaleDateString()}</p>
                </div>
                <div class="order-total">
                    <p>Total: ${order.total}</p>
                </div>
                <div class="order-actions">
                    <button class="delete-order-btn" onclick="deleteOrder('${order.orderId}')">
                        <i class="fas fa-trash"></i> Delete Order
                    </button>
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>${item.description}</p>
                            <p>Quantity: ${item.quantity}</p>
                            <p>Price: ₹${item.price}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Initialize orders display
displayOrders(); 