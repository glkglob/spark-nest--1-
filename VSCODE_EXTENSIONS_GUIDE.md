# 🚀 VS Code Extensions Setup Guide

## 📋 **Essential Extensions for Construction Success Platform**

### **🔧 Core Development Extensions**

| Extension | ID | Purpose |
|-----------|----|---------| 
| **TypeScript Importer** | `ms-vscode.vscode-typescript-next` | Enhanced TypeScript support |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Tailwind CSS autocomplete |
| **Prettier** | `esbenp.prettier-vscode` | Code formatting |
| **ESLint** | `ms-vscode.vscode-eslint` | Code linting |
| **Auto Rename Tag** | `formulahendry.auto-rename-tag` | Auto-rename HTML/JSX tags |
| **Path Intellisense** | `christian-kohler.path-intellisense` | File path autocomplete |

### **🚀 API & Testing Extensions**

| Extension | ID | Purpose |
|-----------|----|---------|
| **Thunder Client** | `rangav.vscode-thunder-client` | API testing (Postman alternative) |
| **REST Client** | `humao.rest-client` | HTTP client for API testing |

### **📦 Project Management Extensions**

| Extension | ID | Purpose |
|-----------|----|---------|
| **GitLens** | `eamodio.gitlens` | Enhanced Git capabilities |
| **Git Graph** | `mhutchie.git-graph` | Visualize Git history |
| **Project Manager** | `alefragnani.project-manager` | Manage multiple projects |

### **🎨 UI/UX Extensions**

| Extension | ID | Purpose |
|-----------|----|---------|
| **Bracket Pair Colorizer** | `CoenraadS.bracket-pair-colorizer` | Colorize matching brackets |
| **Indent Rainbow** | `oderwat.indent-rainbow` | Colorize indentation |
| **Material Icon Theme** | `PKief.material-icon-theme` | Beautiful file icons |

## 🛠️ **Installation Methods**

### **Method 1: VS Code UI Installation**

1. **Open VS Code**
2. **Press `Cmd+Shift+X`** (Extensions panel)
3. **Search for each extension** using the ID
4. **Click Install**

### **Method 2: Command Line Installation**

If VS Code command line is set up:

```bash
# Install core extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense

# Install API testing extensions
code --install-extension rangav.vscode-thunder-client
code --install-extension humao.rest-client

# Install project management extensions
code --install-extension eamodio.gitlens
code --install-extension mhutchie.git-graph
code --install-extension alefragnani.project-manager

# Install UI/UX extensions
code --install-extension CoenraadS.bracket-pair-colorizer
code --install-extension oderwat.indent-rainbow
code --install-extension PKief.material-icon-theme
```

### **Method 3: Setup VS Code Command Line (if needed)**

If `code` command is not available:

1. **Open VS Code**
2. **Press `Cmd+Shift+P`**
3. **Type "Shell Command: Install 'code' command in PATH"**
4. **Press Enter**
5. **Restart Terminal**

## 🎯 **Recommended Settings**

Add these to your VS Code `settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

## 🚀 **Quick Setup Script**

Run this in your terminal (after VS Code is installed):

```bash
# Make the script executable
chmod +x setup-dev-tools.sh

# Run the setup script
./setup-dev-tools.sh
```

## ✅ **Verification**

After installation, verify by:

1. **Open your project in VS Code**
2. **Check Extensions panel** (`Cmd+Shift+X`)
3. **Verify all extensions are installed and enabled**
4. **Test Tailwind autocomplete** in a `.tsx` file
5. **Test Thunder Client** by creating a new request

## 🎉 **Benefits**

These extensions will provide:

- ✅ **Better TypeScript support** for your React components
- ✅ **Tailwind CSS autocomplete** for faster styling
- ✅ **Automatic code formatting** with Prettier
- ✅ **Real-time linting** with ESLint
- ✅ **API testing** without leaving VS Code
- ✅ **Enhanced Git workflow** with GitLens
- ✅ **Better file organization** with icons and path intellisense

## 🔧 **Troubleshooting**

### **If extensions don't install:**
1. Check internet connection
2. Restart VS Code
3. Try installing one by one
4. Check VS Code version compatibility

### **If command line doesn't work:**
1. Reinstall VS Code
2. Use VS Code UI method instead
3. Check PATH configuration

---

**🎯 Next Steps:** After installing these extensions, you'll have a powerful development environment optimized for your construction management platform!
