    let engine;
    let world;
    let squares = [];
    let mouseConstraint;
    let canvas;
    let cellSize;

    function setup() {
        canvas = createCanvas(windowWidth, windowHeight);

        engine = Matter.Engine.create();
        world = engine.world;
        world.gravity.y = 1.2;

        cellSize = min(width, height) / 8 * 0.8;

        const walls = [
            Matter.Bodies.rectangle(width/2, height + 30, width * 1.5, 60, { isStatic: true }),
            Matter.Bodies.rectangle(-30, height/2, 60, height * 1.5, { isStatic: true }),
            Matter.Bodies.rectangle(width + 30, height/2, 60, height * 1.5, { isStatic: true })
        ];
        Matter.World.add(world, walls);

        for (let i = 0; i < 36; i++) {
            const square = Matter.Bodies.rectangle(
                random(cellSize, width - cellSize),
                random(height * 0.8),
                cellSize,
                cellSize,
                {
                    angle: random(TWO_PI),
                    friction: 1,
                    restitution: 0.05,
                    density: 0.2,
                    frictionAir: 0.03
                }
            );
            square.pattern = {
                hasLines: false,
                lineCount: 0,
                direction: 0,
                hasCircle: false
            };
            squares.push(square);
        }

        // Select squares for lines (4-8)
        const lineSquaresCount = floor(random(4, 9));
        let availableIndices = Array.from({length: squares.length}, (_, i) => i);

        // Select and apply lines
        for (let i = 0; i < lineSquaresCount; i++) {
            const randomIndex = floor(random(availableIndices.length));
            const selectedIndex = availableIndices.splice(randomIndex, 1)[0];
            squares[selectedIndex].pattern = {
                hasLines: true,
                lineCount: floor(random(4, 9)),
                direction: random([0, HALF_PI]),
                hasCircle: false
            };
        }

        // Select squares for circles (3-6)
        const circleSquaresCount = floor(random(3, 7));
        availableIndices = Array.from({length: squares.length}, (_, i) => i);

        // Select and apply circles
        for (let i = 0; i < circleSquaresCount; i++) {
            const randomIndex = floor(random(availableIndices.length));
            const selectedIndex = availableIndices.splice(randomIndex, 1)[0];
            squares[selectedIndex].pattern.hasCircle = true;
        }

        Matter.World.add(world, squares);

        let canvasMouse = Matter.Mouse.create(canvas.elt);
        canvasMouse.pixelRatio = pixelDensity();
        mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: canvasMouse,
            constraint: {
                stiffness: 0.05,
                damping: 0.9,
                angularStiffness: 0.05
            }
        });
        Matter.World.add(world, mouseConstraint);

        canvas.elt.addEventListener('wheel', function(e) {
            if (mouseConstraint.body) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    function draw() {
        background(255);

        Matter.Engine.update(engine);

        stroke(0, 150);
        strokeWeight(1.5);
        noFill();

        squares.forEach(square => {
            const pos = square.position;

            if (pos.x < 0) Matter.Body.setPosition(square, { x: cellSize, y: pos.y });
            if (pos.x > width) Matter.Body.setPosition(square, { x: width - cellSize, y: pos.y });
            if (pos.y < 0) Matter.Body.setPosition(square, { x: pos.x, y: cellSize });
            if (pos.y > height) Matter.Body.setPosition(square, { x: pos.x, y: height - cellSize });

            push();
            translate(pos.x, pos.y);
            rotate(square.angle);

            // Draw square outline
            rect(-cellSize/2, -cellSize/2, cellSize, cellSize);

            // Draw lines if square has them
            if (square.pattern.hasLines) {
                const spacing = cellSize / (square.pattern.lineCount + 1);

                for (let i = 1; i <= square.pattern.lineCount; i++) {
                    if (square.pattern.direction === 0) {
                        line(-cellSize/2, -cellSize/2 + i*spacing, cellSize/2, -cellSize/2 + i*spacing);
                    } else {
                        line(-cellSize/2 + i*spacing, -cellSize/2, -cellSize/2 + i*spacing, cellSize/2);
                    }
                }
            }

            // Draw circle if square has it
            if (square.pattern.hasCircle) {
                fill(0);
                noStroke();
                circle(0, 0, 4);
                noFill();
                stroke(0, 150);
            }

            pop();
        });
    }

    function windowResized() {
        resizeCanvas(windowWidth, windowHeight);
        cellSize = min(width, height) / 8 * 0.8;
    }
