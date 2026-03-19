const fs = require('fs');

// Fix WAHA webhook route
let webhookPath = 'src/app/api/integrations/webhook/whatsapp/route.ts';
let webhookContent = fs.readFileSync(webhookPath, 'utf8');

// Swap guest fetching order
webhookContent = webhookContent.replace(
  `    await supabase.from("messages").insert({
      tenant_id: tenantId,
      direction: "inbound",
      channel: "whatsapp",
      content: text,
      sender_id: sender,
      timestamp: new Date().toISOString(),
      read: false,
    });

    // Check for paused AI
    const { data: existingGuest } = await supabase
      .from("guests")
      .select("ai_paused")
      .eq("phone", sender)
      .eq("tenant_id", tenantId)
      .single();`,
  `    // Get or create guest
    let guestId = null;
    let aiPaused = false;
    let { data: existingGuest } = await supabase
      .from("guests")
      .select("id, ai_paused")
      .eq("phone", sender)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (existingGuest) {
      guestId = existingGuest.id;
      aiPaused = existingGuest.ai_paused;
    } else {
      const { data: newGuest } = await supabase.from("guests").insert({
        tenant_id: tenantId,
        name: sender,
        phone: sender,
        channel: "whatsapp"
      }).select("id").single();
      guestId = newGuest?.id;
    }

    await supabase.from("messages").insert({
      tenant_id: tenantId,
      guest_id: guestId,
      direction: "inbound",
      role: "user",
      channel: "whatsapp",
      content: text,
      timestamp: new Date().toISOString(),
      is_read: false,
    });`
);

// Fix outbound AI reply insert
webhookContent = webhookContent.replace(
  `    await supabase.from("messages").insert({
      tenant_id: tenantId,
      direction: "outbound",
      channel: "whatsapp",
      content: aiReply,
      sender_id: "ai_assistant",
      timestamp: new Date().toISOString(),
      read: true,
    });`,
  `    await supabase.from("messages").insert({
      tenant_id: tenantId,
      guest_id: guestId,
      direction: "outbound",
      role: "assistant",
      channel: "whatsapp",
      content: aiReply,
      timestamp: new Date().toISOString(),
      is_read: true,
    });`
);

// Fix "existingGuest?.ai_paused"
webhookContent = webhookContent.replace(
  `    if (existingGuest?.ai_paused) {`,
  `    if (aiPaused) {`
);

fs.writeFileSync(webhookPath, webhookContent);
console.log('Fixed Webhook schema mismatches.');

// Fix manual message action route
let manualMessagePath = 'src/app/actions/inbox.ts';
let manualContent = fs.readFileSync(manualMessagePath, 'utf8');
manualContent = manualContent.replace(
  `    direction: 'outbound',
    channel: 'whatsapp',
    content: text,
    sender_id: 'human_manager',
    timestamp: new Date().toISOString(),
    read: true`,
  `    direction: 'outbound',
    role: 'host',
    channel: 'whatsapp',
    content: text,
    timestamp: new Date().toISOString(),
    is_read: true`
);
fs.writeFileSync(manualMessagePath, manualContent);
console.log('Fixed manual action schema mismatches.');

