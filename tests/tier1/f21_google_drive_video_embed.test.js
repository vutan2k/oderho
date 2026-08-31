import { setTier, test } from '../framework/runner.js';
import { assert, assertEquals, assertContains } from '../framework/assert.js';
import {
  extractGoogleDriveFileId,
  isGoogleDriveUrl,
  getEmbedVideoUrl,
  isEmbeddableVideo
} from '../../src/utils/videoUrlHelper.js';

setTier('Tier 1: Feature Coverage');

test('[F21-1] Google Drive share link correctly extracts file ID and normalizes to /preview embed', () => {
  const sampleFileId = '1A2b3C4d5E6F7g8H9IjKlMnOpQrStUvWx';
  const url = `https://drive.google.com/file/d/${sampleFileId}/view?usp=sharing`;
  const fileId = extractGoogleDriveFileId(url);
  assertEquals(fileId, sampleFileId);

  const embedUrl = getEmbedVideoUrl(url);
  assertEquals(embedUrl, `https://drive.google.com/file/d/${sampleFileId}/preview`);
});

test('[F21-2] Google Drive ?id= parameter format support', () => {
  const sampleFileId = '1A2b3C4d5E6F7g8H9IjKlMnOpQrStUvWx';
  const url = `https://drive.google.com/open?id=${sampleFileId}`;
  const fileId = extractGoogleDriveFileId(url);
  assertEquals(fileId, sampleFileId);
  assertEquals(getEmbedVideoUrl(url), `https://drive.google.com/file/d/${sampleFileId}/preview`);
});

test('[F21-3] YouTube watch & Shorts URL embed normalization', () => {
  const ytWatch = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  assertContains(getEmbedVideoUrl(ytWatch), 'youtube-nocookie.com/embed/dQw4w9WgXcQ');

  const ytShorts = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
  assertContains(getEmbedVideoUrl(ytShorts), 'youtube-nocookie.com/embed/dQw4w9WgXcQ');
});

test('[F21-4] Google Drive URL detection and embeddable check', () => {
  const sampleFileId = '1A2b3C4d5E6F7g8H9IjKlMnOpQrStUvWx';
  assert(isGoogleDriveUrl(`https://drive.google.com/file/d/${sampleFileId}/view`));
  assert(isGoogleDriveUrl(`https://docs.google.com/file/d/${sampleFileId}/edit`));
  assert(!isGoogleDriveUrl('https://example.com/video.mp4'));

  assert(isEmbeddableVideo(`https://drive.google.com/file/d/${sampleFileId}/view`));
  assert(isEmbeddableVideo('https://www.youtube.com/watch?v=123'));
  assert(!isEmbeddableVideo('https://example.com/video.mp4'));
});
