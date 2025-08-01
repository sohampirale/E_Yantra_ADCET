# Interactive Robotics Club Sessions Platform

A comprehensive Next.js 13 full-stack application for managing interactive robotics club sessions, built with MongoDB Atlas, NextAuth.js, and modern React components.

## 🚀 Features

- **User Authentication**: Email/password and Google OAuth integration
- **Role-Based Access**: Mentor and Student roles with different permissions
- **Session Management**: Create, join, and manage robotics sessions
- **Points System**: Award points to students and track engagement
- **Global Leaderboard**: Rankings based on total points across all sessions
- **Real-time Feedback**: Anonymous feedback system for sessions
- **Responsive Design**: Beautiful UI with Tailwind CSS and shadcn/ui

## 🛠 Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript
- **Authentication**: NextAuth.js with MongoDB adapter
- **Database**: MongoDB Atlas with Mongoose ODM
- **Styling**: Tailwind CSS, shadcn/ui components
- **Deployment**: Vercel (ready for deployment)

## 📦 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd robotics-club-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roboticsclub?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

4. **Set up MongoDB Atlas**
- Create a MongoDB Atlas account at https://www.mongodb.com/atlas
- Create a new cluster
- Add your IP address to the whitelist
- Create a database user
- Get your connection string and add it to MONGODB_URI

5. **Configure Google OAuth (Optional)**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
- Copy Client ID and Client Secret to your `.env.local`

## 🚀 Running the Application

1. **Development server**
```bash
npm run dev
```

2. **Open your browser**
Navigate to `http://localhost:3000`

## 📱 Usage

### For Students:
1. **Sign up** with email/password or Google OAuth
2. **Browse available sessions** on the dashboard
3. **Join sessions** that interest you
4. **Participate actively** to earn points from mentors
5. **Check the leaderboard** to see your ranking
6. **Provide feedback** on sessions you've joined

### For Mentors:
1. **Sign up** and select "Mentor" role
2. **Create new sessions** with title, description, and date
3. **Manage your sessions** from the dashboard
4. **Award points** to participating students
5. **View session analytics** and participant engagement
6. **Review anonymous feedback** from students

## 🏗 Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth configuration
│   │   ├── sessions/       # Session CRUD operations
│   │   ├── participations/ # Points awarding system
│   │   ├── leaderboard/    # Global rankings
│   │   └── feedback/       # Feedback system
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Main dashboard
│   ├── sessions/           # Session detail pages
│   └── leaderboard/        # Global leaderboard
├── components/             # Reusable UI components
├── lib/                    # Utilities and database models
└── types/                  # TypeScript type definitions
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Sessions
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create new session (mentors only)
- `GET /api/sessions/[id]` - Get session details
- `DELETE /api/sessions/[id]` - Delete session (creator only)
- `POST /api/sessions/[id]/join` - Join session (students)

### Points & Leaderboard
- `POST /api/participations/award` - Award points (mentors only)
- `GET /api/leaderboard` - Get global leaderboard

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/[sessionId]` - Get session feedback

## 🚀 Deployment to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set environment variables in Vercel**
- Go to your Vercel dashboard
- Select your project
- Go to Settings > Environment Variables
- Add all the environment variables from `.env.local`

4. **Update NEXTAUTH_URL**
Update your production environment variable:
```env
NEXTAUTH_URL=https://your-app-name.vercel.app
```

## 🧪 Testing

### Manual Testing Checklist:

**Authentication:**
- [ ] Sign up with email/password
- [ ] Sign in with existing credentials  
- [ ] Google OAuth login (if configured)
- [ ] Role selection during signup

**Session Management:**
- [ ] Create session (mentor)
- [ ] View session details
- [ ] Join session (student)
- [ ] Delete session (mentor)

**Points System:**
- [ ] Award points to students
- [ ] View updated leaderboard
- [ ] Check point calculations

**Feedback System:**
- [ ] Submit anonymous feedback
- [ ] Submit feedback with name
- [ ] View feedback (mentors)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your environment variables are set correctly
3. Ensure MongoDB Atlas connection is working
4. Review the API endpoints in the browser's network tab

For additional help, please open an issue in the repository.

## 🎯 Next Steps

Future enhancements could include:
- Real-time notifications
- Session materials upload
- Advanced analytics dashboard
- Mobile app version
- Integration with external learning platforms
- Automated session scheduling
- Student progress tracking
- Mentor evaluation system

---

Built with ❤️ for the Robotics Club community