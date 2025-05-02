from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
import json

from .models import User, Post, Following, Like


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


def get_user_data(request, user):
    """
    returns the follower and following count of a user
    """
    user = User.objects.get(username=user)
    user = user.to_dict()
    return JsonResponse({'user': user})


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
        # checks if this post has been liked by the current user
        if user_has_liked(request.user, post):
            has_liked = True
        else:
            has_liked = False
        parsed = post.to_dict()
        parsed['has_liked'] = has_liked
        all_posts.append(parsed)
    
    # splits the list into pages of 10 posts
    p = Paginator(all_posts, 10)
    pages = []
    for i in range (p.num_pages):
        page = {
            'pageNumber': i + 1,
            'hasPrevious': p.page(i+1).has_previous(),
            'hasNext': p.page(i+1).has_next(),
            'posts': p.page(i+1).object_list,
        }
        pages.append(page)
        
    return JsonResponse({'pages': pages})


def profile_page(request, username):
    """
    Clicking on a username should load that user's profile page. This page:
    > Displays the number of followers the user has, as well as the number of people that the user follows.
    > Display all of the posts for that user, in reverse chronological order.
    > For any other user who is signed in, this page should also display a “Follow” or “Unfollow” button 
      that will let the current user toggle whether or not they are following this user’s posts. 
    """
    
    # gets the data of the profile the user wants to see
    target_user = User.objects.get(username=username)
    target_user = target_user.to_dict()
    
    # queries the database for all of the posts of that user
    posts = list(Post.objects.order_by('datetime').filter(author=target_user['id']).reverse())
    user_posts = []
    for post in posts:
        user_posts.append(post.to_dict())
    
    # splits the list into pages of 10 posts
    p = Paginator(user_posts, 10)
    pages = []
    for i in range (p.num_pages):
        page = {
            'pageNumber': i + 1,
            'hasPrevious': p.page(i+1).has_previous(),
            'hasNext': p.page(i+1).has_next(),
            'posts': p.page(i+1).object_list,
        }
        pages.append(page)

    # gets current user
    currrent_user = request.user
    # checks if it's the same as the target user
    user_owns_profile = False
    if currrent_user.username == target_user['username']:
        user_owns_profile = True
    
    return JsonResponse({'targetUser': target_user, 'userOwnsProfile': user_owns_profile, 'pages': pages})


def is_following(request, user1, user2):
    """
    returns wether user1 is following user2
    """
    user1 = User.objects.get(username=user1)
    user2 = User.objects.get(username=user2)
    is_following = Following.objects.filter(target_user=user2, follower=user1)
    
    if is_following:
        is_following = True
    else:
        is_following = False
    
    return JsonResponse({'isFollowing': is_following})


def follow(request, target_user, follower):
    """
    makes follower follow target_user
    """
    
    # creates a new following instance
    target_user = User.objects.get(username=target_user)
    follower = User.objects.get(username=follower)
    follow_instance = Following.objects.create(target_user=target_user, follower=follower)
    
    # validates and saves that instance - they call me linus torvalds
    try:
        follow_instance.full_clean()
    except ValidationError:
        success = False
    else:
        follow_instance.save()  
        success = True
        target_user.follower_count += 1
        target_user.save()
        follower.following_count += 1
        follower.save()
        print(f'target_user: {target_user} follower; {follower}')
    finally:
        return JsonResponse({'success': success})
    

def unfollow(request, target_user, follower):
    """
    makes follower unfollow target_user
    """
    
    # gets the follow instance of target_user and follower
    target_user = User.objects.get(username=target_user)
    follower = User.objects.get(username=follower)
    follow_instance = Following.objects.filter(target_user=target_user, follower=follower)
    print(follow_instance)
    print(f'target_user: {target_user} follower; {follower}')
    
    # deletes that instance if it exists
    if follow_instance:
        follow_instance.delete()
        target_user.follower_count -= 1
        target_user.save()
        follower.following_count -= 1
        follower.save()
        return JsonResponse({'success': True})
    else:
        print('nun')
        return JsonResponse({'success': False})


# this view has some interesting notes on querying which may be worth revisiting later
@login_required
def following(request):
    """
    takes the user to a page where they see all posts made by users that the current user follows
    """
    
    # queries the db for all of the users that the current user follows
    # 0-0: .values_list is used to extract only the values from a queryset, instead of full model instances
    #      This returns a list of tuples, so we add flat=True to just simply get a list.
    #      In this case, we're getting a list of user ids.
    following_users = list(Following.objects.filter(follower=request.user).values_list('target_user', flat=True))
    
    # gets all of the posts made by the previously queried users
    # 0-0: Even more new django query filter syntax: author__in basically gives us
    # all Post objects where the author is in the list following_users
    posts = list(Post.objects.filter(author__in=following_users).order_by('datetime').reverse())
    for i in range(len(posts)):
        posts[i] = posts[i].to_dict()
        
    # splits the list into pages of 10 posts
    p = Paginator(posts, 10)
    pages = []
    for i in range (p.num_pages):
        page = {
            'pageNumber': i + 1,
            'hasPrevious': p.page(i+1).has_previous(),
            'hasNext': p.page(i+1).has_next(),
            'posts': p.page(i+1).object_list,
        }
        pages.append(page)
    
    return JsonResponse({'posts': posts, 'pages': pages})


@csrf_exempt
def edit_post(request, post_id):
    """
    Users should be able to click an “Edit” button or link on any of their own posts to edit that post.
    """
    # I've never used this bih before 0-0
    if request.method == 'PATCH':
        # gets new post content
        new_content = str(request.body)
        new_content = new_content[2 : len(new_content) - 1]
        # replaces old content
        post = Post.objects.get(id=post_id)
        post.content = new_content
        post.save()
        
        return JsonResponse({'message': 'post edited successfuly', 'post': post.to_dict()})
        
    
    else:
        return render(request, "network/index.html")  


@login_required
@csrf_exempt
def like_post(request, post_id):
    """
    Users should be able to click a button or link on any post to toggle whether or not they “like” that post.
    """
    if request.method == 'PATCH':
        # gets the post and checks if it's been liked or not
        post = Post.objects.get(id=post_id)
        liked = str(request.body)
        liked = liked[2 : len(liked) - 1].capitalize()
        if liked == 'True':
            liked = True
        else:
            liked = False
            
        # likes or unlikes the post
        user = request.user
        if liked:
            post.likes -= 1
            post.save()
            like_instance = Like.objects.get(post=post, liker=user)
            like_instance.delete()
            return JsonResponse({'message': 'post sucessfully unliked'})
            
            
        else:
            like_instance = Like.objects.create(post=post, liker=user)
            try:
                like_instance.full_clean()
            except ValidationError:
                success = False
            else:
                success = True
                like_instance.save()
                post.likes += 1
                post.save()
            finally:
                return JsonResponse({'message': 'post sucessfully liked'})
                
                
        
        return JsonResponse({'message': 'post successfully liked/unliked', 'post': post.to_dict()})
        
    
    else:
        return render(request, "network/index.html")  
    

def user_has_liked(user, post):
    """
    returns true if user has liked post
    """
    like_instance = Like.objects.filter(post=post, liker=user)
    if like_instance:
        return True
    return False

