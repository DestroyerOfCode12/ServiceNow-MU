import { ImageResponse } from "next/og";
import { ogImageNode, OG_IMAGE_SIZE } from "@/lib/seo/og-image-node";

export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "CSA Prep Platform — Independent ServiceNow CSA Exam Preparation";

export default function Image() {
  return new ImageResponse(ogImageNode(), size);
}
