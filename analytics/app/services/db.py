import os
import asyncpg

DATABASE_URL = os.getenv('DATABASE_URL')
_pool = None

async def get_pool():
    """Return a shared asyncpg pool or None if DATABASE_URL not set."""
    global _pool
    if _pool:
        return _pool
    if not DATABASE_URL:
        return None
    _pool = await asyncpg.create_pool(DATABASE_URL)
    return _pool

async def fetch(query: str, *args):
    pool = await get_pool()
    if not pool:
        return []
    async with pool.acquire() as conn:
        return await conn.fetch(query, *args)

async def fetchrow(query: str, *args):
    pool = await get_pool()
    if not pool:
        return None
    async with pool.acquire() as conn:
        return await conn.fetchrow(query, *args)

async def execute(query: str, *args):
    pool = await get_pool()
    if not pool:
        return None
    async with pool.acquire() as conn:
        return await conn.execute(query, *args)
