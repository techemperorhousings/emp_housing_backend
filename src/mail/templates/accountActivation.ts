export const accountActivation = (
  name: string,
  appName: string,
  verificationLink: string,
): string => {
  return `
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1); text-align: center; margin: auto;">
          <h1 style="font-size: 24px; color: #333;">Welcome, ${name}!</h1>
          <p style="margin-top: 20px; font-size: 16px; color: #666;">
              Thank you for joining <strong>${appName}</strong>. We're excited to have you on board!
          </p>
          <a href="${verificationLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Verify Your Email
          </a>
          <p style="margin-top: 30px; font-size: 12px; color: #888;">
              If you did not sign up, you can ignore this email.
          </p>
      </div>
  </body>`;
};
