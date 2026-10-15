"""Verify WSO2 Asgardeo JWT access tokens for CV Validator PRO."""

import logging
import os
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError, PyJWKClientError

logger = logging.getLogger("uvicorn.error")
_bearer = HTTPBearer(auto_error=False)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="A valid Asgardeo access token is required",
        headers={"WWW-Authenticate": "Bearer"},
    )


@lru_cache(maxsize=4)
def _jwks_client(url: str) -> PyJWKClient:
    return PyJWKClient(url, cache_jwk_set=True, lifespan=300)


def require_cv_api_access(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    """Validate signature, issuer, audience, expiration, and required API scope."""

    if credentials is None or credentials.scheme.lower() != "bearer":
        logger.warning("[JWT AUTH] Missing Bearer access token")
        raise _unauthorized()

    issuer = os.getenv("ASGARDEO_ISSUER", "").strip()
    audience = os.getenv("ASGARDEO_API_AUDIENCE", "").strip()
    jwks_url = os.getenv("ASGARDEO_JWKS_URL", "").strip()
    required_scope = os.getenv("ASGARDEO_API_SCOPE", "cv:use").strip()

    if not all((issuer, audience, jwks_url, required_scope)):
        logger.error("[JWT AUTH] Required OAuth configuration is missing")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend OAuth configuration is incomplete",
        )

    if not issuer.startswith("https://") or not jwks_url.startswith("https://"):
        logger.error("[JWT AUTH] Issuer/JWKS must use HTTPS")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Invalid backend OAuth configuration",
        )

    try:
        signing_key = _jwks_client(jwks_url).get_signing_key_from_jwt(
            credentials.credentials
        )

        claims = jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=["RS256"],
            audience=audience,
            issuer=issuer,
            options={"require": ["exp", "iss", "aud", "sub"]},
            leeway=30,
        )

    except PyJWKClientError as exc:
        logger.warning(
            "[JWT AUTH] Signing key lookup failed: %s",
            type(exc).__name__,
        )
        # Unknown key IDs are invalid tokens; a JWKS/network failure is not.
        if "Unable to find a signing key" in str(exc):
            raise _unauthorized() from exc
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to validate authentication right now",
        ) from exc

    except InvalidTokenError as exc:
        # Includes invalid audience, signature, expiration and malformed JWTs.
        logger.warning(
            "[JWT AUTH] Token validation failed: %s",
            type(exc).__name__,
        )
        raise _unauthorized() from exc

    except Exception as exc:
        logger.error(
            "[JWT AUTH] Authentication validation unavailable: %s",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication validation unavailable",
        ) from exc

    raw_scope = claims.get("scope", "")
    if isinstance(raw_scope, str):
        scopes = set(raw_scope.split())
    elif isinstance(raw_scope, list) and all(
        isinstance(scope, str) for scope in raw_scope
    ):
        scopes = set(raw_scope)
    else:
        scopes = set()

    if required_scope not in scopes:
        logger.warning("[JWT AUTH] Valid token is missing required API scope")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient scope for CV API",
        )

    return claims
