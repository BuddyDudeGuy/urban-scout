import re, sys, glob, os

os.chdir(r"E:\Personal Projects\CPSC 471 Project\urban-scout\docs\final-report")

total_issues = 0
for path in sorted(glob.glob('sections/*.tex')):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    # strip lstlisting blocks
    cleaned = re.sub(r'\\begin\{lstlisting\}.*?\\end\{lstlisting\}', '', text, flags=re.DOTALL)
    # also strip verbatim if any
    cleaned = re.sub(r'\\begin\{verbatim\}.*?\\end\{verbatim\}', '', cleaned, flags=re.DOTALL)

    lines = cleaned.split('\n')
    file_issues = 0
    for i, line in enumerate(lines, 1):
        stripped = line.lstrip()
        if stripped.startswith('%'):
            continue
        if ';' in line:
            file_issues += 1
            print(f'{path}:{i}: {line.rstrip()}')
    if file_issues:
        total_issues += file_issues

print(f'\nTotal prose semicolons (outside lstlisting): {total_issues}')

# also check em dashes
em_total = 0
for path in sorted(glob.glob('sections/*.tex')):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    if 'EM_PLACEHOLDER' in text:  # noop
        pass
    em_count = text.count('—')  # em dash
    if em_count:
        em_total += em_count
        print(f'{path}: {em_count} em dashes found')
print(f'Total em dashes: {em_total}')
