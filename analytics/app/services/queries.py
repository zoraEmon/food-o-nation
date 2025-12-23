from typing import Optional, List, Dict
from app.services import db
from collections import defaultdict
import calendar

async def monthly_donations(year: int, donation_center_id: Optional[str] = None) -> Dict:
    """Return monthly monetary totals and goods totals for the given year.
    Values are returned with labels (Jan..Dec) and numeric values (0 if none).
    """
    # Monetary totals per month
    sql_monetary = '''
    SELECT date_trunc('month', COALESCE("paymentVerifiedAt", "createdAt")) AS month, SUM("monetaryAmount") AS total
    FROM "Donation"
    WHERE "monetaryAmount" IS NOT NULL
      AND ("paymentStatus" = 'VERIFIED' OR "status" = 'COMPLETED')
      AND EXTRACT(YEAR FROM COALESCE("paymentVerifiedAt", "createdAt")) = $1
    '''
    params = [year]
    if donation_center_id:
        sql_monetary += ' AND "donationCenterId" = $2 '
        params.append(donation_center_id)
    sql_monetary += ' GROUP BY 1 ORDER BY 1'

    rows = await db.fetch(sql_monetary, *params)
    money_map = {row['month'].month: float(row['total'] or 0) for row in rows}

    # Goods totals (sum of DonationItem.quantity grouped by donation createdAt month)
    sql_goods = '''
    SELECT date_trunc('month', d."createdAt") AS month, SUM(di."quantity") AS total
    FROM "DonationItem" di
    JOIN "Donation" d on di."donationId" = d."id"
    WHERE EXTRACT(YEAR FROM d."createdAt") = $1
    '''
    params2 = [year]
    if donation_center_id:
        sql_goods += ' AND d."donationCenterId" = $2 '
        params2.append(donation_center_id)
    sql_goods += ' GROUP BY 1 ORDER BY 1'

    rows2 = await db.fetch(sql_goods, *params2)
    goods_map = {row['month'].month: float(row['total'] or 0) for row in rows2}

    labels = [calendar.month_abbr[i] for i in range(1,13)]
    monetary_values = [money_map.get(i, 0.0) for i in range(1,13)]
    goods_values = [goods_map.get(i, 0.0) for i in range(1,13)]

    return {"labels": labels, "monetary": monetary_values, "goods": goods_values}

async def top_donors(limit: int = 6, donation_center_id: Optional[str] = None) -> Dict:
    sql = '''
    SELECT dn."donorId" AS id, d."displayName" AS name, COALESCE(SUM(dn."monetaryAmount"),0) AS total, COUNT(dn."id") AS donations
    FROM "Donation" dn
    JOIN "Donor" d ON dn."donorId" = d."id"
    WHERE dn."monetaryAmount" IS NOT NULL AND (dn."paymentStatus" = 'VERIFIED' OR dn."status" = 'COMPLETED')
    '''
    params = [limit]
    if donation_center_id:
        sql += ' AND dn."donationCenterId" = $2 '
        params = [limit, donation_center_id]

    sql += ' GROUP BY d."id", d."displayName" ORDER BY total DESC LIMIT $1'

    rows = await db.fetch(sql, *params)
    labels = [r['name'] for r in rows]
    values = [float(r['total'] or 0) for r in rows]
    details = [{"id": r['id'], "name": r['name'], "total": float(r['total'] or 0), "donations": r['donations']} for r in rows]
    return {"labels": labels, "values": values, "details": details}

async def donation_centers() -> Dict:
    """Return list of donation centers with id and display name (place name preferred)."""
    sql = '''
    SELECT dc."id", COALESCE(p."name", dc."contactInfo") AS name
    FROM "DonationCenter" dc
    LEFT JOIN "Place" p ON dc."placeId" = p."id"
    ORDER BY name
    '''
    rows = await db.fetch(sql)
    items = [{"id": r['id'], "name": r['name']} for r in rows]
    return {"items": items}

async def beneficiary_demographics(year: Optional[int] = None, donation_center_id: Optional[str] = None) -> Dict:
    """Return aggregated beneficiary demographic breakdowns used for admin dashboards.
    Currently returns:
      - household_numbers: top counts grouped by household number
      - locations: top locations (by barangay then municipality)
      - income_buckets: counts per monthly-income bucket (from monthlyIncome or householdAnnualSalary/12)

    Note: donation_center_id/year filters are accepted but may be no-ops until cross-filters are implemented.
    """
    # Household number distribution
    sql_household = '''
    SELECT "householdNumber" AS size, COUNT(*) AS cnt
    FROM "Beneficiary"
    WHERE "householdNumber" IS NOT NULL
    GROUP BY 1 ORDER BY cnt DESC LIMIT 20
    '''
    rows = await db.fetch(sql_household)
    household = [{"label": str(r['size']), "value": int(r['cnt'])} for r in rows]

    # Top locations (prefer barangay; fallback to municipality)
    sql_locations = '''
    SELECT COALESCE(a."barangay", a."municipality", 'Unknown') AS location, COUNT(*) AS cnt
    FROM "Beneficiary" b
    JOIN "Address" a ON a."beneficiaryId" = b."id"
    GROUP BY 1 ORDER BY cnt DESC LIMIT 10
    '''
    rows2 = await db.fetch(sql_locations)
    locations = [{"label": r['location'], "value": int(r['cnt'])} for r in rows2]

    # Income buckets (monthly approximation)
    sql_income = '''
    SELECT bucket, COUNT(*) AS cnt FROM (
      SELECT CASE
        WHEN monthly <= 5000 THEN '0-5k'
        WHEN monthly <= 10000 THEN '5k-10k'
        WHEN monthly <= 20000 THEN '10k-20k'
        ELSE '20k+'
      END as bucket
      FROM (
        SELECT COALESCE("monthlyIncome", ("householdAnnualSalary" / 12.0)) AS monthly
        FROM "Beneficiary"
      ) t
    ) s GROUP BY bucket
    '''
    rows3 = await db.fetch(sql_income)
    # normalize order
    bucket_order = ['0-5k','5k-10k','10k-20k','20k+']
    income_map = {r['bucket']: int(r['cnt']) for r in rows3}
    income_buckets = [{"label": b, "value": income_map.get(b, 0)} for b in bucket_order]

    return {"household_numbers": household, "locations": locations, "income_buckets": income_buckets}

async def page_visits(start: Optional[str] = None, end: Optional[str] = None) -> Dict:
    # For now keep mock implementation; analytics team can replace with real page visit table queries
    days = ['Nov 01','Nov 02','Nov 03','Nov 04','Nov 05','Nov 06','Nov 07','Nov 08','Nov 09','Nov 10']
    counts = [3,4,31,16,13,23,9,3,7,37]
    return {"labels": days, "values": counts}
