from typing import List

from fastapi import Depends, FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlmodel import Session, select

from .db import create_db_and_tables, get_session
from .models import Entry, EntryCreate
print("Models imported successfully")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hey girl. Mood Journal API is running"}


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


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


@app.get("/entries", response_model=List[Entry])
def list_entries(session: Session = Depends(get_session)):
    entries = session.exec(select(Entry)).all()
    return entries


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}
