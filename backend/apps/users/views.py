from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/me/ — профіль поточного користувача"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangeLanguageView(APIView):
    """POST /api/users/language/ — змінити мову інтерфейсу"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        lang = request.data.get("language")
        allowed = ["uk", "ru", "en"]
        if lang not in allowed:
            return Response(
                {"error": f"Дозволені мови: {', '.join(allowed)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.user.language = lang
        request.user.save(update_fields=["language"])
        return Response({"language": lang})
