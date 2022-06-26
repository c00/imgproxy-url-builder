import autoRotate from './transformers/auto-rotate';
import background from './transformers/background';
import backgroundAlpha from './transformers/background-alpha';
import blur from './transformers/blur';
import brightness from './transformers/brightness';
import cacheBuster from './transformers/cache-buster';
import contrast from './transformers/contrast';
import crop from './transformers/crop';
import dpr from './transformers/dpr';
import enlarge from './transformers/enlarge';
import expires from './transformers/expires';
import extend from './transformers/extend';
import fallbackImageUrl from './transformers/fallback-image-url';
import fileName from './transformers/filename';
import format from './transformers/format';
import formatQuality from './transformers/format-quality';
import gifOptions from './transformers/gif-options';
import gravity from './transformers/gravity';
import jpegOptions from './transformers/jpeg-options';
import maxBytes from './transformers/max-bytes';
import minHeight from './transformers/min-height';
import minWidth from './transformers/min-width';
import pad from './transformers/pad';
import page from './transformers/page';
import pixelate from './transformers/pixelate';
import pngOptions from './transformers/png-options';
import preset from './transformers/preset';
import quality from './transformers/quality';
import resize from './transformers/resize';
import resizingAlgorithm from './transformers/resizing-algorithm';
import rotate from './transformers/rotate';
import saturation from './transformers/saturation';
import sharpen from './transformers/sharpen';
import skipProcessing from './transformers/skip-processing';
import stripColorProfile from './transformers/strip-color-profile';
import stripMetadata from './transformers/strip-metadata';
import style from './transformers/style';
import trim from './transformers/trim';
import unsharpen from './transformers/unsharpen';
import videoThumbnailSecond from './transformers/video-thumbnail-second';
import watermark from './transformers/watermark';
import watermarkSize from './transformers/watermark-size';
import watermarkText from './transformers/watermark-text';
import watermarkUrl from './transformers/watermark-url';
import zoom from './transformers/zoom';

import { encodeFilePath, generateSignature } from './utils';

/**
 * The build options
 */
type BuildOptions = {
  /**
   * The path to the target image, e.g. `https://example.com/foo.png`
   */
  path: string;

  /**
   * The base URL of the imgproxy instance, e.g. https://my-imgproxy.test
   */
  baseUrl?: string;

  /**
   * Whether to append the {@link BuildOptions.path} in plain.
   *
   * Defaults to false. If true, encodes the path to a  base64url
   */
  plain?: boolean;

  /**
   * The signature to apply
   */
  signature?: {
    /**
     * The hex-encoded key of the signature
     */
    key: string;

    /**
     * The hex encoded salt of the signature
     */
    salt: string;
  };
};

class ParamBuilder {
  /**
   * The currently applied imgproxy modifiers
   */
  public readonly modifiers: Map<keyof ParamBuilder, string>;

  public constructor(
    initialModifiers: Map<keyof ParamBuilder, string> = new Map(),
  ) {
    this.modifiers = initialModifiers;
  }

  /**
   * Creates a new param builder instance with a copy of the
   * current {@link ParamBuilder.modifiers}
   *
   * @returns A copy of this param builder
   */
  public clone(this: this): ParamBuilder {
    return new ParamBuilder(new Map(this.modifiers));
  }

  /**
   * Removes the specified modifier from the currently applied
   * modifiers
   *
   * @param modifier  The modifier
   */
  public unset(this: this, modifier: keyof ParamBuilder): this {
    this.modifiers.delete(modifier);
    return this;
  }

  /**
   * Builds the imgproxy URL
   *
   * If {@link BuildOptions.path} is supplied, the full URL path will be returned,
   * else only the stringified modifiers will be returned.
   *
   * If {@link BuildOptions.baseUrl} is supplied, the full imgproxy URL will be returned.
   *
   * @param options The build options
   *
   * @returns The imgproxy URL
   */
  public build(options?: BuildOptions): string {
    const { baseUrl, path, plain, signature } = options ?? {};
    const mods = Array.from(this.modifiers.values());
    if (!path) return mods.join('/');

    if (path && plain) mods.push('plain', path);
    else mods.push(encodeFilePath(path));

    const res = mods.join('/');

    // If no signature is calculated add a - as placeholder
    // See https://github.com/imgproxy/imgproxy/blob/b243a08254b9ca7da2c628429cd870c111ece5c9/docs/signing_the_url.md
    const finalPath = signature
      ? `${generateSignature(res, signature.key, signature.salt)}/${res}`
      : `-/${res}`;

    return baseUrl ? `${baseUrl}/${finalPath}` : `/${finalPath}`;
  }

  /**
   * Automatically rotates the image based on the EXIF orientation parameter
   */
  public autoRotate(this: this): this {
    this.modifiers.set('autoRotate', autoRotate());
    return this;
  }

  /**
   * Fills the image background with the specified color
   */
  public background(
    this: this,
    ...options: Parameters<typeof background>
  ): this {
    this.modifiers.set('background', background(...options));
    return this;
  }

  /**
   * Adds alpha channel to background.
   */
  public backgroundAlpha(
    this: this,
    ...options: Parameters<typeof backgroundAlpha>
  ): this {
    this.modifiers.set('backgroundAlpha', backgroundAlpha(...options));
    return this;
  }

  /**
   * Applies a gaussian blur filter to the image
   */
  public blur(this: this, ...options: Parameters<typeof blur>): this {
    this.modifiers.set('blur', blur(...options));
    return this;
  }

  /**
   * When set, imgproxy will adjust brightness of the resulting image.
   */
  public brightness(
    this: this,
    ...options: Parameters<typeof brightness>
  ): this {
    this.modifiers.set('brightness', brightness(...options));
    return this;
  }

  /**
   * Adds a cache buster to the imgproxy params
   */
  public cacheBuster(
    this: this,
    ...options: Parameters<typeof cacheBuster>
  ): this {
    this.modifiers.set('cacheBuster', cacheBuster(...options));
    return this;
  }

  /**
   * When set, imgproxy will adjust contrast of the resulting image.
   */
  public contrast(this: this, ...options: Parameters<typeof contrast>): this {
    this.modifiers.set('contrast', contrast(...options));
    return this;
  }

  /**
   * Crops the image
   *
   * @param options The cropping options
   */
  public crop(this: this, ...options: Parameters<typeof crop>): this {
    this.modifiers.set('crop', crop(...options));
    return this;
  }

  /**
   * Multiplies the dimensions according to the specified factor
   */
  public dpr(this: this, ...options: Parameters<typeof dpr>): this {
    this.modifiers.set('dpr', dpr(...options));
    return this;
  }

  /**
   * Enlarges the image of it is smaller than the given size
   */
  public enlarge(this: this): this {
    this.modifiers.set('enlarge', enlarge());
    return this;
  }

  /**
   * Returns a 404 if the provided timestamp expired
   */
  public expires(this: this, ...options: Parameters<typeof expires>): this {
    this.modifiers.set('expires', expires(...options));
    return this;
  }

  /**
   * Extends the image of it is smaller than the given size
   */
  public extend(this: this): this {
    this.modifiers.set('extend', extend());
    return this;
  }

  /**
   * Sets the fallback image url
   */
  public fallbackImageUrl(
    this: this,
    ...options: Parameters<typeof fallbackImageUrl>
  ): this {
    this.modifiers.set('fallbackImageUrl', fallbackImageUrl(...options));
    return this;
  }

  /**
   * Sets the filename for the Content-Disposition header
   */
  public filename(this: this, ...options: Parameters<typeof fileName>): this {
    this.modifiers.set('filename', fileName(...options));
    return this;
  }

  /**
   * Specifies the resulting image format
   */
  public format(this: this, ...options: Parameters<typeof format>): this {
    this.modifiers.set('format', format(...options));
    return this;
  }

  /**
   * Specifies the format quality
   */
  public formatQuality(
    this: this,
    ...options: Parameters<typeof formatQuality>
  ): this {
    this.modifiers.set('formatQuality', formatQuality(...options));
    return this;
  }

  /**
   * Allows redefining GIF saving options
   *
   * @deprecated  GIF optimizations are automatically applied when using
   *              imgproxy version 3.0.0 or newer.
   */
  public gifOptions(
    this: this,
    ...options: Parameters<typeof gifOptions>
  ): this {
    this.modifiers.set('gifOptions', gifOptions(...options));
    return this;
  }

  /**
   * Sets the gravity
   */
  public gravity(this: this, ...options: Parameters<typeof gravity>): this {
    this.modifiers.set('gravity', gravity(...options));
    return this;
  }

  /**
   * Allows redefining JPEG saving options
   */
  public jpegOptions(
    this: this,
    ...options: Parameters<typeof jpegOptions>
  ): this {
    this.modifiers.set('jpegOptions', jpegOptions(...options));
    return this;
  }

  /**
   * Limits the file size to the specified
   * number of bytes
   *
   * Note: only applicable to jpg, webp, heic and tiff
   */
  public maxBytes(this: this, ...options: Parameters<typeof maxBytes>): this {
    this.modifiers.set('maxBytes', maxBytes(...options));
    return this;
  }

  /**
   * Defines the minimum height of the resulting image.
   */
  public minHeight(this: this, ...options: Parameters<typeof minHeight>): this {
    this.modifiers.set('maxBytes', minHeight(...options));
    return this;
  }

  /**
   * Defines the minimum width of the resulting image.
   */
  public minWidth(this: this, ...options: Parameters<typeof minWidth>): this {
    this.modifiers.set('maxBytes', minWidth(...options));
    return this;
  }

  /**
   * Applies the specified padding to the image
   */
  public pad(this: this, ...options: Parameters<typeof pad>): this {
    this.modifiers.set('pad', pad(...options));
    return this;
  }

  /**
   * When source image supports pagination (PDF, TIFF)
   * or animation (GIF, WebP), this option allows
   * specifying the page to use.
   *
   * Pages numeration starts from zero.
   */
  public page(this: this, ...options: Parameters<typeof page>): this {
    this.modifiers.set('page', page(...options));
    return this;
  }

  /**
   * Applies a pixelate filter to the resulting image.
   */
  public pixelate(this: this, ...options: Parameters<typeof pixelate>): this {
    this.modifiers.set('pixelate', pixelate(...options));
    return this;
  }

  /**
   * Allows redefining PNG saving options
   */
  public pngOptions(
    this: this,
    ...options: Parameters<typeof pngOptions>
  ): this {
    this.modifiers.set('pngOptions', pngOptions(...options));
    return this;
  }

  /**
   * Sets one or many presets to be used by the imgproxy
   */
  public preset(this: this, ...options: Parameters<typeof preset>): this {
    this.modifiers.set('preset', preset(...options));
    return this;
  }

  /**
   * Defines the algorithm that imgproxy will use for resizing.
   */
  public resizingAlgorithm(
    this: this,
    ...options: Parameters<typeof resizingAlgorithm>
  ): this {
    this.modifiers.set('resizingAlgorithm', resizingAlgorithm(...options));
    return this;
  }

  /**
   * Redefines the quality of the resulting image
   */
  public quality(this: this, ...options: Parameters<typeof quality>): this {
    this.modifiers.set('quality', quality(...options));
    return this;
  }

  /**
   * Resizes the image
   */
  public resize(this: this, ...options: Parameters<typeof resize>): this {
    this.modifiers.set('resize', resize(...options));
    return this;
  }

  /**
   * Rotates the image by the specified angle
   */
  public rotate(this: this, ...options: Parameters<typeof rotate>): this {
    this.modifiers.set('rotate', rotate(...options));
    return this;
  }

  /**
   * When set, imgproxy will adjust saturation of the resulting image.
   */
  public saturation(
    this: this,
    ...options: Parameters<typeof saturation>
  ): this {
    this.modifiers.set('saturation', saturation(...options));
    return this;
  }

  /**
   * Applies a sharpen filter to the image
   */
  public sharpen(this: this, ...options: Parameters<typeof sharpen>): this {
    this.modifiers.set('sharpen', sharpen(...options));
    return this;
  }

  /**
   * Skips the processing for the specified extensions
   */
  public skipProcessing(
    this: this,
    ...options: Parameters<typeof skipProcessing>
  ): this {
    this.modifiers.set('skipProcessing', skipProcessing(...options));
    return this;
  }

  /**
   * Strips the color profile from the image
   */
  public stripColorProfile(this: this): this {
    this.modifiers.set('stripColorProfile', stripColorProfile());
    return this;
  }

  /**
   * Strips the metadata from the image
   */
  public stripMetadata(this: this): this {
    this.modifiers.set('stripMetadata', stripMetadata());
    return this;
  }

  /**
   * Applies the specified CSS styles to an SVG source image
   */
  public style(this: this, ...options: Parameters<typeof style>): this {
    this.modifiers.set('style', style(...options));
    return this;
  }

  /**
   * Trims the image background
   */
  public trim(this: this, ...options: Parameters<typeof trim>): this {
    this.modifiers.set('trim', trim(...options));
    return this;
  }

  /**
   * Allows redefining unsharpening options.
   */
  public unsharpen(this: this, ...options: Parameters<typeof unsharpen>): this {
    this.modifiers.set('unsharpen', unsharpen(...options));
    return this;
  }

  /**
   * Redefines the second used for the thumbnail
   */
  public videoThumbnailSecond(
    this: this,
    ...options: Parameters<typeof videoThumbnailSecond>
  ): this {
    this.modifiers.set(
      'videoThumbnailSecond',
      videoThumbnailSecond(...options),
    );
    return this;
  }

  /**
   * Applies a gaussian blur filter to the image
   */
  public watermark(this: this, ...options: Parameters<typeof watermark>): this {
    this.modifiers.set('watermark', watermark(...options));
    return this;
  }

  /**
   * Sets the watermark size
   */
  public watermarkSize(
    this: this,
    ...options: Parameters<typeof watermarkSize>
  ): this {
    this.modifiers.set('watermarkSize', watermarkSize(...options));
    return this;
  }

  /**
   * Sets the watermark Text
   */
  public watermarkText(
    this: this,
    ...options: Parameters<typeof watermarkText>
  ): this {
    this.modifiers.set('watermarkText', watermarkText(...options));
    return this;
  }

  /**
   * Sets the watermark URL
   */
  public watermarkUrl(
    this: this,
    ...options: Parameters<typeof watermarkUrl>
  ): this {
    this.modifiers.set('watermarkUrl', watermarkUrl(...options));
    return this;
  }

  /**
   * Multiplies the image according to the specified factors.
   * The values must be greater than 0.
   */
  public zoom(this: this, ...options: Parameters<typeof zoom>): this {
    this.modifiers.set('zoom', zoom(...options));
    return this;
  }
}

const pb = (): ParamBuilder => new ParamBuilder();

export default pb;
export { ParamBuilder };
