import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MIDIA_DIR = (BASE_DIR / 'MIDEA') if (BASE_DIR / 'MIDEA').exists() else (BASE_DIR / 'midia')
INDEX_HTML = BASE_DIR / 'index.html'

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif'}
VIDEO_EXTENSIONS = {'.mp4', '.webm', '.mov', '.mkv'}

def format_title(filename):
    stem = Path(filename).stem
    cleaned = re.sub(r'[-_]+', ' ', stem).strip()
    return cleaned.capitalize() if cleaned else stem

def scan_media():
    for pasta in ('fotografia', 'videos'):
        (MIDIA_DIR / pasta).mkdir(parents=True, exist_ok=True)

    items = []
    files = sorted(MIDIA_DIR.rglob('*'), key=lambda f: f.relative_to(MIDIA_DIR).as_posix().lower())
    folder_name = MIDIA_DIR.name
    for file in files:
        if not file.is_file():
            continue
        # Ignora o logo da barbearia para que não apareça na galeria de cortes
        if file.stem.lower().startswith('logo'):
            continue
        ext = file.suffix.lower()
        if ext in IMAGE_EXTENSIONS:
            tipo = 'imagem'
        elif ext in VIDEO_EXTENSIONS:
            tipo = 'video'
        else:
            continue

        titulo = format_title(file.name)
        src = f"{folder_name}/" + file.relative_to(MIDIA_DIR).as_posix()
        items.append({
            'tipo': tipo,
            'src': src,
            'titulo': titulo
        })
    return items

def update_index_html(items):
    if not INDEX_HTML.exists():
        print(f"Erro: Arquivo {INDEX_HTML} não encontrado.")
        return False

    content = INDEX_HTML.read_text(encoding='utf-8')

    js_array = 'const galeria = ' + json.dumps(items, ensure_ascii=True, indent=2).replace('<', '\\u003c') + ';'

    pattern = r"const\s+galeria\s*=\s*\[[\s\S]*?\];"
    if not re.search(pattern, content):
        print("Aviso: 'const galeria = [...];' não foi encontrado no index.html.")
        return False

    new_content = re.sub(pattern, lambda match: js_array, content, count=1)
    INDEX_HTML.write_text(new_content, encoding='utf-8')
    return True

def main():
    print(f"Atualizando galeria com os arquivos da pasta '{MIDIA_DIR.name}'...")
    items = scan_media()
    if update_index_html(items):
        imgs = sum(1 for i in items if i['tipo'] == 'imagem')
        vids = sum(1 for i in items if i['tipo'] == 'video')
        print(f"Sucesso! Galeria atualizada no index.html com {imgs} foto(s) e {vids} vídeo(s).")
    else:
        print("Falha ao atualizar o index.html.")

if __name__ == '__main__':
    main()
