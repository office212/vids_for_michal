document.addEventListener('DOMContentLoaded', () => {
    
    let swiperInstance = null;
    let currentBgIndex = 1; 

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

                // --- 1. יצירת שקופית לגלגל ---
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                
                // הוספתי data-video-id ו-data-title למיכל הוידאו לשחזור קל
                slide.innerHTML = `
                    <div class="slide-video-box" 
                         data-video-id="${video.id}" 
                         onclick="playVideo(this)">
                        
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

                // --- 2. יצירת פריט לרשימה ---
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
                    if (swiperInstance) {
                        swiperInstance.slideToLoop(index);
                        stopAllVideos(); // עוצר סרטונים במעבר דרך הרשימה
                    }
                });
                gridContainer.appendChild(gridItem);
            });

            initSwiper();
        })
        .catch(err => console.error('Error loading videos:', err));

    // ניהול תצוגת רשימה
    toggleBtn.addEventListener('click', () => {
        stopAllVideos(); // עוצר את הוידאו אם פותחים את הרשימה
        listOverlay.classList.add('active');
    });
    
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
                slideShadows: false,
            },
            
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            keyboard: { enabled: true },

            on: {
                init: function() { updateBackground(this); },
                
                // --- השינוי החשוב: עצירת וידאו בגלילה ---
                slideChangeTransitionStart: function() { 
                    stopAllVideos(); // <--- הנה הקסם
                    updateBackground(this); 
                }
            }
        });
    }

    function updateBackground(swiper) {
        const activeSlide = swiper.slides[swiper.activeIndex];
        const img = activeSlide.querySelector('img');
        
        if (img) {
            const nextBgId = currentBgIndex === 1 ? 'bg-2' : 'bg-1';
            const currentBgEl = document.getElementById(currentBgIndex === 1 ? 'bg-1' : 'bg-2');
            const nextBgEl = document.getElementById(nextBgId);

            nextBgEl.style.backgroundImage = `url(${img.src})`;
            nextBgEl.classList.add('active');
            currentBgEl.classList.remove('active');

            currentBgIndex = currentBgIndex === 1 ? 2 : 1;
        }
    }
});

// --- ניהול הנגן ---

// פונקציה להפעלת הוידאו
window.playVideo = function(container) {
    // 1. שמירת ה-HTML המקורי (תמונה וכפתור) כדי שנוכל לשחזר אותו
    if (!container.dataset.originalHtml) {
        container.dataset.originalHtml = container.innerHTML;
    }

    // 2. סימון שהכרטיס הזה מנגן כרגע
    container.classList.add('is-playing');

    const videoId = container.dataset.videoId;

    // 3. החלפת התוכן באייפריים
    container.innerHTML = `
        <iframe class="youtube-iframe" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1" 
            allow="autoplay; encrypted-media; fullscreen" 
            allowfullscreen>
        </iframe>
    `;
    
    // ביטול לחיצה חוזרת על הוידאו עצמו
    container.onclick = null;
};

// פונקציה לעצירת כל הסרטונים (שחזור המצב הקודם)
window.stopAllVideos = function() {
    // מוצא את כל האלמנטים שמנגנים כרגע
    const playingContainers = document.querySelectorAll('.slide-video-box.is-playing');

    playingContainers.forEach(container => {
        // משחזר את ה-HTML המקורי (תמונה + כפתור)
        if (container.dataset.originalHtml) {
            container.innerHTML = container.dataset.originalHtml;
        }
        
        // מסיר את הסימון "מנגן"
        container.classList.remove('is-playing');
        
        // מחזיר את אירוע הלחיצה
        container.onclick = function() { playVideo(this); };
    });
};
