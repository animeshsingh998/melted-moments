window.addEventListener('DOMContentLoaded', () => {
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    if (lastOrder) {
        document.getElementById('order-id').textContent = lastOrder.orderId;
        document.getElementById('order-amount').textContent = lastOrder.total;
    }
}); 