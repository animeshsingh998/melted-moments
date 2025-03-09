let cart = JSON.parse(localStorage.getItem('cart')) || [];

function displayCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalAmount = document.getElementById('cart-total-amount');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalAmount.textContent = '₹0';
        return;
    }

    let total = 0;
    cartContainer.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <span class="price">₹${item.price}</span>
                </div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    totalAmount.textContent = `₹${total}`;
}

function updateQuantity(index, change) {
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length > 0) {
        const orderDetails = {
            orderId: 'ORD' + Date.now(),
            total: document.getElementById('cart-total-amount').textContent,
            items: cart,
            date: new Date().toISOString()
        };
        
        // Store order details temporarily
        localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
        
        // Redirect to payment page
        window.location.href = 'payment.html';
    }
});

// Initialize cart display
displayCart(); 