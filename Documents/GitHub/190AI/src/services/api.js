// API service for interacting with AWS Lambda function
// The Lambda function will handle all S3 operations

const LAMBDA_URL = process.env.VITE_LAMBDA_URL || 'https://your-lambda-url.execute-api.region.amazonaws.com/prod'

// Helper function to call Lambda
async function callLambda(payload) {
  try {
    const response = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Lambda error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// Get all assignments
export async function getAssignments() {
  return callLambda({
    action: 'getAssignments'
  })
}

// Get assignment detail
export async function getAssignmentDetail(assignmentId) {
  return callLambda({
    action: 'getAssignmentDetail',
    assignmentId
  })
}

// Get submissions for an assignment
export async function getAssignmentSubmissions(assignmentId) {
  return callLambda({
    action: 'getAssignmentSubmissions',
    assignmentId
  })
}

// Submit assignment file
export async function submitAssignment(assignmentId, file) {
  // Convert file to base64 for Lambda
  const reader = new FileReader()
  const fileData = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  // In production, get studentId and studentName from auth context
  return callLambda({
    action: 'submitAssignment',
    assignmentId,
    studentId: 'current_student', // TODO: Get from auth context
    studentName: 'Current Student', // TODO: Get from auth context
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    fileData: fileData.split(',')[1] // Remove data:type;base64, prefix
  })
}

// Create new assignment (professor)
export async function createAssignment(assignmentData) {
  return callLambda({
    action: 'createAssignment',
    ...assignmentData
  })
}

// Update assignment (professor)
export async function updateAssignment(assignmentId, assignmentData) {
  return callLambda({
    action: 'updateAssignment',
    assignmentId,
    ...assignmentData
  })
}

// Download submission file
export async function downloadSubmission(assignmentId, studentId) {
  return callLambda({
    action: 'downloadSubmission',
    assignmentId,
    studentId
  })
}
