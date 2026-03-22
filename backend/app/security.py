from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=False)

SECRET = "supersecret"  # replace later with env var
ALGORITHM = "HS256"

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# def create_token(data: dict):
#     return jwt.encode(data, SECRET, algorithm=ALGORITHM)

def create_token(data: dict, expires_in_minutes: int = 60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET, algorithm=ALGORITHM)

# def decode_token(token: str):
#     try:
#         return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
#     except JWTError:
#         return None

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        return {"error": "expired"}
    except JWTError:
        return None