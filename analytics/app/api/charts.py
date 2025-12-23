from fastapi import APIRouter, Query
from typing import Optional
import plotly.graph_objects as go
from plotly.io import to_json

router = APIRouter()

@router.get("/donation-flow")
async def donation_flow(year: int = Query(2025), donationCenterId: Optional[str] = None):
    # Use DB queries for monthly totals (monetary and goods)
    from app.services import queries
    data = await queries.monthly_donations(year, donationCenterId)

    fig = go.Figure()
    fig.add_trace(go.Scatter(x=data['labels'], y=data['monetary'], mode='lines+markers', name='Monetary'))
    fig.add_trace(go.Bar(x=data['labels'], y=data['goods'], name='Goods', marker_opacity=0.6))
    fig.update_layout(title=f"Monthly Donation Flow ({year})", xaxis_title="Month", yaxis_title="Amount / Quantity", barmode='overlay')

    return {"figure": to_json(fig), "data": data}


@router.get("/donor-activity")
async def donor_activity(limit: int = Query(6), donationCenterId: Optional[str] = None):
    from app.services import queries
    data = await queries.top_donors(limit, donation_center_id=donationCenterId)
    fig = go.Figure(data=go.Pie(labels=data['labels'], values=data['values']))
    fig.update_layout(title="Top Contributing Donors")
    return {"figure": to_json(fig), "data": data}


from plotly.subplots import make_subplots

@router.get('/donation-centers')
async def donation_centers():
    from app.services import queries
    data = await queries.donation_centers()
    return {"data": data}

@router.get('/beneficiary-demographics')
async def beneficiary_demographics(year: int = None, donationCenterId: Optional[str] = None):
    """Aggregated beneficiary demographics: household numbers, top locations, monthly income buckets."""
    from app.services import queries
    data = await queries.beneficiary_demographics(year, donationCenterId)

    # Create a compact subplot: 2 pies and income bar
    fig = make_subplots(rows=1, cols=3, specs=[[{"type": "domain"}, {"type": "domain"}, {"type": "xy"}]],
                        subplot_titles=("By Household Number", "By Household Location", "By Monthly Income"))

    h_labels = [d['label'] for d in data['household_numbers']]
    h_vals = [d['value'] for d in data['household_numbers']]
    fig.add_trace(go.Pie(labels=h_labels, values=h_vals, name='Household Number'), 1, 1)

    l_labels = [d['label'] for d in data['locations']]
    l_vals = [d['value'] for d in data['locations']]
    fig.add_trace(go.Pie(labels=l_labels, values=l_vals, name='Location'), 1, 2)

    i_labels = [d['label'] for d in data['income_buckets']]
    i_vals = [d['value'] for d in data['income_buckets']]
    fig.add_trace(go.Bar(x=i_labels, y=i_vals, name='Monthly Income'), 1, 3)

    fig.update_layout(title_text="Beneficiary Demographics", showlegend=False)
    return {"figure": to_json(fig), "data": data}


@router.get("/donor-activity")
async def donor_activity(limit: int = Query(6)):
    # Demo top donors pie
    labels = [f"Donor {i}" for i in range(1, limit+1)]
    values = [45, 25, 15, 8, 4, 3][:limit]
    fig = go.Figure(data=go.Pie(labels=labels, values=values))
    fig.update_layout(title="Top Contributing Donors")
    return {"figure": to_json(fig), "data": {"labels": labels, "values": values}}


@router.get("/page-visits")
async def page_visits(start: Optional[str] = None, end: Optional[str] = None):
    # Demo bar chart (use real page visit data via queries)
    days = ['Nov 01','Nov 02','Nov 03','Nov 04','Nov 05','Nov 06','Nov 07','Nov 08','Nov 09','Nov 10']
    counts = [3,4,31,16,13,23,9,3,7,37]
    fig = go.Figure(data=go.Bar(x=days, y=counts))
    fig.update_layout(title="Page Visits", xaxis_title="Date", yaxis_title="Visits")
    return {"figure": to_json(fig), "data": {"labels": days, "values": counts}}
