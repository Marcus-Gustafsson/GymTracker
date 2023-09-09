/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
// Import necessary libraries/modules
import * as posedetection from '@tensorflow-models/pose-detection'; // Import TensorFlow pose detection library
import * as scatter from 'scatter-gl'; // Import scatter plot library for 3D rendering

// Import configuration parameters from the 'params.js' file
import * as params from './params';

// Define anchor points for the pose point cloud in 3D space
const ANCHOR_POINTS = [[0, 0, 0], [0, 1, 0], [-1, 0, 0], [-1, -1, 0]];

// Define a color palette for rendering keypoints and skeleton
const COLOR_PALETTE = [
  // List of color codes for different body parts
  // Each color corresponds to a specific part of the body
];

// Define a class called RendererCanvas2d for rendering on a 2D canvas
export class RendererCanvas2d {
  constructor(canvas) {
    // Initialize canvas and scatterGL for rendering
    this.ctx = canvas.getContext('2d'); // 2D canvas context
    this.scatterGLEl = document.querySelector('#scatter-gl-container'); // DOM element for 3D rendering
    this.scatterGL = new scatter.ScatterGL(this.scatterGLEl, {
      'rotateOnStart': true, // Rotate the 3D view on start
      'selectEnabled': false, // Disable selection of 3D points
      'styles': {polyline: {defaultOpacity: 1, deselectedOpacity: 1}} // Style for 3D polylines
    });
    this.scatterGLHasInitialized = false; // Flag to track 3D rendering initialization
    this.videoWidth = canvas.width; // Width of the video frame
    this.videoHeight = canvas.height; // Height of the video frame

    // Flip the video horizontally for proper rendering
    this.flip(this.videoWidth, this.videoHeight);
  }

  // Helper function to flip the video horizontally
  flip(videoWidth, videoHeight) {
    this.ctx.translate(videoWidth, 0); // Translate the canvas context to the right edge
    this.ctx.scale(-1, 1); // Scale the canvas to flip horizontally

    // Adjust the size of the scatterGL container to match video dimensions
    this.scatterGLEl.style = `width: ${videoWidth}px; height: ${videoHeight}px;`;
    this.scatterGL.resize();

    // Show or hide the 3D rendering based on configuration
    this.scatterGLEl.style.display = params.STATE.modelConfig.render3D ? 'inline-block' : 'none';
  }

  // Draw function to render video, keypoints, and skeleton
  draw(rendererParams) {
    const [video, poses, isModelChanged] = rendererParams;
    this.drawCtx(video); // Draw the video frame on the canvas

    // Ensure that the model hasn't changed before rendering
    if (poses && poses.length > 0 && !isModelChanged) {
      this.drawResults(poses);
    }
  }

  // Draw the video frame on the canvas
  drawCtx(video) {
    this.ctx.drawImage(video, 0, 0, this.videoWidth, this.videoHeight);
  }

  // Clear the canvas
  clearCtx() {
    this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);
  }

  // Draw keypoints and skeleton for multiple poses
  drawResults(poses) {
    for (const pose of poses) {
      this.drawResult(pose);
    }
  }

  // Draw keypoints and skeleton for a single pose
  drawResult(pose) {
    if (pose.keypoints != null) {
      this.drawKeypoints(pose.keypoints); // Draw keypoints on the video frame
      this.drawSkeleton(pose.keypoints, pose.id); // Draw the skeleton of the body
    }
    if (pose.keypoints3D != null && params.STATE.modelConfig.render3D) {
      this.drawKeypoints3D(pose.keypoints3D); // Draw 3D keypoints if 3D rendering is enabled
    }
  }

  // Draw keypoints on the video frame
  drawKeypoints(keypoints) {
    const keypointInd =
      posedetection.util.getKeypointIndexBySide(params.STATE.model);
    this.ctx.fillStyle = 'Red'; // Set the default color for keypoints
    this.ctx.strokeStyle = 'White'; // Set the default color for keypoint outlines
    this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

    // Define the indices of keypoints that you want to draw
    const keypointIndicesLeftArm = [5, 7, 9];
    const keypointCoordinatesLeftArm = keypointIndicesLeftArm.map(i => ({
      x: keypoints[i].x,
      y: keypoints[i].y
    }));

    // Define the indices of keypoints that you want to draw
    const keypointIndicesRightArm = [6, 8, 10];
    const keypointCoordinatesRightArm = keypointIndicesRightArm.map(i => ({
      x: keypoints[i].x,
      y: keypoints[i].y
    }));

    // Define the indices of keypoints that you want to draw
    const keypointIndicesLeftKneeHipShoulder = [5, 11, 13];
    const keypointCoordinatesLeftKneeHipShoulder = keypointIndicesLeftKneeHipShoulder
    .map(i => ({
      x: keypoints[i].x,
      y: keypoints[i].y
    }));

    // Define the indices of keypoints that you want to draw
    const keypointIndicesRightKneeHipShoulder = [5, 11, 13];
    const keypointCoordinatesRightKneeHipShoulder = keypointIndicesRightKneeHipShoulder
    .map(i => ({
      x: keypoints[i].x,
      y: keypoints[i].y
    }));

    for (const i of keypointInd.middle) {
      const keypoint = keypoints[i];
      this.drawKeypoint(keypoint);

      // Print keypoint values to the console (optional)
      //console.log(`Keypoint ${i}: x=${keypoint.x}, y=${keypoint.y}, score=${keypoint.score}`);
    }

    this.ctx.fillStyle = 'Green'; // Set color for left keypoints
    for (const i of keypointInd.left) {
      const keypoint = keypoints[i];
      this.drawKeypoint(keypoint);

      //DBG: Print keypoint values to the console
      //console.log(`Keypoint ${i}: x=${keypoint.x}, y=${keypoint.y}, score=${keypoint.score}`);
    }

    this.ctx.fillStyle = 'Orange'; // Set color for right keypoints
    for (const i of keypointInd.right) {
      const keypoint = keypoints[i];
      this.drawKeypoint(keypoint);

      //DBG: Print keypoint values to the console
      //console.log(`Keypoint ${i}: x=${keypoint.x}, y=${keypoint.y}, score=${keypoint.score}`);
    }

    //Should be used to keep angle code dry, but crashes when used.//
    function updateAngleAndDisplay(keypointCoordinates, elementId) {
      if (keypointCoordinates.length === 3) {
        const angle = this.calculateAngle(keypointCoordinates[0], keypointCoordinates[1], keypointCoordinates[2]);
        const angleValueElement = document.getElementById(elementId);
        angleValueElement.textContent = angle.toFixed(2);
      }
    }


    if (keypointCoordinatesLeftArm.length === 3) {
      const angle = this.calculateAngle(keypointCoordinatesLeftArm[0], keypointCoordinatesLeftArm[1], keypointCoordinatesLeftArm[2]);
      // Update the angle value in the HTML element
      const angleValueElement = document.getElementById('angle-value-left-arm');
      angleValueElement.textContent = angle.toFixed(2); // Display angle with 2 decimal places
    }
    if (keypointCoordinatesRightArm.length === 3) {
      const angle = this.calculateAngle(keypointCoordinatesRightArm[0], keypointCoordinatesRightArm[1], keypointCoordinatesRightArm[2]);
      // Update the angle value in the HTML element
      const angleValueElement = document.getElementById('angle-value-right-arm');
      angleValueElement.textContent = angle.toFixed(2); // Display angle with 2 decimal places
    }
    if (keypointCoordinatesLeftKneeHipShoulder.length === 3) {
      const angle = this.calculateAngle(keypointCoordinatesLeftKneeHipShoulder[0], keypointCoordinatesLeftKneeHipShoulder[1], keypointCoordinatesLeftKneeHipShoulder[2]);
      // Update the angle value in the HTML element
      const angleValueElement = document.getElementById('angle-value-left-knee-hip-shoulder');
      angleValueElement.textContent = angle.toFixed(2); // Display angle with 2 decimal places
    }
    if (keypointCoordinatesRightKneeHipShoulder.length === 3) {
      const angle = this.calculateAngle(keypointCoordinatesRightKneeHipShoulder[0], keypointCoordinatesRightKneeHipShoulder[1], keypointCoordinatesRightKneeHipShoulder[2]);
      // Update the angle value in the HTML element
      const angleValueElement = document.getElementById('angle-value-right-knee-hip-shoulder');
      angleValueElement.textContent = angle.toFixed(2); // Display angle with 2 decimal places
    }
  }

  // Calculate the angle between three keypoints
  calculateAngle(pointA, pointB, pointC) {
    // Calculate vectors from pointA to pointB and pointB to pointC
    const vectorAB = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
    const vectorBC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };
    // Calculate dot product of the two vectors
    const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;
    // Calculate magnitudes (lengths) of the vectors
    const magnitudeAB = Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y);
    const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);
    // Calculate cosine of the angle using dot product and magnitudes
    const cosineTheta = dotProduct / (magnitudeAB * magnitudeBC);
    // Calculate angle in radians using inverse cosine (acos)
    const angleRadians = Math.acos(cosineTheta);
    // Convert angle from radians to degrees
    const angleDegrees = (angleRadians * 180) / Math.PI;

    return angleDegrees;
  }

  // Draw a single keypoint on the video frame
  drawKeypoint(keypoint) {
    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

    if (score >= scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, params.DEFAULT_RADIUS, 0, 2 * Math.PI);
      this.ctx.fill(circle); // Fill the keypoint with color
      this.ctx.stroke(circle); // Draw the outline of the keypoint
    }
  }

  // Draw the skeleton of a body on the video frame
drawSkeleton(keypoints, poseId) {
  // Determine color based on poseId
  const color = params.STATE.modelConfig.enableTracking && poseId != null ?
      COLOR_PALETTE[poseId % 20] : // Assign a color based on poseId
      'Red'; // Default color if poseId is not available

  this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

  // Iterate through pairs of keypoints to draw the skeleton
  posedetection.util.getAdjacentPairs(params.STATE.model).forEach(([
    i, j
  ]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;
    const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

    // Check if both keypoints have scores greater than or equal to a threshold
    if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
      // Begin drawing a line on the canvas
      this.ctx.beginPath();
      // Move the drawing position to the coordinates of the first keypoint (kp1)
      this.ctx.moveTo(kp1.x, kp1.y);
      // Draw a line from the current position (kp1) to the coordinates of the second keypoint (kp2)
      this.ctx.lineTo(kp2.x, kp2.y);
      // The line will be drawn between kp1 and kp2 only if both keypoints have scores above the threshold

      // Check if the keypoints being connected are part of the left arm
      if ((i === 5 && j === 7) || (i === 7 && j === 9)) {
        // Calculate the angle between keypoints 5, 7, and 9 (Left shoulder, elbow, wrist)
        const angleLeftArm = this.calculateAngle(keypoints[5], keypoints[7], keypoints[9]);

        // Change the color based on the angle (you can adjust the angle range as needed)
        if (angleLeftArm >= 15 && angleLeftArm <= 150) {
          this.ctx.strokeStyle = 'Green'; // Change the color to green (you can use any color you like)
        } else {
          this.ctx.strokeStyle = color; // Use the default color
        }
      } else if ((i === 6 && j === 8) || (i === 8 && j === 10)) {
        // Calculate the angle between keypoints 6, 8, and 10 (Right shoulder, elbow, wrist)
        const angleRightArm = this.calculateAngle(keypoints[6], keypoints[8], keypoints[10]);

        // Change the color based on the angle (you can adjust the angle range as needed)
        if (angleRightArm >= 15 && angleRightArm <= 150) {
          this.ctx.strokeStyle = 'Green'; // Change the color to green for the right arm
        } else {
          this.ctx.strokeStyle = color; // Use the default color
        }

      } else if ((i === 5 && j === 11) || (i === 11 && j === 13)) {
        // Calculate the angle between keypoints 5, 11, and 13 (leftside shoulder, hip, knee)
        const angleLeftShoulderHipKnee = this.calculateAngle(keypoints[5], keypoints[11], keypoints[13]);

        // Change the color based on the angle (you can adjust the angle range as needed)
        if (angleLeftShoulderHipKnee >= 0 && angleLeftShoulderHipKnee <= 100) {
          this.ctx.strokeStyle = 'Green'; // Change the color to green for angles between 0 and 100 degrees
        } else {
          this.ctx.strokeStyle = color; // Use the default color
        } }

        else if ((i === 6 && j === 12) || (i === 12 && j === 14)) {
          // Calculate the angle between keypoints 6, 12, and 14 (right shoulder, hip, knee)
          const angleRightShoulderHipKnee = this.calculateAngle(keypoints[6], keypoints[12], keypoints[14]);
          console.log(`Angle between keypoints 6, 12, and 14 (Right side shoulder-hip-knee): ${angleRightShoulderHipKnee} degrees`);

          // Change the color based on the angle (you can adjust the angle range as needed)
          if (angleRightShoulderHipKnee >= 0 && angleRightShoulderHipKnee <= 100) {
            this.ctx.strokeStyle = 'Green'; // Change the color to green for angles between 0 and 100 degrees
          } else {
            this.ctx.strokeStyle = color; // Use the default color
          }
        }

        else {
        this.ctx.strokeStyle = color; // Use the default color for other lines
      }

      this.ctx.stroke(); // Draw the line
    }
  });

  // Restore the default color after drawing
  this.ctx.strokeStyle = color;
}

  // Draw 3D keypoints if 3D rendering is enabled
  drawKeypoints3D(keypoints) {
    const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;
    const pointsData =
        keypoints.map(keypoint => ([-keypoint.x, -keypoint.y, -keypoint.z]));

    const dataset =
        new scatter.ScatterGL.Dataset([...pointsData, ...ANCHOR_POINTS]);

    const keypointInd =
        posedetection.util.getKeypointIndexBySide(params.STATE.model);
    this.scatterGL.setPointColorer((i) => {
      if (keypoints[i] == null || keypoints[i].score < scoreThreshold) {
        // Hide anchor points and low-confidence points.
        return '#ffffff'; // White color
      }
      if (i === 0) {
        return '#ff0000' /* Red */; // Color for the root keypoint
      }
      if (keypointInd.left.indexOf(i) > -1) {
        return '#00ff00' /* Green */; // Color for left keypoints
      }
      if (keypointInd.right.indexOf(i) > -1) {
        return '#ffa500' /* Orange */; // Color for right keypoints
      }
    });

    if (!this.scatterGLHasInitialized) {
      this.scatterGL.render(dataset); // Render the 3D keypoints
    } else {
      this.scatterGL.updateDataset(dataset); // Update the 3D keypoints dataset
    }
    const connections = posedetection.util.getAdjacentPairs(params.STATE.model);
    const sequences = connections.map(pair => ({indices: pair}));
    this.scatterGL.setSequences(sequences); // Set sequences for connecting keypoints
    this.scatterGLHasInitialized = true;
  }
}
