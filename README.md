# MisInfo Combat Pro

AI-powered misinformation detection and education platform built for the hack2skill Google Gen AI Exchange Hackathon.

## 🚀 Features

### 1. Smart Misinformation Analyzer
- Upload text, images, or videos for instant AI-powered analysis
- Detect emotional manipulation, false statistics, and visual artifacts
- Get detailed educational explanations of manipulation techniques
- Risk scoring with confidence levels

### 2. Interactive Manipulation Trainer
- Gamified training modules for building media literacy skills
- Progressive difficulty levels (Beginner, Intermediate, Advanced)
- AI-generated realistic scenarios for practice
- Achievement system and progress tracking

### 3. Real-Time Claim Verification
- Extract factual claims from any content automatically
- Verify against trusted Indian sources (PIB, RBI, Election Commission)
- Educational context about verification methodology
- Source credibility assessment

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library

### Backend & Services
- **Firebase Authentication** - Secure user management
- **Firestore** - NoSQL database for user data
- **Google Cloud Platform** - AI services and hosting
- **Vertex AI Gemini Pro** - Content analysis and generation
- **Vision AI** - Image manipulation detection
- **Video Intelligence** - Video analysis
- **Fact Check Tools API** - Claim verification

### Deployment
- **Vercel** - Frontend deployment
- **Google Cloud Run** - Containerized backend
- **Docker** - Containerization
- **Google App Engine** - Alternative deployment option

## 🏗 Architecture

```
User Input → 
Orchestration Agent → 
[Classifier + Evidence + Explanation Agents] → 
Educational Response with Agent Reasoning
```

### Multi-Agent System
- **Orchestration Agent** - Coordinates workflow
- **Classifier Agent** - Determines misinformation types
- **Evidence Agent** - Searches for supporting/contradicting evidence
- **Explanation Agent** - Generates educational content
- **Training Agent** - Adapts learning content
- **Verification Agent** - Handles claim extraction and fact-checking

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Firebase project
- Google Cloud Platform account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/misinfo-combat-pro.git
   cd misinfo-combat-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Firebase and GCP credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   npm run deploy:vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all Firebase configuration variables

### Deploy to Google Cloud Platform

1. **Install Google Cloud SDK**
   ```bash
   # Follow instructions at: https://cloud.google.com/sdk/docs/install
   ```

2. **Build and deploy**
   ```bash
   npm run build
   npm run deploy:gcp
   ```

### Deploy with Docker

1. **Build the image**
   ```bash
   docker build -t misinfo-combat-pro .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 misinfo-combat-pro
   ```

### Deploy to Google Cloud Run

1. **Build and push to Container Registry**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/misinfo-combat-pro
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy misinfo-combat-pro \
     --image gcr.io/YOUR_PROJECT_ID/misinfo-combat-pro \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database
4. Add your domain to authorized domains
5. Copy configuration to `.env.local`

### Google Cloud Setup

1. Enable required APIs:
   - Vertex AI API
   - Vision AI API
   - Video Intelligence API
   - Fact Check Tools API

2. Create service account and download credentials
3. Set up authentication for your deployment environment

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── analyzer/          # Content analysis feature
│   ├── training/          # Interactive training feature
│   ├── verifier/          # Claim verification feature
│   ├── dashboard/         # User dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   └── constants.ts       # App constants
└── components/            # Reusable components (future)
```

## 🔒 Security Features

- **Input Validation** - All user inputs are validated and sanitized
- **Authentication** - Secure Firebase Authentication
- **CORS Protection** - Proper cross-origin resource sharing
- **CSP Headers** - Content Security Policy implementation
- **Rate Limiting** - API protection against abuse
- **XSS Protection** - Cross-site scripting prevention
- **HTTPS Enforcement** - Secure connections only

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Health check
curl http://localhost:3000/api/health
```

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Core Web Vitals**: Optimized for LCP, FID, CLS
- **Bundle Size**: Optimized with code splitting
- **Caching**: Proper cache headers and strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

This project is submitted for the **hack2skill Google Gen AI Exchange Hackathon**.

### Key Highlights:
- ✅ **Multi-Agent Architecture** - Cutting-edge AI agent orchestration
- ✅ **Google Cloud Integration** - Heavy use of GCP services
- ✅ **Production Ready** - Fully deployable with security best practices
- ✅ **Educational Focus** - Building long-term immunity to misinformation
- ✅ **Indian Context** - Tailored for Indian users and sources

## 📞 Support

For support, email support@misinfocombatpro.com or create an issue in this repository.

## 🙏 Acknowledgments

- Google Cloud Platform for AI services
- Firebase for backend infrastructure
- The open-source community for amazing tools and libraries
- hack2skill for organizing this hackathon

---

**Built with ❤️ for a misinformation-free India**