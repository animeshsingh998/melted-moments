import { dbOperations } from './supabase-config.js';
import { supabase } from './supabase-config.js';

// Add these variables at the top of your file
let currentPage = 1;
const ordersPerPage = 5;
let totalOrders = 0;

async function calculateSalesMetrics() {
    try {
        // Update sales data first
        const salesData = await dbOperations.updateSalesData();
        
        // Update metrics display
        document.getElementById('total-orders').textContent = salesData.totalOrders;
        document.getElementById('total-items').textContent = salesData.totalItems;
        document.getElementById('total-revenue').textContent = `₹${salesData.totalRevenue.toFixed(2)}`;
        document.getElementById('avg-order-value').textContent = 
            salesData.totalOrders > 0 
                ? `₹${(salesData.totalRevenue / salesData.totalOrders).toFixed(2)}`
                : '₹0';

        // Update product performance table
        const tableBody = document.querySelector('#product-table tbody');
        tableBody.innerHTML = Object.entries(salesData.productStats)
            .map(([name, stats]) => `
                <tr>
                    <td>${name}</td>
                    <td>${stats.unitsSold}</td>
                    <td>₹${stats.revenue.toFixed(2)}</td>
                </tr>
            `).join('');

        try {
            // Get recent orders for display - wrapped in separate try-catch
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            // Display recent orders
            const recentOrdersList = document.getElementById('recent-orders-list');
            if (orders && orders.length > 0) {
                recentOrdersList.innerHTML = orders.map(order => `
                    <div class="recent-order-card">
                        <div class="order-basic-info">
                            <h4>Order ID: ${order.orderId}</h4>
                            <p class="order-date">
                                ${new Date(order.date).toLocaleDateString()}
                            </p>
                        </div>
                        <div class="order-amount">
                            <p>Total: ${order.total}</p>
                            <p>Items: ${JSON.parse(order.items).reduce((sum, item) => sum + item.quantity, 0)}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                recentOrdersList.innerHTML = '<p class="no-orders">No recent orders</p>';
            }
        } catch (recentOrdersError) {
            console.warn('Failed to load recent orders:', recentOrdersError);
            document.getElementById('recent-orders-list').innerHTML = 
                '<p class="error">Failed to load recent orders</p>';
            // Don't throw the error, just handle it locally
        }

    } catch (error) {
        console.error('Failed to load sales data:', error);
        // Only show alert if the main sales data failed to load
        if (!document.getElementById('total-orders').textContent) {
            alert('Failed to load sales data. Please try again.');
        }
    }
}

// Handle reset button
document.getElementById('reset-data').addEventListener('click', async () => {
    const password = prompt("Please enter admin password to reset data:");
    
    if (password === "admin@melted") {
        if (confirm('Are you sure you want to reset all sales data? This action cannot be undone.')) {
            try {
                // Show loading state
                const resetButton = document.getElementById('reset-data');
                const originalText = resetButton.innerHTML;
                resetButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
                resetButton.disabled = true;

                await dbOperations.resetSalesData();
                await calculateSalesMetrics();

                // Reset button state
                resetButton.innerHTML = originalText;
                resetButton.disabled = false;

                alert('All sales data has been reset successfully.');
            } catch (error) {
                console.error('Reset error:', error);
                alert('Failed to reset data: ' + error.message);
                
                // Reset button state
                const resetButton = document.getElementById('reset-data');
                resetButton.innerHTML = originalText;
                resetButton.disabled = false;
            }
        }
    } else {
        alert('Unauthorized access / Permission denied');
    }
});

// Update the displayAllOrders function
async function displayAllOrders(page = 1) {
    try {
        const orders = await dbOperations.getOrders();
        const allOrdersList = document.getElementById('all-orders-list');
        
        if (!orders || orders.length === 0) {
            allOrdersList.innerHTML = '<p class="no-orders">No orders found</p>';
            document.querySelector('.pagination-controls').style.display = 'none';
            return;
        }

        // Calculate pagination values
        totalOrders = orders.length;
        const totalPages = Math.ceil(totalOrders / ordersPerPage);
        currentPage = Math.min(Math.max(1, page), totalPages);

        // Get orders for current page
        const startIndex = (currentPage - 1) * ordersPerPage;
        const endIndex = Math.min(startIndex + ordersPerPage, totalOrders);
        const pageOrders = orders.slice(startIndex, endIndex);

        // Update page info
        document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;

        // Update pagination buttons
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        // Display orders for current page
        allOrdersList.innerHTML = pageOrders.map(order => `
            <div class="order-detail-card">
                <div class="order-detail-header">
                    <div class="order-detail-info">
                        <h3>Order ID</h3>
                        <p>${order.orderId}</p>
                    </div>
                    <div class="order-detail-info">
                        <h3>Order Date</h3>
                        <p>${new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div class="order-detail-info">
                        <h3>Payment Method</h3>
                        <p>${order.paymentMethod}</p>
                    </div>
                </div>

                <div class="order-items-grid">
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-info">
                                <h4>${item.name}</h4>
                                <p>${item.description}</p>
                                <p>Quantity: ${item.quantity}</p>
                            </div>
                            <div class="item-price">
                                <p>₹${item.price * item.quantity}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="order-footer">
                    <div class="delivery-info">
                        <strong>Delivery Address:</strong>
                        <p>${order.address}</p>
                    </div>
                    <div class="order-total">
                        <p>Total: ${order.total}</p>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error displaying all orders:', error);
        document.getElementById('all-orders-list').innerHTML = 
            '<p class="error">Failed to load orders</p>';
    }
}

// Add event listeners for pagination buttons
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        displayAllOrders(currentPage - 1);
        window.scrollTo({ top: document.querySelector('.all-orders-section').offsetTop, behavior: 'smooth' });
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(totalOrders / ordersPerPage);
    if (currentPage < totalPages) {
        displayAllOrders(currentPage + 1);
        window.scrollTo({ top: document.querySelector('.all-orders-section').offsetTop, behavior: 'smooth' });
    }
});

// Initialize sales dashboard
calculateSalesMetrics();
displayAllOrders(1); 