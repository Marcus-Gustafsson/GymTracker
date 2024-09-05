# GymTracker

GymTracker is a web-based application that utilizes pre-trained TensorFlow.js pose detection models to track your movements and help you optimize your workouts. Get inspired by what AI and pose detection can do to improve your gym sessions!

## Features
- **Real-time pose detection**: Leverage the power of machine learning to monitor and analyze your gym exercises.
- **Compatible with major browsers**: Runs locally on your machine using Node.js and Yarn.
- **Customizable models**: Use different TensorFlow.js models to explore pose detection capabilities.

## Showcase

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
Build dependencies:
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
For Windows or Linux users, you may need to install Visual Studio with the "Desktop development with C++" workload enabled. You can follow the instructions here: Visual Studio C++ installation guide.
https://learn.microsoft.com/en-us/cpp/build/vscpp-step-0-installation?view=msvc-170

