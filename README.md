# GymTracker

GymTracker is a web-based application, developed as part of a university project, that uses pre-trained TensorFlow.js pose detection models to track your movements and help optimize your workouts.

During the development and testing phase, prototype force plates were also integrated to monitor force distribution during selected exercises. However, the application is fully functional without the use of force plates.

## Showcase
![](https://github.com/Marcus-Gustafsson/GymTracker/blob/master/Photos_XE12nkBTzK.gif)

## Demo
You can run a live demo at:  
`localhost:1234/?model=movenet`

## Getting Started

### Prerequisites
Before you start, make sure the following software is installed on your computer:
- [Node.js](https://nodejs.org/en/download)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
- [Python](https://www.python.org/downloads/)

To check if you already have these installed, run the following commands in your Terminal/Command Prompt:
```bash
node -v
yarn -v
python -V
```

Installation
Follow these steps to set up and run the GymTracker application locally:

### 1. Clone the repository:

```bash
git clone https://github.com/your-username/GymTracker.git
cd GymTracker/GymTracker_app/Application
```

### 2. Clear the existing cache and modules (if any):
```bash
rm -rf .cache dist node_modules
```

### 3. Build dependencies:
```bash
yarn build-dep
```

### 4. Install all project dependencies:
```bash
yarn
```

### 5. Start the demo server:
```bash
yarn watch
```

The application will be running at http://localhost:1234/?model=movenet.

### Troubleshooting
macOS
If you encounter issues during installation, try removing the following files from the Application folder:

```bash
rm yarn.lock package-lock.json node_modules
```

### Windows/Linux
For Windows or Linux users, you may need to install Visual Studio with the "Desktop development with C++" workload enabled. 
You can follow the instructions here: https://learn.microsoft.com/en-us/cpp/build/vscpp-step-0-installation?view=msvc-170

