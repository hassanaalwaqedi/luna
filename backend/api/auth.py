"""
Authentication module for Luna.

Provides:
    - JWT-based session management via HttpOnly cookies
    - Single-operator credential validation
    - Rate limiting on login attempts
    - FastAPI dependency for route protection

Usage:
    from auth import auth_router, require_auth

    app.include_router(auth_router)


Provides:
    - JWT-based session management via HttpOnly cookies
    - Single-operator credential validation
    - Rate limiting on login attempts
    - FastAPI dependency for route protection

Usage:
    from auth import auth_router, require_auth

    app.include_router(auth_router)

    @app.get("/protected", dependencies=[Depends(require_auth)])
    async def protected_endpoint(): ...
"""

from __future__ import annotations

import hmac
import logging
import os
import time
import uuid
import secrets
import urllib.parse
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Optional

import httpx
import jwt
from fastapi import APIRouter, Cookie, HTTPException, Request, Response, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import firebase_admin
from firebase_admin import auth as firebase_auth

from core import database

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration (loaded lazily to avoid circular imports)
# ---------------------------------------------------------------------------
_SESSION_LIFETIME_HOURS = 24
_MAX_FAILED_ATTEMPTS = 5
_LOCKOUT_SECONDS = 60

# In-memory rate limiter state
_failed_attempts: Dict[str, list] = defaultdict(list)


_cached_fallback_secret: Optional[str] = None


def _get_auth_settings():
    """Load auth settings from config (lazy to avoid import cycles)."""
    global _cached_fallback_secret
    from core.config import get_settings

    s = get_settings()
    secret = s.genx_auth_secret
    if not secret:
        # Generate a fallback secret ONCE and cache it for the process lifetime.
        # Without this, os.urandom() would produce a new secret on every call,
        # making every previously-issued token immediately invalid.
        if _cached_fallback_secret is None:
            _cached_fallback_secret = os.urandom(32).hex()
            logger.warning(
                "⚠ GENX_AUTH_SECRET not set — using auto-generated secret. "
                "Sessions will NOT survive server restarts."
            )
        secret = _cached_fallback_secret
    return {
        "username": s.genx_admin_username,
        "password": s.genx_admin_password,
        "secret": secret,
        "google_client_id": s.google_client_id,
        "google_client_secret": s.google_client_secret,
        "app_base_url": s.app_base_url,
    }


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------
def _create_token(username: str, secret: str) -> str:
    """Create a signed JWT with 24h expiration."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "iat": now,
        "exp": now + timedelta(hours=_SESSION_LIFETIME_HOURS),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def _decode_token(token: str, secret: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a JWT. Returns payload or None on failure."""
    try:
        return jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        logger.debug("Session token expired.")
        return None
    except jwt.InvalidTokenError as exc:
        logger.debug("Invalid session token: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------
def _check_rate_limit(client_ip: str) -> bool:
    """
    Check if the client IP is rate-limited.
    Returns True if the request should be BLOCKED.
    """
    now = time.time()
    # Clean old entries (older than lockout window)
    _failed_attempts[client_ip] = [
        t for t in _failed_attempts[client_ip]
        if now - t < _LOCKOUT_SECONDS
    ]
    return len(_failed_attempts[client_ip]) >= _MAX_FAILED_ATTEMPTS


def _record_failed_attempt(client_ip: str) -> None:
    """Record a failed login attempt for rate limiting."""
    _failed_attempts[client_ip].append(time.time())


def _clear_failed_attempts(client_ip: str) -> None:
    """Clear failed attempts on successful login."""
    _failed_attempts.pop(client_ip, None)


# ---------------------------------------------------------------------------
# Cookie helpers
# ---------------------------------------------------------------------------
_COOKIE_NAME = "luna_session"
_LEGACY_COOKIE_NAME = "genx_session"


def _is_production() -> bool:
    """Detect if running in production (HTTPS / cross-origin)."""
    return bool(os.environ.get("PRODUCTION") or os.environ.get("AWS_EXECUTION_ENV"))


def _set_auth_cookie(response: Response, token: str) -> None:
    """Set the session cookie with security flags."""
    prod = _is_production()
    response.set_cookie(
        key=_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="none" if prod else "lax",
        secure=prod,
        max_age=_SESSION_LIFETIME_HOURS * 3600,
        path="/",
    )


def _clear_auth_cookie(response: Response) -> None:
    """Clear the session cookie."""
    prod = _is_production()
    for cookie_name in (_COOKIE_NAME, _LEGACY_COOKIE_NAME):
        response.delete_cookie(
            key=cookie_name,
            httponly=True,
            samesite="none" if prod else "lax",
            secure=prod,
            path="/",
        )


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    username: str
    password: str


class FirebaseLoginRequest(BaseModel):
    id_token: str


class AuthStatus(BaseModel):
    authenticated: bool
    username: Optional[str] = None
    expires_at: Optional[str] = None
    token: Optional[str] = None  # JWT returned in body for cross-origin clients


# ---------------------------------------------------------------------------
# FastAPI dependency: require_auth
# ---------------------------------------------------------------------------
async def require_auth(
    request: Request,
    luna_session: Optional[str] = Cookie(None),
    legacy_session: Optional[str] = Cookie(None, alias=_LEGACY_COOKIE_NAME),
) -> Dict[str, Any]:
    """
    FastAPI dependency that validates auth via:
      1. Authorization: Bearer <token> header (cross-origin / production)
      2. Luna session cookie (same-origin / development)
         Legacy session cookies remain accepted for existing sessions.
    """
    settings = _get_auth_settings()
    token = None

    # 1. Check Authorization header first
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]

    # 2. Fallback to cookie
    if not token:
        token = luna_session or legacy_session

    if not token:
        raise HTTPException(status_code=401, detail="Authentication required.")

    payload = _decode_token(token, settings["secret"])

    if payload is None:
        raise HTTPException(status_code=401, detail="Session expired or invalid.")

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token payload.")
        
    # Legacy / Environment admin check
    if sub == settings["username"] and settings["username"]:
        return {"id": sub, "role": "admin", "email": sub, "username": sub}
        
    # Database user check
    user = database.get_user_by_id(sub)
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists.")
        
    return user


async def require_admin(
    user: Dict[str, Any] = Depends(require_auth)
) -> Dict[str, Any]:
    """
    FastAPI dependency that requires admin privileges.
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Administrator privileges required.")
    return user


# ---------------------------------------------------------------------------
# Auth router
# ---------------------------------------------------------------------------
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post("/login", response_model=AuthStatus)
async def login(body: LoginRequest, request: Request, response: Response):
    """
    Authenticate the operator and set a session cookie.
    Rate-limited: 5 failed attempts → 60s lockout.
    """
    client_ip = request.client.host if request.client else "unknown"

    # Rate limit check
    if _check_rate_limit(client_ip):
        logger.warning("⛔ Login rate-limited for IP: %s", client_ip)
        raise HTTPException(
            status_code=429,
            detail="Too many failed attempts. Please wait 60 seconds.",
        )

    settings = _get_auth_settings()

    # Validate credentials configured
    if not settings["username"] or not settings["password"]:
        logger.error("Auth credentials not configured in .env")
        raise HTTPException(
            status_code=500,
            detail="Authentication not configured. Set LUNA_ADMIN_USERNAME and LUNA_ADMIN_PASSWORD in .env",
        )

    # Timing-safe credential comparison
    username_match = hmac.compare_digest(
        body.username.encode("utf-8"),
        settings["username"].encode("utf-8"),
    )
    password_match = hmac.compare_digest(
        body.password.encode("utf-8"),
        settings["password"].encode("utf-8"),
    )

    if not (username_match and password_match):
        _record_failed_attempt(client_ip)
        remaining = _MAX_FAILED_ATTEMPTS - len(_failed_attempts.get(client_ip, []))
        logger.warning(
            "⚠ Failed login attempt from %s (user: %s, %d attempts remaining)",
            client_ip, body.username, max(remaining, 0),
        )
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    # Success
    _clear_failed_attempts(client_ip)
    token = _create_token(body.username, settings["secret"])
    _set_auth_cookie(response, token)

    # Calculate expiry for response
    exp_time = datetime.now(timezone.utc) + timedelta(hours=_SESSION_LIFETIME_HOURS)

    logger.info("✔ Successful login from %s (user: %s)", client_ip, body.username)

    return AuthStatus(
        authenticated=True,
        username=body.username,
        expires_at=exp_time.isoformat(),
        token=token,
    )


@auth_router.post("/logout", response_model=AuthStatus)
async def logout(response: Response):
    """Clear the session cookie and log out."""
    _clear_auth_cookie(response)
    return AuthStatus(authenticated=False)


@auth_router.post("/firebase/login", response_model=AuthStatus)
async def firebase_login(body: FirebaseLoginRequest, response: Response):
    """Handle Firebase login by verifying ID token and establishing backend session."""
    settings = _get_auth_settings()
    
    # Initialize Firebase Admin SDK if not already done
    try:
        if not firebase_admin._apps:
            from core.config import get_settings
            from firebase_admin import credentials
            import json
            
            app_settings = get_settings()
            if app_settings.firebase_credentials_json:
                cert = credentials.Certificate(json.loads(app_settings.firebase_credentials_json))
                firebase_admin.initialize_app(cert)
            else:
                firebase_admin.initialize_app()
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        raise HTTPException(status_code=500, detail="Authentication server configuration error.")
    
    try:
        # Verify the Firebase ID token
        decoded_token = firebase_auth.verify_id_token(body.id_token)
    except Exception as e:
        logger.error(f"Failed to verify Firebase ID token: {e}")
        raise HTTPException(status_code=401, detail="Invalid Firebase token.")
        
    google_subject_id = decoded_token.get("sub")
    email = decoded_token.get("email")
    display_name = decoded_token.get("name", "")
    avatar = decoded_token.get("picture", "")
    
    if not google_subject_id or not email:
        logger.error("Missing subject ID or email in Google profile.")
        raise HTTPException(status_code=400, detail="Incomplete Google profile.")
        
    # Link or create user
    user = database.get_user_by_google_id(google_subject_id)
    if not user:
        # Grant admin role to all newly registered users
        role = "admin"
        
        existing = database.get_user_by_email(email)
        if existing:
            database.update_user_google_id(existing["id"], google_subject_id)
            user_id = existing["id"]
        else:
            user_id = str(uuid.uuid4())
            database.create_user(
                user_id=user_id,
                email=email,
                display_name=display_name,
                avatar=avatar,
                google_subject_id=google_subject_id,
                role=role,
            )
    else:
        user_id = user["id"]
        
    token = _create_token(user_id, settings["secret"])
    _set_auth_cookie(response, token)
    
    exp_time = datetime.now(timezone.utc) + timedelta(hours=_SESSION_LIFETIME_HOURS)
    
    return AuthStatus(
        authenticated=True,
        username=email,
        expires_at=exp_time.isoformat(),
        token=token,
    )


@auth_router.get("/me", response_model=AuthStatus)
async def me(
    request: Request,
    luna_session: Optional[str] = Cookie(None),
    legacy_session: Optional[str] = Cookie(None, alias=_LEGACY_COOKIE_NAME),
):
    """
    Check current authentication status.
    Accepts Bearer token or session cookie.
    """
    settings = _get_auth_settings()
    token = None

    # Check Authorization header first
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]

    # Fallback to cookie
    if not token:
        token = luna_session or legacy_session

    if not token:
        return AuthStatus(authenticated=False)

    payload = _decode_token(token, settings["secret"])

    if payload is None:
        return AuthStatus(authenticated=False)

    # Legacy sub handling
    sub = payload.get("sub")
    if sub == settings["username"] and settings["username"]:
        username = sub
    else:
        user = database.get_user_by_id(sub)
        username = user["email"] if user else None

    if not username:
        return AuthStatus(authenticated=False)

    exp_time = datetime.fromtimestamp(payload.get("exp", 0), tz=timezone.utc)
    return AuthStatus(
        authenticated=True,
        username=username,
        expires_at=exp_time.isoformat(),
    )
