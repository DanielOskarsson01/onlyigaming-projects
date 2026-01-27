# Tasker Voice Capture Setup

## Step 1: Install Tasker
- Google Play Store → Search "Tasker" → Purchase (~$3.50)

## Step 2: Import the Task
1. Open Tasker
2. Long-press on "Tasks" tab at bottom
3. Select "Import Task"
4. Navigate to: `Dropbox/Projects/inbox/PA_Voice_Capture.tsk.xml`
5. Tap to import

## Step 3: Check Dropbox Folder Path
The task writes to: `Dropbox/Projects/inbox/`

If your Dropbox folder is in a different location:
1. Open the imported task
2. Tap action 5 (Write File)
3. Update the path to match your Dropbox location

Common paths:
- `/storage/emulated/0/Dropbox/Projects/inbox/`
- `/sdcard/Dropbox/Projects/inbox/`

## Step 4: Create Home Screen Widget
1. Long-press on home screen
2. Add Widget → Tasker → Task Shortcut (1x1)
3. Select "PA Voice Capture"
4. Choose an icon (microphone recommended)

## Step 5: Grant Permissions
First run will ask for:
- Microphone access
- Storage access

Approve both.

## How to Use
1. Tap widget on home screen
2. Speak your task, idea, or question
3. Tap done (or pause speaking for 2 seconds)
4. File auto-saves to inbox

## What Gets Created
Each recording creates a file like:
```
2026-01-25-14.30-voice.txt
```

Containing your transcribed speech.

## Troubleshooting

**"File not saving"**
- Check Dropbox folder path in Write File action
- Ensure Dropbox app is syncing

**"Transcription not working"**
- Ensure internet connection (Google transcription needs it)
- Try enabling "Google Voice Typing" in Android keyboard settings

**"Widget not appearing"**
- Restart Tasker
- Ensure Tasker has "Draw over other apps" permission
