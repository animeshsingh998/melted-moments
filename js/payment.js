document.addEventListener('DOMContentLoaded', () => {
    const cardDetails = document.getElementById('card-details');
    const paymentMethods = document.getElementsByName('payment-type');
    const payButton = document.getElementById('pay-button');
    const buttonText = document.getElementById('button-text');
    const spinner = document.getElementById('spinner');
    
    // Display order summary
    const orderDetails = JSON.parse(localStorage.getItem('lastOrder')) || {};
    document.getElementById('total-amount').textContent = orderDetails.total || '₹0';
    document.getElementById('total-items').textContent = 
        orderDetails.items ? orderDetails.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    // Handle payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            if (e.target.value === 'online') {
                cardDetails.classList.remove('hidden');
                buttonText.textContent = 'Pay Now';
            } else {
                cardDetails.classList.add('hidden');
                buttonText.textContent = 'Place Order';
            }
        });
    });

    // Format card number with spaces
    const cardNumber = document.getElementById('card-number');
    cardNumber?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = formattedValue;
    });

    // Format expiry date
    const expiry = document.getElementById('expiry');
    expiry?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0,2) + '/' + value.slice(2);
        }
        e.target.value = value;
    });

    // Handle payment submission
    payButton.addEventListener('click', async () => {
        const address = document.getElementById('address').value.trim();
        if (!address) {
            alert('Please enter delivery address');
            return;
        }

        const paymentType = document.querySelector('input[name="payment-type"]:checked').value;
        
        if (paymentType === 'online') {
            // Validate card details
            const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
            const expiry = document.getElementById('expiry').value;
            const cvv = document.getElementById('cvv').value;
            const cardHolder = document.getElementById('card-holder').value.trim();

            if (!cardNumber || !expiry || !cvv || !cardHolder) {
                alert('Please fill in all card details');
                return;
            }

            if (cardNumber.length < 16) {
                alert('Please enter a valid card number');
                return;
            }
        }

        // Show loading state
        buttonText.classList.add('hidden');
        spinner.classList.remove('hidden');
        payButton.disabled = true;

        // Simulate payment processing
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Get the order details
            const orderDetails = JSON.parse(localStorage.getItem('lastOrder'));
            
            // Store the order in orders history
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orderDetails.address = address;
            orderDetails.paymentMethod = paymentType;
            orders.push(orderDetails);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Clear the cart
            localStorage.removeItem('cart');
            
            // Redirect to confirmation page
            window.location.href = 'order-confirmation.html';
        } catch (error) {
            alert('Payment failed. Please try again.');
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
            payButton.disabled = false;
        }
    });

    // Handle location button
    const locationButton = document.getElementById('get-location');
    const locationStatus = document.getElementById('location-status');
    const addressInput = document.getElementById('address');

    locationButton.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        locationStatus.classList.remove('hidden');
        locationButton.disabled = true;

        navigator.geolocation.getCurrentPosition(
            async position => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    // Use reverse geocoding to get address from coordinates
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await response.json();
                    
                    // Format the address
                    const address = data.display_name;
                    addressInput.value = address;
                    
                    locationStatus.innerHTML = '<i class="fas fa-check-circle"></i> Location found!';
                    setTimeout(() => {
                        locationStatus.classList.add('hidden');
                    }, 2000);
                } catch (error) {
                    locationStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to get address';
                    setTimeout(() => {
                        locationStatus.classList.add('hidden');
                    }, 2000);
                }
                locationButton.disabled = false;
            },
            error => {
                let message = 'Failed to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Please allow location access';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                locationStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
                setTimeout(() => {
                    locationStatus.classList.add('hidden');
                }, 2000);
                locationButton.disabled = false;
            }
        );
    });
}); 