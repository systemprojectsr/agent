from telegram import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove, Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    filters,
    CallbackQueryHandler,
    CallbackContext,
    ConversationHandler,
    PicklePersistence,
)
import sqlite3
import logging
import os
from datetime import datetime

# Создаем директорию data, если она не существует
if not os.path.exists('data'):
    os.makedirs('data')

# ID пользователя техподдержки (замените на реальный ID)
SUPPORT_USER_ID = 525174974  # Замените на реальный ID сотрудника техподдержки

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    filename='data/bot.log'  # Логи сохраняем в папку data
)
logger = logging.getLogger(__name__)

# Состояния для ConversationHandler
REG_NAME, REG_AGE, REG_CITY, REG_EXP, REG_INCOME, REG_PHOTO = range(6)
VIEW_CURRENT_ORDERS, VIEW_COMPLETED_ORDERS, ORDER_DETAILS, PHOTO_REPORT = range(6, 10)
SUPPORT_STATE = 10  # Новое состояние для техподдержки

# Инициализация базы данных
conn = sqlite3.connect('data/bot_database.db', check_same_thread=False)
cursor = conn.cursor()

# Создание таблиц
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        full_name TEXT,
        age INTEGER,
        city TEXT,
        experience TEXT,
        desired_income INTEGER,
        photo_id TEXT
    )
''')

# Создаем таблицу orders, если её нет
cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        creation_date TEXT,
        creation_time TEXT,
        completion_date TEXT,
        completion_time TEXT,
        payment INTEGER,
        address TEXT,
        description TEXT,
        status TEXT,
        photo_report TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
''')

conn.commit()

# Постоянная клавиатура меню
main_keyboard = ReplyKeyboardMarkup(
    [
        [KeyboardButton("📱 Профиль"), KeyboardButton("📦 Мои заказы")],
        [KeyboardButton("💬 Поддержка"), KeyboardButton("💰 Финансы")],
        [KeyboardButton("/start")]
    ],
    resize_keyboard=True,
    is_persistent=True
)

# Клавиатура для раздела заказов
orders_keyboard = ReplyKeyboardMarkup(
    [
        [KeyboardButton("📋 Текущие заказы"), KeyboardButton("✅ Выполненные заказы")],
        [KeyboardButton("🔙 Назад")]
    ],
    resize_keyboard=True,
    is_persistent=True
)

# Клавиатура для выбора заказа
def get_order_selection_keyboard(orders, is_completed=False):
    keyboard = []
    logger.info(f"Creating keyboard for orders: {orders}")
    for order in orders:
        order_id = order[0]
        status = 'completed' if is_completed else 'active'
        callback_data = f"select_order_{order_id}_{status}"
        logger.info(f"Adding button with callback_data: {callback_data}")
        keyboard.append([InlineKeyboardButton(
            f"Заказ #{order_id}",
            callback_data=callback_data
        )])
    keyboard.append([InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")])
    return InlineKeyboardMarkup(keyboard)

# Клавиатура для деталей заказа
order_details_keyboard = InlineKeyboardMarkup([
    [InlineKeyboardButton("📸 Сделать фотоотчёт", callback_data="add_photo_report")],
    [InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")]
])

# Клавиатура после отправки фотоотчёта
complete_order_keyboard = InlineKeyboardMarkup([
    [InlineKeyboardButton("✅ Завершить заказ", callback_data="complete_order")],
    [InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")]
])

# Приветственные сообщения
WELCOME_MESSAGES = [
    "Отлично!",
    "Принял!",
    "Принял! ",
    "Так держать!",
    "Секундочку..."
]
def get_friendly_response():
    return WELCOME_MESSAGES.pop(0) if WELCOME_MESSAGES else "Принято! ✅"

def insert_test_orders():
    # Test data for orders
    test_orders = [
        # Current orders
        {
            'creation_date': '2024-03-20',
            'creation_time': '10:00:00',
            'payment': 5000,
            'address': 'ул. Тестовая, д. 1',
            'description': 'Тестовый заказ 1',
            'status': 'active'
        },
        {
            'creation_date': '2024-03-21',
            'creation_time': '14:30:00',
            'payment': 7500,
            'address': 'ул. Примерная, д. 5',
            'description': 'Тестовый заказ 2',
            'status': 'active'
        },
        # Completed orders
        {
            'creation_date': '2024-03-15',
            'creation_time': '09:00:00',
            'completion_date': '2024-03-16',
            'completion_time': '17:00:00',
            'payment': 3000,
            'address': 'ул. Завершенная, д. 3',
            'description': 'Выполненный заказ 1',
            'status': 'completed',
            'photo_report': 'test_photo_1'
        },
        {
            'creation_date': '2024-03-18',
            'creation_time': '11:00:00',
            'completion_date': '2024-03-19',
            'completion_time': '15:30:00',
            'payment': 4500,
            'address': 'ул. Готовая, д. 7',
            'description': 'Выполненный заказ 2',
            'status': 'completed',
            'photo_report': 'test_photo_2'
        }
    ]

    # Insert test orders
    for order in test_orders:
        if order['status'] == 'active':
            cursor.execute('''
                INSERT INTO orders (creation_date, creation_time, payment, 
                                  address, description, status)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                order['creation_date'],
                order['creation_time'],
                order['payment'],
                order['address'],
                order['description'],
                order['status']
            ))
        else:  # completed orders
            cursor.execute('''
                INSERT INTO orders (creation_date, creation_time, completion_date,
                                  completion_time, payment, address, description, status, photo_report)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                order['creation_date'],
                order['creation_time'],
                order['completion_date'],
                order['completion_time'],
                order['payment'],
                order['address'],
                order['description'],
                order['status'],
                order['photo_report']
            ))
    
    conn.commit()

# Обработчик команды /start
async def start(update: Update, context: CallbackContext) -> int:
    user_id = update.effective_user.id
    # Добавляем тестовые заказы для нового пользователя
    insert_test_orders()
    
    await update.message.reply_text(
        "👋 Давайте начнем регистрацию! Как вас зовут?",
        reply_markup=ReplyKeyboardRemove()
    )
    return REG_NAME

# Обработчик кнопки "Начало"
async def restart_registration(update: Update, context: CallbackContext) -> int:
    await update.message.reply_text(
        "🔄 Начинаем регистрацию заново! Как вас зовут?",
        reply_markup=ReplyKeyboardRemove()
    )
    return REG_NAME

# Обработчики для регистрации
async def register_name(update: Update, context: CallbackContext) -> int:
    context.user_data['full_name'] = update.message.text
    await update.message.reply_text(f"{get_friendly_response()} Сколько вам лет?")
    return REG_AGE

async def register_age(update: Update, context: CallbackContext) -> int:
    if not update.message.text.isdigit():
        await update.message.reply_text("Пожалуйста, введите число 🧮")
        return REG_AGE
    context.user_data['age'] = int(update.message.text)
    await update.message.reply_text(f"{get_friendly_response()} Из какого вы города? 🌆")
    return REG_CITY

async def register_city(update: Update, context: CallbackContext) -> int:
    context.user_data['city'] = update.message.text
    await update.message.reply_text(f"{get_friendly_response()} Расскажите о своем опыте работы 📝")
    return REG_EXP

async def register_exp(update: Update, context: CallbackContext) -> int:
    context.user_data['experience'] = update.message.text
    await update.message.reply_text("💼 Какой доход вы хотите получать? (введите число)")
    return REG_INCOME

async def register_income(update: Update, context: CallbackContext) -> int:
    if not update.message.text.isdigit():
        await update.message.reply_text("Пожалуйста, введите число 🧮")
        return REG_INCOME
    context.user_data['desired_income'] = int(update.message.text)
    await update.message.reply_text(f"{get_friendly_response()} 📸 Теперь загрузите свое фото для профиля")
    return REG_PHOTO

async def register_photo(update: Update, context: CallbackContext) -> int:
    photo = update.message.photo[-1]
    context.user_data['photo_id'] = photo.file_id

    user_id = update.effective_user.id

    # Проверяем, существует ли пользователь
    cursor.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
    user_exists = cursor.fetchone()

    if user_exists:
        # Обновляем данные существующего пользователя
        cursor.execute('''
            UPDATE users
            SET full_name = ?, age = ?, city = ?, experience = ?, desired_income = ?, photo_id = ?
            WHERE user_id = ?
        ''', (
            context.user_data['full_name'],
            context.user_data['age'],
            context.user_data['city'],
            context.user_data['experience'],
            context.user_data['desired_income'],
            context.user_data['photo_id'],
            user_id
        ))
    else:
        # Вставляем новую запись, если пользователь не существует
        cursor.execute('''
            INSERT INTO users (user_id, full_name, age, city, experience, desired_income, photo_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            context.user_data['full_name'],
            context.user_data['age'],
            context.user_data['city'],
            context.user_data['experience'],
            context.user_data['desired_income'],
            context.user_data['photo_id']
        ))

    conn.commit()

    await update.message.reply_text(
        "🎉 Профиль успешно обновлен!" if user_exists else "🎉 Профиль успешно создан!",
        reply_markup=main_keyboard
    )
    return ConversationHandler.END

# Обработчик отмены регистрации
async def cancel(update: Update, context: CallbackContext) -> int:
    await update.message.reply_text(
        "Регистрация отменена 😔",
        reply_markup=main_keyboard
    )
    return ConversationHandler.END

# Обработка текстовых сообщений
async def handle_message(update: Update, context: CallbackContext) -> int:
    text = update.message.text
    response = ""

    if text == "✅ Завершить заказ":
        return await complete_order(update, context)

    elif text == "📸 Сделать фотоотчёт":
        await update.message.reply_text(
            "Пожалуйста, отправьте фотографию для отчёта:",
            reply_markup=order_details_keyboard
        )
        return ORDER_DETAILS

    elif text == "📱 Профиль":
        user_id = update.effective_user.id
        cursor.execute('SELECT full_name, age, city, experience, photo_id, desired_income FROM users WHERE user_id = ?', (user_id,))
        user_data = cursor.fetchone()

        if user_data:
            response = (
                f"👤 Ваш профиль:\n\n"
                f"🏷 Имя: {user_data[0]}\n"
                f"🎂 Возраст: {user_data[1]}\n"
                f"🏙 Город: {user_data[2]}\n"
                f"💼 Опыт: {user_data[3]}\n"
                f"💵 Желаемая зарплата: {user_data[5]}р"
            )
            await context.bot.send_photo(
                chat_id=update.effective_chat.id,
                photo=user_data[4],
                caption=response,
                reply_markup=main_keyboard
            )
        else:
            await update.message.reply_text("❌ Профиль не найден. Начните с /start")
        return ConversationHandler.END

    elif text == "📦 Мои заказы":
        await update.message.reply_text(
            "Выберите тип заказов:",
            reply_markup=orders_keyboard
        )
        return VIEW_CURRENT_ORDERS

    elif text == "📋 Текущие заказы":
        await view_current_orders(update, context)
        return VIEW_CURRENT_ORDERS

    elif text == "✅ Выполненные заказы":
        await view_completed_orders(update, context)
        return VIEW_COMPLETED_ORDERS

    elif text == "🔙 Назад к заказам":
        await update.message.reply_text(
            "Выберите тип заказов:",
            reply_markup=orders_keyboard
        )
        return VIEW_CURRENT_ORDERS

    elif text == "🔙 Назад":
        await update.message.reply_text(
            "Главное меню:",
            reply_markup=main_keyboard
        )
        return ConversationHandler.END

    elif text == "💬 Поддержка":
        return await start_support_chat(update, context)

    elif text == "💰 Финансы":
        await update.message.reply_text(
            "💳 Ваш текущий баланс: 0 ₽\n"
            "🔄 Последние транзакции:\n"
            "• Нет операций",
            reply_markup=main_keyboard
        )

    else:
        await update.message.reply_text(
            "🤖 Я пока не понимаю эту команду. Используйте кнопки меню ниже 👇",
            reply_markup=main_keyboard
        )
        return ConversationHandler.END

async def view_current_orders(update: Update, context: CallbackContext) -> int:
    logger.info("Fetching current orders")
    cursor.execute('''
        SELECT order_id, creation_date, creation_time, payment, address, description 
        FROM orders 
        WHERE status = 'active'
        ORDER BY order_id
    ''')
    orders = cursor.fetchall()
    logger.info(f"Found orders: {orders}")
    
    if orders:
        response = "📋 Текущие заказы:\n\n"
        for order in orders:
            response += f"Заказ #{order[0]}\n"
        
        keyboard = get_order_selection_keyboard(orders, is_completed=False)
        logger.info(f"Created keyboard: {keyboard.to_dict()}")
        
        if update.callback_query:
            await update.callback_query.message.edit_text(
                response,
                reply_markup=keyboard
            )
        else:
            await update.message.reply_text(
                response,
                reply_markup=keyboard
            )
    else:
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
        ]])
        
        if update.callback_query:
            await update.callback_query.message.edit_text(
                "Нет текущих заказов.",
                reply_markup=keyboard
            )
        else:
            await update.message.reply_text(
                "Нет текущих заказов.",
                reply_markup=keyboard
            )
    return VIEW_CURRENT_ORDERS

async def view_completed_orders(update: Update, context: CallbackContext) -> int:
    cursor.execute('''
        SELECT order_id, creation_date, creation_time, completion_date, completion_time, 
               payment, address, description 
        FROM orders 
        WHERE status = 'completed'
        ORDER BY completion_date DESC, completion_time DESC
    ''')
    orders = cursor.fetchall()
    
    if orders:
        response = "✅ Выполненные заказы:\n\n"
        for order in orders:
            response += f"Заказ #{order[0]}\n"
        
        keyboard = get_order_selection_keyboard(orders, is_completed=True)
        
        if update.callback_query:
            await update.callback_query.message.edit_text(
                response,
                reply_markup=keyboard
            )
        else:
            await update.message.reply_text(
                response,
                reply_markup=keyboard
            )
    else:
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
        ]])
        
        if update.callback_query:
            await update.callback_query.message.edit_text(
                "Нет выполненных заказов.",
                reply_markup=keyboard
            )
        else:
            await update.message.reply_text(
                "Нет выполненных заказов.",
                reply_markup=keyboard
            )
    return VIEW_COMPLETED_ORDERS

async def handle_order_selection(update: Update, context: CallbackContext) -> int:
    query = update.callback_query
    await query.answer()
    
    logger.info(f"Received callback query: {query.data}")
    
    if query.data == "back_to_orders":
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("📋 Текущие заказы", callback_data="view_current_orders")],
            [InlineKeyboardButton("✅ Выполненные заказы", callback_data="view_completed_orders")]
        ])
        await query.message.edit_text(
            "Выберите тип заказов:",
            reply_markup=keyboard
        )
        return VIEW_CURRENT_ORDERS
    
    if query.data == "view_current_orders":
        return await view_current_orders(update, context)
    
    if query.data == "view_completed_orders":
        return await view_completed_orders(update, context)
    
    if query.data == "add_photo_report":
        if 'selected_order' not in context.user_data:
            await query.message.edit_text(
                "❌ Сначала выберите заказ из списка.",
                reply_markup=get_order_selection_keyboard([], False)
            )
            return VIEW_CURRENT_ORDERS
        
        await query.message.edit_text(
            "📸 Отправьте фотографию для отчёта:",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
            ]])
        )
        return ORDER_DETAILS
    
    if query.data == "complete_order":
        if 'selected_order' not in context.user_data:
            await query.message.edit_text(
                "❌ Сначала выберите заказ из списка.",
                reply_markup=get_order_selection_keyboard([], False)
            )
            return VIEW_CURRENT_ORDERS
        
        return await complete_order(update, context)
    
    if query.data.startswith("select_order_"):
        try:
            # Убираем префикс "select_order_"
            data = query.data[13:]  # длина "select_order_" = 13
            parts = data.split("_")
            logger.info(f"Split callback data: {parts}")
            
            if len(parts) != 2:
                raise ValueError(f"Invalid callback data format: {query.data}")
                
            order_id = int(parts[0])
            status = parts[1]
            
            logger.info(f"Processing order: id={order_id}, status={status}")
            
            # Сохраняем выбранный заказ в контексте
            context.user_data['selected_order'] = order_id
            
            if status == 'active':
                # Получаем детальную информацию о заказе
                cursor.execute('''
                    SELECT order_id, creation_date, creation_time, payment, address, description, photo_report 
                    FROM orders 
                    WHERE order_id = ? AND status = 'active'
                ''', (order_id,))
                order = cursor.fetchone()
                
                logger.info(f"Fetched active order: {order}")
                
                if order:
                    response = f"📋 Детали заказа #{order[0]}:\n\n"
                    response += f"Дата создания: {order[1]}\n"
                    response += f"Время создания: {order[2]}\n"
                    response += f"Оплата: {order[3]}р\n"
                    response += f"Адрес: {order[4]}\n"
                    response += f"Описание: {order[5]}\n\n"
                    
                    keyboard = InlineKeyboardMarkup([
                        [InlineKeyboardButton("📸 Сделать фотоотчёт", callback_data="add_photo_report")],
                        [InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")]
                    ])
                    
                    # Если есть фотоотчет, отправляем его
                    if order[6]:  # photo_report
                        await context.bot.send_photo(
                            chat_id=update.effective_chat.id,
                            photo=order[6],
                            caption="📸 Текущий фотоотчёт:"
                        )
                    
                    await query.message.edit_text(
                        response,
                        reply_markup=keyboard
                    )
                    return ORDER_DETAILS
                else:
                    logger.warning(f"Active order not found: id={order_id}")
            else:
                # Получаем детальную информацию о завершенном заказе
                cursor.execute('''
                    SELECT order_id, creation_date, creation_time, completion_date, completion_time, 
                           payment, address, description, photo_report 
                    FROM orders 
                    WHERE order_id = ? AND status = 'completed'
                ''', (order_id,))
                order = cursor.fetchone()
                
                logger.info(f"Fetched completed order: {order}")
                
                if order:
                    response = f"✅ Детали заказа #{order[0]}:\n\n"
                    response += f"Дата создания: {order[1]}\n"
                    response += f"Время создания: {order[2]}\n"
                    response += f"Дата завершения: {order[3]}\n"
                    response += f"Время завершения: {order[4]}\n"
                    response += f"Оплата: {order[5]}р\n"
                    response += f"Адрес: {order[6]}\n"
                    response += f"Описание: {order[7]}\n"
                    
                    keyboard = InlineKeyboardMarkup([[
                        InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
                    ]])
                    
                    # Если есть фотоотчет, отправляем его
                    if order[8]:  # photo_report
                        await context.bot.send_photo(
                            chat_id=update.effective_chat.id,
                            photo=order[8],
                            caption="📸 Фотоотчёт по заказу:"
                        )
                    
                    await query.message.edit_text(
                        response,
                        reply_markup=keyboard
                    )
                else:
                    logger.warning(f"Completed order not found: id={order_id}")
                return VIEW_COMPLETED_ORDERS
        except Exception as e:
            logger.error(f"Error in handle_order_selection: {str(e)}", exc_info=True)
            keyboard = InlineKeyboardMarkup([[
                InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
            ]])
            await query.message.edit_text(
                f"❌ Произошла ошибка при обработке заказа: {str(e)}",
                reply_markup=keyboard
            )
            return VIEW_CURRENT_ORDERS

async def handle_photo_report(update: Update, context: CallbackContext) -> int:
    logger.info("Handling photo report")
    
    if 'selected_order' not in context.user_data:
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
        ]])
        await update.message.reply_text(
            "❌ Сначала выберите заказ из списка.",
            reply_markup=keyboard
        )
        return VIEW_CURRENT_ORDERS
    
    photo = update.message.photo[-1]
    order_id = context.user_data['selected_order']
    logger.info(f"Processing photo report for order {order_id}")
    
    try:
        # Проверяем, что заказ все еще активен
        cursor.execute('''
            SELECT status FROM orders 
            WHERE order_id = ? AND status = 'active'
        ''', (order_id,))
        order = cursor.fetchone()
        
        if not order:
            keyboard = InlineKeyboardMarkup([[
                InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
            ]])
            await update.message.reply_text(
                "❌ Этот заказ больше не активен.",
                reply_markup=keyboard
            )
            return VIEW_CURRENT_ORDERS
        
        # Сохраняем фотоотчёт в базе данных
        cursor.execute('''
            UPDATE orders 
            SET photo_report = ?
            WHERE order_id = ? AND status = 'active'
        ''', (photo.file_id, order_id))
        conn.commit()
        logger.info(f"Photo report saved to database for order {order_id}")
        
        # Получаем информацию о заказе для отображения
        cursor.execute('''
            SELECT order_id, creation_date, creation_time, payment, address, description 
            FROM orders 
            WHERE order_id = ? AND status = 'active'
        ''', (order_id,))
        order = cursor.fetchone()
        
        if order:
            response = f"📋 Детали заказа #{order[0]}:\n\n"
            response += f"Дата создания: {order[1]}\n"
            response += f"Время создания: {order[2]}\n"
            response += f"Оплата: {order[3]}р\n"
            response += f"Адрес: {order[4]}\n"
            response += f"Описание: {order[5]}\n\n"
            response += "📸 Фотоотчёт успешно загружен!"
            
            # Отправляем фото с подписью
            await context.bot.send_photo(
                chat_id=update.effective_chat.id,
                photo=photo.file_id,
                caption="📸 Загруженный фотоотчёт:"
            )
            
            # Отправляем сообщение с деталями заказа и кнопкой завершения
            keyboard = InlineKeyboardMarkup([
                [InlineKeyboardButton("✅ Завершить заказ", callback_data="complete_order")],
                [InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")]
            ])
            
            await update.message.reply_text(
                response,
                reply_markup=keyboard
            )
            logger.info("Photo report processed successfully")
            return ORDER_DETAILS
        else:
            keyboard = InlineKeyboardMarkup([[
                InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
            ]])
            await update.message.reply_text(
                "❌ Заказ не найден.",
                reply_markup=keyboard
            )
            return VIEW_CURRENT_ORDERS
            
    except Exception as e:
        logger.error(f"Error in handle_photo_report: {str(e)}", exc_info=True)
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
        ]])
        await update.message.reply_text(
            "❌ Произошла ошибка при обработке фотоотчета. Пожалуйста, попробуйте позже.",
            reply_markup=keyboard
        )
        return VIEW_CURRENT_ORDERS

async def complete_order(update: Update, context: CallbackContext) -> int:
    try:
        if not context.user_data.get('selected_order'):
            keyboard = InlineKeyboardMarkup([[
                InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
            ]])
            
            if update.callback_query:
                await update.callback_query.message.edit_text(
                    "❌ Сначала выберите заказ из списка.",
                    reply_markup=keyboard
                )
            else:
                await update.message.reply_text(
                    "❌ Сначала выберите заказ из списка.",
                    reply_markup=keyboard
                )
            return VIEW_CURRENT_ORDERS

        order_id = context.user_data['selected_order']
        
        # Проверяем наличие фотоотчета
        cursor.execute('''
            SELECT photo_report FROM orders 
            WHERE order_id = ? AND status = 'active'
        ''', (order_id,))
        order = cursor.fetchone()
        
        if not order or not order[0]:
            keyboard = InlineKeyboardMarkup([[
                InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
            ]])
            
            if update.callback_query:
                await update.callback_query.message.edit_text(
                    "❌ Сначала необходимо добавить фотоотчет.",
                    reply_markup=keyboard
                )
            else:
                await update.message.reply_text(
                    "❌ Сначала необходимо добавить фотоотчет.",
                    reply_markup=keyboard
                )
            return VIEW_CURRENT_ORDERS

        # Обновляем статус заказа на completed
        cursor.execute('''
            UPDATE orders 
            SET status = 'completed', 
                completion_date = date('now'), 
                completion_time = time('now')
            WHERE order_id = ? AND status = 'active'
        ''', (order_id,))
        conn.commit()
        
        # Получаем обновленную информацию о заказе
        cursor.execute('''
            SELECT order_id, creation_date, creation_time, completion_date, completion_time,
                   payment, address, description 
            FROM orders 
            WHERE order_id = ? AND status = 'completed'
        ''', (order_id,))
        completed_order = cursor.fetchone()
        
        if completed_order:
            response = "✅ Заказ успешно завершён!\n\n"
            response += f"Заказ #{completed_order[0]}\n"
            response += f"Дата создания: {completed_order[1]}\n"
            response += f"Время создания: {completed_order[2]}\n"
            response += f"Дата завершения: {completed_order[3]}\n"
            response += f"Время завершения: {completed_order[4]}\n"
            response += f"Оплата: {completed_order[5]}р\n"
            response += f"Адрес: {completed_order[6]}\n"
            response += f"Описание: {completed_order[7]}\n"
            
            keyboard = InlineKeyboardMarkup([[
                InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
            ]])
            
            if update.callback_query:
                await update.callback_query.message.edit_text(
                    response,
                    reply_markup=keyboard
                )
            else:
                await update.message.reply_text(
                    response,
                    reply_markup=keyboard
                )
            
            # Очищаем выбранный заказ из контекста
            context.user_data.pop('selected_order', None)
            return VIEW_COMPLETED_ORDERS
            
    except Exception as e:
        logger.error(f"Error in complete_order: {str(e)}")
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("🔙 Назад к заказам", callback_data="back_to_orders")
        ]])
        
        if update.callback_query:
            await update.callback_query.message.edit_text(
                "❌ Произошла ошибка при завершении заказа. Пожалуйста, попробуйте позже.",
                reply_markup=keyboard
            )
        else:
            await update.message.reply_text(
                "❌ Произошла ошибка при завершении заказа. Пожалуйста, попробуйте позже.",
                reply_markup=keyboard
            )
        return VIEW_CURRENT_ORDERS

async def start_support_chat(update: Update, context: CallbackContext) -> int:
    """Начало диалога с техподдержкой"""
    await update.message.reply_text(
        "📝 Пожалуйста, опишите ваш вопрос или проблему. "
        "Мы постараемся ответить как можно скорее.\n\n"
        "Для возврата в главное меню нажмите /cancel",
        reply_markup=ReplyKeyboardRemove()
    )
    return SUPPORT_STATE

async def handle_support_message(update: Update, context: CallbackContext) -> int:
    """Обработка сообщений для техподдержки"""
    if not SUPPORT_USER_ID:
        logger.error("SUPPORT_USER_ID is not set")
        await update.message.reply_text(
            "❌ Ошибка конфигурации бота. Пожалуйста, сообщите администратору.",
            reply_markup=main_keyboard
        )
        return ConversationHandler.END

    user = update.effective_user
    message = update.message.text
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Формируем сообщение для техподдержки
    support_message = (
        f"❗️ Новое сообщение в техподдержку\n\n"
        f"От: {user.first_name} ({user.id})\n"
        f"Время: {current_time}\n"
        f"Сообщение: {message}"
    )
    
    try:
        logger.info(f"Attempting to send support message to user {SUPPORT_USER_ID}")
        # Отправляем сообщение сотруднику техподдержки
        await context.bot.send_message(
            chat_id=SUPPORT_USER_ID,
            text=support_message
        )
        logger.info("Support message sent successfully")
        
        # Отправляем подтверждение пользователю
        await update.message.reply_text(
            "✅ Ваше сообщение успешно отправлено в техподдержку!\n"
            "Мы ответим вам как можно скорее.",
            reply_markup=main_keyboard
        )
    except Exception as e:
        logger.error(f"Error sending support message: {str(e)}", exc_info=True)
        await update.message.reply_text(
            "❌ Произошла ошибка при отправке сообщения. "
            "Пожалуйста, попробуйте позже.",
            reply_markup=main_keyboard
        )
    
    return ConversationHandler.END

# Запуск бота
def main() -> None:
    # Insert test orders only if the table is empty
    cursor.execute('SELECT COUNT(*) FROM orders')
    if cursor.fetchone()[0] == 0:
        insert_test_orders()
    
    # Создаем persistence для сохранения состояний
    persistence = PicklePersistence(filepath="data/bot_data.pickle")
    
    application = ApplicationBuilder().token("8032150632:AAHJu69ztedvhOucbazOyd2Qhp7hVPtAaxY").persistence(persistence).build()

    # ConversationHandler для регистрации
    conv_handler = ConversationHandler(
        entry_points=[
            CommandHandler('start', start),
            MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
        ],
        states={
            REG_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_name)],
            REG_AGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_age)],
            REG_CITY: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_city)],
            REG_EXP: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_exp)],
            REG_INCOME: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_income)],
            REG_PHOTO: [MessageHandler(filters.PHOTO, register_photo)],
            VIEW_CURRENT_ORDERS: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message),
                MessageHandler(filters.PHOTO, handle_photo_report)
            ],
            VIEW_COMPLETED_ORDERS: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
            ],
            ORDER_DETAILS: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message),
                MessageHandler(filters.PHOTO, handle_photo_report)
            ],
            PHOTO_REPORT: [
                MessageHandler(filters.PHOTO, handle_photo_report),
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)
            ],
            SUPPORT_STATE: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_support_message),
                CommandHandler('cancel', cancel)
            ]
        },
        fallbacks=[CommandHandler('cancel', cancel)],
        name="main_conversation",
        persistent=True
    )

    # Отдельные обработчики для callback-запросов
    callback_handler = CallbackQueryHandler(handle_order_selection)
    
    # Добавляем обработчики в приложение
    application.add_handler(conv_handler)
    application.add_handler(callback_handler)
    
    # Установка постоянного меню
    application.run_polling(allowed_updates=Update.ALL_TYPES)
    application.post_init = lambda app: app.bot.set_my_commands([
        ("start", "Начать работу с ботом"),
        ("menu", "Главное меню")
    ])

if __name__ == '__main__':
    main()