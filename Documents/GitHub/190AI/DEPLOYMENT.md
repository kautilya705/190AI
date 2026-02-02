# Deployment Guide - Vercel + AWS Lambda

## Quick Deploy to Vercel

### 1. Frontend Deployment (Vercel)

#### Option A: Deploy via Vercel Dashboard

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Configure Environment Variables:**
   - In Project Settings → Environment Variables
   - Add: `VITE_LAMBDA_URL` = `https://your-function-url.lambda-url.region.on.aws/`
   - Add for Production, Preview, and Development environments

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your app will be live at `https://your-project.vercel.app`

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variable
vercel env add VITE_LAMBDA_URL
# Enter your Lambda Function URL when prompted
```

### 2. Backend Deployment (AWS Lambda)

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://latex-submission-platform --region us-east-1
   ```

2. **Build Lambda Function:**
   ```bash
   cd backend
   go mod tidy
   ./build.sh
   ```

3. **Create Lambda Function:**
   - Go to AWS Lambda Console
   - Create function → Author from scratch
   - Runtime: Go 1.x
   - Upload `function.zip`
   - Handler: `bootstrap`

4. **Configure Lambda:**
   - Environment Variables: `BUCKET_NAME` = `latex-submission-platform`
   - Execution Role: Needs S3 read/write permissions
   - Timeout: 30 seconds
   - Memory: 256 MB

5. **Create Lambda Function URL:**
   - In Lambda Console → Configuration → Function URL
   - Click "Create function URL"
   - Auth type: NONE (or AWS_IAM for auth)
   - Enable CORS
   - Copy the Function URL

6. **Update Vercel Environment Variable:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Update `VITE_LAMBDA_URL` with your Function URL

### 3. IAM Policy for Lambda

Your Lambda execution role needs this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::latex-submission-platform/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::latex-submission-platform"
    }
  ]
}
```

## Testing Deployment

1. **Test Frontend:**
   - Visit your Vercel URL
   - Check browser console for errors
   - Test navigation between routes

2. **Test Lambda:**
   ```bash
   curl -X POST https://your-function-url.lambda-url.us-east-1.on.aws/ \
     -H "Content-Type: application/json" \
     -d '{"action":"getAssignments"}'
   ```

3. **Test File Upload:**
   - Go to assignment detail page
   - Try uploading a test `.tex` or `.pdf` file
   - Check S3 bucket for uploaded file

## Troubleshooting

### CORS Issues
- Ensure Function URL has CORS enabled in settings
- Check Lambda response headers include `Access-Control-Allow-Origin: *` (already in code)

### Environment Variables Not Working
- Re-deploy after adding environment variables
- Check variable name matches exactly: `VITE_LAMBDA_URL`
- Use Vercel CLI: `vercel env pull` to verify

### Lambda Timeout
- Increase Lambda timeout in AWS Console
- Check CloudWatch logs for errors

### S3 Access Denied
- Verify Lambda execution role has S3 permissions
- Check bucket name matches environment variable

## Continuous Deployment

Vercel automatically deploys on every push to main branch. To disable:
- Go to Project Settings → Git
- Unlink repository or disable auto-deploy

## Custom Domain

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
