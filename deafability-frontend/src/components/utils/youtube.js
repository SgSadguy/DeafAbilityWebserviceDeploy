
export function toYouTubeEmbed(url) {
  try {
    const u = new URL(url);
    const host = (u.hostname || '').toLowerCase();

    if (!(host.endsWith('youtube.com') || host === 'youtu.be')) return null;

    let videoId = null;

    if (host === 'youtu.be') {
      videoId = u.pathname.replace('/', '');
    } else {
      if (u.pathname === '/watch') {
        videoId = u.searchParams.get('v');
      } else if (u.pathname.startsWith('/shorts/')) {
        videoId = u.pathname.split('/')[2];
      } else if (u.pathname.startsWith('/embed/')) {
        return url; // ผู้ใช้วางลิงก์ embed มาอยู่แล้ว
      }
    }
    if (!videoId) return null;

    // รองรับ t=90 หรือ t=1m30s
    let startSeconds = 0;
    const t = u.searchParams.get('t');
    if (t) {
      const m = /^((\d+)h)?((\d+)m)?((\d+)s)?$/.exec(t);
      if (m) {
        startSeconds =
          (parseInt(m[2] || 0) * 3600) +
          (parseInt(m[4] || 0) * 60) +
          (parseInt(m[6] || 0));
      } else if (!isNaN(parseInt(t))) {
        startSeconds = parseInt(t);
      }
    }

    const params = new URLSearchParams();
    if (startSeconds > 0) params.set('start', String(startSeconds));

    const base = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId);
    return base + (params.toString() ? `?${params.toString()}` : '');
  } catch {
    return null;
  }
}
