/**
 * Base HTML layout for all Cooldown transactional emails.
 * Matches the site visual identity: dark background (#0d0d0d), acid yellow (#f5f500), off-white text.
 */
export function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cooldown</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:'DM Sans',Arial,sans-serif;color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;border-bottom:1px solid #2a2a2a;">
              <span style="font-family:'Barlow Condensed',Arial,sans-serif;font-weight:900;font-size:22px;letter-spacing:-0.04em;text-transform:uppercase;color:#f5f5f5;text-decoration:none;">
                COOLDOWN
              </span>
              <span style="display:inline-block;margin-left:12px;background-color:#f5f500;color:#0d0d0d;font-family:'Barlow Condensed',Arial,sans-serif;font-weight:700;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;padding:3px 6px;">
                PARTNERS
              </span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 0;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;border-top:1px solid #2a2a2a;">
              <p style="margin:0;font-size:12px;color:#808080;letter-spacing:0.02em;">
                Cooldown &mdash; Music + Urban &mdash; Barcelona
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 24px 0;font-family:'Barlow Condensed',Arial,sans-serif;font-weight:900;font-size:32px;letter-spacing:-0.03em;text-transform:uppercase;color:#f5f5f5;line-height:1.1;">${text}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#c8c8c8;">${text}</p>`;
}

export function ctaButton(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:8px;background-color:#f5f500;color:#0d0d0d;font-family:'Barlow Condensed',Arial,sans-serif;font-weight:700;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;padding:12px 24px;text-decoration:none;">${text}</a>`;
}

export function infoBox(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">
      <span style="font-family:'Barlow Condensed',Arial,sans-serif;font-weight:700;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#808080;">${label}</span>
      <br />
      <span style="font-size:14px;color:#f5f5f5;">${value}</span>
    </td>
  </tr>`;
}
