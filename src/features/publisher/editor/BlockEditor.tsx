import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState, type ReactElement } from 'react';
import { MediaPickerDialog } from '../../../components/MediaPickerDialog';
import { findPhoto, findVideo } from '../../../store/selectors';
import { useNewsroom } from '../../../store/useNewsroom';
import type { ContentBlock, ContentBlockType } from '../../../types';
import { createBlock } from '../../../utils/articleFactory';
import { formatDuration } from '../../../utils/format';
import { HEADLINE_FONT } from '../../../theme/theme';

const BLOCK_TYPES: { type: ContentBlockType; label: string; icon: ReactElement }[] = [
  { type: 'paragraph', label: 'Paragraph', icon: <NotesRoundedIcon fontSize="small" /> },
  { type: 'heading', label: 'Subheading', icon: <TitleRoundedIcon fontSize="small" /> },
  { type: 'quote', label: 'Quote', icon: <FormatQuoteRoundedIcon fontSize="small" /> },
  { type: 'list', label: 'Bullet list', icon: <FormatListBulletedRoundedIcon fontSize="small" /> },
  { type: 'image', label: 'Image', icon: <ImageRoundedIcon fontSize="small" /> },
  { type: 'video', label: 'Video', icon: <VideocamRoundedIcon fontSize="small" /> },
];

const LABELS = Object.fromEntries(BLOCK_TYPES.map((b) => [b.type, b])) as Record<ContentBlockType, (typeof BLOCK_TYPES)[number]>;

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

/** Structured body editor: a list of typed blocks that can be inserted, reordered and removed. */
export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [insertMenu, setInsertMenu] = useState<{ anchor: HTMLElement; index: number } | null>(null);
  const [picker, setPicker] = useState<{ blockId: string; kind: 'photo' | 'video' } | null>(null);

  const update = (id: string, changes: Partial<ContentBlock>) =>
    onChange(blocks.map((block) => (block.id === id ? { ...block, ...changes } : block)));

  const remove = (id: string) => onChange(blocks.filter((block) => block.id !== id));

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const insert = (index: number, type: ContentBlockType) => {
    const block = createBlock(type);
    const next = [...blocks];
    next.splice(index, 0, block);
    onChange(next);
    if (type === 'image' || type === 'video') setPicker({ blockId: block.id, kind: type === 'image' ? 'photo' : 'video' });
  };

  const pickerBlock = picker ? blocks.find((b) => b.id === picker.blockId) : undefined;

  return (
    <Box>
      {blocks.map((block, index) => (
        <Box key={block.id}>
          <InsertLine onClick={(anchor) => setInsertMenu({ anchor, index })} />
          <BlockShell
            block={block}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
            onRemove={() => remove(block.id)}
          >
            <BlockContent
              block={block}
              onChange={(changes) => update(block.id, changes)}
              onPickMedia={(kind) => setPicker({ blockId: block.id, kind })}
            />
          </BlockShell>
        </Box>
      ))}

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {BLOCK_TYPES.map((item) => (
          <Button key={item.type} size="small" variant="outlined" color="inherit" startIcon={item.icon} onClick={() => insert(blocks.length, item.type)}>
            {item.label}
          </Button>
        ))}
      </Stack>

      <Menu anchorEl={insertMenu?.anchor} open={Boolean(insertMenu)} onClose={() => setInsertMenu(null)}>
        {BLOCK_TYPES.map((item) => (
          <MenuItem
            key={item.type}
            onClick={() => {
              if (insertMenu) insert(insertMenu.index, item.type);
              setInsertMenu(null);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <MediaPickerDialog
        open={Boolean(picker)}
        kind={picker?.kind ?? 'photo'}
        selectedId={pickerBlock?.mediaId}
        onClose={() => {
          // Remove empty media blocks when the picker is cancelled.
          if (pickerBlock && !pickerBlock.mediaId) remove(pickerBlock.id);
          setPicker(null);
        }}
        onSelect={(mediaId) => {
          if (picker) update(picker.blockId, { mediaId });
          setPicker(null);
        }}
      />
    </Box>
  );
}

function InsertLine({ onClick }: { onClick: (anchor: HTMLElement) => void }) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: 'opacity .15s',
        '&:hover, &:focus-within': { opacity: 1 },
        '&::before': { content: '""', position: 'absolute', left: 0, right: 0, top: '50%', borderTop: 1, borderColor: 'primary.main', borderTopStyle: 'dashed' },
      }}
    >
      <Tooltip title="Insert block here">
        <IconButton
          size="small"
          onClick={(e) => onClick(e.currentTarget)}
          aria-label="Insert block"
          sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'primary.main', color: 'primary.main', width: 22, height: 22, '&:hover': { bgcolor: 'background.paper' } }}
        >
          <AddRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

interface BlockShellProps {
  block: ContentBlock;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: ReactElement;
}

function BlockShell({ block, isFirst, isLast, onMoveUp, onMoveDown, onRemove, children }: BlockShellProps) {
  const meta = LABELS[block.type];
  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 1.5,
        pt: 1,
        transition: 'border-color .15s, box-shadow .15s',
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.5) },
        '&:focus-within': { borderColor: 'primary.main', boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}` },
        '&:hover .block-tools, &:focus-within .block-tools': { opacity: 1 },
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'center', mb: 0.5 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary', flex: 1 }}>
          {meta.icon}
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {meta.label}
          </Typography>
        </Stack>
        <Stack direction="row" className="block-tools" sx={{ opacity: { xs: 1, md: 0.35 }, transition: 'opacity .15s' }}>
          <IconButton size="small" onClick={onMoveUp} disabled={isFirst} aria-label="Move block up">
            <ArrowUpwardRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onMoveDown} disabled={isLast} aria-label="Move block down">
            <ArrowDownwardRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onRemove} aria-label="Remove block" color="error">
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      {children}
    </Box>
  );
}

interface BlockContentProps {
  block: ContentBlock;
  onChange: (changes: Partial<ContentBlock>) => void;
  onPickMedia: (kind: 'photo' | 'video') => void;
}

function BlockContent({ block, onChange, onPickMedia }: BlockContentProps) {
  const { state } = useNewsroom();

  switch (block.type) {
    case 'paragraph':
      return (
        <InputBase
          value={block.text ?? ''}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Write a paragraph…"
          multiline
          minRows={2}
          fullWidth
          sx={{ fontSize: 16, lineHeight: 1.7 }}
        />
      );
    case 'heading':
      return (
        <InputBase
          value={block.text ?? ''}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Subheading"
          fullWidth
          sx={{ fontSize: 21, fontWeight: 700, fontFamily: HEADLINE_FONT }}
        />
      );
    case 'quote':
      return (
        <Box sx={{ borderLeft: 4, borderColor: 'primary.main', pl: 2 }}>
          <InputBase
            value={block.text ?? ''}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Quote text"
            multiline
            fullWidth
            sx={{ fontSize: 18, fontStyle: 'italic' }}
          />
          <InputBase
            value={block.caption ?? ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="— Attribution"
            fullWidth
            sx={{ fontSize: 14, color: 'text.secondary' }}
          />
        </Box>
      );
    case 'list': {
      const items = block.items ?? [''];
      return (
        <Stack spacing={0.5}>
          {items.map((item, index) => (
            <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.primary', flexShrink: 0 }} />
              <InputBase
                value={item}
                onChange={(e) => onChange({ items: items.map((value, i) => (i === index ? e.target.value : value)) })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const next = [...items];
                    next.splice(index + 1, 0, '');
                    onChange({ items: next });
                  }
                }}
                placeholder="List item"
                fullWidth
              />
              <IconButton
                size="small"
                disabled={items.length === 1}
                onClick={() => onChange({ items: items.filter((_, i) => i !== index) })}
                aria-label="Remove list item"
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => onChange({ items: [...items, ''] })} sx={{ alignSelf: 'flex-start' }}>
            Add item
          </Button>
        </Stack>
      );
    }
    case 'image': {
      const photo = findPhoto(state.photos, block.mediaId);
      return (
        <MediaBlock
          thumbnail={photo?.url}
          meta={photo ? `${photo.credit} · ${photo.width}×${photo.height}` : undefined}
          caption={block.caption ?? ''}
          onCaption={(caption) => onChange({ caption })}
          onPick={() => onPickMedia('photo')}
          label="photo"
        />
      );
    }
    case 'video': {
      const video = findVideo(state.videos, block.mediaId);
      return (
        <MediaBlock
          thumbnail={video?.thumbnailUrl}
          meta={video ? `${video.title} · ${formatDuration(video.durationSec)}` : undefined}
          caption={block.caption ?? ''}
          onCaption={(caption) => onChange({ caption })}
          onPick={() => onPickMedia('video')}
          label="video"
        />
      );
    }
  }
}

interface MediaBlockProps {
  thumbnail?: string;
  meta?: string;
  caption: string;
  label: string;
  onCaption: (caption: string) => void;
  onPick: () => void;
}

function MediaBlock({ thumbnail, meta, caption, label, onCaption, onPick }: MediaBlockProps) {
  if (!thumbnail) {
    return (
      <Button variant="outlined" fullWidth onClick={onPick} sx={{ py: 3, borderStyle: 'dashed' }}>
        Choose a {label} from the library
      </Button>
    );
  }
  return (
    <Stack spacing={1}>
      <Box sx={{ position: 'relative', borderRadius: 1.5, overflow: 'hidden' }}>
        <Box component="img" src={thumbnail} alt="" sx={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block' }} />
        <Button size="small" variant="contained" color="inherit" onClick={onPick} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}>
          Replace
        </Button>
      </Box>
      {meta && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {meta}
        </Typography>
      )}
      <InputBase value={caption} onChange={(e) => onCaption(e.target.value)} placeholder="Caption" fullWidth sx={{ fontSize: 14 }} />
    </Stack>
  );
}
