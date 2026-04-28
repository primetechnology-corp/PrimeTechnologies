import * as THREE from 'three'

class TouchTexture {
  constructor(size = 64) {
    this.size = size
    this.width = this.height = size
    this.maxAge = 64
    this.radius = 0.22 * this.size
    this.speed = 1 / this.maxAge
    this.trail = []
    this.last = null
    this.initTexture()
  }

  initTexture() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')
    this.clear()
    this.texture = new THREE.Texture(this.canvas)
  }

  clear() {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  addTouch(point) {
    let force = 0
    let vx = 0
    let vy = 0
    const last = this.last

    if (last) {
      const dx = point.x - last.x
      const dy = point.y - last.y
      if (dx === 0 && dy === 0) return
      const dd = dx * dx + dy * dy
      const d = Math.sqrt(dd)
      vx = dx / d
      vy = dy / d
      force = Math.min(dd * 18000, 1.8)
    }

    this.last = { x: point.x, y: point.y }
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy })
  }

  drawPoint(point) {
    const pos = {
      x: point.x * this.width,
      y: (1 - point.y) * this.height,
    }

    let intensity = 1
    if (point.age < this.maxAge * 0.3) {
      intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2))
    } else {
      const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7)
      intensity = -t * (t - 2)
    }
    intensity *= point.force

    const radius = this.radius
    const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`
    const offset = this.size * 4
    this.ctx.shadowOffsetX = offset
    this.ctx.shadowOffsetY = offset
    this.ctx.shadowBlur = 0
    this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`

    this.ctx.beginPath()
    this.ctx.fillStyle = 'rgba(255, 0, 0, 1)'
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }

  update() {
    this.clear()
    for (let i = this.trail.length - 1; i >= 0; i -= 1) {
      const point = this.trail[i]
      const f = point.force * this.speed * (1 - point.age / this.maxAge)
      point.x += point.vx * f
      point.y += point.vy * f
      point.age += 1

      if (point.age > this.maxAge) {
        this.trail.splice(i, 1)
      } else {
        this.drawPoint(point)
      }
    }

    this.texture.needsUpdate = true
  }
}

class HeroBackground {
  constructor(container) {
    this.container = container
    this.scene = null
    this.camera = null
    this.renderer = null
    this.mesh = null
    this.clock = new THREE.Clock()
    this.rafId = null
    this.touchTexture = null
    this.pointer = new THREE.Vector2(0.5, 0.5)
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    this.handleResize = this.onResize.bind(this)
    this.handlePointerMove = this.onPointerMove.bind(this)
    this.handleVisibilityChange = this.onVisibilityChange.bind(this)
  }

  init() {
    if (!this.container) return

    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.camera.position.z = 1

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
    })

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.domElement.className = 'hero__bg-canvas'
    this.container.prepend(this.renderer.domElement)

    this.touchTexture = new TouchTexture(64)

    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(this.container.clientWidth, this.container.clientHeight) },
        uPointer: { value: this.pointer.clone() },
        uTouchTexture: { value: this.touchTexture.texture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uPointer;
        uniform sampler2D uTouchTexture;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);

          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));

          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          vec2 uv = vUv;

          vec4 touchTex = texture2D(uTouchTexture, uv);
          float vx = -(touchTex.r * 2.0 - 1.0);
          float vy = -(touchTex.g * 2.0 - 1.0);
          float touchIntensity = touchTex.b;

          // === INTENSIDADE DO EFEITO NO CURSOR ===
          // O valor 0.22 controla a força da distorção ao mover o mouse
          // Aumente para distorção mais forte, diminua para mais sutil (ex: 0.05 = fraco, 0.5 = forte)
          uv.x += vx * 0.22 * touchIntensity;
          uv.y += vy * 0.22 * touchIntensity;

          vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
          vec2 p = (uv - 0.5) * aspect;
          vec2 pointer = (uPointer - 0.5) * aspect;

          float t = uTime * 0.28;
          float n1 = noise(p * 2.4 + vec2(t, -t * 0.8));
          float n2 = noise(p * 3.7 - vec2(t * 0.7, t * 1.1));
          float flow = mix(n1, n2, 0.5);

          // === BRILHO DO CURSOR (GLOW) ===
          // pointer * 0.2 = quanto a posição do mouse desloca o centro do glow (0.0 = fixo, 1.0 = segue totalmente)
          float d = length(p - pointer * 0.01);
          // smoothstep(0.55, ...) = raio do glow | * 0.22 = intensidade do brilho no cursor
          float pointerGlow = smoothstep(0.3, 0.0, d) * 0.1;

          // === CORES DO HERO ===
          // Altere os valores RGB (0.0 a 1.0) para mudar as cores do fundo
          // blue = cor principal (tom mais escuro) | cyan = cor secundária (tom mais claro)
          vec3 blue = vec3(0.04, 0.10, 0.22);   // Azul escuro principal
          vec3 cyan = vec3(0.08, 0.22, 0.35);   // Azul secundário (mais claro)

          vec3 color = mix(blue, cyan, smoothstep(0.2, 0.95, flow + pointerGlow * 0.65));

          // === BRILHO GERAL ===
          // Primeiro valor (0.55) = brilho mínimo nas bordas | Segundo valor (0.30) = brilho extra no centro
          float vignette = smoothstep(2.15, 0.8, length((uv - 0.5) * vec2(1.25, 1.0)));
          color *= 0.55 + vignette * 0.30;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)

    window.addEventListener('resize', this.handleResize)
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true })
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    this.onResize()
    this.animate()
  }

  onPointerMove(event) {
    const rect = this.container.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    const nx = THREE.MathUtils.clamp(x, 0, 1)
    const ny = THREE.MathUtils.clamp(1 - y, 0, 1)

    this.pointer.set(nx, ny)

    if (this.mesh?.material?.uniforms?.uPointer) {
      this.mesh.material.uniforms.uPointer.value.copy(this.pointer)
    }

    this.touchTexture?.addTouch({ x: nx, y: ny })
  }

  onResize() {
    if (!this.renderer || !this.mesh) return
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    this.renderer.setSize(width, height)
    this.mesh.material.uniforms.uResolution.value.set(width, height)
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate())
    if (!this.renderer || !this.scene || !this.camera || !this.mesh) return

    const delta = this.clock.getDelta()
    this.touchTexture?.update()
    this.mesh.material.uniforms.uTime.value += this.prefersReducedMotion ? delta * 0.1 : delta
    this.renderer.render(this.scene, this.camera)
  }

  onVisibilityChange() {
    if (document.hidden && this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
      return
    }

    if (!document.hidden && !this.rafId) {
      this.clock.getDelta()
      this.animate()
    }
  }

  destroy() {
    cancelAnimationFrame(this.rafId)
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('pointermove', this.handlePointerMove)
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)

    if (this.mesh) {
      this.mesh.geometry.dispose()
      this.mesh.material.dispose()
    }

    if (this.renderer) {
      this.renderer.dispose()
      this.renderer.domElement.remove()
    }
  }
}

export function initHeroBackground() {
  const hero = document.querySelector('.hero')
  if (!hero) return null

  const isDesktop = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches
  if (!isDesktop) return null

  const heroBackground = new HeroBackground(hero)
  heroBackground.init()
  return heroBackground
}