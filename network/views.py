from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
import json

from .models import User


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
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Successfully logged out', 'status': 200}, status=200)


def register(request):
    if request.method == "POST":
        user_input = json.loads(request.body) 
        username = user_input.username
        email = user_input.email

        # Ensure password matches confirmation
        password = user_input.password
        confirmation = user_input.confirmation
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
    returns current user username
    """
    if request.user.is_authenticated:
        is_logged_in = True
        username = request.user.username
    else:
        is_logged_in = False
        username = None
    
    return JsonResponse({'isLoggedIn': is_logged_in, 'username': username}, status=200)