---
description: Frontend development standards, best practices, and conventions for this gym management React application including component patterns, state management, UI/UX guidelines, and testing practices
globs: ["frontend/src/**/*.{js,jsx,ts,tsx}", "frontend/e2e/**/*.{ts,js}", "frontend/tsconfig.json", "frontend/playwright.config.ts", "frontend/vite.config.ts", "frontend/package.json"]
alwaysApply: true
---

# Frontend Project Configuration and Best Practices

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
  - [Core Technologies](#core-technologies)
  - [UI Framework](#ui-framework)
  - [State Management & Data Flow](#state-management--data-flow)
  - [Testing Framework](#testing-framework)
  - [Development Tools](#development-tools)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
  - [Language and Naming Conventions](#language-and-naming-conventions)
  - [Component Conventions](#component-conventions)
  - [State Management](#state-management)
  - [Service Layer Architecture](#service-layer-architecture)
- [UI/UX Standards](#uiux-standards)
  - [MUI Integration](#mui-integration)
  - [Form Handling](#form-handling)
  - [Navigation Patterns](#navigation-patterns)
  - [Accessibility](#accessibility)
- [Testing Standards](#testing-standards)
  - [End-to-End Testing with Playwright](#end-to-end-testing-with-playwright)
  - [Test Organization](#test-organization)
- [Configuration Standards](#configuration-standards)
  - [TypeScript Configuration](#typescript-configuration)
  - [ESLint Configuration](#eslint-configuration)
  - [Environment Configuration](#environment-configuration)
- [Performance Best Practices](#performance-best-practices)
  - [Component Optimization](#component-optimization)
  - [Bundle Optimization](#bundle-optimization)
  - [API Efficiency](#api-efficiency)
- [Development Workflow](#development-workflow)
  - [Git Workflow](#git-workflow)
  - [Development Scripts](#development-scripts)
  - [Code Quality](#code-quality)

---

## Overview

This document outlines the best practices, conventions, and standards used in this gym management frontend application (single-admin MVP: clients, medical records, exercise catalog, routine templates, payments, dashboard). These practices ensure code consistency, maintainability, and optimal development experience.

## Technology Stack

### Core Technologies
- **React 18**: Modern React with functional components and hooks
- **TypeScript**: For type safety and better development experience
- **Vite**: Build tooling and development server
- **React Router DOM**: Client-side routing and navigation

### UI Framework
- **MUI (Material UI)**: Component library — chosen for this MVP because most
  screens are CRUD tables and forms (client list, payment history, exercise
  catalog, routine builder); `DataGrid`, form controls, dialogs, and date
  pickers come ready to use, minimizing custom UI work for a solo developer.
- **MUI Icons**: Icon library

### State Management & Data Flow
- **React Hooks**: useState, useEffect for local state management
- **React Context**: Auth state (see US-001) and other cross-cutting state
- **Axios**: HTTP client for API communication

### Internationalization
- **react-i18next** + **i18next** + **i18next-browser-languagedetector**:
  bilingual UI (Spanish default, English), see the Internationalization
  section below and US-010.

### Testing Framework
- **Playwright**: End-to-end testing (aligned with the Playwright MCP
  integration recommended in this repo's workflow)
- **Vitest** + **React Testing Library**: Unit/component testing

### Development Tools
- **ESLint**: Code linting with React-specific rules
- **TypeScript**: Static type checking
- **Web Vitals**: Performance monitoring (Core Web Vitals — LCP, FID, CLS),
  works the same regardless of build tool (Vite or otherwise)

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components (one per route)
│   ├── services/          # API service layer (axios calls per resource)
│   ├── context/           # React context providers (e.g. AuthContext)
│   ├── i18n/              # i18next config + locales/ (es.json, en.json)
│   ├── assets/            # Images, fonts, static resources
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── e2e/                   # Playwright end-to-end test files
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── playwright.config.ts   # Playwright configuration
```

## Coding Standards

### Naming Conventions

- **Component Naming**: Use PascalCase for React components (e.g., `ClientCard`, `RoutineTemplateDetails`, `PaymentDashboard`)
- **Variable Naming**: Use camelCase for variables and functions (e.g., `clientId`, `handleSubmit`, `fetchRoutineTemplates`)
- **Constants Naming**: Use UPPER_SNAKE_CASE for constants (e.g., `MAX_CLIENTS_PER_PAGE`, `API_BASE_URL`)
- **Type/Interface Naming**: Use PascalCase for types and interfaces (e.g., `ClientData`, `RoutineTemplateProps`, `IClientService`)
- **File Naming**: Use PascalCase for component files (e.g., `ClientCard.tsx`, `RoutineTemplateDetails.tsx`) and camelCase for utility files (e.g., `clientService.ts`, `apiUtils.ts`)
- **CSS Class Naming**: Use kebab-case for CSS classes (e.g., `client-card`, `routine-template-details`)
- **Hook Naming**: Use camelCase starting with "use" prefix (e.g., `useClient`, `useRoutineTemplateData`, `useFormValidation`)

**Examples:**

```typescript
// Good: All in English
import React, { useState, useEffect } from 'react';

type ClientCardProps = {
    client: Client;
    index: number;
    onClick: (client: Client) => void;
};

const ClientCard: React.FC<ClientCardProps> = ({ client, index, onClick }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    // Handle client card click event
    const handleCardClick = () => {
        onClick(client);
    };
    
    return (
        <div className="client-card" onClick={handleCardClick}>
            {/* Component JSX */}
        </div>
    );
};

// Avoid: Non-English comments or names
const TarjetaCliente: React.FC<PropsTarjetaCliente> = ({ cliente, indice, alHacerClic }) => {
    const [estaCargando, setEstaCargando] = useState(false);
    
    // Manejar evento de clic en la tarjeta de cliente
    const manejarClicTarjeta = () => {
        alHacerClic(cliente);
    };
    
    return (
        <div className="tarjeta-cliente" onClick={manejarClicTarjeta}>
            {/* JSX del componente */}
        </div>
    );
};
```

**Error Messages and Console Logs:**

```typescript
// Good: English error messages
catch (error) {
    console.error('Failed to fetch clients:', error);
    setError('Unable to load clients. Please try again later.');
}

// Avoid: Non-English messages
catch (error) {
    console.error('Error al obtener clientes:', error);
    setError('No se pudieron cargar los clientes. Por favor, inténtelo de nuevo más tarde.');
}
```

**Service Layer Examples:**

```typescript
// Good: English naming in services
export const clientService = {
    getAllClients: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/clients`);
            return response.data;
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    }
};

// Avoid: Non-English naming
export const servicioClientes = {
    obtenerTodosLosClientes: async () => {
        try {
            const respuesta = await axios.get(`${API_BASE_URL}/clients`);
            return respuesta.data;
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            throw error;
        }
    }
};
```

### Component Conventions

#### Functional Components
- **Always use functional components** with hooks
- Use **TypeScript for all new components**

```typescript
// Preferred - TypeScript functional component
import React, { useState, useEffect } from 'react';

type RoutineTemplate = {
    id: number;
    name: string;
    status: 'Draft' | 'Active' | 'Archived';
};

const RoutineTemplates: React.FC = () => {
    const [routineTemplates, setRoutineTemplates] = useState<RoutineTemplate[]>([]);
    // Component logic
};
```

#### Component Props
- **Define TypeScript interfaces** for component props when using TypeScript
- Use **destructuring** for props
- Include **default values** where appropriate

```typescript
type ClientCardProps = {
    client: Client;
    index: number;
    onClick: (client: Client) => void;
};

const ClientCard: React.FC<ClientCardProps> = ({ client, index, onClick }) => {
    // Component implementation
};
```

### State Management

#### Local State with Hooks
- Use **useState** for component-level state
- Use **useEffect** for side effects and data fetching
- **Extract custom hooks** for reusable stateful logic

```javascript
const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Borrador'
});

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
};
```

#### Loading and Error States
- **Always handle loading states** for async operations
- **Implement error handling** with user-friendly messages
- **Use MUI `Alert`/`Snackbar`** components for feedback

```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');

// In async function
try {
    setLoading(true);
    const data = await apiCall();
    setSuccess('Operation completed successfully');
} catch (error) {
    setError('Error message: ' + error.message);
} finally {
    setLoading(false);
}
```

### Service Layer Architecture

#### API Services
- **Centralize API calls** in service files
- Use **axios** for HTTP requests
- **Export service objects** with grouped methods
- **Handle errors at service level** when appropriate

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const routineTemplateService = {
    getAllRoutineTemplates: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/routine-templates`);
            return response.data;
        } catch (error) {
            console.error('Error fetching routine templates:', error);
            throw error;
        }
    },
    
    updateRoutineTemplate: async (id, routineTemplateData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/routine-templates/${id}`, routineTemplateData);
            return response.data;
        } catch (error) {
            console.error('Error updating routine template:', error);
            throw error;
        }
    }
};
```

## UI/UX Standards

### MUI Integration
- Use **MUI components** (`@mui/material`) for all UI, including `DataGrid` from `@mui/x-data-grid` for tabular data (client lists, payment history, exercise catalog)
- **Wrap the app** with MUI's `ThemeProvider` in the main entry point
- Follow **MUI's responsive layout system** (`Box`, `Grid`, `Stack`, `Container`)

```javascript
import { Container, Grid, Card, Button, TextField, Alert } from '@mui/material';
```

### Form Handling
- Use **controlled components** for form inputs
- Implement **real-time validation** where appropriate
- **Disable submit buttons** during form submission
- **Clear form state** after successful submission

```javascript
<form onSubmit={handleSubmit}>
    <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required
        fullWidth
        margin="normal"
    />
    <Button type="submit" variant="contained" disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
    </Button>
</form>
```

### Navigation Patterns
- Use **React Router** for all navigation
- **Implement breadcrumbs** with back navigation
- Use **programmatic navigation** with useNavigate hook

```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigation examples
<Button variant="text" onClick={() => navigate('/')}>
    ← Back to Dashboard
</Button>
```

### Accessibility
- Include **aria-label** attributes for interactive elements
- Use **semantic HTML** elements
- Ensure **keyboard navigation** support
- Provide **alternative text** for images

```javascript
<TextField
    placeholder="Search by name"
    aria-label="Search clients by name"
/>
```

## Testing Standards

### End-to-End Testing with Playwright
- **Test user workflows** rather than implementation details
- Use **data-testid** attributes for reliable element selection
- **Organize tests by feature** (`clients.spec.ts`, `routine-templates.spec.ts`)
- **Include API testing** alongside UI testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Routine templates API - Update', () => {
    test('should update a routine template successfully', async ({ request }) => {
        const updateData = { name: 'Updated Template', status: 'Active' };

        const response = await request.put(`${API_URL}/routine-templates/${testTemplateId}`, {
            data: updateData
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.name).toBe(updateData.name);
    });
});
```

### Test Organization
- **Group related tests** with describe blocks
- **Use descriptive test names** that explain the expected behavior
- **Test both success and error scenarios**
- **Include edge cases** and validation testing

## Configuration Standards

### TypeScript Configuration
- Enable **strict mode** for type checking
- Use **path mapping** with "@/*" for cleaner imports
- Include **Vite and Node types**

```json
{
    "compilerOptions": {
        "strict": true,
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"]
        },
        "types": ["vite/client", "node"]
    }
}
```

### ESLint Configuration
- Extend **React + TypeScript** recommended configuration
- **Automatic code formatting** and error detection
- **Consistent code style** across the project

### Environment Configuration
- Use **Vite environment variables** (`VITE_*` prefix) for API URLs
- **Separate configurations** for development and production
- **Configure Playwright** with environment-specific settings

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
    use: {
        baseURL: 'http://localhost:5173'
    }
});
```

## Performance Best Practices

### Component Optimization
- **Lazy load** components when appropriate
- **Memoize expensive calculations** with useMemo
- **Avoid unnecessary re-renders** with useCallback
- **Extract reusable logic** into custom hooks

### Bundle Optimization
- **Tree shaking** enabled through Vite
- **Code splitting** at route level
- **Optimize images** and static assets
- **Monitor bundle size** with build tools

### API Efficiency
- **Implement proper error handling** for network requests
- **Cache API responses** where appropriate
- **Use loading states** to improve perceived performance
- **Batch API calls** when possible

## Development Workflow

- **Feature Branches**: Develop features in separate branches, adding descriptive suffix "-frontend" to allow working in parallel and avoid conflicts or collisions
- **Descriptive Commits**: Write descriptive commit messages in English
- **Code Review**: Code review before merging
- **Small Branches**: Keep branches small and focused

### Development Scripts
```bash
npm run dev          # Development server (Vite)
npm test             # Run unit tests (Vitest)
npm run build        # Production build
npm run test:e2e     # Run Playwright tests headlessly
npm run test:e2e:ui  # Open Playwright UI test runner
```

### Code Quality
- **ESLint validation** before commits
- **TypeScript compilation** without errors
- **All tests passing** before deployment
- **Performance monitoring** with Web Vitals

## Internationalization (i18n)

The UI is bilingual (Spanish and English) using `react-i18next` (see US-010).

- **Setup**: `src/i18n/index.ts` configures i18next; `src/i18n/locales/es.json`
  and `en.json` hold the translations. It is imported once in `main.tsx`.
- **Default language**: detection order is stored preference (localStorage) →
  browser language → Spanish fallback. Only `es` and `en` are supported.
- **Usage in components**: use the `useTranslation()` hook and render text via
  `t('namespace.key')`; never hardcode user-facing strings.
- **Key naming**: keys are grouped by feature and written in **English**
  (e.g. `auth.login.title`, `clients.form.dni`, `common.save`). Per
  `docs/base-standards.md`, all code — including translation KEYS, identifiers,
  and comments — stays in English; only the string VALUES are translated.
- **Backend errors**: backend error `code`s are language-agnostic (English,
  e.g. `DUPLICATE_DNI`). The frontend maps each code to a translation key
  (see `src/i18n/localizeApiError.ts` and the `errors.*` namespace) so messages
  localize without any backend change. Unknown codes fall back to a generic
  message.
- **Language switcher**: `components/LanguageSwitcher.tsx`, shown on the
  authenticated screens (dashboard header). Pre-login screens follow the
  detected/stored language without exposing a switcher.
- **Testing**: unit tests assert on the Spanish (default) copy (`setupTests.ts`
  forces `es`). E2E runs with the browser locale set to `es-AR`
  (`playwright.config.ts`) so the app is deterministically in Spanish; add new
  strings to **both** locale files to keep them in sync.

This document serves as the foundation for maintaining code quality and consistency across this gym management frontend application. All team members should follow these practices to ensure a maintainable and scalable codebase.
