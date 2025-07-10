# Health Integration Setup

This guide will help you set up the health integration feature for the Ladderhive Fitness app.

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Supabase project set up
- iOS or Android development environment (for testing on physical devices)

## Installation

1. Install the required dependencies:

```bash
npm install @capacitor/health date-fns
```

2. Sync Capacitor plugins:

```bash
npx cap sync
```

## Database Setup

1. Apply the database migration to create the required tables and policies:

```sql
-- Run this in your Supabase SQL editor
\i supabase/migrations/20240609220000_create_health_data.sql
```

## iOS Setup

1. Open your iOS project in Xcode:

```bash
npx cap open ios
```

2. In Xcode:
   - Select your project in the navigator
   - Select your target
   - Go to "Signing & Capabilities"
   - Click "+ Capability"
   - Add "HealthKit"

3. Add these keys to your `Info.plist`:

```xml
<key>NSHealthShareUsageDescription</key>
<string>We need access to your health data to track your fitness progress.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>We need permission to update your health data.</string>
```

## Android Setup

1. Update `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest ...>
  <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_HEALTH" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
  
  <application ...>
    <!-- Other application elements -->
    
    <!-- Add this inside <application> -->
    <meta-data
      android:name="com.google.android.gms.version"
      android:value="@integer/google_play_services_version" />
  </application>
</manifest>
```

2. Update `android/app/build.gradle`:

gradle
android {
  defaultConfig {
    // Add these lines
    multiDexEnabled true
    manifestPlaceholders = [
      appAuthRedirectScheme: 'YOUR_APP_SCHEME' // e.g., com.yourapp.health
    ]
  }
}

dependencies {
  // Add these dependencies
  implementation 'com.google.android.gms:play-services-fitness:21.1.0'
  implementation 'com.google.android.gms:play-services-auth:20.7.0'
  implementation 'androidx.health.connect:connect-client:1.0.0-alpha11'
}


## Usage

1. Navigate to the Settings page in the app
2. Click on "Connect Health App"
3. Grant the necessary permissions
4. Click "Sync Now" to import your health data

## Testing

1. Test on a physical device (simulator won't work for health data)
2. Verify data is being saved to the `health_data` table in Supabase
3. Test different permission scenarios
4. Verify sync works after initial setup

## Troubleshooting

### iOS Issues
- Make sure you're testing on a physical device
- Check that HealthKit is enabled in Xcode
- Verify permissions in Settings > Privacy > Health

### Android Issues
- Make sure Google Play Services is up to date
- Check that you've accepted all runtime permissions
- Verify Google Fit is installed and set up on the test device

### General Issues
- Check console logs for errors
- Verify Supabase RLS policies
- Ensure your Supabase client is properly configured

## Implementation Details

### Database Schema

The `health_data` table stores all health-related data with the following structure:

```
health_data
├── id (uuid, primary key)
├── user_id (uuid, foreign key to auth.users)
├── data_type (text, e.g., 'steps', 'workouts')
├── value (numeric, the actual value)
├── unit (text, unit of measurement)
├── start_date (timestamptz, when the data point starts)
├── end_date (timestamptz, when the data point ends)
├── source (text, source of the data)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Security

- Row Level Security (RLS) is enabled on the `health_data` table
- Users can only access their own health data
- All operations are audited with timestamps

### Performance

- Indexes are created on frequently queried columns
- Data is paginated when displayed
- Real-time updates are supported via Supabase subscriptions
