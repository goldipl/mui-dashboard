import Avatar, { type AvatarProps } from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { initials, stringToColor } from '../utils/text';

interface UserAvatarProps extends Omit<AvatarProps, 'children'> {
  name: string;
  size?: number;
  withTooltip?: boolean;
}

/** Initials-based avatar with a stable colour per name. */
export function UserAvatar({ name, size = 32, withTooltip = false, sx, ...props }: UserAvatarProps) {
  const avatar = (
    <Avatar
      alt={name}
      sx={[
        { width: size, height: size, fontSize: size * 0.4, fontWeight: 700, bgcolor: stringToColor(name), color: '#fff' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {initials(name)}
    </Avatar>
  );
  return withTooltip ? <Tooltip title={name}>{avatar}</Tooltip> : avatar;
}
