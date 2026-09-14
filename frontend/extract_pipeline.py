import os
import re
import json

def to_camel_case(text):
    text = re.sub(r'[^a-zA-Z0-9 ]', '', text)
    words = text.split()
    if not words:
        return "empty"
    return words[0].lower() + ''.join(word.capitalize() for word in words[1:5])

def process_file(filepath, dictionary):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    pattern = re.compile(r'>\s*([A-Za-z][a-zA-Z0-9\s\.\,\?\!\:\-\'&]{2,100})\s*<')
    
    def replacer(match):
        nonlocal modified
        text = match.group(1).strip()
        
        if '{' in text or '}' in text:
            return match.group(0)
            
        key = to_camel_case(text)
        
        if key.lower() in ['div', 'span', 'class', 'href', 'jsx', 'ai']:
            return match.group(0)
            
        dictionary[key] = text
        modified = True
        return f">{{t('{key}')}}<"
        
    new_content = pattern.sub(replacer, content)
    
    placeholder_pattern = re.compile(r'placeholder="([^"]*[a-zA-Z][^"]*)"')
    def placeholder_replacer(match):
        nonlocal modified
        text = match.group(1).strip()
        key = to_camel_case(text)
        dictionary[key] = text
        modified = True
        return f'placeholder={{t(\'{key}\')}}'
        
    new_content = placeholder_pattern.sub(placeholder_replacer, new_content)
    
    if modified:
        if 'useTranslation' not in new_content:
            new_content = "import { useTranslation } from 'react-i18next';\n" + new_content
            
        component_pattern = re.compile(r'(export\s+(?:default\s+)?function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)')
        
        def inject_t(match):
            return match.group(1) + "\n  const { t } = useTranslation();"
            
        if 'const { t } = useTranslation()' not in new_content:
            new_content = component_pattern.sub(inject_t, new_content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
    return modified

def main():
    paths = ['src/pages/Pipeline.jsx', 'src/components/pipeline']
    dictionary = {}
    
    for p in paths:
        if os.path.isfile(p):
            process_file(p, dictionary)
        elif os.path.isdir(p):
            for root, dirs, files in os.walk(p):
                for file in files:
                    if file.endswith('.jsx'):
                        filepath = os.path.join(root, file)
                        process_file(filepath, dictionary)
                
    with open('pipeline_en.json', 'w', encoding='utf-8') as f:
        json.dump(dictionary, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    main()
