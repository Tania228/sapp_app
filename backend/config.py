"""
Настройки
Читает .env
"""

import os
from dotenv import load_dotenv

load_dotenv()

BITRIX24_WEBHOOK = os.getenv("BITRIX24_WEBHOOK", "mock-webhook-for-development")
DEBUG = True

