# Контакты без сделок

Приложение для формирования отчета по контактам Bitrix24 без сделок или без сделок определенных типов. Проект состоит из отдельного frontend-интерфейса и backend API, которое возвращает данные для отчета и умеет формировать Excel-файл.

## Текущее состояние проекта

Сейчас backend работает на моковых данных:

- `get_filtered_contacts()` возвращает заранее заданный список контактов;
- клиент для Bitrix24 пока не реализован;
- frontend уже содержит форму фильтров и элементы интерфейса, но еще не отправляет реальные запросы на backend и не отображает отчет из API.

## Архитектура

```text
app_contacts_without_transactions/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models/
│   │   └── filters.py
│   ├── routers/
│   │   └── report.py
│   └── services/
│       ├── bitrix_client.py
│       ├── excel_service.py
│       ├── mock_data.py
│       └── report_generator.py
└── frontend/
    ├── index.html
    ├── package.json
    └── src/
        ├── main.ts
        ├── style.css
        └── assets/
```

### Backend

Backend построен на FastAPI.

- `backend/app.py` — точка входа приложения, создание `FastAPI` и подключение роутеров.
- `backend/routers/report.py` — HTTP-слой:
  - `POST /api/generate-report` — возвращает список контактов;
  - `POST /api/download-excel` — возвращает Excel-файл.
- `backend/models/filters.py` — Pydantic-модели входных фильтров и структуры ответа.
- `backend/services/report_generator.py` — бизнес-логика получения и подготовки контактов. Сейчас здесь находятся моковые данные.
- `backend/services/excel_service.py` — генерация Excel-файла через `pandas` и `openpyxl`.
- `backend/services/bitrix_client.py` — заготовка под интеграцию с Bitrix24.
- `backend/config.py` — чтение настроек из `.env`, в том числе `BITRIX24_WEBHOOK`.

### Frontend

Frontend написан на TypeScript без фреймворка и собирается через Vite.

- `frontend/index.html` — основная разметка страницы;
- `frontend/src/main.ts` — логика dropdown-элементов, фильтров и кнопок;
- `frontend/src/style.css` — стили интерфейса.

На текущем этапе frontend реализует только поведение интерфейса. Интеграцию с backend еще нужно добавить отдельно.

### Поток данных

1. Пользователь выбирает фильтры в интерфейсе.
2. Frontend должен отправить фильтры на backend.
3. Backend валидирует тело запроса через `FormFilters`.
4. `report_generator` получает контакты и данные по сделкам.
5. Backend возвращает:
   - JSON-отчет через `/api/generate-report`;
   - Excel-файл через `/api/download-excel`.

## Что нужно изменить при подключении реального API Bitrix24

Сейчас главный переход с моков на реальную интеграцию должен происходить в backend.

### 1. Настроить переменные окружения

Создать файл `.env` в корне проекта или рядом с backend-конфигурацией и указать реальный webhook:

```env
BITRIX24_WEBHOOK=https://your-domain.bitrix24.ru/rest/...
```

`backend/config.py` уже читает эту переменную.

### 2. Реализовать `bitrix_client.py `

В `backend/services/bitrix_client.py` нужно добавить работу с `fast-bitrix24`:

- инициализацию клиента по `BITRIX24_WEBHOOK`;
- методы получения контактов;
- методы получения сделок контакта;
- при необходимости — методы получения сотрудников и расшифровки `ASSIGNED_BY_ID`.

### 3. Заменить моковые данные в `report_generator.py`

Сейчас `get_filtered_contacts()` возвращает жестко заданный список. Вместо этого нужно:

- получить контакты из Bitrix24;
- применить фильтры по дате создания, дате изменения и ответственным;
- получить связанные сделки;
- вычислить поля:
  - `has_deals`;
  - `has_active_deals`;
  - `has_successful_deals`;
  - `has_lost_deals`;
- вернуть список объектов `ReportOnRequests`.

### 4. Сопоставить фильтры проекта с полями Bitrix24

Нужно определить соответствия между моделями проекта и REST API Bitrix24:

- `created_date` → дата создания контакта;
- `date_of_change` → дата изменения контакта;
- `responsible_ids` → ответственный сотрудник;
- `status_transaction` → состояние связанных сделок.

Также потребуется явно определить, какие статусы Bitrix24 считаются:

- активной сделкой;
- успешной сделкой;
- проигранной сделкой.

### 5. Доработать frontend-интеграцию

В `frontend/src/main.ts` нужно добавить:

- сбор выбранных фильтров в формате `FormFilters`;
- `fetch`-запрос на `POST /api/generate-report`;
- вывод полученного отчета на страницу;
- запрос на `POST /api/download-excel` для скачивания файла;
- обработку состояний загрузки и ошибок.

### 6. Проверить CORS и раздельный запуск frontend/backend

Если frontend и backend будут запускаться на разных портах, в FastAPI нужно будет добавить CORS middleware, чтобы браузер разрешал запросы между ними.

## Как запустить проект

### Backend

1. Перейти в папку `backend`:

```bash
cd backend
```

2. Создать и активировать виртуальное окружение:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

3. Установить зависимости:

```bash
pip install -r requirements.txt
```

4. Запустить сервер:

```bash
uvicorn app:app --reload
```

После запуска backend будет доступен по адресу:

```text
http://127.0.0.1:8000
```

Проверка:

```text
GET http://127.0.0.1:8000/ping
```

Swagger-документация:

```text
http://127.0.0.1:8000/docs
```

### Frontend

1. Перейти в папку `frontend`:

```bash
cd frontend
```

2. Установить зависимости:

```bash
npm install
```

3. Запустить dev-сервер:

```bash
npm run dev
```

После запуска Vite обычно поднимет интерфейс по адресу:

```text
http://localhost:5173
```

## Используемые технологии

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- python-dotenv
- fast-bitrix24
- pandas
- openpyxl

### Frontend

- TypeScript
- Vite
- HTML
- CSS

## API

### `POST /api/generate-report`

Принимает фильтры и возвращает список контактов.

Пример тела запроса:

```json
{
  "created_date": {
    "type": "preset",
    "value": "this_month"
  },
  "date_of_change": {
    "type": "preset",
    "value": "any"
  },
  "responsible_ids": [42, 57],
  "status_transaction": ["no_deals"]
}
```

### `POST /api/download-excel`

Принимает те же фильтры и возвращает файл `contacts_report.xlsx`.

## Что стоит сделать следующим

- реализовать настоящий `bitrix_client`;
- вынести моковые данные из `report_generator.py` или удалить их после подключения API;
- подключить frontend к backend;
- добавить CORS;
- покрыть фильтрацию тестами;
- добавить обработку ошибок Bitrix24 API и логирование.
