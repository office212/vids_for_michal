document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('video-container');

    fetch('videos.json')
        .then(res => res.json())
        .then(videos => {
            videos.forEach((video, index) => {
                const card = document.createElement('div');
                card.classList.add('video-card-3d');
                
                // יצירת מבנה הכרטיס
                card.innerHTML = `
                    <div class="card-content">
                        <div class="video-thumb-container">
                            <div class="iframe-placeholder" data-videoid="${video.id}" data-title="${video.title}">
                                <img src="https://img.youtube.com/vi/${video.id}/maxresdefault.jpg" 
                                     onerror="this.src='https://img.youtube.com/vi/${video.id}/hqdefault.jpg'"
                                     alt="${video.title}">
                                <div class="play-icon-overlay">
                                    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>
                        </div>
                        <div class="card-title">${video.title}</div>
                    </div>
                `;

                // הוספת אירועי תלת מימד (Tilt Effect)
                addTiltEffect(card);

                videoContainer.appendChild(card);
            });

            // הפעלת ה-Lazy Load המקורי שלך (שהיה מצוין)
            initLazyLoading();
        });
});

/* --- פונקציית אפקט הטיה תלת-ממדית --- */
function addTiltEffect(card) {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // מיקום עכבר בתוך הכרטיס
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // חישוב זווית הסיבוב (מקסימום 10 מעלות)
        const rotateX = ((y - centerY) / centerY) * -5; // מינוס כדי שזה יזוז נכון
        const rotateY = ((x - centerX) / centerX) * 5;

        // החלת השינוי
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    // איפוס כשהעכבר יוצא
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    });
}

/* --- טעינת נגני יוטיוב (אותה לוגיקה שלך) --- */
function initLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // אנחנו רק רוצים לדעת מתי לטעון, אבל הלחיצה עצמה תטעין את הוידאו
                // בגרסה הזו נטעין את הוידאו רק בלחיצה כדי לשמור על האפקט
                const placeholder = entry.target.querySelector('.iframe-placeholder');
                if (placeholder) {
                    placeholder.addEventListener('click', function() {
                         loadYouTubePlayer(this);
                    });
                    observer.unobserve(entry.target);
                }
            }
        });
    });

    document.querySelectorAll('.video-card-3d').forEach(card => observer.observe(card));
}

function loadYouTubePlayer(placeholder) {
    const videoId = placeholder.dataset.videoid;
    const iframe = document.createElement('iframe');
    
    // בגלל המבנה החדש, נחליף את כל ה-thumb-container
    const container = placeholder.closest('.video-thumb-container');
    
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    container.innerHTML = ''; // מנקה תמונה וכפתור
    container.appendChild(iframe);
}
