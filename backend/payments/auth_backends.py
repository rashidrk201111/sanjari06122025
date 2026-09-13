import os
import re

import requests
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User

from .models import SupabaseUser


class SupabaseAdminBackend(ModelBackend):
    """Allow Django admin login with Supabase Auth for admin/staff profiles."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        local_user = super().authenticate(request, username=username, password=password, **kwargs)
        if local_user:
            return local_user

        if not username or not password:
            return None

        email = self._resolve_email(username)
        if not email:
            return None

        auth_user = self._supabase_password_login(email, password)
        if not auth_user:
            return None

        profile = self._admin_profile(auth_user.get("id"), email)
        if not profile:
            return None

        user, _ = User.objects.update_or_create(
            username=profile.email,
            defaults={
                "email": profile.email,
                "first_name": profile.name[:150],
                "is_active": True,
                "is_staff": True,
                "is_superuser": profile.role == "admin",
            },
        )
        user.set_unusable_password()
        user.save(update_fields=["email", "first_name", "is_active", "is_staff", "is_superuser", "password"])
        return user

    def _resolve_email(self, username):
        username = str(username or "").strip()
        if not username:
            return ""
        if "@" in username:
            return username.lower()

        compact_username = re.sub(r"[^a-z0-9]", "", username.lower())
        profile = (
            SupabaseUser.objects.filter(name__iexact=username).first()
            or SupabaseUser.objects.filter(email__iexact=username).first()
        )
        if not profile and compact_username:
            for candidate in SupabaseUser.objects.filter(role__in=["admin", "staff"]):
                compact_name = re.sub(r"[^a-z0-9]", "", (candidate.name or "").lower())
                compact_email_prefix = re.sub(r"[^a-z0-9]", "", (candidate.email or "").split("@")[0].lower())
                if compact_username in (compact_name, compact_email_prefix):
                    profile = candidate
                    break
        return profile.email.lower() if profile else ""

    def _supabase_password_login(self, email, password):
        supabase_url = (os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or "").rstrip("/")
        anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY") or ""
        if not supabase_url or not anon_key:
            return None

        try:
            response = requests.post(
                f"{supabase_url}/auth/v1/token?grant_type=password",
                headers={"apikey": anon_key, "Content-Type": "application/json"},
                json={"email": email, "password": password},
                timeout=12,
            )
        except requests.RequestException:
            return None

        if not response.ok:
            return None
        return response.json().get("user") or {}

    def _admin_profile(self, auth_user_id, email):
        queryset = SupabaseUser.objects.filter(role__in=["admin", "staff"])
        if auth_user_id and re.fullmatch(r"[0-9a-fA-F-]{36}", str(auth_user_id)):
            profile = queryset.filter(id=auth_user_id).first()
            if profile:
                return profile
        return queryset.filter(email__iexact=email).first()
