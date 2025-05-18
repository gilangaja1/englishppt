document.addEventListener('DOMContentLoaded', function() {
    // Pemilihan Elemen DOM
    const slidesContainer = document.getElementById('slidesContainer');
    const slides = Array.from(document.querySelectorAll('.slide'));
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsNavigation = document.getElementById('dots');
    const themeToggle = document.getElementById('themeToggle');
    const progressBar = document.getElementById('progressBar'); 

    let currentSlide = 0;
    const totalSlides = slides.length;
    let previousSlideIndex = 0; // Variabel untuk melacak slide sebelumnya

    // Fungsi untuk memperbarui variabel CSS RGB dari warna hex
    function updateColorRGBVariables() {
        const rootStyle = getComputedStyle(document.documentElement);
        const getCssVar = (name) => rootStyle.getPropertyValue(name).trim();
        const primaryColorHex = getCssVar('--primary-color');
        const secondaryColorHex = getCssVar('--secondary-color');
        const accentColorHex = getCssVar('--accent-color');
        const textColorHex = getCssVar('--text-color');
        const cardBgHex = getCssVar('--card-bg');
        const shadowColorRaw = getCssVar('--shadow-color');

        document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(primaryColorHex));
        document.documentElement.style.setProperty('--secondary-color-rgb', hexToRgb(secondaryColorHex));
        document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(accentColorHex));
        document.documentElement.style.setProperty('--text-color-rgb', hexToRgb(textColorHex));
        document.documentElement.style.setProperty('--card-bg-rgb', hexToRgb(cardBgHex));
        document.documentElement.style.setProperty('--shadow-color-rgb', extractRgbFromRgba(shadowColorRaw) || '0,0,0');
    }

    // Fungsi konversi Hex ke RGB
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        const shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.length === 3 ? hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b) : hex;
        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255';
    }

    // Fungsi untuk mengekstrak bagian RGB dari nilai RGBA
    function extractRgbFromRgba(rgbaColor) {
        const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (match) {
            return `${match[1]}, ${match[2]}, ${match[3]}`;
        }
        if (rgbaColor.startsWith('#')) return hexToRgb(rgbaColor);
        return null;
    }

    // Inisialisasi presentasi
    function initializePresentation() {
        previousSlideIndex = currentSlide; // Inisialisasi previousSlideIndex
        createDots(); 
        updateSlidePosition(); 
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
                const targetSlide = parseInt(this.getAttribute('data-slide'));
                if (targetSlide !== currentSlide) { // Hanya pindah jika slide berbeda
                    previousSlideIndex = currentSlide; // Set sebelum mengubah currentSlide
                    currentSlide = targetSlide;
                    updateSlidePosition();
                }
            });
        });
    }

    // Navigasi ke slide tertentu berdasarkan indeks
    function goToSlide(slideIndex) {
        if (slideIndex >= 0 && slideIndex < totalSlides && slideIndex !== currentSlide) { 
            previousSlideIndex = currentSlide; // Set sebelum mengubah currentSlide
            currentSlide = slideIndex;
            updateSlidePosition();
        } else if (slideIndex === currentSlide) {
            // Jika mengklik dot slide yang sedang aktif, putar ulang animasi elemennya
            const activeSlideElement = slides[currentSlide];
            if (activeSlideElement) {
                activeSlideElement.scrollTop = 0;
                 // Reset animasi konten slide sebelum memutarnya lagi
                resetAnimations(activeSlideElement);
                // Tambahkan sedikit penundaan sebelum memulai animasi lagi untuk memastikan reset diterapkan
                setTimeout(() => {
                    animateStaggeredItems(activeSlideElement);
                    if (activeSlideElement.id === 'slide-3') { // Jika slide Passive Voice
                        animateExamples(activeSlideElement);
                    }
                }, 50); // Penundaan singkat
            }
        }
    }

    // Navigasi ke slide berikutnya
    function nextSlide() {
        if (currentSlide < totalSlides - 1) { 
            previousSlideIndex = currentSlide; // Set sebelum mengubah currentSlide
            currentSlide++;
            updateSlidePosition();
        }
    }

    // Navigasi ke slide sebelumnya
    function previousSlide() {
        if (currentSlide > 0) { 
            previousSlideIndex = currentSlide; // Set sebelum mengubah currentSlide
            currentSlide--;
            updateSlidePosition();
        }
    }

    // Memperbarui progress bar
    function updateProgressBar() {
        if (progressBar) { 
            const progressPercentage = totalSlides > 1 ? ((currentSlide + 1) / totalSlides) * 100 : 100;
            progressBar.style.width = `${progressPercentage}%`;
        }
    }

    // Memperbarui posisi slide dan elemen terkait
    function updateSlidePosition() {
        const oldIndex = previousSlideIndex;

        // Geser kontainer slide secara horizontal (membawa "slot" slide ke tengah)
        slidesContainer.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;

        slides.forEach((slide, index) => {
            // Hapus semua kelas persiapan flip terlebih dahulu
            slide.classList.remove('active', 'prepare-flip-right', 'prepare-flip-left');
        });

        const currentActiveSlide = slides[currentSlide];
        const oldActiveSlide = slides[oldIndex];

        // Tangani slide yang lama (jika ada dan berbeda dari yang baru)
        if (oldActiveSlide && oldIndex !== currentSlide) {
            // Tidak perlu kelas khusus untuk keluar, karena .slide (tanpa .active) sudah opacity: 0
            // Transisi CSS akan menanganinya secara otomatis saat .active dihapus
        }
        
        // Tangani slide yang baru
        if (currentActiveSlide) {
            if (oldIndex === currentSlide && !currentActiveSlide.classList.contains('active')) {
                // Kasus inisialisasi atau jika slide yang sama diaktifkan lagi (misal via dot)
                // Tidak ada animasi flip, langsung aktifkan
            } else if (currentSlide > oldIndex) { // Pindah ke slide berikutnya
                currentActiveSlide.classList.add('prepare-flip-right');
            } else if (currentSlide < oldIndex) { // Pindah ke slide sebelumnya
                currentActiveSlide.classList.add('prepare-flip-left');
            }
            // else: oldIndex === currentSlide, dan sudah active, tidak perlu prepare

            // Paksa reflow agar browser menerapkan state 'prepare-flip-*' sebelum menambahkan 'active'
            void currentActiveSlide.offsetWidth;

            currentActiveSlide.classList.add('active'); // Ini akan memicu transisi dari 'prepare-flip-*' ke state 'active'

            // Atur animasi konten di dalam slide (staggered items)
            // Pastikan ini terjadi SETELAH animasi flip slide utama selesai atau hampir selesai
            if (currentActiveSlide.classList.contains('active')) {
                currentActiveSlide.scrollTop = 0;
                currentActiveSlide.setAttribute('tabindex', '-1');
                
                // Reset animasi konten pada slide yang akan aktif
                resetAnimations(currentActiveSlide);

                const slideTransitionDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-speed-normal').replace('s', '')) * 1000;
                
                setTimeout(() => {
                    animateStaggeredItems(currentActiveSlide); 
                    if (currentActiveSlide.id === 'slide-3') { 
                        animateExamples(currentActiveSlide); 
                    }
                }, slideTransitionDuration * 0.8); // Mulai animasi konten sedikit sebelum flip selesai total
            }
        }
        
        // Reset animasi untuk slide yang tidak aktif (termasuk yang baru saja ditinggalkan)
        slides.forEach((slide, index) => {
            if (index !== currentSlide) {
                slide.removeAttribute('tabindex');
                resetAnimations(slide); // Reset animasi kontennya
                slide.setAttribute('aria-hidden', 'true');
            } else {
                slide.setAttribute('aria-hidden', 'false');
            }
        });


        // Perbarui UI lainnya
        updateProgressBar();
        const dots = document.querySelectorAll('.dots-navigation .dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;

        // Simpan slide saat ini sebagai slide sebelumnya untuk transisi berikutnya
        // Ini sudah ditangani di nextSlide, previousSlide, goToSlide
    }

    // Menerapkan animasi bertahap untuk item di slide saat ini
    function animateStaggeredItems(currentSlideElement) {
        // Pastikan hanya menganimasi konten dari .slide-content, bukan .slide itu sendiri
        const slideContent = currentSlideElement.querySelector('.slide-content');
        if (!slideContent) return;

        const staggeredItems = slideContent.querySelectorAll('.staggered-item');
        staggeredItems.forEach((item, index) => {
            item.style.transition = 'none'; 
            item.style.opacity = '0';

            let initialTransform = 'translateY(60px) scale(0.90) perspective(1000px) rotateX(-15deg) rotateY(5deg)';
            let initialFilter = 'blur(4px)';

            if (currentSlideElement.id === 'slide-1') { 
                initialTransform = 'translateY(70px) scale(0.85) perspective(800px) rotateX(-20deg) rotateY(8deg)';
                initialFilter = 'blur(5px)';
            } else if (currentSlideElement.id === 'slide-7' || currentSlideElement.id === 'slide-6') { 
                 initialTransform = 'translateY(80px) scale(0.80) perspective(1200px) rotateX(-25deg) rotateY(0deg)';
                 initialFilter = 'blur(6px)';
            }

            item.style.transform = initialTransform;
            item.style.filter = initialFilter;

            const baseDelayFromHTML = parseFloat(item.style.animationDelay) || 0;
            const dynamicDelayIncrement = 120; 
            const totalDelay = (baseDelayFromHTML * 1000) + (index * dynamicDelayIncrement);

            requestAnimationFrame(() => { 
                 setTimeout(() => {
                    const animationDuration = '0.9s'; 
                    const animationEasing = 'cubic-bezier(0.165, 0.84, 0.44, 1)'; 

                    item.style.transition = `opacity ${animationDuration} ${animationEasing}, transform ${animationDuration} ${animationEasing}, filter ${animationDuration} ease-out`;
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0) scale(1) perspective(1000px) rotateX(0deg) rotateY(0deg)'; 
                    item.style.filter = 'blur(0)'; 
                }, totalDelay); 
            });
        });
    }

    // Menerapkan animasi untuk contoh-contoh di slide Passive Voice
    function animateExamples(currentSlideElement) {
        const slideContent = currentSlideElement.querySelector('.slide-content');
        if (!slideContent) return;

        const examples = slideContent.querySelectorAll('.animate-example');
        examples.forEach((example, index) => {
            const paragraphs = example.querySelectorAll('p');
            paragraphs.forEach((p, pIndex) => {
                p.style.animation = 'none'; 
                p.style.opacity = '0';
                p.style.transform = 'translateX(-40px) skewX(-15deg) rotate(-3deg)'; 
                p.style.filter = 'blur(5px)';

                const delay = (index * 450) + (pIndex * 150) + 350; 

                requestAnimationFrame(() => {
                     setTimeout(() => {
                        p.style.animation = `slideInTextEnhancedV2 1.1s ${delay}ms cubic-bezier(0.165, 0.84, 0.44, 1.01) forwards`; 
                    }, 50); 
                });
            });
        });
    }

    // Fungsi untuk mereset animasi pada slide yang tidak aktif
    function resetAnimations(slideElement) {
        const slideContent = slideElement.querySelector('.slide-content');
        if (!slideContent) return;

        const staggeredItems = slideContent.querySelectorAll('.staggered-item');
        staggeredItems.forEach(item => {
            item.style.transition = 'none'; 
            item.style.opacity = '0';
            let initialTransform = 'translateY(60px) scale(0.90) perspective(1000px) rotateX(-15deg) rotateY(5deg)';
            let initialFilter = 'blur(4px)';
            if (slideElement.id === 'slide-1') {
                initialTransform = 'translateY(70px) scale(0.85) perspective(800px) rotateX(-20deg) rotateY(8deg)';
                initialFilter = 'blur(5px)';
            } else if (slideElement.id === 'slide-7' || slideElement.id === 'slide-6') {
                 initialTransform = 'translateY(80px) scale(0.80) perspective(1200px) rotateX(-25deg) rotateY(0deg)';
                 initialFilter = 'blur(6px)';
            }
            item.style.transform = initialTransform;
            item.style.filter = initialFilter;
        });

        const exampleParagraphs = slideContent.querySelectorAll('.animate-example p');
        exampleParagraphs.forEach(p => {
            p.style.animation = 'none'; 
            p.style.opacity = '0';
            p.style.transform = 'translateX(-40px) skewX(-15deg) rotate(-3deg)'; 
            p.style.filter = 'blur(5px)';
        });
    }


    // Mengganti tema (gelap/terang)
    function toggleTheme() {
        document.body.classList.toggle('dark-theme'); 
        const isDarkModeAfterToggle = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDarkModeAfterToggle ? 'dark' : 'light'); 
        updateColorRGBVariables(); 
    }

    // Memuat tema dari localStorage saat halaman dimuat
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme'); 
        }
        updateColorRGBVariables(); 
    }

    // Event Listener untuk Tombol Navigasi dan Tema
    prevBtn.addEventListener('click', previousSlide);
    nextBtn.addEventListener('click', nextSlide);
    themeToggle.addEventListener('click', toggleTheme);

    // Event Listener untuk Navigasi Topik di Halaman Selamat Datang
    const topicsList = document.querySelectorAll('.welcome-topics li');
    topicsList.forEach(topic => {
        topic.addEventListener('click', function() {
            const targetSlideIndex = parseInt(this.getAttribute('data-target-slide')); 
             if (!isNaN(targetSlideIndex) && targetSlideIndex >= 0 && targetSlideIndex < totalSlides) {
                goToSlide(targetSlideIndex); 
            }
        });
    });

    // Navigasi Keyboard (Panah, PageUp/Down, Home, End)
    document.addEventListener('keydown', function(e) {
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
    
    // Menangani perubahan ukuran window (resize)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout); 
        resizeTimeout = setTimeout(() => {
            slidesContainer.style.width = `${totalSlides * 100}%`;
            slides.forEach(slide => slide.style.width = `${100 / totalSlides}%`);

            const originalTransition = slidesContainer.style.transition;
            slidesContainer.style.transition = 'none'; 
            slidesContainer.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;
            
            setTimeout(() => {
                slidesContainer.style.transition = originalTransition;
            }, 50);
        }, 150); 
    });

    initializePresentation();
});
