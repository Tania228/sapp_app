"""
Эндпоинты
"""

from fastapi import APIRouter, HTTPException
from models.filters import FormFilters, ReportOnRequests
from services.report_generator import get_filtered_contacts
# from fastapi.responses import JSONResponse, Response
from services.excel_service import generate_excel
from fastapi.responses import StreamingResponse


router = APIRouter(prefix="/api", tags=["report"])

@router.post("/generate-report", response_model=list[ReportOnRequests])
async def generate_report(filters: FormFilters) -> list[ReportOnRequests]:
    """ Возвращает отфильтрованные данные """

    print(f"Получено: {filters}")

    try:
        contacts = await get_filtered_contacts(filters)
    except:
        raise HTTPException(status_code=404, detail="Данные отсутствуют")
    
    return contacts


@router.post("/download-excel")
async def download_excel(filters: FormFilters) -> StreamingResponse:
    """ Скачать отчет в exel """

    try:
        contacts = await get_filtered_contacts(filters)
    except:
        raise HTTPException(status_code=404, detail="Нет данных для отчёта")
    
    data = [contact.model_dump() for contact in contacts]
    excel_file = generate_excel(data)

    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=contacts_report.xlsx"}
    )

