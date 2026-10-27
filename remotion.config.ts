import { Config } from "@remotion/cli/config";

// High-quality defaults for social delivery.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // auto
