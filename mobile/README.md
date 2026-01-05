# Rattle Mobile App

This is the React Native mobile version of Rattle, converted from the web app.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Conversion Status

- ✅ Project structure
- ✅ Navigation setup
- ✅ Storage adapter
- ⏳ Component conversion (in progress)
- ⏳ Service layer adaptation
- ⏳ UI component library

## Key Differences from Web Version

1. **Navigation**: Drawer menu instead of sidebar
2. **Storage**: AsyncStorage instead of localStorage
3. **Styling**: StyleSheet instead of Tailwind CSS
4. **Components**: React Native components instead of HTML elements

## Menu Structure

The mobile menu is optimized for touch interaction:
- Drawer navigation from left
- Icons and labels for each section
- Grouped by functionality


