import { dbOperations } from './supabase-config.js';
import { supabase } from './supabase-config.js';

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

        // Get recent orders for display
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        // Display recent orders
        const recentOrdersList = document.getElementById('recent-orders-list');
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

    } catch (error) {
        console.error('Failed to load sales data:', error);
        alert('Failed to load sales data. Please try again.');
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

// Initialize sales dashboard
calculateSalesMetrics(); 