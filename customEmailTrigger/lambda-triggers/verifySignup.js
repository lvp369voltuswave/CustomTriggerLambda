const {
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
    InitiateAuthCommand,
    UpdateUserAttributesCommand,
    GetUserAttributeVerificationCodeCommand,
    VerifyUserAttributeCommand
  } = require("@aws-sdk/client-cognito-identity-provider");
  
  exports.lambdaHandler = async (event) => {
    const config = { region: "ap-south-1" }; // Update your AWS region
    const client = new CognitoIdentityProviderClient(config);
  
    try {
          // Step 2: Initiate Authentication
          const initiateAuthInput = {
            AuthFlow: "USER_PASSWORD_AUTH", // Choose the appropriate AuthFlow
            AuthParameters: {
              USERNAME: 'prasad_123', // Username for authentication
              PASSWORD: 'Apple#123', // Password provided by the user
            },
            ClientId: "528oo9ok69b2kg38en84d1qtel", // Use the same ClientId
          };

          
      
          const initiateAuthCommand = new InitiateAuthCommand(initiateAuthInput);
          const authResponse = await client.send(initiateAuthCommand);
      
          console.log("Authentication successful:", JSON.stringify(authResponse, null, 2));
      
          // Extract authentication tokens
          const { IdToken, AccessToken, RefreshToken } = authResponse.AuthenticationResult;
      
        ////   Step 3: Update User Attributes (e.g., email)
        //   const updateUserAttributesInput = {
        //     AccessToken: AccessToken, // The access token is required to update attributes
        //     UserAttributes: [
        //       {
        //         Name: 'preferred_username', // Update the email attribute
        //         Value: 'lakshmi_415236', // New email value from the event
        //       },
        //     ],
        //   };

        //   const command = new UpdateUserAttributesCommand(updateUserAttributesInput);
        //   const updateUserAttributesResponse = await client.send(command);
      
    
            //step 2

            const input = { // VerifyUserAttributeRequest
                AccessToken: AccessToken, // required
                AttributeName: 'email', // required
                Code: '661056', // required
              };
              const verifyCommand = new VerifyUserAttributeCommand(input);
              const verifyCommandResponse = await client.send(verifyCommand);
              
              console.log("Verification successfully", JSON.stringify(verifyCommandResponse, null, 2));
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
             verifyCommandResponse, // Include the update response (e.g., email update)
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
  


// const {
//   CognitoIdentityProviderClient,
//   ConfirmSignUpCommand,
// } = require("@aws-sdk/client-cognito-identity-provider");

// exports.lambdaHandler = async (event) => {
//   const config = { region: "ap-south-1" }; // Update the region as per your Cognito setup
//   const client = new CognitoIdentityProviderClient(config);

//   const input = {
//     ClientId: "528oo9ok69b2kg38en84d1qtel", // Your App Client ID
//     Username: "vara_369", // The username of the user to confirm
//     ConfirmationCode: "927635", // The code sent to the user's email/phone
//     ForceAliasCreation: false, // Optional: Default is false
//   };

//   try {
//     const command = new ConfirmSignUpCommand(input);
//     const response = await client.send(command);
//     console.log("User confirmed successfully:", response);

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "User confirmed successfully", response }),
//     };
//   } catch (error) {
//     console.error("Error confirming user sign-up:", error);

//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: "Failed to confirm user sign-up", error: error.message }),
//     };
//   }
// };
