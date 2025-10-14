# courses/services/youtube_noapi.py
import yt_dlp

def fetch_youtube_duration_seconds_noapi(url: str) -> int | None:
    """ดึงความยาววิดีโอ (วินาที) โดยไม่ใช้ API Key"""
    try:
        ydl_opts = {"quiet": True, "skip_download": True, "forcejson": True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
        return int(info.get("duration") or 0)
    except Exception as e:
        print("yt_dlp error:", e)
        return None
