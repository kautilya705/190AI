package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

const (
	// S3 object key for metadata storage
	metadataKey = "metadata.json"
)

func getBucketName() string {
	if bucket := os.Getenv("BUCKET_NAME"); bucket != "" {
		return bucket
	}
	return "latex-submission-platform" // Default bucket name
}

var s3Client *s3.S3

func init() {
	sess := session.Must(session.NewSession())
	s3Client = s3.New(sess)
}

// Metadata structure - all data stored in single S3 object
type Metadata struct {
	Assignments map[string]*Assignment   `json:"assignments"`
	Submissions map[string][]*Submission `json:"submissions"`
	LastUpdated string                   `json:"lastUpdated"`
}

type Assignment struct {
	ID            string `json:"id"`
	Title         string `json:"title"`
	Subtitle      string `json:"subtitle,omitempty"`
	CourseCode    string `json:"courseCode"`
	Course        string `json:"course"`
	Semester      string `json:"semester"`
	Deadline      string `json:"deadline"`
	Instructions  string `json:"instructions"`
	Status        string `json:"status"`
	MaxScore      int    `json:"maxScore"`
	TotalStudents int    `json:"totalStudents"`
	CreatedAt     string `json:"createdAt"`
}

type Submission struct {
	StudentID   string `json:"studentId"`
	StudentName string `json:"studentName"`
	FileName    string `json:"fileName"`
	FileKey     string `json:"fileKey"` // S3 key for the submitted file
	SubmittedAt string `json:"submittedAt"`
	Status      string `json:"status"`
}

type RequestPayload struct {
	Action        string `json:"action"`
	AssignmentID  string `json:"assignmentId,omitempty"`
	StudentID     string `json:"studentId,omitempty"`
	StudentName   string `json:"studentName,omitempty"`
	Title         string `json:"title,omitempty"`
	Subtitle      string `json:"subtitle,omitempty"`
	CourseCode    string `json:"courseCode,omitempty"`
	Course        string `json:"course,omitempty"`
	Semester      string `json:"semester,omitempty"`
	Deadline      string `json:"deadline,omitempty"`
	Instructions  string `json:"instructions,omitempty"`
	MaxScore      int    `json:"maxScore,omitempty"`
	TotalStudents int    `json:"totalStudents,omitempty"`
	FileName      string `json:"fileName,omitempty"`
	FileType      string `json:"fileType,omitempty"`
	FileSize      int64  `json:"fileSize,omitempty"`
	FileData      string `json:"fileData,omitempty"` // base64 encoded
}

// Load metadata from S3
func loadMetadata() (*Metadata, error) {
	result, err := s3Client.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(getBucketName()),
		Key:    aws.String(metadataKey),
	})
	if err != nil {
		// If object doesn't exist, return empty metadata
		return &Metadata{
			Assignments: make(map[string]*Assignment),
			Submissions: make(map[string][]*Submission),
			LastUpdated: time.Now().UTC().Format(time.RFC3339),
		}, nil
	}
	defer result.Body.Close()

	var metadata Metadata
	decoder := json.NewDecoder(result.Body)
	if err := decoder.Decode(&metadata); err != nil {
		return nil, fmt.Errorf("failed to decode metadata: %v", err)
	}

	return &metadata, nil
}

// Save metadata to S3
func saveMetadata(metadata *Metadata) error {
	metadata.LastUpdated = time.Now().UTC().Format(time.RFC3339)

	data, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %v", err)
	}

	_, err = s3Client.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(getBucketName()),
		Key:         aws.String(metadataKey),
		Body:        aws.ReadSeekCloser(aws.NewReadSeekCloser(aws.NewBytesReader(data))),
		ContentType: aws.String("application/json"),
	})
	if err != nil {
		return fmt.Errorf("failed to save metadata: %v", err)
	}

	return nil
}

// Generate unique ID
func generateID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

// Handle Lambda request
func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var payload RequestPayload
	if err := json.Unmarshal([]byte(request.Body), &payload); err != nil {
		return createErrorResponse(400, "Invalid request body"), nil
	}

	metadata, err := loadMetadata()
	if err != nil {
		return createErrorResponse(500, fmt.Sprintf("Failed to load metadata: %v", err)), nil
	}

	var response interface{}

	switch payload.Action {
	case "getAssignments":
		response = handleGetAssignments(metadata)
	case "getAssignmentDetail":
		response = handleGetAssignmentDetail(metadata, payload.AssignmentID)
	case "getAssignmentSubmissions":
		response = handleGetAssignmentSubmissions(metadata, payload.AssignmentID)
	case "createAssignment":
		response = handleCreateAssignment(metadata, &payload)
	case "updateAssignment":
		response = handleUpdateAssignment(metadata, payload.AssignmentID, &payload)
	case "submitAssignment":
		response = handleSubmitAssignment(metadata, &payload)
	case "downloadSubmission":
		response = handleDownloadSubmission(metadata, payload.AssignmentID, payload.StudentID)
	default:
		return createErrorResponse(400, "Unknown action"), nil
	}

	// Save metadata if it was modified
	if payload.Action == "createAssignment" || payload.Action == "updateAssignment" || payload.Action == "submitAssignment" {
		if err := saveMetadata(metadata); err != nil {
			return createErrorResponse(500, fmt.Sprintf("Failed to save metadata: %v", err)), nil
		}
	}

	return createSuccessResponse(response), nil
}

func handleGetAssignments(metadata *Metadata) map[string]interface{} {
	assignments := make([]*Assignment, 0)
	for _, assignment := range metadata.Assignments {
		assignments = append(assignments, assignment)
	}
	return map[string]interface{}{
		"assignments": assignments,
	}
}

func handleGetAssignmentDetail(metadata *Metadata, assignmentID string) map[string]interface{} {
	assignment, exists := metadata.Assignments[assignmentID]
	if !exists {
		return map[string]interface{}{
			"error": "Assignment not found",
		}
	}
	// Return assignment directly (not nested) to match frontend expectations
	return map[string]interface{}{
		"id":           assignment.ID,
		"title":        assignment.Title,
		"course":       assignment.Course,
		"semester":     assignment.Semester,
		"deadline":     assignment.Deadline,
		"instructions": assignment.Instructions,
		"status":       assignment.Status,
	}
}

func handleGetAssignmentSubmissions(metadata *Metadata, assignmentID string) map[string]interface{} {
	submissions := metadata.Submissions[assignmentID]
	if submissions == nil {
		submissions = make([]*Submission, 0)
	}
	return map[string]interface{}{
		"submissions": submissions,
	}
}

func handleCreateAssignment(metadata *Metadata, payload *RequestPayload) map[string]interface{} {
	assignmentID := generateID()
	assignment := &Assignment{
		ID:            assignmentID,
		Title:         payload.Title,
		Subtitle:      payload.Subtitle,
		CourseCode:    payload.CourseCode,
		Course:        payload.Course,
		Semester:      payload.Semester,
		Deadline:      payload.Deadline,
		Instructions:  payload.Instructions,
		Status:        "active",
		MaxScore:      payload.MaxScore,
		TotalStudents: payload.TotalStudents,
		CreatedAt:     time.Now().UTC().Format(time.RFC3339),
	}

	metadata.Assignments[assignmentID] = assignment
	metadata.Submissions[assignmentID] = make([]*Submission, 0)

	return map[string]interface{}{
		"assignment": assignment,
		"message":    "Assignment created successfully",
	}
}

func handleUpdateAssignment(metadata *Metadata, assignmentID string, payload *RequestPayload) map[string]interface{} {
	assignment, exists := metadata.Assignments[assignmentID]
	if !exists {
		return map[string]interface{}{
			"error": "Assignment not found",
		}
	}

	if payload.Title != "" {
		assignment.Title = payload.Title
	}
	if payload.Deadline != "" {
		assignment.Deadline = payload.Deadline
	}
	if payload.Instructions != "" {
		assignment.Instructions = payload.Instructions
	}
	if payload.MaxScore > 0 {
		assignment.MaxScore = payload.MaxScore
	}

	return map[string]interface{}{
		"assignment": assignment,
		"message":    "Assignment updated successfully",
	}
}

func handleSubmitAssignment(metadata *Metadata, payload *RequestPayload) map[string]interface{} {
	assignment, exists := metadata.Assignments[payload.AssignmentID]
	if !exists {
		return map[string]interface{}{
			"error": "Assignment not found",
		}
	}

	// Decode file data
	fileData, err := base64.StdEncoding.DecodeString(payload.FileData)
	if err != nil {
		return map[string]interface{}{
			"error": fmt.Sprintf("Failed to decode file: %v", err),
		}
	}

	// Generate S3 key for submission
	fileKey := fmt.Sprintf("submissions/%s/%s/%s", payload.AssignmentID, generateID(), payload.FileName)

	// Upload file to S3
	_, err = s3Client.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(getBucketName()),
		Key:         aws.String(fileKey),
		Body:        aws.ReadSeekCloser(aws.NewReadSeekCloser(aws.NewBytesReader(fileData))),
		ContentType: aws.String(payload.FileType),
	})
	if err != nil {
		return map[string]interface{}{
			"error": fmt.Sprintf("Failed to upload file: %v", err),
		}
	}

	// Create submission record
	// Note: In production, StudentID and StudentName should come from authentication context
	// For now, using a placeholder or from request if provided
	studentID := payload.StudentID
	if studentID == "" {
		studentID = "student_" + generateID() // Generate temporary ID if not provided
	}
	studentName := payload.StudentName
	if studentName == "" {
		studentName = "Student" // Default name
	}

	submission := &Submission{
		StudentID:   studentID,
		StudentName: studentName,
		FileName:    payload.FileName,
		FileKey:     fileKey,
		SubmittedAt: time.Now().UTC().Format(time.RFC3339),
		Status:      "submitted",
	}

	// Add to submissions list
	submissions := metadata.Submissions[payload.AssignmentID]
	if submissions == nil {
		submissions = make([]*Submission, 0)
	}
	metadata.Submissions[payload.AssignmentID] = append(submissions, submission)

	return map[string]interface{}{
		"submission": submission,
		"message":    "Assignment submitted successfully",
	}
}

func handleDownloadSubmission(metadata *Metadata, assignmentID, studentID string) map[string]interface{} {
	submissions := metadata.Submissions[assignmentID]
	for _, submission := range submissions {
		if submission.StudentID == studentID {
			// Generate presigned URL for download
			req, _ := s3Client.GetObjectRequest(&s3.GetObjectInput{
				Bucket: aws.String(getBucketName()),
				Key:    aws.String(submission.FileKey),
			})
			url, err := req.Presign(15 * time.Minute)
			if err != nil {
				return map[string]interface{}{
					"error": fmt.Sprintf("Failed to generate download URL: %v", err),
				}
			}
			return map[string]interface{}{
				"downloadUrl": url,
				"fileName":    submission.FileName,
			}
		}
	}
	return map[string]interface{}{
		"error": "Submission not found",
	}
}

func createSuccessResponse(data interface{}) events.APIGatewayProxyResponse {
	body, _ := json.Marshal(data)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type":                "application/json",
			"Access-Control-Allow-Origin": "*",
		},
		Body: string(body),
	}
}

func createErrorResponse(statusCode int, message string) events.APIGatewayProxyResponse {
	body, _ := json.Marshal(map[string]string{"error": message})
	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Headers: map[string]string{
			"Content-Type":                "application/json",
			"Access-Control-Allow-Origin": "*",
		},
		Body: string(body),
	}
}

func main() {
	lambda.Start(handleRequest)
}
