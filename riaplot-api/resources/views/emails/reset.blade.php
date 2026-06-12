<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f8; margin:0; padding:24px;">
    <div style="max-width:480px; margin:0 auto; background:#fff; border-radius:12px; padding:32px;">
        <h1 style="color:#004D6C; font-size:22px; margin:0 0 16px;">Olá, {{ $name }}!</h1>
        <p style="color:#333; font-size:15px; line-height:1.5;">
            Recebemos um pedido para repor a palavra-passe da tua conta RiaPlot.
            Clica no botão abaixo para definir uma nova.
        </p>
        <p style="text-align:center; margin:28px 0;">
            <a href="{{ $resetUrl }}"
               style="background:#DB8B31; color:#fff; text-decoration:none; padding:12px 28px; border-radius:10px; font-weight:bold; display:inline-block;">
                Repor palavra-passe
            </a>
        </p>
        <p style="color:#777; font-size:13px; line-height:1.5;">
            Este link expira em {{ $expiresMinutes }} minutos. Se o botão não funcionar,
            copia este link para o navegador:<br>
            <a href="{{ $resetUrl }}" style="color:#126587; word-break:break-all;">{{ $resetUrl }}</a>
        </p>
        <p style="color:#999; font-size:12px; margin-top:24px;">
            Se não foste tu a pedir isto, ignora este email — a tua palavra-passe não será alterada.
        </p>
    </div>
</body>
</html>
