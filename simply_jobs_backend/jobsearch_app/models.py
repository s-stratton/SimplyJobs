from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.utils import timezone

def validate_file_size(value):
    limit = 5 * 1024 * 1024  # 5 MB
    if value.size > limit:
        raise ValidationError('File size should not exceed 5 MB.')

class User(AbstractUser):
    Account_Types = (
        ('JOBSEEKER', 'Job Seeker'),
        ('EMPLOYER', 'Employer'),
    )
    account = models.CharField(max_length=10, choices=Account_Types)

class BaseProfile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    has_seen_tutorial = models.BooleanField(default=False)

    class Meta:
        abstract = True

class JobSeeker(BaseProfile):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    resume = models.FileField(
        upload_to='resumes/',
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'docx']),
            validate_file_size
        ]
    )
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    class Meta:
        permissions = [
            ("can_apply_jobs", "Can apply for jobs"),
        ]

class Education(models.Model):
    jobseeker = models.ForeignKey(JobSeeker, on_delete=models.CASCADE, related_name='educations')
    school = models.CharField(max_length=100)
    degree = models.CharField(max_length=100)
    field_of_study = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.degree} in {self.field_of_study} from {self.school}"
    
class Experience(models.Model):
    jobseeker = models.ForeignKey(JobSeeker, on_delete=models.CASCADE, related_name='experiences')
    title = models.CharField(max_length=100)
    job_type = models.CharField(max_length=50)
    company = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField()

    def __str__(self):
        return f"{self.title} at {self.company}"

class Employer(BaseProfile):
    class Meta:
        permissions = [
            ("can_post_jobs", "Can post jobs"),
        ]

class Job(models.Model):
    id = models.AutoField(primary_key=True)
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='jobs')
    company = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=100)
    salary = models.IntegerField(default=0)
    job_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} at {self.company}"

class Application(models.Model):
    PENDING = 'PENDING'
    SHORTLISTED = 'SHORTLISTED'
    REJECTED = 'REJECTED'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (SHORTLISTED, 'Shortlisted'),
        (REJECTED, 'Rejected'),
    ]
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    jobseeker = models.ForeignKey(JobSeeker, on_delete=models.CASCADE, related_name='applications')
    applied_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    class Meta:
        unique_together = ('job', 'jobseeker')  # Prevent duplicate applications
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.jobseeker.first_name} {self.jobseeker.last_name} applied to {self.job.title}"