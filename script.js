document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('video-container');

    // וודא שקובץ ה-JSON קיים, אחרת תשתמש במערך לבדיקה
    fetch('videos.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load');
            return res.json();
        })
        .then(videos => {
            videos.forEach(video => {
                const card = document.createElement('div');
                card.classList.add('video-card-3d');
                
                // שימוש בתמונה באיכות גבוהה, ואם אין - רגילה
                const imgUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
                const fallbackUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

                card.innerHTML = `
                    <div class="video-thumb-container" onclick="playVideo(this, '${video.id}')">
                        <img src="${imgUrl}" 
                             onerror="this.src='${fallbackUrl}'" 
                             alt="${video.title}">
                        <div class="play-icon-overlay">
                            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                    <div class="card-title">${video.title}</div>
                `;

                videoContainer.appendChild(card);
            });
        })
        .catch(err => console.error(err));
});

// פונקציה חיצונית להפעלת הוידאו
function playVideo(container, videoId) {
    container.innerHTML = `
        <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
}
