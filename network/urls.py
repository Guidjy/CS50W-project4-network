from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('get_current_user', views.get_current_user, name='get_current_user'),
    path('new_post', views.new_post, name='new_post'),
    path('all_posts', views.all_posts, name='all_posts'),
    path('profile_page/<str:username>', views.profile_page, name='profile_page'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# this last line is required to serve user-uploaded media files in development (DEBUG = True)
# 0-0: peep MEDIA_URL and MEDIA_ROOT in settings.py
