#!/usr/bin/env bash
# Quick donation API test script for Git Bash / PowerShell
# Run this to test all endpoints quickly

BASE_URL="http://localhost:5000/api"

# Test IDs (from database seed)
DONOR_ID="a20940e2-5f3e-4466-ad96-3ce06dbf068f"
CENTER_ID="250c4cb6-55f9-43c0-a15c-1efb65b93add"

echo "🧪 Starting Donation API Tests..."
echo "=================================="
echo "Base URL: $BASE_URL"
echo "Donor ID: $DONOR_ID"
echo "Center ID: $CENTER_ID"
echo ""

# Test 1: Create Monetary Donation
echo "📋 Test 1: Creating Monetary Donation..."
MONETARY_RESPONSE=$(curl -s -X POST "$BASE_URL/donations/monetary" \
  -H "Content-Type: application/json" \
  -d "{
    \"donorId\": \"$DONOR_ID\",
    \"amount\": 1000,
      \"paymentMethod\": \"Maya\",
      \"paymentReference\": \"MAYA-TEST-$(date +%s)\"
  }")

echo "$MONETARY_RESPONSE" | jq .
MONETARY_ID=$(echo "$MONETARY_RESPONSE" | jq -r '.data.donation.id // empty')

if [ -z "$MONETARY_ID" ]; then
  echo "❌ Failed to create monetary donation"
  exit 1
fi

echo "✅ Monetary donation created: $MONETARY_ID"
echo ""

# Test 2: Create Produce Donation
echo "📋 Test 2: Creating Produce Donation..."
SCHEDULED_DATE=$(date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v+7d +"%Y-%m-%dT%H:%M:%S.000Z")

PRODUCE_RESPONSE=$(curl -s -X POST "$BASE_URL/donations/produce" \
  -H "Content-Type: application/json" \
  -d "{
    \"donorId\": \"$DONOR_ID\",
    \"donationCenterId\": \"$CENTER_ID\",
    \"scheduledDate\": \"$SCHEDULED_DATE\",
    \"items\": [
      {
        \"name\": \"Rice\",
        \"category\": \"Grains\",
        \"quantity\": 50,
        \"unit\": \"kg\"
      },
      {
        \"name\": \"Canned Sardines\",
        \"category\": \"Canned Goods\",
        \"quantity\": 100,
        \"unit\": \"pcs\"
      }
    ]
  }")

echo "$PRODUCE_RESPONSE" | jq .
PRODUCE_ID=$(echo "$PRODUCE_RESPONSE" | jq -r '.data.donation.id // empty')

if [ -z "$PRODUCE_ID" ]; then
  echo "❌ Failed to create produce donation"
  exit 1
fi

echo "✅ Produce donation created: $PRODUCE_ID"
echo ""

# Test 3: Get All Donations
echo "📋 Test 3: Getting all donations..."
curl -s -X GET "$BASE_URL/donations?limit=10" | jq '.data.donations | length'
echo "✅ Retrieved donations"
echo ""

# Test 4: Get Specific Donation
echo "📋 Test 4: Getting monetary donation by ID..."
curl -s -X GET "$BASE_URL/donations/$MONETARY_ID" | jq '.data.donation'
echo "✅ Retrieved monetary donation"
echo ""

# Test 5: Update Donation Status
echo "📋 Test 5: Updating donation status..."
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/donations/$MONETARY_ID/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "notes": "Test completion"
  }')

echo "$UPDATE_RESPONSE" | jq .
echo "✅ Updated donation status"
echo ""

# Test 6: Filter by Status
echo "📋 Test 6: Filtering donations by status..."
curl -s -X GET "$BASE_URL/donations?status=COMPLETED" | jq '.data.donations | length'
echo "✅ Filtered by status"
echo ""

# Test 7: Filter by Donor
echo "📋 Test 7: Filtering donations by donor..."
curl -s -X GET "$BASE_URL/donations?donorId=$DONOR_ID" | jq '.data.donations | length'
echo "✅ Filtered by donor"
echo ""

echo "🎉 All tests completed!"
