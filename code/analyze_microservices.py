#!/usr/bin/env python3
"""
Анализ микросервисов и извлечение информации об API
"""

import os
import json
import re
from pathlib import Path

def analyze_microservice_api(service_path, service_name):
    """Анализирует микросервис и извлекает информацию об API"""
    
    api_info = {
        "name": service_name,
        "path": str(service_path),
        "technology": "unknown",
        "endpoints": [],
        "description": "",
        "port": "unknown",
        "documentation": []
    }
    
    # Определяем технологию по файлам
    if (service_path / "go.mod").exists():
        api_info["technology"] = "Go"
    elif (service_path / "app.py").exists() or (service_path / "main.py").exists():
        api_info["technology"] = "Python"
    elif (service_path / "package.json").exists():
        api_info["technology"] = "Node.js"
    
    # Читаем README для получения документации
    readme_files = ["README.md", "READMe.md", "readme.md"]
    for readme_file in readme_files:
        readme_path = service_path / readme_file
        if readme_path.exists():
            try:
                with open(readme_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    api_info["documentation"].append(content)
                    
                    # Извлекаем описание из первых строк
                    lines = content.split('\n')[:10]
                    for line in lines:
                        if line.strip() and not line.startswith('#') and not line.startswith('##'):
                            api_info["description"] = line.strip()
                            break
                    
                    # Ищем информацию о портах
                    port_matches = re.findall(r':(\d{4,5})', content)
                    if port_matches:
                        api_info["port"] = port_matches[0]
                    
                    # Ищем эндпоинты API
                    endpoint_patterns = [
                        r'`([A-Z]+)\s+([^`]+)`',  # `GET /api/endpoint`
                        r'/([a-zA-Z_/\-]+)',      # /endpoint
                        r'v\d+/([a-zA-Z_/\-]+)',  # v1/endpoint
                    ]
                    
                    for pattern in endpoint_patterns:
                        matches = re.findall(pattern, content)
                        for match in matches:
                            if isinstance(match, tuple):
                                if len(match) == 2:  # Method and path
                                    api_info["endpoints"].append(f"{match[0]} {match[1]}")
                                else:
                                    api_info["endpoints"].append(match[0])
                            else:
                                if not match.endswith('.md') and not match.endswith('.html'):
                                    api_info["endpoints"].append(match)
                    
                    break
            except Exception as e:
                print(f"Ошибка чтения {readme_path}: {e}")
    
    # Анализируем основные файлы кода для поиска дополнительных эндпоинтов
    if api_info["technology"] == "Go":
        # Ищем .go файлы
        for go_file in service_path.rglob("*.go"):
            try:
                with open(go_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Ищем роуты в Go коде
                    route_patterns = [
                        r'\.Handle\(["\']([^"\']+)["\']',
                        r'\.Get\(["\']([^"\']+)["\']',
                        r'\.Post\(["\']([^"\']+)["\']',
                        r'\.Put\(["\']([^"\']+)["\']',
                        r'\.Delete\(["\']([^"\']+)["\']',
                    ]
                    for pattern in route_patterns:
                        matches = re.findall(pattern, content)
                        api_info["endpoints"].extend(matches)
            except:
                continue
                
    elif api_info["technology"] == "Python":
        # Ищем .py файлы
        for py_file in service_path.rglob("*.py"):
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Ищем роуты в Flask/FastAPI коде
                    route_patterns = [
                        r'@app\.route\(["\']([^"\']+)["\']',
                        r'@router\.get\(["\']([^"\']+)["\']',
                        r'@router\.post\(["\']([^"\']+)["\']',
                    ]
                    for pattern in route_patterns:
                        matches = re.findall(pattern, content)
                        api_info["endpoints"].extend(matches)
            except:
                continue
    
    # Убираем дубликаты
    api_info["endpoints"] = list(set(api_info["endpoints"]))
    
    return api_info

def main():
    """Основная функция анализа"""
    
    project_path = Path("/workspace/user_input_files/production-main")
    
    # Список микросервисов для анализа
    microservices = [
        "outsourcing-auth",
        "Search+Parameters", 
        "BD Client-Company",
        "DS-AM",
        "Region",
        "TG_BOT_for_workers"
    ]
    
    analysis_results = []
    
    print("🔍 Анализ микросервисов...")
    print("=" * 50)
    
    for service_name in microservices:
        service_path = project_path / service_name
        
        if service_path.exists():
            print(f"\n📁 Анализ {service_name}...")
            api_info = analyze_microservice_api(service_path, service_name)
            analysis_results.append(api_info)
            
            print(f"   Технология: {api_info['technology']}")
            print(f"   Порт: {api_info['port']}")
            print(f"   Описание: {api_info['description'][:100]}...")
            print(f"   Найдено эндпоинтов: {len(api_info['endpoints'])}")
            
            if api_info['endpoints']:
                print("   Основные эндпоинты:")
                for endpoint in api_info['endpoints'][:5]:  # Показываем первые 5
                    print(f"     - {endpoint}")
                if len(api_info['endpoints']) > 5:
                    print(f"     ... и еще {len(api_info['endpoints']) - 5}")
        else:
            print(f"❌ Сервис {service_name} не найден")
    
    # Сохраняем результаты анализа
    output_file = "/workspace/data/microservices_analysis.json"
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Анализ завершен. Результаты сохранены в {output_file}")
    
    # Создаем сводку для планирования архитектуры
    create_architecture_summary(analysis_results)

def create_architecture_summary(analysis_results):
    """Создает сводку архитектуры для планирования интеграции"""
    
    summary = []
    summary.append("# 🏗️ АРХИТЕКТУРА МИКРОСЕРВИСОВ\n")
    
    # Группируем по технологиям
    tech_groups = {}
    for service in analysis_results:
        tech = service['technology']
        if tech not in tech_groups:
            tech_groups[tech] = []
        tech_groups[tech].append(service)
    
    summary.append("## 📊 Распределение по технологиям:\n")
    for tech, services in tech_groups.items():
        summary.append(f"**{tech}**: {len(services)} сервисов")
        for service in services:
            summary.append(f"  - {service['name']} (порт: {service['port']})")
        summary.append("")
    
    summary.append("## 🔗 Детальная информация по сервисам:\n")
    
    for service in analysis_results:
        summary.append(f"### {service['name']}")
        summary.append(f"- **Технология**: {service['technology']}")
        summary.append(f"- **Порт**: {service['port']}")
        summary.append(f"- **Описание**: {service['description']}")
        
        if service['endpoints']:
            summary.append("- **API эндпоинты**:")
            for endpoint in service['endpoints']:
                summary.append(f"  - `{endpoint}`")
        
        summary.append("")
    
    summary.append("## 💡 Рекомендации по интеграции:\n")
    summary.append("1. **API Gateway**: Создать единую точку входа для всех микросервисов")
    summary.append("2. **CORS**: Настроить корректную обработку межсайтовых запросов")
    summary.append("3. **Авторизация**: Интегрировать токены из outsourcing-auth во все запросы")
    summary.append("4. **Error Handling**: Единая система обработки ошибок")
    summary.append("5. **Caching**: Кеширование для улучшения производительности")
    
    # Сохраняем сводку
    summary_file = "/workspace/docs/architecture_summary.md"
    os.makedirs(os.path.dirname(summary_file), exist_ok=True)
    
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(summary))
    
    print(f"📋 Сводка архитектуры сохранена в {summary_file}")

if __name__ == "__main__":
    main()
