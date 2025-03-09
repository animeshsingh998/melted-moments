function resetAllData() {
    // Prompt for password
    const password = prompt("Please enter admin password to reset data:");
    
    // Check if password is correct
    if (password === "admin@melted") {
        if (confirm('Are you sure you want to reset all sales data? This action cannot be undone.')) {
            // Clear all relevant data from localStorage
            localStorage.removeItem('orders');
            localStorage.removeItem('cart');
            localStorage.removeItem('lastOrder');
            
            // Update the display
            calculateSalesMetrics();
            
            // Show success feedback
            alert('All sales data has been reset successfully.');
        }
    } else {
        // Show error message for wrong password
        alert('Unauthorized access / Permission denied');
    }
}

function calculateSalesMetrics() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Calculate total orders
    const totalOrders = orders.length;
    
    // Calculate total items and revenue
    let totalItems = 0;
    let totalRevenue = 0;
    const productStats = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            totalItems += item.quantity;
            const itemRevenue = item.price * item.quantity;
            totalRevenue += itemRevenue;

            // Track product performance
            if (!productStats[item.name]) {
                productStats[item.name] = {
                    unitsSold: 0,
                    revenue: 0
                };
            }
            productStats[item.name].unitsSold += item.quantity;
            productStats[item.name].revenue += itemRevenue;
        });
    });

    // Calculate average order value
    const avgOrderValue = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;

    // Update metrics display
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-revenue').textContent = `₹${totalRevenue}`;
    document.getElementById('avg-order-value').textContent = `₹${avgOrderValue}`;

    // Update product performance table
    const tableBody = document.querySelector('#product-table tbody');
    tableBody.innerHTML = Object.entries(productStats)
        .map(([name, stats]) => `
            <tr>
                <td>${name}</td>
                <td>${stats.unitsSold}</td>
                <td>₹${stats.revenue}</td>
            </tr>
        `).join('');

    // Display recent orders
    const recentOrdersList = document.getElementById('recent-orders-list');
    recentOrdersList.innerHTML = orders.slice(-5).reverse().map(order => `
        <div class="recent-order-card">
            <div class="order-basic-info">
                <h4>Order ID: ${order.orderId}</h4>
                <p class="order-date">
                    ${new Date(parseInt(order.orderId.slice(3))).toLocaleDateString()}
                </p>
            </div>
            <div class="order-amount">
                <p>Total: ${order.total}</p>
                <p>Items: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            </div>
        </div>
    `).join('');
}

// Add event listener for reset button
document.getElementById('reset-data').addEventListener('click', resetAllData);

// Initialize sales dashboard
calculateSalesMetrics(); 