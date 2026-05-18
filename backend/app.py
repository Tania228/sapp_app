"""
Точка входа
Создание FastAPI
"""

from fastapi import FastAPI
from routers import report 


app = FastAPI(title="САПП Контакты без сделок")

app.include_router(report.router)

# тестовый ендпоинт (проверка работы сервера)
@app.get("/ping")
def ping():
    return {"message": "pong"}