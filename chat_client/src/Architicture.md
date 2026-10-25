# Architicture projects

src/
├── app/ # Routers (expo-router)
│ ├── \_layout.tsx
│ ├── (auth)/
│ │ ├── \_layout.tsx
│ │ ├── login.tsx
│ │ └── register.tsx
│ └── (main)/
│ ├── \_layout.tsx
│
├── features/ # Domains
│ ├── auth/
│ │ ├── components/ # Components also for (auth)
│ │ │ └── LoginForm/
│ │ │ ├── LoginForm.tsx
│ │ │ ├── LoginForm.styles.ts
│ │ │ ├── useLoginForm.ts # Hooks also for LoginForm
│ │ │ ├── LoginForm.utils.ts # Local utils
│ │ │ └── index.ts
│ │ ├── hooks/ # Hooks uses in 2+ plaes inside (auth)
│ │ ├── api/ # Requires for backend (auth)
│ │ ├── types.ts
│ │ └── index.ts
│
├── ui/ # 🎨 Custom component library
│ ├── tokens/
│ │ ├── colors.ts
│ │ ├── spacing.ts
│ │ ├── typography.ts
│ │ ├── radii.ts
│ │ └── index.ts
│ ├── primitives/ # Indivisible atoms
│ │ ├── Text/
│ │ ├── Button/
│ │ ├── Input/
│ │ ├── Avatar/
│ │ ├── Badge/
│ │ ├── IconButton/
│ │ ├── Spinner/
│ │ └── index.ts
│ ├── layouts/ # Layout-components
│ │ ├── Screen/
│ │ ├── Header/
│ │ └── KeyboardAvoidingScreen/
│ └── index.ts
│
├── lib/ # General infrastructure modules
│ ├── supabase.ts # (or firebase.ts)
│ ├── storage.ts # MMKV / AsyncStorage wrapper
│ ├── date.ts # Date formatting (2+ consumer)
│ └── logger.ts
│
├── hooks/ # ONLY truly shared hooks (used by 2+ features)
│ ├── useDebounce.ts
│ └── useKeyboard.ts
│
├── config/
│ ├── env.ts
│ └── constants.ts
│
└── types/
└── global.d.ts
