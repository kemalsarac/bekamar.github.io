from __future__ import annotations
import html, json, re
from pathlib import Path
from urllib.parse import unquote, urlsplit
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
MANIFEST=json.loads((ROOT/'assets/optimized/site/manifest.json').read_text(encoding='utf-8'))
IMG_RE=re.compile(r'<img\b[^>]*>',re.I|re.S)
ATTR_RE=re.compile(r'([:\w-]+)\s*=\s*(["\'])(.*?)\2',re.S)
def attrs(tag): return {m.group(1).lower():html.unescape(m.group(3)) for m in ATTR_RE.finditer(tag)}
def add_attr(tag,name,value):
    if re.search(rf'\b{re.escape(name)}\s*=',tag,re.I): return re.sub(rf'\b{re.escape(name)}\s*=\s*(["\']).*?\1',f'{name}="{value}"',tag,count=1,flags=re.I|re.S)
    return tag[:-1].rstrip()+f' {name}="{value}">'
def srcset(records): return ', '.join(f'../{item["path"]} {item["width"]}w' for item in records)
def sizes_for(classes):
    c=classes.lower()
    if 'hero' in c or 'blog-hero' in c: return '100vw'
    if 'brand' in c or 'logo' in c: return '180px'
    if 'image' in c or 'portrait' in c: return '(max-width: 700px) 100vw, 50vw'
    return '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 40vw'
processed=0;dimensions=0;files=[]
for page in sorted(ROOT.rglob('*.html')):
    if '.git' in page.parts: continue
    text=page.read_text(encoding='utf-8-sig')
    page_changed=False
    def transform(match):
        nonlocal_dummy=None
        nonlocal_vars=None
        global processed,dimensions
        tag=match.group(0); a=attrs(tag); raw=a.get('src','')
        previous= text[:match.start()]
        if previous.rfind('<picture') > previous.rfind('</picture>') and 'site-image-picture' in previous[previous.rfind('<picture'):]:
            return tag
        if not raw or raw.startswith(('http:','https:','data:','blob:')): return tag
        pathpart=unquote(urlsplit(raw).path)
        source=(page.parent/pathpart).resolve()
        try: source_rel=source.relative_to(ROOT).as_posix()
        except ValueError: return tag
        if not source.is_file(): return tag
        try:
            with Image.open(source) as im: width,height=im.size
        except Exception: return tag
        if not a.get('width') or not a.get('height'):
            tag=add_attr(tag,'width',str(width));tag=add_attr(tag,'height',str(height));dimensions+=1
        tag=add_attr(tag,'decoding','async')
        classes=a.get('class','')
        critical=any(key in classes for key in ('hero__video','blog-hero__image','brand-splash__','brand '))
        if not critical and 'loading' not in a: tag=add_attr(tag,'loading','lazy')
        rec=MANIFEST.get(source_rel)
        if not rec: return tag
        rel_to_page=Path(__import__('os').path.relpath(ROOT,page.parent)).as_posix()
        if rel_to_page=='.': rel_to_page=''
        prefix=(rel_to_page+'/' if rel_to_page else '')
        def pathlist(items): return ', '.join(f'{prefix}{x["path"]} {x["width"]}w' for x in items)
        avif=pathlist(rec['avif']); webp=pathlist(rec['webp']); sizes=sizes_for(classes)
        sources=[]
        if avif: sources.append(f'<source type="image/avif" srcset="{avif}" sizes="{sizes}">')
        sources.append(f'<source type="image/webp" srcset="{webp}" sizes="{sizes}">')
        processed+=1
        return '<picture class="site-image-picture">'+''.join(sources)+tag+'</picture>'
    transformed=IMG_RE.sub(transform,text)
    if transformed!=text:
        page.write_text(transformed,encoding='utf-8',newline='')
        files.append(f'{page.relative_to(ROOT).as_posix()}')
print(f'Wrapped {processed} image references with responsive AVIF/WebP sources; added intrinsic dimensions to {dimensions} local images.')
print('HTML files updated:',', '.join(files))
