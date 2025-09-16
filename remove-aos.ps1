# PowerShell script to remove AOS animation attributes for better performance
$filePath = "c:\Users\user\Desktop\Websetly-2\index.html"

# Read the file content
$content = Get-Content $filePath -Raw

# Remove all AOS attributes using regex
$content = $content -replace '\s*data-aos="[^"]*"', ''
$content = $content -replace '\s*data-aos-duration="[^"]*"', ''
$content = $content -replace '\s*data-aos-delay="[^"]*"', ''

# Write the content back to the file
$content | Set-Content $filePath -NoNewline

Write-Host "AOS attributes removed from index.html for better performance!"
Write-Host "This should significantly improve loading speed on mobile."
