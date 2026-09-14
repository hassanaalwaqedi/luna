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
    
    # Needs to match things like <h1>Title</h1> or <button>Click me</button>
    # It will find > Text < and replace with >{t('key')}<
    
    # 1. Match standard tags with text content
    # Exclude strings with { or } already in them to avoid breaking JSX expressions
    pattern = re.compile(r'>\s*([A-Z][a-zA-Z0-9\s\.\,\?\!\:\-\'&]{2,100})\s*<')
    
    def replacer(match):
        nonlocal modified
        text = match.group(1).strip()
        key = to_camel_case(text)
        
        # Don't translate common code words
        if key.lower() in ['div', 'span', 'class', 'href', 'jsx']:
            return match.group(0)
            
        dictionary[key] = text
        modified = True
        return f">{{t('{key}')}}<"
        
    new_content = pattern.sub(replacer, content)
    
    if modified:
        # Check if useTranslation is imported
        if 'useTranslation' not in new_content:
            new_content = "import { useTranslation } from 'react-i18next';\n" + new_content
            
        # Try to inject const { t } = useTranslation(); at the start of component functions
        # This is a naive injection, but works for most standard function components
        component_pattern = re.compile(r'(export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)')
        
        def inject_t(match):
            return match.group(1) + "\n  const { t } = useTranslation();"
            
        new_content = component_pattern.sub(inject_t, new_content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
    return modified

def main():
    src_dir = 'src'
    dictionary = {}
    
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.jsx') and file not in ['main.jsx', 'i18n.js']:
                filepath = os.path.join(root, file)
                process_file(filepath, dictionary)
                
    # Save the extracted dictionary
    with open('extracted_en.json', 'w', encoding='utf-8') as f:
        json.dump({"auto": dictionary}, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    main()
