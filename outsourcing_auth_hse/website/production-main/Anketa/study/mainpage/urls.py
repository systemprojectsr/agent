from django.urls import path
from .views import *

app_name = "mainpage"

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path("anketa/", ContactView.as_view(), name="anketa"),
]