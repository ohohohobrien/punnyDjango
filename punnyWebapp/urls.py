from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('vote', views.vote, name='vote'),
    path('create', views.create, name='create'),
    path('upload', views.upload, name='upload'),
    path('search_results', views.search_results, name='search_results'),
    path('<str:pun_id>', views.pun, name='pun'),
]
