# CROTTOLD Local Lightweight HTTP Server (PowerShell .NET HttpListener)
# Runs without Node.js or Python dependencies.

$port = 8085
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()
Write-Host "Serveur CROTTOLD lancÃ© sur http://127.0.0.1:$port/"

$dbPath = Join-Path (Get-Location) "database.json"

function Hash-Password {
    param([string]$password, [string]$salt)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($password + $salt)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hash = $sha256.ComputeHash($bytes)
    return [BitConverter]::ToString($hash).Replace("-", "").ToLower()
}

function Load-Database {
    if (Test-Path $dbPath) {
        $content = Get-Content $dbPath -Raw
        if (![string]::IsNullOrWhiteSpace($content)) {
            return (ConvertFrom-Json $content)
        }
    }
    return @()
}

function Save-Database {
    param($db)
    if ($db -isnot [array]) { if ($db) { $db = @($db) } else { $db = @() } }
    $db | ConvertTo-Json -Depth 10 -Compress | Set-Content $dbPath -Encoding UTF8
}

function Send-JsonResponse {
    param($context, $resObj)
    $response = $context.Response
    $response.ContentType = "application/json; charset=utf-8"
    $resJson = $resObj | ConvertTo-Json -Compress -Depth 10
    $resBytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
    $response.ContentLength64 = $resBytes.Length
    $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
    $response.OutputStream.Close()
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }

        if ($request.HttpMethod -eq "POST" -and $urlPath -eq "/api/register") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $json = $reader.ReadToEnd() | ConvertFrom-Json
            
            $db = Load-Database
            if ($db -isnot [array]) { if ($db) { $db = @($db) } else { $db = @() } }
            
            $existing = $db | Where-Object { $_.username -eq $json.username }
            
            $isMinor = $false
            try { $isMinor = ((Get-Date) - [datetime]$json.birthdate).TotalDays -lt 6574 } catch { $isMinor = $true }

            # Validation Regex (AlphanumÃ©rique, 3-20 chars)
            if ($json.username -notmatch "^[a-zA-Z0-9_-]{3,20}$") {
                $resObj = @{ success = $false; error = "Pseudo invalide (3-20 caractÃ¨res alphanumÃ©riques)." }
            }
            # Validation MajoritÃ©
            elseif ($isMinor) {
                $resObj = @{ success = $false; error = "Vous devez Ãªtre majeur." }
            }
            elseif ($existing) {
                $resObj = @{ success = $false; error = "Ce pseudo est dÃ©jÃ  utilisÃ©." }
            } else {
                $salt = [Guid]::NewGuid().ToString()
                $newUser = New-Object PSObject -Property @{
                    username = $json.username
                    birthdate = $json.birthdate
                    salt = $salt
                    password = Hash-Password -password $json.password -salt $salt
                    role = $json.role
                }
                
                $db += $newUser
                
                Save-Database $db
                $resObj = @{ success = $true }
            }
            Send-JsonResponse $context $resObj
            continue
        }
        elseif ($request.HttpMethod -eq "POST" -and $urlPath -eq "/api/login") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $json = $reader.ReadToEnd() | ConvertFrom-Json
            
            $db = Load-Database
            if ($db -isnot [array]) { if ($db) { $db = @($db) } else { $db = @() } }
            
            $user = $db | Where-Object { $_.username -eq $json.username }
            if ($user) {
                $hashed = Hash-Password -password $json.password -salt $user.salt
                if ($user.password -eq $hashed) {
                    $resObj = @{ success = $true; username = $user.username; role = $user.role }
                } else {
                    Start-Sleep -Milliseconds 500
                    $resObj = @{ success = $false; error = "Mot de passe incorrect." }
                }
            } else {
                Start-Sleep -Milliseconds 500
                $resObj = @{ success = $false; error = "user_not_found" }
            }
            Send-JsonResponse $context $resObj
            continue
        }

        # Resolve clean relative path
        $cleanPath = $urlPath.Replace("/", "\").TrimStart("\")
        $filePath = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $cleanPath))
        $basePath = [System.IO.Path]::GetFullPath((Get-Location))
        
        if ($filePath.StartsWith($basePath) -and (Test-Path $filePath -PathType Leaf)) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Detect MIME types
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "application/octet-stream"
            if ($ext -eq ".html") { $contentType = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $contentType = "text/css; charset=utf-8" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript; charset=utf-8" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".ico") { $contentType = "image/x-icon" }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - Fichier non trouvÃ©")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Erreur serveur: $_"
} finally {
    $listener.Stop()
    Write-Host "Serveur arrÃªtÃ©."
}
