# models.py
from django.db import models
from django.conf import settings

class Course(models.Model):
    name = models.CharField(max_length=200, verbose_name="ชื่อคอร์ส")
    level = models.CharField(max_length=100, verbose_name="ระดับ")
    category = models.CharField(max_length=100, verbose_name="สายงาน")
    description = models.TextField(blank=True, verbose_name="รายละเอียด")
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
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='links', verbose_name="บทเรียน")
    title  = models.CharField(max_length=200, verbose_name="ชื่อเนื้อหา/ลิงก์")
    kind   = models.CharField(max_length=16, choices=KIND_CHOICES, default="external")
    url    = models.URLField(blank=True, verbose_name="ลิงก์")  
    file   = models.FileField(upload_to="lesson_assets/", blank=True, null=True, verbose_name="ไฟล์") 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lesson.title} - {self.title}"



class Job(models.Model):
    title = models.CharField(max_length=200, verbose_name="ชื่องาน")
    description = models.TextField(blank=True, verbose_name="รายละเอียดงาน")
    position_type = models.CharField(max_length=200, verbose_name="ตำแหน่งงาน")  
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