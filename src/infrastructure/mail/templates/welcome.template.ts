export const welcomeTemplate = (
  firstName: string,
  email: string,
  dni: string,
): string => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; padding:32px;">
    <h2 style="color:#0ea5e9;">Bienvenido al Sistema de Botica</h2>
    <p>Hola <strong>${firstName}</strong>,</p>
    <p>Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales de acceso:</p>
    <div style="background:#f0f9ff; border-left:4px solid #0ea5e9; padding:16px; margin:16px 0;">
      <p style="margin:4px 0;"><strong>Usuario:</strong> ${email}</p>
      <p style="margin:4px 0;"><strong>Contraseña temporal:</strong> ${dni} (tu DNI)</p>
    </div>
    <p>Al ingresar por primera vez, el sistema te pedirá cambiar tu contraseña.</p>
    <p style="color:#ef4444; font-size:13px;">Por seguridad, no compartas estas credenciales con nadie.</p>
    <hr style="margin:24px 0; border:none; border-top:1px solid #e5e7eb;">
    <p style="color:#94a3b8; font-size:12px;">Este es un correo automático, no responder.</p>
  </div>
</body>
</html>
`;