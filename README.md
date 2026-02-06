# WebChat SendBox Disable Sample

A static HTML demo showing how to disable the WebChat sendbox when suggested actions are present, forcing users to select from options rather than type.

## Features

- **Mock DirectLine** - No real bot needed, all responses simulated
- **Shows enabled/disabled states** - Starts with typing enabled, then disables when suggestions appear
- **Two-level navigation** - Main menu → Sub-options → Final response
- **Single HTML file** - No build tools required

## Demo Flow

1. Bot welcomes user with no suggestions → **Sendbox enabled** (user can type)
2. User types anything → Bot shows menu with suggestions → **Sendbox disabled**
3. User clicks option → Sub-menu appears → **Sendbox still disabled**
4. User makes final selection → Response without suggestions → **Sendbox briefly enabled**
5. Bot shows menu again → **Sendbox disabled**

## How It Works

Uses WebChat's `createStore` middleware to intercept activities:

```javascript
WebChat.createStore({}, function(store) {
  return function(next) {
    return function(action) {
      if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        var activity = action.payload.activity;
        if (activity.suggestedActions?.actions?.length > 0) {
          // Add CSS class to disable sendbox
          webchatEl.classList.add('sendbox-disabled');
        } else {
          webchatEl.classList.remove('sendbox-disabled');
        }
      }
      return next(action);
    };
  };
});
```

CSS disables input via pointer-events and opacity:

```css
#webchat.sendbox-disabled [class*="send-box"] input {
  pointer-events: none !important;
  opacity: 0.5 !important;
}
```

## Usage

```bash
# Open directly
open index.html

# Or serve locally
npx serve . -p 5174
```

Then open http://localhost:5174

## Testing

```bash
npm install -D playwright @playwright/test
npx playwright test
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | Complete sample with mock DirectLine and store middleware |
| `test.spec.js` | Playwright tests |

## License

MIT
