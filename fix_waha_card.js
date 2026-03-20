const fs = require('fs');

const cardFile = 'src/components/dashboard/integrations/WhatsAppBYONCard.tsx';
let content = fs.readFileSync(cardFile, 'utf8');

content = content.replace(
  '<div className="col-span-full glass-card rounded-xl overflow-hidden mb-6 relative">',
  '<div className="col-span-full public-panel rounded-xl overflow-hidden mb-6 relative">'
);

content = content.replace(
  '<h2 className="text-xl font-bold text-foreground">WhatsApp (WAHA / Linked Devices)</h2>',
  '<h2 className="text-xl font-bold text-[var(--public-ink)]">WhatsApp (WAHA / Linked Devices)</h2>'
);

content = content.replace(
  '<p className="text-muted-foreground text-sm max-w-md">',
  '<p className="text-[var(--public-muted)] text-sm max-w-md">'
);

content = content.replace(
  '<div className="w-full md:w-[400px] bg-white/5 rounded-lg border border-[var(--public-line)] p-5 flex flex-col items-center justify-center min-h-[200px]">',
  '<div className="w-full md:w-[400px] bg-[var(--public-bg-soft)] rounded-lg border border-[var(--public-line)] p-5 flex flex-col items-center justify-center min-h-[200px]">'
);

content = content.replace(
  '<p className="text-foreground font-medium">AI is actively managing your WhatsApp</p>',
  '<p className="text-[var(--public-ink)] font-medium">AI is actively managing your WhatsApp</p>'
);

fs.writeFileSync(cardFile, content);
console.log('Fixed WAHA Card styling');

