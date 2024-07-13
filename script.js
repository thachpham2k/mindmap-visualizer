
let inputMode = 'markdown'; // Default mode is markdown

// Initial JSON and Markdown samples
const sampleMarkdown = `# Sample Markdown
## Links

- [Website](https://markmap.js.org/)
- [GitHub](https://github.com/gera2ld/markmap)

## Related Projects

- [coc-markmap](https://github.com/gera2ld/coc-markmap) for Neovim
- [markmap-vscode](https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode) for VSCode
- [eaf-markmap](https://github.com/emacs-eaf/eaf-markmap) for Emacs

## Features

Note that if blocks and lists appear at the same level, the lists will be ignored.

### Lists

- **strong** ~~del~~ *italic* ==highlight==
- \`inline code\`
- [x] checkbox
- Katex: $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$ <!-- markmap: fold -->
  - [More Katex Examples](#?d=gist:af76a4c245b302206b16aec503dbe07b:katex.md)
- Now we can wrap very very very very long text based on \`maxWidth\` option

### Blocks

\`\`\`js
')
\`\`\`

| Products | Price |
|-|-|
| Apple | 4 |
| Banana | 2 |
`;

const sampleJson = `{
    "title": "Sample Markdown",
    "Links": [
        "Website: https://markmap.js.org/",
        "GitHub: https://github.com/gera2ld/markmap"
    ],
    "Related Projects": [
        "coc-markmap: https://github.com/gera2ld/coc-markmap",
        "markmap-vscode: https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode",
        "eaf-markmap: https://github.com/emacs-eaf/eaf-markmap"
    ],
    "Features": {
        "Lists": [
            "**strong** ~~del~~ *italic* ==highlight==",
            "\`inline code\`",
            "[x] checkbox",
            "Katex: $x = {-b pm sqrt{b^2-4ac} over 2a}$",
            "Now we can wrap very very very very long text based on \`maxWidth\` option"
        ]
    }
}`;

// Function to set input mode (Markdown or JSON)
function setInputMode(mode) {
    inputMode = mode;
    const inputArea = document.getElementById('inputArea');
    inputArea.placeholder = `Paste your ${mode === 'markdown' ? 'Markdown' : 'JSON'} here...`;
    updateMindmap();
}

// Function to insert sample code based on current mode
function insertSampleCode() {
    const inputArea = document.getElementById('inputArea');
    if (inputMode === 'markdown') {
        inputArea.value = sampleMarkdown;
    } else {
        inputArea.value = sampleJson;
    }
    updateMindmap();
}

// Function to create mindmap from Markdown or JSON input
function createMindmap(markdown, options = {}) {
    const { Transformer, Markmap, loadCSS, loadJS } = markmap;
    const transformer = new Transformer();
    const { root, features } = transformer.transform(markdown);
    const { styles, scripts } = transformer.getUsedAssets(features);

    if (styles) loadCSS(styles);
    if (scripts) loadJS(scripts, { getMarkmap: () => markmap });

    // Clear the SVG content before rendering new mindmap
    document.getElementById('mindmapSvg').innerHTML = '';

    Markmap.create("#mindmapSvg", {
        duration: 0,
        ...options
    }, root);
}

// Function to update mindmap based on current input
function updateMindmap() {
    const inputArea = document.getElementById('inputArea').value;
    if (inputMode === 'json') {
        try {
            const json = JSON.parse(inputArea);
            const markdown = jsonToMarkdown(json);
            createMindmap(markdown);
        } catch (error) {
            console.error('Invalid JSON:', error);
        }
    } else {
        createMindmap(inputArea);
    }
}

// Function to convert JSON to Markdown
function jsonToMarkdown(json, indent = '') {
    let markdown = '';
    for (const key in json) {
        if (typeof json[key] === 'object') {
            markdown += `${indent}- ${key}\n${jsonToMarkdown(json[key], indent + '  ')}`;
        } else {
            markdown += `${indent}- ${key}: ${json[key]}\n`;
        }
    }
    return markdown;
}

// Function to handle file loading
function loadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const contents = e.target.result;
        document.getElementById('inputArea').value = contents;
        try {
            const json = JSON.parse(contents);
            const markdown = jsonToMarkdown(json);
            inputMode = 'json'
            createMindmap(markdown);
        } catch (error) {
            inputMode = 'markdown'
            createMindmap(contents);
        }
        updateMindmap();
    };
    reader.readAsText(file);
}
// Initialize with initial Markdown placeholder
window.onload = function () {
    const inputArea = document.getElementById('inputArea');
    inputArea.placeholder = 'Paste your Markdown here...';
    updateMindmap();
};