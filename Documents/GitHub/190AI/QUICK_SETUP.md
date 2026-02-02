# 🚀 10-Minute Quick Setup Guide

## Backend Architecture

**Super Lean Setup:**
- ✅ **Single Lambda function** (Go) - handles everything
- ✅ **Single S3 bucket** - stores metadata + files
- ✅ **Single S3 object** (`metadata.json`) - all assignments/submissions metadata
- ✅ **Lambda Function URL** - Direct HTTP endpoint (no API Gateway needed!)

**No databases, no API servers, no complexity!**

---

## ⚡ Quick Setup (10 minutes)

### Step 1: Create S3 Bucket (2 min)

```bash
# Using AWS CLI (or use AWS Console)
aws s3 mb s3://latex-submission-platform --region us-east-1

# Or create via AWS Console:
# 1. Go to S3 → Create bucket
# 2. Name: latex-submission-platform
# 3. Region: us-east-1 (or your preferred)
# 4. Uncheck "Block all public access" (or keep it, Lambda will access via IAM)
```

### Step 2: Build Lambda Function (2 min)

```bash
cd backend

# Install Go dependencies
go mod tidy

# Build for Linux (Lambda runs on Linux)
GOOS=linux GOARCH=amd64 go build -o bootstrap main.go

# Create deployment package
zip function.zip bootstrap

# You should now have function.zip ready!
```

### Step 3: Create Lambda Function (3 min)

**Option A: AWS Console (Easiest)**
1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda)
2. Click **"Create function"**
3. Choose **"Author from scratch"**
4. Settings:
   - Function name: `latex-submission-handler`
   - Runtime: **Go 1.x** (or latest Go runtime)
   - Architecture: x86_64
5. Click **"Create function"**
6. Scroll down to **"Code source"**
7. Click **"Upload from"** → **".zip file"**
8. Upload `function.zip`
9. **Handler**: Set to `bootstrap` (already set by default)
10. Scroll to **"Configuration"** → **"Environment variables"**
11. Add: `BUCKET_NAME` = `latex-submission-platform`

**Option B: AWS CLI**
```bash
# Create function
aws lambda create-function \
  --function-name latex-submission-handler \
  --runtime provided.al2 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler bootstrap \
  --zip-file fileb://function.zip \
  --environment Variables="{BUCKET_NAME=latex-submission-platform}"
```

### Step 4: Set Up IAM Role (2 min)

**Lambda needs S3 permissions:**

1. Go to Lambda → Configuration → Permissions
2. Click on the **Execution role**
3. Click **"Add permissions"** → **"Create inline policy"**
4. Use JSON:
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
5. Name: `S3AccessPolicy`
6. Click **"Create policy"**

### Step 5: Create Lambda Function URL (1 min) ⚡

**Much simpler than API Gateway!**

1. Go to your Lambda function in AWS Console
2. Click **"Configuration"** tab → **"Function URL"** (left sidebar)
3. Click **"Create function URL"**
4. Settings:
   - Auth type: **NONE** (or AWS_IAM if you want auth later)
   - CORS: **Enable** (or we handle it in code - already done!)
   - Click **"Save"**
5. **Copy the Function URL** (looks like: `https://abc123.lambda-url.us-east-1.on.aws/`)

### Step 6: Update Frontend (1 min)

**For Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_LAMBDA_URL` = `https://your-function-url.lambda-url.us-east-1.on.aws/`
3. Redeploy (or push to trigger auto-deploy)

**For Local Development:**
```bash
# Create .env file in project root
echo "VITE_LAMBDA_URL=https://your-function-url.lambda-url.us-east-1.on.aws/" > .env

# Restart dev server
npm run dev
```

---

## ✅ Test It!

### Test Lambda Directly:
```bash
curl -X POST https://your-function-url.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d '{"action":"getAssignments"}'
```

Expected response:
```json
{
  "assignments": []
}
```

### Test Frontend:
1. Visit your Vercel URL (or `http://localhost:3000`)
2. You should see the Student Dashboard
3. Click "Professor" in nav → Should see Professor Overview
4. Try creating an assignment (will work once Lambda is connected)

---

## 🐛 Troubleshooting

### Lambda Error: "Access Denied"
- Check IAM role has S3 permissions
- Verify bucket name matches environment variable

### CORS Error in Browser
- Make sure CORS is enabled in Function URL settings
- Check Lambda response includes CORS headers (code already has this)

### Lambda Timeout
- Increase timeout: Configuration → General → Timeout (set to 30 seconds)
- Increase memory: 256 MB should be enough

### "Function not found" Error
- Verify handler is set to `bootstrap`
- Check runtime is Go 1.x or `provided.al2`

---

## 📊 Cost Estimate

**Super cheap!**
- **Lambda**: Free tier = 1M requests/month free, then $0.20 per 1M requests
- **S3**: First 5GB free, then $0.023/GB/month
- **Function URL**: FREE! No additional cost (uses Lambda invocation time)

**For a class of 30 students with 10 assignments:**
- ~300 submissions/month
- **Total cost: ~$0.00** (well within free tier!)

---

## 🎯 What's Next?

1. **Test the full flow:**
   - Create assignment (Professor view)
   - Submit file (Student view)
   - View submissions (Professor → Assignment Detail)

2. **Customize:**
   - Add authentication (Cognito or custom)
   - Add email notifications (SES)
   - Add file validation (check file type/size)

3. **Monitor:**
   - CloudWatch logs for Lambda
   - S3 bucket for file storage
   - Lambda metrics (invocations, duration, errors)

---

## 📝 Quick Reference

**Lambda Function:**
- Handler: `bootstrap`
- Runtime: Go 1.x
- Timeout: 30 seconds
- Memory: 256 MB
- Environment: `BUCKET_NAME`

**S3 Structure:**
```
latex-submission-platform/
├── metadata.json (all assignments/submissions data)
└── submissions/
    └── {assignmentId}/
        └── {submissionId}/
            └── {filename}
```

**Function URL:**
- Method: POST
- URL: `https://your-function-url.lambda-url.us-east-1.on.aws/`
- Body: `{"action": "getAssignments", ...}`
- Response: JSON with data or error

---

**That's it! You're live in 10 minutes! 🎉**
