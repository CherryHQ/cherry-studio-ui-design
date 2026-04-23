"use client"

import * as React from "react"

import { cn } from "../../lib/utils"

// @lobehub/icons — ProviderIcon renders colored avatar/icon for any known AI provider
import LobeProviderIcon from "@lobehub/icons/es/features/ProviderIcon"

interface LogoProps {
  size?: number
  className?: string
}

// Generic helper: letter-badge for brands without public SVG
function LetterBadge({
  letter,
  bg,
  size = 16,
  className,
}: {
  letter: string
  bg: string
  size?: number
  className?: string
}) {
  const isCssClass = bg.startsWith("bg-")
  return (
    <div
      data-slot="brand-logos"
      className={cn(
        "flex items-center justify-center text-white shrink-0",
        isCssClass && bg,
        className
      )}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        ...(isCssClass ? {} : { background: bg }),
        fontSize: size * 0.45,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {letter}
    </div>
  )
}

// OpenAI (official green #10a37f)
function OpenAILogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#10a37f"
      className={className}
    >
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  )
}

// Anthropic / Claude (theme-adaptive)
function AnthropicLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("text-[#B8865A] dark:text-[#D4A27F]", className)}
    >
      <path d="M17.304 3.541h-3.672l6.696 16.918h3.672zm-10.608 0L0 20.459h3.744l1.37-3.553h7.005l1.369 3.553h3.744L10.536 3.541zm-.372 10.339l2.304-5.964 2.304 5.964z" />
    </svg>
  )
}

// Google (official multicolor)
function GoogleLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

// Microsoft (official four-color)
function MicrosoftLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  )
}

// GitHub (theme-adaptive)
function GitHubLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("text-[#24292f] dark:text-[#f0f0f0]", className)}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

// Notion (theme-adaptive)
function NotionLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("text-[#000000] dark:text-[#ffffffee]", className)}
    >
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.075 2.31c-.466-.373-.98-.746-2.054-.653l-12.72.933c-.466.047-.56.28-.373.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.886c-.56.047-.747.327-.747.934zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.494-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.222.187c-.093-.187 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.027.793-1.074l3.456-.233 4.764 7.28v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.054-.047 3.082.7l4.249 2.986c.7.513.933.653.933 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.046-1.448-.094-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.84.373-1.54 1.448-1.632z" />
    </svg>
  )
}

// Obsidian (official purple)
function ObsidianLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        d="M16.567 1.29l-8.1 3.18c-.29.12-.53.34-.67.62L2.857 14.87c-.15.31-.17.67-.06.99l2.46 7.12c.15.42.5.74.93.85.11.03.22.04.33.04.33 0 .64-.13.87-.37l4.09-4.2 4.73 3.6c.23.17.5.27.79.27.12 0 .25-.02.37-.06.4-.12.72-.43.85-.83l5.33-17.66c.11-.37.05-.77-.17-1.09-.22-.32-.57-.52-.95-.55l-6.85-.66z"
        fill="#A88BFA"
      />
      <path d="M7.38 21.2l-2.04-5.9 4.3-8.6.34 9.47z" fill="#7C3AED" />
      <path
        d="M17.2 21.38l-4.47-3.4-.38-10.7 8.1 1.42z"
        fill="#6633CC"
      />
    </svg>
  )
}

// Joplin (official blue #1071D3)
function JoplinLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#1071D3"
      className={className}
    >
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.2 17.4c0 1.656-1.344 3-3 3s-3-1.344-3-3V6.6h2.4v10.8c0 .33.27.6.6.6s.6-.27.6-.6V6.6h2.4z" />
    </svg>
  )
}

// Amazon S3 / AWS (official orange #FF9900)
function AWSLogo({ size = 16, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="#252F3E" d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.032-.863.104a6.37 6.37 0 0 0-.862.288 2.3 2.3 0 0 1-.28.104.488.488 0 0 1-.127.024c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167 4.596 4.596 0 0 1 1.015-.36 4.84 4.84 0 0 1 1.253-.168c.958 0 1.66.218 2.107.654.44.436.662 1.101.662 1.995v2.63zM4.67 11.56a2.3 2.3 0 0 0 .774-.136c.264-.088.503-.248.71-.472a1.12 1.12 0 0 0 .264-.432c.048-.16.08-.352.08-.574v-.28a6.47 6.47 0 0 0-.735-.136 5.3 5.3 0 0 0-.75-.048c-.535 0-.926.104-1.185.32-.26.215-.39.518-.39.918 0 .375.095.654.296.846.192.2.479.296.862.296zm6.36 1.091c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L8.766 5.491c-.048-.16-.072-.264-.072-.312 0-.128.064-.2.191-.2h.783c.152 0 .255.025.31.08.065.048.113.16.16.312l1.343 5.292 1.245-5.292c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.356 1.381-5.356c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.128 0 .2.064.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.192l-1.924 6.768c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.319-.08-.064-.056-.12-.16-.152-.32l-1.237-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.216-.151-.248-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.015-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415a3.32 3.32 0 0 1 1.007-.152c.176 0 .359.008.535.032.183.024.351.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.694 0 .223.08.415.24.567.16.152.454.304.87.44l1.133.358c.574.184.99.44 1.237.767.248.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.335.51-.575.703-.24.2-.527.344-.862.44a3.48 3.48 0 0 1-1.094.16z" />
      <path fill="#FF9900" d="M21.698 16.207c-2.626 1.94-6.442 2.97-9.722 2.97-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.27-.352 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.446-.2.814.288.385.607zM22.792 14.96c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z" />
    </svg>
  )
}

// Ollama (theme-adaptive)
function OllamaLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("text-[#1a1a1a] dark:text-[#f0f0f0]", className)}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.387 3.317c1.907 0 4.014.998 4.014 4.41 0 1.556-.62 2.844-1.609 3.703.547.375.986.906 1.277 1.533.392.85.392 1.763.392 2.474v.812c0 .69-.076 1.36-.48 1.907-.438.592-1.162.905-2.008 1.068-.834.16-1.836.19-2.83.19h-1.337c-.994 0-1.996-.03-2.83-.19-.846-.163-1.57-.476-2.008-1.068-.404-.548-.48-1.217-.48-1.907v-.812c0-.71 0-1.623.392-2.474.291-.627.73-1.158 1.277-1.533-.989-.86-1.609-2.147-1.609-3.703 0-3.412 2.107-4.41 4.014-4.41h1.825zm-.912 1.848c-1.34 0-2.323.612-2.323 2.562 0 1.23.6 2.285 1.614 2.916.274-.05.56-.078.852-.086h1.337c.292.008.578.035.852.086 1.013-.631 1.614-1.686 1.614-2.916 0-1.95-.983-2.562-2.323-2.562h-1.623zm.362 7.247c-.787.01-1.55.05-2.148.165-.547.105-.924.275-1.122.543-.172.233-.215.593-.215 1.13v.812c0 .537.043.897.215 1.13.198.268.575.438 1.122.543.598.115 1.361.155 2.334.155h1.337c.973 0 1.736-.04 2.334-.155.547-.105.924-.275 1.122-.543.172-.233.215-.593.215-1.13v-.812c0-.537-.043-.897-.215-1.13-.198-.268-.575-.438-1.122-.543-.598-.115-1.361-.155-2.148-.165zM9.35 9.18a1.17 1.17 0 1 0 0 2.34 1.17 1.17 0 0 0 0-2.34zm5.3 0a1.17 1.17 0 1 0 0 2.34 1.17 1.17 0 0 0 0-2.34z" />
    </svg>
  )
}

// Mistral (official block colors)
function MistralLogo({ size = 16, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="1" y="1" width="5" height="5" fill="#F7D046" />
      <rect x="18" y="1" width="5" height="5" fill="#F7D046" />
      <rect x="1" y="7" width="5" height="5" fill="#F2A73B" />
      <rect x="7" y="7" width="5" height="5" fill="#F2A73B" />
      <rect x="18" y="7" width="5" height="5" fill="#F2A73B" />
      <rect x="1" y="13" width="5" height="5" fill="#EE792F" />
      <rect x="7" y="13" width="5" height="5" fill="#EE792F" />
      <rect x="13" y="13" width="5" height="5" fill="#EE792F" />
      <rect x="18" y="13" width="5" height="5" fill="#EE792F" />
      <rect x="1" y="19" width="5" height="4" fill="#EB5829" />
      <rect x="7" y="19" width="5" height="4" fill="#EB5829" />
      <rect x="13" y="19" width="5" height="4" fill="#EB5829" />
      <rect x="18" y="19" width="5" height="4" fill="#EB5829" />
    </svg>
  )
}

// Gemini (official gradient blue to purple)
function GeminiLogo({ size = 16, className }: LogoProps) {
  const id = `gemini-${size}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 24A14.3 14.3 0 0 0 0 12 14.3 14.3 0 0 0 12 0a14.3 14.3 0 0 0 12 12 14.3 14.3 0 0 0-12 12z"
        fill={`url(#${id})`}
      />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="24" y2="24">
          <stop stopColor="#4285F4" />
          <stop offset="1" stopColor="#886FBF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Perplexity (official teal #20808D)
function PerplexityLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#20808D"
      className={className}
    >
      <path d="M12 1L3 7v10l9 6 9-6V7zm0 2.236L18.18 7.5 12 11.764 5.82 7.5zM5 8.764l6 4v7.472l-6-4zm8 11.472v-7.472l6-4v7.472z" />
    </svg>
  )
}

// Hugging Face (official yellow #FFD21E)
function HuggingFaceLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#FFD21E"
      className={className}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.5 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM6.75 13.5c0-.414.336-.75.75-.75h9a.75.75 0 0 1 0 1.5c0 2.485-2.015 4.5-4.5 4.5s-4.5-2.015-4.5-4.5a.75.75 0 0 1-.75-.75z" />
    </svg>
  )
}

// Yuque (official green #36B37E)
function YuqueLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#36B37E"
      className={className}
    >
      <path d="M3.374 6.143c-.392 0-.783.26-.783.652 0 .13.065.326.13.457l5.87 10.955c.262.457.785.652 1.241.457l9.784-4.174c.457-.196.653-.718.457-1.175L14.203 1.36c-.196-.457-.718-.653-1.175-.457L3.57 6.013c-.065.065-.13.065-.196.13zm17.252-2.77L13.94.112c-.522-.196-1.11.065-1.306.587a1.011 1.011 0 0 0 .587 1.306l6.686 3.26c.522.197 1.11-.065 1.306-.587a1.011 1.011 0 0 0-.587-1.306z" />
    </svg>
  )
}

// Alibaba Cloud (official orange #FF6A00)
function AlibabaCloudLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#FF6A00"
      className={className}
    >
      <path d="M3.996 6h4.074l1.5 2.25H3.996c-.828 0-1.5.672-1.5 1.5v4.5c0 .828.672 1.5 1.5 1.5h5.574l-1.5 2.25H3.996c-2.07 0-3.75-1.68-3.75-3.75v-4.5C.246 7.68 1.926 6 3.996 6zm16.008 0h-4.074l-1.5 2.25h5.574c.828 0 1.5.672 1.5 1.5v4.5c0 .828-.672 1.5-1.5 1.5h-5.574l1.5 2.25h4.074c2.07 0 3.75-1.68 3.75-3.75v-4.5c0-2.07-1.68-3.75-3.75-3.75zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    </svg>
  )
}

// WebDAV (cloud sync)
function WebDAVLogo({ size = 16, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4A90D9"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  )
}

// Qwen (official purple)
function QwenLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="Q" bg="#7C3AED" size={size} className={className} />
}

// iFlow (yellow lightning)
function IFlowLogo({ size = 16, className }: LogoProps) {
  return (
    <div
      className={cn("flex items-center justify-center shrink-0", className)}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: "#eab308",
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    </div>
  )
}

// Kimi / Moonshot (theme-adaptive)
function KimiLogo({ size = 16, className }: LogoProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center text-white shrink-0 bg-[#1a1a2e] dark:bg-[#f0f0f0] dark:text-[#1a1a2e]",
        className
      )}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        fontSize: size * 0.5,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      K
    </div>
  )
}

// SiliconFlow
function SiliconFlowLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="SF" bg="#3B82F6" size={size} className={className} />
}

// DeepSeek (official blue #4F6EF7)
function DeepSeekLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="DS" bg="#4f6ef7" size={size} className={className} />
}

// Coze (official indigo)
function CozeLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="C" bg="#4F46E5" size={size} className={className} />
}

// DuckDuckGo (official orange #DE5833)
function DuckDuckGoLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="DD" bg="#DE5833" size={size} className={className} />
}

// Dify (official blue)
function DifyLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="D" bg="#1677FF" size={size} className={className} />
}

// n8n (official coral)
function N8nLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="n8n" bg="#EA4B71" size={size} className={className} />
}

// Tavily
function TavilyLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="T" bg="#6366f1" size={size} className={className} />
}

// SearXNG
function SearXNGLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="S" bg="#0ea5e9" size={size} className={className} />
}

// Nutstore (official green)
function NutstoreLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="坚" bg="#45B058" size={size} className={className} />
}

// SiYuan (official red)
function SiYuanLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="思" bg="#D23F31" size={size} className={className} />
}

// ModelScope (official purple)
function ModelScopeLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="MS" bg="#624AFF" size={size} className={className} />
}

// Tesseract (official amber)
function TesseractLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="T" bg="#d97706" size={size} className={className} />
}

// PaddleOCR (official blue)
function PaddleLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="P" bg="#2563eb" size={size} className={className} />
}

// Groq (official orange)
function GroqLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="G" bg="#f97316" size={size} className={className} />
}

// Poe (official purple)
function PoeLogo({ size = 16, className }: LogoProps) {
  return <LetterBadge letter="P" bg="#7c3aed" size={size} className={className} />
}

// Lookup map: string id to React component
const BRAND_LOGO_MAP: Record<string, (props: LogoProps) => React.JSX.Element> = {
  // Major AI brands
  openai: OpenAILogo,
  chatgpt: OpenAILogo,
  anthropic: AnthropicLogo,
  claude: AnthropicLogo,
  google: GoogleLogo,
  "vertex-ai": GoogleLogo,
  aistudio: GoogleLogo,
  gemini: GeminiLogo,
  microsoft: MicrosoftLogo,
  bing: MicrosoftLogo,
  github: GitHubLogo,
  copilot: GitHubLogo,
  ghcopilot: GitHubLogo,
  ollama: OllamaLogo,
  mistral: MistralLogo,
  lechat: MistralLogo,
  deepseek: DeepSeekLogo,
  perplexity: PerplexityLogo,
  huggingchat: HuggingFaceLogo,
  qwen: QwenLogo,
  qwenchat: QwenLogo,
  iflow: IFlowLogo,
  kimi: KimiLogo,
  siliconflow: SiliconFlowLogo,

  // Note-taking & productivity
  notion: NotionLogo,
  obsidian: ObsidianLogo,
  joplin: JoplinLogo,

  // Cloud & infra
  aws: AWSLogo,
  s3: AWSLogo,
  webdav: WebDAVLogo,
  aliyun: AlibabaCloudLogo,
  modelscope: ModelScopeLogo,

  // Chinese brands
  yuque: YuqueLogo,
  siyuan: SiYuanLogo,
  jianguoyun: NutstoreLogo,

  // Search
  tavily: TavilyLogo,
  searxng: SearXNGLogo,
  duckduckgo: DuckDuckGoLogo,

  // Dev tools & platforms
  dify: DifyLogo,
  n8n: N8nLogo,
  coze: CozeLogo,
  groq: GroqLogo,
  poe: PoeLogo,

  // Doc services
  tesseract: TesseractLogo,
  paddleocr: PaddleLogo,
  "system-ocr": (props: LogoProps) => (
    <LetterBadge letter="OCR" bg="#374151" size={props.size} className={props.className} />
  ),
  mineru: (props: LogoProps) => (
    <LetterBadge letter="U" bg="#6366f1" size={props.size} className={props.className} />
  ),
  doc2x: (props: LogoProps) => (
    <LetterBadge letter="2x" bg="#ef4444" size={props.size} className={props.className} />
  ),

  // Image generation
  midjourney: (props: LogoProps) => (
    <LetterBadge letter="M" bg="#000000" size={props.size} className={props.className} />
  ),
  "stability ai": (props: LogoProps) => (
    <LetterBadge letter="S" bg="#7c3aed" size={props.size} className={props.className} />
  ),
  "black forest labs": (props: LogoProps) => (
    <LetterBadge letter="F" bg="#1a1a1a" size={props.size} className={props.className} />
  ),
  ideogram: (props: LogoProps) => (
    <LetterBadge letter="I" bg="#3b82f6" size={props.size} className={props.className} />
  ),
  replicate: (props: LogoProps) => (
    <LetterBadge letter="R" bg="#0f172a" size={props.size} className={props.className} />
  ),
  "together ai": (props: LogoProps) => (
    <LetterBadge letter="T" bg="#0ea5e9" size={props.size} className={props.className} />
  ),
  leonardoai: (props: LogoProps) => (
    <LetterBadge letter="L" bg="#8b5cf6" size={props.size} className={props.className} />
  ),

  // Other
  grok: (props: LogoProps) => (
    <LetterBadge letter="X" bg="#000000" size={props.size} className={props.className} />
  ),
  grokx: (props: LogoProps) => (
    <LetterBadge letter="X" bg="#000000" size={props.size} className={props.className} />
  ),
  bolt: (props: LogoProps) => (
    <LetterBadge letter="b" bg="#000000" size={props.size} className={props.className} />
  ),
  notebooklm: (props: LogoProps) => (
    <LetterBadge letter="NL" bg="#f59e0b" size={props.size} className={props.className} />
  ),
  tokenflux: (props: LogoProps) => (
    <LetterBadge letter="TF" bg="#7c3aed" size={props.size} className={props.className} />
  ),
  lanyun: (props: LogoProps) => (
    <LetterBadge letter="蓝" bg="#06b6d4" size={props.size} className={props.className} />
  ),
  "302ai": (props: LogoProps) => (
    <LetterBadge letter="302" bg="#f97316" size={props.size} className={props.className} />
  ),
  "mcp-router": (props: LogoProps) => (
    <LetterBadge letter="MR" bg="#374151" size={props.size} className={props.className} />
  ),
  cherry: (props: LogoProps) => (
    <LetterBadge letter="C" bg="#10b981" size={props.size} className={props.className} />
  ),
  "cherry-in": (props: LogoProps) => (
    <LetterBadge letter="🍒" bg="#10b981" size={props.size} className={props.className} />
  ),
}

// IDs known to @lobehub/icons ProviderIcon (subset we use)
const LOBE_PROVIDER_IDS = new Set([
  "openai", "chatgpt", "anthropic", "claude", "google", "vertex-ai", "aistudio",
  "gemini", "ollama", "deepseek", "mistral", "lechat", "groq", "qwen", "qwenchat",
  "meta", "perplexity", "github", "copilot", "huggingchat", "huggingface",
  "moonshot", "kimi", "minimax", "zhipu", "baidu", "yi",
])

// Alias mapping for ProviderIcon provider prop
const LOBE_ID_ALIAS: Record<string, string> = {
  chatgpt: "openai",
  "vertex-ai": "google",
  aistudio: "google",
  lechat: "mistral",
  qwenchat: "qwen",
  copilot: "github",
  ghcopilot: "github",
  huggingchat: "huggingface",
  kimi: "moonshot",
}

/** Get a brand logo component by id. Tries @lobehub/icons ProviderIcon first, then built-in SVG, then letter badge. */
function BrandLogo({
  id,
  fallbackLetter,
  fallbackColor,
  size = 16,
  className,
}: {
  id: string
  fallbackLetter?: string
  fallbackColor?: string
  size?: number
  className?: string
}) {
  const key = id.toLowerCase()

  // 1. Try @lobehub/icons ProviderIcon (colored avatar)
  if (LOBE_PROVIDER_IDS.has(key)) {
    const provider = LOBE_ID_ALIAS[key] || key
    return <LobeProviderIcon provider={provider} size={size} type="avatar" className={className} />
  }

  // 2. Try built-in BRAND_LOGO_MAP
  const Logo = BRAND_LOGO_MAP[key]
  if (Logo) return <Logo size={size} className={className} />

  // 3. Fallback to letter badge
  if (fallbackLetter)
    return (
      <LetterBadge
        letter={fallbackLetter}
        bg={fallbackColor || "#6b7280"}
        size={size}
        className={className}
      />
    )
  return null
}

export {
  LetterBadge,
  OpenAILogo,
  AnthropicLogo,
  GoogleLogo,
  MicrosoftLogo,
  GitHubLogo,
  NotionLogo,
  ObsidianLogo,
  JoplinLogo,
  AWSLogo,
  OllamaLogo,
  MistralLogo,
  GeminiLogo,
  PerplexityLogo,
  HuggingFaceLogo,
  YuqueLogo,
  AlibabaCloudLogo,
  WebDAVLogo,
  QwenLogo,
  IFlowLogo,
  KimiLogo,
  SiliconFlowLogo,
  DeepSeekLogo,
  CozeLogo,
  DuckDuckGoLogo,
  DifyLogo,
  N8nLogo,
  TavilyLogo,
  SearXNGLogo,
  NutstoreLogo,
  SiYuanLogo,
  ModelScopeLogo,
  TesseractLogo,
  PaddleLogo,
  GroqLogo,
  PoeLogo,
  BrandLogo,
  BRAND_LOGO_MAP,
}

export type { LogoProps }
