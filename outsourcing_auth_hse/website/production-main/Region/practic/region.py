from flask import Flask, jsonify, request, render_template, redirect, url_for, session
import os # Добавим импорт os для генерации секретного ключа

app = Flask(__name__)
app.secret_key = os.urandom(24) # Добавим секретный ключ для использования сессий

# Пример хранилища данных (временное решение для демонстрации)
regions = [
    {'id': 1, 'name': 'Москва', 'coords': [55.7558, 37.6173]},
    {'id': 2, 'name': 'Санкт-Петербург', 'coords': [59.9343, 30.3351]},
    {'id': 3, 'name': 'Новосибирск', 'coords': [55.0301, 82.9204]},
    {'id': 4, 'name': 'Екатеринбург', 'coords': [56.8389, 60.6057]}
]

# Убрали глобальную переменную current_region, будем использовать сессии

# Главная страница - отображение формы и текущего региона
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        region_id_str = request.form.get('region_id')
        if region_id_str:
            try:
                region_id = int(region_id_str)
                region = next((r for r in regions if r['id'] == region_id), None)
                if region:
                    session['current_region'] = region
                else:
                    # Можно добавить обработку ошибки, если ID не найден, но пока просто игнорируем
                    pass 
            except ValueError:
                 # Обработка случая, если region_id не число
                 pass
        else:
            # Если пришел пустой выбор, можно сбросить регион или игнорировать
             session.pop('current_region', None) # Пример сброса при пустом выборе

        # После POST запроса перенаправляем на GET, чтобы избежать повторной отправки формы
        return redirect(url_for('index'))

    # Для GET запроса просто отображаем страницу
    current_region = session.get('current_region')
    return render_template('index.html', regions=regions, current_region=current_region)

# Маршрут для сброса текущего региона
@app.route('/reset', methods=['POST'])
def reset_region():
    session.pop('current_region', None)
    return redirect(url_for('index'))

# Удаляем старые API эндпоинты, так как теперь все через веб-интерфейс
# @app.route('/regions', methods=['GET'])
# def get_regions():
#     return jsonify({'regions': regions})
# 
# @app.route('/region', methods=['POST'])
# def set_region():
#     ...
# 
# @app.route('/region', methods=['GET'])
# def get_current_region():
#    ...

if __name__ == '__main__':
    app.run(debug=True)