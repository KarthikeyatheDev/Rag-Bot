from pydantic import BaseModel


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    
class ConversationCreate(BaseModel):
    pass

class ConversationUpdate(BaseModel):
    title: str