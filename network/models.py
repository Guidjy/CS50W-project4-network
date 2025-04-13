from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    follower_count = models.IntegerField(default=0)
    following_count = models.IntegerField(default=0)
    post_count = models.IntegerField(default=0)
    bio = models.CharField(max_length=160, blank=True)
    profile_picture = models.ImageField(blank=True)
    banner_picture = models.ImageField(blank=True)
    
    def __str__(self):
        return self.username


# peep this stack overflow question https://stackoverflow.com/questions/50731311/is-a-follower-following-table-a-many-to-many-relationship
class Following(models.Model):
    target_user = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    follower = models.ForeignKey(User, related_name='target_users', on_delete=models.CASCADE) 
    
    def __str__(self):
        return f'{target_user} is followed by {follower}'


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=280)
    datetime = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(blank=True)
    likes = models.IntegerField(default=0)
    reposts = models.IntegerField(default=0)
    
    def __str__(self):
        return f'{self.author} says: {self.content}'
    

class Repost(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    reposter = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return f'{user} reposted \"{post}\"'