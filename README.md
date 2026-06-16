# Jisr.App - AAC Communication Platform

A web platform designed to help children with autism communicate through visual images, symbols, and text-to-speech technology.

## Prerequisites

- **Node.js** (version 16 or higher recommended)
- **npm** (comes with Node.js) or **yarn**

## Installation & Setup

### 1. Install Dependencies

First, navigate to the project directory and install all required packages:

```bash
npm install
```

or if you're using yarn:

```bash
yarn install
```

### 2. Run Development Server

Start the development server with hot-reload:

```bash
npm run dev
```

or

```bash
yarn dev
```

The application will be available at:

- **Local:** http://localhost:5173
- The terminal will show the exact URL

### 3. Build for Production

To create a production build:

```bash
npm run build
```

or

```bash
yarn build
```

The built files will be in the `dist` folder.

### 4. Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

or

```bash
yarn preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
Jisr/
├── src/
│   ├── pages/          # All page components
│   │   ├── admin/      # Admin dashboard pages
│   │   └── child/      # Child dashboard pages
│   ├── components/     # Reusable components
│   ├── layouts/        # Layout components
│   ├── services/       # API services
│   └── hooks/          # Custom React hooks
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Key Pages

- **Landing Page:** `/`
- **Sign In:** `/signin`
- **Sign Up:** `/signup`
- **Parent Dashboard:** `/dashboard`
- **Child AAC Board:** `/child/aac`
- **Admin Dashboard:** `/admin/dashboard`
- **Blog:** `/blog`
- **Pricing:** `/pricing`

## Technologies Used

- React 18.2.0
- TypeScript 5.2.2
- Vite 5.0.0
- Tailwind CSS 3.3.5
- Framer Motion 10.16.4
- React Router DOM 6.20.0

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. You can also specify a port:

```bash
npm run dev -- --port 3000
```

### Dependencies Issues

If you encounter dependency issues, try:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

Make sure all TypeScript errors are resolved before building:

```bash
npm run lint
```

## Development Notes

- The project uses **Vite** for fast development and building
- **Hot Module Replacement (HMR)** is enabled for instant updates
- All styling is done with **Tailwind CSS**
- The project is fully typed with **TypeScript**

## Support

For questions or issues, please contact the development team.





