from typing import List
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlmodel import Session, select

from .db import create_db_and_tables, get_session
from .models import Entry, EntryCreate
from .models_user import User, UserCreate
from .security import hash_password, verify_password, create_token
print("Models imported successfully")

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)


# @app.post("/entry")
# def create_entry(entry: Entry, session: Session = Depends(get_session)):
#     session.add(entry)
#     session.commit()
#     session.refresh(entry)
#     return entry


@app.post("/entry")
def create_entry(entry: EntryCreate, session: Session = Depends(get_session)):
    db_entry = Entry(**entry.dict())
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)
    return db_entry


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


@app.get("/entries", response_model=List[Entry])
def list_entries(session: Session = Depends(get_session)):
    entries = session.exec(select(Entry)).all()
    return entries


@app.put("/entry/{entry_id}")
def update_entry(entry_id: int, entry: EntryCreate, session: Session = Depends(get_session)):
    existing_entry = session.get(Entry, entry_id)
    if not existing_entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    existing_entry.date = entry.date
    existing_entry.mood = entry.mood
    existing_entry.note = entry.note

    session.add(existing_entry)
    session.commit()
    session.refresh(existing_entry)
    return existing_entry


@app.delete("/entry/{entry_id}")
def delete_entry(entry_id: int, session: Session = Depends(get_session)):
    existing_entry = session.get(Entry, entry_id)
    if not existing_entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    session.delete(existing_entry)
    session.commit()
    return {"message": "Entry deleted successfully"}


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}
