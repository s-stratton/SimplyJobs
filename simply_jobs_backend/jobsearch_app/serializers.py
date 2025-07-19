from rest_framework import serializers
from .models import User, Employer, JobSeeker, Job, Application, Education, Experience
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Custom JWT serializer to include account type in token
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['account'] = user.account
        token['username'] = user.username
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'account']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class EmployerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Employer
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True},
            'has_seen_tutorial': {'read_only': True},
        }

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'jobseeker', 'school', 'degree', 'field_of_study', 'start_date', 'end_date']
        extra_kwargs = {
            'jobseeker': {'read_only': True},
            'school': {'required': False, 'allow_blank': True},
            'degree': {'required': False, 'allow_blank': True},
            'field_of_study': {'required': False, 'allow_blank': True},
            'start_date': {'required': False, 'allow_null': True},
            'end_date': {'required': False, 'allow_null': True},
        }

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'jobseeker', 'title', 'job_type', 'company', 'start_date', 'end_date', 'description']
        extra_kwargs = {
            'jobseeker': {'read_only': True},
            'title': {'required': False, 'allow_blank': True},
            'job_type': {'required': False, 'allow_blank': True},
            'company': {'required': False, 'allow_blank': True},
            'start_date': {'required': False, 'allow_null': True},
            'end_date': {'required': False, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True},
        }

class JobSeekerSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    educations = EducationSerializer(many=True, required=False, read_only=True)
    experiences = ExperienceSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = JobSeeker
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True},
            'profile_picture': {'required': False, 'allow_null': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True},
            'phone_number': {'required': False, 'allow_blank': True},
            'bio': {'required': False, 'allow_blank': True},
            'resume': {'required': False, 'allow_null': True},
            'city': {'required': False, 'allow_blank': True},
            'country': {'required': False, 'allow_blank': True},
            'has_seen_tutorial': {'read_only': True},
        }

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        extra_kwargs = {'employer': {'read_only': True}}

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    jobseeker = JobSeekerSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'jobseeker', 'applied_at', 'status']
        read_only_fields = ['jobseeker', 'applied_at']