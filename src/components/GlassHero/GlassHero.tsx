"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders";
import { LogoMarquee } from "@/components/LogoMarquee";

const config = {
  lerpFactor: 0.035,
  parallaxStrength: 0.1,
  distortionMultiplier: 10,
  glassStrength: 2.0,
  glassSmoothness: 0.0001,
  stripesFrequency: 35,
  edgePadding: 0.1,
};

const DEFAULT_IMAGES = {
  desktop: "/images/hero-desktop.jpg",
  mobile: "/images/hero-mobile.jpg",
};

const MOBILE_BREAKPOINT = 768;

interface GlassHeroProps {
  desktopImage?: string;
  mobileImage?: string;
  headline?: string;
  tagline?: string;
}

export function GlassHero({
  desktopImage,
  mobileImage,
  headline = "Designed for the space between silence and noise.",
  tagline = "Developed by Codegrid",
}: GlassHeroProps) {
  const images = {
    desktop: desktopImage || DEFAULT_IMAGES.desktop,
    mobile: mobileImage || DEFAULT_IMAGES.mobile,
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const lastWidthRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);

  // Detect mobile on mount and capture fixed height once
  useEffect(() => {
    const width = window.innerWidth;
    const isMobileDevice = width < MOBILE_BREAKPOINT;
    lastWidthRef.current = width;
    setIsMobile(isMobileDevice);

    // Capture viewport height once on mount for mobile to prevent
    // jarring resize when browser chrome hides/shows
    if (isMobileDevice) {
      setFixedHeight(window.innerHeight);
    }

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const nowMobile = currentWidth < MOBILE_BREAKPOINT;
      const widthChanged = Math.abs(currentWidth - lastWidthRef.current) > 100;

      // Only recapture height on significant width changes (orientation/breakpoint)
      // not on height changes from toolbar show/hide
      if (widthChanged) {
        lastWidthRef.current = currentWidth;
        setIsMobile(nowMobile);

        if (nowMobile) {
          setFixedHeight(window.innerHeight);
        } else {
          setFixedHeight(null);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const imageSrc = isMobile ? images.mobile : images.desktop;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const mouse = { x: 0.5, y: 0.5 };
    const targetMouse = { x: 0.5, y: 0.5 };

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uResolution: {
          value: new THREE.Vector2(
            container.clientWidth,
            container.clientHeight
          ),
        },
        uTextureSize: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(mouse.x, mouse.y) },
        uParallaxStrength: { value: config.parallaxStrength },
        uDistortionMultiplier: { value: config.distortionMultiplier },
        uGlassStrength: { value: config.glassStrength },
        ustripesFrequency: { value: config.stripesFrequency },
        uglassSmoothness: { value: config.glassSmoothness },
        uEdgePadding: { value: config.edgePadding },
      },
      vertexShader,
      fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageSrc, (texture) => {
      material.uniforms.uTexture.value = texture;
      material.uniforms.uTextureSize.value.set(
        texture.image.width,
        texture.image.height
      );
    });

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = 1.0 - e.clientY / window.innerHeight;
    };

    // Touch support for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartMouseX = 0.5;
    let touchStartMouseY = 0.5;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartMouseX = targetMouse.x;
      touchStartMouseY = targetMouse.y;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = (touch.clientX - touchStartX) / window.innerWidth;
      const deltaY = (touch.clientY - touchStartY) / window.innerHeight;

      // Amplify the movement for a more noticeable effect
      const sensitivity = 3.0;
      targetMouse.x = Math.max(0, Math.min(1, touchStartMouseX + deltaX * sensitivity));
      targetMouse.y = Math.max(0, Math.min(1, touchStartMouseY - deltaY * sensitivity));
    };

    const handleResize = () => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      material.uniforms.uResolution.value.set(
        container.clientWidth,
        container.clientHeight
      );
    };

    // Scroll-scrub on mobile: slightly shift the parallax as user scrolls
    const handleScroll = () => {
      if (!isMobile || !container) return;
      const rect = container.getBoundingClientRect();
      const sectionHeight = rect.height;
      // Progress: 0 when hero top is at viewport top, 1 when hero is fully scrolled off
      const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));
      // Map scroll progress to a horizontal shift (0.15 → 0.85)
      targetMouse.x = 0.15 + progress * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    if (isMobile) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    let frameCount = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Throttle to ~30fps on mobile to reduce GPU load
      if (isMobile && ++frameCount % 2 !== 0) return;

      mouse.x = lerp(mouse.x, targetMouse.x, config.lerpFactor);
      mouse.y = lerp(mouse.y, targetMouse.y, config.lerpFactor);
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(frameRef.current);

      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      geometry.dispose();
      material.dispose();
    };
  }, [isMobile]);

  const marqueeHeight = 75;
  const mobileMarqueeHeight = Math.round(marqueeHeight * 0.75);
  const currentMarqueeHeight = isMobile ? mobileMarqueeHeight : marqueeHeight;

  return (
    <section
      className={`relative w-full overflow-hidden ${!fixedHeight ? "h-dvh" : ""}`}
      style={{
        ["--desktop-marquee" as string]: `${marqueeHeight}px`,
        ["--mobile-marquee" as string]: `${mobileMarqueeHeight}px`,
        ...(fixedHeight && { height: `${fixedHeight}px` }),
      }}
    >
      {/* Hidden image for SEO/accessibility */}
      <Image
        src={isMobile ? images.mobile : images.desktop}
        alt="Hero background"
        fill
        className="hidden"
        priority
      />

      {/* Three.js canvas container - extends full section */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Logo marquee - positioned at bottom, 75% width with slanted edge */}
      <div
        className="absolute bottom-0 left-0 w-4/5 sm:w-3/4 h-[var(--mobile-marquee)] md:h-[var(--desktop-marquee)]"
      >
        <LogoMarquee height={marqueeHeight} />
      </div>

      {/* Hero content overlay - positioned above the marquee */}
      <div
        className="absolute left-0 w-full p-5 sm:p-8 flex flex-col-reverse items-start gap-20 bottom-[var(--mobile-marquee)] md:bottom-[var(--desktop-marquee)]"
      >
        <h1 className="font-light font-serif w-3/5 max-md:w-full text-white text-8xl max-md:text-6xl tracking-tight leading-none">
          {headline}
        </h1>
        {tagline && <p className="text-white text-sm font-medium">{tagline}</p>}
      </div>
    </section>
  );
}
