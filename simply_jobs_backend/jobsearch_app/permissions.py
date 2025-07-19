from rest_framework.permissions import BasePermission

class IsJobseeker(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'jobseeker')

class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'employer')