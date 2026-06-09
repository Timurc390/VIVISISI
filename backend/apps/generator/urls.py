from django.urls import path
from .views import GenerateCardView

urlpatterns = [
    path("<int:card_id>/generate/", GenerateCardView.as_view(), name="generate-card"),
]
