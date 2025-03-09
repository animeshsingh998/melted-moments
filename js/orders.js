import { dbOperations } from './supabase-config.js';

function deleteOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const updatedOrders = orders.filter(order => order.orderId !== orderId);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    displayOrders();
}

async function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    
    try {
        const orders = await dbOperations.getOrders();
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="no-orders">No orders found</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Order ID: ${order.orderId}</h3>
                        <p class="order-date">${new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div class="order-total">
                        <p>Total: ${order.total}</p>
                    </div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <p>Quantity: ${item.quantity}</p>
                                <p>Price: ₹${item.price}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="delivery-info">
                    <p><strong>Delivery Address:</strong> ${order.address}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching orders:', error);
        ordersList.innerHTML = '<p class="error">Failed to load orders</p>';
    }
}

// Initialize orders display
displayOrders(); 