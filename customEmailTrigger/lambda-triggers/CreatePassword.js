const {
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
    InitiateAuthCommand,
    UpdateUserAttributesCommand,
    GetUserAttributeVerificationCodeCommand,
    VerifyUserAttributeCommand,
    GetUserCommand,
    ChangePasswordCommand
  } = require("@aws-sdk/client-cognito-identity-provider");
  
  exports.lambdaHandler = async (event) => {
    const config = { region: "ap-south-1" }; // Update your AWS region
    const client = new CognitoIdentityProviderClient(config);
  
    try {
          // Step 2: Initiate Authentication
          const initiateAuthInput = {
            AuthFlow: "USER_PASSWORD_AUTH", // Choose the appropriate AuthFlow
            AuthParameters: {
              USERNAME: 'Maneesh_123', // Username for authentication
              PASSWORD: 'Apple#123', // Password provided by the user
            },
            ClientId: "528oo9ok69b2kg38en84d1qtel", // Use the same ClientId
          };

          
      
          const initiateAuthCommand = new InitiateAuthCommand(initiateAuthInput);
          const authResponse = await client.send(initiateAuthCommand);
      
          console.log("Authentication successful:", JSON.stringify(authResponse, null, 2));
      
          // Extract authentication tokens
          const { IdToken, AccessToken, RefreshToken } = authResponse.AuthenticationResult;
            //step 2

            const input = { // GetUserRequest
                AccessToken: AccessToken, // required
              };
              const command = new GetUserCommand(input);
              const getUserDetailsResponse = await client.send(command);
              console.log("getUserDetailsResponse successfully", JSON.stringify(getUserDetailsResponse, null, 2), JSON.stringify(getUserDetailsResponse.UserAttributes.find(attr => attr.Name === "custom:Password")));

            // CREATE PASSWORD CHANGE 
            const passwordInput = { // ChangePasswordRequest
            PreviousPassword: getUserDetailsResponse.UserAttributes.find(attr => attr.Name === "custom:Password").Value,
            ProposedPassword: "Mango#123", // required
            AccessToken: AccessToken, // required
            };
            const PasswordCommand = new ChangePasswordCommand(passwordInput);
            const PasswordCommandResponse = await client.send(PasswordCommand);
            console.log('SuccessFully password changed:' ,JSON.stringify(PasswordCommandResponse));
         // Return successful response with authentication tokens and update response
          return {
            statusCode: 200,
            body: JSON.stringify({
              message: "User authenticated and attributes updated successfully",
              tokens: {
                idToken: IdToken,
                accessToken: AccessToken,
                refreshToken: RefreshToken,
              },
            //   updateUserAttributesResponse
            PasswordCommandResponse, // Include the update response (e.g., email update)
            }),
          };
    } catch (error) {
      console.error("Error processing request:", error);
  
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "An error occurred",
          error: error.message,
        }),
      };
    }
  };
  


