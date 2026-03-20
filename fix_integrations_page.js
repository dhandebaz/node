const fs = require('fs');

const pageFile = 'src/app/(customer)/dashboard/ai/integrations/page.tsx';
let content = fs.readFileSync(pageFile, 'utf8');

// 1. Remove the first floating WhatsAppBYONCard since it's rendered twice
content = content.replace(
  '{/* Featured WhatsApp BYON Card */}\n        <WhatsAppBYONCard />',
  ''
);

// 2. Transform the OTA card into an actual actionable card that links to properties
// We will simply make it fit the exact theme of the other cards.
content = content.replace(
  '<Card className="bg-[var(--color-dashboard-surface)] border-[var(--public-line)] opacity-75">',
  '<Card className="public-panel opacity-95">'
);

// 3. Add Telegram, SMS, Voice, and CCTV cards!
const upcomingCards = `
        {/* Telegram Integration */}
        <Card className="public-panel">
          <CardHeader>
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0088cc]/10 rounded-full flex items-center justify-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram" className="w-6 h-6" />
                      </div>
                      <div>
                          <CardTitle className="text-[var(--public-ink)]">Telegram</CardTitle>
                          <CardDescription className="text-[var(--public-ink)]/50">Reply to Telegram Bot messages</CardDescription>
                      </div>
                  </div>
                  <Badge variant="outline" className="text-[var(--public-muted)] border-zinc-500/20 bg-zinc-500/10">Coming Soon</Badge>
              </div>
          </CardHeader>
          <CardContent>
             <Button disabled className="w-full bg-[var(--public-bg-soft)] text-[var(--public-muted)] border border-[var(--public-line)]">
                 In Development
             </Button>
          </CardContent>
        </Card>

        {/* Nodebase Voice Integration */}
        <Card className="public-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--public-accent)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <CardHeader>
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w0.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                      </div>
                      <div>
                          <CardTitle className="text-[var(--public-ink)]">Nodebase Voice</CardTitle>
                          <CardDescription className="text-[var(--public-ink)]/50">AI Phone Agent for your business</CardDescription>
                      </div>
                  </div>
                  <Badge variant="outline" className="text-[var(--public-accent-strong)] border-[var(--public-accent)]/20 bg-[var(--public-accent)]/10">Waitlist</Badge>
              </div>
          </CardHeader>
          <CardContent>
             <Button variant="outline" asChild className="w-full public-button">
                 <Link href="/dashboard/ai/settings">Join Waitlist</Link>
             </Button>
          </CardContent>
        </Card>

        {/* Nodebase Eyes (CCTV) */}
        <Card className="public-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <CardHeader>
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w0.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      </div>
                      <div>
                          <CardTitle className="text-[var(--public-ink)]">Nodebase Eyes</CardTitle>
                          <CardDescription className="text-[var(--public-ink)]/50">CCTV & Vision Intelligence</CardDescription>
                      </div>
                  </div>
                  <Badge variant="outline" className="text-[var(--public-accent-strong)] border-[var(--public-accent)]/20 bg-[var(--public-accent)]/10">Waitlist</Badge>
              </div>
          </CardHeader>
          <CardContent>
             <Button variant="outline" asChild className="w-full public-button">
                 <Link href="/dashboard/ai/settings">Join Waitlist</Link>
             </Button>
          </CardContent>
        </Card>
`;

content = content.replace(
  '{/* Instagram Integration */}',
  `${upcomingCards}\n\n        {/* Instagram Integration */}`
);

// Standardize the Google & IG panels
content = content.replace(
  /<Card className="bg-\[var\(--color-dashboard-surface\)\] border-\[var\(--public-line\)\]">/g,
  '<Card className="public-panel">'
);

fs.writeFileSync(pageFile, content);
console.log('Fixed double WAHA and unified panels.');
