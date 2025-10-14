# courses/services/lessonlink_duration.py
from .youtube import extract_youtube_id, fetch_youtube_duration_seconds

def update_lessonlink_duration(link) -> bool:
    if (link.kind or "").lower() != "youtube" or not link.url:
        return False
    vid = extract_youtube_id(link.url)
    if not vid:
        return False
    sec = fetch_youtube_duration_seconds(vid)
    if sec is None:
        return False
    link.mark_duration(sec)
    return True
