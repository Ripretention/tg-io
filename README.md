# TG-IO
<p align="right">
  is new way to create powerful bots quickly and handly
</p>

### ⚠️CAUTION
Library is still under development

## Basic usage
```typescript
import { Tg } from "tg-io";

const tg = new Tg(TOKEN);
tg.updates.hearCommand(/^\/echo (.+)/i, ctx => 
  ctx.replyMessage(ctx.match[1])
);

async function run() {
  await tg.startPolling();
}
run().catch(console.error);
```
