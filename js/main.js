document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu functionality
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu?.contains(e.target) && !navLinks?.contains(e.target)) {
            mobileMenu?.classList.remove('active');
            navLinks?.classList.remove('active');
        }
    });

    // Close menu when clicking a link
    const navLinksItems = document.querySelectorAll('.nav-links a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu?.classList.remove('active');
            navLinks?.classList.remove('active');
        });
    });

    // Product filtering functionality
    const categoryBtns = document.querySelectorAll('.category-btn');
    const productItems = document.querySelectorAll('.product-item');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const category = btn.dataset.category;

            productItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Existing video player code
    const video = document.getElementById('product-video');
    const videoContainer = video?.parentElement;
    const playBtn = document.getElementById('play-btn');

    if (playBtn && video) {
        playBtn.addEventListener('click', function() {
            video.play();
            videoContainer.classList.add('playing');
        });

        video.addEventListener('pause', function() {
            videoContainer.classList.remove('playing');
        });

        video.addEventListener('play', function() {
            videoContainer.classList.add('playing');
        });

        video.addEventListener('ended', function() {
            videoContainer.classList.remove('playing');
        });
    }
}); 