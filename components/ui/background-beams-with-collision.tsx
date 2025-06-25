"use client"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import React, { useRef, useState, useEffect } from "react"

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  // You can customize the beams here
  const beams = [
    { left: 10, duration: 7, repeatDelay: 3, delay: 2 },
    { left: 600, duration: 3, repeatDelay: 3, delay: 4 },
    { left: 100, duration: 7, repeatDelay: 7, className: "h-6" },
    { left: 400, duration: 5, repeatDelay: 14, delay: 4 },
    { left: 800, duration: 11, repeatDelay: 2, className: "h-20" },
    { left: 1000, duration: 4, repeatDelay: 2, className: "h-12" },
    { left: 1200, duration: 6, repeatDelay: 4, delay: 2, className: "h-6" },
  ]

  return (
    <div
      ref={parentRef}
      className={cn(
        // SỬA LỖI 1: Hộp ngoài chỉ còn nhiệm vụ làm nền, xác định kích thước và overflow
        "h-auto min-h-[40rem] bg-gradient-to-b from-white to-neutral-100 relative w-full overflow-hidden",
        className,
      )}
    >
      {/* Các tia sáng vẫn nằm ở đây, được định vị tuyệt đối so với hộp ngoài */}
      {beams.map((beam, index) => (
        <CollisionMechanism key={index} beamOptions={beam} containerRef={containerRef} parentRef={parentRef} />
      ))}

      {/* SỬA LỖI 2: Tạo một hộp bên trong để căn chỉnh nội dung */}
      <div className="w-full h-full flex flex-col items-center justify-start pt-20 md:pt-20">
        {/* Children (nội dung của bạn) giờ nằm an toàn trong hộp này */}
        <div className="relative z-10 w-full">
          {children}
        </div>

        {/* Vùng va chạm được đặt ngay sát chân Hero */}
        <div ref={containerRef} className="w-full h-0 absolute bottom-0 left-0" />
      </div>
    </div>
  )
}


// --- CÁC COMPONENT BÊN DƯỚI GIỮ NGUYÊN KHÔNG THAY ĐỔI ---

const CollisionMechanism = React.forwardRef<
  HTMLDivElement,
  {
    containerRef: React.RefObject<HTMLDivElement>
    parentRef: React.RefObject<HTMLDivElement>
    beamOptions?: {
      left?: number
      duration?: number
      delay?: number
      repeatDelay?: number
      className?: string
    }
  }
>(({ parentRef, containerRef, beamOptions = {} }, ref) => {
  const beamRef = useRef<HTMLDivElement>(null)
  const [collision, setCollision] = useState<{
    detected: boolean
    coordinates: { x: number; y: number } | null
  }>({
    detected: false,
    coordinates: null,
  })
  const [beamKey, setBeamKey] = useState(0)
  const [showBeam, setShowBeam] = useState(true)
  const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false)

  const {
    left = 0,
    duration = 4,
    delay = 0,
    repeatDelay = 0,
    className = "",
  } = beamOptions

  useEffect(() => {
    const checkCollision = () => {
      if (beamRef.current && containerRef.current && parentRef.current && !cycleCollisionDetected && showBeam) {
        const beamRect = beamRef.current.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        const parentRect = parentRef.current.getBoundingClientRect()

        if (beamRect.bottom >= containerRect.top) {
          const relativeX = beamRect.left - parentRect.left + beamRect.width / 2
          const relativeY = beamRect.bottom - parentRect.top

          setCollision({
            detected: true,
            coordinates: {
              x: relativeX,
              y: relativeY,
            },
          })
          setCycleCollisionDetected(true)
          setShowBeam(false)
        }
      }
    }

    const animationInterval = setInterval(checkCollision, 50)
    return () => clearInterval(animationInterval)
  }, [cycleCollisionDetected, containerRef, showBeam])

  useEffect(() => {
    if (collision.detected && collision.coordinates) {
      setTimeout(() => {
        setCollision({ detected: false, coordinates: null })
        setCycleCollisionDetected(false)
        setShowBeam(true)
        setBeamKey((prevKey) => prevKey + 1)
      }, 2000 + (repeatDelay * 1000))
    }
  }, [collision, repeatDelay])

  return (
    <>
      {showBeam && (
        <motion.div
          key={beamKey}
          ref={beamRef}
          style={{ left: left, position: "absolute" }}
          animate={{ y: 800 }}
          initial={{ y: -200 }}
          transition={{
            duration: duration,
            repeat: 0,
            ease: "linear",
            delay: delay,
          }}
          className={cn(
            "top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-transparent",
            className,
          )}
        />
      )}
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`${collision.coordinates.x}-${collision.coordinates.y}`}
            className=""
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
})

CollisionMechanism.displayName = "CollisionMechanism"

const Explosion = ({ ...props }: React.HTMLProps<HTMLDivElement>) => {
  const spans = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
  }))

  return (
    <div {...props} className={cn("absolute z-50 h-2 w-2", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm"
      ></motion.div>
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"
        />
      ))}
    </div>
  )
}