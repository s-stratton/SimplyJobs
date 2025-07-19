from django.urls import path
from . import views

urlpatterns = [
    path("jobs/", views.CreateJobView.as_view(), name="job-list"),
    path("jobs/delete/<int:pk>/", views.DeleteJobView.as_view(), name="delete-job"),
    path("jobs/apply/", views.ApplyToJobView.as_view(), name="apply-to-job"),
    path("token/", views.MyTokenObtainPairView.as_view(), name="get_token"),
    path("profile/edit/", views.EditProfile.as_view(), name="edit-profile"),
    path("profile/<str:username>/", views.ProfileView.as_view(), name="profile-detail"),
    path("jobs/<int:job_id>/applicants/", views.ApplicantsListView.as_view(), name="job-applicants"),
    path("applications/update/", views.UpdateApplicationStatusView.as_view(), name="update-applications"),
    path("applied/", views.AppliedJobsView.as_view(), name='applied-jobs'),
    path("applied/delete/<int:pk>/", views.DeleteApplicationView.as_view(), name="delete-application"),
    path("educations/", views.AddEducationView.as_view(), name="education-list"),
    path("educations/<int:pk>/", views.EducationDetailView.as_view(), name="education-detail"),
    path("experiences/", views.AddExperienceView.as_view(), name="experience-list"),
    path("experiences/<int:pk>/", views.ExperienceDetailView.as_view(), name="experience-detail"),
    path('tutorial_seen/', views.SetTutorialSeenView.as_view(), name='tutorial-seen'),
]