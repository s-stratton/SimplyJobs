from django.contrib import admin
from .models import *

admin.site.register(User)
admin.site.register(Employer)
admin.site.register(JobSeeker)
admin.site.register(Job)
admin.site.register(Application)
admin.site.register(Education)
admin.site.register(Experience)