#!/bin/bash

echo "🚀 Setting up development tools for Construction Success Platform..."

# Install VS Code extensions
echo "📦 Installing VS Code extensions..."
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-json
code --install-extension ms-vscode.vscode-eslint
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension ms-vscode.vscode-thunder-client

# Install global npm packages
echo "📦 Installing global npm packages..."
npm install -g newman
npm install -g lighthouse
npm install -g netlify-cli
npm install -g vercel
npm install -g pm2
npm install -g audit-ci

# Install PWA tools
echo "📱 Installing PWA tools..."
npm install -g pwa-asset-generator
npm install -g workbox-cli

# Install IoT testing tools
echo "🌐 Installing IoT testing tools..."
npm install -g mqtt-cli

# Install blockchain tools
echo "⛓️ Installing blockchain tools..."
npm install -g truffle
npm install -g hardhat

echo "✅ Development tools setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Install browser extensions manually:"
echo "   - React Developer Tools"
echo "   - Redux DevTools" 
echo "   - Lighthouse"
echo "   - Web Vitals"
echo ""
echo "2. Test your PWA with:"
echo "   - Chrome DevTools Device Mode"
echo "   - Lighthouse audit"
echo ""
echo "3. Set up monitoring:"
echo "   - Netlify Analytics (already configured)"
echo "   - Consider Sentry for error tracking"
echo ""
echo "🎉 Your development environment is ready!"
