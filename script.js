document.addEventListener('DOMContentLoaded', () => {
    
    let swiperInstance = null;
    let currentBgIndex = 1;
    // אתחול ספריית ניתוח הצבעים
    const colorThief = new ColorThief();

    const gridContainer = document.getElementById('grid-container');
    const toggleBtn = document.getElementById('toggle-view-btn');
    const closeListBtn = document.getElementById('close-list-btn');
    const listOverlay = document.getElementById('list-overlay');

    fetch('videos.json')
        .then(res => res.json())
        .then(videos => {
            const wrapper = document.getElementById('swiper-wrapper');

            videos.forEach((video, index) => {
                const hdUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
                const mqUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;

                // --- יצירת שקופית ---
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                slide.innerHTML = `
                    <div class="slide-video-box" 
                         data-video-id="${video.id}" 
                         onclick="playVideo(this)">
                        <img src="${hdUrl}" onerror="this.src='${mqUrl}'" alt="${video.title}">
                        <div class="play-btn">
                            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                    <div class="slide-info"><h3>${video.title}</h3></div>
                `;
                wrapper.appendChild(slide);

                // --- יצירת פריט לרשימה ---
                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item');
                gridItem.innerHTML = `
                    <div class="grid-thumb"><img src="${mqUrl}" loading="lazy" alt="${video.title}"></div>
                    <h3>${video.title}</h3>
                `;
                gridItem.addEventListener('click', () => {
                    closeListView();
                    if (swiperInstance) {
                        swiperInstance.slideToLoop(index);
                        stopAllVideos();
                    }
                });
                gridContainer.appendChild(gridItem);
            });

            initSwiper();
        })
        .catch(err => console.error('Error loading videos:', err));

    // ניהול אירועים
    toggleBtn.addEventListener('click', () => { stopAllVideos(); listOverlay.classList.add('active'); });
    closeListBtn.addEventListener('click', closeListView);
    function closeListView() { listOverlay.classList.remove('active'); }

    function initSwiper() {
        swiperInstance = new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            loop: true,
            speed: 800, // מעבר איטי יותר
            coverflowEffect: { rotate: 0, stretch: 0, depth: 150, modifier: 2, slideShadows: false },
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            keyboard: { enabled: true },
            on: {
                init: function() { updateBackground(this); },
                slideChangeTransitionStart: function() { stopAllVideos(); updateBackground(this); }
            }
        });
    }

    // --- פונקציית עדכון רקע חכמה ---
    function updateBackground(swiper) {
        const activeSlide = swiper.slides[swiper.activeIndex];
        const img = activeSlide.querySelector('img');
        
        if (img) {
            // משתמשים בגרסת איכות בינונית לניתוח צבעים (פחות בעיות אבטחה בדפדפן)
            const analysisSrc = img.src.replace('maxresdefault', 'mqdefault');
            extractColorsAndApply(analysisSrc);
        }
    }

    // חילוץ צבעים והחלתם על הרקע
    function extractColorsAndApply(imgSrc) {
        // יוצרים תמונה נסתרת בזיכרון לצורך ניתוח
        const tempImg = new Image();
        tempImg.crossOrigin = "Anonymous"; // קריטי לעבודה עם תמונות חיצוניות
        tempImg.src = imgSrc;

        tempImg.onload = function() {
            try {
                // חילוץ פלטת צבעים (שני הצבעים הכי דומיננטיים)
                const palette = colorThief.getPalette(tempImg, 2);
                const color1 = `rgb(${palette[0].join(',')})`;
                const color2 = `rgb(${palette[1].join(',')})`;

                // קביעת שכבת הרקע הבאה
                const nextBgId = currentBgIndex === 1 ? 'bg-2' : 'bg-1';
                const currentBgEl = document.getElementById(currentBgIndex === 1 ? 'bg-1' : 'bg-2');
                const nextBgEl = document.getElementById(nextBgId);

                // יצירת גרדיאנט עוצמתי מהצבעים שחולצו
                nextBgEl.style.background = `
                    radial-gradient(circle at 20% 30%, ${color1} 0%, transparent 70%),
                    radial-gradient(circle at 80% 70%, ${color2} 0%, transparent 70%),
                    #050505
                `;
                
                // ביצוע המעבר (Crossfade)
                nextBgEl.classList.add('active');
                currentBgEl.classList.remove('active');
                currentBgIndex = currentBgIndex === 1 ? 2 : 1;

            } catch (e) {
                console.log('Could not extract colors, using fallback gradient.');
            }
        };
    }
});

// ניהול נגן וידאו
window.playVideo = function(container) {
    if (!container.dataset.originalHtml) container.dataset.originalHtml = container.innerHTML;
    container.classList.add('is-playing');
    const videoId = container.dataset.videoId;
    container.innerHTML = `<iframe class="youtube-iframe" src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    container.onclick = null;
};

window.stopAllVideos = function() {
    document.querySelectorAll('.slide-video-box.is-playing').forEach(container => {
        if (container.dataset.originalHtml) container.innerHTML = container.dataset.originalHtml;
        container.classList.remove('is-playing');
        container.onclick = function() { playVideo(this); };
    });
};
