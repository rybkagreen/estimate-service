# Стандартизированный глоссарий терминов / Standardized Terminology Glossary

> **Версия:** 1.0  
> **Дата обновления:** 06.07.2025  
> **Статус:** Активный  
> **Назначение:** Обеспечение единообразия терминологии во всей документации
> проекта

## Содержание / Table of Contents

1. [Бизнес-термины / Business Terms](#бизнес-термины--business-terms)
2. [Технические термины / Technical Terms](#технические-термины--technical-terms)
3. [Архитектурные термины / Architecture Terms](#архитектурные-термины--architecture-terms)
4. [Термины API / API Terms](#термины-api--api-terms)
5. [Термины безопасности / Security Terms](#термины-безопасности--security-terms)
6. [Сокращения и аббревиатуры / Abbreviations and Acronyms](#сокращения-и-аббревиатуры--abbreviations-and-acronyms)

---

## Бизнес-термины / Business Terms

### Основные понятия сметного дела

| Русский термин           | English Term           | Определение / Definition                                                                                                                                     | Примечания / Notes        |
| ------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| **Смета**                | Estimate               | Документ, содержащий расчет предполагаемых затрат на выполнение строительных работ / Document containing calculation of expected costs for construction work | Основной объект системы   |
| **Сметная документация** | Estimate Documentation | Комплект документов, включающий сметы, расчеты и обоснования / Set of documents including estimates, calculations and justifications                         |                           |
| **Расценка**             | Rate/Price Item        | Единичная стоимость работы, материала или услуги / Unit cost of work, material or service                                                                    | Из базы ФСБЦ-2022         |
| **Позиция сметы**        | Estimate Line Item     | Отдельная строка в смете с указанием объема и стоимости / Individual line in estimate with volume and cost                                                   |                           |
| **ФСБЦ-2022**            | FSBC-2022              | Федеральная сметная база ценников 2022 года / Federal Estimate Price Database 2022                                                                           | Официальная база расценок |
| **Накладные расходы**    | Overhead Costs         | Дополнительные затраты на управление и организацию работ / Additional costs for management and work organization                                             | Обычно 15-20%             |
| **Сметная прибыль**      | Estimated Profit       | Планируемая прибыль подрядчика / Planned contractor profit                                                                                                   | Обычно 5-8%               |
| **Коэффициент**          | Coefficient/Factor     | Множитель для корректировки базовой стоимости / Multiplier for adjusting base cost                                                                           | Региональные, сезонные    |
| **Объем работ**          | Work Volume/Quantity   | Количественное выражение работ в единицах измерения / Quantitative expression of work in measurement units                                                   | м³, м², шт.               |
| **Единица измерения**    | Unit of Measurement    | Стандартная мера для подсчета объемов / Standard measure for volume calculation                                                                              |                           |

### Типы проектов

| Русский термин                     | English Term                | Определение / Definition                                                                     |
| ---------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| **Жилое строительство**            | Residential Construction    | Строительство жилых домов и комплексов / Construction of residential buildings and complexes |
| **Коммерческое строительство**     | Commercial Construction     | Строительство офисов, торговых центров / Construction of offices, shopping centers           |
| **Промышленное строительство**     | Industrial Construction     | Строительство заводов, складов / Construction of factories, warehouses                       |
| **Инфраструктурное строительство** | Infrastructure Construction | Строительство дорог, мостов, коммуникаций / Construction of roads, bridges, utilities        |

### Роли пользователей

| Русский термин    | English Term         | Определение / Definition                                                         | Права доступа / Access Rights |
| ----------------- | -------------------- | -------------------------------------------------------------------------------- | ----------------------------- |
| **Сметчик**       | Cost Estimator       | Специалист по составлению смет / Specialist in creating estimates                | Создание, редактирование смет |
| **Прораб**        | Construction Manager | Руководитель строительных работ / Construction work supervisor                   | Просмотр, утверждение смет    |
| **Заказчик**      | Client/Customer      | Лицо или организация, заказывающая работы / Person or organization ordering work | Просмотр, согласование        |
| **Администратор** | Administrator        | Управляющий системой / System manager                                            | Полный доступ                 |

---

## Технические термины / Technical Terms

### Архитектура системы

| Термин              | Term             | Определение / Definition                                                                        | Контекст использования / Usage Context |
| ------------------- | ---------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Микросервис**     | Microservice     | Независимый компонент системы с собственной БД / Independent system component with own database | Архитектура приложения                 |
| **API Gateway**     | API Gateway      | Единая точка входа для всех API запросов / Single entry point for all API requests              | Маршрутизация запросов                 |
| **Монорепозиторий** | Monorepo         | Единый репозиторий для всех сервисов / Single repository for all services                       | Управление кодом                       |
| **Контейнеризация** | Containerization | Упаковка приложения в Docker контейнеры / Packaging application in Docker containers            | Развертывание                          |
| **Оркестрация**     | Orchestration    | Управление контейнерами через Kubernetes / Container management via Kubernetes                  | Инфраструктура                         |

### База данных

| Термин         | Term            | Определение / Definition                                          | Пример / Example   |
| -------------- | --------------- | ----------------------------------------------------------------- | ------------------ |
| **Схема БД**   | Database Schema | Структура таблиц и связей / Structure of tables and relationships | Prisma schema      |
| **Миграция**   | Migration       | Изменение структуры БД / Database structure change                | `prisma migrate`   |
| **Индекс**     | Index           | Структура для ускорения поиска / Structure for faster search      | `@@index([field])` |
| **Транзакция** | Transaction     | Атомарная операция с БД / Atomic database operation               | ACID compliance    |
| **Репликация** | Replication     | Копирование данных между БД / Data copying between databases      | Master-slave       |

### Frontend термины

| Термин           | Term           | Определение / Definition                                        | Технология / Technology |
| ---------------- | -------------- | --------------------------------------------------------------- | ----------------------- |
| **Компонент**    | Component      | Переиспользуемый элемент UI / Reusable UI element               | React Component         |
| **Состояние**    | State          | Данные компонента / Component data                              | useState, Redux         |
| **Хук**          | Hook           | Функция для работы с состоянием / Function for state management | React Hooks             |
| **Роутинг**      | Routing        | Навигация между страницами / Navigation between pages           | React Router            |
| **Адаптивность** | Responsiveness | Адаптация под разные экраны / Adaptation for different screens  | CSS Media Queries       |

---

## Архитектурные термины / Architecture Terms

### Паттерны проектирования

| Термин                   | Term       | Определение / Definition                              | Применение / Application |
| ------------------------ | ---------- | ----------------------------------------------------- | ------------------------ |
| **Dependency Injection** | DI         | Внедрение зависимостей / Dependency injection         | NestJS providers         |
| **Repository Pattern**   | Repository | Абстракция доступа к данным / Data access abstraction | Data layer               |
| **Factory Pattern**      | Factory    | Создание объектов / Object creation                   | Service instantiation    |
| **Observer Pattern**     | Observer   | Подписка на события / Event subscription              | Event handling           |
| **Singleton**            | Singleton  | Единственный экземпляр / Single instance              | Database connection      |

### Принципы разработки

| Термин    | Term                     | Определение / Definition                                                    |
| --------- | ------------------------ | --------------------------------------------------------------------------- |
| **SOLID** | SOLID                    | Принципы объектно-ориентированного проектирования / OOP design principles   |
| **DRY**   | Don't Repeat Yourself    | Избегание дублирования кода / Avoiding code duplication                     |
| **KISS**  | Keep It Simple, Stupid   | Простота решений / Solution simplicity                                      |
| **YAGNI** | You Aren't Gonna Need It | Не добавлять функциональность заранее / Don't add functionality prematurely |
| **TDD**   | Test-Driven Development  | Разработка через тестирование / Development through testing                 |

---

## Термины API / API Terms

### RESTful API

| Термин             | Term            | Определение / Definition              | Пример / Example        |
| ------------------ | --------------- | ------------------------------------- | ----------------------- |
| **Endpoint**       | Endpoint        | Точка доступа API / API access point  | `/api/v1/estimates`     |
| **HTTP метод**     | HTTP Method     | Тип операции / Operation type         | GET, POST, PUT, DELETE  |
| **Request Body**   | Request Body    | Тело запроса / Request payload        | JSON data               |
| **Response**       | Response        | Ответ сервера / Server response       | JSON response           |
| **Status Code**    | Status Code     | Код состояния HTTP / HTTP status code | 200, 404, 500           |
| **Query параметр** | Query Parameter | Параметр в URL / URL parameter        | `?page=1&limit=10`      |
| **Path параметр**  | Path Parameter  | Параметр в пути / Path parameter      | `/users/{id}`           |
| **Header**         | Header          | Заголовок запроса / Request header    | `Authorization: Bearer` |

### Аутентификация и авторизация

| Термин            | Term                      | Определение / Definition                              | Реализация / Implementation |
| ----------------- | ------------------------- | ----------------------------------------------------- | --------------------------- |
| **JWT**           | JSON Web Token            | Токен для аутентификации / Authentication token       | Bearer token                |
| **OAuth2**        | OAuth2                    | Протокол авторизации / Authorization protocol         | Third-party auth            |
| **RBAC**          | Role-Based Access Control | Контроль доступа по ролям / Role-based access control | User permissions            |
| **API Key**       | API Key                   | Ключ доступа к API / API access key                   | Service authentication      |
| **Refresh Token** | Refresh Token             | Токен обновления / Token refresh                      | JWT renewal                 |

---

## Термины безопасности / Security Terms

### Защита данных

| Термин           | Term         | Определение / Definition                                                    | Применение / Application |
| ---------------- | ------------ | --------------------------------------------------------------------------- | ------------------------ |
| **Шифрование**   | Encryption   | Преобразование данных в защищенный вид / Data transformation to secure form | AES-256                  |
| **Хеширование**  | Hashing      | Односторонее преобразование / One-way transformation                        | bcrypt for passwords     |
| **SSL/TLS**      | SSL/TLS      | Защита передачи данных / Secure data transmission                           | HTTPS protocol           |
| **Токенизация**  | Tokenization | Замена данных на токены / Data replacement with tokens                      | Sensitive data           |
| **Маскирование** | Masking      | Скрытие части данных / Partial data hiding                                  | Logs, displays           |

### Типы атак и защита

| Термин            | Term                          | Определение / Definition                                                   | Защита / Protection   |
| ----------------- | ----------------------------- | -------------------------------------------------------------------------- | --------------------- |
| **SQL Injection** | SQL Injection                 | Внедрение SQL кода / SQL code injection                                    | Parameterized queries |
| **XSS**           | Cross-Site Scripting          | Межсайтовый скриптинг / Cross-site scripting                               | Input sanitization    |
| **CSRF**          | Cross-Site Request Forgery    | Подделка межсайтовых запросов / Cross-site request forgery                 | CSRF tokens           |
| **DDoS**          | Distributed Denial of Service | Распределенная атака отказа в обслуживании / Distributed denial of service | Rate limiting, WAF    |
| **Брутфорс**      | Brute Force                   | Перебор паролей / Password guessing                                        | Account lockout       |

---

## Сокращения и аббревиатуры / Abbreviations and Acronyms

### Технические сокращения

| Сокращение | Расшифровка                          | Full Form                         | Описание / Description      |
| ---------- | ------------------------------------ | --------------------------------- | --------------------------- |
| **API**    | Программный интерфейс приложения     | Application Programming Interface | Интерфейс взаимодействия    |
| **REST**   | Передача репрезентативного состояния | Representational State Transfer   | Архитектурный стиль API     |
| **JSON**   | Нотация объектов JavaScript          | JavaScript Object Notation        | Формат данных               |
| **JWT**    | Веб-токен JSON                       | JSON Web Token                    | Токен аутентификации        |
| **SQL**    | Язык структурированных запросов      | Structured Query Language         | Язык запросов к БД          |
| **ORM**    | Объектно-реляционное отображение     | Object-Relational Mapping         | Prisma ORM                  |
| **CI/CD**  | Непрерывная интеграция/доставка      | Continuous Integration/Delivery   | Автоматизация развертывания |
| **MVP**    | Минимально жизнеспособный продукт    | Minimum Viable Product            | Базовая версия              |
| **SPA**    | Одностраничное приложение            | Single Page Application           | Тип веб-приложения          |
| **PWA**    | Прогрессивное веб-приложение         | Progressive Web App               | Веб как нативное приложение |

### Бизнес-сокращения

| Сокращение | Расшифровка                       | Full Form                           | Описание / Description     |
| ---------- | --------------------------------- | ----------------------------------- | -------------------------- |
| **ФСБЦ**   | Федеральная сметная база ценников | Federal Estimate Price Database     | База расценок              |
| **НДС**    | Налог на добавленную стоимость    | VAT (Value Added Tax)               | 20% в РФ                   |
| **ПСД**    | Проектно-сметная документация     | Design and Estimate Documentation   | Полный комплект документов |
| **СМР**    | Строительно-монтажные работы      | Construction and Installation Works | Основные работы            |
| **ТЭО**    | Технико-экономическое обоснование | Feasibility Study                   | Обоснование проекта        |

### Метрики и единицы измерения

| Обозначение | Русский         | English      | Применение / Usage    |
| ----------- | --------------- | ------------ | --------------------- |
| **м²**      | квадратный метр | square meter | Площадь / Area        |
| **м³**      | кубический метр | cubic meter  | Объем / Volume        |
| **шт.**     | штука           | piece/unit   | Количество / Quantity |
| **км**      | километр        | kilometer    | Расстояние / Distance |
| **т**       | тонна           | ton          | Масса / Mass          |
| **ч**       | час             | hour         | Время / Time          |
| **чел.-ч**  | человеко-час    | man-hour     | Трудозатраты / Labor  |

---

## Правила использования терминологии / Terminology Usage Rules

### Общие правила

1. **Консистентность** / **Consistency**
   - Используйте один и тот же термин во всей документации
   - Use the same term throughout all documentation

2. **Контекст** / **Context**
   - Выбирайте термин в зависимости от аудитории
   - Choose terms based on the audience

3. **Первое упоминание** / **First Mention**
   - При первом использовании давайте определение или ссылку на глоссарий
   - Define or link to glossary on first use

4. **Сокращения** / **Abbreviations**
   - Расшифровывайте при первом упоминании
   - Spell out on first mention

### Примеры правильного использования

✅ **Правильно:**

- "Создайте новую смету (cost estimate) в системе"
- "API endpoint возвращает JSON response"
- "Используется база данных PostgreSQL с ORM Prisma"

❌ **Неправильно:**

- "Создайте новый estimate" (смешивание языков без пояснения)
- "Эндпоинт возвращает респонс" (транслитерация вместо перевода)
- "БД Postgres с ОРМ Призма" (непоследовательное использование)

---

## Обновление глоссария / Glossary Updates

### Процедура добавления новых терминов

1. **Предложение** - Создайте issue с новым термином
2. **Обсуждение** - Команда обсуждает необходимость
3. **Утверждение** - Tech lead утверждает добавление
4. **Добавление** - Обновите глоссарий через PR
5. **Уведомление** - Информируйте команду об изменениях

### История изменений

| Версия | Дата       | Изменения               | Автор              |
| ------ | ---------- | ----------------------- | ------------------ |
| 1.0    | 06.07.2025 | Первая версия глоссария | Команда разработки |

---

**Примечание:** Этот глоссарий является живым документом и должен обновляться по
мере развития проекта и появления новых терминов.

**Note:** This glossary is a living document and should be updated as the
project evolves and new terms emerge.
