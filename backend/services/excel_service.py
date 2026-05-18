"""
Генерация Excel-файла (pandas/openpyxl)
"""

import pandas 
from io import BytesIO


def generate_excel(data: list[dict]) -> BytesIO:
    """ Генерирует exel-файл из списка словарей """

    data_frame = pandas.DataFrame(data)
    output = BytesIO()

    with pandas.ExcelWriter(output, engine='openpyxl') as writen:
        data_frame.to_excel(writen, index=False, sheet_name='Контакты')
        
    output.seek(0)
    return output