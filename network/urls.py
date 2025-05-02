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
    path('get_user_data/<str:user>', views.get_user_data, name='get_user_data'),
    path('is_following/<str:user1>/<str:user2>', views.is_following, name='is_following'),
    path('new_post', views.new_post, name='new_post'),
    path('all_posts', views.all_posts, name='all_posts'),
    path('profile_page/<str:username>', views.profile_page, name='profile_page'),
    path('follow/<str:target_user>/<str:follower>', views.follow, name='follow'),
    path('unfollow/<str:target_user>/<str:follower>', views.unfollow, name='unfollow'),
    path('following', views.following, name='following'),
    path('edit_post/<int:post_id>', views.edit_post, name='edit_post'),
    path('like_post/<int:post_id>', views.like_post, name='like_post'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# this last line is required to serve user-uploaded media files in development (DEBUG = True)
# 0-0: peep MEDIA_URL and MEDIA_ROOT in settings.py
