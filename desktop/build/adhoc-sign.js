// electron-builder afterPack hook: ad-hoc sign the macOS app.
// Apple Silicon refuses to run unsigned code at all, and we have no Developer ID certificate,
// so sign with "-" (ad-hoc). Users still see Gatekeeper's "unverified developer" prompt once.
const { execFileSync } = require('node:child_process');
const path = require('node:path');

exports.default = async function adhocSign(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
};
