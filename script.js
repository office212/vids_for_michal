document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('video-container');

    // טוען את נתוני הסרטונים מקובץ videos.json
    fetch('videos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(videos => {
            videos.forEach(video => {
                const videoCard = document.createElement('div');
                videoCard.classList.add('video-card');

                const titleHTML = `<div class="video-title">${video.title}</div>`;

                // נגן ה-YouTube ייווצר רק כשהכרטיס נכנס לתצוגה (Lazy Loading)
                const iframePlaceholder = `
                    <div class="video-wrapper">
                        <div class="iframe-placeholder" data-videoid="${video.id}" data-title="${video.title}">
                            <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="תמונה ממוזערת של הסרטון ${video.title}" style="width:100%;height:100%;object-fit:cover;cursor:pointer;">
                            <svg class="play-button" viewBox="0 0 68 48"><path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,0.13,34,0.13,34,0.13S12.21,0.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.2,0.06,24,0.06,24s0,10.8,1.42,16.26c0.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,47.87,34,47.87s21.79,0,27.1-1.42c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.8,67.94,24,67.94,24S67.94,13.2,66.52,7.74z" fill="#f00"></path><path d="M45,24L27,14v20L45,24z" fill="#fff"></path></svg>
                        </div>
                    </div>
                `;
                
                videoCard.innerHTML = titleHTML + iframePlaceholder;
                videoContainer.appendChild(videoCard);
            });

            // הפעלת Intersection Observer לטעינה עצלה
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const placeholder = entry.target.querySelector('.iframe-placeholder');
                        if (placeholder) {
                            loadYouTubePlayer(placeholder);
                            observer.unobserve(entry.target); // מפסיק לעקוב אחרי הכרטיס הזה
                        }
                    }
                });
            }, {
                rootMargin: '0px', // טען כשכרטיס קרוב לתצוגה
                threshold: 0.2 // טען כש-20% מהכרטיס נראה
            });

            document.querySelectorAll('.video-card').forEach(card => {
                observer.observe(card);
            });
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            videoContainer.innerHTML = '<p>אירעה שגיאה בטעינת הסרטונים. אנא נסה שוב מאוחר יותר.</p>';
        });

    function loadYouTubePlayer(placeholder) {
        const videoId = placeholder.dataset.videoid;
        const videoTitle = placeholder.dataset.title;
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0`;
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('title', videoTitle); // לשיפור נגישות
        
        // החלפת ה-placeholder בנגן ה-iframe
        placeholder.parentNode.replaceChild(iframe, placeholder);
    }
});
