document.addEventListener('DOMContentLoaded', () => {
    
    let swiperInstance = null;
    const gridContainer = document.getElementById('grid-container');
    const toggleBtn = document.getElementById('toggle-view-btn');
    const closeListBtn = document.getElementById('close-list-btn');
    const listOverlay = document.getElementById('list-overlay');

    fetch('videos.json')
        .then(res => res.json())
        .then(videos => {
            const wrapper = document.getElementById('swiper-wrapper');

            videos.forEach((video, index) => {
                const imgUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
                const hdUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;

                // 1. יצירת שקופית לגלגל (Swiper)
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                slide.innerHTML = `
                    <div class="card-content" onclick="playVideo(this, '${video.id}')">
                        <img src="${hdUrl}" onerror="this.src='${imgUrl}'" alt="${video.title}">
                        <div class="play-btn">
                            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                        <div class="video-info">
                            <h3>${video.title}</h3>
                        </div>
                    </div>
                `;
                wrapper.appendChild(slide);

                // 2. יצירת פריט לרשימה (Grid)
                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item');
                gridItem.innerHTML = `
                    <img src="${imgUrl}" loading="lazy" alt="${video.title}">
                    <p>${video.title}</p>
                `;
                // כשלוחצים על פריט ברשימה -> סוגרים רשימה ומעבירים את הגלגל
                gridItem.addEventListener('click', () => {
                    closeListView();
                    if (swiperInstance) {
                        swiperInstance.slideToLoop(index); // קפיצה חכמה בלופ
                    }
                });
                gridContainer.appendChild(gridItem);
            });

            initSwiper();
        })
        .catch(err => console.error('Error:', err));

    // ניהול פתיחה/סגירה של הרשימה
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
            loop: true, // לופ אינסופי!
            
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 150,
                modifier: 2,
                slideShadows: true,
            },
            
            pagination: { el: ".swiper-pagination", clickable: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            keyboard: { enabled: true },

            on: {
                init: function() { updateBackground(this); },
                slideChangeTransitionStart: function() { updateBackground(this); }
            }
        });
    }

    function updateBackground(swiper) {
        // בלופ, Swiper משכפל שקופיות, אז צריך למצוא את הפעילה האמיתית
        const activeSlide = swiper.slides[swiper.activeIndex];
        const img = activeSlide.querySelector('img');
        if (img) {
            document.getElementById('bg-layer').style.backgroundImage = `url(${img.src})`;
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
