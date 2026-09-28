Add-Type -AssemblyName System.IO.Compression.FileSystem

$src = "DOCUMENTOS DE GESTION\DIRECTORIO actualizado JCM 2026.docx"
$tmp = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "directorio_jcm.zip")

$inStream = [System.IO.File]::Open($src, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
$outStream = [System.IO.File]::Create($tmp)
$inStream.CopyTo($outStream)
$inStream.Close()
$outStream.Close()

$zip = [System.IO.Compression.ZipFile]::OpenRead($tmp)
$entry = $zip.GetEntry('word/document.xml')
$entryStream = $entry.Open()
$reader = New-Object System.IO.StreamReader($entryStream, [System.Text.Encoding]::UTF8)
$xmlText = $reader.ReadToEnd()
$reader.Close()
$entryStream.Close()
$zip.Dispose()
Remove-Item -Force $tmp

[xml]$xmlDoc = $xmlText
$ns = New-Object System.Xml.XmlNamespaceManager($xmlDoc.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')

$results = @()
$rows = $xmlDoc.SelectNodes('//w:tr', $ns)
foreach ($row in $rows) {
    $cells = $row.SelectNodes('.//w:tc', $ns)
    $lineCells = @()
    foreach ($cell in $cells) {
        $cellTexts = $cell.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }
        $lineCells += ($cellTexts -join '').Trim()
    }
    $line = $lineCells -join ' | '
    $results += $line
}

$results | Out-File -FilePath "directorio_extraido.txt" -Encoding utf8
Write-Output "TOTAL_FILAS: $($results.Count)"
$results | Select-Object -First 20
