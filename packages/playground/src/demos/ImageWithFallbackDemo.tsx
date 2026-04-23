import { Section, type PropDef } from "../components/Section"
import { ImageWithFallback } from "@cherry-studio/ui"

const props: PropDef[] = [
  { name: "src", type: "string", description: "Image source URL" },
  { name: "alt", type: "string", description: "Alt text for accessibility" },
  { name: "fallback", type: "React.ReactNode", description: "Custom fallback element on error (optional)" },
  { name: "...rest", type: "ImgHTMLAttributes", description: "All standard img attributes" },
]

export function ImageWithFallbackDemo() {
  return (
    <>
      <Section
        title="Basic Usage"
        props={props}
        code={`<ImageWithFallback
  src="https://picsum.photos/200/120"
  alt="Sample"
  className="rounded-xl object-cover"
/>

{/* Broken URL — shows fallback */}
<ImageWithFallback
  src="https://broken-url.example/no-image.jpg"
  alt="Broken"
  className="w-[200px] h-[120px] rounded-xl"
/>`}
      >
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Valid image</p>
            <ImageWithFallback
              src="https://picsum.photos/200/120"
              alt="Sample"
              className="rounded-xl object-cover"
              width={200}
              height={120}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Broken URL (fallback)</p>
            <ImageWithFallback
              src="https://broken-url.example/no-image.jpg"
              alt="Broken"
              className="w-[200px] h-[120px] rounded-xl"
            />
          </div>
        </div>
      </Section>

      <Section
        title="Custom Fallback"
        code={`<ImageWithFallback
  src="https://broken-url.example/fail.jpg"
  alt="Custom"
  className="w-[200px] h-[120px]"
  fallback={
    <div className="w-[200px] h-[120px] rounded-xl bg-accent/50 flex items-center justify-center">
      <span className="text-xs text-muted-foreground">No image</span>
    </div>
  }
/>`}
      >
        <ImageWithFallback
          src="https://broken-url.example/fail.jpg"
          alt="Custom"
          className="w-[200px] h-[120px]"
          fallback={
            <div className="w-[200px] h-[120px] rounded-xl bg-accent/50 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          }
        />
      </Section>
    </>
  )
}
