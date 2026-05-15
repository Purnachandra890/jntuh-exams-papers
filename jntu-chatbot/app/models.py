from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    query: str

class SourceMetadata(BaseModel):
    id: str
    subject: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[str] = None
    examType: Optional[str] = None
    status: Optional[str] = None
    fileUrl: Optional[str] = None
    distance: float

class ChatResponse(BaseModel):
    success: bool
    answer: str
    sources: List[SourceMetadata] = []
