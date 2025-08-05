# Access Eash Part Individually:

```javascript
import {CUSTOMFIELDS} from 'relative/path/to/lambdatt-ui-customfields'

// Components:
CUSTOMFIELDS.COMPONENTS
// Pages:
CUSTOMFIELDS.PAGES
```

# Auto-Wire:

To auto-wire the Custom-Fields module, add the following to your `/src/boot/customfields-boot.js`:

```javascript
import {CUSTOMFIELDS} from 'relative/path/to/lambdatt-ui-customfields'

export default boot(({ app }) => {
    CUSTOMFIELDS.autoWire(app);
})
```