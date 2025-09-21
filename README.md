# Swift Message Validator

A React application for validating SWIFT MT messages with intelligent suggestions.

## Features

- Validate SWIFT MT messages (MT 700, 701, 707, 710, 720, 730, 732, 740, 742, 747, 750, 752, 760, 767, 768, 769, 799)
- Real-time validation with detailed error reporting
- Sample message templates for testing
- Responsive design with modern UI components
- Built with React, TypeScript, and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:9003` (or the port shown in terminal)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Usage

1. Paste a SWIFT MT message into the text area
2. Click "Validate Message" to check for errors
3. Review validation results and suggestions
4. Use the "Load a sample message" dropdown to test with predefined templates

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icons
