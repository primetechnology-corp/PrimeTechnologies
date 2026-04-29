import * as THREE from 'three'

class FooterBackground {
  constructor(container) {
    this.container = container
    this.scene = null
    this.camera = null
    this.renderer = null
    this.mesh = null
    this.clock = new THREE.Timer()
    this.rafId = null
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.time = 0

    this.handleResize = this.onResize.bind(this)
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
    this.renderer.domElement.className = 'footer__bg-canvas'
    this.container.prepend(this.renderer.domElement)

    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(this.container.clientWidth, this.container.clientHeight) },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
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

        float fbm(vec2 st) {
          float value = 0.0;
          float amplitude = 0.5;
          vec2 shift = vec2(100.0);
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(st);
            st = st * 2.0 + shift;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec2 uv = vUv;
          vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
          vec2 p = (uv - 0.5) * aspect;
          vec2 pointer = (uPointer - 0.5) * aspect;

          float t = uTime * 0.45;

          // Multi-layered noise for more dynamic movement
          float n1 = fbm(p * 2.2 + vec2(t * 0.6, -t * 0.4));
          float n2 = fbm(p * 3.0 - vec2(t * 0.5, t * 0.7));
          float n3 = noise(p * 5.0 + vec2(t * 1.2, t * 0.3));
          float flow = mix(n1, n2, 0.5) + n3 * 0.15;

          // Warping effect - distort UV based on noise for organic movement
          vec2 warp = vec2(
            noise(p * 3.0 + vec2(t * 0.8, 0.0)),
            noise(p * 3.0 + vec2(0.0, t * 0.6))
          );
          float warpedFlow = fbm(p * 2.0 + warp * 0.5 + vec2(t * 0.3));
          flow = mix(flow, warpedFlow, 0.4);

          // Pointer glow - more visible autonomous glow
          float d = length(p - pointer * 0.3);
          float pointerGlow = smoothstep(0.5, 0.0, d) * 0.25;

          // Secondary moving glow
          vec2 pointer2 = vec2(
            sin(t * 0.7 + 1.5) * 0.3,
            cos(t * 0.5 + 2.0) * 0.2
          );
          float d2 = length(p - pointer2);
          float glow2 = smoothstep(0.45, 0.0, d2) * 0.15;

          // Colors
          vec3 blue = vec3(0.04, 0.10, 0.22);
          vec3 cyan = vec3(0.08, 0.22, 0.35);
          vec3 accent = vec3(0.12, 0.30, 0.45);

          vec3 color = mix(blue, cyan, smoothstep(0.15, 0.85, flow + pointerGlow * 0.65));
          color = mix(color, accent, smoothstep(0.6, 1.0, flow + glow2));

          // Add glow highlights
          color += vec3(0.02, 0.06, 0.10) * pointerGlow * 2.0;
          color += vec3(0.01, 0.04, 0.08) * glow2 * 2.0;

          // Vignette
          float vignette = smoothstep(2.15, 0.8, length((uv - 0.5) * vec2(1.25, 1.0)));
          color *= 0.55 + vignette * 0.35;

          // Top and bottom gradient fade to dark (blends with surrounding sections)
          float fadeTop = smoothstep(0.0, 0.18, uv.y);
          float fadeBottom = smoothstep(1.0, 0.82, uv.y);
          float fadeMask = fadeTop * fadeBottom;

          // Blend with the dark background color at the edges
          vec3 darkBg = vec3(0.043, 0.102, 0.165); // $color-dark-blue approx
          color = mix(darkBg, color, fadeMask);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)

    window.addEventListener('resize', this.handleResize)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    this.onResize()
    this.animate()
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
    const dt = this.prefersReducedMotion ? delta * 0.1 : delta
    this.time += dt
    this.mesh.material.uniforms.uTime.value += dt

    // Autonomous pointer movement - multiple overlapping waves for organic motion
    const px = 0.5 + 0.3 * Math.sin(this.time * 0.4) * Math.cos(this.time * 0.23)
                     + 0.1 * Math.sin(this.time * 0.8 + 1.0)
    const py = 0.5 + 0.3 * Math.cos(this.time * 0.35) * Math.sin(this.time * 0.28)
                     + 0.1 * Math.cos(this.time * 0.7 + 2.0)
    this.mesh.material.uniforms.uPointer.value.set(px, py)

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

export function initFooterEffect() {
  const container = document.getElementById('footerCta')
  if (!container) return null

  const footerBackground = new FooterBackground(container)
  footerBackground.init()
  return footerBackground
}