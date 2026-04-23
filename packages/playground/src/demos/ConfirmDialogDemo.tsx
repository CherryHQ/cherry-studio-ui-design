import { useState } from "react"
import { Section, type PropDef } from "../components/Section"
import { ConfirmDialog, Button } from "@cherry-studio/ui"

const props: PropDef[] = [
  { name: "open", type: "boolean", description: "Whether the dialog is visible" },
  { name: "title", type: "string", description: "Dialog title" },
  { name: "message", type: "string", description: "Description / confirmation message" },
  { name: "confirmLabel", type: "string", default: '"确认"', description: "Confirm button text" },
  { name: "cancelLabel", type: "string", default: '"取消"', description: "Cancel button text" },
  { name: "danger", type: "boolean", default: "false", description: "Use destructive styling for confirm" },
  { name: "onConfirm", type: "() => void", description: "Called on confirm" },
  { name: "onCancel", type: "() => void", description: "Called on cancel or close" },
]

export function ConfirmDialogDemo() {
  const [open1, setOpen1] = useState(false)
  const [open2, setOpen2] = useState(false)

  return (
    <>
      <Section
        title="Basic & Danger"
        props={props}
        code={`const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>删除</Button>

<ConfirmDialog
  open={open}
  title="删除知识库"
  message="确定要删除「AI 技术文档」吗？所有数据源和配置将被永久移除。"
  confirmLabel="删除"
  danger
  onConfirm={() => { doDelete(); setOpen(false) }}
  onCancel={() => setOpen(false)}
/>`}
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setOpen1(true)}>
            Normal Confirm
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setOpen2(true)}>
            Danger Confirm
          </Button>
        </div>

        <ConfirmDialog
          open={open1}
          title="确认操作"
          message="是否确认执行此操作？"
          onConfirm={() => setOpen1(false)}
          onCancel={() => setOpen1(false)}
        />

        <ConfirmDialog
          open={open2}
          title="删除知识库"
          message="确定要删除「AI 技术文档」吗？所有数据源和配置将被永久移除。"
          confirmLabel="删除"
          danger
          onConfirm={() => setOpen2(false)}
          onCancel={() => setOpen2(false)}
        />
      </Section>
    </>
  )
}
