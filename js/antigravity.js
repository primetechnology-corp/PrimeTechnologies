window.onload = () => {
    setTimeout(() => {
        try {
            const { Engine, Render, Runner, World, Bodies, Mouse, Composite, Composites, Query, Body, Events } = Matter;

            const section = document.querySelector('#introduction');
            if (!section || section.clientWidth === 0) {
                console.error("Antigravity: Seção não encontrada ou sem dimensões.");
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = section.clientWidth;
            canvas.height = section.clientHeight;
            section.appendChild(canvas);

            const engine = Engine.create();
            const world = engine.world;
            engine.world.gravity.y = 0; // Gravidade ZERO para flutuar

            const render = Render.create({
                canvas: canvas,
                engine: engine,
                options: {
                    width: section.clientWidth,
                    height: section.clientHeight,
                    wireframes: false,
                    background: 'transparent' // Fundo transparente para ver o cenário
                }
            });

            // Criar múltiplos hexágonos em posições aleatórias para evitar congelamento
            const bodies = [];
            for (let i = 0; i < 170; i++) { // Criar 50 hexágonos
                const body = Bodies.polygon(
                    Math.random() * section.clientWidth,
                    Math.random() * section.clientHeight,
                    6, 20, { // Raio diminuído para 10
                        restitution: 0.7,
                        render: {
                            sprite: {
                                texture: 'Imagens/hexagonoNovo9.png',
                                xScale: 0.2, // Escala ajustada para 0.2
                                yScale: 0.2  // Escala ajustada para 0.2
                            }
                        }
                    }
                );
                // Adiciona uma pequena velocidade inicial para garantir que a simulação comece
                Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 });
                bodies.push(body);
            }

            World.add(world, [
                ...bodies,
                // Paredes invisíveis para conter os hexágonos
                Bodies.rectangle(section.clientWidth / 2, -25, section.clientWidth, 50, { isStatic: true, render: { visible: false } }),
                Bodies.rectangle(section.clientWidth / 2, section.clientHeight + 25, section.clientWidth, 50, { isStatic: true, render: { visible: false } }),
                Bodies.rectangle(-25, section.clientHeight / 2, 50, section.clientHeight, { isStatic: true, render: { visible: false } }),
                Bodies.rectangle(section.clientWidth + 25, section.clientHeight / 2, 50, section.clientHeight, { isStatic: true, render: { visible: false } })
            ]);

            // Adicionar interação de 'empurrar' com o mouse ao passar por cima
            const mouse = Mouse.create(document.body);

            Events.on(engine, 'afterUpdate', () => {
                if (!mouse.position.x) {
                    return;
                }

                // Encontra todos os corpos na posição atual do mouse
                const allBodies = Composite.allBodies(world);
                const foundBodies = Query.point(allBodies, mouse.position);

                if (foundBodies.length > 0) {
                    const body = foundBodies[0];
                    // Aplica uma pequena força aleatória para 'empurrar' o hexágono
                    Body.applyForce(body, body.position, {
                        x: (Math.random() - 0.5) * 0.1,
                        y: (Math.random() - 0.5) * 0.1,
                    });
                }
            });

            // Manter a correção que impede o bloqueio da rolagem da página
            mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
            mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

            Runner.run(engine);
            Render.run(render);

            // Adiciona as linhas de conexão entre os hexágonos
            Events.on(render, 'afterRender', () => {
                const bodies = Composite.allBodies(world);
                const context = render.context;
                const maxDistance = 150; // Distância máxima para desenhar uma linha

                context.beginPath();

                for (let i = 0; i < bodies.length; i++) {
                    for (let j = i + 1; j < bodies.length; j++) {
                        const bodyA = bodies[i];
                        const bodyB = bodies[j];

                        const dx = bodyA.position.x - bodyB.position.x;
                        const dy = bodyA.position.y - bodyB.position.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < maxDistance) {
                            // A cor da linha agora é constante, sem efeito de fade.
                            context.moveTo(bodyA.position.x, bodyA.position.y);
                            context.lineTo(bodyB.position.x, bodyB.position.y);
                            context.strokeStyle = 'rgba(173, 216, 230, 0.4)'; // Azul claro com opacidade fixa
                            context.lineWidth = 1;
                        }
                    }
                }

                context.stroke();
            });

        } catch (error) {
            alert("Ocorreu um erro ao restaurar a animação: " + error.message);
            console.error(error);
        }
    }, 500);
};