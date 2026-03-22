from typing import List
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from .db import create_db_and_tables, get_session
from .models import Entry, EntryCreate
from .models_user import User, UserCreate
from .security import hash_password, verify_password, create_token, decode_token
# print("Models imported successfully")
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# _scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
#     payload = decode_token(token)
#     if not payload or "user_id" not in payload:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token")

#     user = session.get(User, payload["user_id"])
#     if not user:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

#     return user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
):
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = decode_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("error") == "expired":
        raise HTTPException(status_code=401, detail="Token expired")

    user = session.get(User, payload["user_id"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # ⭐ NEW: issue a refreshed token (sliding expiration)
    new_token = create_token({
        "user_id": user.id,
        "username": user.username
    })

    # return both user and refreshed token
    return {"user": user, "new_token": new_token}

# @app.post("/entry")
# def create_entry(entry: Entry, session: Session = Depends(get_session)):
#     session.add(entry)
#     session.commit()
#     session.refresh(entry)
#     return entry

# @app.post("/entry")
# def create_entry(entry: EntryCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
#     db_entry = Entry(**entry.dict(), user_id=current_user.id)
#     session.add(db_entry)
#     session.commit()
#     session.refresh(db_entry)
#     return db_entry
@app.post("/entry")
def create_entry(
    entry: EntryCreate,
    session: Session = Depends(get_session),
    current = Depends(get_current_user)
):
    user = current["user"]
    new_token = current["new_token"]

    db_entry = Entry(**entry.dict(), user_id=user.id)
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)

    return {"entry": db_entry, "token": new_token}

# @app.get("/entries", response_model=List[Entry])
# def list_entries(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
#     entries = session.exec(select(Entry).where(Entry.user_id == current_user.id)).all()
#     return entries
@app.get("/entries")
def list_entries(
    session: Session = Depends(get_session),
    current = Depends(get_current_user)
):
    user = current["user"]
    new_token = current["new_token"]

    entries = session.exec(
        select(Entry).where(Entry.user_id == user.id)
    ).all()

    return {"entries": entries, "token": new_token}


# @app.put("/entry/{entry_id}")
# def update_entry(entry_id: int, entry: EntryCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
#     existing_entry = session.get(Entry, entry_id)
#     if not existing_entry or existing_entry.user_id != current_user.id:
#         raise HTTPException(status_code=404, detail="Entry not found")

#     existing_entry.date = entry.date
#     existing_entry.mood = entry.mood
#     existing_entry.note = entry.note

#     session.add(existing_entry)
#     session.commit()
#     session.refresh(existing_entry)
#     return existing_entry
@app.put("/entry/{entry_id}")
def update_entry(
    entry_id: int,
    entry: EntryCreate,
    session: Session = Depends(get_session),
    current = Depends(get_current_user)
):
    user = current["user"]
    new_token = current["new_token"]

    existing_entry = session.get(Entry, entry_id)
    if not existing_entry or existing_entry.user_id != user.id:
        raise HTTPException(status_code=404, detail="Entry not found")

    existing_entry.date = entry.date
    existing_entry.mood = entry.mood
    existing_entry.note = entry.note

    session.add(existing_entry)
    session.commit()
    session.refresh(existing_entry)

    return {"entry": existing_entry, "token": new_token}

# @app.delete("/entry/{entry_id}")
# def delete_entry(entry_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
#     existing_entry = session.get(Entry, entry_id)
#     if not existing_entry or existing_entry.user_id != current_user.id:
#         raise HTTPException(status_code=404, detail="Entry not found")

#     session.delete(existing_entry)
#     session.commit()
#     return {"message": "Entry deleted successfully"}
@app.delete("/entry/{entry_id}")
def delete_entry(
    entry_id: int,
    session: Session = Depends(get_session),
    current = Depends(get_current_user)
):
    user = current["user"]
    new_token = current["new_token"]

    existing_entry = session.get(Entry, entry_id)
    if not existing_entry or existing_entry.user_id != user.id:
        raise HTTPException(status_code=404, detail="Entry not found")

    session.delete(existing_entry)
    session.commit()

    return {"message": "Entry deleted successfully", "token": new_token}


@app.post("/auth/signup")
def register_user(user: UserCreate, session: Session = Depends(get_session)):
    try:
        # Check if user already exists
        existing_user = session.exec(select(User).where(User.username == user.username)).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")

        hashed_password = hash_password(user.password)
        db_user = User(username=user.username, hashed_password=hashed_password)
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return {"message": "User created successfully", "user_id": db_user.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/auth/login")
def login_user(user: UserCreate, session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(User.username == user.username)).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_token({"user_id": db_user.id, "username": db_user.username})
    return {"message": "Login successful", "token": token}


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


@app.get("/health")
def health_checoauth2k():
    return {"status": "ok"}
