const {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    UpdateUserAttributesCommand,
    
  } = require("@aws-sdk/client-cognito-identity-provider");
  
  exports.lambdaHandler = async (event) => {
    const config = { region: "ap-south-1" }; // Update your AWS region
    const client = new CognitoIdentityProviderClient(config);
    const clientId = "528oo9ok69b2kg38en84d1qtel";
    const body = JSON.parse(event.body); // Parse event body
    console.log('body', body);
    const { username, password, proposedUsername } = body;
  
    try {
        // Step 2: Initiate Authentication
        const initiateAuthInput = {
            AuthFlow: "USER_PASSWORD_AUTH", // Choose the appropriate AuthFlow
            AuthParameters: {
                USERNAME: username, // Username for authentication
                PASSWORD: password, // Password provided by the user
            },
            ClientId: clientId, // Use the same ClientId
        };
  
        const initiateAuthCommand = new InitiateAuthCommand(initiateAuthInput);
        const authResponse = await client.send(initiateAuthCommand);
  
        console.log("Authentication successful:", JSON.stringify(authResponse, null, 2));
  
        // Extract authentication tokens
        const { IdToken, AccessToken, RefreshToken } = authResponse.AuthenticationResult;
  
        if (authResponse) {
            const updateUserAttributesInput = {
                AccessToken: AccessToken, // The access token is required to update attributes
                UserAttributes: [
                    {Name: 'preferred_username', Value: proposedUsername}, // New email value from the event
                    { Name: "custom:isUserName", Value: "true" }
                ],
            };
  
            const updateAttributeCommand = new UpdateUserAttributesCommand(updateUserAttributesInput);
            const updateUserAttributesResponse = await client.send(updateAttributeCommand);
            console.log('updateUserAttributesResponse', updateUserAttributesResponse);
  
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",  // Allow all origins, or restrict it to a specific domain
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: JSON.stringify({
                    message: "User authenticated and attributes updated successfully",
                    tokens: {
                        idToken: IdToken,
                        accessToken: AccessToken,
                        refreshToken: RefreshToken,
                    },
                    updateUserAttributesResponse // Include the update response (e.g., email update)
                }),
            };
        }
    } catch (error) {
        console.error("Error processing request:", error);
  
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow all origins, or restrict it to a specific domain
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: JSON.stringify({
                message: "An error occurred",
                error: error.message,
            }),
        };
    }
};