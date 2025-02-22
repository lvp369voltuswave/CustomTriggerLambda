const AWS = require('aws-sdk');
const b64 = require('base64-js');
const encryptionSdk = require('@aws-crypto/client-node');
const nodemailer = require("nodemailer");
const path = require('path');
const fs = require('fs');

//Configure the encryption SDK client with the KMS key from the environment variables.
const { encrypt, decrypt } = encryptionSdk.buildClient(encryptionSdk.CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);
const generatorKeyId = "CognitoOtpEncryptionKey";
const keyIds = [ "arn:aws:kms:ap-south-1:981244829775:key/b7e10abb-ae68-4342-9099-30c93e4a43f7" ];
const keyring = new encryptionSdk.KmsKeyringNode({ generatorKeyId, keyIds })
exports.lambdaHandler = async (event) => {
	//Decrypt the secret code using encryption SDK.
	let plainTextCode;
	let otp;
	console.log(event)
	if(event.request.code){
		const { plaintext, messageHeader } = await decrypt(keyring, b64.toByteArray(event.request.code));
		plainTextCode= plaintext;
		console.log("plainTextCode",plainTextCode)
		let codeAsString = plainTextCode.toString('utf-8');
		otp = codeAsString;  // Convert buffer to string
        console.log("codeAsString",codeAsString)
	}
	//PlainTextCode now contains the decrypted secret.
	if(event.triggerSource == 'CustomEmailSender_SignUp'){
		const smtpServer = process.env.SMTP_SERVER;
  		const smtpPort = parseInt(process.env.SMTP_PORT, 10);
  		const smtpUsername = process.env.SMTP_USERNAME;
  		const smtpPassword = process.env.SMTP_PASSWORD;
  		const emailFrom = process.env.EMAIL_FROM;

		console.log('CustomEmailSender_SignUp::', {smtpServer,smtpPort,smtpUsername,smtpPassword,emailFrom})

		const emailTo = event.request.userAttributes.email;
		const templatePath = path.join(process.cwd(), "emailTemplate.html");
		let htmlTemplate;
		htmlTemplate = fs.readFileSync(templatePath, "utf8");
		htmlTemplate = htmlTemplate.replace("{{OTP}}", otp);
		console.log("Updated HTML Template:", htmlTemplate);
		// Create the email options
		const mailOptions = {
			from: emailFrom,
			to: emailTo,
			subject: "Your OTP Code for Verification",
			html: htmlTemplate,
		  };
		
		  // Create the transporter for sending emails
		  const transporter = nodemailer.createTransport({
			host: smtpServer,
			port: smtpPort,
			secure: false, 
			auth: {
			  user: smtpUsername,
			  pass: smtpPassword,
			},
			tls: {
				rejectUnauthorized: false,
			  },
			debug: true, // Enable debug output
			logger: true, // Log everything to the console
		  });
		
		  try {
			// Send the email
			const result = await transporter.sendMail(mailOptions);
			console.log("Email sent successfully:", result);
		
			// Respond with the OTP (you can store it in DynamoDB for verification later)
			return {
			  statusCode: 200,
			  body: JSON.stringify({ message: "Email sent successfully!", otp }),
			};
		  } catch (error) {
			console.error("Error sending email:", error);
			return {
			  statusCode: 500,
			  body: JSON.stringify({ message: "Failed to send email", error: error.message }),
			};
		  }
		//Send an email message to your user via a custom provider.
		//Include the temporary password in the message.
	}
	else if(event.triggerSource == 'CustomEmailSender_Authentication'){
         //Send an MFA message.
	}
	else if(event.triggerSource == 'CustomEmailSender_ResendCode'){
         //Send a message with next steps for password reset.
	}
	else if(event.triggerSource == 'CustomEmailSender_ForgotPassword'){
         //Send a message with next steps for password reset.
	}
	else if(event.triggerSource == 'CustomEmailSender_UpdateUserAttribute'){
         //Send a message with next steps for confirming the new attribute.
	}
	else if(event.triggerSource == 'CustomEmailSender_VerifyUserAttribute'){
         //Send a message with next steps for confirming the new attribute.
	}
	else if(event.triggerSource == 'CustomEmailSender_AdminCreateUser'){
         //Send a message with next steps for signing in with a new user profile.
	}
	else if(event.triggerSource == 'CustomEmailSender_AccountTakeOverNotification'){
         //Send a message describing the threat protection event and next steps.
	}
	return;
};