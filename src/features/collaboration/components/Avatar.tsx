import { CollabMember, isAgent } from '../data';

interface AvatarProps {
  member?: CollabMember;
  emoji?: string;
  initial?: string;
  color?: string;        // gradient classes e.g. 'from-amber-400 to-orange-500'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'w-5 h-5 text-[8px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-[13px]',
  lg: 'w-12 h-12 text-[16px]',
  xl: 'w-16 h-16 text-[22px]',
};

// Agent identity is conveyed by the <AgentBadge /> next to the name (see below),
// not by an overlay on the avatar. Keeps avatars clean and uniform.
export function Avatar({
  member,
  emoji,
  initial,
  color,
  size = 'md',
}: AvatarProps) {
  let content: string;
  let bgClass = '';
  let isHuman = true;

  if (member) {
    if (isAgent(member)) {
      content = member.avatarEmoji;
      bgClass = 'bg-foreground/[0.06]';
      isHuman = false;
    } else {
      content = member.avatarInitial;
      bgClass = `bg-gradient-to-br ${member.avatarColor}`;
    }
  } else if (emoji) {
    content = emoji;
    bgClass = 'bg-foreground/[0.06]';
    isHuman = false;
  } else {
    content = initial || '?';
    bgClass = color ? `bg-gradient-to-br ${color}` : 'bg-foreground/10';
  }

  return (
    <div
      className={`${SIZE[size]} rounded-full flex items-center justify-center ${isHuman ? 'text-white' : ''} ${bgClass} ring-1 ring-border/40 overflow-hidden flex-shrink-0`}
    >
      <span className="leading-none">{content}</span>
    </div>
  );
}
