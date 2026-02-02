# LaTeX Submission Platform - 190AI

A lean, modern platform for LaTeX assignment submissions built with React and AWS Lambda.

## Features

- **Student Dashboard**: View assignments with deadlines and submission status
- **Professor Overview**: Manage assignments, track submissions, view statistics
- **Assignment Detail**: Submit LaTeX files, view student registry, manage settings
- **Super Lean Backend**: Single Lambda function + S3 bucket for all data

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Go, AWS Lambda, AWS S3
- **Storage**: Single S3 object for all metadata (cost-effective)

## Quick Start

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

See `backend/README.md` for detailed instructions.

1. Install Go dependencies:
```bash
cd backend
go mod tidy
```

2. Build and deploy Lambda function (see backend README)

3. Set environment variable (for local development):
```bash
# Create .env file
echo "VITE_LAMBDA_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/prod" > .env
```

   **For Vercel deployment:** Set `VITE_LAMBDA_URL` in Vercel dashboard (Project Settings → Environment Variables)

## Project Structure

```
.
├── src/
│   ├── components/          # React components
│   │   ├── StudentDashboard.jsx
│   │   ├── ProfessorOverview.jsx
│   │   ├── AssignmentDetail.jsx
│   │   └── ProfessorAssignmentModal.jsx
│   ├── services/
│   │   └── api.js           # API service for Lambda calls
│   ├── App.jsx              # Main app with routing
│   └── main.jsx             # Entry point
├── backend/
│   ├── main.go              # Lambda function handler
│   └── go.mod               # Go dependencies
└── package.json             # Frontend dependencies
```

## Architecture

### Data Storage

All metadata (assignments, submissions, grades) stored in a single S3 object (`metadata.json`) to minimize costs. Submitted files stored separately in S3.

### API Flow

1. Frontend makes POST request to Lambda Function URL
2. Lambda function handles request directly
3. Lambda reads/writes S3 metadata object
4. Lambda uploads/downloads files to/from S3
5. Response returned to frontend

## Routes

- `/` or `/student` - Student assignment dashboard
- `/professor` - Professor course overview
- `/assignment/:id` - Assignment detail view (submission/management)

## Development Notes

- Mock data is used when Lambda is unavailable (for local development)
- File uploads are base64 encoded and sent to Lambda
- Lambda generates presigned URLs for file downloads
- All timestamps in UTC/RFC3339 format

## Deployment

### Frontend (Vercel)

1. **Connect your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

2. **Set environment variable:**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add `VITE_LAMBDA_URL` with your Lambda Function URL
   - Example: `https://abc123.lambda-url.us-east-1.on.aws/`

3. **Deploy:**
   - Push to main branch (auto-deploys)
   - Or manually deploy from Vercel dashboard

### Backend (AWS Lambda)

1. Build Lambda function:
   ```bash
   cd backend
   go mod tidy
   ./build.sh
   ```

2. Deploy to AWS Lambda:
   - Upload `function.zip` to Lambda
   - Set handler to `bootstrap`
   - Set environment variable `BUCKET_NAME` to your S3 bucket name
   - Create Function URL (Configuration → Function URL)

3. **Get Function URL:**
   - Copy the Function URL from Lambda Console
   - Add it to Vercel environment variables as `VITE_LAMBDA_URL`

## License

Academic use for 190AI class.
