# TG-IO

<p align="right">
  is new way to create powerful bots quickly and handly
</p>

### ⚠️CAUTION

Library is still under development

## Installation

```shell
npm install tg-io
```

## Basic usage

```typescript
import { Tg } from "tg-io";

const tg = new Tg(TOKEN);
tg.updates.hearCommand(/^\/echo (.+)/i, ctx => ctx.replyMessage(ctx.match[1]));

async function run() {
  await tg.startPolling();
}
run().catch(console.error);
```

## Flexible way to interract with buttons

```typescript
import { TgKeyboard } from "tg-io";

tg.updates.hearCommand(/^\/i wanna some buttons/i, async ctx => {
  let keyboard = tg.createKeyboard();
  let reqBtn = new TgKeyboard.Button("and me too..", "location");
  keyboard
    .createButton("click me NOW!")
    .add(reqBtn)
    .setOneTime()
    .setSelective("YES");

  return await ctx.replyMessage(keyboard.build());
});
tg.updates.hearCommand(/^\/i wanna some INLINE buttons/i, async ctx => {
  let keyboard = tg.createInlineKeyboard();
  keyboard
    .createButton({ text: "im a cb?", payload: "yes." })
    .createButton({
      text: "or maybe.. a link??",
      url: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
    })
    .createButton({ text: "yep!", switchCurrentChatQuery: "nope..." });

  return await ctx.replyMessage({
    text: "ive some buttons :) ",
    ...keyboard.build(),
  });
});
```

## Expandable basic entities

```typescript
import { TgContext } from "tg-io";
class CustomMessageContext extends TgContext.Message {
  public isAdmin = () => this.sender.id === 1;
  public answer = (text: string) =>
    this.sendMessage(`${this.sender.appeal}, ${text}`);
}

tg.updates.setContext("message", CustomMessageContext);
tg.updates.hearCommand<CustomMessageContext>("/durovtest", ctx =>
  ctx.answer("u are... " + ctx.isAdmin ? "durov!" : "nobody..")
);
```

## New elegant way to handle your commands

```typescript
import { TgContext, TgCommand, TgEvent, TgEntity, TgUse } from "tg-io";

class UpdateHandler {
  public botname: string;

  @TgUse()
  public log(upd: TgEntity.IUpdateResult, next: () => void) {
    console.log(`received upd #${upd.update_id}`);
    next();
  }

  @TgEvent("photo")
  public async thankForPic(ctx: TgContext.Message, next: () => void) {
    await ctx.replyMessage("thx for a pic!");
    next();
  }

  @TgCommand(/info$/i)
  public sendInfo(ctx: TgContext.Message) {
    return ctx.sendMessage(`hello, i'm ${this.botname}`);
  }
}

let updHandler = new UpdateHandler();
updHandler.botname = "sample bot";
tg.updates.implementDecorators(updHandler);
```

## Describe your commands comfortably

```typescript
import { TgCommand, TgCommandInfo, TgContext } from "tg-io";

tg.commands
  .add("sample", "a sample command")
  .setScope("chat_administrators")
  .add("adm", "a secret command for admins")
  .resetScope()
  .setLanguage("in")
  .add("india", "खैर, आपने अनुवाद क्यों किया?")
  .resetLanguage();

class AdminCommandsHandler {
  constructor(private readonly botname: string) {}
  @TgCommandInfo<AdminCommandsHandler>("ping", h => `get ${h.botname}' ping`)
  @TgCommand(/^\/ping$/)
  public sendPing(ctx: TgContext.Message) {
    // some code here..
  }
}
tg.commands.implementDecorators(new AdminCommandsHandler("sample-bot"));
tg.uploadCommands();
```
