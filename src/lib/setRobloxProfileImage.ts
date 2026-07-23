import { getRobloxAvatarUrl } from "@/components/RobloxAvatar";

export async function setRobloxProfileImage(
  username: string,
  setImage: (file: File) => Promise<unknown>,
  bgColor?: string | null
): Promise<void> {
  const svgUrl = getRobloxAvatarUrl(username, bgColor);
  const svgText = await fetch(svgUrl).then(r => r.text());
  const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
  const objectUrl = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error("toBlob failed")); return; }
        setImage(new File([blob], "avatar.png", { type: "image/png" }))
          .then(() => resolve())
          .catch(reject);
      }, "image/png");
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}
