# Duothan 5.0 - Deployment Guide

## Prerequisites

1. **MongoDB Atlas Account**: Set up a free MongoDB Atlas cluster at [cloud.mongodb.com](https://cloud.mongodb.com/)
2. **Vercel Account**: Create a free account at [vercel.com](https://vercel.com/)
3. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket

## MongoDB Setup

1. **Create a MongoDB Atlas Cluster**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new project and cluster (free tier is sufficient)
   - Create a database user with read/write permissions
   - Whitelist your IP address (or use 0.0.0.0/0 for all IPs)

2. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com/) and sign in
   - Click "New Project"
   - Import your Git repository
   - Vercel will auto-detect it's a Next.js project

2. **Configure Environment Variables**:
   - In the deployment settings, add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: `production`

3. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   # Enter your MongoDB connection string when prompted
   
   vercel env add NODE_ENV
   # Enter: production
   ```

5. **Redeploy with Environment Variables**:
   ```bash
   vercel --prod
   ```

## Environment Variables

Add these environment variables in your Vercel project settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `NODE_ENV` | `production` | Node environment |

## Vercel Configuration

The project includes a `vercel.json` file with optimized settings:
- Function timeout set to 10 seconds for database operations
- Environment variable mapping

## Testing the Deployment

1. **Test Registration**:
   - Go to your deployed URL
   - Complete the registration flow
   - Check if data is saved to MongoDB

2. **Test Admin Panel**:
   - Go to `your-domain.vercel.app/admin`
   - Verify that registered teams are displayed

3. **Check MongoDB**:
   - In MongoDB Atlas, browse your collections
   - Verify that the "teams" collection contains your data

## Common Issues

1. **MongoDB Connection Error**:
   - Check your connection string format
   - Ensure your IP is whitelisted
   - Verify database user permissions

2. **Build Errors**:
   - Run `npm run build` locally first
   - Check for TypeScript errors
   - Ensure all dependencies are in package.json

3. **Function Timeout**:
   - The vercel.json sets a 10-second timeout
   - For complex operations, consider optimizing queries

## Local Development

1. **Clone and Install**:
   ```bash
   git clone <your-repo>
   cd duothan-onboarding
   npm install
   ```

2. **Environment Variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MongoDB URI
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/register-team`: Register a new team
- `GET /api/register-team`: Get all registered teams (for admin)

## Database Schema

The application creates a "duothan" database with a "teams" collection:

```javascript
{
  _id: ObjectId,
  teamData: {
    teamName: String,
    teamEmail: String,
    contactNumber: String,
    university: String,
    members: [
      {
        fullName: String,
        email: String,
        foodChoice: String
      }
    ]
  },
  submissions: Array,
  registrationDate: Date,
  status: String
}
```

## Support

For deployment issues:
1. Check Vercel function logs in the dashboard
2. Monitor MongoDB Atlas logs
3. Test API endpoints individually
