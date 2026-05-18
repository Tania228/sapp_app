"""
Бизнес-логика: получение и фильтрация данных

При реализации приложения:
Получение данных из Битрикс24 через fast-bitrix24
Фильтрация по датам, ответственным, статусам сделок.
добавление полей типа has_active_deals
Возврат отфильтрованного списка контактов.
"""

from models.filters import FormFilters, ReportOnRequests


async def get_filtered_contacts(filters: FormFilters) -> list[ReportOnRequests]:

    mock_contacts = [
        ReportOnRequests(
            id=1,
            first_name="Иван",
            last_name="Иванов",
            patronymic="Иванович",
            responsible_name="Петров П.",
            created_time="2025-05-01",
            updated_time="2025-05-10",
            has_deals=False,
            has_active_deals=False,
            has_successful_deals=False,
            has_lost_deals=False,
        ),
        ReportOnRequests(
            id=2,
            first_name="Мария",
            last_name="Петрова",
            patronymic=None,
            responsible_name="Сидорова А.",
            created_time="2025-05-02",
            updated_time="2025-05-11",
            has_deals=True,
            has_active_deals=True,
            has_successful_deals=False,
            has_lost_deals=False,
        ),
    ]
    
    
    return mock_contacts

