import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { PriorityChip, SiteChip, StatusChip } from '../../components/Chips';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { UserAvatar } from '../../components/UserAvatar';
import { useNotify } from '../../hooks/useNotify';
import { findPhoto, getAuthorName } from '../../store/selectors';
import { useNewsroom } from '../../store/useNewsroom';
import type { Article, ArticlePriority, ArticleStatus } from '../../types';
import { formatCompact, formatDateTime, formatRelative } from '../../utils/format';
import { PRIORITY_META, STATUS_META, STATUS_ORDER } from '../../utils/workflow';

const PRIORITY_RANK: Record<ArticlePriority, number> = { low: 0, normal: 1, high: 2, breaking: 3 };

interface ArticlesTableProps {
  articles: Article[];
  hideSite?: boolean;
  hideAuthor?: boolean;
  checkboxSelection?: boolean;
  selection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  pageSize?: number;
  height?: number | string;
}

/** Data grid with all article columns and row actions (edit, duplicate, delete). */
export function ArticlesTable({
  articles,
  hideSite = false,
  hideAuthor = false,
  checkboxSelection = false,
  selection,
  onSelectionChange,
  pageSize = 25,
  height = 640,
}: ArticlesTableProps) {
  const navigate = useNavigate();
  const notify = useNotify();
  const { state, actions } = useNewsroom();
  const [toDelete, setToDelete] = useState<Article | null>(null);

  const columns = useMemo<GridColDef<Article>[]>(() => {
    const cols: GridColDef<Article>[] = [
      {
        field: 'title',
        headerName: 'Headline',
        flex: 1,
        minWidth: 320,
        renderCell: ({ row }) => {
          const photo = findPhoto(state.photos, row.featuredImageId);
          return (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', height: '100%', minWidth: 0 }}>
              <Box
                sx={{
                  width: 64,
                  height: 42,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  flexShrink: 0,
                  bgcolor: 'action.hover',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {photo ? (
                  <Box component="img" src={photo.thumbnailUrl} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageNotSupportedRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                    {row.title || 'Untitled article'}
                  </Typography>
                  {row.isPremium && (
                    <Tooltip title="Premium content">
                      <WorkspacePremiumRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    </Tooltip>
                  )}
                </Stack>
                <Typography variant="caption" noWrap component="p" sx={{ color: 'text.secondary' }}>
                  {row.category} · {row.tags.slice(0, 3).map((tag) => `#${tag}`).join(' ')}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      {
        field: 'siteId',
        headerName: 'Site',
        width: 150,
        renderCell: ({ row }) => <SiteChip siteId={row.siteId} short />,
      },
      {
        field: 'authorId',
        headerName: 'Author',
        width: 170,
        valueGetter: (_value, row) => getAuthorName(row.authorId),
        renderCell: ({ value }) => (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', height: '100%' }}>
            <UserAvatar name={String(value)} size={26} />
            <Typography variant="body2" noWrap>
              {String(value)}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        type: 'singleSelect',
        valueOptions: STATUS_ORDER.map((status) => ({ value: status, label: STATUS_META[status].label })),
        sortComparator: (a: ArticleStatus, b: ArticleStatus) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b),
        renderCell: ({ row }) => <StatusChip status={row.status} />,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 120,
        type: 'singleSelect',
        valueOptions: (Object.keys(PRIORITY_META) as ArticlePriority[]).map((p) => ({ value: p, label: PRIORITY_META[p].label })),
        sortComparator: (a: ArticlePriority, b: ArticlePriority) => PRIORITY_RANK[a] - PRIORITY_RANK[b],
        renderCell: ({ row }) => <PriorityChip priority={row.priority} />,
      },
      {
        field: 'updatedAt',
        headerName: 'Last update',
        width: 140,
        renderCell: ({ row }) => (
          <Tooltip title={formatDateTime(row.updatedAt)}>
            <span>{formatRelative(row.updatedAt)}</span>
          </Tooltip>
        ),
      },
      {
        field: 'views',
        headerName: 'Views',
        type: 'number',
        width: 90,
        valueFormatter: (value: number) => (value ? formatCompact(value) : '—'),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: '',
        width: 110,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditRoundedIcon />}
            label="Edit"
            onClick={() => navigate(`/publisher/articles/${row.id}`)}
          />,
          <GridActionsCellItem
            key="duplicate"
            icon={<ContentCopyRoundedIcon />}
            label="Duplicate"
            showInMenu
            onClick={() => {
              const copy = actions.duplicateArticle(row.id);
              if (copy) notify('Article duplicated as a new draft.');
            }}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteOutlineRoundedIcon />}
            label="Delete"
            showInMenu
            onClick={() => setToDelete(row)}
          />,
        ],
      },
    ];
    return cols.filter((col) => !(hideSite && col.field === 'siteId') && !(hideAuthor && col.field === 'authorId'));
  }, [actions, hideAuthor, hideSite, navigate, notify, state.photos]);

  const selectionModel = useMemo<GridRowSelectionModel>(
    () => ({ type: 'include', ids: new Set(selection ?? []) }),
    [selection],
  );

  return (
    <Box sx={{ height, width: '100%' }}>
      <DataGrid
        rows={articles}
        columns={columns}
        rowHeight={64}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick
        rowSelectionModel={selection ? selectionModel : undefined}
        onRowSelectionModelChange={(model) => {
          if (!onSelectionChange) return;
          const ids =
            model.type === 'include'
              ? [...model.ids].map(String)
              : articles.map((article) => article.id).filter((id) => !model.ids.has(id));
          onSelectionChange(ids);
        }}
        onRowDoubleClick={({ row }) => navigate(`/publisher/articles/${row.id}`)}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize } },
          sorting: { sortModel: [{ field: 'updatedAt', sort: 'desc' }] },
        }}
        localeText={{ noRowsLabel: 'No articles match the current filters' }}
        sx={{
          border: 0,
          '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
        }}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete article?"
        description={`“${toDelete?.title || 'Untitled article'}” will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          actions.deleteArticles([toDelete.id]);
          onSelectionChange?.((selection ?? []).filter((id) => id !== toDelete.id));
          notify('Article deleted.');
        }}
      />
    </Box>
  );
}
