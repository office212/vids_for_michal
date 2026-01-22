document.addEventListener('DOMContentLoaded', () => {
    
    fetch('videos.json')
        .then(res => res.json())
        .then(videos => {
            const wrapper = document.getElementById('swiper-wrapper');

            videos.forEach(video => {
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');

                // מבנה הכרטיס
                slide.innerHTML = `
                    <div class="slide-content">
                        <div class="video-area" onclick="loadVideo(this, '${video.id}')">
                            <img src="https://img.youtube.com/vi/${video.id}/maxresdefault.jpg" 
                                 onerror="this.src='https://img.youtube.com/vi/${video.id}/hqdefault.jpg'">
                            
                            <div class="play-btn">
                                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>

                            <div class="meta-data">
                                <h3>${video.title}</h3>
                            </div>
                        </div>
                    </div>
                `;
                wrapper.appendChild(slide);
            });

            // הפעלת ה-Swiper (האפקט התלת מימדי)
            initSwiper();
        })
        .catch(err => console.error('Error:', err));
});

function initSwiper() {
    new Swiper(".mySwiper", {
        effect: "coverflow", // זה האפקט של ה"גלגל"
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto", // נותן לכרטיסים גודל טבעי
        initialSlide: 1, // מתחיל מהסרטון השני כדי שיראו שיש צדדים
        
        // הגדרות העומק והסיבוב
        coverflowEffect: {
            rotate: 40,    // זווית הסיבוב של הכרטיסים בצד
            stretch: 0,
            depth: 200,    // כמה עמוק הם הולכים אחורה
            modifier: 1,
            slideShadows: true, // צללים ריאליסטיים
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });
}

// פונקציה לטעינת הוידאו בלחיצה
window.loadVideo = function(container, videoId) {
    // מנקה את התמונה והכפתור
    container.innerHTML = `
        <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
    // מבטל הקלקה נוספת
    container.onclick = null;
};
