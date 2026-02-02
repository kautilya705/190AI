#!/bin/bash
# Build script for Lambda function

echo "Building Lambda function..."
GOOS=linux GOARCH=amd64 go build -o bootstrap main.go

if [ $? -eq 0 ]; then
    echo "Build successful! Creating deployment package..."
    zip function.zip bootstrap
    echo "Deployment package created: function.zip"
    echo ""
    echo "Next steps:"
    echo "1. Upload function.zip to AWS Lambda"
    echo "2. Set handler to 'bootstrap'"
    echo "3. Set environment variable BUCKET_NAME to your S3 bucket name"
    echo "4. Configure API Gateway to invoke this Lambda"
else
    echo "Build failed!"
    exit 1
fi
