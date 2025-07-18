from prisma import Prisma
from data_sources import fsbc_data, regional_coefficients

async def seed_database():
    db = Prisma()
    await db.connect()
    
    # Импорт ФСБЦ-2022
    await db.fsbcregulation.create_many(fsbc_data.load_regulations())
    
    # Региональные коэффициенты
    for region in regional_coefficients:
        await db.region.upsert({...})
    
    # Базовые сметные шаблоны
    await db.estimatetemplate.create_many(...)

def main():
    import asyncio
    asyncio.run(seed_database())

if __name__ == '__main__':
    main()
