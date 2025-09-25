# Deployment Guide

## Quick Start

### 1. Local Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Preview production build
pnpm build && pnpm preview
```

### 2. Production Deployment

#### Option A: Netlify (Recommended)
1. **Connect GitHub Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build settings are pre-configured in `netlify.toml`

2. **Environment Variables** (Optional)
   ```bash
   PING_MESSAGE=Your custom message
   CORS_ORIGINS=https://yourdomain.com
   ```

3. **Auto-deploy on Push**
   - Push to `main` branch triggers automatic deployment
   - Preview deployments for pull requests

#### Option B: Vercel
1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Framework preset: Vite

2. **Build Settings**
   - Build Command: `pnpm build`
   - Output Directory: `dist/spa`
   - Install Command: `pnpm install`

#### Option C: GitHub Pages
1. **Enable GitHub Pages**
   - Repository Settings → Pages
   - Source: GitHub Actions

2. **Deploy Workflow**
   - The included workflow will build and deploy automatically
   - Site will be available at `https://username.github.io/repository-name`

## CI/CD Pipeline

### GitHub Actions Workflow
- **Test & Lint**: Runs on every push/PR
- **Build & Deploy**: Runs only on `main` branch
- **Artifacts**: Build outputs stored for 7 days

### Manual Deployment
```bash
# Build the application
pnpm build

# Deploy to Netlify (requires Netlify CLI)
npx netlify deploy --prod --dir=dist/spa

# Deploy to Vercel (requires Vercel CLI)
npx vercel --prod
```

## Environment Configuration

### Development
```bash
# .env.local
PING_MESSAGE=Development ping
CORS_ORIGINS=http://localhost:8080,http://localhost:8081
```

### Production
```bash
# Environment variables in deployment platform
PING_MESSAGE=Production API
CORS_ORIGINS=https://yourdomain.com
```

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
pnpm build
npx vite-bundle-analyzer dist/spa
```

### Code Splitting
- Pages are automatically code-split
- Vendor libraries separated into chunks
- Lazy loading for better performance

### Caching Strategy
- Static assets cached for 1 year
- API responses cached appropriately
- Service worker for offline support

## Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Bundle size monitoring
- Build time optimization

### Error Tracking
- Client-side error boundaries
- Server-side error logging
- Performance metrics collection

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   pnpm build
   ```

2. **Port Conflicts**
   ```bash
   # Use alternative port
   pnpm dev:8081
   ```

3. **TypeScript Errors**
   ```bash
   # Run typecheck
   pnpm typecheck
   ```

### Support
- Check GitHub Issues for known problems
- Review CI/CD logs for build failures
- Monitor deployment platform status

## Security Considerations

### Environment Variables
- Never commit `.env` files
- Use platform-specific secret management
- Rotate API keys regularly

### Dependencies
- Regular security audits: `pnpm audit`
- Keep dependencies updated
- Monitor for vulnerabilities

### Headers & CORS
- Helmet.js for security headers
- CORS properly configured
- Content Security Policy enabled
