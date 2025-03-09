import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://loqegpryaoceametorer.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvcWVncHJ5YW9jZWFtZXRvcmVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjEwNDYsImV4cCI6MjA1NzA5NzA0Nn0.G-m8PhXxYmfQdwuB2c9qdWrbNqexUBdN4KnoIR_hHW8';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection and table existence
(async () => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('Supabase connection error:', error.message);
        } else {
            console.log('Supabase connected and orders table exists');
        }
    } catch (err) {
        console.error('Supabase test failed:', err.message);
    }
})();

export const dbOperations = {
    // Save order
    saveOrder: async (orderData) => {
        try {
            if (!orderData) {
                throw new Error('No order data provided');
            }

            console.log('Saving order:', orderData);

            // Ensure all required fields are present
            const formattedOrder = {
                orderId: orderData.orderId || `ORD${Date.now()}`,
                total: orderData.total || '0',
                items: JSON.stringify(orderData.items || []),
                date: new Date().toISOString(),
                address: orderData.address || '',
                paymentMethod: orderData.paymentMethod || 'cod'
            };

            console.log('Formatted order:', formattedOrder);

            const { data, error } = await supabase
                .from('orders')
                .insert([formattedOrder])
                .select('*')
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                throw new Error(error.message);
            }

            if (!data) {
                throw new Error('No data returned after insert');
            }

            console.log('Order saved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error in saveOrder:', error);
            throw new Error(`Failed to save order: ${error.message}`);
        }
    },

    // Get all orders
    getOrders: async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Parse the items JSON for each order
            return (data || []).map(order => ({
                ...order,
                items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
            }));
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    // Clear all orders (for admin reset)
    clearOrders: async () => {
        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .neq('id', 0);
                
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
        } catch (error) {
            console.error('Error clearing orders:', error);
            throw error;
        }
    },

    // Get sales data
    getSalesData: async () => {
        try {
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching sales data:', error);
            throw error;
        }
    },

    // Update sales data
    updateSalesData: async () => {
        try {
            // Get all orders
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*');

            if (ordersError) throw ordersError;

            // Calculate metrics
            const totalOrders = orders.length;
            let totalItems = 0;
            let totalRevenue = 0;
            const productStats = {};

            orders.forEach(order => {
                const items = typeof order.items === 'string' 
                    ? JSON.parse(order.items) 
                    : order.items;

                items.forEach(item => {
                    totalItems += item.quantity;
                    const itemRevenue = item.price * item.quantity;
                    totalRevenue += itemRevenue;

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

            // Update sales record
            const { error: updateError } = await supabase
                .from('sales')
                .update({
                    total_orders: totalOrders,
                    total_items: totalItems,
                    total_revenue: totalRevenue,
                    product_stats: productStats,
                    last_updated: new Date().toISOString()
                })
                .eq('id', 1); // Update the first record

            if (updateError) throw updateError;

            return {
                totalOrders,
                totalItems,
                totalRevenue,
                productStats
            };
        } catch (error) {
            console.error('Error updating sales data:', error);
            throw error;
        }
    },

    // Reset sales data
    resetSalesData: async () => {
        try {
            // First delete all orders
            const { error: deleteError } = await supabase
                .from('orders')
                .delete()
                .not('id', 'is', null); // Delete all records

            if (deleteError) throw deleteError;

            // Then reset the sales statistics
            const { error: updateError } = await supabase
                .from('sales')
                .update({
                    total_orders: 0,
                    total_items: 0,
                    total_revenue: 0,
                    product_stats: {},
                    last_updated: new Date().toISOString()
                })
                .eq('id', 1);

            if (updateError) throw updateError;

            // Clear local storage as well
            localStorage.removeItem('cart');
            localStorage.removeItem('lastOrder');
        } catch (error) {
            console.error('Error resetting data:', error);
            throw new Error(`Failed to reset data: ${error.message}`);
        }
    }
}; 