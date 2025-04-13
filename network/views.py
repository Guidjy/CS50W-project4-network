from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
import json

from .models import User, Post


def index(request):
    return render(request, "network/index.html")        


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in        
        user_input = json.loads(request.body)
        username = user_input['username']
        password = user_input['password']
        user = authenticate(request, username=username, password=password)
        
        # Check if authentication successful
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'user successfully logged in', 'status': 200}, status=200)
        else:
            return JsonResponse({'message': 'Invalid username and/or password.', 'status': 401}, status=401)

    else:
        return render(request, "network/index.html")


def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Successfully logged out', 'status': 200}, status=200)


@csrf_exempt
def register(request):
    if request.method == "POST":
        user_input = json.loads(request.body) 
        print(user_input)
        username = user_input['username']
        email = user_input['email']

        # Ensure password matches confirmation
        password = user_input['password']
        confirmation = user_input['confirmation']
        if password != confirmation:
            return JsonResponse({'message': 'Passwords must match.', 'status': 401}, status=401)

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return JsonResponse({'message': 'Username already taken.', 'status': 401}, status=401)
        login(request, user)
        return JsonResponse({'message': 'Successfully logged in', 'status': 200}, status=200)
    else:
        return render(request, "network/index.html")
    
    
def get_current_user(request):
    """
    returns current user username, if they're logged in
    """
    if request.user.is_authenticated:
        is_logged_in = True
        username = request.user.username
        if request.user.profile_picture:
            pfp = request.user.profile_picture.url
        else:
            pfp = None
    else:
        is_logged_in = False
        username = None
        pfp = None
    
    return JsonResponse({'isLoggedIn': is_logged_in, 'username': username, 'pfp': pfp}, status=200)


@login_required
@csrf_exempt
def new_post(request):
    """
    Users who are signed in are able to write a new text-based post by filling in text into a text area 
    and then clicking a button to submit the post.
    """
    if request.method == 'POST':
        # these new methods are being used to handle image uploads
        # peep newPost on app.js
        content = request.POST.get('content')
        image = request.FILES.get('image')
        new_post = Post.objects.create(
            author=request.user, 
            content=content, 
            image=image
        )
        print(new_post)
        try:
            new_post.full_clean()
        except ValidationError:
            # handle error :p
            pass
        new_post.save()
        return JsonResponse({'message': 'success'}, status=200)
        
    else:
        return redirect(index)
    

def all_posts(request):
    """
    The “All Posts” link in the navigation bar takes the user to a page where they can see all posts from all users, 
    with the most recent posts first. Each post should include the username of the poster, the post content itself, 
    the date and time at which the post was made, and the number of “likes” the post has
    """
    posts = list(Post.objects.order_by('datetime').all().reverse())
    # converts all of the queried posts into dicts and adds them to a list
    all_posts = list()
    for post in posts:
        all_posts.append(post.to_dict())
    return JsonResponse({'posts': all_posts})