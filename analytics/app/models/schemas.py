from pydantic import BaseModel
from typing import List, Any, Dict

class ChartResponse(BaseModel):
    figure: str
    data: Dict[str, Any]
