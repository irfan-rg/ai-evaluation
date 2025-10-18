# Caliber - AI Agent Evaluation Platform

## Overview
Caliber is a precision AI evaluation and monitoring platform designed for teams who need to track, analyze, and optimize their AI model performance in real-time. Built with enterprise-grade security and scalability, Caliber provides comprehensive analytics and configurable evaluation policies to ensure your AI systems deliver consistent, high-quality results.

## Live Demo
**Try it now:** [https://caliber-ai.vercel.app/](https://caliber-ai.vercel.app/)

**Test Credentials:**
- Email: `test@example.com`
- Password: `Test123!`

## Features
- **Multi-tenant authentication** with Supabase for secure data isolation
- **Configurable evaluation policies** with sampling rates and PII protection
- **REST API for evaluation ingestion** - easy integration with existing systems
- **Interactive dashboard** with 7/30-day trend analysis and real-time metrics
- **Drill-down evaluation views** with intelligent PII masking
- **High-performance optimization** - tested with 20,000+ evaluations
- **Lightning-fast navigation** with intelligent caching and instant skeleton loading
- **Responsive design** with glassmorphism UI and smooth animations

## Tech Stack
- **Framework:** Next.js 15.5.5 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with Row Level Security
- **Styling:** Tailwind CSS with custom design system
- **Charts:** Recharts for interactive data visualization
- **Animations:** Framer Motion for smooth transitions
- **Caching:** Custom memory cache with TTL support
- **Icons:** Heroicons for consistent iconography
- **Fonts:** Outfit and Geist Mono

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page with glassmorphism navbar
│   ├── layout.tsx         # Root layout with fonts and providers
│   ├── dashboard/         # Main analytics dashboard
│   ├── evaluations/       # Evaluation list and detail views
│   ├── config/            # User configuration settings
│   ├── login/             # Authentication pages
│   ├── signup/
│   └── api/               # REST API endpoints
│       ├── evals/         # Evaluation CRUD operations
│       │   ├── route.ts   # List evaluations
│       │   ├── ingest/    # Ingest new evaluations
│       │   └── stats/     # Dashboard statistics
│       └── config/        # User configuration API
├── components/            # Reusable UI components
│   ├── Dashboard/         # Dashboard-specific components
│   │   ├── StatsCards.tsx # Metric cards with animations
│   │   ├── TrendChart.tsx # Interactive chart with Recharts
│   │   └── RecentEvals.tsx# Latest evaluations table
│   ├── Evaluations/       # Evaluation-related components
│   │   ├── EvalList.tsx   # Paginated evaluation list
│   │   └── EvalDetailModal.tsx # Detailed view modal
│   ├── Skeletons/         # Loading state components
│   │   ├── ChartSkeleton.tsx
│   │   ├── StatCardSkeleton.tsx
│   │   └── TableSkeleton.tsx
│   ├── ui/                # Base UI components
│   │   ├── ToastProvider.tsx
│   │   └── EvaluationModal.tsx
│   ├── Navbar.tsx         # Glassmorphism navigation
│   ├── AuthProvider.tsx   # Authentication context
│   └── MainWrapper.tsx    # Layout wrapper
├── lib/                   # Utility libraries
│   ├── supabase/          # Database client and types
│   │   ├── client.ts      # Client-side Supabase
│   │   ├── server.ts      # Server-side Supabase
│   │   └── types.ts       # TypeScript database types
│   ├── cache.ts           # Memory caching system
│   ├── utils.ts           # General utilities
│   └── design-system.ts   # Design tokens and helpers
├── types/                 # TypeScript type definitions
│   └── global.d.ts        # Global type declarations
└── scripts/               # Database and utility scripts
    ├── seed.js            # Sample data seeding
    └── optimize-database.sql # Performance optimizations
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation
```bash
# Clone repository
git clone https://github.com/irfan-rg/caliber.git

cd caliber

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Database Setup

1. Create a new project on Supabase
2. Run this SQL in the SQL Editor:
```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create user_configs table
CREATE TABLE user_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_policy TEXT NOT NULL DEFAULT 'always' CHECK (run_policy IN ('always', 'sampled')),
  sample_rate_pct INTEGER NOT NULL DEFAULT 10 CHECK (sample_rate_pct >= 0 AND sample_rate_pct <= 100),
  obfuscate_pii BOOLEAN NOT NULL DEFAULT false,
  max_eval_per_day INTEGER NOT NULL DEFAULT 100 CHECK (max_eval_per_day > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create evaluations table
CREATE TABLE evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_id TEXT NOT NULL,
  prompt TEXT,
  response TEXT,
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  latency_ms INTEGER NOT NULL CHECK (latency_ms >= 0),
  flags JSONB DEFAULT '{}',
  pii_tokens_redacted INTEGER DEFAULT 0 CHECK (pii_tokens_redacted >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at DESC);
CREATE INDEX idx_evaluations_user_created ON evaluations(user_id, created_at DESC);

-- Enable RLS on tables
ALTER TABLE user_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_configs
CREATE POLICY "Users can view own config" ON user_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" ON user_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON user_configs
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for evaluations
CREATE POLICY "Users can view own evaluations" ON evaluations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluations" ON evaluations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

3. Seed with sample data:
```bash
node scripts/seed.js
```

This creates a test user (test@example.com / Test123!) with ~750 evaluations.

### Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Database Schema

### Tables

**user_configs**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| run_policy | TEXT | 'always' or 'sampled' |
| sample_rate_pct | INTEGER | 0-100 sampling percentage |
| obfuscate_pii | BOOLEAN | Enable PII masking |
| max_eval_per_day | INTEGER | Daily evaluation limit |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

**evaluations**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| interaction_id | TEXT | Unique interaction identifier |
| prompt | TEXT | Input prompt text |
| response | TEXT | AI model response |
| score | NUMERIC(5,2) | Quality score (0-100) |
| latency_ms | INTEGER | Response time in milliseconds |
| flags | JSONB | Error/warning flags object |
| pii_tokens_redacted | INTEGER | Count of redacted PII tokens |
| created_at | TIMESTAMP | Evaluation timestamp |

### Performance Indexes
- **Primary indexes** on all UUID columns for fast lookups
- **Composite index** on (user_id, created_at DESC) for dashboard queries
- **Single indexes** on user_id and created_at for filtering and sorting

### Row Level Security (RLS)

All tables enforce RLS with policies ensuring complete data isolation:
- Users can only SELECT their own data (WHERE user_id = auth.uid())
- Users can only INSERT records with their own user_id
- Users can only UPDATE their own records
- No DELETE policies (data retention for analytics)

## API Endpoints

### Authentication
Handled by Supabase Auth with secure JWT tokens.

### Evaluations

**POST /api/evals/ingest**
Ingest new evaluation data.

Request body:
```json
{
  "interaction_id": "eval-123",
  "prompt": "What is machine learning?",
  "response": "Machine learning is...",
  "score": 85.5,
  "latency_ms": 1200,
  "flags": {"warning": "slow"},
  "pii_tokens_redacted": 2
}
```

**GET /api/evals**
List evaluations with pagination.

Query params:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Filter by interaction_id (optional)

**GET /api/evals/stats**
Get dashboard statistics and trends.

Query params:
- `days`: Time range - 7 or 30 (default: 7)

Returns comprehensive metrics including daily trends, score distributions, and performance averages.

### Configuration

**GET /api/config**
Get user's evaluation configuration.

**POST /api/config**
Update evaluation configuration.

Request body:
```json
{
  "run_policy": "sampled",
  "sample_rate_pct": 50,
  "obfuscate_pii": true,
  "max_eval_per_day": 5000
}
```

## Design System

- **Typography:** Outfit (headings) and Geist Mono (code)
- **Color Palette:** Apple-inspired with iOS blue (#007AFF) as primary
- **UI Style:** Glassmorphism with backdrop blur and subtle shadows
- **Animations:** Framer Motion with spring physics and Apple-like easing
- **Loading States:** Skeleton screens with intelligent fast/slow modes
- **Icons:** Heroicons v2 for consistency and accessibility

## Performance Optimizations

- **Intelligent Caching:** Custom memory cache with TTL (15s stats, 10s evals, 12s config)
- **Smart Loading States:** Instant skeleton hiding when cached data is available
- **Database Optimization:** Composite indexes and efficient query patterns
- **Pagination Strategy:** 20 items per page with smooth navigation
- **Lazy Chart Rendering:** Charts load only when visible in viewport
- **Optimistic Updates:** Configuration changes appear instantly with fallback

**Performance Benchmarks:**
- Dashboard loads in <500ms with cached data
- Supports 20,000+ evaluations with sub-2s load times
- Navigation feels "blink of an eye" fast after initial load

## Testing

### Test Credentials
- **Email:** test@example.com
- **Password:** Test123!

### Manual Testing Checklist
- [ ] Sign up new user account
- [ ] Login/logout flow
- [ ] Update configuration settings
- [ ] View dashboard (7 and 30 day analysis)
- [ ] Navigate to evaluations list with pagination
- [ ] Click evaluation to view detailed modal
- [ ] Verify PII masking functionality
- [ ] Test with second user account for data isolation
- [ ] Verify caching behavior with rapid navigation


## Security Features

- **Row Level Security (RLS)** enforced on all database tables
- **JWT-based authentication** with automatic token refresh
- **PII masking** configurable per user for sensitive data protection
- **Input validation** on all API endpoints with TypeScript schemas
- **CORS protection** and secure headers configuration
- **Environment variable protection** for sensitive configuration

## Key Differentiators

- **Precision Analytics:** Apple-inspired design with attention to detail
- **Lightning Performance:** Sub-second navigation with intelligent caching
- **Enterprise Ready:** Tested with 20K+ evaluations, production-grade RLS
- **Developer Experience:** Full TypeScript, comprehensive API, easy integration
- **User Experience:** Smooth animations, smart loading states, responsive design


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License- Not Registerd(Coming Soon)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Precision AI evaluation for teams who care about quality.*
