"""
Файл с описанием структур данных, которые приходят от клиента,
возвращаются с сервера
"""

from pydantic import BaseModel, Field
from datetime import date 
from typing import Literal, Union, List, Annotated


# Валидация даты
class PresetDate(BaseModel):
    type: Literal["preset"]
    value: str   

class ExactDate(BaseModel):
    type: Literal["exact"]
    value: date

class RangeDate(BaseModel):
    type: Literal["range"]
    from_date: date
    to_date: date

# Дискриминатор для Union
PresetDate = Annotated[PresetDate, Field(discriminator='type')]
ExactDate = Annotated[ExactDate, Field(discriminator='type')]
RangeDate = Annotated[RangeDate, Field(discriminator='type')]

DateValidator = Union[PresetDate, ExactDate, RangeDate]


# Фильтруем то, что приходит от клиента
class FormFilters(BaseModel):
    created_date: DateValidator                 
    date_of_change: DateValidator               
    responsible_ids: List[int]
    status_transaction: List[str]


# Ответ от сервера 
class ReportOnRequests(BaseModel):
    id: int
    first_name: str
    last_name: str
    patronymic: str | None = None
    responsible_name: str | None = None
    created_time: str | None = None
    updated_time: str | None = None
    has_deals: bool = False
    has_active_deals: bool = False
    has_successful_deals: bool = False
    has_lost_deals: bool = False