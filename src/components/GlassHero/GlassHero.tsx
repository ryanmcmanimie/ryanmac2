"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders";

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

interface FractalGlassHeroProps {
  desktopImage?: string;
  mobileImage?: string;
  headline?: string;
  tagline?: string;
}

export function FractalGlassHero({
  desktopImage,
  mobileImage,
  headline = "Designed for the space between silence and noise.",
  tagline = "Developed by Codegrid",
}: FractalGlassHeroProps) {
  const images = {
    desktop: desktopImage || DEFAULT_IMAGES.desktop,
    mobile: mobileImage || DEFAULT_IMAGES.mobile,
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const imageSrc = isMobile ? images.mobile : images.desktop;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

    const handleResize = () => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      material.uniforms.uResolution.value.set(
        container.clientWidth,
        container.clientHeight
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      mouse.x = lerp(mouse.x, targetMouse.x, config.lerpFactor);
      mouse.y = lerp(mouse.y, targetMouse.y, config.lerpFactor);
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameRef.current);

      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      geometry.dispose();
      material.dispose();
    };
  }, [isMobile]);

  return (
    <section className="relative w-full h-svh overflow-hidden">
      {/* Hidden image for SEO/accessibility */}
      <Image
        src={isMobile ? images.mobile : images.desktop}
        alt="Hero background"
        fill
        className="hidden"
        priority
      />

      {/* Three.js canvas container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Hero content overlay */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end max-md:flex-col-reverse max-md:items-start max-md:gap-4">
        <h1 className="font-light w-3/5 max-md:w-full text-white text-6xl max-md:text-4xl tracking-tight leading-none">
          {headline}
        </h1>
        {tagline && <p className="text-white text-sm font-medium">{tagline}</p>}
      </div>
    </section>
  );
}
