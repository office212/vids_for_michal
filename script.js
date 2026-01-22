document.addEventListener('DOMContentLoaded', () => {
    
    let swiperInstance = null;
    let currentBgIndex = 1; // כדי לדעת איזה רקע פעיל כרגע

    const gridContainer = document.getElementById('grid-container');
    const toggleBtn = document.getElementById('toggle-view-btn');
    const closeListBtn = document.getElementById('close-list-btn');
    const listOverlay = document.getElementById('list-overlay');

    fetch('videos.json')
        .then(res => res.json())
        .then(videos => {
            const wrapper = document.getElementById('swiper-wrapper');

            videos.forEach((video, index) => {
                // שימוש ב-HD לתמונה הראשית
                const hdUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
                const mqUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;

                // 1. יצירת שקופית לגלגל (Swiper)
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                
                // הזרקת המבנה - וידאו לחוד וכותרת לחוד
                slide.innerHTML = `
                    <div class="slide-video-box" onclick="playVideo(this, '${video.id}')">
                        <img src="${hdUrl}" 
                             onerror="this.src='${mqUrl}'" 
                             alt="${video.title}">
                        <div class="play-btn">
                            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                    <div class="slide-info">
                        <h3>${video.title}</h3>
                    </div>
                `;
                wrapper.appendChild(slide);

                // 2. יצירת פריט לרשימה (Grid)
                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item');
                gridItem.innerHTML = `
                    <div class="grid-thumb">
                         <img src="${mqUrl}" loading="lazy" alt="${video.title}">
                    </div>
                    <h3>${video.title}</h3>
                `;
                
                gridItem.addEventListener('click', () => {
                    closeListView();
                    if (swiperInstance) swiperInstance.slideToLoop(index);
                });
                gridContainer.appendChild(gridItem);
            });

            initSwiper();
        })
        .catch(err => console.error('Error loading videos:', err));

    // ניהול תצוגת רשימה
    toggleBtn.addEventListener('click', () => listOverlay.classList.add('active'));
    closeListBtn.addEventListener('click', closeListView);

    function closeListView() {
        listOverlay.classList.remove('active');
    }

    function initSwiper() {
        swiperInstance = new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            loop: true,
            speed: 700,
            
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 150,
                modifier: 2,
                slideShadows: false, // אנחנו עושים צללים ב-CSS
            },
            
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            keyboard: { enabled: true },

            // עדכון רקע
            on: {
                init: function() { updateBackground(this); },
                slideChangeTransitionStart: function() { updateBackground(this); }
            }
        });
    }

    // פונקציית עדכון רקע עם מעבר חלק (Crossfade)
    function updateBackground(swiper) {
        // מציאת השקופית הפעילה (גם בתוך לופ)
        const activeSlide = swiper.slides[swiper.activeIndex];
        const img = activeSlide.querySelector('img');
        
        if (img) {
            const nextBgId = currentBgIndex === 1 ? 'bg-2' : 'bg-1';
            const currentBgEl = document.getElementById(currentBgIndex === 1 ? 'bg-1' : 'bg-2');
            const nextBgEl = document.getElementById(nextBgId);

            // טעינת התמונה לרקע הבא (הנסתר)
            nextBgEl.style.backgroundImage = `url(${img.src})`;
            
            // החלפת ה-Classes כדי לבצע את הפייד
            nextBgEl.classList.add('active');
            currentBgEl.classList.remove('active');

            // החלפת האינדקס לפעם הבאה
            currentBgIndex = currentBgIndex === 1 ? 2 : 1;
        }
    }
});

// פונקציית הפעלת וידאו
window.playVideo = function(container, videoId) {
    container.innerHTML = `
        <iframe class="youtube-iframe" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1" 
            allow="autoplay; encrypted-media; fullscreen" 
            allowfullscreen>
        </iframe>
    `;
    // מניעת לחיצה חוזרת
    container.onclick = null;
};
