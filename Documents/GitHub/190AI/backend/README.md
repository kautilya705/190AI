# LaTeX Submission Platform - Backend

Go Lambda function for handling all S3 operations and metadata management.

## Architecture

- **Single Lambda Function**: Handles all API requests
- **Single S3 Object**: All metadata (assignments, submissions, grades) stored in `metadata.json`
- **S3 Bucket**: Stores submitted files in `submissions/{assignmentId}/{submissionId}/{filename}`

## Setup

1. Install Go dependencies:
```bash
cd backend
go mod tidy
```

2. Build the Lambda function:
```bash
GOOS=linux GOARCH=amd64 go build -o bootstrap main.go
zip function.zip bootstrap
```

3. Deploy to AWS Lambda:
   - Create a Lambda function with Go runtime
   - Upload `function.zip`
   - Set environment variables:
     - `BUCKET_NAME`: Your S3 bucket name
   - Set IAM role with S3 read/write permissions

4. Configure API Gateway:
   - Create REST API
   - Create POST method pointing to Lambda
   - Enable CORS
   - Deploy API

5. Update frontend `.env`:
   - Set `VITE_LAMBDA_URL` to your API Gateway endpoint

## Environment Variables

- `BUCKET_NAME`: S3 bucket name (default: "latex-submission-platform")

## API Actions

All requests are POST with JSON body containing `action` field:

- `getAssignments`: Get all assignments
- `getAssignmentDetail`: Get assignment details
- `getAssignmentSubmissions`: Get submissions for an assignment
- `createAssignment`: Create new assignment (professor)
- `updateAssignment`: Update assignment (professor)
- `submitAssignment`: Submit assignment file (student)
- `downloadSubmission`: Get download URL for submission

## Metadata Structure

All metadata stored in single S3 object:

```json
{
  "assignments": {
    "assignmentId": {
      "id": "...",
      "title": "...",
      "deadline": "...",
      ...
    }
  },
  "submissions": {
    "assignmentId": [
      {
        "studentId": "...",
        "fileName": "...",
        "fileKey": "...",
        ...
      }
    ]
  },
  "lastUpdated": "..."
}
```
