import os
from bs4 import BeautifulSoup
import json

def analyze_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    data = {
        'page': os.path.basename(file_path),
        'buttons': [],
        'inputs': [],
        'tables': [],
        'cards': []
    }
    
    for btn in soup.find_all(['button', 'a']):
        text = btn.get_text(strip=True)
        if text:
            data['buttons'].append(text)
            
    for inp in soup.find_all(['input', 'select', 'textarea']):
        name = inp.get('name') or inp.get('id') or inp.get('placeholder') or inp.get('type')
        if name:
            data['inputs'].append(name)
            
    for table in soup.find_all('table'):
        headers = [th.get_text(strip=True) for th in table.find_all('th')]
        data['tables'].append(headers)
        
    for card in soup.find_all(class_=lambda x: x and 'card' in x.lower()):
        # Just count or get some header
        h = card.find(['h1','h2','h3','h4'])
        data['cards'].append(h.get_text(strip=True) if h else 'Card')
        
    # Deduplicate buttons, inputs
    data['buttons'] = list(dict.fromkeys(data['buttons']))
    data['inputs'] = list(dict.fromkeys(data['inputs']))
    return data

directory = 'C:/Users/anjee/OneDrive/Documents/BTECH/SEM 8/COMPREHENSIVE SEMINAR/TimberTrack/ui_screens'
results = []
for file in os.listdir(directory):
    if file.endswith('.html'):
        results.append(analyze_html(os.path.join(directory, file)))

print(json.dumps(results, indent=2))
