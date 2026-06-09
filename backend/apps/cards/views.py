from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404
from .models import Card, CardProject
from .serializers import CardSerializer, CardPublicSerializer, CardProjectSerializer


class CardViewSet(ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Card.objects.filter(owner=self.request.user).prefetch_related("projects")

    @action(detail=True, methods=["post"], url_path="projects")
    def add_project(self, request, pk=None):
        card = self.get_object()
        serializer = CardProjectSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(card=card)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["delete"], url_path="projects/(?P<project_pk>[^/.]+)")
    def remove_project(self, request, pk=None, project_pk=None):
        card = self.get_object()
        project = get_object_or_404(CardProject, pk=project_pk, card=card)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicCardView(APIView):
    """GET /api/cards/public/<slug>/ — публічна сторінка візитки"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        card = get_object_or_404(Card, slug=slug, is_public=True)
        card.views_count += 1
        card.save(update_fields=["views_count"])
        serializer = CardPublicSerializer(card, context={"request": request})
        return Response(serializer.data)
