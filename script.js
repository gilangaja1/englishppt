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
        // Fungsi bantuan untuk mendapatkan dan memotong variabel CSS dengan aman
        const getCssVar = (name) => rootStyle.getPropertyValue(name).trim();

        const primaryColorHex = getCssVar('--primary-color');
        const secondaryColorHex = getCssVar('--secondary-color');
        const accentColorHex = getCssVar('--accent-color');
        const textColorHex = getCssVar('--text-color');
        const cardBgHex = getCssVar('--card-bg');
        const shadowColorHex = getCssVar('--shadow-color'); // Mengasumsikan warna bayangan mungkin diperlukan dalam RGB

        document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(primaryColorHex));
        document.documentElement.style.setProperty('--secondary-color-rgb', hexToRgb(secondaryColorHex));
        document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(accentColorHex));
        document.documentElement.style.setProperty('--text-color-rgb', hexToRgb(textColorHex));
        document.documentElement.style.setProperty('--card-bg-rgb', hexToRgb(cardBgHex));
        document.documentElement.style.setProperty('--shadow-color-rgb', hexToRgb(shadowColorHex, true)); // Kirim true jika ini adalah nilai rgba
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
        // Mengatur lebar kontainer slide dan masing-masing slide
        slidesContainer.style.width = `${totalSlides * 100}%`;
        slides.forEach(slide => slide.style.width = `${100 / totalSlides}%`);
    }

    // Membuat titik-titik navigasi
    function createDots() {
        dotsNavigation.innerHTML = ''; // Kosongkan titik navigasi yang ada
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.setAttribute('data-slide', index);
            dot.setAttribute('aria-label', `Ke Slide ${index + 1}`);
            dotsNavigation.appendChild(dot);
        });
        // Tambahkan event listener ke setiap titik navigasi
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
        // Menggeser kontainer slide
        slidesContainer.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;

        // Memperbarui status aktif titik navigasi
        const dots = document.querySelectorAll('.dots-navigation .dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        // Memperbarui status aktif slide dan animasi
        slides.forEach((slide, index) => {
            const isActive = index === currentSlide;
            slide.classList.toggle('active', isActive);
            // Fokus pada slide aktif untuk aksesibilitas keyboard dan animasi
            if (isActive) {
                slide.setAttribute('tabindex', '-1'); // Memungkinkan fokus programatik
                // Menjalankan animasi setelah transisi slide selesai
                setTimeout(() => {
                    animateStaggeredItems(slide);
                    if (slide.id === 'slide-3') { // Animasi contoh untuk slide Passive Voice
                        animateExamples(slide);
                    }
                }, 350); // Penundaan untuk transisi slide
            } else {
                slide.removeAttribute('tabindex');
                resetAnimations(slide); // Reset animasi pada slide yang tidak aktif
            }
            slide.setAttribute('aria-hidden', !isActive); // Untuk aksesibilitas
        });


        // Menonaktifkan tombol navigasi jika di slide pertama atau terakhir
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }

    // Menerapkan animasi bertahap untuk item di slide saat ini
    function animateStaggeredItems(currentSlideElement) {
        const staggeredItems = currentSlideElement.querySelectorAll('.staggered-item');
        staggeredItems.forEach((item, index) => {
            item.style.animation = 'none'; // Hapus animasi sebelumnya jika ada
            item.style.opacity = '0';
            // Atur ulang transform dan filter ke kondisi awal animasi
            const baseDelay = parseFloat(item.style.animationDelay) || 0; // Ambil delay dari HTML jika ada
            const dynamicDelay = index * 100; // Delay dinamis per item

            // Tentukan transform awal berdasarkan ID slide untuk variasi
            let initialTransform = 'translateY(40px) scale(0.93) perspective(1000px) rotateX(-12deg)';
            if (currentSlideElement.id === 'slide-1') { // Slide selamat datang
                initialTransform = 'translateY(50px) scale(0.9) perspective(800px) rotateX(-15deg)';
            } else if (currentSlideElement.id === 'slide-7') { // Slide terima kasih
                 initialTransform = 'translateY(60px) scale(0.85) perspective(1200px) rotateX(-20deg)';
            }

            item.style.transform = initialTransform;
            item.style.filter = 'blur(3px)';

            requestAnimationFrame(() => { // Gunakan rAF untuk performa lebih baik
                 setTimeout(() => {
                    // Terapkan transisi untuk animasi masuk yang halus
                    item.style.transition = `opacity 0.8s ${baseDelay + dynamicDelay}ms cubic-bezier(0.23, 1, 0.32, 1), transform 0.8s ${baseDelay + dynamicDelay}ms cubic-bezier(0.23, 1, 0.32, 1), filter 0.6s ${baseDelay + dynamicDelay}ms ease-out`;
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0) scale(1) perspective(1000px) rotateX(0deg)';
                    item.style.filter = 'blur(0)';
                }, 50); // Penundaan kecil untuk memastikan reset gaya diterapkan
            });
        });
    }

    // Menerapkan animasi untuk contoh-contoh di slide Passive Voice
    function animateExamples(currentSlideElement) {
        const examples = currentSlideElement.querySelectorAll('.animate-example');
        examples.forEach((example, index) => {
            const paragraphs = example.querySelectorAll('p');
            paragraphs.forEach((p, pIndex) => {
                p.style.animation = 'none'; // Reset animasi sebelumnya
                p.style.opacity = '0';
                // Atur ulang transform dan filter ke kondisi awal animasi
                p.style.transform = 'translateX(-30px) skewX(-12deg)';
                p.style.filter = 'blur(3.5px)';

                const delay = (index * 400) + (pIndex * 100) + 300; // Penundaan yang disesuaikan

                requestAnimationFrame(() => {
                     setTimeout(() => {
                        // Terapkan animasi CSS yang telah didefinisikan
                        p.style.animation = `slideInTextEnhancedV2 1s ${delay}ms cubic-bezier(0.165, 0.84, 0.44, 1) forwards`;
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
            item.style.transform = 'translateY(40px) scale(0.93) perspective(1000px) rotateX(-12deg)'; // Sesuaikan dengan animasi masuk
            item.style.filter = 'blur(3px)';
            item.style.transition = 'none'; // Hapus transisi agar reset instan
        });
        const exampleParagraphs = slideElement.querySelectorAll('.animate-example p');
        exampleParagraphs.forEach(p => {
            p.style.opacity = '0';
            p.style.transform = 'translateX(-30px) skewX(-12deg)'; // Sesuaikan dengan animasi masuk
            p.style.filter = 'blur(3.5px)';
            p.style.animation = 'none'; // Hapus animasi CSS
        });
    }


    // Mengganti tema (gelap/terang)
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        // Simpan preferensi tema pengguna di localStorage
        const isDarkModeAfterToggle = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDarkModeAfterToggle ? 'dark' : 'light');
        updateColorRGBVariables(); // Perbarui variabel warna setelah tema berubah
    }

    // Memuat tema dari localStorage saat halaman dimuat
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme'); // Pastikan tema terang diterapkan jika tidak ada yang tersimpan atau 'light'
        }
        updateColorRGBVariables(); // Perbarui variabel warna saat tema dimuat
    }

    // Event Listener untuk Tombol
    prevBtn.addEventListener('click', previousSlide);
    nextBtn.addEventListener('click', nextSlide);
    themeToggle.addEventListener('click', toggleTheme);

    // Event Listener untuk Navigasi Topik di Halaman Selamat Datang
    const topicsList = document.querySelectorAll('.welcome-topics li');
    topicsList.forEach(topic => {
        topic.addEventListener('click', function() {
            // data-target-slide adalah 0-indexed yang merujuk ke indeks array 'slides'
            // Slide "Our Team" adalah slide ke-2 (indeks 1)
            // Slide "Passive Voice" adalah slide ke-3 (indeks 2)
            // dst.
            const targetSlideIndex = parseInt(this.getAttribute('data-target-slide'));
             if (!isNaN(targetSlideIndex) && targetSlideIndex >= 0 && targetSlideIndex < totalSlides) {
                goToSlide(targetSlideIndex);
            }
        });
    });

    // Navigasi Keyboard (Arrow Keys, PageUp/Down, Home, End)
    document.addEventListener('keydown', function(e) {
        // Abaikan input keyboard jika fokus ada pada elemen input
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
            return;
        }

        switch (e.key) {
            case 'ArrowRight':
            case 'PageDown':
                e.preventDefault(); // Mencegah scroll default halaman
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
    const swipeThreshold = 50; // Jarak minimum swipe untuk dianggap sebagai swipe

    slidesContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true }); // { passive: true } untuk performa scroll yang lebih baik

    slidesContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        if (swipeDistance < -swipeThreshold) { // Swipe ke kiri
            nextSlide();
        } else if (swipeDistance > swipeThreshold) { // Swipe ke kanan
            previousSlide();
        }
    }

    // Menangani resize window untuk menjaga konsistensi layout
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Atur ulang lebar kontainer dan slide
            slidesContainer.style.width = `${totalSlides * 100}%`;
            slides.forEach(slide => slide.style.width = `${100 / totalSlides}%`);
            // Atur ulang transformasi tanpa animasi agar tidak terlihat aneh saat resize
            slidesContainer.style.transition = 'none';
            slidesContainer.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;
            // Kembalikan transisi setelah jeda singkat
            setTimeout(() => {
                slidesContainer.style.transition = 'transform var(--transition-speed-slow) cubic-bezier(0.645, 0.045, 0.355, 1)';
            }, 50);
        }, 100); // Debounce resize event untuk performa
    });


    // Panggil inisialisasi saat DOM siap
    initializePresentation();
});
