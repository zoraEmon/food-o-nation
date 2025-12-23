import json
import plotly.io as pio

with open('donation_flow.json') as f:
    df = json.load(f)

fig_json = df['figure']
fig = pio.from_json(fig_json)
fig.write_image('donation_flow.png', engine='kaleido')
print('Saved donation_flow.png')

with open('donor_activity.json') as f:
    da = json.load(f)

fig_json = da['figure']
fig2 = pio.from_json(fig_json)
fig2.write_image('donor_activity.png', engine='kaleido')
print('Saved donor_activity.png')
