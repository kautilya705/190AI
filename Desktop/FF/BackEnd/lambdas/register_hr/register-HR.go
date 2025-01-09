package main

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/google/uuid"
)

type HR struct {
	Name           string `json:"name"`
	CompanyMailID  string `json:"companyMailId"`
	MobileNumber   string `json:"mobileNumber"`
	WhatsappNumber string `json:"whatsappNumber"`
	DOB            string `json:"dob"`
}

func HandleHRRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
	)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       `{"status":"error","message":"Failed to load AWS config: ` + err.Error() + `"}`,
		}, nil
	}

	var hr HR
	if err := json.Unmarshal([]byte(request.Body), &hr); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Body:       `{"status":"error","message":"Invalid request body"}`,
		}, nil
	}

	svc := dynamodb.NewFromConfig(cfg)
	// Generating unique HR Id
	hrId := uuid.New().String()
	item := map[string]types.AttributeValue{
		"hrId":           &types.AttributeValueMemberS{Value: hrId},
		"name":           &types.AttributeValueMemberS{Value: hr.Name},
		"companyMailId":  &types.AttributeValueMemberS{Value: hr.CompanyMailID},
		"mobileNumber":   &types.AttributeValueMemberS{Value: hr.MobileNumber},
		"whatsappNumber": &types.AttributeValueMemberS{Value: hr.WhatsappNumber},
		"dob":            &types.AttributeValueMemberS{Value: hr.DOB},
	}

	// Put item into DynamoDB
	_, err = svc.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String("HRs"),
		Item:      item,
	})

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       `{"status":"error","message":"Failed to save HR data: ` + err.Error() + `"}`,
		}, nil
	}
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       `{"status":"success","message":"HR registered successfully"}`,
	}, nil
}

func main() {
	lambda.Start(HandleHRRequest)
}
