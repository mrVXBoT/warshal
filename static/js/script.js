document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const matrixSizeInput = document.getElementById('matrix-size');
    const createMatrixBtn = document.getElementById('create-matrix-btn');
    const runAlgorithmBtn = document.getElementById('run-algorithm-btn');
    const inputMatrixContainer = document.getElementById('input-matrix');
    const visualizationContainer = document.getElementById('visualization-container');
    const stepDescription = document.getElementById('step-description');
    const mathDescription = document.getElementById('math-description');
    const currentFormula = document.getElementById('current-formula');
    const visualizationMatrix = document.getElementById('visualization-matrix');
    const resultContainer = document.getElementById('result-container');
    const resultMatrix = document.getElementById('result-matrix');
    const prevStepBtn = document.getElementById('prev-step-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const stepIndicator = document.getElementById('step-indicator');
    
    // Variables
    let matrixSize = 3;
    let inputMatrix = [];
    let algorithmSteps = [];
    let currentStep = 0;
    let animationInProgress = false;
    
    // Initialize
    createMatrixBtn.addEventListener('click', () => {
        const btn = createMatrixBtn;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ساخت...';
        btn.disabled = true;
        
        setTimeout(() => {
            createMatrix();
            btn.innerHTML = '<i class="fas fa-table"></i> ساخت ماتریس';
            btn.disabled = false;
        }, 500);
    });
    
    runAlgorithmBtn.addEventListener('click', () => {
        const btn = runAlgorithmBtn;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال اجرا...';
        btn.disabled = true;
        
        setTimeout(() => {
            runAlgorithm();
            btn.innerHTML = '<i class="fas fa-play"></i> اجرای الگوریتم وارشال';
            btn.disabled = false;
        }, 800);
    });
    
    prevStepBtn.addEventListener('click', showPreviousStep);
    nextStepBtn.addEventListener('click', showNextStep);
    
    // Create initial matrix
    createMatrix();
    
    // Functions
    function createMatrix() {
        matrixSize = parseInt(matrixSizeInput.value);
        if (matrixSize < 2) matrixSize = 2;
        if (matrixSize > 10) matrixSize = 10;
        matrixSizeInput.value = matrixSize;
        
        // Create matrix
        inputMatrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
        renderInputMatrix();
        
        // Reset visualization
        visualizationContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
    }
    
    function renderInputMatrix() {
        inputMatrixContainer.innerHTML = '';
        const table = document.createElement('div');
        table.className = 'matrix';
        
        // Create header row with labels
        const headerRow = document.createElement('div');
        headerRow.className = 'matrix-row';
        
        // Empty cell for top-left corner
        const cornerCell = document.createElement('div');
        cornerCell.className = 'matrix-label';
        headerRow.appendChild(cornerCell);
        
        // Column labels
        for (let j = 0; j < matrixSize; j++) {
            const label = document.createElement('div');
            label.className = 'matrix-label';
            label.textContent = j + 1;
            headerRow.appendChild(label);
            
            // Add fade-in animation with delay
            setTimeout(() => {
                label.style.opacity = '1';
            }, j * 50);
        }
        
        table.appendChild(headerRow);
        
        // Create rows
        for (let i = 0; i < matrixSize; i++) {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            row.style.opacity = '0';
            
            // Row label
            const rowLabel = document.createElement('div');
            rowLabel.className = 'matrix-label';
            rowLabel.textContent = i + 1;
            row.appendChild(rowLabel);
            
            // Create cells
            for (let j = 0; j < matrixSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.max = '1';
                input.value = inputMatrix[i][j];
                input.dataset.row = i;
                input.dataset.col = j;
                
                input.addEventListener('change', (e) => {
                    const row = parseInt(e.target.dataset.row);
                    const col = parseInt(e.target.dataset.col);
                    const value = parseInt(e.target.value);
                    
                    if (isNaN(value) || value < 0) {
                        e.target.value = 0;
                        inputMatrix[row][col] = 0;
                    } else if (value > 1) {
                        e.target.value = 1;
                        inputMatrix[row][col] = 1;
                    } else {
                        inputMatrix[row][col] = value;
                    }
                    
                    // Highlight the changed cell briefly
                    cell.classList.add('highlighted');
                    setTimeout(() => {
                        cell.classList.remove('highlighted');
                    }, 300);
                });
                
                cell.appendChild(input);
                row.appendChild(cell);
            }
            
            table.appendChild(row);
            
            // Add fade-in animation with delay for each row
            setTimeout(() => {
                row.style.opacity = '1';
            }, i * 100 + 100);
        }
        
        inputMatrixContainer.appendChild(table);
    }
    
    function runAlgorithm() {
        // Get matrix values
        const matrix = [];
        for (let i = 0; i < matrixSize; i++) {
            matrix[i] = [];
            for (let j = 0; j < matrixSize; j++) {
                matrix[i][j] = inputMatrix[i][j];
            }
        }
        
        // Send to server
        fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matrix }),
        })
        .then(response => response.json())
        .then(data => {
            algorithmSteps = data.steps;
            
            // Smoothly scroll to visualization
            setTimeout(() => {
                visualizationContainer.classList.remove('hidden');
                visualizationContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Reset to first step
                currentStep = 0;
                updateStepControls();
                renderVisualization();
                
                // Show the result after a delay
                setTimeout(() => {
                    resultContainer.classList.remove('hidden');
                    renderResult(data.result);

                    // Rerender MathJax formulas after everything is loaded
                    if (window.MathJax) {
                        window.MathJax.typeset();
                    }
                }, 800);
            }, 400);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('خطا در اجرای الگوریتم رخ داد.');
        });
    }
    
    function renderVisualization() {
        if (currentStep >= algorithmSteps.length) return;
        
        const stepData = algorithmSteps[currentStep];
        
        // Update step description with fade effect
        stepDescription.style.opacity = '0';
        mathDescription.style.opacity = '0';
        
        setTimeout(() => {
            // Update descriptions
            stepDescription.textContent = stepData.description;
            mathDescription.textContent = stepData.math_description || '';
            
            // Generate formula for current step
            if (currentStep > 0) {
                const k = currentStep - 1;
                currentFormula.innerHTML = `\\(R^{${k+1}}[i][j] = R^{${k}}[i][j] \\lor (R^{${k}}[i][${k+1}] \\land R^{${k}}[${k+1}][j])\\)`;
            } else {
                currentFormula.innerHTML = '\\(R^0\\) = ماتریس مجاورت اولیه';
            }
            
            // Show elements
            stepDescription.style.opacity = '1';
            mathDescription.style.opacity = '1';
            
            // Rerender MathJax formulas
            if (window.MathJax) {
                window.MathJax.typeset();
            }
        }, 200);
        
        // Update matrix
        visualizationMatrix.innerHTML = '';
        const matrix = stepData.matrix;
        const table = document.createElement('div');
        table.className = 'matrix';
        
        // Create header row with labels
        const headerRow = document.createElement('div');
        headerRow.className = 'matrix-row';
        
        // Empty cell for top-left corner
        const cornerCell = document.createElement('div');
        cornerCell.className = 'matrix-label';
        cornerCell.style.opacity = '1'; // Make sure it's visible
        headerRow.appendChild(cornerCell);
        
        // Column labels
        for (let j = 0; j < matrix.length; j++) {
            const label = document.createElement('div');
            label.className = 'matrix-label';
            label.textContent = j + 1;
            label.style.opacity = '1'; // Make sure it's visible
            headerRow.appendChild(label);
        }
        
        table.appendChild(headerRow);
        
        // Create rows
        for (let i = 0; i < matrix.length; i++) {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            row.style.opacity = '1'; // Make sure it's visible
            
            // Row label
            const rowLabel = document.createElement('div');
            rowLabel.className = 'matrix-label';
            rowLabel.textContent = i + 1;
            rowLabel.style.opacity = '1'; // Make sure it's visible
            row.appendChild(rowLabel);
            
            // Create cells
            for (let j = 0; j < matrix[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.textContent = matrix[i][j];
                
                // Highlight changed cells
                if (currentStep > 0) {
                    const prevMatrix = algorithmSteps[currentStep - 1].matrix;
                    if (matrix[i][j] !== prevMatrix[i][j]) {
                        // Add a slight delay for better visualization
                        setTimeout(() => {
                            cell.classList.add('changed');
                        }, (i * matrix.length + j) * 30);
                    }
                }
                
                row.appendChild(cell);
            }
            
            table.appendChild(row);
        }
        
        visualizationMatrix.appendChild(table);
    }
    
    function renderResult(resultData) {
        resultMatrix.innerHTML = '';
        const table = document.createElement('div');
        table.className = 'matrix';
        
        // Create header row with labels
        const headerRow = document.createElement('div');
        headerRow.className = 'matrix-row';
        
        // Empty cell for top-left corner
        const cornerCell = document.createElement('div');
        cornerCell.className = 'matrix-label';
        headerRow.appendChild(cornerCell);
        
        // Column labels
        for (let j = 0; j < resultData.length; j++) {
            const label = document.createElement('div');
            label.className = 'matrix-label';
            label.textContent = j + 1;
            headerRow.appendChild(label);
        }
        
        table.appendChild(headerRow);
        
        // Create rows with fade in effect
        for (let i = 0; i < resultData.length; i++) {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            row.style.opacity = '0';
            
            // Row label
            const rowLabel = document.createElement('div');
            rowLabel.className = 'matrix-label';
            rowLabel.textContent = i + 1;
            row.appendChild(rowLabel);
            
            // Create cells
            for (let j = 0; j < resultData[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.textContent = resultData[i][j];
                
                row.appendChild(cell);
            }
            
            table.appendChild(row);
            
            // Add fade-in animation with delay
            setTimeout(() => {
                row.style.opacity = '1';
            }, i * 100);
        }
        
        resultMatrix.appendChild(table);
    }
    
    function showPreviousStep() {
        if (animationInProgress || currentStep <= 0) return;
        animationInProgress = true;
        
        // Animate the transition
        visualizationMatrix.style.opacity = '0.5';
        visualizationMatrix.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            currentStep--;
            updateStepControls();
            renderVisualization();
            
            // Animate back
            setTimeout(() => {
                visualizationMatrix.style.opacity = '1';
                visualizationMatrix.style.transform = 'translateX(0)';
                animationInProgress = false;
            }, 50);
        }, 200);
    }
    
    function showNextStep() {
        if (animationInProgress || currentStep >= algorithmSteps.length - 1) return;
        animationInProgress = true;
        
        // Animate the transition
        visualizationMatrix.style.opacity = '0.5';
        visualizationMatrix.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            currentStep++;
            updateStepControls();
            renderVisualization();
            
            // Animate back
            setTimeout(() => {
                visualizationMatrix.style.opacity = '1';
                visualizationMatrix.style.transform = 'translateX(0)';
                animationInProgress = false;
            }, 50);
        }, 200);
    }
    
    function updateStepControls() {
        stepIndicator.textContent = `مرحله ${currentStep}/${algorithmSteps.length - 1}`;
        prevStepBtn.disabled = currentStep === 0;
        nextStepBtn.disabled = currentStep === algorithmSteps.length - 1;
    }
}); 