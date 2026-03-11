# 1\. Title

V-Shuttle   
Sensor Fusion and Human-Centered Dashboard for Autonomous Shuttle Decision Support

# 2\. Team

\- Andrea Messana — Frontend Engineer    
  Developed the Angular dashboard, implemented the real-time simulation interface, and presented the technical architecture during the final pitch.

\- Pietro Tabbì — Backend Engineer    
  Implemented the core system logic including sensor fusion, OCR normalization, semantic parsing, and ensured the system worked reliably across scenarios.

\- Danylo Tantsura— Product & Project Lead    
  Defined the project direction, aligned the solution with the business problem, coordinated the team workflow, prepared the documentation, and created the final presentation.

# 

# 3\. Project Overview

V-Shuttle is a deterministic sensor-fusion and semantic-parsing system designed to support the safety driver of an autonomous shuttle.

Autonomous vehicles operating in complex environments such as historic city centers may encounter degraded or ambiguous road signs. This can lead to unnecessary emergency braking (phantom braking) and confusion for the safety driver.

Our system merges multiple sensor readings, corrects OCR errors, interprets the meaning of road signs, and presents a clear decision through an intuitive dashboard designed for fast human understanding.

# 4\. Problem

Waymo's autonomous shuttle operates in complex environments with narrow streets and restricted traffic zones (ZTL).

When road signs are degraded, partially occluded, or interpreted inconsistently by sensors, the vehicle may fail to confidently interpret them.

This often results in:

\- Phantom braking  
\- Delays in manual intervention  
\- Confusing technical logs displayed to the safety driver

The challenge is to bridge the gap between machine perception and human understanding.

# 5\. Approach

# 

Our team started by analyzing the dataset and identifying the main issue:   
sensor disagreement and OCR errors in road sign recognition.

We observed that many scenarios contained ambiguous or inconsistent sensor readings,   
which could lead to phantom braking and confusion for the safety driver.

To address this problem, we designed a deterministic approach that combines:

\- weighted sensor fusion  
\- OCR error normalization  
\- semantic interpretation of road signs

The system then transforms noisy technical sensor data into clear operational decisions   
that can be easily understood by the safety driver through a human-centered dashboard.

# 

# 6\. Solution

V-Shuttle introduces two key components:

1\. A deterministic **sensor fusion and semantic parsing engine**  
2\. A **human-centered live dashboard**

The backend system merges sensor readings using weighted reliability, cleans OCR errors, and interprets the meaning of the road sign.

The frontend dashboard then presents the resulting decision in a simple and intuitive way, allowing the safety driver to quickly understand the situation and act if necessary.

# 7\. Sensor Fusion Logic

Each sensor is assigned a reliability coefficient:

\- Front Camera → 1.0  
\- Side Camera → 0.85  
\- V2I Receiver → 0.75

The coefficient is multiplied by the confidence score provided by each sensor.

The system then:

1\. Normalizes OCR-corrupted text  
2\. Corrects common recognition errors  
3\. Computes similarity between sensor readings  
4\. Selects the most probable interpretation  
5\. Calculates a final confidence score

This approach avoids a simple average and implements a weighted sensor fusion strategy based on the reliability of the sources.

# 8\. Decision Logic

Based on the fused interpretation and final confidence score, the system determines the action to take.

Possible actions:

\- **GO** → the vehicle can proceed  
\- **STOP** → the vehicle must stop  
\- **ATTENTION / LOW CONFIDENCE** → the system signals uncertainty

If uncertainty remains and no operator intervention occurs, the system falls back to **STOP** to ensure safety.

# 9. Smart Dashboard & Human-Machine Interface

The dashboard is engineered for a safety driver operating under time pressure, prioritizing low cognitive load and rapid decision-making.

### Operational States
The interface provides immediate visual feedback through a color-coded system:

*   **🟢 SAFE (Green)**: The vehicle proceeds autonomously. The system automatically advances to the next scenario after 4 seconds.
*   **🟡 WARNING (Yellow)**: Uncertainty detected. A 2-second grace timer is activated. The driver must confirm "CONTINUE" to proceed; otherwise, the system defaults to a safety stop.
*   **🔴 DANGER (Red)**: Critical stop or timeout. The simulation loop is halted. A prominent "MANUAL INTERVENTION REQUIRED" button requires driver engagement to reset the system and resume operations.

### Key Features
*   **Distraction-Free UI**: Minimalist design with high-contrast elements.
*   **Touch-Optimized Controls**: Large interaction targets to prevent "fat-finger" errors on tablet devices.
*   **Real-Time Simulation**: RxJS-driven timing for precise scenario execution.

# 10. Technical Architecture

The solution is built as a robust Single Page Application (SPA) using **Angular 17+**.

### Core Technologies
*   **Angular Signals**: For granular, high-performance reactivity and state management.
*   **RxJS**: orchestrates the asynchronous simulation loop and handles complex timing logic (e.g., race conditions between user actions and timers).
*   **Standalone Components**: Modern Angular architecture for reduced boilerplate.
*   **Simulation Service**: Encapsulates the core business logic (Sensor Fusion, OCR Normalization, Semantic Parsing) directly within the frontend for a responsive demo experience.

### Data Flow
1.  **Input**: JSON Scenarios (`VShuttle-input.json`) are loaded into the application.
2.  **Processing**: The `SimulationService` parses sensor data, applies fusion algorithms, and determines the state.
3.  **Presentation**: The Dashboard component consumes the state via Signals and updates the UI instantly.

# 11. Edge Cases Handled

The system robustly handles real-world ambiguities:

*   OCR-corrupted text (e.g., "Z7L" instead of "ZTL").
*   Conflicting sensor readings (Camera vs. V2I).
*   Temporal restrictions (e.g., active ZTL times).
*   Semantic exceptions (e.g., "ECCETTO BUS").

# 12. How to Run

Follow these steps to launch the dashboard locally:

1.  **Navigate to the frontend directory**:
    ```bash
    cd src/frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the application**:
    ```bash
    npm start
    ```

4.  **Open in Browser**: The application will be available at `http://localhost:4200` by default.


1\. Clone the repository

git clone https://github.com/Messansio/Team8-VShuttle

cd Team8-VShuttle

2\. Install dependencies

npm install

3\. Start the application

npm run dev

4\. Open the application

Once the server is running, open your browser and go to:

http://localhost:portNumber

5\. Start the simulation

On the main screen click:

START SIMULATION

The dashboard will automatically start processing scenarios from:

VShuttle-input.json

Every 4 seconds the system loads a new scenario and simulates the interpretation of road signs using sensor fusion and semantic parsing.

# 13\. Screenshots

Dashboard – Normal Operation

![][image1]

Dashboard – Low Confidence Warning

![][image2]

[image1]: assets/images/dashboard-normal.png

[image2]: assets/images/dashboard-warning.png
