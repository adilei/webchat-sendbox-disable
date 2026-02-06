# WebChat: Disable SendBox When Suggestions Are Shown

A sample demonstrating how to disable the text input in BotFramework WebChat when suggested actions are displayed, forcing users to select from the options rather than type free-form text.

## The Problem

When a bot sends suggested actions (quick reply buttons), you may want to:
- **Disable free-form typing** - Force users to click a suggestion
- **Keep suggestions clickable** - The buttons must still work
- **Show visual feedback** - Indicate the input is disabled

WebChat doesn't provide this out of the box. Simply setting `disabled` on the input element causes WebChat to also disable the suggestion buttons.

## The Solution

This sample uses the **recompose pattern** to wrap `BasicSendBox` in a custom element, then:

1. **Detects suggestions** using the `useSuggestedActions()` hook
2. **Blocks keyboard input** via event listeners (not `disabled` attribute)
3. **Hides the cursor** with CSS `caret-color: transparent`
4. **Blocks mouse clicks on input** with CSS `pointer-events: none`
5. **Blurs the input** to remove focus when suggestions appear

```javascript
// Key technique: wrap BasicSendBox, detect suggestions, conditionally disable
function RecomposedChat() {
  var suggestedActions = useSuggestedActions()[0];
  var hasSuggestions = suggestedActions && suggestedActions.length > 0;

  // ... event listeners to block keyboard input ...

  return createElement('div', {
    className: hasSuggestions ? 'sendbox-wrapper--disabled' : ''
  },
    createElement(BasicSendBox, null)
  );
}
```

## Demo Flow

1. Bot welcomes user (no suggestions) → **SendBox enabled** (user can type)
2. User types anything → Bot shows menu → **SendBox disabled** (must click)
3. User clicks option → Sub-menu appears → **SendBox still disabled**
4. User makes final selection → Response shown → Main menu returns

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
open http://localhost:5174

# Run tests
npm test
```

## Using with a Real Bot

This sample uses a **mock Direct Line** for demonstration. Replace it with a real connection for production use.

### Option 1: Direct Line Token

```javascript
// Replace createMockDirectLine() with:
var directLine = window.WebChat.createDirectLine({
  token: 'YOUR_DIRECT_LINE_TOKEN'
});
```

Get a token from your bot's Direct Line channel in Azure Portal, or use a token server.

### Option 2: Copilot Studio

For Microsoft Copilot Studio bots, you can:
- Use the token endpoint from Copilot Studio
- Or use the [M365 Agents SDK](https://github.com/AhmedBelkadi/M365AgentsSDK-Streaming-WebChat) for streaming support

## Key Concepts

### Recompose Pattern

WebChat's recompose pattern lets you build custom UIs using Basic* components:

```
Composer (provides WebChat context)
  └── AccessKeySinkSurface (keyboard navigation)
        └── BasicToaster (notifications)
        └── BasicTranscript (message list)
        └── BasicConnectivityStatus (connection status)
        └── BasicSendBox (input + suggestions)
```

See [official WebChat recompose samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.recomposing-ui).

### Why Not Just Disable the Input?

Setting `input.disabled = true` causes WebChat to propagate the disabled state to suggestion buttons. This sample avoids that by:

- Using CSS `pointer-events: none` on the input only
- Blocking keyboard events via JavaScript event listeners
- Never setting the `disabled` attribute

### Suggested Actions Format

Suggested actions are sent via the `suggestedActions` property on bot activities:

```javascript
{
  type: 'message',
  text: 'Choose an option:',
  suggestedActions: {
    actions: [
      { type: 'imBack', title: 'Option 1', value: 'option1' },
      { type: 'imBack', title: 'Option 2', value: 'option2' }
    ]
  }
}
```

## Files

| File | Description |
|------|-------------|
| `index.html` | Complete sample - single file, no build required |
| `test.spec.js` | Playwright tests for core functionality |
| `edge-cases.spec.js` | Playwright tests for edge cases (blur, keyboard blocking) |

## License

MIT
