# Namkhong POS System

## Project Overview
A Point of Sale (POS) system built with Next.js, TypeScript, and Tailwind CSS.

## Technology Stack
- Next.js 15.5.2
- React 19.1.0
- TypeScript 5
- Tailwind CSS 4
- ESLint
- Prisma 6.15.0 (ORM)
- PostgreSQL (Database)

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma db push` - Push schema changes to database
- `npx prisma generate` - Generate Prisma client
- `npx prisma studio` - Open Prisma Studio (database GUI)

## Project Structure
```
namkhong-pos/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── prisma/
│   └── schema.prisma
├── public/
├── .env
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

## Database Configuration
- Database: `namkhongPOS_db`
- Connection: `postgresql://postgres:password@localhost:5432/namkhongPOS_db`
- Schema file: `prisma/schema.prisma`

## Notes for Claude
- This is a POS system project
- Use existing dependencies when possible
- Follow Next.js 15 App Router conventions
- Use TypeScript for all new files
- Follow Tailwind CSS for styling