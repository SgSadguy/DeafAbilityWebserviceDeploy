# models.py
from django.db import models
from django.conf import settings
from django.db.models import JSONField      

class Course(models.Model):
    name = models.CharField(max_length=200, verbose_name="ชื่อคอร์ส")
    level = models.CharField(max_length=100, verbose_name="ระดับ")
    cover = models.ImageField(upload_to="course_covers/", null=True, blank=True)
    category = models.CharField(max_length=100, verbose_name="สายงาน")
    description = models.TextField(blank=True, verbose_name="รายละเอียด")
    video_url = models.URLField(blank=True, verbose_name="ลิงก์วิดีโอ")  # New: single video URL
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name = "คอร์ส"
        verbose_name_plural = "คอร์ส"
        ordering = ['-created_at']
    def __str__(self): return self.name

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons', verbose_name="คอร์ส")
    title = models.CharField(max_length=200, verbose_name="ชื่อบทเรียน")
    description = models.TextField(blank=True, verbose_name="รายละเอียดบทเรียน")
    order = models.PositiveIntegerField(default=0, verbose_name="ลำดับ")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cover = models.ImageField(upload_to="lesson_covers/", null=True, blank=True, verbose_name="รูปบทเรียน")

    class Meta:
        verbose_name = "บทเรียน"
        verbose_name_plural = "บทเรียน"
        ordering = ['course', 'order', 'id']
        constraints = [
            models.UniqueConstraint(fields=['course', 'order'], name='uniq_lesson_order_per_course')
        ]
    def __str__(self): return f"{self.course.name} - {self.title}"


class LessonProgress(models.Model):
    user   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'lesson')  # 1 user ต่อ 1 lesson
        indexes = [
            models.Index(fields=['user', 'course', 'lesson']),
        ]

    def __str__(self):
        return f'{self.user} / {self.course} / {self.lesson} / {"done" if self.completed else "pending"}'

class LessonLink(models.Model):
    KIND_CHOICES = [
        ("youtube", "YouTube"),
        ("external", "External URL"),
        ("file", "File"),
    ]
    ROLE_CHOICES = [
        ("main", "Main Video"),
        ("sign", "Sign Language Video"),
    ]

    lesson = models.ForeignKey(
        "Lesson", on_delete=models.CASCADE, related_name="links", verbose_name="บทเรียน"
    )
    title = models.CharField(max_length=200, verbose_name="ชื่อเนื้อหา/ลิงก์")
    kind = models.CharField(max_length=16, choices=KIND_CHOICES, default="external")
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default="main")
    url = models.URLField(blank=True, verbose_name="ลิงก์")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lesson.title} - {self.title} ({self.get_role_display()})"




class Job(models.Model):
    title = models.CharField(max_length=200, verbose_name="ชื่องาน")
    description = models.TextField(blank=True, verbose_name="รายละเอียดงาน")
    position_type = models.CharField(max_length=200, verbose_name="ตำแหน่งงาน")  
    company = models.CharField(
        max_length=200,
        verbose_name="ชื่อบริษัท",
        blank=True,             # อนุญาตเว้นว่างในฟอร์ม
        default=""              # ไม่เป็น NULL แต่เป็นสตริงว่าง
    )
    location = models.CharField(max_length=200, verbose_name="สถานที่ทำงาน", blank=True)
    salary = models.CharField(max_length=100, blank=True, verbose_name="เงินเดือน")

    image = models.ImageField(upload_to="job_images/", null=True, blank=True, verbose_name="รูปภาพงาน/บริษัท")
    courses = models.ManyToManyField(
        "courses.Course", related_name="jobs", blank=True, verbose_name="คอร์สที่เกี่ยวข้อง"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "งาน"
        verbose_name_plural = "งาน"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title



class QuizQuestion(models.Model):
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="quizzes",
        verbose_name="คอร์สที่เกี่ยวข้อง"
    )
    prompt = models.CharField(max_length=255, verbose_name="คำถาม")
    words = models.JSONField(default=list, verbose_name="คำที่ให้เลือก")
    correct_order = models.JSONField(default=list, verbose_name="ลำดับที่ถูกต้อง")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.name} - {self.prompt[:40]}"