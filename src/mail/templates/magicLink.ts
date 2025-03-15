export const magicLink = (link: string): string => {
  return `
  <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
    <h2 style="color: #333;">🔑 Magic Link Login</h2>
    <p>Click the button below to log in:</p>
    <a href="${link}" 
       style="display: inline-block; padding: 10px 20px; font-size: 16px; 
              color: white; background-color: #007bff; text-decoration: none; 
              border-radius: 5px; margin-top: 10px;">
      Log In
    </a>
    <p>If you didn't request this, please ignore this email.</p>
  </body>
  `;
};
