document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('video-container');

    fetch('videos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(videos => {
            videos.forEach((video, index) => {
                const videoCard = document.createElement('div');
                videoCard.classList.add('video-card');
                
                // אפקט מדורג בהופעה
                videoCard.style.animationDelay = `${index * 0.1}s`;

                // שינוי מבנה: תמונה למעלה, כותרת למטה (יותר נקי)
                // ושימוש בכפתור Play מעוצב ידנית
                const cardContent = `
                    <div class="video-wrapper">
                        <div class="iframe-placeholder" data-videoid="${video.id}" data-title="${video.title}">
                            <img src="https://img.youtube.com/vi/${video.id}/maxresdefault.jpg" 
                                 onerror="this.src='https://img.youtube.com/vi/${video.id}/hqdefault.jpg'"
                                 alt="${video.title}">
                            <div class="custom-play-btn">
                                <svg viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="video-title">${video.title}</div>
                `;

                videoCard.innerHTML = cardContent;
                videoContainer.appendChild(videoCard);
            });

            // אותו קוד Lazy Loading מעולה שלך
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const placeholder = entry.target.querySelector('.iframe-placeholder');
                        if (placeholder) {
                            loadYouTubePlayer(placeholder);
                            observer.unobserve(entry.target);
                        }
                    }
                });
            }, {
                rootMargin: '100px', // טוען קצת לפני שרואים
                threshold: 0.1
            });

            document.querySelectorAll('.video-card').forEach(card => {
                observer.observe(card);
            });
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            videoContainer.innerHTML = '<p style="text-align:center; color:white;">לא הצלחנו לטעון את הסרטונים כרגע.</p>';
        });

    function loadYouTubePlayer(placeholder) {
        const videoId = placeholder.dataset.videoid;
        const videoTitle = placeholder.dataset.title;
        const iframe = document.createElement('iframe');
        
        // autoplay=1 חיוני כאן כי המשתמש כבר לחץ על הכרטיס
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('title', videoTitle);

        placeholder.parentNode.replaceChild(iframe, placeholder);
    }
});
