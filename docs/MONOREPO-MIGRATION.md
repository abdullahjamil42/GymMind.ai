# Monorepo Migration Guide

## Overview

This document explains the migration from a standalone Next.js app to a monorepo structure with both web (Next.js) and mobile (React Native) applications.

## What Changed

### Before (Single App)
```
gymmind-ai/
├── src/                  # Next.js app
├── package.json          # Single package
└── ...config files
```

### After (Monorepo)
```
gymmind-ai-monorepo/
├── apps/
│   ├── web/             # Next.js app (migrated)
│   └── mobile/          # React Native app (new)
├── packages/
│   └── common/          # Shared code (new)
├── turbo.json           # Turborepo config
└── package.json         # Root workspace config
```

## Key Benefits

1. **Code Sharing**: Types, utilities, and business logic shared between web and mobile
2. **Unified Development**: Work on both platforms simultaneously
3. **Consistent Types**: Same data models across platforms
4. **Faster Development**: Reuse validation, constants, and utilities
5. **Easier Maintenance**: Single source of truth for shared code

## Project Structure

### Root Level
- `package.json` - Workspace configuration with Turborepo
- `turbo.json` - Build pipeline configuration
- `pnpm-workspace.yaml` - Workspace definition

### Apps

#### `apps/web/` - Next.js Web App
- All previous Next.js code moved here
- Now imports from `common` package
- Independent deployment

#### `apps/mobile/` - React Native Mobile App
- New React Native application
- iOS and Android support
- Imports from `common` package
- Independent deployment

### Packages

#### `packages/common/` - Shared Code
- **Types**: Shared TypeScript interfaces
- **Validations**: Zod schemas
- **Constants**: API endpoints, routes
- **Utils**: Helper functions

## Development Commands

### Root Level Commands (Run from project root)
```bash
# Install all dependencies
npm install

# Run all apps in development
npm run dev

# Run specific app
npm run dev:web
npm run dev:mobile

# Build all apps
npm run build

# Build specific app
npm run build:web

# Type check all packages
npm run type-check

# Lint all packages
npm run lint
```

### App-Specific Commands
```bash
# Web app
cd apps/web
npm run dev
npm run build

# Mobile app
cd apps/mobile
npm run dev          # Start Metro bundler
npm run android      # Run on Android
npm run ios          # Run on iOS
```

### Common Package Commands
```bash
cd packages/common
npm run build        # Build TypeScript
npm run dev          # Watch mode
npm run type-check   # Type checking
```

## How Code Sharing Works

### 1. Define Shared Types
```typescript
// packages/common/src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
}
```

### 2. Use in Web App
```typescript
// apps/web/src/app/api/users/route.ts
import { User, userSchema } from 'common';

export async function GET() {
  const users: User[] = await fetchUsers();
  return Response.json(users);
}
```

### 3. Use in Mobile App
```typescript
// apps/mobile/src/screens/ProfileScreen.tsx
import { User, formatDate } from 'common';

export const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  // ...
};
```

## Migration Checklist

- [x] Create monorepo structure
- [x] Move Next.js app to `apps/web/`
- [x] Create React Native app in `apps/mobile/`
- [x] Extract shared code to `packages/common/`
- [x] Configure Turborepo
- [x] Update package.json files
- [x] Update documentation
- [ ] Install dependencies (`npm install`)
- [ ] Build common package (`cd packages/common && npm run build`)
- [ ] Test web app (`npm run dev:web`)
- [ ] Test mobile app (`npm run dev:mobile`)

## Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Shared Package**
   ```bash
   cd packages/common
   npm run build
   cd ../..
   ```

3. **Test Web App**
   ```bash
   npm run dev:web
   ```
   Open http://localhost:3000

4. **Test Mobile App**
   ```bash
   # Terminal 1: Start Metro
   npm run dev:mobile
   
   # Terminal 2: Run on device
   cd apps/mobile
   npm run android  # or npm run ios
   ```

5. **Update Imports in Web App**
   - Replace local imports with `common` package imports where applicable
   - Example: `import { User } from '@/types'` → `import { User } from 'common'`

6. **Add Mobile Features**
   - Navigation (React Navigation)
   - State management
   - API integration using shared endpoints
   - UI components

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module 'common'`
- **Solution**: Build the common package first: `cd packages/common && npm run build`

**Issue**: Type errors in apps after updating common package
- **Solution**: Rebuild common and restart dev servers

**Issue**: Metro bundler errors in React Native
- **Solution**: Clear cache: `cd apps/mobile && npx react-native start --reset-cache`

**Issue**: iOS pod install errors
- **Solution**: 
  ```bash
  cd apps/mobile/ios
  pod deintegrate
  pod install
  ```

## Best Practices

1. **Always build `common` package after changes**
   ```bash
   cd packages/common && npm run build
   ```

2. **Use shared types everywhere**
   - Don't duplicate type definitions
   - Import from `common` package

3. **Keep common package platform-agnostic**
   - No React Native or Next.js specific code
   - Pure TypeScript/JavaScript only

4. **Use workspace dependencies**
   - Reference `common` as `workspace:*` in package.json

5. **Run type-check before committing**
   ```bash
   npm run type-check
   ```

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

## Questions?

Refer to individual app READMEs:
- [Web App README](../apps/web/README.md)
- [Mobile App README](../apps/mobile/README.md)
- [Common Package README](../packages/common/README.md)
