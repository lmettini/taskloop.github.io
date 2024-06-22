# TaskLoop Web App

## Description

TaskLoop allows users to input a list of tasks and set a time interval. When started, tasks are cycled through in a round-robin fashion, with each task given priority for the specified interval. An alarm sounds and the next task is announced when the time is up. The app continues to run in the background, even if the device is locked.

## Features

- **Add Tasks**: Allows users to add multiple tasks.
- **Delete Tasks**: Allows users to delete tasks from the list.
- **Select Time Interval**: Users can select from predefined intervals.
- **Round-Robin Execution**: Tasks are iterated in a round-robin manner based on the interval.
- **Notifications**: An alarm and visual notification occur at the end of each interval, announcing the next task.
- **Background Functionality**: The app continues to run and notify even when in the background or the device is locked.
- **Pause and Reset**: Users can pause the task cycle and reset the app to its initial state.
- **Local Storage**: Tasks and selected interval are saved between sessions.
- **Lock Screen Widget (iOS)**: Shows time remaining and current task on the lock screen.

## Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari).
- Permission to show notifications.

## Installation

1. Clone the repository to your local machine.
   
   `git clone https://github.com/your-username/taskloop.git`

2. Navigate to the project directory.
   
   `cd taskloop`

## Usage

1. Open `index.html` in your web browser.
2. On the main screen:
   - Enter a task and click "Add Task".
   - Select the desired time interval.
   - Click "Start" to begin the task cycle.
3. On the task runner screen:
   - The current task and remaining time are displayed.
   - Pause the task cycle with the "Pause" button.
   - Reset the app to its initial state with the "Reset" button.

## Project Files

- `index.html`: Main page with the task input form and time interval selector.
- `styles.css`: CSS styles for the page.
- `script.js`: Application logic.
- `service-worker.js`: Service Worker for handling background tasks and notifications.

## Technical Details

### HTML

- Contains two main sections:
  - **Task Input**: For entering tasks and selecting the time interval.
  - **Task Runner**: Displays the current task and countdown timer.

### CSS

- Basic styles for a clean, user-friendly interface.
- Responsive design for mobile devices.

### JavaScript

- **Main Functions**:
  - `addTask()`: Adds tasks to the list.
  - `selectInterval()`: Selects the desired time interval.
  - `startRoundRobin()`: Starts the round-robin task cycle.
  - `runTask()`: Manages the execution of a task and sets up the timer.
  - `updateCountdown()`: Updates the timer every second and switches to the next task when time is up.
  - `pauseRoundRobin()`: Pauses or resumes the task cycle.
  - `resetRoundRobin()`: Resets the app to its initial state while keeping tasks.
  - `playSound()`: Plays an alarm sound when the timer is up.
  - `speakText()`: Reads out the next task in English.
- **Service Worker**:
  - Handles background notifications to ensure the app continues to function even when in the background or the device is locked.

## Permissions

- The app requests permission to show notifications. Ensure to grant these permissions for notifications to work correctly.

## Contributions

Contributions are welcome! If you have improvements or suggestions, please create an "issue" or send a "pull request".

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
