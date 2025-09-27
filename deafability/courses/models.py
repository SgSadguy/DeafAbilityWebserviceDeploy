from django.db import models

# Create your models here.

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
    
    def __str__(self):
        return self.name