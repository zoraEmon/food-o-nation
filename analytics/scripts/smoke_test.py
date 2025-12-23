import asyncio
import json
import sys, os
# ensure package root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from httpx import AsyncClient, ASGITransport
from app.main import app

async def run():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get('/health')
        print('health', r.status_code, r.json())

        r = await client.get('/charts/donation-flow?year=2025')
        print('/charts/donation-flow', r.status_code)
        with open('donation_flow.json', 'w') as f:
            f.write(json.dumps(r.json(), indent=2))

        r = await client.get('/charts/donor-activity?limit=6')
        print('/charts/donor-activity', r.status_code)
        with open('donor_activity.json', 'w') as f:
            f.write(json.dumps(r.json(), indent=2))

        r = await client.get('/charts/beneficiary-demographics')
        print('/charts/beneficiary-demographics', r.status_code)
        with open('beneficiary_demographics.json', 'w') as f:
            f.write(json.dumps(r.json(), indent=2))

if __name__ == '__main__':
    asyncio.run(run())
