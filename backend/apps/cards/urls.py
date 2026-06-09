from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CardViewSet, PublicCardView

router = DefaultRouter()
router.register("", CardViewSet, basename="card")

urlpatterns = [
    path("public/<slug:slug>/", PublicCardView.as_view(), name="card-public"),
    path("", include(router.urls)),
]
