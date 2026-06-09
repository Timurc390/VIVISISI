from django.urls import path
from .views import MeView, ChangeLanguageView

urlpatterns = [
    path("me/", MeView.as_view(), name="user-me"),
    path("language/", ChangeLanguageView.as_view(), name="user-language"),
]
