"use client";
import { useEffect, useState, useRef } from "react";
import SvgIcon from "@/app/_components/character/player";
import SvgIcon2 from "@/app/_components/character/player2";
// World хэмжээ (platform-уудын логик хэмжээнд тааруул)
const WORLD_W = 900;
const WORLD_H = 600;

// Платформууд
const PLATFORMS = [
  { x: 0, y: 504, w: 300, h: 96 }, // зүүн тал газар
  { x: 450, y: 504, w: 450, h: 96 }, // баруун тал газар
  { x: 400, y: 350, w: 200, h: 20 }, // жижиг платформ
];

const PLAYER_SIZE = { w: 56, h: 72 };

// Харагдах цонхны (viewport) хэмжээ — container-ийнхтай тааруул
const VIEW_W = 900;
const VIEW_H = 600;

export default function PicoGame() {
  const player = useRef({
    x: 100,
    y: 300,
    vx: 0,
    vy: 0,
    spawnX: 100,
    spawnY: 300,
  });
  const [pos, setPos] = useState({ x: 100, y: 300 });
  const [isFacingRight, setIsFacingRight] = useState(true);
  const [cameraX, setCameraX] = useState(0);

  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const onKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // helper: clamp
    const clamp = (v: number, a: number, b: number) =>
      Math.max(a, Math.min(b, v));

    const gameLoop = () => {
      const p = player.current;

      // ---- Movement input ----
      if (keys.current["ArrowRight"]) {
        p.vx += 1.0;
        setIsFacingRight(true);
      }
      if (keys.current["ArrowLeft"]) {
        p.vx -= 1.0;
        setIsFacingRight(false);
      }

      p.vx *= 0.85; // friction
      p.vy += 0.6; // gravity

      const nextX = p.x + p.vx;
      let nextY = p.y + p.vy;

      let onGround = false;

      // ---- Platform collision (top only) ----
      PLATFORMS.forEach((plat) => {
        if (
          nextX + PLAYER_SIZE.w > plat.x &&
          nextX < plat.x + plat.w &&
          p.y + PLAYER_SIZE.h <= plat.y &&
          nextY + PLAYER_SIZE.h >= plat.y
        ) {
          nextY = plat.y - PLAYER_SIZE.h;
          p.vy = 0;
          onGround = true;
        }
      });

      // ---- Jump ----
      if ((keys.current["Space"] || keys.current["ArrowUp"]) && onGround) {
        p.vy = -14;
      }

      // apply
      p.x = nextX;
      p.y = nextY;

      // ---- fell off => reset ----
      if (p.y > WORLD_H + 200) {
        p.x = p.spawnX;
        p.y = p.spawnY;
        p.vx = 0;
        p.vy = 0;
      }

      // ---- World boundaries (X) ----
      if (p.x < 0) p.x = 0;
      if (p.x > WORLD_W - PLAYER_SIZE.w) p.x = WORLD_W - PLAYER_SIZE.w;

      // ---- Camera follow (X) ----
      // Player-ийг дэлгэцний төв орчим байлгах
      const playerCenterX = p.x + PLAYER_SIZE.w / 2;
      const desiredCameraX = playerCenterX - VIEW_W / 2;

      // cameraX нь 0..(WORLD_W - VIEW_W) дотор байх ёстой
      const maxCamX = Math.max(0, WORLD_W - VIEW_W);
      const camX = clamp(desiredCameraX, 0, maxCamX);

      // жижиг smooth (дагаж гулгах мэдрэмж)
      setCameraX((prev) => prev + (camX - prev) * 0.15);

      // render pos
      setPos({ x: p.x, y: p.y });

      requestAnimationFrame(gameLoop);
    };

    const frame = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <main className="flex h-screen w-full items-center justify-center bg-indigo-50 p-4 font-mono">
      {/* VIEWPORT */}
      <div className="relative w-[900px] h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-slate-900">
        {/* WORLD (camera moves this) */}
        <div
          className="absolute left-0 top-0"
          style={{
            width: WORLD_W,
            height: WORLD_H,
            transform: `translate3d(${-cameraX}px, 0px, 0)`,
            willChange: "transform",
          }}
        >
          {/* Player */}
          <div
            className="absolute z-10 w-14 h-18"
            style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
          >
            <SvgIcon
              className={`w-full h-full transition-transform duration-150 ${
                !isFacingRight ? "-scale-x-100" : ""
              }`}
            />
            <SvgIcon2
              className={`w-full h-full transition-transform duration-150 ${
                !isFacingRight ? "-scale-x-100" : ""
              }`}
            />
          </div>

          {/* Platforms */}
          {PLATFORMS.map((plat, index) => (
            <div
              key={index}
              className="absolute bg-slate-900"
              style={{
                left: plat.x,
                top: plat.y,
                width: plat.w,
                height: plat.h,
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
