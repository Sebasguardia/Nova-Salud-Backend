export const passwordChangedTemplate = (
  firstName: string,
  date: string,
): string => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; padding:32px;">
    <h2 style="color:#22c55e;">Contraseña actualizada</h2>
    <p>Hola <strong>${firstName}</strong>,</p>
    <p>Tu contraseña fue actualizada exitosamente el <strong>${date}</strong>.</p>
    <p>Si no fuiste tú quien realizó este cambio, contacta al administrador de inmediato.</p>
    <hr style="margin:24px 0; border:none; border-top:1px solid #e5e7eb;">
    <p style="color:#94a3b8; font-size:12px;">Este es un correo automático, no responder.</p>
  </div>
</body>
</html>
`;