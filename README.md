# WebChat: Disable SendBox When Suggestions Are Shown

A sample demonstrating how to disable the text input in BotFramework WebChat when suggested actions are displayed, forcing users to select from the options rather than type free-form text.

## The Problem

When a bot sends suggested actions (quick reply buttons), you may want to:
- **Disable free-form typing** - Force users to click a suggestion
- **Keep suggestions clickable** - The buttons must still work
- **Show visual feedback** - Indicate the input is disabled

WebChat doesn't provide this out of the box, and naive solutions have pitfalls:
- Setting `input.disabled = true` causes WebChat to also disable the suggestion buttons
- Targeting internal CSS classes like `webchat__send-box` is fragile (they can change between versions)

## The Solution

This sample uses the **recompose pattern** - WebChat's official approach for building custom UIs.

### What is Recomposing?

Instead of using WebChat's default `<ReactWebChat>` component, we use its building blocks:

```
Composer                     ← Provides WebChat context (Direct Line, styles, etc.)
  └── AccessKeySinkSurface   ← Handles keyboard shortcuts
        └── BasicToaster     ← Shows notifications
        └── BasicTranscript  ← Displays message history
        └── BasicSendBox     ← Input field + suggested actions
```

By composing these ourselves, we can **wrap any component** with our own elements and logic.

### Our Approach

We wrap `BasicSendBox` in our own `<div>` and control its state:

```javascript
function RecomposedChat() {
  // Hook tells us when suggestions are present
  var suggestedActions = useSuggestedActions()[0];
  var hasSuggestions = suggestedActions && suggestedActions.length > 0;

  return createElement('div', {
    // Our own class - we control this, not WebChat internals
    className: hasSuggestions ? 'sendbox-wrapper--disabled' : ''
  },
    createElement(BasicSendBox, null)  // WebChat's component, unchanged
  );
}
```

Then CSS targets the input using a **stable public attribute** (not internal classes):

```css
/* data-id is a public, stable attribute - safe to use */
.sendbox-wrapper--disabled [data-id="webchat-sendbox-input"] {
  opacity: 0.5;
  caret-color: transparent;  /* Hide cursor */
  pointer-events: none;      /* Block mouse clicks */
}
```

And JavaScript blocks keyboard input (CSS `pointer-events` doesn't block keyboard):

```javascript
useEffect(function() {
  if (hasSuggestions) {
    input.addEventListener('keydown', blockInput, true);
    input.blur();  // Remove focus to hide cursor
  }
  return function() {
    input.removeEventListener('keydown', blockInput, true);
  };
}, [hasSuggestions]);
```

### Why This Approach?

| Approach | Problem |
|----------|---------|
| `input.disabled = true` | WebChat propagates disabled state to suggestion buttons |
| Target `.webchat__send-box` | Internal class names can change between versions |
| CSS `pointer-events: none` on wrapper | Blocks suggestions too |
| **Our approach: wrap + data-id** | ✅ Stable, suggestions stay clickable |

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

## Using with a Real Agent

This sample uses a **mock Direct Line** for demonstration. Replace it with a real connection for production use.

```javascript
// Replace createMockDirectLine() with:
var directLine = window.WebChat.createDirectLine({
  token: 'YOUR_DIRECT_LINE_TOKEN'
});

// Then pass to Composer:
createElement(Composer, { directLine: directLine, styleOptions: styleOptions },
  createElement(RecomposedChat)
);
```

For Copilot Studio agents, see [Customize the default canvas](https://learn.microsoft.com/en-us/microsoft-copilot-studio/customize-default-canvas?tabs=webApp) to get your token endpoint.

## WebChat Recompose Reference

### Available Components

```javascript
var Components = window.WebChat.Components;

// Core layout
Components.Composer              // Context provider (required)
Components.AccessKeySinkSurface  // Keyboard navigation

// UI building blocks
Components.BasicToaster          // Notifications
Components.BasicTranscript       // Message list
Components.BasicConnectivityStatus  // Connection status
Components.BasicSendBox          // Input + suggestions
```

### Available Hooks

```javascript
var hooks = window.WebChat.hooks;

hooks.useSuggestedActions()  // Get current suggested actions
hooks.useActivities()        // Get all activities
hooks.useSendMessage()       // Send a message
hooks.usePostActivity()      // Post any activity
// ... many more
```

### Official Samples

See [WebChat recompose samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.recomposing-ui) for more examples.

## Files

| File | Description |
|------|-------------|
| `index.html` | Complete sample - single file, no build required |
| `test.spec.js` | Playwright tests for core functionality |
| `edge-cases.spec.js` | Playwright tests for edge cases (blur, keyboard blocking) |

## License

MIT
