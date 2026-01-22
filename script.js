document.addEventListener('DOMContentLoaded', () => {
    
    fetch('videos.json')
        .then(res => res.json())
        .then(videos => {
            const wrapper = document.getElementById('swiper-wrapper');
            const bgElement = document.getElementById('dynamic-bg');

            videos.forEach(video => {
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                
                // תמונת HD
                const imgUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
                const fallbackUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

                slide.innerHTML = `
                    <div class="card-inner" onclick="playVideo(this, '${video.id}')">
                        <img src="${imgUrl}" 
                             class="video-thumb"
                             data-bg="${imgUrl}" 
                             onerror="this.src='${fallbackUrl}'"
                             alt="${video.title}">
                        
                        <div class="play-btn">
                            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>

                        <div class="card-info">
                            <h3>${video.title}</h3>
                        </div>
                    </div>
                `;
                wrapper.appendChild(slide);
            });

            // אתחול Swiper
            const swiper = new Swiper(".mySwiper", {
                effect: "coverflow",
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: "auto", // נותן לכרטיסים גודל אוטומטי
                spaceBetween: 30, // רווח בין הכרטיסים
                coverflowEffect: {
                    rotate: 0, // בלי סיבוב מוזר
                    stretch: 0,
                    depth: 150, // עומק עדין
                    modifier: 1,
                    slideShadows: true,
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                // אירוע: כשמחליפים שקופית -> תחליף רקע
                on: {
                    init: function () {
                        updateBackground(this.slides[this.activeIndex]);
                    },
                    slideChange: function () {
                        updateBackground(this.slides[this.activeIndex]);
                    },
                },
            });
        });
});

// פונקציה להחלפת הרקע הכללי
function updateBackground(slideElement) {
    const img = slideElement.querySelector('img');
    if (img) {
        const bgUrl = img.getAttribute('src');
        const bgDiv = document.getElementById('dynamic-bg');
        
        // יצירת מעבר חלק
        bgDiv.style.opacity = 0;
        setTimeout(() => {
            bgDiv.style.backgroundImage = `url(${bgUrl})`;
            bgDiv.style.opacity = 1;
        }, 200);
    }
}

// הפעלת וידאו
window.playVideo = function(container, videoId) {
    container.innerHTML = `
        <iframe class="youtube-frame"
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
    container.onclick = null;
};
