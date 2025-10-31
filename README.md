# Recall

Recall is a lightweight, local-first contact memory app built with Expo Router and TypeScript. Capture quick notes about the people you meet, keep them synced to on-device SQLite, and optionally link an entry to an address book contact.

## Getting started

```bash
npx create-expo-app recall --template
cd recall
npx expo install expo-router expo-sqlite expo-contacts
yarn add react-native-voice
```

Copy the source in this repository into your project directory, then run:

```bash
# Start Metro
yarn dev

# Run on iOS simulator (requires Xcode)
yarn ios

# Run parser unit tests
yarn test
```

### Speech recognition

The microphone button uses [`react-native-voice`](https://github.com/react-native-voice/voice), which requires a development build when running on device. Use Expo Dev Client or EAS development builds:

```bash
npx expo prebuild --platform ios
npx eas build --profile development --platform ios
```

Ensure the generated iOS project includes the `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription` entries from `app.json`.

### Database

The app stores entries in `expo-sqlite` with the following schema:

| Column     | Type    | Notes                         |
| ---------- | ------- | ----------------------------- |
| id         | integer | Primary key, autoincrement   |
| name       | text    | Required                      |
| note       | text    | Optional note text            |
| createdAt  | text    | ISO timestamp                 |
| contactId  | text    | Optional device contact ID    |

### Known limitations

- Speech capture is only available on iOS; Android devices fall back to manual input.
- Contacts are read-only. Linking requires address book permission.
- There is no sync or backup; data lives in local SQLite only.
