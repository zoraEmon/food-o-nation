# Test Beneficiary Registration
$uri = "http://localhost:5000/api/auth/register/beneficiary"

# Create test data
$body = @{
    email = "testben@example.com"
    password = "TestPassword123!"
    firstName = "Juan"
    lastName = "Dela Cruz"
    middleName = "Santos"
    gender = "MALE"
    civilStatus = "SINGLE"
    birthDate = "1990-01-15T00:00:00.000Z"
    age = 34
    contactNumber = "09171234567"
    occupation = "Farmer"
    householdNumber = 5
    householdAnnualSalary = 120000
    householdPosition = "FATHER"
    primaryPhone = "09171234567"
    streetNumber = "123 Test Street"
    barangay = "Test Barangay"
    municipality = "Test City"
    region = "NCR"
    zipCode = "1000"
} | ConvertTo-Json

Write-Host "Testing registration endpoint..." -ForegroundColor Cyan
Write-Host "URL: $uri" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $uri `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Success!" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    $errorBody = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorBody)
    $reader.ReadToEnd() | ConvertFrom-Json | ConvertTo-Json -Depth 5
}
