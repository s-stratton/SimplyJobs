from django.shortcuts import render
from rest_framework import viewsets, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError
from .models import *
from .serializers import *
from django_filters import rest_framework as filters
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.permissions import BasePermission
from .permissions import IsJobseeker, IsEmployer
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes

class UserRegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        if user.account == 'EMPLOYER':
            Employer.objects.create(user=user)
        if user.account == 'JOBSEEKER':
            JobSeeker.objects.create(
                user=user,
                city='',
                country='',
                first_name='',
                last_name='',
                email=user.email,
                phone_number='',
                bio='',
                profile_picture=None,
                resume=None
            )

class EmployerViewSet(viewsets.ModelViewSet):
    serializer_class = EmployerSerializer
    queryset = Employer.objects.all()
    permission_classes = [AllowAny]

class JobSeekerViewSet(viewsets.ModelViewSet):
    serializer_class = JobSeekerSerializer
    queryset = JobSeeker.objects.all()
    permission_classes = [AllowAny]

class CreateJobView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ['company', 'job_type', 'location', 'salary']

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'employer'):
            return Job.objects.filter(employer=user.employer)
        return Job.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        employer_profile = getattr(user, 'employer', None)
        if employer_profile is None:
            raise ValidationError("Only employer users can create jobs.")
        serializer.save(employer=employer_profile)

class DeleteJobView(generics.DestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'employer'):
            return Job.objects.filter(employer=user.employer)
        return Job.objects.none()

class EditProfile(generics.RetrieveUpdateAPIView):
    serializer_class = JobSeekerSerializer
    permission_classes = [IsAuthenticated, IsJobseeker]

    def get_object(self):
        user = self.request.user
        if not hasattr(user, 'jobseeker'):
            raise ValidationError("User is not a jobseeker.")
        return user.jobseeker

class AddEducationView(generics.ListCreateAPIView):
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated, IsJobseeker]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'jobseeker'):
            return Education.objects.filter(jobseeker=user.jobseeker)
        return Education.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'jobseeker'):
            raise ValidationError("Only jobseekers can add education.")
        serializer.save(jobseeker=user.jobseeker)

class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated, IsJobseeker]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'jobseeker'):
            return Education.objects.filter(jobseeker=user.jobseeker)
        return Education.objects.none()

class AddExperienceView(generics.ListCreateAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated, IsJobseeker]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'jobseeker'):
            return Experience.objects.filter(jobseeker=user.jobseeker)
        return Experience.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'jobseeker'):
            raise ValidationError("Only jobseekers can add experience.")
        serializer.save(jobseeker=user.jobseeker)

class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated, IsJobseeker]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'jobseeker'):
            return Experience.objects.filter(jobseeker=user.jobseeker)
        return Experience.objects.none()

class ProfileView(generics.RetrieveAPIView):
    queryset = JobSeeker.objects.all()
    lookup_field = 'user__username'
    lookup_url_kwarg = 'username'
    serializer_class = JobSeekerSerializer
    permission_classes = [IsAuthenticated]

class ApplyToJobView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsJobseeker]

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'jobseeker'):
            raise ValidationError("Only jobseekers can apply to jobs.")
        job_id = self.request.data.get('job')
        job = Job.objects.filter(id=job_id).first()
        if Application.objects.filter(job=job, jobseeker=user.jobseeker).exists():
            raise ValidationError("You have already applied to this job.")
        serializer.save(job=job, jobseeker=user.jobseeker)

class ApplicantsListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        status = self.request.query_params.get('status', None)
        qs = Application.objects.filter(job_id=job_id, job__employer__user=self.request.user)
        if status:
            qs = qs.filter(status=status)
        return qs

class UpdateApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def put(self, request):
        app_ids = request.data.get("application_ids", [])
        new_status = request.data.get("status")

        if not app_ids or not new_status:
            return Response({"detail": "application_ids and status are required."}, status=400)

        valid_statuses = dict(Application.STATUS_CHOICES)
        if new_status not in valid_statuses:
            return Response({"detail": "Invalid status."}, status=400)

        updated = Application.objects.filter(
            id__in=app_ids,
            job__employer__user=request.user
        ).update(status=new_status)

        return Response({"updated": updated}, status=200)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class AppliedJobsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsJobseeker]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'jobseeker'):
            return Application.objects.none()
        return Application.objects.filter(jobseeker=user.jobseeker)

class DeleteApplicationView(generics.DestroyAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsJobseeker]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'jobseeker'):
            return Application.objects.filter(jobseeker=user.jobseeker)
        return Application.objects.none()

class SetTutorialSeenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = None
        if hasattr(user, 'jobseeker'):
            profile = user.jobseeker
        elif hasattr(user, 'employer'):
            profile = user.employer
        else:
            return Response({"detail": "No profile found."}, status=400)
        return Response({"has_seen_tutorial": profile.has_seen_tutorial})

    def patch(self, request):
        user = request.user
        profile = None
        if hasattr(user, 'jobseeker'):
            profile = user.jobseeker
        elif hasattr(user, 'employer'):
            profile = user.employer
        else:
            return Response({"detail": "No profile found."}, status=400)
        profile.has_seen_tutorial = True
        profile.save()
        return Response({"has_seen_tutorial": True})
