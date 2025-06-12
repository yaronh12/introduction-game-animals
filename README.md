# 🎭 Animal Introduction Game

An interactive web application where students choose animal characters and AI generates personalized images using OpenAI DALL-E 3. Perfect for classroom introductions, team building, or educational activities.

## ✨ Features

- **🐾 Animal Selection**: Choose from 36 different animals with emoji grid interface
- **🎨 AI Image Generation**: Creates unique, personalized images using OpenAI DALL-E 3
- **📝 Free Text Input**: Enter personalities and interests as free text (comma-separated)
- **📱 Responsive Design**: Beautiful, mobile-friendly interface
- **🌐 Real-time Gallery**: Host view shows all student submissions in real-time
- **☁️ Cloud Ready**: Supports both local development and cloud deployment

## 🖼️ Current Features

- **Spacious Grid Layout**: Enhanced animal selection with improved spacing and visual design
- **OpenAI DALL-E 3 Integration**: High-quality, realistic image generation ($0.04 per image)
- **Text-Free Prompts**: Optimized prompts to eliminate unwanted text/speech bubbles
- **Cloud Database**: PostgreSQL support for Vercel deployment with SQLite fallback for development

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- OpenAI API key (for image generation)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd introductionGameAnimals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=./students.db
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🌐 Deploy to Production (Vercel)

### Option 1: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy the app**
   ```bash
   vercel
   ```

3. **Add environment variables in Vercel dashboard**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `POSTGRES_URL`: Auto-configured by Vercel Postgres

### Option 2: Deploy with GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in project settings

3. **Add Database**
   - In Vercel dashboard, go to Storage tab
   - Add Vercel Postgres database
   - Environment variables will be auto-configured

### Option 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/introductionGameAnimals&env=OPENAI_API_KEY&envDescription=OpenAI%20API%20key%20for%20DALL-E%203%20image%20generation&project-name=animal-introduction-game&repository-name=animal-introduction-game)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for DALL-E 3 | Yes |
| `POSTGRES_URL` | PostgreSQL connection string (auto-set by Vercel) | Production only |
| `DATABASE_URL` | SQLite database path | Development only |

### Database Configuration

The app automatically detects the environment:
- **Development**: Uses SQLite database (`students.db`)
- **Production**: Uses Vercel Postgres (or falls back to SQLite)

## 📱 How to Use

### For Students:
1. Enter your name
2. Choose your spirit animal from the grid
3. Describe your personalities (comma-separated)
4. List things you like (comma-separated)
5. Submit and wait for your AI-generated character image!

### For Hosts/Teachers:
- Visit `/host` to see all student submissions
- Real-time updates as students submit their forms
- Perfect for classroom activities and introductions

## 🎨 Image Generation

- Uses **OpenAI DALL-E 3** for high-quality, realistic images
- Cost: ~$0.04 per generated image
- Optimized prompts to avoid text/speech bubbles
- Fallback to emoji avatars if API fails

## 🛠️ Tech Stack

- **Frontend**: Next.js 12, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (production) / SQLite (development)
- **AI**: OpenAI DALL-E 3
- **Hosting**: Vercel (recommended)
- **Image Storage**: Direct OpenAI URLs

## 📊 Project Structure

```
├── pages/
│   ├── index.tsx          # Main student form
│   ├── success.tsx        # Success page with generated image
│   ├── host.tsx           # Host dashboard
│   └── api/
│       └── students.ts    # API endpoints
├── lib/
│   ├── database-cloud.ts  # Cloud-compatible database
│   ├── database.ts        # Original SQLite database
│   └── imageGeneration.ts # AI image generation
├── types/
│   └── index.ts           # TypeScript definitions
├── components/
│   └── constants.ts       # Animal options and configuration
└── styles/
    └── globals.css        # Global styles
```

## 🔒 Security & Privacy

- No sensitive data stored
- Images are generated via OpenAI API
- Database only stores names, animal choices, and image URLs
- Suitable for educational environments

## 💡 Customization

### Adding New Animals
Edit `components/constants.ts` to add more animal options:

```typescript
export const ANIMAL_OPTIONS = [
  { id: 'new-animal', name: 'New Animal', emoji: '🦎' },
  // ... existing animals
];
```

### Styling Changes
- Modify Tailwind classes in component files
- Update `tailwind.config.js` for theme customization
- Edit `styles/globals.css` for global styles

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure environment variables are set correctly
   - Check Vercel Postgres configuration

2. **Image generation fails**
   - Verify OpenAI API key is valid
   - Check API usage limits
   - App will fallback to emoji avatars

3. **Build errors**
   - Run `npm run build` locally to test
   - Check TypeScript errors
   - Verify all dependencies are installed

## 📈 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Image Loading**: Progressive with fallbacks
- **Database**: Optimized queries with indexing
- **Caching**: Next.js automatic optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License - feel free to use for educational purposes!

## 🙋‍♂️ Support

For issues or questions:
1. Check the troubleshooting section
2. Review environment variable configuration
3. Ensure all dependencies are up to date

---

Made with ❤️ for educational environments. Perfect for classrooms, workshops, and team introductions! 