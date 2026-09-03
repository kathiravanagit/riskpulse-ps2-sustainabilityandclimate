import base64
import hashlib
import hmac
import json
import secrets
import time

from fastapi import APIRouter, Depends, Header, HTTPException
from app.config import settings
from app.db.mongodb import get_database
from app.models.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"{base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def _check_password(password: str, encoded: str) -> bool:
    salt, expected = encoded.split("$", 1)
    actual = _hash_password(password, base64.urlsafe_b64decode(salt)).split("$", 1)[1]
    return hmac.compare_digest(actual, expected)


def _token(user: dict) -> str:
    payload = {"email": user["email"], "role": user["role"], "exp": int(time.time()) + settings.AUTH_TOKEN_TTL_SECONDS}
    body = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = hmac.new(settings.AUTH_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
    return f"{body}.{signature}"


def _user_response(user: dict) -> UserResponse:
    return UserResponse(email=user["email"], name=user["name"], role=user["role"])


async def current_user(authorization: str | None = Header(default=None)) -> UserResponse:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        body, signature = authorization[7:].split(".", 1)
        expected = hmac.new(settings.AUTH_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
        payload = json.loads(base64.urlsafe_b64decode(body + "===").decode())
        if not hmac.compare_digest(signature, expected) or payload["exp"] < time.time():
            raise ValueError
        user = await get_database()["users"].find_one({"email": payload["email"]})
        if not user:
            raise ValueError
        return _user_response(user)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(request: RegisterRequest):
    db = get_database()
    email = request.email.strip().lower()
    if await db["users"].find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = {"email": email, "name": request.name.strip(), "password_hash": _hash_password(request.password), "role": "viewer"}
    await db["users"].insert_one(user)
    return TokenResponse(access_token=_token(user), user=_user_response(user))


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    db = get_database()
    user = await db["users"].find_one({"email": request.email.strip().lower()})
    if not user or not _check_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(access_token=_token(user), user=_user_response(user))


@router.get("/me", response_model=UserResponse)
async def me(user: UserResponse = Depends(current_user)):
    return user