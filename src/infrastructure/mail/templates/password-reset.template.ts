export const passwordResetTemplate = (firstName: string): string => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; padding:32px;">
    <h2 style="color:#f59e0b;">Contraseña restablecida</h2>
    <p>Hola <strong>${firstName}</strong>,</p>
    <p>El administrador restableció tu contraseña.</p>
    <div style="background:#fffbeb; border-left:4px solid #f59e0b; padding:16px; margin:16px 0;">
      <p style="margin:4px 0;">Tu nueva contraseña temporal es tu <strong>DNI</strong>.</p>
    </div>
    <p>Al iniciar sesión, el sistema te pedirá que la cambies obligatoriamente.</p>
    <hr style="margin:24px 0; border:none; border-top:1px solid #e5e7eb;">
    <p style="color:#94a3b8; font-size:12px;">Este es un correo automático, no responder.</p>
  </div>
</body>
</html>
`;