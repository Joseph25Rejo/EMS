
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const numParticles = 20;
            
            for (let i = 0; i < numParticles; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                particlesContainer.appendChild(particle);
            }
        }
        
        // Initialize particles
        createParticles();
        
        // Smooth scrolling
        function scrollToFeatures() {
            document.getElementById('features').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // Simulation Management
        function startSimulation() {
            const overlay = document.getElementById('simulationOverlay');
            const mainContainer = document.getElementById('mainContainer');
            
            mainContainer.classList.add('overlay-active');
            overlay.classList.add('active');
            
            // Initialize with random graph
            setTimeout(() => {
                generateRandomGraph();
            }, 800);
        }
        
        function closeSimulation() {
            const overlay = document.getElementById('simulationOverlay');
            const mainContainer = document.getElementById('mainContainer');
            
            overlay.classList.remove('active');
            mainContainer.classList.remove('overlay-active');
            
            // Reset animation state
            isAnimating = false;
            document.getElementById('playBtn').textContent = '▶️ Start';
        }
        
        // Graph Algorithm Implementation
        const canvas = document.getElementById('graphCanvas');
        const ctx = canvas.getContext('2d');
        
        let nodes = [];
        let edges = [];
        let isAnimating = false;
        let animationSpeed = 800;
        let currentNodeIndex = 0;
        let colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];
        let isUserMode = false;
        let tempEdgeStart = null;
        
        class Node {
            constructor(x, y, id, label) {
                this.x = x;
                this.y = y;
                this.id = id;
                this.label = label;
                this.color = 'rgba(255, 255, 255, 0.9)';
                this.colorIndex = -1;
                this.radius = 35;
                this.isHighlighted = false;
                this.neighbors = new Set();
            }
            
            draw() {
                // Draw glow effect
                if (this.isHighlighted) {
                    ctx.save();
                    ctx.shadowColor = '#667eea';
                    ctx.shadowBlur = 20;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius + 5, 0, 2 * Math.PI);
                    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
                    ctx.fill();
                    ctx.restore();
                }
                
                // Draw node shadow
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;
                
                // Draw node
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
                
                // Gradient fill
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, this.color === 'rgba(255, 255, 255, 0.9)' ? 
                    'rgba(200, 200, 200, 0.9)' : this.color);
                
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // Border
                ctx.strokeStyle = this.isHighlighted ? '#667eea' : 'rgba(0,0,0,0.3)';
                ctx.lineWidth = this.isHighlighted ? 4 : 2;
                ctx.stroke();
                
                ctx.restore();
                
                // Draw label
                ctx.save();
                ctx.fillStyle = this.colorIndex === -1 ? '#333' : 'rgba(255,255,255,0.95)';
                ctx.font = 'bold 12px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 3;
                ctx.fillText(this.label, this.x, this.y);
                ctx.restore();
            }
            
            contains(x, y) {
                const dx = x - this.x;
                const dy = y - this.y;
                return dx * dx + dy * dy <= this.radius * this.radius;
            }
        }
        
        class Edge {
            constructor(node1, node2) {
                this.node1 = node1;
                this.node2 = node2;
                this.isHighlighted = false;
            }
            
            draw() {
                ctx.save();
                
                // Calculate edge points to not overlap with nodes
                const dx = this.node2.x - this.node1.x;
                const dy = this.node2.y - this.node1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const unitX = dx / distance;
                const unitY = dy / distance;
                
                const startX = this.node1.x + unitX * this.node1.radius;
                const startY = this.node1.y + unitY * this.node1.radius;
                const endX = this.node2.x - unitX * this.node2.radius;
                const endY = this.node2.y - unitY * this.node2.radius;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                
                if (this.isHighlighted) {
                    ctx.strokeStyle = '#667eea';
                    ctx.lineWidth = 4;
                    ctx.shadowColor = '#667eea';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 2;
                }
                
                ctx.stroke();
                ctx.restore();
            }
        }
        
        function generateRandomGraph() {
            const examNames = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Literature', 'Economics', 'Psychology', 'Statistics'];
            const numNodes = 6 + Math.floor(Math.random() * 4); // 6-9 nodes
            
            nodes = [];
            edges = [];
            
            // Create nodes in an aesthetically pleasing layout
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) * 0.3;
            
            for (let i = 0; i < numNodes; i++) {
                const angle = (2 * Math.PI * i) / numNodes;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                const label = examNames[i] || `Exam ${i + 1}`;
                
                nodes.push(new Node(x, y, i, label));
            }
            
            // Create strategic edges for interesting coloring
            const density = 0.4 + Math.random() * 0.3; // 40-70% density
            const maxEdges = (nodes.length * (nodes.length - 1)) / 2;
            const numEdges = Math.floor(maxEdges * density);
            
            const possibleEdges = [];
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    possibleEdges.push([i, j]);
                }
            }
            
            // Shuffle and select edges
            for (let i = possibleEdges.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [possibleEdges[i], possibleEdges[j]] = [possibleEdges[j], possibleEdges[i]];
            }
            
            for (let i = 0; i < Math.min(numEdges, possibleEdges.length); i++) {
                const [nodeIndex1, nodeIndex2] = possibleEdges[i];
                const node1 = nodes[nodeIndex1];
                const node2 = nodes[nodeIndex2];
                
                edges.push(new Edge(node1, node2));
                node1.neighbors.add(node2);
                node2.neighbors.add(node1);
            }
            
            resetVisualization();
            updateStats();
            draw();
        }
        
        function initializeUserGraph() {
            nodes = [];
            edges = [];
            isUserMode = true;
            tempEdgeStart = null;
            
            updateAlgorithmStatus("🖱️ Click to add exams, then click pairs to create conflicts");
            updateCurrentStep("Build your custom exam conflict graph");
            updateStats();
            draw();
        }
        
        function handleCanvasClick(event) {
            if (!isUserMode) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Check if clicked on existing node
            const clickedNode = nodes.find(node => node.contains(x, y));
            
            if (clickedNode) {
                if (tempEdgeStart === null) {
                    tempEdgeStart = clickedNode;
                    clickedNode.isHighlighted = true;
                    updateAlgorithmStatus("✨ Now click another exam to create a conflict");
                    updateCurrentStep(`Selected: ${clickedNode.label}`);
                } else if (tempEdgeStart !== clickedNode) {
                    // Create edge if it doesn't exist
                    const edgeExists = edges.some(edge => 
                        (edge.node1 === tempEdgeStart && edge.node2 === clickedNode) ||
                        (edge.node1 === clickedNode && edge.node2 === tempEdgeStart)
                    );
                    
                    if (!edgeExists) {
                        edges.push(new Edge(tempEdgeStart, clickedNode));
                        tempEdgeStart.neighbors.add(clickedNode);
                        clickedNode.neighbors.add(tempEdgeStart);
                        updateAlgorithmStatus("✅ Conflict added!");
                        updateCurrentStep(`${tempEdgeStart.label} ↔ ${clickedNode.label} conflict created`);
                    } else {
                        updateAlgorithmStatus("⚠️ Conflict already exists");
                        updateCurrentStep("Try selecting different exams");
                    }
                    
                    tempEdgeStart.isHighlighted = false;
                    tempEdgeStart = null;
                } else {
                    // Clicked same node, deselect
                    tempEdgeStart.isHighlighted = false;
                    tempEdgeStart = null;
                    updateAlgorithmStatus("🖱️ Click two different exams to create conflicts");
                    updateCurrentStep("Selection cleared");
                }
            } else {
                // Create new node
                const label = `Exam ${String.fromCharCode(65 + nodes.length)}`;
                nodes.push(new Node(x, y, nodes.length, label));
                updateAlgorithmStatus("📚 New exam added!");
                updateCurrentStep(`Created: ${label} at (${Math.round(x)}, ${Math.round(y)})`);
            }
            
            updateStats();
            draw();
        }
        
        canvas.addEventListener('click', handleCanvasClick);
        
        async function startGraphColoring() {
            if (nodes.length === 0) {
                updateAlgorithmStatus("⚠️ Please generate a graph first!");
                updateCurrentStep("Click 'Random' or 'Custom' to create exams");
                return;
            }
            
            isAnimating = true;
            isUserMode = false;
            currentNodeIndex = 0;
            
            // Reset all nodes
            nodes.forEach(node => {
                node.color = 'rgba(255, 255, 255, 0.9)';
                node.colorIndex = -1;
                node.isHighlighted = false;
            });
            
            edges.forEach(edge => edge.isHighlighted = false);
            
            updateAlgorithmStatus("🚀 Initializing Graph Coloring Algorithm...");
            updateCurrentStep("Sorting exams by conflict degree");
            
            // Welsh-Powell algorithm implementation
            const nodesByDegree = [...nodes].sort((a, b) => b.neighbors.size - a.neighbors.size);
            
            for (let i = 0; i < nodesByDegree.length; i++) {
                if (!isAnimating) break;
                
                const currentNode = nodesByDegree[i];
                currentNode.isHighlighted = true;
                
                updateAlgorithmStatus(`🎯 Processing: ${currentNode.label}`);
                updateCurrentStep(`Degree: ${currentNode.neighbors.size} conflicts | Finding optimal time slot...`);
                
                // Highlight neighbors and their edges
                const neighborEdges = edges.filter(edge => 
                    edge.node1 === currentNode || edge.node2 === currentNode
                );
                neighborEdges.forEach(edge => edge.isHighlighted = true);
                
                // Highlight neighbor nodes briefly
                currentNode.neighbors.forEach(neighbor => {
                    neighbor.isHighlighted = true;
                });
                
                draw();
                await sleep(animationSpeed * 0.7);
                
                // Remove neighbor highlights
                currentNode.neighbors.forEach(neighbor => {
                    neighbor.isHighlighted = false;
                });
                
                // Find available color
                const usedColors = new Set();
                currentNode.neighbors.forEach(neighbor => {
                    if (neighbor.colorIndex !== -1) {
                        usedColors.add(neighbor.colorIndex);
                    }
                });
                
                let colorIndex = 0;
                while (usedColors.has(colorIndex)) {
                    colorIndex++;
                }
                
                // Animate color assignment
                updateCurrentStep(`✅ Assigning Time Slot ${colorIndex + 1} to ${currentNode.label}`);
                
                currentNode.colorIndex = colorIndex;
                currentNode.color = colors[colorIndex % colors.length];
                
                draw();
                await sleep(animationSpeed);
                
                // Remove highlights
                currentNode.isHighlighted = false;
                neighborEdges.forEach(edge => edge.isHighlighted = false);
                
                updateStats();
                
                // Brief pause between nodes
                await sleep(animationSpeed * 0.3);
            }
            
            if (isAnimating) {
                updateAlgorithmStatus("🎉 Scheduling Complete! Zero conflicts achieved!");
                updateCurrentStep(`Optimal solution found using ${Math.max(...nodes.map(n => n.colorIndex)) + 1} time slots`);
                
                // Celebration effect
                for (let i = 0; i < nodes.length; i++) {
                    setTimeout(() => {
                        nodes[i].isHighlighted = true;
                        draw();
                        setTimeout(() => {
                            nodes[i].isHighlighted = false;
                            draw();
                        }, 300);
                    }, i * 150);
                }
                
                // Final stats update
                setTimeout(() => {
                    updateStats();
                }, nodes.length * 150 + 500);
            }
            
            isAnimating = false;
            document.getElementById('playBtn').textContent = '▶️ Start';
        }
        
        function toggleAnimation() {
            if (isAnimating) {
                pauseAnimation();
            } else {
                startGraphColoring();
            }
        }
        
        function pauseAnimation() {
            isAnimating = false;
            document.getElementById('playBtn').textContent = '▶️ Resume';
            updateAlgorithmStatus("⏸️ Animation Paused");
            updateCurrentStep("Click 'Resume' to continue scheduling");
        }
        
        function resetVisualization() {
            isAnimating = false;
            isUserMode = false;
            tempEdgeStart = null;
            currentNodeIndex = 0;
            
            nodes.forEach(node => {
                node.color = 'rgba(255, 255, 255, 0.9)';
                node.colorIndex = -1;
                node.isHighlighted = false;
            });
            
            edges.forEach(edge => edge.isHighlighted = false);
            
            document.getElementById('playBtn').textContent = '▶️ Start';
            updateAlgorithmStatus("🔄 Reset Complete");
            updateCurrentStep("Ready for new scheduling run");
            updateStats();
            draw();
        }
        
        function updateSpeed() {
            const slider = document.getElementById('speedSlider');
            animationSpeed = parseInt(slider.value);
            document.getElementById('speedLabel').textContent = (animationSpeed / 1000).toFixed(1) + 's';
        }
        
        function updateAlgorithmStatus(status) {
            document.getElementById('algorithmStatus').textContent = status;
        }
        
        function updateCurrentStep(step) {
            document.getElementById('currentStep').textContent = step;
        }
        
        function updateStats() {
            document.getElementById('totalExams').textContent = nodes.length;
            document.getElementById('totalConflicts').textContent = edges.length;
            
            const usedColors = new Set(nodes.map(node => node.colorIndex).filter(index => index !== -1));
            document.getElementById('timeSlotsUsed').textContent = usedColors.size;
            
            const scheduledNodes = nodes.filter(node => node.colorIndex !== -1).length;
            const progress = nodes.length > 0 ? Math.round((scheduledNodes / nodes.length) * 100) : 0;
            document.getElementById('progress').textContent = progress + '%';
        }
        
        function draw() {
            // Clear canvas with gradient background
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background gradient
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
            );
            gradient.addColorStop(0, 'rgba(26, 26, 46, 0.8)');
            gradient.addColorStop(1, 'rgba(15, 15, 35, 0.9)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw edges first (behind nodes)
            edges.forEach(edge => edge.draw());
            
            // Draw nodes
            nodes.forEach(node => node.draw());
            
            // Draw temporary edge preview in user mode
            if (isUserMode && tempEdgeStart) {
                // This could be enhanced with mouse tracking for live preview
            }
        }
        
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Could implement canvas resizing logic here
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (document.getElementById('simulationOverlay').classList.contains('active')) {
                switch(event.key) {
                    case 'Escape':
                        closeSimulation();
                        break;
                    case ' ':
                        event.preventDefault();
                        toggleAnimation();
                        break;
                    case 'r':
                    case 'R':
                        if (event.ctrlKey || event.metaKey) {
                            event.preventDefault();
                            resetVisualization();
                        }
                        break;
                }
            }
        });
        
        // Initialize empty canvas
        draw();
