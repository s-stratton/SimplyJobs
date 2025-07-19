from django.test import TestCase
from .models import User, JobSeeker, Employer, Job, Application

class UserModelTest(TestCase):
    def test_create_jobseeker_user(self):
        user = User.objects.create_user(username="john_doe", password="123", account="JOBSEEKER")
        self.assertEqual(user.account, "JOBSEEKER")
        self.assertEqual(user.username, "john_doe")

    def test_create_employer_user(self):
        user = User.objects.create_user(username="employer_test", password="123", account="EMPLOYER")
        self.assertEqual(user.account, "EMPLOYER")
        self.assertEqual(user.username, "employer_test")

class JobModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="test_employer", password="abc", account="EMPLOYER")
        self.employer = Employer.objects.create(user=self.user)
        self.job = Job.objects.create(
            employer=self.employer,
            company="SimplyJobs",
            title="Developer",
            description="Write code",
            location="Remote",
            salary=40000,
            job_type="Full-time"
        )

    def test_job_str(self):
        self.assertEqual(str(self.job), "Developer at SimplyJobs")

class ApplicationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="doe_john", password="abc", account="JOBSEEKER")
        self.jobseeker = JobSeeker.objects.create(user=self.user, first_name="John", last_name="Doe", email="john@example.com")
        self.emp_user = User.objects.create_user(username="test_employer1", password="abc", account="EMPLOYER")
        self.employer = Employer.objects.create(user=self.emp_user)
        self.job = Job.objects.create(
            employer=self.employer,
            company="SimplyJobs",
            title="Developer",
            description="Write code",
            location="Remote",
            salary=40000,
            job_type="Full-time"
        )

    def test_application_creation(self):
        app = Application.objects.create(job=self.job, jobseeker=self.jobseeker)
        self.assertEqual(app.status, "PENDING")
        self.assertEqual(str(app), "John Doe applied to Developer")
