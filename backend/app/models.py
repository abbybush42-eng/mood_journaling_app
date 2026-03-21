from datetime import date
from typing import Optional

from sqlmodel import Field, SQLModel


class Entry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: date
    mood: int
    note: Optional[str] = None


class EntryCreate(SQLModel):
    date: date
    mood: int = Field(ge=1, le=5)
    note: Optional[str] = None
