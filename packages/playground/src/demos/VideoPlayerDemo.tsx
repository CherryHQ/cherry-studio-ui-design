import React, { useState, useEffect, useRef } from "react"
import { VideoPlayer, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { RotateCcw } from "lucide-react"

const videoPlayerProps: PropDef[] = [
  { name: "duration", type: "number", default: "8", description: "总时长（秒）" },
  { name: "currentTime", type: "number", default: "0", description: "当前时间（秒）" },
  { name: "isPlaying", type: "boolean", default: "false", description: "是否播放中" },
  { name: "onPlay", type: "() => void", default: "-", description: "播放回调" },
  { name: "onPause", type: "() => void", default: "-", description: "暂停回调" },
  { name: "onSeek", type: "(time: number) => void", default: "-", description: "跳转回调" },
]

export function VideoPlayerDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const duration = 8
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) { setIsPlaying(false); return duration }
          return prev + 0.1
        })
      }, 100)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying])

  return (
    <>
      <Section title="Video Player" props={videoPlayerProps} code={`import { VideoPlayer } from "@cherry-studio/ui"

<VideoPlayer
  duration={8}
  currentTime={currentTime}
  isPlaying={isPlaying}
  onPlay={() => setIsPlaying(true)}
  onPause={() => setIsPlaying(false)}
  onSeek={(t) => setCurrentTime(t)}
/>`}>
        <div className="space-y-3 max-w-md">
          <VideoPlayer
            duration={duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onSeek={t => setCurrentTime(t)}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="xs" className="gap-1" onClick={() => { setCurrentTime(0); setIsPlaying(false) }}>
              <RotateCcw size={10} /> Reset
            </Button>
            <span className="text-xs text-muted-foreground/40">{currentTime.toFixed(1)}s / {duration}s</span>
          </div>
        </div>
      </Section>

      <Section title="Static States">
        <div className="space-y-3 max-w-md">
          <VideoPlayer duration={12} currentTime={0} />
          <VideoPlayer duration={30} currentTime={15} isPlaying />
          <VideoPlayer duration={5} currentTime={5} />
        </div>
      </Section>
    </>
  )
}
