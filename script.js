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
        const getCssVar = (name) => rootStyle.getPropertyValue(name).trim();

        // Mendapatkan nilai warna hex dari variabel CSS
        const primaryColorHex = getCssVar('--primary-color');
        const secondaryColorHex = getCssVar('--secondary-color');
        const accentColorHex = getCssVar('--accent-color');
        const textColorHex = getCssVar('--text-color');
        const cardBgHex = getCssVar('--card-bg');
        // Mengambil shadow color yang mungkin dalam format rgba
        const shadowColorRaw = getCssVar('--shadow-color');

        // Mengatur variabel CSS baru untuk komponen RGB dari warna
        document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(primaryColorHex));
        document.documentElement.style.setProperty('--secondary-color-rgb', hexToRgb(secondaryColorHex));
        document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(accentColorHex));
        document.documentElement.style.setProperty('--text-color-rgb', hexToRgb(textColorHex));
        document.documentElement.style.setProperty('--card-bg-rgb', hexToRgb(cardBgHex));
        // Jika shadowColorRaw adalah rgba, ekstrak RGB nya, jika tidak (misal hex), konversi ke RGB
        document.documentElement.style.setProperty('--shadow-color-rgb', extractRgbFromRgba(shadowColorRaw) || '0,0,0');
    }

    // Fungsi konversi Hex ke RGB
    function hexToRgb(hex) {
        hex = hex.replace('#', ''); // Hapus '#' jika ada
        // Konversi hex singkat (misal, #03F) ke format penuh (#0033FF)
        const shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.length === 3 ? hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b) : hex;
        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255'; // Default ke putih jika gagal
    }

    // Fungsi untuk mengekstrak bagian RGB dari nilai RGBA
    function extractRgbFromRgba(rgbaColor) {
        const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (match) {
            return `${match[1]}, ${match[2]}, ${match[3]}`;
        }
        // Jika bukan format rgba (misalnya hex atau nama warna), coba konversi
        if (rgbaColor.startsWith('#')) return hexToRgb(rgbaColor);
        return null; // Kembalikan null jika tidak bisa diproses
    }


    // Inisialisasi presentasi
    function initializePresentation() {
        createDots(); // Buat titik navigasi
        updateSlidePosition(); // Atur posisi slide awal dan update UI
        loadTheme(); // Muat tema yang tersimpan (akan memanggil updateColorRGBVariables)

        // Mengatur lebar kontainer slide dan masing-masing slide agar sesuai dengan jumlah total slide
        slidesContainer.style.width = `${totalSlides * 100}%`;
        slides.forEach(slide => slide.style.width = `${100 / totalSlides}%`);
    }

    // Membuat titik-titik navigasi berdasarkan jumlah slide
    function createDots() {
        dotsNavigation.innerHTML = ''; // Kosongkan kontainer titik navigasi
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.setAttribute('data-slide', index); // Simpan indeks slide di atribut data
            dot.setAttribute('aria-label', `Ke Slide ${index + 1}`); // Label untuk aksesibilitas
            dotsNavigation.appendChild(dot);
        });
        // Tambahkan event listener untuk setiap titik navigasi
        document.querySelectorAll('.dots-navigation .dot').forEach(dot => {
            dot.addEventListener('click', function() {
                currentSlide = parseInt(this.getAttribute('data-slide')); // Pergi ke slide yang diklik
                updateSlidePosition();
            });
        });
    }

    // Navigasi ke slide tertentu berdasarkan indeks
    function goToSlide(slideIndex) {
        if (slideIndex >= 0 && slideIndex < totalSlides) { // Pastikan indeks valid
            currentSlide = slideIndex;
            updateSlidePosition();
        }
    }

    // Navigasi ke slide berikutnya
    function nextSlide() {
        if (currentSlide < totalSlides - 1) { // Jika bukan slide terakhir
            currentSlide++;
            updateSlidePosition();
        }
    }

    // Navigasi ke slide sebelumnya
    function previousSlide() {
        if (currentSlide > 0) { // Jika bukan slide pertama
            currentSlide--;
            updateSlidePosition();
        }
    }

    // Memperbarui posisi slide dan elemen terkait (tombol, titik navigasi, animasi)
    function updateSlidePosition() {
        // Geser kontainer slide secara horizontal
        slidesContainer.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;

        // Perbarui status aktif titik navigasi
        const dots = document.querySelectorAll('.dots-navigation .dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        // Perbarui status aktif slide dan jalankan animasi
        slides.forEach((slide, index) => {
            const isActive = index === currentSlide;
            slide.classList.toggle('active', isActive);
            if (isActive) {
                slide.setAttribute('tabindex', '-1'); // Fokus ke slide aktif untuk aksesibilitas
                // Jalankan animasi setelah transisi slide selesai
                // Penundaan sedikit lebih pendek dari transisi slide agar animasi elemen mulai sebelum slide berhenti total
                setTimeout(() => {
                    animateStaggeredItems(slide); // Jalankan animasi item bertahap
                    if (slide.id === 'slide-3') { // Jika slide Passive Voice
                        animateExamples(slide); // Jalankan animasi contoh
                    }
                }, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-speed-slow').replace('s','')) * 1000 * 0.4); // Mulai animasi elemen sedikit lebih awal
            } else {
                slide.removeAttribute('tabindex');
                resetAnimations(slide); // Reset animasi pada slide yang tidak aktif
            }
            slide.setAttribute('aria-hidden', !isActive); // Atribut ARIA untuk aksesibilitas
        });

        // Nonaktifkan tombol "Previous" di slide pertama dan "Next" di slide terakhir
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }

    // Menerapkan animasi bertahap untuk item di slide saat ini
    function animateStaggeredItems(currentSlideElement) {
        const staggeredItems = currentSlideElement.querySelectorAll('.staggered-item');
        staggeredItems.forEach((item, index) => {
            // Reset style sebelum animasi untuk memastikan animasi berjalan setiap kali slide aktif
            item.style.transition = 'none'; // Hapus transisi sementara untuk reset instan
            item.style.opacity = '0';

            // Tentukan transform awal berdasarkan ID slide untuk variasi animasi
            let initialTransform = 'translateY(60px) scale(0.90) perspective(1000px) rotateX(-15deg) rotateY(5deg)';
            let initialFilter = 'blur(4px)';

            if (currentSlideElement.id === 'slide-1') { // Slide selamat datang
                initialTransform = 'translateY(70px) scale(0.85) perspective(800px) rotateX(-20deg) rotateY(8deg)';
                initialFilter = 'blur(5px)';
            } else if (currentSlideElement.id === 'slide-7' || currentSlideElement.id === 'slide-6') { // Slide terima kasih & pertanyaan
                 initialTransform = 'translateY(80px) scale(0.80) perspective(1200px) rotateX(-25deg) rotateY(0deg)';
                 initialFilter = 'blur(6px)';
            }

            item.style.transform = initialTransform;
            item.style.filter = initialFilter;

            // Ambil delay dari atribut style HTML jika ada, atau default ke 0
            const baseDelayFromHTML = parseFloat(item.style.animationDelay) || 0;
            // Delay dinamis per item, bisa disesuaikan untuk efek bertahap yang lebih terasa
            const dynamicDelayIncrement = 120; //ms
            const totalDelay = (baseDelayFromHTML * 1000) + (index * dynamicDelayIncrement);

            requestAnimationFrame(() => { // Gunakan requestAnimationFrame untuk performa animasi yang lebih baik
                 setTimeout(() => {
                    // Terapkan transisi untuk animasi masuk yang halus
                    const animationDuration = '0.9s'; // Durasi animasi lebih lama
                    const animationEasing = 'cubic-bezier(0.165, 0.84, 0.44, 1)'; // Easing yang lebih 'smooth'

                    item.style.transition = `opacity ${animationDuration} ${animationEasing}, transform ${animationDuration} ${animationEasing}, filter ${animationDuration} ease-out`;
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0) scale(1) perspective(1000px) rotateX(0deg) rotateY(0deg)'; // Transform akhir
                    item.style.filter = 'blur(0)'; // Hapus blur
                }, totalDelay); // Terapkan total delay di sini
            });
        });
    }

    // Menerapkan animasi untuk contoh-contoh di slide Passive Voice
    function animateExamples(currentSlideElement) {
        const examples = currentSlideElement.querySelectorAll('.animate-example');
        examples.forEach((example, index) => {
            const paragraphs = example.querySelectorAll('p');
            paragraphs.forEach((p, pIndex) => {
                // Reset style sebelum animasi
                p.style.animation = 'none'; // Hapus animasi CSS sebelumnya
                p.style.opacity = '0';
                p.style.transform = 'translateX(-40px) skewX(-15deg) rotate(-3deg)'; // Atur ke state awal keyframe
                p.style.filter = 'blur(5px)';


                const delay = (index * 450) + (pIndex * 150) + 350; // Penundaan yang disesuaikan untuk setiap paragraf

                requestAnimationFrame(() => {
                     setTimeout(() => {
                        // Terapkan animasi CSS yang telah didefinisikan di style.css
                        p.style.animation = `slideInTextEnhancedV2 1.1s ${delay}ms cubic-bezier(0.165, 0.84, 0.44, 1.01) forwards`; // Easing dengan sedikit overshoot
                    }, 50); // Penundaan kecil untuk memastikan reset gaya diterapkan sebelum animasi dimulai
                });
            });
        });
    }

    // Fungsi untuk mereset animasi pada slide yang tidak aktif
    function resetAnimations(slideElement) {
        const staggeredItems = slideElement.querySelectorAll('.staggered-item');
        staggeredItems.forEach(item => {
            item.style.transition = 'none'; // Hapus transisi agar reset instan
            item.style.opacity = '0';
            // Kembalikan ke transform dan filter awal yang sesuai dengan animasi masuknya
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

        const exampleParagraphs = slideElement.querySelectorAll('.animate-example p');
        exampleParagraphs.forEach(p => {
            p.style.animation = 'none'; // Hapus animasi CSS
            p.style.opacity = '0';
            p.style.transform = 'translateX(-40px) skewX(-15deg) rotate(-3deg)'; // Reset ke initial state keyframe
            p.style.filter = 'blur(5px)';
        });
    }


    // Mengganti tema (gelap/terang)
    function toggleTheme() {
        document.body.classList.toggle('dark-theme'); // Toggle kelas 'dark-theme' pada body
        const isDarkModeAfterToggle = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDarkModeAfterToggle ? 'dark' : 'light'); // Simpan preferensi tema
        updateColorRGBVariables(); // Perbarui variabel warna setelah tema berubah
    }

    // Memuat tema dari localStorage saat halaman dimuat
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme'); // Pastikan tema terang jika tidak ada yang tersimpan atau 'light'
        }
        updateColorRGBVariables(); // Perbarui variabel warna saat tema dimuat
    }

    // Event Listener untuk Tombol Navigasi dan Tema
    prevBtn.addEventListener('click', previousSlide);
    nextBtn.addEventListener('click', nextSlide);
    themeToggle.addEventListener('click', toggleTheme);

    // Event Listener untuk Navigasi Topik di Halaman Selamat Datang
    const topicsList = document.querySelectorAll('.welcome-topics li');
    topicsList.forEach(topic => {
        topic.addEventListener('click', function() {
            const targetSlideIndex = parseInt(this.getAttribute('data-target-slide')); // Ambil indeks slide target
             if (!isNaN(targetSlideIndex) && targetSlideIndex >= 0 && targetSlideIndex < totalSlides) {
                goToSlide(targetSlideIndex); // Indeks sudah benar (0-based)
            }
        });
    });

    // Navigasi Keyboard (Panah, PageUp/Down, Home, End)
    document.addEventListener('keydown', function(e) {
        const activeElement = document.activeElement;
        // Abaikan input keyboard jika fokus ada di elemen input/textarea
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
            return;
        }

        switch (e.key) {
            case 'ArrowRight':
            case 'PageDown':
                e.preventDefault(); // Cegah default scroll halaman
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0); // Ke slide pertama
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1); // Ke slide terakhir
                break;
        }
    });

    // Navigasi Swipe untuk Perangkat Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50; // Jarak minimum swipe agar dianggap valid

    slidesContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX; // Catat posisi awal sentuhan
    }, { passive: true }); // passive: true untuk performa scroll yang lebih baik

    slidesContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX; // Catat posisi akhir sentuhan
        handleSwipe(); // Proses swipe
    });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        if (swipeDistance < -swipeThreshold) { // Swipe ke kiri
            nextSlide();
        } else if (swipeDistance > swipeThreshold) { // Swipe ke kanan
            previousSlide();
        }
    }

    // Menangani perubahan ukuran window (resize)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout); // Hapus timeout sebelumnya jika ada (debounce)
        resizeTimeout = setTimeout(() => {
            // Atur ulang lebar kontainer slide dan masing-masing slide
            slidesContainer.style.width = `${totalSlides * 100}%`;
            slides.forEach(slide => slide.style.width = `${100 / totalSlides}%`);

            // Simpan transisi asli agar bisa dikembalikan
            const originalTransition = slidesContainer.style.transition;
            slidesContainer.style.transition = 'none'; // Hapus transisi sementara agar perubahan instan
            // Atur ulang transform translateX agar slide saat ini tetap terlihat dengan benar
            slidesContainer.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;

            // Paksa reflow jika perlu (kadang browser butuh 'dorongan' untuk update)
            // void slidesContainer.offsetWidth;

            // Kembalikan transisi asli setelah jeda singkat
            setTimeout(() => {
                slidesContainer.style.transition = originalTransition;
            }, 50);
        }, 150); // Debounce dengan jeda 150ms
    });


    // Panggil fungsi inisialisasi saat DOM (Document Object Model) telah sepenuhnya dimuat
    initializePresentation();
});
