# Maya Donation Test - PowerShell
# Replace the checkoutId with your actual checkout ID from the previous step

$checkoutId = "04f5f163-a662-46d8-a124-3c19d4dfc1ad"  # Update this with your actual checkoutId
$donorId = "36400fa7-22f7-4e94-b514-a441e516b9b5"
$amount = 500

$body = @{
    donorId = $donorId
    amount = $amount
    paymentMethod = "Maya"
    paymentReference = $checkoutId
} | ConvertTo-Json

Write-Host "Creating Maya donation..."
Write-Host "Checkout ID: $checkoutId"
Write-Host "Amount: $amount PHP"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/donations/monetary" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $body `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $json = $response.Content | ConvertFrom-Json
    
    if ($json.success) {
        Write-Host "✅ Donation Created Successfully!"
        Write-Host ""
        Write-Host "Donation Details:"
        Write-Host "  - Donation ID: $($json.data.donation.id)"
        Write-Host "  - Status: $($json.data.donation.status)"
        Write-Host "  - Amount: $($json.data.donation.monetaryAmount) PHP"
        Write-Host "  - Payment Status: $($json.data.donation.paymentStatus)"
        Write-Host "  - Payment Reference: $($json.data.donation.paymentReference)"
        Write-Host "  - Created At: $($json.data.donation.createdAt)"
        Write-Host ""
        Write-Host "Donor Details:"
        Write-Host "  - Name: $($json.data.donation.donor.displayName)"
        Write-Host "  - Type: $($json.data.donation.donor.donorType)"
        Write-Host "  - Total Points: $($json.data.donation.donor.points)"
        Write-Host "  - Total Donations: $($json.data.donation.donor.totalDonation) PHP"
    } else {
        Write-Host "❌ Error: $($json.message)"
        Write-Host $json | ConvertTo-Json -Depth 10
    }
}
catch {
    Write-Host "❌ HTTP Error:"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
    try {
        $errorContent = $_.Exception.Response.GetResponseStream() | ForEach-Object { (New-Object System.IO.StreamReader $_).ReadToEnd() }
        Write-Host "Details: $errorContent"
    } catch { }
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/donations/monetary" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ Success!"
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "❌ Error:"
    Write-Host $_.Exception.Response.Content | ConvertFrom-Json | ConvertTo-Json
}
