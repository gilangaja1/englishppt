document.addEventListener('DOMContentLoaded', function() {
    // Pemilihan Elemen DOM
    const slidesContainer = document.getElementById('slidesContainer');
    const slides = Array.from(document.querySelectorAll('.slide'));
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsNavigation = document.getElementById('dots');
    const themeToggle = document.getElementById('themeToggle');
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    // Fungsi untuk memperbarui variabel CSS RGB dari warna hex
    function updateColorRGBVariables() {
        const rootStyle = getComputedStyle(document.documentElement);
        // Helper function to safely get and trim CSS variables
        const getCssVar = (name) => rootStyle.getPropertyValue(name).trim();

        const primaryColorHex = getCssVar('--primary-color');
        const secondaryColorHex = getCssVar('--secondary-color');
        const accentColorHex = getCssVar('--accent-color');
        const textColorHex = getCssVar('--text-color');
        const cardBgHex = getCssVar('--card-bg');
        const shadowColorHex = getCssVar('--shadow-color'); // Assuming shadow color might be needed in RGB

        document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(primaryColorHex));
        document.documentElement.style.setProperty('--secondary-color-rgb', hexToRgb(secondaryColorHex));
        document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(accentColorHex));
        document.documentElement.style.setProperty('--text-color-rgb', hexToRgb(textColorHex));
        document.documentElement.style.setProperty('--card-bg-rgb', hexToRgb(cardBgHex));
        document.documentElement.style.setProperty('--shadow-color-rgb', hexToRgb(shadowColorHex, true)); // Pass true if it's an rgba value
    }

    // Fungsi konversi Hex ke RGB (atau mengambil RGB dari rgba)
    function hexToRgb(colorValue, isRgba = false) {
        if (isRgba) {
            const match = colorValue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
            if (match) {
                return `${match[1]}, ${match[2]}, ${match[3]}`;
            }
        }
        const hex = colorValue.replace('#', '');
        const shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
        const fullHex = hex.length === 3 ? hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b) : hex;
        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255'; // Default ke putih jika gagal
    }
    
    // Inisialisasi presentasi
    function initializePresentation() {
        createDots(); 
        updateSlidePosition();
        updateColorRGBVariables();
        loadTheme();
        slidesContainer.style.width = `${totalSlides * 100}%`;
        slides.forEach(slide => slide.style.width = `${100 / totalSlides}%`);
    }

    // Membuat titik-titik navigasi
    function createDots() {
        dotsNavigation.innerHTML = ''; 
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.setAttribute('data-slide', index);
            dot.setAttribute('aria-label', `Ke Slide ${index + 1}`);
            dotsNavigation.appendChild(dot);
        });
        document.querySelectorAll('.dots-navigation .dot').forEach(dot => {
            dot.addEventListener('click', function() {
                currentSlide = parseInt(this.getAttribute('data-slide'));
                updateSlidePosition();
            });
        });
    }
    
    // Navigasi ke slide tertentu
    function goToSlide(slideIndex) {
        if (slideIndex >= 0 && slideIndex < totalSlides) {
            currentSlide = slideIndex;
            updateSlidePosition();
        }
    }

    // Navigasi ke slide berikutnya
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlidePosition();
        }
    }
    
    // Navigasi ke slide sebelumnya
    function previousSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlidePosition();
        }
    }
    
    // Memperbarui posisi slide dan elemen terkait
    function updateSlidePosition() {
        slidesContainer.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;
        
        const dots = document.querySelectorAll('.dots-navigation .dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        slides.forEach((slide, index) => {
            const isActive = index === currentSlide;
            slide.classList.toggle('active', isActive);
            // Fokus pada slide aktif untuk aksesibilitas keyboard
            if (isActive) {
                slide.setAttribute('tabindex', '-1'); // Memungkinkan fokus programatik
                // slide.focus(); // Bisa terlalu agresif, pertimbangkan UX
                setTimeout(() => {
                    animateStaggeredItems(slide);
                    if (slide.id === 'slide-2') { 
                        animateExamples(slide);
                    }
                }, 350); // Penundaan sedikit lebih lama untuk transisi slide yang lebih smooth
            } else {
                slide.removeAttribute('tabindex');
                resetAnimations(slide);
            }
        });
        
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;

        slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== currentSlide);
        });
        if (slides[currentSlide]) { // Pastikan slide ada
            slides[currentSlide].removeAttribute('aria-hidden');
        }
    }

    // Menerapkan animasi bertahap untuk item di slide saat ini
    function animateStaggeredItems(currentSlideElement) {
        const staggeredItems = currentSlideElement.querySelectorAll('.staggered-item');
        staggeredItems.forEach((item, index) => {
            item.style.animation = 'none';
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px) scale(0.95) rotateX(-10deg)';
            item.style.filter = 'blur(2px)';
            
            const delay = parseFloat(item.style.animationDelay) || (index * 120); // Penundaan lebih cepat dan dinamis
            
            requestAnimationFrame(() => {
                 setTimeout(() => {
                    item.style.transition = `opacity 0.7s ${delay}ms cubic-bezier(0.23, 1, 0.32, 1), transform 0.7s ${delay}ms cubic-bezier(0.23, 1, 0.32, 1), filter 0.7s ${delay}ms cubic-bezier(0.23, 1, 0.32, 1)`;
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
                    item.style.filter = 'blur(0)';
                }, 50); 
            });
        });
    }
    
    // Menerapkan animasi untuk contoh-contoh di slide Passive Voice
    function animateExamples(currentSlideElement) {
        const examples = currentSlideElement.querySelectorAll('.animate-example');
        examples.forEach((example, index) => {
            const paragraphs = example.querySelectorAll('p');
            paragraphs.forEach((p, pIndex) => {
                p.style.animation = 'none'; 
                p.style.opacity = '0';
                p.style.transform = 'translateX(-20px) skewX(-8deg)';
                p.style.filter = 'blur(2.5px)';

                const delay = (index * 350) + (pIndex * 80) + 250; 

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        p.style.animation = `slideInTextEnhancedV2 0.9s ${delay}ms cubic-bezier(0.165, 0.84, 0.44, 1) forwards`;
                    }, 50);
                });
            });
        });
    }

    // Fungsi untuk mereset animasi pada slide yang tidak aktif
    function resetAnimations(slideElement) {
        const staggeredItems = slideElement.querySelectorAll('.staggered-item');
        staggeredItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px) scale(0.95) rotateX(-10deg)';
            item.style.filter = 'blur(2px)';
            item.style.transition = 'none'; 
        });
        const examples = slideElement.querySelectorAll('.animate-example p');
        examples.forEach(p => {
            p.style.opacity = '0';
            p.style.transform = 'translateX(-20px) skewX(-8deg)';
            p.style.filter = 'blur(2.5px)';
            p.style.animation = 'none'; 
        });
    }

    // Mengganti tema (gelap/terang)
    function toggleTheme() {
        const isDarkModeCurrently = document.body.classList.contains('dark-theme');
        document.body.classList.toggle('dark-theme');
        const isDarkModeAfterToggle = document.body.classList.contains('dark-theme');
        
        localStorage.setItem('theme', isDarkModeAfterToggle ? 'dark' : 'light');
        updateColorRGBVariables(); 

        // Trigger reflow to ensure transition on theme toggle is smooth for all elements
        // This can be intensive, use with caution or target specific elements if performance issues arise
        // void document.body.offsetWidth; 
    }

    // Memuat tema dari localStorage
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        updateColorRGBVariables();
    }

    // Event Listener untuk Tombol
    prevBtn.addEventListener('click', previousSlide);
    nextBtn.addEventListener('click', nextSlide);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Event Listener untuk Navigasi Topik di Halaman Selamat Datang
    const topicsList = document.querySelectorAll('.welcome-topics li');
    topicsList.forEach(topic => {
        topic.addEventListener('click', function() {
            const targetSlideIndex = parseInt(this.getAttribute('data-target-slide'));
            if (!isNaN(targetSlideIndex) && targetSlideIndex >= 0 && targetSlideIndex < totalSlides) {
                 // Slide index di HTML adalah 1-based, array adalah 0-based.
                 // Jika data-target-slide="1" (untuk Passive Voice), itu adalah slides[1]
                goToSlide(targetSlideIndex);
            }
        });
    });
    
    // Navigasi Keyboard
    document.addEventListener('keydown', function(e) {
        // Hindari navigasi jika fokus ada di input, textarea, dll.
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
            return;
        }

        switch (e.key) {
            case 'ArrowRight':
            case 'PageDown':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
        }
    });

    // Navigasi Swipe untuk Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 55; 

    slidesContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slidesContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        if (swipeDistance < -swipeThreshold) { 
            nextSlide();
        } else if (swipeDistance > swipeThreshold) { 
            previousSlide();
        }
    }
    
    // Menangani resize window untuk menjaga konsistensi layout
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            slidesContainer.style.width = `${totalSlides * 100}%`;
            slides.forEach(slide => slide.style.width = `${100 / totalSlides}%`);
            // Force no transition during resize adjustment
            slidesContainer.style.transition = 'none';
            slidesContainer.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;
            // Restore transition after adjustment
            // Use a micro-timeout to ensure the 'none' transition is applied before restoring
            setTimeout(() => {
                slidesContainer.style.transition = 'transform var(--transition-speed-slow) cubic-bezier(0.645, 0.045, 0.355, 1)';
            }, 50);
        }, 100); // Debounce resize event
    });

    // Panggil inisialisasi saat DOM siap
    initializePresentation();
});
