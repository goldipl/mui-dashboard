import type {
  ActivityEvent,
  Article,
  ArticlePriority,
  ArticleStatus,
  ContentBlock,
  EditorProfile,
  Photo,
  PhotoLicense,
  SiteId,
  Video,
  VideoStatus,
} from '../types';
import { createRandom, type Random } from '../utils/random';
import { slugify } from '../utils/text';
import { AUTHORS, CURRENT_USER_ID, SITES } from './sites';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/**
 * Headline building blocks per site: `subject + action + object`.
 * Actions use the singular verb form; subjects ending in "s" are treated as plural (see `buildHeadline`).
 */
const HEADLINES: Record<SiteId, { subjects: string[]; actions: string[]; objects: string[] }> = {
  herald: {
    subjects: ['Parliament', 'The prime minister', 'Opposition leaders', 'City council', 'EU ministers', 'The constitutional court', 'Regional governors', 'Health officials'],
    actions: ['approves', 'rejects', 'debates', 'announces', 'postpones', 'unveils', 'questions'],
    objects: ['new housing reform', 'budget amendment', 'climate package', 'education bill', 'border agreement', 'pension changes', 'public transport plan', 'digital services rules'],
  },
  sport: {
    subjects: ['Local derby', 'National team', 'Title favourites', 'Veteran striker', 'Young sprinter', 'Championship leaders', 'Basketball champions', 'Rookie driver'],
    actions: ['clinches', 'misses out on', 'fights back to secure', 'celebrates', 'targets', 'confirms', 'eyes'],
    objects: ['last-minute victory', 'record-breaking season', 'cup final spot', 'new contract', 'podium finish', 'world ranking lead', 'home advantage', 'summer transfer'],
  },
  tech: {
    subjects: ['Open-source community', 'Chip makers', 'Regulators', 'Fintech startup', 'Researchers', 'Smartphone makers', 'Cloud providers', 'Security experts'],
    actions: ['launches', 'warns about', 'releases', 'invests in', 'demonstrates', 'rethinks', 'accelerates'],
    objects: ['on-device AI assistant', 'quantum networking test', 'foldable display', 'zero-trust platform', 'battery breakthrough', 'satellite internet service', 'privacy-first browser', 'robotics lab'],
  },
  business: {
    subjects: ['Central bank', 'Stock markets', 'Energy giant', 'Retail chain', 'Logistics group', 'Tech investors', 'Property developers', 'Car manufacturers'],
    actions: ['raises forecast for', 'cuts', 'reports surge in', 'bets on', 'reviews', 'expands', 'pauses'],
    objects: ['interest rates', 'quarterly profits', 'renewable projects', 'online sales', 'warehouse network', 'dividend policy', 'urban housing', 'electric vehicle output'],
  },
  lifestyle: {
    subjects: ['Nutritionists', 'Travel experts', 'Award-winning chef', 'City museums', 'Designers', 'Sleep researchers', 'Weekend guide', 'Festival organisers'],
    actions: ['recommends', 'reveals', 'reinvents', 'celebrates', 'rediscovers', 'explores', 'shares'],
    objects: ['seasonal superfoods', 'hidden coastal towns', 'classic comfort dishes', 'modern art collections', 'sustainable wardrobe staples', 'evening routines', 'mountain escapes', 'street food traditions'],
  },
};

const LEADS = [
  'Our correspondents explain what the decision means for readers and what is likely to happen next.',
  'The announcement came after weeks of speculation and is expected to shape the coming months.',
  'Analysts say the move could have wide-reaching consequences, while critics call for more transparency.',
  'Here is everything you need to know, from the key numbers to the reactions of those directly affected.',
  'The story is developing quickly – we bring you the facts, the context and the most important voices.',
];

const PARAGRAPHS = [
  'The announcement was made on Tuesday morning during a press conference attended by dozens of journalists. Officials emphasised that the plan had been prepared over several months and consulted with experts from different fields.',
  'According to figures shared with our newsroom, the change will affect hundreds of thousands of people across the country. The first measurable effects are expected within the next two quarters, although some observers believe it may take longer.',
  'Critics argue that the timeline is too ambitious and that key details are still missing. Several organisations have already requested additional documents and announced that they will closely monitor the implementation.',
  'Supporters, on the other hand, point to similar solutions introduced abroad, which they say delivered tangible results. They stress that delaying the decision would only increase costs in the long run.',
  'Behind the scenes, negotiations continued late into the night. People familiar with the talks said that the final compromise was reached only after a number of concessions were made by all sides.',
  'Experts interviewed by our reporters agree on one thing: the coming weeks will be crucial. How the details are communicated to the public may determine whether the initiative succeeds.',
  'Local communities reacted with a mix of optimism and caution. Many residents told us they welcome the change in principle but want clear information on how it will affect their daily lives.',
  'We will continue to follow the story and update this article as new information becomes available. Readers can share their questions with our editorial team using the contact form below.',
];

const QUOTES = [
  { text: 'This is a turning point, and we intend to make the most of it.', caption: 'Spokesperson, quoted at the press briefing' },
  { text: 'We need facts, not promises. The details will decide everything.', caption: 'Independent analyst' },
  { text: 'For the first time in years, people feel they are being heard.', caption: 'Community organiser' },
];

const SUBHEADINGS = ['What happens next', 'The key numbers', 'Reactions', 'Why it matters', 'Background'];

const TAGS: Record<SiteId, string[]> = {
  herald: ['government', 'elections', 'europe', 'policy', 'interview', 'analysis', 'breaking'],
  sport: ['football', 'transfer', 'league', 'match report', 'olympics', 'interview', 'live'],
  tech: ['ai', 'smartphones', 'cybersecurity', 'startups', 'research', 'review', 'space'],
  business: ['markets', 'inflation', 'earnings', 'energy', 'property', 'banking', 'analysis'],
  lifestyle: ['health', 'recipes', 'travel', 'culture', 'wellbeing', 'fashion', 'weekend'],
};

const PHOTO_SUBJECTS = [
  'City skyline at dusk', 'Parliament building facade', 'Crowd at a football stadium', 'Runner crossing the finish line',
  'Close-up of a circuit board', 'Developer working at night', 'Trading floor screens', 'Container port at sunrise',
  'Fresh vegetables at a market', 'Mountain hiking trail', 'Modern art gallery interior', 'Street protest with banners',
  'Wind turbines in a field', 'Coffee shop interior', 'Press conference podium', 'Tennis court from above',
  'Electric car charging', 'Old town square', 'Airport departure hall', 'Laboratory researcher',
];

/** Each subject appears three times in the library, as different shots. */
const PHOTO_VARIANTS = ['', ' – wide shot', ' – close-up'];

const PHOTO_CREDITS = ['NewsPix Agency', 'Staff photographer', 'Global Image Network', 'Freelance contributor', 'Northlight Photo Desk'];
const LICENSES: PhotoLicense[] = ['editorial', 'royalty_free', 'rights_managed', 'creative_commons'];

const VIDEO_TITLES = [
  'Morning briefing: top stories of the day', 'Match highlights: derby night', 'Hands-on with the new foldable',
  'Markets explained in 90 seconds', 'Inside the newsroom: election coverage', 'Chef’s table: a five-minute pasta',
  'Interview: the minister answers readers’ questions', 'Behind the scenes at the science fair', 'Weekend weather outlook',
  'Transfer window recap', 'How ransomware works – explained', 'City cycling routes reviewed', 'Startup pitch day highlights',
  'Energy prices: what changes next month', 'Travel diary: a weekend by the sea', 'Training camp exclusive',
  'AI in classrooms: teachers react', 'Fashion week in three minutes',
];

/** Public domain sample clips used as playable sources in the demo. */
const VIDEO_SOURCES = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
];

export function photoUrl(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

function buildBody(rand: Random, photos: Photo[], prefix: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const paragraphs = rand.sample(PARAGRAPHS, rand.int(3, 6));
  paragraphs.forEach((text, index) => {
    if (index === 2) {
      blocks.push({ id: `${prefix}-h`, type: 'heading', text: rand.pick(SUBHEADINGS) });
    }
    blocks.push({ id: `${prefix}-p${index}`, type: 'paragraph', text });
    if (index === 1 && rand.chance(0.5)) {
      const quote = rand.pick(QUOTES);
      blocks.push({ id: `${prefix}-q`, type: 'quote', text: quote.text, caption: quote.caption });
    }
    if (index === 3 && rand.chance(0.4)) {
      const photo = rand.pick(photos);
      blocks.push({ id: `${prefix}-img`, type: 'image', mediaId: photo.id, caption: photo.caption });
    }
  });
  return blocks;
}

function buildPhotos(rand: Random, now: number): Photo[] {
  return Array.from({ length: 60 }, (_, index) => {
    const id = `ph-${String(index + 1).padStart(3, '0')}`;
    const subject = PHOTO_SUBJECTS[index % PHOTO_SUBJECTS.length];
    const landscape = rand.chance(0.8);
    const width = landscape ? 1600 : 1000;
    const height = landscape ? 1000 : 1400;
    const seed = `newsroom-${index + 1}`;
    const siteTags = TAGS[rand.pick(SITES).id];
    return {
      id,
      title: `${subject}${PHOTO_VARIANTS[Math.floor(index / PHOTO_SUBJECTS.length) % PHOTO_VARIANTS.length]}`,
      caption: `${subject}. Photo taken for the newsroom archive.`,
      url: photoUrl(seed, width, height),
      thumbnailUrl: photoUrl(seed, landscape ? 480 : 340, landscape ? 300 : 476),
      width,
      height,
      credit: rand.pick(PHOTO_CREDITS),
      license: rand.pick(LICENSES),
      tags: rand.sample(siteTags, rand.int(1, 3)),
      format: rand.pick(['jpg', 'jpg', 'webp', 'png'] as const),
      sizeKb: rand.int(280, 4800),
      uploadedAt: new Date(now - rand.int(1, 120) * DAY - rand.int(0, 23) * HOUR).toISOString(),
      uploadedBy: rand.pick(AUTHORS).id,
    };
  }).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

function buildVideos(rand: Random, now: number): Video[] {
  return VIDEO_TITLES.map((title, index) => {
    const status: VideoStatus = index === 1 ? 'processing' : index === 7 ? 'failed' : 'ready';
    const site = SITES[index % SITES.length];
    return {
      id: `vid-${String(index + 1).padStart(3, '0')}`,
      title,
      description: `${title}. Produced by the newsroom video desk for ${site.name}.`,
      thumbnailUrl: photoUrl(`newsroom-video-${index + 1}`, 640, 360),
      src: VIDEO_SOURCES[index % VIDEO_SOURCES.length],
      durationSec: rand.int(45, 900),
      status,
      progress: status === 'processing' ? 35 : 100,
      resolution: rand.pick(['720p', '1080p', '1080p', '4K'] as const),
      sizeMb: rand.int(18, 1400),
      siteId: site.id,
      tags: rand.sample(TAGS[site.id], 2),
      views: status === 'ready' ? rand.int(800, 240_000) : 0,
      uploadedAt: new Date(now - index * rand.int(10, 40) * HOUR).toISOString(),
      uploadedBy: rand.pick(['u-007', 'u-007', 'u-003', 'u-001']),
    };
  });
}

function pickStatus(rand: Random, ageDays: number): ArticleStatus {
  if (ageDays < 0) return 'scheduled';
  if (ageDays < 1) return rand.pick(['draft', 'in_review', 'in_review', 'published', 'published'] as const);
  if (ageDays < 3) return rand.pick(['draft', 'in_review', 'published', 'published', 'published'] as const);
  return rand.chance(0.08) ? 'archived' : rand.chance(0.07) ? 'draft' : 'published';
}

/**
 * Builds a headline with subject–verb agreement. Actions are written for a singular subject
 * ("targets"), so for plural subjects ("Basketball champions") the first verb is made plural ("target").
 */
export function buildHeadline(subject: string, action: string, object: string): string {
  const isPlural = subject.endsWith('s');
  const [verb, ...rest] = action.split(' ');
  const pluralVerb = /(ch|sh|ss|x|z)es$/.test(verb) ? verb.slice(0, -2) : verb.replace(/s$/, '');
  return `${subject} ${[isPlural ? pluralVerb : verb, ...rest].join(' ')} ${object}`;
}

const SCHEDULED_COUNT = 8;

function buildArticles(rand: Random, now: number, photos: Photo[]): Article[] {
  const articles: Article[] = [];
  const total = 150;

  for (let index = 0; index < total; index += 1) {
    const site = SITES[index % SITES.length];
    const parts = HEADLINES[site.id];
    const title = buildHeadline(rand.pick(parts.subjects), rand.pick(parts.actions), rand.pick(parts.objects));
    // A handful of articles are scheduled in the future; the rest are spread over the last 30 days.
    const ageDays =
      index < SCHEDULED_COUNT
        ? -rand.int(1, 6) / 2
        : Math.max(0.05, ((index - SCHEDULED_COUNT) / (total - SCHEDULED_COUNT)) * 30 + rand.next() * 0.8 - 0.4);
    const createdAt = now - Math.max(ageDays, 0.05) * DAY - rand.int(1, 6) * HOUR;
    const status = pickStatus(rand, ageDays);
    const authors = AUTHORS.filter((author) => author.siteIds.includes(site.id));
    const author = rand.pick(authors);
    const id = `art-${String(index + 1).padStart(4, '0')}`;
    const priority: ArticlePriority = rand.chance(0.04) ? 'breaking' : rand.chance(0.2) ? 'high' : rand.chance(0.15) ? 'low' : 'normal';
    // Never publish in the future: recent articles go live at most 10 minutes before "now".
    const publishedAt =
      status === 'published' || status === 'archived'
        ? Math.min(createdAt + rand.int(1, 5) * HOUR, now - 10 * 60_000)
        : undefined;
    const scheduledAt = status === 'scheduled' ? now + Math.abs(ageDays) * DAY + rand.int(1, 8) * HOUR : undefined;
    const ageFactor = Math.max(1, 30 - ageDays);
    const views = publishedAt ? Math.round(rand.int(400, 9000) * (priority === 'breaking' ? 6 : 1) * (ageFactor / 10)) : 0;
    const lead = `${title}. ${rand.pick(LEADS)}`;
    const body = buildBody(rand, photos, id);
    const updatedAt = Math.min(now, (publishedAt ?? createdAt) + rand.int(0, 12) * HOUR);
    const editorId = rand.pick(['u-001', 'u-002', 'u-004']);

    articles.push({
      id,
      title,
      slug: slugify(title),
      lead,
      body,
      siteId: site.id,
      category: rand.pick(site.categories),
      tags: rand.sample(TAGS[site.id], rand.int(2, 4)),
      authorId: author.id,
      status,
      priority,
      featuredImageId: rand.chance(0.85) ? rand.pick(photos).id : undefined,
      createdAt: new Date(createdAt).toISOString(),
      updatedAt: new Date(updatedAt).toISOString(),
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      views,
      comments: publishedAt ? Math.round(views / rand.int(80, 400)) : 0,
      isPremium: rand.chance(0.15),
      allowComments: rand.chance(0.85),
      editorNotes: status === 'in_review' ? 'Please double-check the figures in paragraph two.' : '',
      seo: {
        metaTitle: title.slice(0, 60),
        metaDescription: lead.slice(0, 155),
        noIndex: false,
      },
      revisions: [
        {
          id: `${id}-r1`,
          createdAt: new Date(createdAt).toISOString(),
          authorId: author.id,
          note: 'First draft',
          snapshot: { title, lead, body },
        },
        ...(status !== 'draft'
          ? [
              {
                id: `${id}-r2`,
                createdAt: new Date(updatedAt).toISOString(),
                authorId: editorId,
                note: 'Copy edit and fact check',
                snapshot: { title, lead, body },
              },
            ]
          : []),
      ],
    });
  }

  return articles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function buildActivity(articles: Article[], photos: Photo[]): ActivityEvent[] {
  const fromArticles: ActivityEvent[] = articles.slice(0, 18).map((article, index) => {
    const type = article.status === 'published' ? 'article_status' : index % 3 === 0 ? 'article_created' : 'article_updated';
    const verb =
      type === 'article_status' ? 'published' : type === 'article_created' ? 'created a draft of' : 'updated';
    return {
      id: `act-a-${article.id}`,
      type,
      message: `${AUTHORS.find((a) => a.id === article.authorId)?.name ?? 'Someone'} ${verb} “${article.title}”`,
      at: article.updatedAt,
      actorId: article.authorId,
      articleId: article.id,
    };
  });
  const fromPhotos: ActivityEvent[] = photos.slice(0, 4).map((photo) => ({
    id: `act-p-${photo.id}`,
    type: 'photo_uploaded',
    message: `${AUTHORS.find((a) => a.id === photo.uploadedBy)?.name ?? 'Someone'} uploaded photo “${photo.title}”`,
    at: photo.uploadedAt,
    actorId: photo.uploadedBy,
  }));
  return [...fromArticles, ...fromPhotos].sort((a, b) => b.at.localeCompare(a.at));
}

function buildProfile(now: number): EditorProfile {
  const user = AUTHORS.find((author) => author.id === CURRENT_USER_ID)!;
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    phone: '+48 600 000 000',
    location: 'Warsaw, Poland',
    bio: 'Senior editor responsible for the politics and business desks. Coordinates breaking news coverage, mentors young reporters and cares about clear, well-sourced journalism.',
    joinedAt: new Date(now - 6.4 * 365 * DAY).toISOString(),
    languages: ['English', 'Polish', 'German'],
    beats: ['Politics', 'Economy', 'Technology policy', 'Elections'],
    siteIds: user.siteIds,
    social: { x: '@morganblake_news', linkedin: 'linkedin.com/in/morgan-blake-news' },
    defaultSiteId: 'herald',
    notifications: {
      emailOnReview: true,
      emailOnPublish: false,
      pushBreakingNews: true,
      weeklyDigest: true,
    },
  };
}

export interface SeedData {
  articles: Article[];
  photos: Photo[];
  videos: Video[];
  activity: ActivityEvent[];
  profile: EditorProfile;
}

/** Builds a fresh, reproducible demo dataset relative to `now`. */
export function createSeedData(now: number = Date.now()): SeedData {
  const rand = createRandom(20261106);
  const photos = buildPhotos(rand, now);
  const videos = buildVideos(rand, now);
  const articles = buildArticles(rand, now, photos);
  return {
    articles,
    photos,
    videos,
    activity: buildActivity(articles, photos),
    profile: buildProfile(now),
  };
}
