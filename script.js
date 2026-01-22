document.addEventListener('DOMContentLoaded', () => {
    
    let swiperInstance = null;
    const gridContainer = document.getElementById('grid-container');
    const toggleBtn = document.getElementById('toggle-view-btn');
    const closeListBtn = document.getElementById('close-list-btn');
    const listOverlay = document.getElementById('list-overlay');
    const colorThief = new ColorThief(); // מאתחל את גנב הצבעים

    fetch('videos.json')
        .then(res => res.json())
        .then(videos => {
            const wrapper = document.getElementById('swiper-wrapper');

            videos.forEach((video, index) => {
                // שימוש בתמונה רגילה כדי שהסקריפט יוכל לקרוא את הצבעים (בעיית CORS עם HD)
                const imgUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;

                // --- יצירת שקופית לקרוסלה (Swiper) ---
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                
                // מבנה חדש: וידאו בנפרד, כותרת בנפרד
                slide.innerHTML = `
                    <div class="slide-video-container" onclick="playVideo(this, '${video.id}')">
                        <img src="${imgUrl}" alt="${video.title}" crossorigin="anonymous">
                        <div class="play-btn">
                            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                    <div class="slide-title-container">
                        <h3>${video.title}</h3>
                    </div>
                `;
                wrapper.appendChild(slide);

                // --- יצירת פריט לרשימה (Grid) ---
                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item');
                gridItem.style.animationDelay = `${index * 0.1}s`; // דיליי לאנימציית כניסה
                
                // גם כאן - תמונה וכותרת מתחתיה
                gridItem.innerHTML = `
                    <div class="grid-thumb-wrapper">
                         <img src="${imgUrl}" loading="lazy" alt="${video.title}">
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
        .catch(err => console.error('Error:', err));

    // ניהול תצוגת רשימה
    toggleBtn.addEventListener('click', () => {
        listOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // מונע גלילה ברקע
    });
    closeListBtn.addEventListener('click', closeListView);

    function closeListView() {
        listOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function initSwiper() {
        swiperInstance = new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            loop: true,
            speed: 600, // מעבר חלק יותר
            
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 200, // עומק דרמטי יותר
                modifier: 1.5,
                slideShadows: false, // ביטלתי את הצללים המובנים של סווייפר לטובת שליטה ידנית ב-CSS
            },
            
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            keyboard: { enabled: true },

            on: {
                // עדכון רקע בעת טעינה ובעת שינוי שקופית
                init: function() { updateDynamicBackground(this); },
                slideChangeTransitionStart: function() { updateDynamicBackground(this); }
            }
        });
    }

    // פונקציה חכמה לשאיבת צבעים מהתמונה לרקע
    function updateDynamicBackground(swiper) {
        const activeSlide = swiper.slides[swiper.activeIndex];
        const img = activeSlide.querySelector('img');
        
        if (img && img.complete) {
            setColorsFromImage(img);
        } else if (img) {
             img.addEventListener('load', function() {
                 setColorsFromImage(this);
             });
        }
    }

    function setColorsFromImage(img) {
        try {
            // שליפת פלטת צבעים מהתמונה
            const palette = colorThief.getPalette(img, 3);
            const color1 = `rgb(${palette[0][0]}, ${palette[0][1]}, ${palette[0][2]})`;
            const color2 = `rgb(${palette[1][0]}, ${palette[1][1]}, ${palette[1][2]})`;
            
            // עדכון משתני ה-CSS שמפעילים את הרקע
            document.documentElement.style.setProperty('--blob-color-1', color1);
            document.documentElement.style.setProperty('--blob-color-2', color2);
        } catch (e) {
            // במקרה של שגיאה נשארים עם צבעי ברירת המחדל
            console.log('Could not get colors from image (CORS block mostly). using defaults.');
        }
    }
});

window.playVideo = function(container, videoId) {
    container.innerHTML = `
        <iframe class="youtube-iframe" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1" 
            allow="autoplay; encrypted-media; fullscreen" 
            allowfullscreen>
        </iframe>
    `;
    container.onclick = null;
};
