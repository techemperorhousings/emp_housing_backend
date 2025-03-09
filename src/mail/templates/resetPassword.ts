export const resetPassword = (name: string, resetLink: string): string => {
  return `
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="20" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td align="center" style="font-size: 24px; font-weight: bold; color: #333;">
                            Reset Your Password
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; color: #555; text-align: left;">
                            Hello ${name},<br><br>
                            You recently requested to reset your password. Click the button below to set a new password:
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">Reset Password</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 14px; color: #888; text-align: left;">
                            If you did not request this password reset, please ignore this email. This link will expire in 24 hours.
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 14px; color: #888; text-align: left;">
                            Best regards,<br>
                            The Support Team
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
  `;
};
