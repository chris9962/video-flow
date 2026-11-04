#!/bin/bash
# Lưu ảnh cuối trong tab ChatGPT qua CDP của tab: <tab id> <file ra> <ảnh trước để so>
SP=$(dirname "$0")
node "$SP/cdp-eval.mjs" "$1" "(async()=>{const imgs=[...document.querySelectorAll('img')].filter(i=>i.naturalWidth>=1000); const last=imgs[imgs.length-1]; const b=await (await fetch(last.src)).blob(); const buf=new Uint8Array(await b.arrayBuffer()); let s=''; for(let i=0;i<buf.length;i+=32768) s+=String.fromCharCode(...buf.subarray(i,i+32768)); return {n:imgs.length, data:btoa(s)};})()" > "$SP/last.json" && python3 - "$SP/last.json" "$2" "$3" <<'PY'
import json,sys,base64,io,hashlib
from PIL import Image
d=json.load(open(sys.argv[1])); raw=base64.b64decode(d['data'])
Image.open(io.BytesIO(raw)).save(sys.argv[2])
same=hashlib.md5(open(sys.argv[2],'rb').read()).hexdigest()==hashlib.md5(open(sys.argv[3],'rb').read()).hexdigest()
print(f"{d['n']} ảnh lớn trong chat, lưu {sys.argv[2]}, giống {sys.argv[3]}: {same}")
PY
