# Script para leer el directorio del personal desde el archivo docx
import zipfile
import xml.etree.ElementTree as ET

ruta_docx = 'DOCUMENTOS DE GESTION/DIRECTORIO actualizado JCM 2026.docx'

with zipfile.ZipFile(ruta_docx) as z:
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    rows = tree.findall('.//w:tr', ns)
    
    with open('directorio_extraido.txt', 'w', encoding='utf-8') as out:
        for r in rows:
            cells = r.findall('.//w:tc', ns)
            row_text = []
            for c in cells:
                texts = [t.text for t in c.findall('.//w:t', ns) if t.text]
                row_text.append(' '.join(texts).strip())
            out.write(' | '.join(row_text) + '\n')
            print(' | '.join(row_text))
